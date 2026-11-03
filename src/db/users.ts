import { db } from './index.ts';
import {
  users,
  authSessions,
  passwordResetTokens,
  rfqRecords,
  googleFormsLinks,
  marketplaceListings,
  suppliersDirectory,
  supplierRfqs,
  academyProgress,
  savedItems,
  userFollows,
  itemLikes,
  conversations,
  chatMessages,
  itemComments,
  userNotifications,
  userBlocks,
} from './schema.ts';
import { eq, desc, and, gt, sql, or, ne, ilike } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  generateSessionSecrets,
  hashToken,
} from '../lib/authService.ts';
import crypto from 'node:crypto';

export interface SanitizedUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  accountType: string;
  city: string;
  country: string;
  specialty: string;
  bio: string;
  phone: string;
  companyName: string;
  verified: boolean;
  profileCompleted: boolean;
  skills: string[];
  experienceYears: number;
  education: string;
  workPreferences: string;
  avatarUrl: string;
  jobTitle: string;
  machines: string[];
  experiences: string[];
  certificates: string[];
  contactPrefs: Record<string, boolean | string>;
  createdAt: Date | null;
}

function safeJsonArray(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function safeJsonObject(raw: string | null | undefined): Record<string, boolean | string> {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function sanitizeUserRow(row: typeof users.$inferSelect): SanitizedUser {
  return {
    id: row.id,
    uid: row.uid,
    email: row.email,
    name: row.name || '',
    accountType: row.accountType || 'engineer',
    city: row.city || 'العاشر من رمضان',
    country: row.country || 'مصر',
    specialty: row.specialty || '',
    bio: row.bio || '',
    phone: row.phone || '',
    companyName: row.companyName || '',
    verified: Boolean(row.verified),
    profileCompleted: Boolean(row.profileCompleted),
    skills: safeJsonArray(row.skillsJson),
    experienceYears: Number(row.experienceYears || 0),
    education: row.education || '',
    workPreferences: row.workPreferences || '',
    avatarUrl: row.avatarUrl || '',
    jobTitle: row.jobTitle || '',
    machines: safeJsonArray(row.machinesJson),
    experiences: safeJsonArray(row.experiencesJson),
    certificates: safeJsonArray(row.certificatesJson),
    contactPrefs: safeJsonObject(row.contactPrefsJson),
    createdAt: row.createdAt,
  };
}

export async function getOrCreateUser(
  uid: string,
  email: string,
  name = '',
  accountType = 'engineer',
  city = 'العاشر من رمضان'
) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingByUid = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid));
    if (existingByUid.length > 0) {
      return existingByUid[0];
    }

    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail));
    if (existingByEmail.length > 0) {
      return existingByEmail[0];
    }

    const result = await db
      .insert(users)
      .values({
        uid,
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        accountType,
        city,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: normalizedEmail,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function registerUserWithPassword(input: {
  fullName: string;
  email: string;
  password: string;
  country: string;
  city?: string;
  accountType: string;
  phone?: string;
  specialty?: string;
  companyName?: string;
  bio?: string;
  experienceYears?: number;
  skills?: string[];
  avatarUrl?: string;
  jobTitle?: string;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (existing.length > 0) {
    const err = new Error('البريد الإلكتروني مسجل بالفعل في المنصة.');
    (err as any).code = 'DUPLICATE_EMAIL';
    throw err;
  }

  const { hash, salt } = hashPassword(input.password);
  const uid = `usr_${crypto.randomBytes(12).toString('hex')}`;
  const hasStep2 = Boolean(
    input.specialty || input.companyName || input.bio || (input.skills && input.skills.length)
  );

  const inserted = await db
    .insert(users)
    .values({
      uid,
      email: normalizedEmail,
      name: input.fullName.trim().slice(0, 120),
      accountType: input.accountType || 'engineer',
      country: (input.country || 'مصر').slice(0, 80),
      city: (input.city || 'العاشر من رمضان').slice(0, 80),
      passwordHash: hash,
      passwordSalt: salt,
      phone: (input.phone || '').slice(0, 40),
      specialty: (input.specialty || '').slice(0, 140),
      companyName: (input.companyName || '').slice(0, 140),
      bio: (input.bio || '').slice(0, 1000),
      experienceYears: Math.max(0, Number(input.experienceYears || 0)),
      skillsJson: JSON.stringify(Array.isArray(input.skills) ? input.skills : []),
      avatarUrl: input.avatarUrl ? String(input.avatarUrl).slice(0, 1_500_000) : '',
      jobTitle: input.jobTitle ? String(input.jobTitle).slice(0, 140) : '',
      profileCompleted: hasStep2,
      verified: false,
    })
    .returning();

  return sanitizeUserRow(inserted[0]);
}

export async function authenticateUserByPassword(
  emailOrPhone: string,
  password: string
): Promise<SanitizedUser | null> {
  const identifier = emailOrPhone.trim().toLowerCase();
  if (!identifier || !password) return null;

  const rows = await db
    .select()
    .from(users)
    .where(
      identifier.includes('@')
        ? eq(users.email, identifier)
        : eq(users.phone, emailOrPhone.trim())
    );

  if (!rows.length) return null;
  const userRow = rows[0];
  const valid = verifyPassword(password, userRow.passwordHash, userRow.passwordSalt);
  if (!valid) return null;

  return sanitizeUserRow(userRow);
}

export async function createServerSession(
  userId: number,
  rememberMe = false
): Promise<{
  rawToken: string;
  csrfToken: string;
  expiresAt: Date;
  maxAgeSeconds: number;
}> {
  const { rawToken, tokenHash, csrfToken } = generateSessionSecrets();
  const maxAgeSeconds = rememberMe ? 30 * 24 * 3600 : 24 * 3600;
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  await db.insert(authSessions).values({
    tokenHash,
    csrfToken,
    userId,
    rememberMe,
    expiresAt,
  });

  return { rawToken, csrfToken, expiresAt, maxAgeSeconds };
}

export async function getSessionWithUser(rawToken: string): Promise<{
  session: typeof authSessions.$inferSelect;
  user: SanitizedUser;
} | null> {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);
  const now = new Date();

  const rows = await db
    .select({
      session: authSessions,
      user: users,
    })
    .from(authSessions)
    .innerJoin(users, eq(authSessions.userId, users.id))
    .where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, now)));

  if (!rows.length) return null;
  return {
    session: rows[0].session,
    user: sanitizeUserRow(rows[0].user),
  };
}

export async function deleteServerSession(rawToken: string): Promise<void> {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
}

