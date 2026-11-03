import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  UserCheck,
  Share2,
  Flag,
  Ban,
  Phone,
  Mail,
  Building2,
  Wrench,
  Award,
  ShoppingBag,
  FileText,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import { IndustrialImage } from '../components/IndustrialImage';
import { useThemeAndCurrency } from '../components/ThemeAndCurrencyControls';

export const PublicUserProfilePage: React.FC = () => {
  const { targetId } = useParams<{ targetId: string }>();
  const navigate = useNavigate();
  const {
    t,
    realUser,
    csrfToken,
    market,
    faults,
    jobs,
    suppliers,
    providers,
    expoBooths,
    isFollowing,
    getFollowerCount,
    toggleFollow,
    startOrOpenConversation,
    openLightbox,
    showToast,
    guardVisitorAction,
  } = usePlastico();
  const { formatPrice } = useThemeAndCurrency();

  const [dbProfile, setDbProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'info' | 'listings' | 'posts' | 'jobs'>('info');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);

  const decodedId = useMemo(
    () => decodeURIComponent(String(targetId || '').trim()),
    [targetId]
  );

  // If the user is viewing their own profile ID, offer a direct button or view
  const isOwnProfile = Boolean(
    realUser &&
      (decodedId === `usr-${realUser.id}` ||
        decodedId === String(realUser.id) ||
        decodedId === realUser.uid)
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/users/public/${encodeURIComponent(decodedId)}`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data?.profile) {
          setDbProfile(data.profile);
          setIsBlocked(Boolean(data.profile.isBlocked));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [decodedId]);

  // Resolve complete profile by merging DB user with platform directory/market/community entities
  const resolvedProfile = useMemo(() => {
    if (dbProfile?.foundInDb) {
      const role = dbProfile.accountType || 'engineer';
      const defaultAvatar =
        role === 'factory'
          ? IMAGE_MANIFEST.profiles.factoryOwner
          : role === 'supplier' || role === 'trader'
          ? IMAGE_MANIFEST.profiles.supplierTrader
          : role === 'technician'
          ? IMAGE_MANIFEST.profiles.technician
          : IMAGE_MANIFEST.profiles.engineer;

      return {
        key: dbProfile.targetKey || `usr-${dbProfile.id}`,
        nameAr: dbProfile.companyName || dbProfile.name || 'عضو بلاستيكو الصناعي',
        personNameAr: dbProfile.name || '',
        companyNameAr: dbProfile.companyName || '',
        role: role as 'factory' | 'supplier' | 'trader' | 'engineer' | 'technician',
        roleLabelAr:
          role === 'factory'
            ? 'صاحب مصنع ومنشأة صناعية'
            : role === 'supplier'
            ? 'مورد خامات وماسترباتش ومعدات'
            : role === 'trader'
            ? 'تاجر ماكينات ومعدات صناعية'
            : role === 'technician'
            ? 'فني تشغيل وصيانة بلاستيك'
            : 'مهندس صناعات بلاستيكية وبوليمرات',
        jobTitleAr:
          dbProfile.jobTitle ||
          dbProfile.specialty ||
          (role === 'factory' ? 'إدارة المصنع والتشغيل' : 'متخصص صناعي معتمد'),
        avatar:
          dbProfile.avatarUrl && dbProfile.avatarUrl.trim()
            ? dbProfile.avatarUrl
            : defaultAvatar,
        country: dbProfile.country || 'مصر',
        city: dbProfile.city || 'العاشر من رمضان',
        bioAr:
          dbProfile.bio ||
          'حساب صناعي مسجل على منصة PLASTICO للتواصل المهني والتجاري في قطاع صناعة البلاستيك.',
        verified: Boolean(dbProfile.verified),
        phone: dbProfile.phone || '',
        email: dbProfile.email || '',
        experienceYears: Number(dbProfile.experienceYears || 5),
        education: dbProfile.education || 'مؤهل صناعي / هندسي متخصص',
        workPreferences: dbProfile.workPreferences || 'دوام كامل / استشارات فنية',
        skills:
          Array.isArray(dbProfile.skills) && dbProfile.skills.length > 0
            ? dbProfile.skills
            : role === 'supplier'
            ? ['خامات PP', 'خامات PE', 'خامات PET', 'ماسترباتش ألوان', 'توريد محلي ودولي']
            : ['تشغيل ماكينات الحقن', 'ضبط القوالب', 'مراقبة الجودة'],
        machines:
          Array.isArray(dbProfile.machines) && dbProfile.machines.length > 0
            ? dbProfile.machines
            : ['Haitian MA-2500', 'Engel Victory', 'خطوط سحب ونفخ'],
        experiences: Array.isArray(dbProfile.experiences) ? dbProfile.experiences : [],
        certificates:
          Array.isArray(dbProfile.certificates) && dbProfile.certificates.length > 0
            ? dbProfile.certificates
            : ['شهادة سلامة وجودة صناعية ISO-9001'],
        contactPrefs: dbProfile.contactPrefs || {
          allowChat: true,
          showPhone: true,
          showWhatsapp: true,
        },
        baseFollowers: Number(dbProfile.followersCount || 18),
        followingCount: Number(dbProfile.followingCount || 6),
      };
    }

    // Check Suppliers Directory
    const cleanSupId = decodedId.replace(/^(sup-)+/, '');
    const matchedSupplier = suppliers.find(
      (s) =>
        s.id === decodedId ||
        s.id === cleanSupId ||
        s.id === `sup-${cleanSupId}` ||
        `sup-${s.id}` === decodedId ||
        s.companyNameAr === decodedId
    );
    if (matchedSupplier) {
      const normalizedKey = matchedSupplier.id.startsWith('sup-')
        ? matchedSupplier.id
        : `sup-${matchedSupplier.id}`;
      return {
        key: normalizedKey,
        nameAr: matchedSupplier.companyNameAr,
        personNameAr: matchedSupplier.companyNameAr,
        companyNameAr: matchedSupplier.companyNameAr,
        role: 'supplier' as const,
        roleLabelAr: matchedSupplier.supplierTypeLabelAr || 'مورد صناعي معتمد',
        jobTitleAr: matchedSupplier.supplierTypeLabelAr || 'توريد خامات ومعدات صناعية',
        avatar: matchedSupplier.logo || IMAGE_MANIFEST.profiles.supplierTrader,
        country: matchedSupplier.country || 'مصر',
        city: matchedSupplier.city || 'العاشر من رمضان',
        bioAr: matchedSupplier.descriptionAr,
        verified: Boolean(matchedSupplier.isVerified),
        phone: matchedSupplier.contactPhone || '+20 100 245 8890',
        email: matchedSupplier.contactEmail || 'sales@plastico-supplier.com',
        experienceYears: 12,
        education: 'وكيل وموزع صناعي معتمد',
        workPreferences: 'توريد بالطن والكميات للمصانع',
        skills: matchedSupplier.categoriesAr || [
          'خامات PP',
          'خامات PE',
          'ماسترباتش ألوان',
          'توريد الخامات محليًا ودوليًا',
        ],
        machines: matchedSupplier.brandsSupplied || ['SABIC', 'Borouge'],
        experiences: matchedSupplier.productsServicesAr || [],
        certificates: ['شهادة تحليل خامات COA', 'مورد موثق في بلاستيكو'],
        contactPrefs: { allowChat: true, showPhone: true, showWhatsapp: true },
        baseFollowers: 64,
        followingCount: 14,
      };
    }

    // Check Factory Providers & Exhibition Booths
    const matchedProvider = providers.find(
      (p) => p.id === decodedId || p.nameAr === decodedId
    );
    const matchedBooth = expoBooths.find(
      (b) => b.id === decodedId || b.companyNameAr === decodedId
    );
    if (matchedProvider || matchedBooth) {
      const nameAr =
        matchedProvider?.nameAr ||
        matchedBooth?.companyNameAr ||
        'مصنع بلاستيكو المعتمد';
      return {
        key: matchedProvider?.id || matchedBooth?.id || decodedId,
        nameAr,
        personNameAr: nameAr,
        companyNameAr: nameAr,
        role: 'factory' as const,
        roleLabelAr: 'مصنع بلاستيك وتشغيل للغير',
        jobTitleAr: matchedProvider?.servicesOfferedAr?.[0] || matchedBooth?.taglineAr || 'تصنيع وحقن ونفخ البلاستيك',
        avatar:
          matchedProvider?.coverImage ||
          matchedBooth?.bannerImage ||
          IMAGE_MANIFEST.profiles.factoryOwner,
        country: 'مصر',
        city: matchedProvider?.city || matchedBooth?.city || 'العاشر من رمضان',
        bioAr:
          matchedProvider?.descriptionAr ||
          matchedBooth?.descriptionAr ||
          'مصنع متكامل لتشغيل وتصنيع المنتجات البلاستيكية للغير بأعلى معايير الجودة.',
        verified: true,
        phone: '+20 100 450 9920',
        email: 'factory@plastico-industry.com',
        experienceYears: 15,
        education: 'منشأة صناعية مرخصة ISO 9001',
        workPreferences: 'تصنيع للغير وتوريد عقود شهرية وسنوية',
        skills: matchedProvider?.servicesOfferedAr || [
          'حقن بلاستيك دقيق',
          'نفخ عبوات HDPE / PET',
          'تصنيع وصيانة القوالب',
        ],
        machines: [
          '12 خط حقن Haitian & Engel (120T - 650T)',
          '4 خطوط نفخ عبوات أوتوماتيكية',
        ],
        experiences: [],
        certificates: ['ISO 9001:2015', 'شهادة مطابقة المواصفات القياسية'],
        contactPrefs: { allowChat: true, showPhone: true, showWhatsapp: true },
        baseFollowers: 85,
        followingCount: 19,
      };
    }

    // Check Marketplace Seller or Fault Publisher
    const matchedMarketSeller = market.find(
      (m) => m.sellerId === decodedId || m.sellerNameAr === decodedId
    );
    const matchedFaultAuthor = faults.find(
      (f) => f.publisherId === decodedId || f.publisherName === decodedId
    );

    const fallbackName =
      matchedMarketSeller?.sellerNameAr ||
      matchedFaultAuthor?.publisherName ||
      (decodedId.startsWith('usr-') ? `عضو صناعي #${decodedId.replace('usr-', '')}` : decodedId);
    const fallbackRoleLabel =
      matchedMarketSeller?.sellerTypeAr ||
      matchedFaultAuthor?.publisherRoleAr ||
      'مهندس / متخصص صناعي في بلاستيكو';
    const isSupplierLike =
      fallbackRoleLabel.includes('مورد') ||
      fallbackRoleLabel.includes('تاجر') ||
      fallbackRoleLabel.includes('شركة');
    const isFactoryLike = fallbackRoleLabel.includes('مصنع');
    const isTechLike = fallbackRoleLabel.includes('فني');

    return {
      key: decodedId,
      nameAr: fallbackName,
      personNameAr: fallbackName,
      companyNameAr: isSupplierLike || isFactoryLike ? fallbackName : '',
      role: (isFactoryLike
        ? 'factory'
        : isSupplierLike
        ? 'supplier'
        : isTechLike
        ? 'technician'
        : 'engineer') as 'factory' | 'supplier' | 'trader' | 'engineer' | 'technician',
      roleLabelAr: fallbackRoleLabel,
      jobTitleAr: fallbackRoleLabel,
      avatar:
        matchedMarketSeller?.sellerAvatar ||
        matchedFaultAuthor?.publisherAvatar ||
        IMAGE_MANIFEST.profiles.engineer,
      country: matchedMarketSeller?.country || 'مصر',
      city: matchedMarketSeller?.city || matchedFaultAuthor?.city || 'العاشر من رمضان',
      bioAr:
        'عضو فاعل في منظومة PLASTICO الصناعية، متخصص في حلول تشغيل وصيانة وتوريد خطوط صناعة البلاستيك.',
      verified: true,
      phone: matchedMarketSeller?.sellerPhone || '+20 100 245 8890',
      email: '',
      experienceYears: 8,
      education: 'خبرة ميدانية معتمدة في قطاع البلاستيك',
      workPreferences: 'متاح للتعاون الفني والتجاري عبر المنصة',
      skills: isSupplierLike
        ? ['خامات PP', 'خامات PE', 'ماسترباتش ألوان', 'توريد معدات وقطع غيار']
        : ['تشغيل ماكينات الحقن', 'تشخيص الأعطال', 'ضبط الجودة'],
      machines: ['Haitian MA Series', 'Engel Victory', 'خطوط سحب ونفخ'],
      experiences: [],
      certificates: ['عضو موثق في مجتمع بلاستيكو الصناعي'],
      contactPrefs: { allowChat: true, showPhone: true, showWhatsapp: true },
      baseFollowers: 42,
      followingCount: 11,
    };
  }, [dbProfile, decodedId, suppliers, providers, expoBooths, market, faults]);

  const userListings = useMemo(() => {
    return market.filter(
      (m) =>
        m.sellerId === resolvedProfile.key ||
        m.sellerId === decodedId ||
        m.sellerNameAr === resolvedProfile.nameAr
    );
  }, [market, resolvedProfile, decodedId]);

  const userPosts = useMemo(() => {
    return faults.filter(
      (f) =>
        f.publisherId === resolvedProfile.key ||
        f.publisherId === decodedId ||
        f.publisherName === resolvedProfile.nameAr
    );
  }, [faults, resolvedProfile, decodedId]);

  const userJobs = useMemo(() => {
    return jobs.filter(
      (j) =>
        j.companyName === resolvedProfile.nameAr ||
        j.factoryNameAr === resolvedProfile.nameAr
    );
  }, [jobs, resolvedProfile]);

  const following = isFollowing(resolvedProfile.key);
  const followersCount = getFollowerCount(
    resolvedProfile.key,
    resolvedProfile.baseFollowers
  );

  const handleStartMessage = async () => {
    if (!resolvedProfile.contactPrefs?.allowChat) {
      showToast(
        'هذا المستخدم قام بتقييد استقبال الرسائل المباشرة في إعدادات الخصوصية.',
        'This user has restricted direct messages in privacy settings.'
      );
      return;
    }
    const cid = await startOrOpenConversation({
      targetKey: resolvedProfile.key,
      targetNameAr: resolvedProfile.nameAr,
      targetRoleAr: resolvedProfile.roleLabelAr,
      targetAvatar: resolvedProfile.avatar,
      contextType: 'profile',
      contextId: resolvedProfile.key,
      contextTitleAr: `تواصل مباشر عبر الملف الشخصي: ${resolvedProfile.nameAr}`,
    });
    if (cid) {
      navigate(`/app/messages?convId=${cid}`);
    }
  };

  const handleShareProfile = async () => {
    const shareUrl = `${window.location.origin}/app/profile/${encodeURIComponent(
      resolvedProfile.key
    )}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resolvedProfile.nameAr} — PLASTICO`,
          text: `${resolvedProfile.nameAr} (${resolvedProfile.roleLabelAr}) على منصة بلاستيكو الصناعية`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast(
        'تم نسخ رابط الملف الشخصي لمشاركته بنجاح!',
        'Profile link copied to clipboard!'
      );
    } catch {
      showToast(shareUrl, shareUrl);
    }
  };

  const handleToggleBlock = async () => {
    if (!guardVisitorAction('حظر حساب مستخدم')) return;
    try {
      const res = await fetch('/api/users/block', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          targetId: resolvedProfile.key,
          targetNameAr: resolvedProfile.nameAr,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsBlocked(Boolean(data.blocked));
        showToast(
          data.blocked
            ? `تم حظر الحساب (${resolvedProfile.nameAr}) بنجاح.`
            : `تم إلغاء حظر الحساب (${resolvedProfile.nameAr}).`,
          data.blocked ? 'Account blocked' : 'Account unblocked'
        );
      }
    } catch {
      showToast('تعذر تحديث حالة الحظر حالياً.');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardVisitorAction('الإبلاغ عن حساب')) return;
    if (!reportReason.trim()) return;
    setSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          targetType: 'user_profile',
          targetId: resolvedProfile.key,
          targetTitleAr: resolvedProfile.nameAr,
          reason: reportReason.trim(),
        }),
      });
      if (res.ok) {
        showToast(
          'تم إرسال البلاغ إلى إدارة المنصة للمراجعة بنجاح.',
          'Report submitted to moderation team.'
        );
        setShowReportModal(false);
        setReportReason('');
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#DFE7F1] p-8 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#F4F7FC] animate-pulse mx-auto" />
        <p className="text-xs font-extrabold text-[#718096]">
          {t('جاري تحميل الملف الشخصي الصناعي...', 'Loading industrial profile...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5" data-testid="public-user-profile-page">
      {/* Top Back Bar */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B] hover:border-[#1769E8] cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 rtl:rotate-0 ltr:rotate-180 text-[#1769E8]" />
          <span>{t('الرجوع للصفحة السابقة', 'Back')}</span>
        </button>

        {isOwnProfile && (
          <Link
            to="/app/profile"
            className="px-4 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold"
          >
            {t('تعديل ملفي الشخصي ولوحة التحكم', 'Edit My Profile & Workspace')}
          </Link>
        )}
      </div>

      {/* Hero Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#DFE7F1] overflow-hidden shadow-xs">
        <div className="h-28 sm:h-36 bg-gradient-to-l from-[#071A33] via-[#0E2952] to-[#1769E8] relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#27BED6_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-3 end-3 flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-[#071A33]/85 text-[#27BED6] text-[11px] font-extrabold border border-[#27BED6]/30">
              {resolvedProfile.roleLabelAr}
            </span>
          </div>
        </div>

        <div className="px-5 sm:px-7 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-3 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <img
                src={resolvedProfile.avatar}
                alt={resolvedProfile.nameAr}
                onClick={() =>
                  openLightbox([resolvedProfile.avatar], 0, resolvedProfile.nameAr)
                }
                className="-mt-14 sm:-mt-16 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-[#F4F7FC] cursor-zoom-in shrink-0"
              />
              <div className="space-y-1 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#071A33]">
                    {resolvedProfile.nameAr}
                  </h1>
                  {resolvedProfile.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t('حساب موثق', 'Verified')}</span>
                    </span>
                  )}
                  {isBlocked && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-extrabold">
                      {t('محظور', 'Blocked')}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#1769E8]">
                  {resolvedProfile.jobTitleAr}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#1769E8]" />
                    <span>
                      {resolvedProfile.city}، {resolvedProfile.country}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#FF8A2A]" />
                    <span>
                      {t('الخبرة:', 'Experience:')} {resolvedProfile.experienceYears}{' '}
                      {t('سنوات', 'yrs')}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {!isOwnProfile && (
                <>
                  <button
                    type="button"
                    data-testid="public-profile-follow-btn"
                    onClick={() =>
                      void toggleFollow({
                        targetId: resolvedProfile.key,
                        targetType: resolvedProfile.role,
                        targetNameAr: resolvedProfile.nameAr,
                        targetRoleAr: resolvedProfile.roleLabelAr,
                        targetAvatar: resolvedProfile.avatar,
                      })
                    }
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      following
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#1769E8] hover:bg-[#1258C7] text-white shadow-xs'
                    }`}
                  >
                    {following ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>{t('متابَع ✓', 'Following ✓')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>{t('متابعة الحساب', 'Follow')}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    data-testid="public-profile-message-btn"
                    onClick={() => void handleStartMessage()}
                    className="px-4 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0E2952] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#27BED6]" />
                    <span>{t('إرسال رسالة', 'Send Message')}</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => void handleShareProfile()}
                className="p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-slate-200/70 text-[#13243B] border border-[#DFE7F1] cursor-pointer"
                title={t('مشاركة الملف الشخصي', 'Share Profile')}
              >
                <Share2 className="w-4 h-4" />
              </button>

              {!isOwnProfile && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-rose-50 text-[#718096] hover:text-rose-600 border border-[#DFE7F1] cursor-pointer"
                    title={t('الإبلاغ عن الحساب', 'Report Account')}
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleToggleBlock()}
                    className={`p-2.5 rounded-xl border cursor-pointer ${
                      isBlocked
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-[#F4F7FC] hover:bg-rose-50 text-[#718096] hover:text-rose-600 border-[#DFE7F1]'
                    }`}
                    title={
                      isBlocked
                        ? t('إلغاء حظر الحساب', 'Unblock Account')
                        : t('حظر الحساب', 'Block Account')
                    }
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-[#DFE7F1]">
            <div className="p-3 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] text-center">
              <div className="text-base sm:text-lg font-black text-[#071A33] font-mono-num">
                {followersCount}
              </div>
              <div className="text-[11px] font-bold text-[#718096]">
                {t('متابعون', 'Followers')}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] text-center">
              <div className="text-base sm:text-lg font-black text-[#071A33] font-mono-num">
                {resolvedProfile.followingCount}
              </div>
              <div className="text-[11px] font-bold text-[#718096]">
                {t('يتابع', 'Following')}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] text-center">
              <div className="text-base sm:text-lg font-black text-[#1769E8] font-mono-num">
                {userListings.length}
              </div>
              <div className="text-[11px] font-bold text-[#718096]">
                {t('عروض ومنتجات', 'Listings')}
              </div>
            </div>
            <div className="hidden sm:block p-3 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] text-center">
              <div className="text-base sm:text-lg font-black text-emerald-700 font-mono-num">
                {userPosts.length}
              </div>
              <div className="text-[11px] font-bold text-[#718096]">
                {t('مساهمات فنية', 'Posts')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          {
            id: 'info',
            labelAr:
              resolvedProfile.role === 'factory' ||
              resolvedProfile.role === 'supplier' ||
              resolvedProfile.role === 'trader'
                ? 'البيانات التجارية والصناعية'
                : 'المعلومات المهنية والخبرات',
            labelEn: 'Professional & Industrial Info',
            icon: Building2,
          },
          {
            id: 'listings',
            labelAr: `المنتجات والإعلانات (${userListings.length})`,
            labelEn: `Products & Listings (${userListings.length})`,
            icon: ShoppingBag,
          },
          {
            id: 'posts',
            labelAr: `المنشورات والمساهمات (${userPosts.length})`,
            labelEn: `Posts & Solutions (${userPosts.length})`,
            icon: FileText,
          },
          ...(resolvedProfile.role === 'factory'
            ? [
                {
                  id: 'jobs',
                  labelAr: `الوظائف المتاحة (${userJobs.length})`,
                  labelEn: `Open Jobs (${userJobs.length})`,
                  icon: Briefcase,
                },
              ]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'bg-[#071A33] text-white shadow-xs'
                  : 'bg-white text-[#13243B] border border-[#DFE7F1] hover:border-[#1769E8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-[#27BED6]" />
              <span>{t(tab.labelAr, tab.labelEn)}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Role-Specific Professional / Commercial Details */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
              <h2 className="text-sm font-black text-[#071A33]">
                {resolvedProfile.role === 'factory'
                  ? t('نبذة عن المصنع والقدرات الإنتاجية', 'About Factory & Production Capacity')
                  : resolvedProfile.role === 'supplier' || resolvedProfile.role === 'trader'
                  ? t('نبذة عن نشاط التوريد والتجارة الصناعية', 'About Supply & Trading Operations')
                  : t('النبذة المهنية والتخصص الفني', 'Professional Summary & Specialty')}
              </h2>
              <p className="text-xs sm:text-sm text-[#13243B] leading-relaxed">
                {resolvedProfile.bioAr}
              </p>
            </div>

            {/* Role-Tailored Skills / Supplied Materials / Capabilities */}
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
              <h3 className="text-sm font-black text-[#071A33] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#1769E8]" />
                <span>
                  {resolvedProfile.role === 'supplier'
                    ? t('الخامات والماسترباتش والتوريدات المتاحة:', 'Supplied Resins & Masterbatch:')
                    : resolvedProfile.role === 'factory'
                    ? t('التخصصات الصناعية وخطوط الإنتاج:', 'Production Lines & Capabilities:')
                    : t('المهارات الفنية والتخصصات الدقيقة:', 'Technical Skills & Competencies:')}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {resolvedProfile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Machines / Brands / Systems */}
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
              <h3 className="text-sm font-black text-[#071A33] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FF8A2A]" />
                <span>
                  {resolvedProfile.role === 'supplier'
                    ? t('العلامات التجارية والدرجات الموردة:', 'Brands & Polymer Grades:')
                    : resolvedProfile.role === 'engineer'
                    ? t('الأنظمة والماكينات والبرامج الهندسية:', 'Engineering Systems & Machinery:')
                    : t('الماكينات وخطوط التشغيل:', 'Machinery & Production Lines:')}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {resolvedProfile.machines.map((m: string) => (
                  <div
                    key={m}
                    className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center gap-2 text-xs font-bold text-[#13243B]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1769E8] shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Contact & Verification Info */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
              <h3 className="text-sm font-black text-[#071A33]">
                {t('بيانات التواصل والعمل', 'Contact & Work Info')}
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <span className="text-[#718096] block mb-0.5">
                    {t('الموقع الجغرافي', 'Location')}
                  </span>
                  <span className="font-extrabold text-[#13243B]">
                    {resolvedProfile.city}، {resolvedProfile.country}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <span className="text-[#718096] block mb-0.5">
                    {resolvedProfile.role === 'factory' || resolvedProfile.role === 'supplier'
                      ? t('نطاق التوريد والتشغيل', 'Supply & Operations Scope')
                      : t('تفضيلات العمل والتعاقد', 'Work Preferences')}
                  </span>
                  <span className="font-extrabold text-[#13243B]">
                    {resolvedProfile.workPreferences}
                  </span>
                </div>

                {resolvedProfile.contactPrefs?.showPhone && resolvedProfile.phone ? (
                  <a
                    href={`tel:${resolvedProfile.phone}`}
                    className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between hover:border-[#1769E8]"
                  >
                    <span className="inline-flex items-center gap-2 font-extrabold text-[#13243B]">
                      <Phone className="w-4 h-4 text-[#1769E8]" />
                      <span className="font-mono-num">{resolvedProfile.phone}</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-[#1769E8]">
                      {t('اتصال', 'Call')}
                    </span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-[#718096]">
                    {t(
                      'رقم الهاتف متاح عبر المراسلة المباشرة داخل المنصة',
                      'Phone available via in-app chat'
                    )}
                  </div>
                )}

                {resolvedProfile.email && (
                  <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#1769E8] shrink-0" />
                    <span className="font-mono-num text-[#13243B] truncate">
                      {resolvedProfile.email}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleStartMessage()}
                className="w-full py-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('بدء محادثة مباشرة الآن', 'Start Direct Chat Now')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User's Marketplace Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {userListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center space-y-2">
              <ShoppingBag className="w-8 h-8 text-[#718096] mx-auto" />
              <p className="text-sm font-extrabold text-[#13243B]">
                {t(
                  'لا توجد إعلانات أو منتجات منشورة حالياً لهذا الحساب.',
                  'No active listings published by this account yet.'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#DFE7F1] overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() =>
                        openLightbox(
                          item.images && item.images.length > 0
                            ? item.images
                            : [item.image],
                          0,
                          item.titleAr
                        )
                      }
                      className="cursor-zoom-in"
                    >
                      <IndustrialImage
                        src={item.image}
                        alt={item.titleAr}
                        aspectClass="aspect-[16/10]"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[11px] font-extrabold text-[#1769E8]">
                        {item.conditionAr} · {item.city}
                      </span>
                      <h3 className="text-sm font-extrabold text-[#13243B] line-clamp-2">
                        {item.titleAr}
                      </h3>
                      <div className="text-base font-black text-[#1769E8] font-mono-num">
                        {t(
                          formatPrice(item.price, item.currency).formattedAr,
                          formatPrice(item.price, item.currency).formattedEn
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <Link
                      to={`/app/market?q=${encodeURIComponent(item.titleAr)}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#F4F7FC] text-[#13243B] text-xs font-extrabold text-center"
                    >
                      {t('عرض في السوق', 'View in Market')}
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        const cid = await startOrOpenConversation({
                          targetKey: resolvedProfile.key,
                          targetNameAr: resolvedProfile.nameAr,
                          targetRoleAr: resolvedProfile.roleLabelAr,
                          targetAvatar: resolvedProfile.avatar,
                          contextType: 'market',
                          contextId: item.id,
                          contextTitleAr: `${item.titleAr} — ${formatPrice(
                            item.price,
                            item.currency
                          )}`,
                        });
                        if (cid) {
                          navigate(
                            `/app/messages?convId=${cid}&prefill=${encodeURIComponent(
                              'مرحبًا، أنا مهتم بالإعلان ده. ممكن أعرف تفاصيل أكتر؟'
                            )}&listingId=${encodeURIComponent(item.id)}`
                          );
                        }
                      }}
                      className="py-2 px-3 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold cursor-pointer"
                    >
                      {t('تواصل مع البائع', 'Contact Seller')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Community Posts & Fault Solutions */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-[#718096] mx-auto" />
              <p className="text-sm font-extrabold text-[#13243B]">
                {t(
                  'لا توجد منشورات عامة مسجلة حالياً.',
                  'No public posts recorded yet.'
                )}
              </p>
            </div>
          ) : (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[#718096]">
                  <span className="font-extrabold text-[#1769E8]">
                    {post.machineType} · {post.polymerMaterial}
                  </span>
                  <span>{post.createdAt}</span>
                </div>
                <Link
                  to={`/app/faults/${post.id}`}
                  className="block text-base font-black text-[#071A33] hover:text-[#1769E8]"
                >
                  {post.titleAr}
                </Link>
                <p className="text-xs text-[#4A5B73] line-clamp-2">
                  {post.descriptionAr}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Open Factory Jobs */}
      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {userJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center">
              <p className="text-sm font-extrabold text-[#13243B]">
                {t('لا توجد وظائف معلنة حالياً.', 'No open jobs right now.')}
              </p>
            </div>
          ) : (
            userJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-[#DFE7F1] p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-black text-[#071A33]">{job.titleAr}</h4>
                  <p className="text-xs text-[#718096]">
                    {job.city} · {job.salaryRange}
                  </p>
                </div>
                <Link
                  to="/app/jobs"
                  className="px-4 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold"
                >
                  {t('عرض الوظيفة', 'View Job')}
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {/* Report Account Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitReport}
            className="bg-white rounded-2xl border border-[#DFE7F1] max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#071A33]">
                {t('الإبلاغ عن حساب مخالف', 'Report Account')}
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-[#718096]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-[#718096]">
              {t('الحساب المبلغ عنه:', 'Reported Account:')}{' '}
              <strong className="text-[#13243B]">{resolvedProfile.nameAr}</strong>
            </p>
            <textarea
              required
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder={t(
                'اذكر سبب البلاغ بالتفصيل (مثل: بيانات مضللة، انتحال صفة، إزعاج)...',
                'Describe the reason for reporting this account...'
              )}
              className="w-full input-3d rounded-xl p-3 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F4F7FC] text-xs font-bold text-[#13243B]"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold cursor-pointer"
              >
                {submittingReport
                  ? t('جاري الإرسال...', 'Sending...')
                  : t('إرسال البلاغ للإدارة', 'Submit Report')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
export default PublicUserProfilePage;
