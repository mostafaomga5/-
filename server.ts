import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, requireRole, AuthRequest } from './src/middleware/auth.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';
import {
  SESSION_COOKIE_NAME,
  parseCookies,
  formatSessionCookie,
  clearSessionCookie,
  checkRateLimit,
  resolveSmartAssistantIntent,
} from './src/lib/authService.ts';
import {
  getOrCreateUser,
  sanitizeUserRow,
  registerUserWithPassword,
  authenticateUserByPassword,
  createServerSession,
  getSessionWithUser,
  deleteServerSession,
  updateUserProfileById,
  createPasswordResetRequest,
  redeemPasswordResetToken,
  getUserRfqs,
  insertUserRfq,
  getUserGoogleForms,
  insertUserGoogleForm,
  deleteUserGoogleForm,
  listMarketplaceListings,
  createMarketplaceListingRecord,
  reportMarketplaceListing,
  createSupplierRfqRecord,
  listUserSupplierRfqs,
  getUserAcademyProgress,
  upsertUserAcademyProgress,
  getRoleDashboardSummary,
  listUserSavedItems,
  toggleUserSavedItem,
  removeUserSavedItem,
  getUserFollowsData,
  toggleUserFollow,
  getLikesSummary,
  toggleItemLike,
  listUserConversations,
  startOrGetConversation,
  getConversationMessages,
  sendConversationMessage,
  ensureExtendedPlatformTables,
  submitVerificationRequest,
  getUserVerificationRequests,
  submitJobApplicationRecord,
  listJobApplicationsForUserOrEmployer,
  updateJobApplicationStatusRecord,
  createPlatformReportRecord,
  getAdminDashboardOverview,
  reviewVerificationRequestByAdmin,
  resolvePlatformReportByAdmin,
  createSystemAnnouncementByAdmin,
  listSystemAnnouncements,
  createUserNotificationRecord,
  listUserNotificationsRecords,
  markUserNotificationReadRecord,
  markAllUserNotificationsReadRecord,
  listItemCommentsRecords,
  createItemCommentRecord,
  listUserBlocksRecords,
  toggleUserBlockRecord,
  getPublicUserProfileRecord,
  searchPlatformDatabaseForAssistant,
} from './src/db/users.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // =========================================================================
  // REAL AUTHENTICATION & SERVER SESSION ENDPOINTS (Cloud SQL PostgreSQL)
  // =========================================================================

  const isRequestSecure = (req: express.Request): boolean => {
    return Boolean(req.secure || req.headers['x-forwarded-proto'] === 'https');
  };

  app.get('/api/auth/session', async (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE_NAME];
      if (!sid) {
        return res.json({ authenticated: false, user: null });
      }
      const sessionData = await getSessionWithUser(sid);
      if (!sessionData) {
        res.setHeader('Set-Cookie', clearSessionCookie(isRequestSecure(req)));
        return res.json({ authenticated: false, user: null });
      }
      return res.json({
        authenticated: true,
        user: sessionData.user,
        csrfToken: sessionData.session.csrfToken,
      });
    } catch (error) {
      console.error('Error in GET /api/auth/session:', error);
      return res.json({ authenticated: false, user: null });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local');
      const rl = checkRateLimit(`register:${ip}`, 15, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({
          error: `تم تجاوز الحد المسموح للمحاولات. يرجى الانتظار ${rl.retryAfterSeconds} ثانية.`,
        });
      }

      const {
        fullName,
        displayName,
        name,
        email,
        password,
        confirmPassword,
        country,
        city,
        accountType,
        role,
        phone,
        specialty,
        companyName,
        bio,
        experienceYears,
        skills,
        avatarUrl,
        jobTitle,
      } = req.body || {};

      const resolvedName = String(fullName || displayName || name || '').trim();
      if (!resolvedName || resolvedName.length < 2) {
        return res.status(400).json({ error: 'يرجى إدخال الاسم الكامل بشكل صحيح.' });
      }
      if (!email || !String(email).includes('@')) {
        return res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صحيح.' });
      }
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف.' });
      }
      if (confirmPassword !== undefined && password !== confirmPassword) {
        return res.status(400).json({ error: 'تأكيد كلمة المرور غير مطابق.' });
      }

      const roleMapping: Record<string, string> = {
        technician: 'technician',
        engineer: 'engineer',
        factory: 'factory',
        factory_owner: 'factory',
        manufacturer: 'factory',
        supplier: 'supplier',
        trader: 'trader',
        worker: 'technician',
        visitor: 'visitor',
        student: 'visitor',
      };
      const rawRole = String(accountType || role || 'engineer').toLowerCase();
      const normalizedRole = roleMapping[rawRole] || 'engineer';

      const user = await registerUserWithPassword({
        fullName: resolvedName,
        email: String(email),
        password: String(password),
        country: String(country || 'مصر'),
        city: String(city || 'العاشر من رمضان'),
        accountType: normalizedRole,
        phone: phone ? String(phone) : '',
        specialty: specialty ? String(specialty) : '',
        companyName: companyName ? String(companyName) : '',
        bio: bio ? String(bio) : '',
        experienceYears: Number(experienceYears || 0),
        skills: Array.isArray(skills) ? skills.map(String) : [],
        avatarUrl: avatarUrl ? String(avatarUrl) : '',
        jobTitle: jobTitle ? String(jobTitle) : '',
      });

      const session = await createServerSession(user.id, true);
      res.setHeader(
        'Set-Cookie',
        formatSessionCookie(session.rawToken, session.maxAgeSeconds, isRequestSecure(req))
      );

      return res.status(201).json({
        authenticated: true,
        user,
        csrfToken: session.csrfToken,
      });
    } catch (error: any) {
      if (error?.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({
          error: 'البريد الإلكتروني مسجل بالفعل في المنصة. يمكنك تسجيل الدخول مباشرة.',
        });
      }
      console.error('Error in POST /api/auth/register:', error);
      return res.status(500).json({ error: 'تعذر إنشاء الحساب حالياً. يرجى المحاولة مرة أخرى.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local');
      const rl = checkRateLimit(`login:${ip}`, 15, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({
          error: `تم تجاوز عدد محاولات تسجيل الدخول. يرجى المحاولة بعد ${rl.retryAfterSeconds} ثانية.`,
        });
      }

      const { emailOrPhone, email, password, rememberMe } = req.body || {};
      const identifier = String(emailOrPhone || email || '').trim();

      if (!identifier || !password) {
        return res.status(400).json({
          error: 'يرجى إدخال البريد الإلكتروني (أو رقم الهاتف) وكلمة المرور.',
        });
      }

      const user = await authenticateUserByPassword(identifier, String(password));
      if (!user) {
        return res.status(401).json({
          error: 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.',
        });
      }

      const session = await createServerSession(user.id, Boolean(rememberMe));
      res.setHeader(
        'Set-Cookie',
        formatSessionCookie(session.rawToken, session.maxAgeSeconds, isRequestSecure(req))
      );

      return res.json({
        authenticated: true,
        user,
        csrfToken: session.csrfToken,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/login:', error);
      return res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول.' });
    }
  });

  app.post('/api/auth/google', async (req, res) => {
    try {
      const { idToken, accountType } = req.body || {};
      if (!idToken) {
        return res.status(400).json({ error: 'رمز مصادقة Google مفقود.' });
      }
      const decoded = await adminAuth.verifyIdToken(String(idToken));
      const userRow = await getOrCreateUser(
        decoded.uid,
        decoded.email || 'user@plastico.eg',
        decoded.name || 'مستخدم بلاستيكو',
        accountType || 'engineer'
      );
      const user = sanitizeUserRow(userRow);
      const session = await createServerSession(user.id, true);
      res.setHeader(
        'Set-Cookie',
        formatSessionCookie(session.rawToken, session.maxAgeSeconds, isRequestSecure(req))
      );

      return res.json({
        authenticated: true,
        user,
        csrfToken: session.csrfToken,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/google:', error);
      return res.status(401).json({ error: 'تعذر التحقق من حساب Google.' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE_NAME];
      if (sid) {
        await deleteServerSession(sid);
      }
      res.setHeader('Set-Cookie', clearSessionCookie(isRequestSecure(req)));
      return res.json({ loggedOut: true });
    } catch (error) {
      console.error('Error in POST /api/auth/logout:', error);
      res.setHeader('Set-Cookie', clearSessionCookie(isRequestSecure(req)));
      return res.json({ loggedOut: true });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'local');
      const rl = checkRateLimit(`forgot:${ip}`, 8, 60_000);
      if (!rl.allowed) {
        return res.status(429).json({
          error: `يرجى الانتظار ${rl.retryAfterSeconds} ثانية قبل طلب رمز جديد.`,
        });
      }

      const { email } = req.body || {};
      if (!email || !String(email).includes('@')) {
        return res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صحيح.' });
      }

      const result = await createPasswordResetRequest(String(email));
      return res.json({
        message:
          'إذا كان هذا البريد الإلكتروني مسجلاً لدينا، فقد تم إنشاء رمز استعادة كلمة المرور بصلاحية 30 دقيقة.',
        previewResetToken: result.resetTokenForVerificationOnly || null,
      });
    } catch (error) {
      console.error('Error in POST /api/auth/forgot-password:', error);
      return res.status(500).json({ error: 'تعذر إتمام الطلب حالياً.' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword || String(newPassword).length < 6) {
        return res.status(400).json({
          error: 'يرجى إدخال رمز الاستعادة وكلمة مرور جديدة لا تقل عن 6 أحرف.',
        });
      }
      const ok = await redeemPasswordResetToken(String(token), String(newPassword));
      if (!ok) {
        return res.status(400).json({
          error: 'رمز استعادة كلمة المرور غير صالح أو منتهي الصلاحية.',
        });
      }
      return res.json({
        reset: true,
        message: 'تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
      });
    } catch (error) {
      console.error('Error in POST /api/auth/reset-password:', error);
      return res.status(500).json({ error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور.' });
    }
  });

  // =========================================================================
  // USER PROFILE & ROLE-AWARE DASHBOARD ENDPOINTS
  // =========================================================================

  app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.sessionUser) {
        return res.json({ user: req.sessionUser, csrfToken: req.csrfToken });
      }
      const uid = req.user!.uid;
      const email = req.user!.email || 'user@plastico.eg';
      const name = req.user!.name || '';
      const userRecord = await getOrCreateUser(uid, email, name);
      return res.json({ user: sanitizeUserRow(userRecord) });
    } catch (error: any) {
      console.error('Failed in GET /api/me:', error);
      return res.status(500).json({ error: 'Failed to sync user profile' });
    }
  });

  app.put('/api/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const sessionUser = req.sessionUser!;
      const updated = await updateUserProfileById(sessionUser.id, req.body || {});
      return res.json({ user: updated });
    } catch (error) {
      console.error('Failed in PUT /api/profile:', error);
      return res.status(500).json({ error: 'تعذر تحديث الملف الشخصي.' });
    }
  });

  app.get('/api/dashboard/summary', requireAuth, async (req: AuthRequest, res) => {
    try {
      const summary = await getRoleDashboardSummary(req.sessionUser!);
      return res.json(summary);
    } catch (error) {
      console.error('Failed in GET /api/dashboard/summary:', error);
      return res.status(500).json({ error: 'Failed to load dashboard summary' });
    }
  });

  // =========================================================================
  // DATABASE-BACKED FAVORITES (SAVED ITEMS) ENDPOINTS
  // =========================================================================

  app.get('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    try {
      const items = await listUserSavedItems(req.sessionUser!.id);
      return res.json({ items });
    } catch (error) {
      console.error('Error in GET /api/favorites:', error);
      return res.status(500).json({ error: 'تعذر تحميل قائمة المفضلة.' });
    }
  });

  app.post('/api/favorites/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { itemType, itemId, titleAr, route } = req.body || {};
      if (!itemId) {
        return res.status(400).json({ error: 'معرف العنصر مطلوب.' });
      }
      const result = await toggleUserSavedItem(req.sessionUser!.id, {
        itemType: String(itemType || 'market'),
        itemId: String(itemId),
        titleAr: String(titleAr || 'عنصر محفوظ'),
        route: String(route || '/app/market'),
      });
      return res.json(result);
    } catch (error) {
      console.error('Error in POST /api/favorites/toggle:', error);
      return res.status(500).json({ error: 'تعذر تحديث المفضلة.' });
    }
  });

  app.delete('/api/favorites/:itemId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const items = await removeUserSavedItem(
        req.sessionUser!.id,
        String(req.params.itemId)
      );
      return res.json({ items });
    } catch (error) {
      console.error('Error in DELETE /api/favorites/:itemId:', error);
      return res.status(500).json({ error: 'تعذر حذف العنصر من المفضلة.' });
    }
  });

  // =========================================================================
  // DATABASE-BACKED FOLLOW / UNFOLLOW ENDPOINTS
  // =========================================================================

  app.get('/api/follows', async (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE_NAME];
      const sessionData = sid ? await getSessionWithUser(sid) : null;
      const data = await getUserFollowsData(sessionData?.user?.id || null);
      return res.json(data);
    } catch (error) {
      console.error('Error in GET /api/follows:', error);
      return res.status(500).json({ error: 'تعذر تحميل بيانات المتابعة.' });
    }
  });

  app.post('/api/follows/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const result = await toggleUserFollow(user.id, user.uid, req.body || {});
      return res.json(result);
    } catch (error: any) {
      console.error('Error in POST /api/follows/toggle:', error);
      return res.status(400).json({ error: error.message || 'تعذر تحديث المتابعة.' });
    }
  });

  // =========================================================================
  // DATABASE-BACKED LIKES / REACTIONS ENDPOINTS
  // =========================================================================

  app.get('/api/likes', async (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE_NAME];
      const sessionData = sid ? await getSessionWithUser(sid) : null;
      const summary = await getLikesSummary(sessionData?.user?.id || null);
      return res.json(summary);
    } catch (error) {
      console.error('Error in GET /api/likes:', error);
      return res.status(500).json({ error: 'تعذر تحميل التفاعلات.' });
    }
  });

  app.post('/api/likes/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const result = await toggleItemLike(user.id, {
        itemType: String(req.body?.itemType || 'post'),
        itemId: String(req.body?.itemId || ''),
      });
      return res.json(result);
    } catch (error: any) {
      console.error('Error in POST /api/likes/toggle:', error);
      return res.status(400).json({ error: error.message || 'تعذر تسجيل الإعجاب.' });
    }
  });

  // =========================================================================
  // DATABASE-BACKED IN-APP CHAT ENDPOINTS
  // =========================================================================

  app.get('/api/conversations', requireAuth, async (req: AuthRequest, res) => {
    try {
      const list = await listUserConversations(req.sessionUser!.id);
      return res.json({ conversations: list });
    } catch (error) {
      console.error('Error in GET /api/conversations:', error);
      return res.status(500).json({ error: 'تعذر تحميل المحادثات.' });
    }
  });

  app.post('/api/conversations/start', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const result = await startOrGetConversation(
        user.id,
        user.companyName || user.name || 'مستخدم بلاستيكو',
        req.body || {}
      );
      return res.json(result);
    } catch (error: any) {
      console.error('Error in POST /api/conversations/start:', error);
      return res.status(400).json({ error: error.message || 'تعذر بدء المحادثة.' });
    }
  });

  app.get(
    '/api/conversations/:id/messages',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const convId = Number(req.params.id);
        const messages = await getConversationMessages(req.sessionUser!.id, convId);
        return res.json({ messages });
      } catch (error: any) {
        const status = error.statusCode || 400;
        return res.status(status).json({ error: error.message || 'تعذر تحميل الرسائل.' });
      }
    }
  );

  app.post(
    '/api/conversations/:id/messages',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const user = req.sessionUser!;
        const convId = Number(req.params.id);
        const message = await sendConversationMessage(
          user.id,
          user.companyName || user.name || 'مستخدم بلاستيكو',
          convId,
          req.body || {}
        );
        return res.status(201).json({ message });
      } catch (error: any) {
        const status = error.statusCode || 400;
        return res.status(status).json({ error: error.message || 'تعذر إرسال الرسالة.' });
      }
    }
  );

  // Role-restricted endpoint for factory/supplier/trader listing management
  app.post(
    '/api/marketplace',
    requireAuth,
    requireRole(['factory', 'supplier', 'trader', 'engineer', 'admin']),
    async (req: AuthRequest, res) => {
      try {
        const user = req.sessionUser!;
        const {
          titleAr,
          titleEn,
          category,
          isUsed,
          conditionCode,
          manufacturer,
          model,
          year,
          price,
          currency,
          city,
          country,
          descriptionAr,
          specs,
          image,
          images,
          sellerPhone,
        } = req.body || {};

        if (!titleAr || !category) {
          return res.status(400).json({ error: 'يرجى إدخال عنوان العرض والقسم.' });
        }

        const created = await createMarketplaceListingRecord(user.id, {
          titleAr: String(titleAr),
          titleEn: titleEn ? String(titleEn) : String(titleAr),
          category: String(category),
          isUsed: Boolean(isUsed),
          conditionCode: String(conditionCode || (isUsed ? 'used_excellent' : 'new')),
          manufacturer: String(manufacturer || ''),
          model: String(model || ''),
          year: Number(year || 2024),
          price: Number(price || 0),
          currency: String(currency || 'EGP'),
          city: String(city || user.city || 'العاشر من رمضان'),
          country: String(country || user.country || 'مصر'),
          descriptionAr: String(descriptionAr || ''),
          specs: specs && typeof specs === 'object' ? specs : {},
          image: image ? String(image) : undefined,
          images: Array.isArray(images) ? images.map(String) : undefined,
          sellerNameAr: user.companyName || user.name || 'مورد معتمد',
          sellerPhone: String(sellerPhone || user.phone || '+20 100 245 8890'),
        });

        return res.status(201).json({ listing: created });
      } catch (error) {
        console.error('Error in POST /api/marketplace:', error);
        return res.status(500).json({ error: 'تعذر نشر العرض في السوق.' });
      }
    }
  );

  app.get('/api/marketplace', async (_req, res) => {
    try {
      const listings = await listMarketplaceListings();
      return res.json({ listings });
    } catch (error) {
      console.error('Error in GET /api/marketplace:', error);
      return res.status(500).json({ error: 'Failed to load marketplace listings' });
    }
  });

  app.post('/api/marketplace/:id/report', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      if (id > 0) {
        await reportMarketplaceListing(id);
      }
      return res.json({ reported: true });
    } catch (error) {
      console.error('Error in POST /api/marketplace/:id/report:', error);
      return res.status(500).json({ error: 'Failed to report listing' });
    }
  });

  // =========================================================================
  // SUPPLIERS RFQ & MANUFACTURING RFQ ENDPOINTS
  // =========================================================================

  app.post('/api/suppliers/rfq', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const {
        supplierId,
        supplierNameAr,
        category,
        productName,
        material,
        quantity,
        unit,
        city,
        details,
        contactName,
        contactPhone,
      } = req.body || {};

      if (!productName || !contactName || !contactPhone) {
        return res.status(400).json({
          error: 'يرجى استكمال اسم الخامة/المعدة وبيانات التواصل.',
        });
      }

      const created = await createSupplierRfqRecord(user.id, {
        supplierId: String(supplierId || 'general'),
        supplierNameAr: String(supplierNameAr || 'جميع الموردين المعتمدين'),
        category: String(category || 'raw_materials'),
        productName: String(productName),
        material: String(material || ''),
        quantity: Number(quantity || 1),
        unit: String(unit || 'طن'),
        city: String(city || user.city || 'العاشر من رمضان'),
        details: String(details || ''),
        contactName: String(contactName),
        contactPhone: String(contactPhone),
      });

      return res.status(201).json({ rfq: created });
    } catch (error) {
      console.error('Error in POST /api/suppliers/rfq:', error);
      return res.status(500).json({ error: 'تعذر إرسال طلب عرض السعر.' });
    }
  });

  app.get('/api/suppliers/rfq', requireAuth, async (req: AuthRequest, res) => {
    try {
      const rfqs = await listUserSupplierRfqs(req.sessionUser!.id);
      return res.json({ rfqs });
    } catch (error) {
      console.error('Error in GET /api/suppliers/rfq:', error);
      return res.status(500).json({ error: 'Failed to load supplier RFQs' });
    }
  });

  app.get('/api/rfqs', requireAuth, async (req: AuthRequest, res) => {
    try {
      const rfqs = await getUserRfqs(req.user!.uid);
      res.json({ rfqs });
    } catch (error: any) {
      console.error('Failed in GET /api/rfqs:', error);
      res.status(500).json({ error: error.message || 'Failed to load RFQs' });
    }
  });

  app.post('/api/rfqs', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'user@plastico.eg';
      const { referenceCode, titleAr, processId, material, quantity, city, status } = req.body;
      const created = await insertUserRfq(uid, email, {
        referenceCode: String(referenceCode || 'MFG-2026').slice(0, 40),
        titleAr: String(titleAr || '').slice(0, 160),
        processId: String(processId || 'injection').slice(0, 30),
        material: String(material || 'PP').slice(0, 60),
        quantity: Math.max(1, Number(quantity) || 1000),
        city: String(city || 'العاشر من رمضان').slice(0, 80),
        status: String(status || 'receiving_offers').slice(0, 30),
      });
      res.status(201).json({ rfq: created });
    } catch (error: any) {
      console.error('Failed in POST /api/rfqs:', error);
      res.status(500).json({ error: error.message || 'Failed to save RFQ' });
    }
  });

  // =========================================================================
  // ACADEMY PROGRESS & REAL CERTIFICATE ISSUANCE
  // =========================================================================

  app.get('/api/academy/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      const progress = await getUserAcademyProgress(req.sessionUser!.id);
      return res.json({ progress });
    } catch (error) {
      console.error('Error in GET /api/academy/progress:', error);
      return res.status(500).json({ error: 'Failed to load academy progress' });
    }
  });

  app.post('/api/academy/progress', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const { courseId, completedLessons, quizScore, requiredLessonsCount } = req.body || {};
      if (!courseId) {
        return res.status(400).json({ error: 'معرف الكورس مطلوب.' });
      }
      const record = await upsertUserAcademyProgress(
        user.id,
        String(courseId),
        Array.isArray(completedLessons) ? completedLessons.map(String) : [],
        Number(quizScore || 0),
        Math.max(1, Number(requiredLessonsCount || 4))
      );
      return res.json({ progress: record });
    } catch (error) {
      console.error('Error in POST /api/academy/progress:', error);
      return res.status(500).json({ error: 'تعذر حفظ تقدم الدورة التدريبية.' });
    }
  });

  // =========================================================================
  // GOOGLE FORMS LINKS
  // =========================================================================

  app.get('/api/forms-links', requireAuth, async (req: AuthRequest, res) => {
    try {
      const forms = await getUserGoogleForms(req.user!.uid);
      res.json({ forms });
    } catch (error: any) {
      console.error('Failed in GET /api/forms-links:', error);
      res.status(500).json({ error: error.message || 'Failed to load Google Forms links' });
    }
  });

  app.post('/api/forms-links', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || 'user@plastico.eg';
      const { formId, title, responderUri, purposeAr } = req.body;
      const created = await insertUserGoogleForm(uid, email, {
        formId: String(formId || '').slice(0, 128),
        title: String(title || 'نموذج بلاستيكو الصناعي').slice(0, 160),
        responderUri: String(responderUri || '').slice(0, 300),
        purposeAr: String(purposeAr || 'استبيان طلب تصنيع وفحص جودة').slice(0, 160),
      });
      res.status(201).json({ form: created });
    } catch (error: any) {
      console.error('Failed in POST /api/forms-links:', error);
      res.status(500).json({ error: error.message || 'Failed to save Google Form link' });
    }
  });

  app.delete('/api/forms-links/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      await deleteUserGoogleForm(req.user!.uid, id);
      res.json({ deleted: true });
    } catch (error: any) {
      console.error('Failed in DELETE /api/forms-links/:id:', error);
      res.status(500).json({ error: error.message || 'Failed to delete Google Form link' });
    }
  });

  // =========================================================================
  // ACCOUNT VERIFICATION, JOB APPLICATIONS, REPORTS & ADMIN DASHBOARD API
  // =========================================================================

  void ensureExtendedPlatformTables();

  app.get('/api/verification/my', requireAuth, async (req: AuthRequest, res) => {
    try {
      const requests = await getUserVerificationRequests(req.sessionUser!.id);
      return res.json({
        verified: Boolean(req.sessionUser!.verified),
        requests,
      });
    } catch (error) {
      console.error('Error in GET /api/verification/my:', error);
      return res.status(500).json({ error: 'تعذر تحميل حالة توثيق الحساب.' });
    }
  });

  app.post('/api/verification/request', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const { companyName, documentType, documentUrl, notes } = req.body || {};
      if (!companyName || !String(companyName).trim()) {
        return res.status(400).json({ error: 'يرجى إدخال اسم المصنع أو الشركة أو الجهة.' });
      }
      const created = await submitVerificationRequest(user.id, {
        companyName: String(companyName),
        role: user.accountType || 'factory',
        documentType: String(documentType || 'سجل تجاري وبطاقة ضريبية'),
        documentUrl: documentUrl ? String(documentUrl) : '',
        notes: notes ? String(notes) : '',
      });
      return res.status(201).json({ request: created });
    } catch (error) {
      console.error('Error in POST /api/verification/request:', error);
      return res.status(500).json({ error: 'تعذر إرسال طلب التوثيق حالياً.' });
    }
  });

  app.get('/api/jobs/applications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await listJobApplicationsForUserOrEmployer(req.sessionUser!);
      return res.json(data);
    } catch (error) {
      console.error('Error in GET /api/jobs/applications:', error);
      return res.status(500).json({ error: 'تعذر تحميل طلبات التوظيف.' });
    }
  });

  app.post('/api/jobs/apply', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const { jobId, jobTitleAr, companyNameAr, applicantPhone, cvFileName, cvUrl, coverNote } =
        req.body || {};
      if (!jobId || !jobTitleAr) {
        return res.status(400).json({ error: 'بيانات الوظيفة مطلوبة للتقديم.' });
      }
      const created = await submitJobApplicationRecord(user, {
        jobId: String(jobId),
        jobTitleAr: String(jobTitleAr),
        companyNameAr: String(companyNameAr || 'مصنع بلاستيكو'),
        applicantPhone: applicantPhone ? String(applicantPhone) : user.phone,
        cvFileName: cvFileName ? String(cvFileName) : '',
        cvUrl: cvUrl ? String(cvUrl) : '',
        coverNote: coverNote ? String(coverNote) : '',
      });
      return res.status(201).json({ application: created });
    } catch (error) {
      console.error('Error in POST /api/jobs/apply:', error);
      return res.status(500).json({ error: 'تعذر إرسال طلب التوظيف.' });
    }
  });

  app.patch('/api/jobs/applications/:id/status', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body || {};
      if (!id || !status) {
        return res.status(400).json({ error: 'معرف الطلب والحالة الجديدة مطلوبان.' });
      }
      const updated = await updateJobApplicationStatusRecord(id, String(status));
      return res.json({ application: updated });
    } catch (error) {
      console.error('Error in PATCH /api/jobs/applications/:id/status:', error);
      return res.status(500).json({ error: 'تعذر تحديث حالة طلب التوظيف.' });
    }
  });

  app.post('/api/reports', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const { targetType, targetId, targetTitleAr, reason } = req.body || {};
      if (!targetId || !reason) {
        return res.status(400).json({ error: 'يرجى تحديد العنصر وسبب البلاغ.' });
      }
      const created = await createPlatformReportRecord(user.id, {
        targetType: String(targetType || 'listing'),
        targetId: String(targetId),
        targetTitleAr: String(targetTitleAr || ''),
        reason: String(reason),
      });
      return res.status(201).json({ report: created });
    } catch (error) {
      console.error('Error in POST /api/reports:', error);
      return res.status(500).json({ error: 'تعذر إرسال البلاغ.' });
    }
  });

  app.get('/api/announcements', async (_req, res) => {
    try {
      const items = await listSystemAnnouncements();
      return res.json({ announcements: items });
    } catch (error) {
      console.error('Error in GET /api/announcements:', error);
      return res.status(500).json({ error: 'تعذر تحميل التنبيهات العامة.' });
    }
  });

  app.get('/api/admin/overview', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const overview = await getAdminDashboardOverview();
      return res.json(overview);
    } catch (error) {
      console.error('Error in GET /api/admin/overview:', error);
      return res.status(500).json({ error: 'تعذر تحميل بيانات لوحة تحكم الإدارة.' });
    }
  });

  app.post('/api/admin/verification/:id/review', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { status, rejectionReason } = req.body || {};
      if (!id || (status !== 'verified' && status !== 'rejected')) {
        return res.status(400).json({ error: 'حالة المراجعة غير صالحة.' });
      }
      const updated = await reviewVerificationRequestByAdmin(
        id,
        status,
        String(rejectionReason || ''),
        req.sessionUser!.id
      );
      return res.json({ request: updated });
    } catch (error) {
      console.error('Error in POST /api/admin/verification/:id/review:', error);
      return res.status(500).json({ error: 'تعذر تحديث حالة طلب التوثيق.' });
    }
  });

  app.post('/api/admin/reports/:id/resolve', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body || {};
      const updated = await resolvePlatformReportByAdmin(
        id,
        status === 'dismissed' ? 'dismissed' : 'resolved'
      );
      return res.json({ report: updated });
    } catch (error) {
      console.error('Error in POST /api/admin/reports/:id/resolve:', error);
      return res.status(500).json({ error: 'تعذر تحديث حالة البلاغ.' });
    }
  });

  app.post('/api/admin/announcements', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { titleAr, bodyAr, targetRole } = req.body || {};
      if (!titleAr || !bodyAr) {
        return res.status(400).json({ error: 'يرجى كتابة عنوان ونص الإشعار العام.' });
      }
      const created = await createSystemAnnouncementByAdmin(
        req.sessionUser!.id,
        String(titleAr),
        String(bodyAr),
        String(targetRole || 'all')
      );
      return res.status(201).json({ announcement: created });
    } catch (error) {
      console.error('Error in POST /api/admin/announcements:', error);
      return res.status(500).json({ error: 'تعذر إرسال الإشعار العام.' });
    }
  });

  // =========================================================================
  // PUBLIC / MEMBER PROFILES, COMMENTS & REPLIES, NOTIFICATIONS & BLOCKS API
  // =========================================================================

  app.get('/api/users/public/:identifier', async (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE_NAME];
      const sessionData = sid ? await getSessionWithUser(sid) : null;
      const profile = await getPublicUserProfileRecord(
        String(req.params.identifier || ''),
        sessionData?.user?.id || null
      );
      return res.json({ profile });
    } catch (error) {
      console.error('Error in GET /api/users/public/:identifier:', error);
      return res.status(500).json({ error: 'تعذر تحميل الملف الشخصي.' });
    }
  });

  app.get('/api/comments', async (req, res) => {
    try {
      const itemType = req.query.itemType ? String(req.query.itemType) : undefined;
      const itemId = req.query.itemId ? String(req.query.itemId) : undefined;
      const comments = await listItemCommentsRecords(itemType, itemId);
      return res.json({ comments });
    } catch (error) {
      console.error('Error in GET /api/comments:', error);
      return res.status(500).json({ error: 'تعذر تحميل التعليقات.' });
    }
  });

  app.post('/api/comments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = req.sessionUser!;
      const { itemType, itemId, parentId, content } = req.body || {};
      const result = await createItemCommentRecord(user, {
        itemType: String(itemType || 'post'),
        itemId: String(itemId || ''),
        parentId: parentId ? Number(parentId) : null,
        content: String(content || ''),
      });
      return res.status(201).json(result);
    } catch (error: any) {
      console.error('Error in POST /api/comments:', error);
      return res.status(400).json({ error: error.message || 'تعذر نشر التعليق.' });
    }
  });

  app.get('/api/notifications', requireAuth, async (req: AuthRequest, res) => {
    try {
      const list = await listUserNotificationsRecords(req.sessionUser!.id);
      return res.json({ notifications: list });
    } catch (error) {
      console.error('Error in GET /api/notifications:', error);
      return res.status(500).json({ error: 'تعذر تحميل الإشعارات.' });
    }
  });

  app.post('/api/notifications/read', requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = Number(req.body?.id);
      const list = await markUserNotificationReadRecord(req.sessionUser!.id, id);
      return res.json({ notifications: list });
    } catch (error) {
      console.error('Error in POST /api/notifications/read:', error);
      return res.status(500).json({ error: 'تعذر تحديث الإشعار.' });
    }
  });

  app.post('/api/notifications/read-all', requireAuth, async (req: AuthRequest, res) => {
    try {
      const list = await markAllUserNotificationsReadRecord(req.sessionUser!.id);
      return res.json({ notifications: list });
    } catch (error) {
      console.error('Error in POST /api/notifications/read-all:', error);
      return res.status(500).json({ error: 'تعذر تحديث الإشعارات.' });
    }
  });

  app.get('/api/users/blocks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const blocks = await listUserBlocksRecords(req.sessionUser!.id);
      return res.json({ blocks });
    } catch (error) {
      console.error('Error in GET /api/users/blocks:', error);
      return res.status(500).json({ error: 'تعذر تحميل قائمة الحسابات المحظورة.' });
    }
  });

  app.post('/api/users/block', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { targetId, targetNameAr } = req.body || {};
      const result = await toggleUserBlockRecord(
        req.sessionUser!.id,
        String(targetId || ''),
        String(targetNameAr || '')
      );
      return res.json(result);
    } catch (error: any) {
      console.error('Error in POST /api/users/block:', error);
      return res.status(400).json({ error: error.message || 'تعذر حظر الحساب.' });
    }
  });

  // =========================================================================
  // SMART PLASTICO ASSISTANT (مساعد بلاستيكو الذكي — محادثة حقيقية + قاعدة البيانات)
  // =========================================================================

  app.post('/api/assistant', async (req, res) => {
    const {
      message,
      historyCount,
      history,
      userName: clientUserName,
      userRole: clientUserRole,
      userCity: clientUserCity,
      userCountry: clientUserCountry,
    } = req.body || {};
    const userMessage = String(message || '').trim();
    if (!userMessage) {
      return res.status(400).json({ error: 'يرجى كتابة رسالتك.' });
    }

    // Check authenticated user session if present
    let sessionUser = null;
    try {
      const cookies = parseCookies(req.headers.cookie);
      const sid = cookies[SESSION_COOKIE_NAME];
      if (sid) {
        const s = await getSessionWithUser(sid);
        sessionUser = s?.user || null;
      }
    } catch {
      // ignore
    }

    // Query real database records for live grounding
    let dbContext: any = undefined;
    try {
      dbContext = await searchPlatformDatabaseForAssistant(userMessage);
    } catch {
      dbContext = undefined;
    }

    const effectiveUserName = String(
      sessionUser?.name || clientUserName || ''
    ).trim();
    const effectiveRole = String(
      sessionUser?.accountType || clientUserRole || ''
    ).trim();
    const effectiveCity = String(
      sessionUser?.city || clientUserCity || 'العاشر من رمضان'
    ).trim();
    const effectiveCountry = String(
      sessionUser?.country || clientUserCountry || 'مصر'
    ).trim();

    const fallback = resolveSmartAssistantIntent(
      userMessage,
      Number(historyCount || 0),
      {
        userName: effectiveUserName,
        userRole: effectiveRole,
        userCity: effectiveCity,
        userCountry: effectiveCountry,
        history: Array.isArray(history) ? history : [],
        dbContext,
      }
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json(fallback);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const recentHistoryText = Array.isArray(history)
        ? history
            .slice(-8)
            .map((h: any) => `${h.role === 'user' ? 'المستخدم' : 'المساعد'}: ${String(h.text || '')}`)
            .join('\n')
        : '';

      const dbSummaryText = dbContext
        ? `البيانات الحقيقية المتوفرة حالياً في قاعدة بيانات المنصة:
- إعلانات السوق (${dbContext.listings?.length || 0}): ${JSON.stringify(dbContext.listings?.slice(0, 5) || [])}
- الفنيون والمهندسون والمصانع المسجلون (${dbContext.users?.length || 0}): ${JSON.stringify(dbContext.users?.slice(0, 6) || [])}`
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `أنت "مساعد بلاستيكو الذكي" لمنصة PLASTICO الصناعية المتكاملة لقطاع البلاستيك.
بيانات المستخدم الحالي:
- الاسم المسجل: "${effectiveUserName || 'غير محدد بعد'}"
- الدور الصناعي: "${effectiveRole || 'زائر'}"
- المدينة/الدولة: "${effectiveCity}، ${effectiveCountry}"

سياق المحادثة السابقة:
${recentHistoryText || 'بداية المحادثة'}

${dbSummaryText}

رسالة المستخدم الحالية: "${userMessage}"

قواعد المحادثة والذكاء الصناعي:
1. تفاعل كمساعد ذكي طبيعي ولطيف وخبير في صناعة البلاستيك (الحقن، النفخ، السحب، الفيلم، القوالب، خامات PP/PE/PET/PVC/ABS، الماسترباتش، السخانات، الشيلرات، التوظيف، والأعطال).
2. إذا سلّم المستخدم ("أهلاً"، "عامل إيه"، "صباح الخير") أو سأل عنك، رد عليه بترحيب طبيعي باسمه (${effectiveUserName ? `يا ${effectiveUserName}` : 'واطلب اسمه بلطف إن لم يكن معروفاً'}) ولا تكرر سؤال الاسم إذا كان معروفاً.
3. التزم تلقائياً بنفس لغة ولهجة المستخدم (عامية مصرية مهذبة، عربية فصحى، أو إنجليزية).
4. اعتمد على بيانات المنصة الحقيقية المرفقة ولا تخترع أسماء شركات أو أشخاص وهميين.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyAr: { type: Type.STRING },
              replyEn: { type: Type.STRING },
              followUpQuestionsAr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              recommendation: {
                type: Type.OBJECT,
                properties: {
                  categoryTitleAr: { type: Type.STRING },
                  categoryTitleEn: { type: Type.STRING },
                  descriptionAr: { type: Type.STRING },
                  descriptionEn: { type: Type.STRING },
                  buttonLabelAr: { type: Type.STRING },
                  buttonLabelEn: { type: Type.STRING },
                  targetRoute: { type: Type.STRING },
                },
                required: [
                  'categoryTitleAr',
                  'categoryTitleEn',
                  'descriptionAr',
                  'descriptionEn',
                  'buttonLabelAr',
                  'buttonLabelEn',
                  'targetRoute',
                ],
              },
            },
            required: ['replyAr', 'replyEn'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({
          replyAr: parsed.replyAr || fallback.replyAr,
          replyEn: parsed.replyEn || fallback.replyEn,
          detectedUserName: fallback.detectedUserName,
          matchedItems: fallback.matchedItems,
          followUpQuestionsAr:
            parsed.followUpQuestionsAr && parsed.followUpQuestionsAr.length > 0
              ? parsed.followUpQuestionsAr
              : fallback.followUpQuestionsAr,
          recommendation: fallback.recommendation || parsed.recommendation,
        });
      }
      return res.json(fallback);
    } catch {
      return res.json(fallback);
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`PLASTICO server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('PLASTICO server error:', err);
  });
}

startServer().catch((err) => {
  console.error('Failed to start PLASTICO server:', err);
  process.exit(1);
});