export async function updateUserProfileById(
  userId: number,
  patch: {
    name?: string;
    accountType?: string;
    country?: string;
    city?: string;
    specialty?: string;
    bio?: string;
    phone?: string;
    companyName?: string;
    experienceYears?: number;
    skills?: string[];
    education?: string;
    workPreferences?: string;
    profileCompleted?: boolean;
    avatarUrl?: string;
    jobTitle?: string;
    machines?: string[];
    experiences?: string[];
    certificates?: string[];
    contactPrefs?: Record<string, boolean | string>;
  }
): Promise<SanitizedUser> {
  const existing = await db.select().from(users).where(eq(users.id, userId));
  if (!existing.length) {
    throw new Error('User not found');
  }
  const current = existing[0];
  const updated = await db
    .update(users)
    .set({
      name: patch.name !== undefined ? patch.name.trim().slice(0, 120) : current.name,
      accountType:
        patch.accountType !== undefined ? patch.accountType.slice(0, 40) : current.accountType,
      country: patch.country !== undefined ? patch.country.slice(0, 80) : current.country,
      city: patch.city !== undefined ? patch.city.slice(0, 80) : current.city,
      specialty:
        patch.specialty !== undefined ? patch.specialty.slice(0, 160) : current.specialty,
      bio: patch.bio !== undefined ? patch.bio.slice(0, 1500) : current.bio,
      phone: patch.phone !== undefined ? patch.phone.slice(0, 40) : current.phone,
      companyName:
        patch.companyName !== undefined ? patch.companyName.slice(0, 140) : current.companyName,
      experienceYears:
        patch.experienceYears !== undefined
          ? Math.max(0, Number(patch.experienceYears))
          : current.experienceYears,
      skillsJson:
        patch.skills !== undefined
          ? JSON.stringify(patch.skills.slice(0, 35))
          : current.skillsJson,
      education:
        patch.education !== undefined ? patch.education.slice(0, 200) : current.education,
      workPreferences:
        patch.workPreferences !== undefined
          ? patch.workPreferences.slice(0, 200)
          : current.workPreferences,
      avatarUrl:
        patch.avatarUrl !== undefined
          ? String(patch.avatarUrl).slice(0, 1_500_000)
          : current.avatarUrl,
      jobTitle:
        patch.jobTitle !== undefined ? patch.jobTitle.slice(0, 160) : current.jobTitle,
      machinesJson:
        patch.machines !== undefined
          ? JSON.stringify(patch.machines.slice(0, 30))
          : current.machinesJson,
      experiencesJson:
        patch.experiences !== undefined
          ? JSON.stringify(patch.experiences.slice(0, 25))
          : current.experiencesJson,
      certificatesJson:
        patch.certificates !== undefined
          ? JSON.stringify(patch.certificates.slice(0, 25))
          : current.certificatesJson,
      contactPrefsJson:
        patch.contactPrefs !== undefined
          ? JSON.stringify(patch.contactPrefs)
          : current.contactPrefsJson,
      profileCompleted:
        patch.profileCompleted !== undefined ? patch.profileCompleted : true,
    })
    .where(eq(users.id, userId))
    .returning();

  return sanitizeUserRow(updated[0]);
}

export async function createPasswordResetRequest(email: string): Promise<{
  resetTokenForVerificationOnly?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const found = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail));

  if (!found.length) {
    return {};
  }

  const rawResetToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashToken(rawResetToken);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await db.insert(passwordResetTokens).values({
    userId: found[0].id,
    tokenHash,
    expiresAt,
    used: false,
  });

  return { resetTokenForVerificationOnly: rawResetToken };
}

export async function redeemPasswordResetToken(
  rawResetToken: string,
  newPassword: string
): Promise<boolean> {
  if (!rawResetToken || !newPassword || newPassword.length < 6) return false;
  const tokenHash = hashToken(rawResetToken);
  const now = new Date();

  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, now)
      )
    );

  if (!rows.length) return false;
  const tokenRecord = rows[0];
  const { hash, salt } = hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash: hash, passwordSalt: salt })
    .where(eq(users.id, tokenRecord.userId));

  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, tokenRecord.id));

  await db.delete(authSessions).where(eq(authSessions.userId, tokenRecord.userId));
  return true;
}

export async function getUserRfqs(uid: string) {
  try {
    const rows = await db
      .select({
        id: rfqRecords.id,
        referenceCode: rfqRecords.referenceCode,
        titleAr: rfqRecords.titleAr,
        processId: rfqRecords.processId,
        material: rfqRecords.material,
        quantity: rfqRecords.quantity,
        city: rfqRecords.city,
        status: rfqRecords.status,
        createdAt: rfqRecords.createdAt,
      })
      .from(rfqRecords)
      .innerJoin(users, eq(rfqRecords.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(rfqRecords.id));
    return rows;
  } catch (error) {
    console.error('Database query failed in getUserRfqs:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function insertUserRfq(
  uid: string,
  email: string,
  payload: {
    referenceCode: string;
    titleAr: string;
    processId: string;
    material: string;
    quantity: number;
    city: string;
    status: string;
  }
) {
  try {
    const userRow = await getOrCreateUser(uid, email);
    const inserted = await db
      .insert(rfqRecords)
      .values({
        userId: userRow.id,
        referenceCode: payload.referenceCode,
        titleAr: payload.titleAr,
        processId: payload.processId,
        material: payload.material,
        quantity: payload.quantity,
        city: payload.city,
        status: payload.status,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in insertUserRfq:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getUserGoogleForms(uid: string) {
  try {
    const rows = await db
      .select({
        id: googleFormsLinks.id,
        formId: googleFormsLinks.formId,
        title: googleFormsLinks.title,
        responderUri: googleFormsLinks.responderUri,
        purposeAr: googleFormsLinks.purposeAr,
        createdAt: googleFormsLinks.createdAt,
      })
      .from(googleFormsLinks)
      .innerJoin(users, eq(googleFormsLinks.userId, users.id))
      .where(eq(users.uid, uid))
      .orderBy(desc(googleFormsLinks.id));
    return rows;
  } catch (error) {
    console.error('Database query failed in getUserGoogleForms:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function insertUserGoogleForm(
  uid: string,
  email: string,
  payload: {
    formId: string;
    title: string;
    responderUri: string;
    purposeAr: string;
  }
) {
  try {
    const userRow = await getOrCreateUser(uid, email);
    const inserted = await db
      .insert(googleFormsLinks)
      .values({
        userId: userRow.id,
        formId: payload.formId,
        title: payload.title,
        responderUri: payload.responderUri,
        purposeAr: payload.purposeAr,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Database query failed in insertUserGoogleForm:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function deleteUserGoogleForm(uid: string, recordId: number) {
  try {
    const userRow = await db
      .select()
      .from(users)
      .where(eq(users.uid, uid));
    if (!userRow.length) return false;
    await db
      .delete(googleFormsLinks)
      .where(eq(googleFormsLinks.id, recordId));
    return true;
  } catch (error) {
    console.error('Database query failed in deleteUserGoogleForm:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function listMarketplaceListings() {
  return db
    .select()
    .from(marketplaceListings)
    .orderBy(desc(marketplaceListings.id));
}

export async function createMarketplaceListingRecord(
  userId: number,
  input: {
    titleAr: string;
    titleEn?: string;
    category: string;
    isUsed: boolean;
    conditionCode: string;
    manufacturer?: string;
    model?: string;
    year?: number;
    price: number;
    currency?: string;
    city: string;
    country?: string;
    descriptionAr?: string;
    specs?: Record<string, string>;
    image?: string;
    images?: string[];
    sellerNameAr: string;
    sellerPhone: string;
  }
) {
  const defaultImg =
    '/assets/aistudio/Meta_AI_876711241_1165794242468368_1352144977164666078_n_20261101_133109.webp_7686cffc.jpg';
  const primaryImage = input.image || (input.images && input.images[0]) || defaultImg;
  const gallery =
    Array.isArray(input.images) && input.images.length > 0
      ? input.images.slice(0, 8)
      : [primaryImage];

  const inserted = await db
    .insert(marketplaceListings)
    .values({
      userId,
      titleAr: input.titleAr.slice(0, 180),
      titleEn: (input.titleEn || input.titleAr).slice(0, 180),
      category: input.category.slice(0, 60),
      isUsed: Boolean(input.isUsed),
      conditionCode: (input.conditionCode || 'new').slice(0, 40),
      manufacturer: (input.manufacturer || '').slice(0, 80),
      model: (input.model || '').slice(0, 80),
      year: Number(input.year || 2024),
      price: Math.max(0, Number(input.price || 0)),
      currency: (input.currency || 'EGP').slice(0, 12),
      city: (input.city || 'العاشر من رمضان').slice(0, 80),
      country: (input.country || 'مصر').slice(0, 80),
      descriptionAr: (input.descriptionAr || '').slice(0, 1500),
      specsJson: JSON.stringify(input.specs || {}),
      image: primaryImage,
      imagesJson: JSON.stringify(gallery),
      sellerNameAr: input.sellerNameAr.slice(0, 120),
      sellerPhone: input.sellerPhone.slice(0, 40),
      isSample: false,
    })
    .returning();
  return inserted[0];
}

export async function reportMarketplaceListing(listingId: number) {
  await db
    .update(marketplaceListings)
    .set({
      reportedCount: sql`${marketplaceListings.reportedCount} + 1`,
    })
    .where(eq(marketplaceListings.id, listingId));
}

export async function createSupplierRfqRecord(
  userId: number | null,
  input: {
    supplierId: string;
    supplierNameAr: string;
    category: string;
    productName: string;
    material: string;
    quantity: number;
    unit: string;
    city: string;
    details: string;
    contactName: string;
    contactPhone: string;
  }
) {
  const inserted = await db
    .insert(supplierRfqs)
    .values({
      userId,
      supplierId: input.supplierId.slice(0, 80),
      supplierNameAr: input.supplierNameAr.slice(0, 140),
      category: input.category.slice(0, 60),
      productName: input.productName.slice(0, 160),
      material: (input.material || '').slice(0, 80),
      quantity: Math.max(1, Number(input.quantity || 1)),
      unit: (input.unit || 'طن').slice(0, 30),
      city: (input.city || 'العاشر من رمضان').slice(0, 80),
      details: (input.details || '').slice(0, 1200),
      contactName: input.contactName.slice(0, 120),
      contactPhone: input.contactPhone.slice(0, 40),
      status: 'pending_quote',
    })
    .returning();
  return inserted[0];
}

export async function listUserSupplierRfqs(userId: number) {
  return db
    .select()
    .from(supplierRfqs)
    .where(eq(supplierRfqs.userId, userId))
    .orderBy(desc(supplierRfqs.id));
}

export async function getUserAcademyProgress(userId: number) {
  const rows = await db
    .select()
    .from(academyProgress)
    .where(eq(academyProgress.userId, userId));
  return rows.map((r) => {
    let completedLessons: string[] = [];
    try {
      completedLessons = JSON.parse(r.completedLessonsJson || '[]');
    } catch {
      completedLessons = [];
    }
    return {
      id: r.id,
      courseId: r.courseId,
      completedLessons,
      quizScore: r.quizScore || 0,
      certificateCode: r.certificateCode || '',
      issuedAt: r.issuedAt,
    };
  });
}

export async function upsertUserAcademyProgress(
  userId: number,
  courseId: string,
  completedLessons: string[],
  quizScore: number,
  requiredLessonsCount: number
) {
  const existing = await db
    .select()
    .from(academyProgress)
    .where(
      and(
        eq(academyProgress.userId, userId),
        eq(academyProgress.courseId, courseId)
      )
    );

  const eligibleForCertificate =
    completedLessons.length >= requiredLessonsCount && quizScore >= 70;

  let certificateCode = existing[0]?.certificateCode || '';
  let issuedAt = existing[0]?.issuedAt || null;

  if (eligibleForCertificate && !certificateCode) {
    certificateCode = `PLC-CERT-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;
    issuedAt = new Date();
  }

  if (existing.length > 0) {
    const updated = await db
      .update(academyProgress)
      .set({
        completedLessonsJson: JSON.stringify(completedLessons),
        quizScore,
        certificateCode,
        issuedAt,
        updatedAt: new Date(),
      })
      .where(eq(academyProgress.id, existing[0].id))
      .returning();
    return updated[0];
  }

  const inserted = await db
    .insert(academyProgress)
    .values({
      userId,
      courseId,
      completedLessonsJson: JSON.stringify(completedLessons),
      quizScore,
      certificateCode,
      issuedAt,
    })
    .returning();
  return inserted[0];
}

// =========================================================================
// DATABASE-BACKED FAVORITES (SAVED ITEMS)
// =========================================================================

export async function listUserSavedItems(userId: number) {
  return db
    .select()
    .from(savedItems)
    .where(eq(savedItems.userId, userId))
    .orderBy(desc(savedItems.id));
}

export async function toggleUserSavedItem(
  userId: number,
  input: {
    itemType: string;
    itemId: string;
    titleAr: string;
    route: string;
  }
) {
  const existing = await db
    .select()
    .from(savedItems)
    .where(
      and(
        eq(savedItems.userId, userId),
        eq(savedItems.itemId, input.itemId)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(savedItems)
      .where(
        and(
          eq(savedItems.userId, userId),
          eq(savedItems.itemId, input.itemId)
        )
      );
    const items = await listUserSavedItems(userId);
    return { saved: false, items };
  }

  await db.insert(savedItems).values({
    userId,
    itemType: (input.itemType || 'market').slice(0, 40),
    itemId: input.itemId.slice(0, 120),
    titleAr: (input.titleAr || 'عنصر محفوظ').slice(0, 200),
    route: (input.route || '/app/market').slice(0, 240),
  });

  const items = await listUserSavedItems(userId);
  return { saved: true, items };
}

export async function removeUserSavedItem(userId: number, itemId: string) {
  await db
    .delete(savedItems)
    .where(and(eq(savedItems.userId, userId), eq(savedItems.itemId, itemId)));
  return listUserSavedItems(userId);
}

// =========================================================================
// DATABASE-BACKED FOLLOW / UNFOLLOW SYSTEM
// =========================================================================

export async function getUserFollowsData(userId: number | null) {
  const allFollows = await db
    .select()
    .from(userFollows)
    .orderBy(desc(userFollows.id));

  const followerCounts: Record<string, number> = {};
  for (const f of allFollows) {
    followerCounts[f.targetId] = (followerCounts[f.targetId] || 0) + 1;
  }

  const myFollowing = userId
    ? allFollows.filter((f) => f.followerId === userId)
    : [];

  const myTargetKey = userId ? `usr-${userId}` : '';
  const myDirectFollowers = userId
    ? allFollows.filter(
        (f) => f.targetId === String(userId) || f.targetId === myTargetKey
      )
    : [];

  // Resolve follower names from users table if available
  const allUserRows = userId ? await db.select().from(users) : [];
  const userByIdMap = new Map<number, typeof users.$inferSelect>();
  for (const u of allUserRows) {
    userByIdMap.set(u.id, u);
  }

  const followersList = myDirectFollowers.map((f) => {
    const followerUser = userByIdMap.get(f.followerId);
    return {
      id: followerUser ? `usr-${followerUser.id}` : `usr-${f.followerId}`,
      type: followerUser?.accountType || 'user',
      nameAr: followerUser?.companyName || followerUser?.name || 'عضو بلاستيكو',
      roleAr: followerUser?.jobTitle || followerUser?.specialty || 'متخصص صناعي',
      avatar: followerUser?.avatarUrl || '',
      createdAt: f.createdAt ? f.createdAt.toISOString() : undefined,
    };
  });

  const followingList = myFollowing.map((f) => ({
    id: f.targetId,
    type: f.targetType || 'user',
    nameAr: f.targetNameAr || 'عضو بلاستيكو',
    roleAr: f.targetRoleAr || 'متخصص صناعي',
    avatar: f.targetAvatar || '',
    createdAt: f.createdAt ? f.createdAt.toISOString() : undefined,
  }));

  const followingIds = myFollowing.map((f) => f.targetId);

  return {
    following: myFollowing,
    followerCounts,
    followingIds,
    followersCount: followersList.length,
    followingCount: followingList.length,
    followersList,
    followingList,
  };
}

export async function toggleUserFollow(
  followerId: number,
  followerUid: string,
  input: {
    targetId: string;
    targetType?: string;
    targetNameAr?: string;
    targetRoleAr?: string;
    targetAvatar?: string;
  }
) {
  const targetId = String(input.targetId || '').trim();
  if (!targetId) {
    throw new Error('معرف الحساب المطلوب متابعته مفقود.');
  }
  if (
    targetId === String(followerId) ||
    targetId === `usr-${followerId}` ||
    targetId === followerUid
  ) {
    throw new Error('لا يمكنك متابعة حسابك الشخصي.');
  }

  const existing = await db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.targetId, targetId)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.targetId, targetId)
        )
      );
    const summary = await getUserFollowsData(followerId);
    return { ...summary, followingNow: false, following: false };
  }

  await db.insert(userFollows).values({
    followerId,
    targetId: targetId.slice(0, 120),
    targetType: (input.targetType || 'user').slice(0, 40),
    targetNameAr: (input.targetNameAr || 'عضو بلاستيكو').slice(0, 160),
    targetRoleAr: (input.targetRoleAr || 'متخصص صناعي').slice(0, 160),
    targetAvatar: (input.targetAvatar || '').slice(0, 500),
  });

  // Notify target user if targetId is a registered user (usr-<id> or numeric)
  const numericTarget = targetId.startsWith('usr-')
    ? Number(targetId.replace('usr-', ''))
    : Number(targetId);
  if (Number.isInteger(numericTarget) && numericTarget > 0 && numericTarget !== followerId) {
    const followerRow = await db.select().from(users).where(eq(users.id, followerId));
    const followerName =
      followerRow[0]?.companyName || followerRow[0]?.name || 'عضو صناعي في بلاستيكو';
    await createUserNotificationRecord({
      userId: numericTarget,
      type: 'follow',
      titleAr: 'متابع جديد لحسابك الصناعي',
      titleEn: 'New Follower on Your Industrial Profile',
      bodyAr: `قام ${followerName} بمتابعة حسابك على منصة بلاستيكو.`,
      bodyEn: `${followerName} started following your profile on PLASTICO.`,
      link: `/app/profile/usr-${followerId}`,
    }).catch(() => {});
  }

  const summary = await getUserFollowsData(followerId);
  return { ...summary, followingNow: true, following: true };
}

// =========================================================================
// DATABASE-BACKED LIKES / REACTIONS SYSTEM
// =========================================================================

export async function getLikesSummary(userId: number | null) {
  const allLikes = await db.select().from(itemLikes);
  const counts: Record<string, number> = {};
  const myLikedKeys: string[] = [];

  for (const row of allLikes) {
    const key = `${row.itemType}:${row.itemId}`;
    counts[key] = (counts[key] || 0) + 1;
    if (userId && row.userId === userId) {
      myLikedKeys.push(key);
    }
  }

  return {
    counts,
    myLikedKeys,
    countsMap: counts,
    likedByMe: myLikedKeys,
  };
}

export async function toggleItemLike(
  userId: number,
  input: { itemType: string; itemId: string }
) {
  const itemType = String(input.itemType || 'post').trim().slice(0, 40);
  const itemId = String(input.itemId || '').trim().slice(0, 120);
  if (!itemId) {
    throw new Error('معرف العنصر مفقود.');
  }

  const key = `${itemType}:${itemId}`;
  const existing = await db
    .select()
    .from(itemLikes)
    .where(
      and(
        eq(itemLikes.userId, userId),
        eq(itemLikes.itemType, itemType),
        eq(itemLikes.itemId, itemId)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(itemLikes)
      .where(
        and(
          eq(itemLikes.userId, userId),
          eq(itemLikes.itemType, itemType),
          eq(itemLikes.itemId, itemId)
        )
      );
    const summary = await getLikesSummary(userId);
    return {
      liked: false,
      count: summary.counts[key] || 0,
      ...summary,
    };
  }

  await db.insert(itemLikes).values({
    userId,
    itemType,
    itemId,
  });

  const summary = await getLikesSummary(userId);
  return {
    liked: true,
    count: summary.counts[key] || 0,
    ...summary,
  };
}

// =========================================================================
// DATABASE-BACKED IN-APP CHAT SYSTEM
// =========================================================================

export async function listUserConversations(userId: number) {
  const convs = await db
    .select()
    .from(conversations)
    .where(
      or(
        eq(conversations.participantOneId, userId),
        eq(conversations.participantTwoId, userId)
      )
    )
    .orderBy(desc(conversations.lastMessageAt), desc(conversations.id));

  if (!convs.length) return [];

  const allMessages = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.id));

  return convs.map((c) => {
    const unreadCount = allMessages.filter(
      (m) => m.conversationId === c.id && m.senderId !== userId && !m.isRead
    ).length;
    return {
      ...c,
      otherPartyKey: c.targetKey,
      otherPartyNameAr: c.targetNameAr,
      otherPartyRoleAr: c.targetRoleAr || 'شريك صناعي في بلاستيكو',
      otherPartyAvatar: c.targetAvatar || '',
      lastMessageAt: c.lastMessageAt
        ? c.lastMessageAt.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'الآن',
      unreadCount,
    };
  });
}

export async function startOrGetConversation(
  userId: number,
  userName: string,
  input: {
    targetKey: string;
    targetNameAr: string;
    targetRoleAr?: string;
    targetAvatar?: string;
    contextType?: string;
    contextId?: string;
    contextTitleAr?: string;
    initialMessage?: string;
  }
) {
  const targetKey = String(input.targetKey || input.targetNameAr || 'general').trim().slice(0, 120);
  const existing = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.participantOneId, userId),
        eq(conversations.targetKey, targetKey)
      )
    );

  let conv = existing[0];

  if (!conv) {
    const inserted = await db
      .insert(conversations)
      .values({
        participantOneId: userId,
        participantTwoId: null,
        targetKey,
        targetNameAr: (input.targetNameAr || 'مورد / مصنع معتمد').slice(0, 160),
        targetRoleAr: (input.targetRoleAr || 'شريك صناعي في بلاستيكو').slice(0, 160),
        targetAvatar: (input.targetAvatar || '').slice(0, 500),
        contextType: (input.contextType || 'general').slice(0, 40),
        contextId: (input.contextId || '').slice(0, 120),
        contextTitleAr: (input.contextTitleAr || '').slice(0, 200),
        lastMessageText: input.initialMessage
          ? input.initialMessage.slice(0, 300)
          : 'بدأت محادثة صناعية جديدة',
        lastMessageAt: new Date(),
      })
      .returning();
    conv = inserted[0];
  } else if (input.contextTitleAr && input.contextTitleAr !== conv.contextTitleAr) {
    const updated = await db
      .update(conversations)
      .set({
        contextType: (input.contextType || conv.contextType || 'general').slice(0, 40),
        contextId: (input.contextId || conv.contextId || '').slice(0, 120),
        contextTitleAr: input.contextTitleAr.slice(0, 200),
      })
      .where(eq(conversations.id, conv.id))
      .returning();
    conv = updated[0];
  }

  if (input.initialMessage && input.initialMessage.trim()) {
    await sendConversationMessage(userId, userName, conv.id, {
      content: input.initialMessage.trim(),
    });
  }

  const updatedConvs = await listUserConversations(userId);
  const activeConv = updatedConvs.find((c) => c.id === conv.id) || { ...conv, unreadCount: 0 };
  const msgs = await getConversationMessages(userId, conv.id);

  return {
    conversation: activeConv,
    messages: msgs,
  };
}

export async function getConversationMessages(userId: number, conversationId: number) {
  const convRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!convRows.length) {
    throw new Error('المحادثة غير موجودة.');
  }
  const conv = convRows[0];
  if (conv.participantOneId !== userId && conv.participantTwoId !== userId) {
    const err = new Error('غير مصرح لك بالوصول إلى هذه المحادثة.');
    (err as any).statusCode = 403;
    throw err;
  }

  // Mark incoming messages as read
  await db
    .update(chatMessages)
    .set({ isRead: true })
    .where(
      and(
        eq(chatMessages.conversationId, conversationId),
        ne(chatMessages.senderId, userId)
      )
    );

  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.id);
}

export async function sendConversationMessage(
  userId: number,
  userName: string,
  conversationId: number,
  input: { content: string; attachmentUrl?: string }
) {
  const convRows = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));

  if (!convRows.length) {
    throw new Error('المحادثة غير موجودة.');
  }
  const conv = convRows[0];
  if (conv.participantOneId !== userId && conv.participantTwoId !== userId) {
    const err = new Error('غير مصرح لك بإرسال رسائل في هذه المحادثة.');
    (err as any).statusCode = 403;
    throw err;
  }

  const content = String(input.content || '').trim();
  const attachmentUrl = String(input.attachmentUrl || '').trim();
  if (!content && !attachmentUrl) {
    throw new Error('يرجى كتابة نص الرسالة أو إرفاق صورة.');
  }

  const inserted = await db
    .insert(chatMessages)
    .values({
      conversationId,
      senderId: userId,
      senderName: (userName || 'مستخدم بلاستيكو').slice(0, 120),
      content: (content || '📎 مرفق صورة').slice(0, 2000),
      attachmentUrl: attachmentUrl.slice(0, 1_500_000),
      isRead: true,
    })
    .returning();

  await db
    .update(conversations)
    .set({
      lastMessageText: (content || '📎 مرفق صورة').slice(0, 300),
      lastMessageAt: new Date(),
    })
    .where(eq(conversations.id, conversationId));

  return inserted[0];
}

export async function getRoleDashboardSummary(user: SanitizedUser) {
  const myRfqs = await db
    .select()
    .from(rfqRecords)
    .where(eq(rfqRecords.userId, user.id))
    .orderBy(desc(rfqRecords.id));

  const mySupplierRfqs = await db
    .select()
    .from(supplierRfqs)
    .where(eq(supplierRfqs.userId, user.id))
    .orderBy(desc(supplierRfqs.id));

  const myListings = await db
    .select()
    .from(marketplaceListings)
    .where(eq(marketplaceListings.userId, user.id))
    .orderBy(desc(marketplaceListings.id));

  const myAcademy = await getUserAcademyProgress(user.id);

  const mySaved = await listUserSavedItems(user.id);
  const myFollows = await getUserFollowsData(user.id);
  const myConversations = await listUserConversations(user.id);

  return {
    role: user.accountType,
    rfqs: myRfqs,
    supplierRfqs: mySupplierRfqs,
    listings: myListings,
    academy: myAcademy,
    saved: mySaved,
    follows: myFollows,
    conversations: myConversations,
  };
}

// =========================================================================
// EXTENDED PLATFORM TABLES (VERIFICATION, JOB APPLICATIONS, REPORTS, ADMIN)
// =========================================================================

export async function ensureExtendedPlatformTables() {
  // Tables (verification_requests, job_applications, platform_reports, system_announcements)
  // are provisioned and managed via Drizzle schema in src/db/schema.ts
  return;
}

export async function submitVerificationRequest(
  userId: number,
  input: {
    companyName: string;
    role: string;
    documentType: string;
    documentUrl?: string;
    notes?: string;
  }
) {
  await ensureExtendedPlatformTables();
  const companyName = String(input.companyName || '').trim().slice(0, 160);
  const role = String(input.role || 'factory').trim().slice(0, 40);
  const documentType = String(input.documentType || 'سجل تجاري وبطاقة ضريبية').trim().slice(0, 120);
  const documentUrl = String(input.documentUrl || '').slice(0, 1_500_000);
  const notes = String(input.notes || '').trim().slice(0, 1000);

  const res = await db.execute(sql`
    INSERT INTO verification_requests (user_id, company_name, role, document_type, document_url, notes, status)
    VALUES (${userId}, ${companyName}, ${role}, ${documentType}, ${documentUrl}, ${notes}, 'pending')
    RETURNING *
  `);
  return (res as any).rows?.[0] || null;
}

export async function getUserVerificationRequests(userId: number) {
  await ensureExtendedPlatformTables();
  const res = await db.execute(sql`
    SELECT id, user_id, company_name, role, document_type, notes, status, rejection_reason, created_at, updated_at
    FROM verification_requests
    WHERE user_id = ${userId}
    ORDER BY id DESC
  `);
  return (res as any).rows || [];
}

export async function submitJobApplicationRecord(
  user: SanitizedUser,
  input: {
    jobId: string;
    jobTitleAr: string;
    companyNameAr: string;
    applicantPhone?: string;
    cvFileName?: string;
    cvUrl?: string;
    coverNote?: string;
  }
) {
  await ensureExtendedPlatformTables();
  const jobId = String(input.jobId || '').trim().slice(0, 80);
  const jobTitleAr = String(input.jobTitleAr || 'وظيفة صناعية').trim().slice(0, 180);
  const companyNameAr = String(input.companyNameAr || 'مصنع بلاستيكو').trim().slice(0, 160);
  const phone = String(input.applicantPhone || user.phone || '').trim().slice(0, 40);
  const cvFileName = String(input.cvFileName || '').trim().slice(0, 160);
  const cvUrl = String(input.cvUrl || '').slice(0, 1_500_000);
  const coverNote = String(input.coverNote || '').trim().slice(0, 1200);

  const res = await db.execute(sql`
    INSERT INTO job_applications (
      job_id, job_title_ar, company_name_ar, applicant_user_id,
      applicant_name, applicant_role, applicant_phone, applicant_email,
      cv_file_name, cv_url, cover_note, status
    )
    VALUES (
      ${jobId}, ${jobTitleAr}, ${companyNameAr}, ${user.id},
      ${user.name || 'متقدم صناعي'}, ${user.accountType || 'technician'},
      ${phone}, ${user.email || ''}, ${cvFileName}, ${cvUrl}, ${coverNote}, 'received'
    )
    RETURNING *
  `);
  return (res as any).rows?.[0] || null;
}

export async function listJobApplicationsForUserOrEmployer(user: SanitizedUser) {
  await ensureExtendedPlatformTables();
  const myAppsRes = await db.execute(sql`
    SELECT * FROM job_applications
    WHERE applicant_user_id = ${user.id}
    ORDER BY id DESC
  `);

  const allAppsRes = await db.execute(sql`
    SELECT * FROM job_applications
    ORDER BY id DESC
    LIMIT 60
  `);

  return {
    myApplications: (myAppsRes as any).rows || [],
    receivedApplications: (allAppsRes as any).rows || [],
  };
}

export async function updateJobApplicationStatusRecord(
  applicationId: number,
  status: string
) {
  await ensureExtendedPlatformTables();
  const allowed = ['received', 'under_review', 'contacted', 'accepted', 'rejected', 'withdrawn'];
  const safeStatus = allowed.includes(status) ? status : 'under_review';

  const res = await db.execute(sql`
    UPDATE job_applications
    SET status = ${safeStatus}, updated_at = NOW()
    WHERE id = ${applicationId}
    RETURNING *
  `);
  return (res as any).rows?.[0] || null;
}

export async function createPlatformReportRecord(
  userId: number | null,
  input: {
    targetType: string;
    targetId: string;
    targetTitleAr?: string;
    reason: string;
  }
) {
  await ensureExtendedPlatformTables();
  const targetType = String(input.targetType || 'listing').slice(0, 40);
  const targetId = String(input.targetId || '').slice(0, 120);
  const targetTitleAr = String(input.targetTitleAr || '').slice(0, 200);
  const reason = String(input.reason || 'محتوى مخالف').slice(0, 600);

  const res = await db.execute(sql`
    INSERT INTO platform_reports (reporter_user_id, target_type, target_id, target_title_ar, reason, status)
    VALUES (${userId}, ${targetType}, ${targetId}, ${targetTitleAr}, ${reason}, 'open')
    RETURNING *
  `);
  return (res as any).rows?.[0] || null;
}

export async function getAdminDashboardOverview() {
  await ensureExtendedPlatformTables();

  const allUsers = await db.select().from(users).orderBy(desc(users.id));
  const allListings = await db
    .select()
    .from(marketplaceListings)
    .orderBy(desc(marketplaceListings.id));
  const allRfqs = await db.select().from(rfqRecords).orderBy(desc(rfqRecords.id));
  const allSupplierRfqs = await db
    .select()
    .from(supplierRfqs)
    .orderBy(desc(supplierRfqs.id));
  const allAcademy = await db.select().from(academyProgress);

  const verificationsRes = await db.execute(sql`
    SELECT id, user_id, company_name, role, document_type, notes, status, rejection_reason, created_at, updated_at
    FROM verification_requests
    ORDER BY id DESC
    LIMIT 50
  `);

  const reportsRes = await db.execute(sql`
    SELECT * FROM platform_reports
    ORDER BY id DESC
    LIMIT 50
  `);

  const jobAppsRes = await db.execute(sql`
    SELECT * FROM job_applications
    ORDER BY id DESC
    LIMIT 50
  `);

  const announcementsRes = await db.execute(sql`
    SELECT * FROM system_announcements
    ORDER BY id DESC
    LIMIT 20
  `);

  const sanitizedUsers = allUsers.map(sanitizeUserRow);
  const factoriesCount = sanitizedUsers.filter((u) => u.accountType === 'factory').length;
  const suppliersCount = sanitizedUsers.filter((u) => u.accountType === 'supplier').length;
  const techniciansCount = sanitizedUsers.filter((u) => u.accountType === 'technician').length;
  const engineersCount = sanitizedUsers.filter((u) => u.accountType === 'engineer').length;
  const tradersCount = sanitizedUsers.filter((u) => u.accountType === 'trader').length;

  return {
    stats: {
      totalUsers: sanitizedUsers.length,
      factoriesCount,
      suppliersCount,
      techniciansCount,
      engineersCount,
      tradersCount,
      totalListings: allListings.length,
      totalRfqs: allRfqs.length + allSupplierRfqs.length,
      totalAcademyEnrollments: allAcademy.length,
      pendingVerifications: ((verificationsRes as any).rows || []).filter(
        (v: any) => v.status === 'pending'
      ).length,
      openReports: ((reportsRes as any).rows || []).filter((r: any) => r.status === 'open')
        .length,
      totalJobApplications: ((jobAppsRes as any).rows || []).length,
    },
    users: sanitizedUsers.slice(0, 40),
    listings: allListings.slice(0, 40),
    rfqs: allRfqs.slice(0, 30),
    supplierRfqs: allSupplierRfqs.slice(0, 30),
    verificationRequests: (verificationsRes as any).rows || [],
    reports: (reportsRes as any).rows || [],
    jobApplications: (jobAppsRes as any).rows || [],
    announcements: (announcementsRes as any).rows || [],
  };
}

export async function reviewVerificationRequestByAdmin(
  requestId: number,
  status: 'verified' | 'rejected',
  rejectionReason: string,
  adminUserId: number
) {
  await ensureExtendedPlatformTables();
  const safeReason = status === 'rejected' ? String(rejectionReason || '').slice(0, 500) : '';

  const res = await db.execute(sql`
    UPDATE verification_requests
    SET status = ${status},
        rejection_reason = ${safeReason},
        reviewed_by = ${adminUserId},
        updated_at = NOW()
    WHERE id = ${requestId}
    RETURNING *
  `);

  const row = (res as any).rows?.[0];
  if (row && row.user_id) {
    await db
      .update(users)
      .set({ verified: status === 'verified' })
      .where(eq(users.id, Number(row.user_id)));
  }
  return row || null;
}

export async function resolvePlatformReportByAdmin(
  reportId: number,
  status: 'resolved' | 'dismissed' = 'resolved'
) {
  await ensureExtendedPlatformTables();
  const res = await db.execute(sql`
    UPDATE platform_reports
    SET status = ${status}
    WHERE id = ${reportId}
    RETURNING *
  `);
  return (res as any).rows?.[0] || null;
}

export async function createSystemAnnouncementByAdmin(
  adminUserId: number,
  titleAr: string,
  bodyAr: string,
  targetRole = 'all'
) {
  await ensureExtendedPlatformTables();
  const res = await db.execute(sql`
    INSERT INTO system_announcements (admin_user_id, title_ar, body_ar, target_role)
    VALUES (${adminUserId}, ${titleAr.slice(0, 180)}, ${bodyAr.slice(0, 1200)}, ${targetRole.slice(0, 40)})
    RETURNING *
  `);
  return (res as any).rows?.[0] || null;
}

export async function listSystemAnnouncements() {
  await ensureExtendedPlatformTables();
  const res = await db.execute(sql`
    SELECT * FROM system_announcements
    ORDER BY id DESC
    LIMIT 15
  `);
  return (res as any).rows || [];
}

// =========================================================================
// REAL DATABASE-BACKED NOTIFICATIONS, COMMENTS, BLOCKS & PUBLIC PROFILES
// =========================================================================

export async function createUserNotificationRecord(input: {
  userId: number;
  type: string;
  titleAr: string;
  titleEn?: string;
  bodyAr: string;
  bodyEn?: string;
  link?: string;
}) {
  const inserted = await db
    .insert(userNotifications)
    .values({
      userId: input.userId,
      type: (input.type || 'general').slice(0, 40),
      titleAr: input.titleAr.slice(0, 180),
      titleEn: (input.titleEn || input.titleAr).slice(0, 180),
      bodyAr: input.bodyAr.slice(0, 600),
      bodyEn: (input.bodyEn || input.bodyAr).slice(0, 600),
      link: (input.link || '/app/notifications').slice(0, 240),
      isRead: false,
    })
    .returning();
  return inserted[0];
}

export async function listUserNotificationsRecords(userId: number) {
  return db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.id))
    .limit(50);
}

export async function markUserNotificationReadRecord(userId: number, notificationId: number) {
  await db
    .update(userNotifications)
    .set({ isRead: true })
    .where(
      and(
        eq(userNotifications.id, notificationId),
        eq(userNotifications.userId, userId)
      )
    );
  return listUserNotificationsRecords(userId);
}

export async function markAllUserNotificationsReadRecord(userId: number) {
  await db
    .update(userNotifications)
    .set({ isRead: true })
    .where(eq(userNotifications.userId, userId));
  return listUserNotificationsRecords(userId);
}

export async function listItemCommentsRecords(itemType?: string, itemId?: string) {
  const rows =
    itemType && itemId
      ? await db
          .select()
          .from(itemComments)
          .where(
            and(
              eq(itemComments.itemType, itemType),
              eq(itemComments.itemId, itemId)
            )
          )
          .orderBy(itemComments.id)
      : await db.select().from(itemComments).orderBy(itemComments.id);

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    authorProfileKey: `usr-${r.userId}`,
    authorName: r.authorName,
    authorRole: r.authorRole || 'engineer',
    authorAvatar: r.authorAvatar || '',
    itemType: r.itemType,
    itemId: r.itemId,
    parentId: r.parentId || null,
    content: r.content,
    createdAt: r.createdAt
      ? r.createdAt.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'الآن',
  }));
}

export async function createItemCommentRecord(
  user: SanitizedUser,
  input: {
    itemType: string;
    itemId: string;
    parentId?: number | null;
    content: string;
  }
) {
  const content = String(input.content || '').trim();
  if (!content) {
    throw new Error('يرجى كتابة نص التعليق.');
  }
  const itemType = String(input.itemType || 'post').trim().slice(0, 40);
  const itemId = String(input.itemId || '').trim().slice(0, 120);

  const inserted = await db
    .insert(itemComments)
    .values({
      userId: user.id,
      authorName: (user.companyName || user.name || 'عضو بلاستيكو').slice(0, 120),
      authorRole: (user.jobTitle || user.specialty || user.accountType || 'engineer').slice(0, 100),
      authorAvatar: (user.avatarUrl || '').slice(0, 500),
      itemType,
      itemId,
      parentId: input.parentId ? Number(input.parentId) : null,
      content: content.slice(0, 1500),
    })
    .returning();

  // If replying to a parent comment, notify the parent author
  if (input.parentId) {
    const parentRows = await db
      .select()
      .from(itemComments)
      .where(eq(itemComments.id, Number(input.parentId)));
    const parent = parentRows[0];
    if (parent && parent.userId !== user.id) {
      await createUserNotificationRecord({
        userId: parent.userId,
        type: 'reply',
        titleAr: 'رد جديد على تعليقك',
        titleEn: 'New Reply to Your Comment',
        bodyAr: `قام ${user.name || 'عضو صناعي'} بالرد على تعليقك: "${content.slice(0, 80)}"`,
        bodyEn: `${user.name || 'Member'} replied to your comment.`,
        link: itemType === 'market' ? `/app/market` : `/app/faults`,
      }).catch(() => {});
    }
  }

  const allForTarget = await listItemCommentsRecords(itemType, itemId);
  return {
    comment: inserted[0],
    comments: allForTarget,
  };
}

export async function listUserBlocksRecords(blockerUserId: number) {
  const rows = await db
    .select()
    .from(userBlocks)
    .where(eq(userBlocks.blockerUserId, blockerUserId))
    .orderBy(desc(userBlocks.id));
  return rows;
}

export async function toggleUserBlockRecord(
  blockerUserId: number,
  targetId: string,
  blockedNameAr = ''
) {
  const cleanTarget = String(targetId || '').trim().slice(0, 120);
  if (!cleanTarget) {
    throw new Error('معرف الحساب المطلوب حظره غير صالح.');
  }

  const existing = await db
    .select()
    .from(userBlocks)
    .where(
      and(
        eq(userBlocks.blockerUserId, blockerUserId),
        eq(userBlocks.blockedTargetId, cleanTarget)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(userBlocks)
      .where(
        and(
          eq(userBlocks.blockerUserId, blockerUserId),
          eq(userBlocks.blockedTargetId, cleanTarget)
        )
      );
    const list = await listUserBlocksRecords(blockerUserId);
    return { blocked: false, blocks: list };
  }

  await db.insert(userBlocks).values({
    blockerUserId,
    blockedTargetId: cleanTarget,
    blockedNameAr: blockedNameAr.slice(0, 160),
  });

  const list = await listUserBlocksRecords(blockerUserId);
  return { blocked: true, blocks: list };
}

export async function getPublicUserProfileRecord(
  identifier: string,
  viewerUserId: number | null
) {
  const rawKey = decodeURIComponent(String(identifier || '').trim());
  const numericId = rawKey.startsWith('usr-')
    ? Number(rawKey.replace('usr-', ''))
    : /^\d+$/.test(rawKey)
    ? Number(rawKey)
    : null;

  let matchedUser: SanitizedUser | null = null;
  if (numericId && numericId > 0) {
    const rows = await db.select().from(users).where(eq(users.id, numericId));
    if (rows[0]) matchedUser = sanitizeUserRow(rows[0]);
  }
  if (!matchedUser) {
    const byUid = await db.select().from(users).where(eq(users.uid, rawKey));
    if (byUid[0]) matchedUser = sanitizeUserRow(byUid[0]);
  }
  if (!matchedUser) {
    const byName = await db
      .select()
      .from(users)
      .where(or(eq(users.name, rawKey), eq(users.companyName, rawKey)));
    if (byName[0]) matchedUser = sanitizeUserRow(byName[0]);
  }

  const allFollows = await db.select().from(userFollows);
  const targetKey = matchedUser ? `usr-${matchedUser.id}` : rawKey;
  const followersCount = allFollows.filter(
    (f) =>
      f.targetId === targetKey ||
      (matchedUser && f.targetId === String(matchedUser.id))
  ).length;
  const followingCount = matchedUser
    ? allFollows.filter((f) => f.followerId === matchedUser!.id).length
    : 0;
  const isFollowing = viewerUserId
    ? allFollows.some(
        (f) =>
          f.followerId === viewerUserId &&
          (f.targetId === targetKey ||
            (matchedUser && f.targetId === String(matchedUser.id)))
      )
    : false;

  let isBlocked = false;
  if (viewerUserId) {
    const blocks = await listUserBlocksRecords(viewerUserId);
    isBlocked = blocks.some((b) => b.blockedTargetId === targetKey || b.blockedTargetId === rawKey);
  }

  const userListings = matchedUser
    ? await db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.userId, matchedUser.id))
        .orderBy(desc(marketplaceListings.id))
    : [];

  if (matchedUser) {
    const prefs = matchedUser.contactPrefs || {};
    const showPhone = prefs.showPhone !== false;
    const allowChat = prefs.allowChat !== false;
    return {
      foundInDb: true,
      targetKey: `usr-${matchedUser.id}`,
      id: matchedUser.id,
      uid: matchedUser.uid,
      name: matchedUser.name,
      companyName: matchedUser.companyName,
      accountType: matchedUser.accountType,
      jobTitle: matchedUser.jobTitle || matchedUser.specialty,
      specialty: matchedUser.specialty,
      bio: matchedUser.bio,
      country: matchedUser.country,
      city: matchedUser.city,
      phone: showPhone ? matchedUser.phone : '',
      email: matchedUser.email,
      verified: matchedUser.verified,
      avatarUrl: matchedUser.avatarUrl,
      skills: matchedUser.skills,
      machines: matchedUser.machines,
      experiences: matchedUser.experiences,
      certificates: matchedUser.certificates,
      experienceYears: matchedUser.experienceYears,
      education: matchedUser.education,
      workPreferences: matchedUser.workPreferences,
      contactPrefs: {
        allowChat,
        showPhone,
        showWhatsapp: prefs.showWhatsapp !== false,
      },
      createdAt: matchedUser.createdAt,
      followersCount,
      followingCount,
      isFollowing,
      isBlocked,
      listings: userListings,
    };
  }

  return {
    foundInDb: false,
    targetKey: rawKey,
    followersCount,
    followingCount: 0,
    isFollowing,
    isBlocked,
    listings: [],
  };
}

export async function searchPlatformDatabaseForAssistant(userQuery: string) {
  const q = String(userQuery || '').trim().toLowerCase();
  const allListings = await db
    .select()
    .from(marketplaceListings)
    .orderBy(desc(marketplaceListings.id))
    .limit(30);
  const allUsers = await db
    .select()
    .from(users)
    .orderBy(desc(users.id))
    .limit(40);
  const allSuppliers = await db
    .select()
    .from(suppliersDirectory)
    .orderBy(desc(suppliersDirectory.id))
    .limit(20);

  const sanitizedUsers = allUsers.map(sanitizeUserRow);

  return {
    query: q,
    listings: allListings.slice(0, 10).map((l) => ({
      id: `db-mkt-${l.id}`,
      titleAr: l.titleAr,
      category: l.category,
      price: l.price,
      currency: l.currency,
      city: l.city,
      isUsed: l.isUsed,
      sellerNameAr: l.sellerNameAr,
    })),
    users: sanitizedUsers.slice(0, 12).map((u) => ({
      id: `usr-${u.id}`,
      name: u.companyName || u.name,
      role: u.accountType,
      specialty: u.jobTitle || u.specialty,
      city: u.city,
      country: u.country,
      skills: u.skills.slice(0, 6),
      verified: u.verified,
    })),
    suppliers: allSuppliers.slice(0, 8).map((s) => ({
      id: `sup-${s.id}`,
      companyNameAr: s.companyNameAr,
      supplierType: s.supplierType,
      city: s.city,
      country: s.country,
      productsServicesAr: s.productsServicesAr,
    })),
  };
}



