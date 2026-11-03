import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  MapPin,
  Award,
  Wrench,
  Bell,
  Settings as SettingsIcon,
  RotateCcw,
  Bookmark,
  Send,
  LogIn,
  Save,
  Building2,
  Phone,
  Mail,
  Camera,
  Trash2,
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Heart,
  ExternalLink,
  Image as ImageIcon,
  ArrowRight,
  Plus,
  Calendar,
  Cpu,
  ShieldCheck,
  X,
  Volume2,
  VolumeX,
  Search,
  Reply,
  LayoutDashboard,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { AccountType, UserRole } from '../types/plastico';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { IndustrialImage } from '../components/IndustrialImage';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import { useThemeAndCurrency } from '../components/ThemeAndCurrencyControls';
import {
  SupplierPremiumDashboardSection,
  InteractiveRfqSection,
} from '../components/RfqAndSupplierSections';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  ROLE_SKILLS_OPTIONS,
  RoleExtendedMetadata,
  getRoleSectionTitles,
  parseRoleExtendedMetadata,
  sanitizeRoleSkills,
  serializeRoleExtendedMetadata,
} from '../data/roleFieldsConfig';

export function playLocalNotificationChime(volume = 0.7) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(Math.max(0.05, Math.min(1, volume)) * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    gain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.14); // A5
    osc1.connect(gain);
    osc1.start(now);
    osc1.stop(now + 0.55);
  } catch {
    // ignore audio autoplay restrictions
  }
}

function resizeImageFileToDataUrl(file: File, maxDim = 360): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height >= width && height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================================================================
   REAL AUTHENTICATED PROFILE PAGE (/app/profile & /app/profile/edit)
   Persists updates & avatar upload to Cloud SQL via PUT /api/profile
   ============================================================================ */
export const ProfilePage: React.FC = () => {
  const {
    lang,
    t,
    isAuthenticated,
    authLoading,
    realUser,
    currentUser,
    saveRealProfileUpdate,
    academyProgressMap,
    followersCount,
    followingCount,
    followersList,
    followingList,
    toggleFollow,
    startOrOpenConversation,
    openLightbox,
    market,
    faults,
    showToast,
  } = usePlastico();
  const { formatPrice } = useThemeAndCurrency();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [showRoleControlPanel, setShowRoleControlPanel] = useState(true);
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('engineer');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('مصر');
  const [city, setCity] = useState('العاشر من رمضان');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [roleMeta, setRoleMeta] = useState<RoleExtendedMetadata>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsText, setSkillsText] = useState('');
  const [machinesText, setMachinesText] = useState('');
  const [certificatesText, setCertificatesText] = useState('');
  const [experiences, setExperiences] = useState<
    Array<{ title: string; company: string; years: string }>
  >([]);
  const [contactPrefs, setContactPrefs] = useState({
    allowChat: true,
    showPhone: true,
    showWhatsapp: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (realUser) {
      const userRole = (realUser.accountType as AccountType) || 'engineer';
      const cleanedSkills = sanitizeRoleSkills(userRole, realUser.skills || []);
      const parsedMeta = parseRoleExtendedMetadata(realUser.workPreferences);

      setName(realUser.name || '');
      setAccountType(userRole);
      setAvatarUrl(realUser.avatarUrl || currentUser.avatar || '');
      setJobTitle(realUser.jobTitle || realUser.specialty || '');
      setSpecialty(realUser.specialty || '');
      setCompanyName(realUser.companyName || '');
      setCountry(realUser.country || 'مصر');
      setCity(realUser.city || 'العاشر من رمضان');
      setPhone(realUser.phone || '');
      setExperienceYears(realUser.experienceYears || 0);
      setBio(realUser.bio || '');
      setEducation(realUser.education || '');
      setRoleMeta(parsedMeta);
      setSelectedSkills(cleanedSkills);
      setSkillsText(cleanedSkills.join('، '));
      setMachinesText(
        (realUser.machines && realUser.machines.length > 0
          ? realUser.machines
          : userRole === 'supplier'
          ? ['SABIC', 'Borouge', 'Tasnee']
          : ['Haitian MA-2500', 'Engel Victory']
        ).join('، ')
      );
      setCertificatesText((realUser.certificates || []).join('، '));
      setExperiences(
        realUser.experiences && realUser.experiences.length > 0
          ? realUser.experiences
          : [
              {
                title: realUser.jobTitle || realUser.specialty || 'مهندس تشغيل وصيانة',
                company: realUser.companyName || 'مصنع الدلتا للصناعات البلاستيكية',
                years: '2021 - حتى الآن',
              },
            ]
      );
      setContactPrefs(
        realUser.contactPrefs || {
          allowChat: true,
          showPhone: true,
          showWhatsapp: true,
        }
      );
    }
  }, [realUser, currentUser.avatar]);

  if (authLoading) {
    return (
      <div className="p-10 text-center text-sm font-bold text-[#718096]">
        {t('جاري التحقق من جلسة الحساب...', 'Verifying account session...')}
      </div>
    );
  }

  if (!isAuthenticated || !realUser) {
    return (
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center space-y-4 max-w-lg mx-auto my-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-[#13243B]">
          {t(
            'يرجى تسجيل الدخول للوصول إلى ملفك الشخصي ولوحة حسابك',
            'Please Sign In to Access Your Profile'
          )}
        </h1>
        <p className="text-xs text-[#718096] leading-relaxed">
          {t(
            'هذه الصفحة محمية وتتطلب حساباً موثقاً في قاعدة بيانات بلاستيكو لعرض أو تعديل بياناتك المهنية ورفع صورتك الشخصية.',
            'This page is protected and requires an authenticated PLASTICO session.'
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/auth/login?redirect=/app/profile"
            className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('تسجيل الدخول', 'Sign In')}</span>
          </Link>
          <Link
            to="/auth/register"
            className="px-5 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold"
          >
            {t('إنشاء حساب جديد', 'Create Account')}
          </Link>
        </div>
      </div>
    );
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP).');
      return;
    }
    try {
      const dataUrl = await resizeImageFileToDataUrl(file, 360);
      setAvatarUrl(dataUrl);
      if (!isEditing) {
        await saveRealProfileUpdate({ avatarUrl: dataUrl });
      } else {
        showToast('تم تجهيز الصورة الجديدة، اضغط حفظ التغييرات لاعتمادها.');
      }
    } catch {
      showToast('حدث خطأ أثناء قراءة ملف الصورة.');
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl('');
    if (!isEditing) {
      await saveRealProfileUpdate({ avatarUrl: '' });
    }
  };

  const toggleSkillTag = (sk: string) => {
    setSelectedSkills((prev) => {
      const next = prev.includes(sk) ? prev.filter((x) => x !== sk) : [...prev, sk];
      setSkillsText(next.join('، '));
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const manualSkills = skillsText
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const mergedSkills = Array.from(new Set([...selectedSkills, ...manualSkills]));
    const parsedSkills = sanitizeRoleSkills(accountType, mergedSkills);

    const parsedMachines = machinesText
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedCerts = certificatesText
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const serializedWorkPrefs = serializeRoleExtendedMetadata(roleMeta);

    const res = await saveRealProfileUpdate({
      name,
      accountType,
      avatarUrl,
      jobTitle: jobTitle || specialty,
      specialty,
      companyName,
      country,
      city,
      phone,
      experienceYears,
      bio,
      education,
      workPreferences: serializedWorkPrefs,
      skills: parsedSkills,
      machines: parsedMachines,
      experiences: experiences.filter((ex) => ex.title.trim() || ex.company.trim()),
      certificates: parsedCerts,
      contactPrefs,
    });
    setSaving(false);
    if (res.ok) {
      setIsEditing(false);
    }
  };

  const earnedCertificates = Object.values(academyProgressMap).filter(
    (p) => Boolean(p.certificateCode)
  );

  const displayedAvatar = avatarUrl || currentUser.avatar || IMAGE_MANIFEST.profiles.engineer;
  const userListings = market.filter(
    (m) => m.sellerId === `usr-${realUser.id}` || m.sellerNameAr === realUser.name
  );
  const userFaults = faults.filter((f) => f.publisherName === realUser.name);

  const roleLabels = getRoleSectionTitles(accountType);
  const availableRoleSkills = ROLE_SKILLS_OPTIONS[accountType] || ROLE_SKILLS_OPTIONS.engineer;
  const displayedSkills = sanitizeRoleSkills(
    (realUser.accountType as AccountType) || 'engineer',
    currentUser.skills || []
  );
  const savedRoleMeta = parseRoleExtendedMetadata(realUser.workPreferences);

  return (
    <div className="space-y-6">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* My Account Quick Hub (مساحة حسابي — إدارة حسابك ونشاطك) matching Reference UI */}
      <div
        data-testid="my-account-workspace-hub"
        className="bg-[#071A33] text-white rounded-3xl p-5 sm:p-6 border border-[#1769E8]/35 space-y-4 shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold text-[#27BED6]">
              {t('مساحة حسابي الصناعية', 'My Account Workspace')}
            </span>
            <h2 className="text-base sm:text-xl font-black text-white mt-0.5">
              {t('لوحة التحكم — إدارة حسابك ونشاطك الصناعي', 'Control Center — Manage Your Account & Activity')}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowRoleControlPanel((p) => !p)}
            className="px-3.5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold self-start sm:self-auto cursor-pointer"
          >
            {showRoleControlPanel
              ? t('إخفاء لوحة التحكم التفصيلية', 'Hide Detailed Panel')
              : t('إظهار لوحة التحكم التفصيلية', 'Show Detailed Panel')}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { to: '/app/profile', labelAr: 'ملفي المهني', labelEn: 'My Profile' },
            { to: '/app/market', labelAr: 'إعلاناتي ومنشوراتي', labelEn: 'My Listings' },
            { to: '/app/jobs/applications', labelAr: 'وظائفي وتقدماتي', labelEn: 'Job Applications' },
            { to: '/app/manufacturing/my-requests', labelAr: 'طلباتي وعروض الأسعار', labelEn: 'My RFQs & Quotes' },
            { to: '/app/saved', labelAr: 'المحفوظات', labelEn: 'Saved Items' },
            { to: '/app/settings', labelAr: 'الإعدادات', labelEn: 'Settings' },
            { to: '/app/help', labelAr: 'مساعدة ودعم', labelEn: 'Help & Support' },
          ].map((item) => (
            <Link
              key={item.labelAr}
              to={item.to}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-[#1769E8] border border-white/12 text-center text-xs font-extrabold text-white transition-colors"
            >
              {t(item.labelAr, item.labelEn)}
            </Link>
          ))}
        </div>
      </div>

      <PWAInstallButton variant="card" />

      {/* Top Profile Header Card */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            {/* Avatar with Upload & Zoom Controls */}
            <div className="relative group self-start shrink-0">
              <div
                onClick={() => openLightbox([displayedAvatar], 0, realUser.name)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#F4F7FC] border-2 border-[#1769E8]/30 shadow-md cursor-zoom-in"
              >
                <IndustrialImage
                  src={displayedAvatar}
                  alt={realUser.name}
                  aspectRatio="aspect-square"
                  fit="cover"
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#071A33] hover:bg-[#1769E8] text-white text-[11px] font-extrabold inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('تغيير الصورة', 'Change Photo')}</span>
                </button>
                {realUser.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    title={t('حذف الصورة المرفوعة', 'Remove uploaded photo')}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#13243B] break-words">
                  {realUser.name}
                </h1>
                {realUser.verified && <VerifiedFactoryBadge variant="compact" />}
                <span className="px-2.5 py-0.5 rounded-md bg-[#1769E8]/10 text-[#1769E8] text-xs font-extrabold">
                  {realUser.accountType === 'factory'
                    ? t('صاحب مصنع', 'Factory Owner')
                    : realUser.accountType === 'supplier'
                    ? t('مورد خامات وماسترباتش', 'Raw Materials Supplier')
                    : realUser.accountType === 'trader'
                    ? t('تاجر ماكينات ومعدات', 'Equipment Trader')
                    : realUser.accountType === 'technician'
                    ? t('فني وعامل صناعي', 'Technician & Worker')
                    : t('مهندس صناعي', 'Industrial Engineer')}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-extrabold text-[#1769E8] break-words">
                {realUser.jobTitle ||
                  realUser.specialty ||
                  t(roleLabels.roleTitleAr, roleLabels.roleTitleEn)}
                {realUser.companyName ? ` — ${realUser.companyName}` : ''}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#718096] pt-1">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1769E8]" />
                  {realUser.city}، {realUser.country}
                </span>
                <span className="inline-flex items-center gap-1 break-all">
                  <Mail className="w-3.5 h-3.5 text-[#1769E8]" />
                  {realUser.email}
                </span>
                {realUser.phone && (
                  <span className="inline-flex items-center gap-1 font-mono-num">
                    <Phone className="w-3.5 h-3.5 text-[#1769E8]" />
                    {realUser.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1769E8]" />
                  {t('انضم في:', 'Joined:')} {currentUser.joinDate}
                </span>
              </div>

              {/* Followers & Following Interactive Counters */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  data-testid="open-followers-modal-btn"
                  onClick={() => setFollowModalType('followers')}
                  className="px-3 py-1.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] hover:border-[#1769E8] text-xs font-extrabold text-[#13243B] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#1769E8]" />
                  <span>{followersCount}</span>
                  <span className="text-[#718096] font-bold">{t('متابع', 'Followers')}</span>
                </button>
                <button
                  type="button"
                  data-testid="open-following-modal-btn"
                  onClick={() => setFollowModalType('following')}
                  className="px-3 py-1.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] hover:border-[#1769E8] text-xs font-extrabold text-[#13243B] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{followingCount}</span>
                  <span className="text-[#718096] font-bold">{t('يتابع', 'Following')}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
            <button
              type="button"
              data-testid="edit-profile-toggle-btn"
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold transition-colors cursor-pointer"
            >
              {isEditing
                ? t('إلغاء التعديل', 'Cancel Edit')
                : t('تعديل الملف المهني', 'Edit Profile')}
            </button>
            <Link
              to="/app/saved"
              className="px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] text-xs font-extrabold inline-flex items-center gap-1.5 border border-[#DFE7F1]"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{t('المفضلة', 'Favorites')}</span>
            </Link>
            <Link
              to="/app/messages"
              className="px-3.5 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#27BED6]" />
              <span>{t('المحادثات', 'Messages')}</span>
            </Link>
          </div>
        </div>

        {isEditing ? (
          <form
            onSubmit={handleSave}
            data-testid="profile-edit-form"
            className="pt-5 border-t border-[#DFE7F1] space-y-5"
          >
            {/* Avatar Upload & Preset Selector inside Edit Form */}
            <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-extrabold text-[#071A33]">
                  {t('الصورة الشخصية أو شعار الشركة / المصنع:', 'Profile Photo or Company Logo:')}
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t('رفع صورة من جهازك', 'Upload from Device')}</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { label: 'مهندس', url: IMAGE_MANIFEST.profiles.engineer },
                  { label: 'صاحب مصنع', url: IMAGE_MANIFEST.profiles.factoryOwner },
                  { label: 'فني صيانة', url: IMAGE_MANIFEST.profiles.technician },
                  { label: 'مورد / تاجر', url: IMAGE_MANIFEST.profiles.supplierTrader },
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      avatarUrl === preset.url
                        ? 'border-[#1769E8] bg-blue-50 text-[#1769E8]'
                        : 'border-[#DFE7F1] bg-white text-[#13243B]'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('الاسم الكامل / اسم المسؤول', 'Full Name')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('المسمى الوظيفي أو الصفة', 'Job Title')}
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="مثال: مدير إنتاج / مسؤول مبيعات خامات"
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('الدور الصناعي للحساب', 'Industrial Role')}
                </label>
                <select
                  value={accountType}
                  onChange={(e) => {
                    const nextRole = e.target.value as AccountType;
                    setAccountType(nextRole);
                    const cleaned = sanitizeRoleSkills(nextRole, selectedSkills);
                    setSelectedSkills(cleaned);
                    setSkillsText(cleaned.join('، '));
                  }}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold"
                >
                  <option value="factory">{t('صاحب مصنع', 'Factory Owner')}</option>
                  <option value="technician">{t('فني وعامل صناعي', 'Technician & Worker')}</option>
                  <option value="engineer">{t('مهندس صناعي', 'Industrial Engineer')}</option>
                  <option value="supplier">{t('مورد خامات وماسترباتش', 'Raw Materials Supplier')}</option>
                  <option value="trader">{t('تاجر ماكينات ومعدات', 'Equipment Trader')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t(roleLabels.specialtyLabelAr, roleLabels.specialtyLabelEn)}
                </label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t(roleLabels.companyLabelAr, roleLabels.companyLabelEn)}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Role-Specific Extended Fields inside Profile Edit */}
            {accountType === 'factory' && (
              <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('عدد الماكينات بالمصنع', 'Number of Machines')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.machinesCount || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, machinesCount: e.target.value }))
                    }
                    placeholder="مثال: 15 ماكينة حقن ونفخ"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الطاقة الإنتاجية الشهرية', 'Production Capacity')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.productionCapacity || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, productionCapacity: e.target.value }))
                    }
                    placeholder="مثال: 600 طن / شهر"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('المنتجات التي يصنعها المصنع', 'Products Manufactured')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.productsManufactured || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, productsManufactured: e.target.value }))
                    }
                    placeholder="عبوات، جراكن، صناديق، مواسير..."
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            {accountType === 'supplier' && (
              <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('المنتجات والخامات المتوفرة', 'Supplied Raw Materials & Products')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.supplierProducts || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, supplierProducts: e.target.value }))
                    }
                    placeholder="خامات PP, PE, PET, PVC, ABS, ماسترباتش"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('نطاق التوريد والكميات', 'Supply Scope & Volumes')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.supplyScope || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, supplyScope: e.target.value }))
                    }
                    placeholder="توريد محلي ودولي — كميات كبيرة وصغيرة + عينات"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الدول التي يخدمها المورد', 'Countries Served')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.countriesServed || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, countriesServed: e.target.value }))
                    }
                    placeholder="مصر، السعودية، الإمارات، الأردن"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            {accountType === 'trader' && (
              <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('أنواع الماكينات والمعدات', 'Types of Machinery')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.equipmentTypes || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, equipmentTypes: e.target.value }))
                    }
                    placeholder="ماكينات حقن، نفخ، سحب، شيلرات، كسارات"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('حالة المعدات (جديد / مستعمل)', 'New or Used')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.conditionOffered || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({ ...p, conditionOffered: e.target.value }))
                    }
                    placeholder="جديد ومستعمل مفحوص فنياً"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('خدمات البيع والشراء وقطع الغيار', 'Services & Spare Parts')}
                  </label>
                  <input
                    type="text"
                    value={roleMeta.sparePartsAndMaintenance || ''}
                    onChange={(e) =>
                      setRoleMeta((p) => ({
                        ...p,
                        sparePartsAndMaintenance: e.target.value,
                      }))
                    }
                    placeholder="بيع وشراء واستبدال + قطع غيار وصيانة"
                    className="w-full input-3d rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('الدولة', 'Country')}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('المدينة / المنطقة الصناعية', 'City')}
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('سنوات الخبرة / التأسيس', 'Years of Experience')}
                </label>
                <input
                  type="number"
                  min={0}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('رقم الهاتف / واتساب', 'Phone Number')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Interactive Role-Specific Options Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold text-[#13243B]">
                {t(roleLabels.skillsLabelAr, roleLabels.skillsLabelEn)}:
              </label>
              <div className="flex flex-wrap gap-1.5" data-testid="profile-role-skills-chips">
                {availableRoleSkills.map((sk) => {
                  const active = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkillTag(sk)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1769E8] text-white border-[#1769E8]'
                          : 'bg-[#F4F7FC] text-[#13243B] border-[#DFE7F1] hover:border-[#1769E8]/50'
                      }`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t(roleLabels.skillsLabelAr, roleLabels.skillsLabelEn)} ({t('إضافي مفصول بفاصلة', 'comma-separated')})
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t(roleLabels.machinesLabelAr, roleLabels.machinesLabelEn)}
                </label>
                <input
                  type="text"
                  value={machinesText}
                  onChange={(e) => setMachinesText(e.target.value)}
                  placeholder={
                    accountType === 'supplier'
                      ? 'SABIC, Borouge, Tasnee, ExxonMobil'
                      : 'Haitian MA-2500، Engel Victory، SolidWorks'
                  }
                  className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {accountType === 'supplier'
                  ? t('شهادات الجودة والاعتمادات الفنية (ISO / COA / TDS / RoHS)', 'Quality Certificates & Approvals')
                  : t('المؤهلات والدورات والشهادات المهنية (مفصولة بفاصلة)', 'Qualifications & Certificates')}
              </label>
              <input
                type="text"
                value={certificatesText}
                onChange={(e) => setCertificatesText(e.target.value)}
                placeholder={
                  accountType === 'supplier'
                    ? 'ISO 9001، شهادات تحليل COA، داتا شيت TDS، مطابقة غذائية FDA'
                    : 'بكالوريوس هندسة، شهادة الأيزو 9001، دبلومة البوليمرات'
                }
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            {/* Past Experiences Editor */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#13243B]">
                  {accountType === 'supplier'
                    ? t('سجل التوريد والشراكات الصناعية:', 'Supply Track Record & Partnerships:')
                    : t('الخبرات السابقة وسجل العمل الصناعي:', 'Past Work Experience:')}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setExperiences((prev) => [
                      ...prev,
                      { title: '', company: '', years: '' },
                    ])
                  }
                  className="px-3 py-1 rounded-lg bg-[#F4F7FC] hover:bg-slate-200 text-[#1769E8] text-xs font-extrabold inline-flex items-center gap-1 border border-[#DFE7F1]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('إضافة خبرة', 'Add Experience')}</span>
                </button>
              </div>
              {experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#F4F7FC] p-2.5 rounded-xl border border-[#DFE7F1]"
                >
                  <input
                    type="text"
                    placeholder="المسمى الوظيفي / النشاط"
                    value={exp.title}
                    onChange={(e) =>
                      setExperiences((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, title: e.target.value } : item
                        )
                      )
                    }
                    className="sm:col-span-4 bg-white border border-[#DFE7F1] rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="اسم المصنع / الشركة"
                    value={exp.company}
                    onChange={(e) =>
                      setExperiences((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, company: e.target.value } : item
                        )
                      )
                    }
                    className="sm:col-span-5 bg-white border border-[#DFE7F1] rounded-lg px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="الفترة (مثال: 2020 - 2024)"
                    value={exp.years}
                    onChange={(e) =>
                      setExperiences((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, years: e.target.value } : item
                        )
                      )
                    }
                    className="sm:col-span-2 bg-white border border-[#DFE7F1] rounded-lg px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExperiences((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="sm:col-span-1 p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t(roleLabels.bioLabelAr, roleLabels.bioLabelEn)}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>

            {/* Contact Preferences */}
            <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex flex-wrap items-center gap-5">
              <span className="text-xs font-extrabold text-[#071A33]">
                {t('تفضيلات التواصل المتاحة:', 'Contact Preferences:')}
              </span>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-[#13243B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactPrefs.allowChat}
                  onChange={(e) =>
                    setContactPrefs((p) => ({ ...p, allowChat: e.target.checked }))
                  }
                  className="rounded text-[#1769E8]"
                />
                <span>{t('استقبال رسائل الدردشة المباشرة', 'Allow In-App Chat')}</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-[#13243B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactPrefs.showPhone}
                  onChange={(e) =>
                    setContactPrefs((p) => ({ ...p, showPhone: e.target.checked }))
                  }
                  className="rounded text-[#1769E8]"
                />
                <span>{t('إظهار رقم الهاتف في الإعلانات', 'Show Phone on Listings')}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? t('جاري الحفظ في قاعدة البيانات...', 'Saving to database...')
                  : t('حفظ التغييرات في قاعدة البيانات', 'Save Changes')}
              </span>
            </button>
          </form>
        ) : (
          <div className="space-y-5 pt-4 border-t border-[#DFE7F1]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">
                  {t('سنوات الخبرة', 'Experience')}
                </span>
                <span className="font-extrabold text-[#13243B] font-mono-num text-sm">
                  {realUser.experienceYears} {t('سنوات', 'Years')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">
                  {t(roleLabels.companyLabelAr, roleLabels.companyLabelEn)}
                </span>
                <span className="font-extrabold text-[#13243B] text-sm break-words">
                  {realUser.companyName || t('مستقل / معتمد', 'Independent')}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">
                  {t('الشهادات والاعتمادات', 'Certificates')}
                </span>
                <span className="font-extrabold text-[#1769E8] font-mono-num text-sm">
                  {earnedCertificates.length + (currentUser.certificates?.length || 0)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
                <span className="text-[#718096] block">
                  {t('حالة التوثيق', 'Verification')}
                </span>
                <span className="font-extrabold text-emerald-700 inline-flex items-center gap-1 text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {t('حساب موثق بقاعدة البيانات', 'Verified DB Account')}
                </span>
              </div>
            </div>

            {/* Role-Specific Extended Details Summary Card */}
            {(savedRoleMeta.machinesCount ||
              savedRoleMeta.productionCapacity ||
              savedRoleMeta.productsManufactured ||
              savedRoleMeta.supplierProducts ||
              savedRoleMeta.supplyScope ||
              savedRoleMeta.countriesServed ||
              savedRoleMeta.equipmentTypes ||
              savedRoleMeta.conditionOffered) && (
              <div
                data-testid="profile-role-extended-card"
                className="p-4 rounded-2xl bg-[#071A33] text-white grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
              >
                {realUser.accountType === 'factory' && (
                  <>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('عدد الماكينات:', 'Machines Count:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.machinesCount || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('الطاقة الإنتاجية:', 'Production Capacity:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.productionCapacity || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('المنتجات المصنعة:', 'Products Manufactured:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.productsManufactured || '—'}</span>
                    </div>
                  </>
                )}
                {realUser.accountType === 'supplier' && (
                  <>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('الخامات والمنتجات:', 'Supplied Polymers:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.supplierProducts || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('نطاق التوريد:', 'Supply Scope:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.supplyScope || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('الدول المخدومة:', 'Countries Served:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.countriesServed || '—'}</span>
                    </div>
                  </>
                )}
                {realUser.accountType === 'trader' && (
                  <>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('أنواع المعدات:', 'Equipment Types:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.equipmentTypes || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('حالة المعدات:', 'Condition:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.conditionOffered || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#27BED6] font-bold block">
                        {t('الخدمات وقطع الغيار:', 'Services & Parts:')}
                      </span>
                      <span className="font-extrabold">{savedRoleMeta.sparePartsAndMaintenance || '—'}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {realUser.bio && (
              <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm text-[#13243B] leading-relaxed break-words">
                {realUser.bio}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role-Specific Skills / Polymer Capabilities */}
              <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#071A33] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#1769E8] shrink-0" />
                  <span>{t(roleLabels.skillsLabelAr, roleLabels.skillsLabelEn)}:</span>
                </h3>
                <div className="flex flex-wrap gap-2" data-testid="profile-displayed-skills">
                  {displayedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Role-Specific Brands / Machines / Software */}
              <div className="p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#071A33] flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#FF8A2A] shrink-0" />
                  <span>{t(roleLabels.machinesLabelAr, roleLabels.machinesLabelEn)}:</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(currentUser.machines && currentUser.machines.length > 0
                    ? currentUser.machines
                    : realUser.accountType === 'supplier'
                    ? ['SABIC', 'Borouge', 'Tasnee']
                    : ['Haitian MA-2500', 'Engel Victory']
                  ).map((mc) => (
                    <span
                      key={mc}
                      className="px-3 py-1.5 rounded-lg bg-[#071A33] text-white text-xs font-bold"
                    >
                      {mc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Past Work Experiences */}
            {experiences.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#071A33]">
                  {realUser.accountType === 'supplier'
                    ? t('سجل التوريد والشراكات الصناعية:', 'Supply Track Record:')
                    : t('سجل الخبرات المهنية والعمل الصناعي:', 'Work Experience History:')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {experiences.map((exp, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-extrabold text-[#13243B] break-words">
                          {exp.title}
                        </div>
                        <div className="text-xs text-[#718096] font-bold mt-0.5 break-words">
                          {exp.company}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DFE7F1] text-[11px] font-bold text-[#1769E8] shrink-0">
                        {exp.years}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Earned Academy Certificates */}
            {(earnedCertificates.length > 0 ||
              (currentUser.certificates && currentUser.certificates.length > 0)) && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-extrabold text-[#071A33]">
                  {t('الشهادات والدورات المعتمدة:', 'Certificates & Completed Courses:')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {earnedCertificates.map((cert) => (
                    <div
                      key={cert.courseId}
                      className="p-3.5 rounded-xl bg-[#071A33] text-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-[#FF8A2A]" />
                        <div>
                          <div className="text-xs font-extrabold">{cert.courseId}</div>
                          <div className="text-[11px] text-[#27BED6] font-mono-num">
                            {cert.certificateCode}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {cert.quizScore}%
                      </span>
                    </div>
                  ))}
                  {(currentUser.certificates || []).map((cName) => (
                    <div
                      key={cName}
                      className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center gap-2.5"
                    >
                      <Award className="w-5 h-5 text-[#1769E8]" />
                      <span className="text-xs font-extrabold text-[#13243B]">
                        {cName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Following List (Companies, Suppliers & Engineers the user follows) */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1769E8]" />
            <h2 className="text-base font-extrabold text-[#13243B]">
              {t('الجهات والشركات التي أتابعها', 'Followed Companies, Suppliers & Engineers')} ({followingList.length})
            </h2>
          </div>
          <Link
            to="/app/suppliers"
            className="text-xs font-extrabold text-[#1769E8] hover:underline"
          >
            {t('استكشاف المزيد من الموردين', 'Explore Suppliers')}
          </Link>
        </div>

        {followingList.length === 0 ? (
          <p className="text-xs text-[#718096]">
            {t(
              'لم تقم بمتابعة أي مصنع أو مورد أو مهندس بعد. يمكنك الضغط على زر "متابعة" في السوق أو دليل الموردين أو المجتمع.',
              'You are not following any accounts yet.'
            )}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {followingList.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link
                    to={`/app/profile/${encodeURIComponent(f.id)}`}
                    className="shrink-0"
                  >
                    <IndustrialImage
                      src={f.avatar || IMAGE_MANIFEST.profiles.supplierTrader}
                      alt={f.nameAr}
                      aspectRatio="aspect-square"
                      className="w-11 h-11 rounded-xl shrink-0"
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      to={`/app/profile/${encodeURIComponent(f.id)}`}
                      className="block text-xs font-extrabold text-[#13243B] hover:text-[#1769E8] truncate transition-colors"
                    >
                      {f.nameAr}
                    </Link>
                    <div className="text-[11px] text-[#718096] truncate">
                      {f.roleAr}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    to={`/app/profile/${encodeURIComponent(f.id)}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#1769E8] border border-[#DFE7F1] text-[11px] font-extrabold"
                  >
                    {t('الملف', 'Profile')}
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      const convId = await startOrOpenConversation({
                        targetKey: f.id,
                        targetNameAr: f.nameAr,
                        targetRoleAr: f.roleAr,
                        targetAvatar: f.avatar,
                      });
                      if (convId) navigate(`/app/messages?convId=${convId}`);
                    }}
                    className="p-2 rounded-lg bg-[#1769E8] hover:bg-[#1258C7] text-white cursor-pointer"
                    title={t('بدء محادثة', 'Start Chat')}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void toggleFollow({
                        targetId: f.id,
                        targetType: f.type,
                        targetNameAr: f.nameAr,
                        targetRoleAr: f.roleAr,
                        targetAvatar: f.avatar,
                      })
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-extrabold cursor-pointer"
                  >
                    {t('إلغاء', 'Unfollow')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role-Specific Control Panel Organized Inside My Profile (§10) */}
      <div
        data-testid="profile-role-control-panel"
        className="bg-white rounded-2xl border border-[#DFE7F1] p-5 sm:p-6 shadow-2xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#071A33] text-[#27BED6] flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#13243B]">
                {realUser.accountType === 'supplier'
                  ? t('لوحة تحكم المورد وإدارة الخامات وطلبات التسعير', 'Supplier Control Panel & RFQs')
                  : realUser.accountType === 'factory'
                  ? t('لوحة تحكم المصنع وطلبات التصنيع للغير (RFQ)', 'Factory Control Panel & RFQs')
                  : realUser.accountType === 'trader'
                  ? t('لوحة تحكم التاجر ومعرض الماكينات والمعدات', 'Equipment Trader Control Panel')
                  : t('لوحة التحكم المهنية وطلبات التوظيف', 'Professional Career & Job Applications Panel')}
              </h2>
              <p className="text-xs text-[#718096]">
                {t(
                  'جميع أدوات إدارة نشاطك الصناعي مجمعة ومنظمة داخل حسابك الشخصي.',
                  'All role-specific management tools organized cleanly inside your account.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRoleControlPanel((p) => !p)}
            className="px-3.5 py-2 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] text-xs font-extrabold border border-[#DFE7F1] cursor-pointer"
          >
            {showRoleControlPanel
              ? t('طي لوحة التحكم', 'Collapse Panel')
              : t('فتح لوحة التحكم', 'Expand Panel')}
          </button>
        </div>

        {showRoleControlPanel && (
          <div className="pt-2 border-t border-[#DFE7F1]">
            {realUser.accountType === 'supplier' ? (
              <SupplierPremiumDashboardSection dashboardSummary={null} />
            ) : realUser.accountType === 'factory' ? (
              <InteractiveRfqSection />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  to="/app/jobs/applications"
                  className="p-4 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] space-y-1"
                >
                  <div className="text-xs font-extrabold text-[#1769E8]">
                    {t('طلبات التوظيف والسيرة المهنية', 'Job Applications & CV')}
                  </div>
                  <p className="text-[11px] text-[#718096]">
                    {t('تابع حالة تقديمك على وظائف المصانع وحدث سيرتك المهنية.', 'Track your factory job applications and update your CV.')}
                  </p>
                </Link>
                <Link
                  to="/app/market"
                  className="p-4 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] space-y-1"
                >
                  <div className="text-xs font-extrabold text-[#1769E8]">
                    {t('إدارة عروضي في السوق الصناعي', 'Manage My Marketplace Listings')}
                  </div>
                  <p className="text-[11px] text-[#718096]">
                    {t('أضف أو عدل عروض الماكينات والقوالب والخامات الخاصة بك.', 'Add or manage your machinery, molds, and material listings.')}
                  </p>
                </Link>
                <Link
                  to="/app/training"
                  className="p-4 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] space-y-1"
                >
                  <div className="text-xs font-extrabold text-[#1769E8]">
                    {t('دوراتي وشهادات أكاديمية بلاستيكو', 'My Courses & Academy Certificates')}
                  </div>
                  <p className="text-[11px] text-[#718096]">
                    {t('استكمل الدورات التدريبية واحصل على شهادات موثقة.', 'Complete training modules and earn verified certificates.')}
                  </p>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Followers / Following Modal with Clickable Profile Links */}
      {followModalType && (
        <div
          className="fixed inset-0 z-50 bg-[#071A33]/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setFollowModalType(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#DFE7F1] max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#DFE7F1] pb-3">
              <h3 className="text-base font-black text-[#13243B]">
                {followModalType === 'followers'
                  ? t(`المتابعون (${followersList.length})`, `Followers (${followersList.length})`)
                  : t(`حسابات أتابعها (${followingList.length})`, `Following (${followingList.length})`)}
              </h3>
              <button
                type="button"
                onClick={() => setFollowModalType(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(followModalType === 'followers' ? followersList : followingList).length === 0 ? (
              <p className="text-xs text-[#718096] py-6 text-center">
                {t('لا توجد حسابات في هذه القائمة حالياً.', 'No accounts in this list yet.')}
              </p>
            ) : (
              <div className="space-y-2.5">
                {(followModalType === 'followers' ? followersList : followingList).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between gap-2"
                  >
                    <Link
                      to={`/app/profile/${encodeURIComponent(item.id)}`}
                      onClick={() => setFollowModalType(null)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 group"
                    >
                      <img
                        src={item.avatar || IMAGE_MANIFEST.profiles.engineer}
                        alt={item.nameAr}
                        className="w-10 h-10 rounded-xl object-cover border border-[#DFE7F1] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#13243B] group-hover:text-[#1769E8] truncate">
                          {item.nameAr}
                        </div>
                        <div className="text-[11px] text-[#718096] truncate">
                          {item.roleAr}
                        </div>
                      </div>
                    </Link>
                    <Link
                      to={`/app/profile/${encodeURIComponent(item.id)}`}
                      onClick={() => setFollowModalType(null)}
                      className="px-3 py-1.5 rounded-lg bg-[#1769E8] text-white text-[11px] font-extrabold shrink-0"
                    >
                      {t('فتح الملف', 'View Profile')}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User's Published Listings & Community Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#13243B]">
              {t('إعلاناتي المنشورة في السوق الصناعي', 'My Published Marketplace Listings')} ({userListings.length})
            </h3>
            <Link
              to="/app/market"
              className="text-xs font-extrabold text-[#1769E8] hover:underline"
            >
              {t('+ إضافة إعلان جديد', '+ New Listing')}
            </Link>
          </div>
          {userListings.length === 0 ? (
            <p className="text-xs text-[#718096]">
              {t('لا توجد إعلانات منشورة باسمك حالياً.', 'No listings published yet.')}
            </p>
          ) : (
            <div className="space-y-2.5">
              {userListings.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to={`/app/market/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IndustrialImage
                      src={item.image}
                      alt={item.titleAr}
                      aspectRatio="aspect-square"
                      className="w-11 h-11 rounded-lg shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-[#13243B] truncate">
                        {item.titleAr}
                      </div>
                      <div className="text-[11px] text-[#1769E8] font-bold">
                        {lang === 'ar'
                          ? formatPrice(item.price, item.currency).formattedAr
                          : formatPrice(item.price, item.currency).formattedEn}{' '}
                        · {item.city}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#718096] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#13243B]">
              {t('مشاركاتي الفنية في مجتمع الأعطال', 'My Community Fault Posts')} ({userFaults.length})
            </h3>
            <Link
              to="/app/faults"
              className="text-xs font-extrabold text-[#1769E8] hover:underline"
            >
              {t('تصفح المجتمع الفني', 'Browse Community')}
            </Link>
          </div>
          {userFaults.length === 0 ? (
            <p className="text-xs text-[#718096]">
              {t('لم تقم بنشر أعطال فنية بعد.', 'No technical fault posts yet.')}
            </p>
          ) : (
            <div className="space-y-2.5">
              {userFaults.slice(0, 4).map((flt) => (
                <Link
                  key={flt.id}
                  to={`/app/faults/${flt.id}`}
                  className="block p-3 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1]"
                >
                  <div className="text-xs font-extrabold text-[#13243B]">
                    {flt.titleAr}
                  </div>
                  <div className="text-[11px] text-[#718096] mt-0.5">
                    {flt.machineTypeAr} · {flt.solutions.length} حلول مقترحة
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProfileEditPage: React.FC = () => <ProfilePage />;

/* ============================================================================
   NOTIFICATIONS & SETTINGS PAGES (§5 & §13)
   ============================================================================ */
export const NotificationsPage: React.FC = () => {
  const {
    t,
    realUser,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    showToast,
  } = usePlastico();
  const navigate = useNavigate();

  const [dbNotifications, setDbNotifications] = useState<
    Array<{
      id: string;
      titleAr: string;
      titleEn: string;
      bodyAr: string;
      bodyEn: string;
      link: string;
      isRead: boolean;
      createdAt: string;
    }>
  >([]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('plastico_notif_sound_enabled') !== '0';
    } catch {
      return true;
    }
  });
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('plastico_notif_sound_volume'));
      return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 0.75;
    } catch {
      return 0.75;
    }
  });
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  const initialLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!realUser) return;
    const fetchNotifs = async () => {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.notifications)) {
          const mapped = data.notifications.map((row: any) => ({
            id: `db-notif-${row.id}`,
            titleAr: row.titleAr || 'إشعار جديد',
            titleEn: row.titleAr || 'New Notification',
            bodyAr: row.bodyAr || '',
            bodyEn: row.bodyAr || '',
            link: row.targetRoute || '/app/notifications',
            isRead: Boolean(row.isRead),
            createdAt: row.createdAt
              ? new Date(row.createdAt).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'الآن',
          }));

          // Deduplicate and play chime ONLY for newly arrived unread notifications after initial load
          let shouldPlay = false;
          for (const item of mapped) {
            if (!seenNotifIdsRef.current.has(item.id)) {
              seenNotifIdsRef.current.add(item.id);
              if (initialLoadedRef.current && !item.isRead) {
                shouldPlay = true;
              }
            }
          }
          initialLoadedRef.current = true;
          if (shouldPlay && soundEnabled) {
            playLocalNotificationChime(soundVolume);
          }
          setDbNotifications(mapped);
        }
      } catch {
        // ignore
      }
    };
    void fetchNotifs();
    const timer = setInterval(fetchNotifs, 8000);
    return () => clearInterval(timer);
  }, [realUser, soundEnabled, soundVolume]);

  const combinedNotifications = [...dbNotifications, ...notifications];

  const handleRequestBrowserPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('متصفحك الحالي لا يدعم إشعارات سطح المكتب.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      if (soundEnabled) playLocalNotificationChime(soundVolume);
      showToast('تم تفعيل إشعارات المتصفح والصوت المحلي بنجاح!');
    } else {
      showToast('تم رفض إذن إشعارات المتصفح.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#13243B]">
            {t('الإشعارات والتنبيهات الفورية', 'Real-Time Notifications')}
          </h1>
          <p className="text-xs text-[#718096]">
            {t(
              'إشعارات الرسائل الجديدة، المتابعين، التعليقات، وطلبات عروض الأسعار.',
              'Alerts for new messages, followers, comments, and RFQ updates.'
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              try {
                localStorage.setItem('plastico_notif_sound_enabled', next ? '1' : '0');
              } catch {
                // ignore
              }
              if (next) playLocalNotificationChime(soundVolume);
            }}
            data-testid="toggle-notif-sound-btn"
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 border cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span>
              {soundEnabled
                ? t('صوت الإشعارات: مفعّل', 'Sound: ON')
                : t('صوت الإشعارات: صامت', 'Sound: Muted')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => playLocalNotificationChime(soundVolume)}
            className="px-3 py-1.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 text-[#1769E8] border border-[#DFE7F1] text-xs font-extrabold cursor-pointer"
          >
            {t('تجربة الصوت', 'Test Chime')}
          </button>

          <button
            type="button"
            onClick={handleRequestBrowserPush}
            className="px-3 py-1.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold cursor-pointer"
          >
            {t('تفعيل إشعارات المتصفح', 'Enable Browser Push')}
          </button>

          <button
            type="button"
            onClick={() => {
              setDbNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
              markAllNotificationsRead();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#071A33] text-white text-xs font-extrabold cursor-pointer"
          >
            {t('تحديد الكل كمقروء', 'Mark All Read')}
          </button>
        </div>
      </div>

      {/* Sound Volume Control Bar */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-extrabold text-[#13243B]">
          {t('مستوى صوت التنبيه المحلي:', 'Notification Chime Volume:')}
        </span>
        <div className="flex items-center gap-3 w-full sm:w-64">
          <VolumeX className="w-4 h-4 text-[#718096]" />
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={soundVolume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setSoundVolume(v);
              try {
                localStorage.setItem('plastico_notif_sound_volume', String(v));
              } catch {
                // ignore
              }
            }}
            className="flex-1 accent-[#1769E8]"
          />
          <Volume2 className="w-4 h-4 text-[#1769E8]" />
        </div>
      </div>

      <div className="space-y-3">
        {combinedNotifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              setDbNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
              );
              markNotificationRead(notif.id);
              navigate(notif.link);
            }}
            className={`cursor-pointer rounded-2xl border p-4 flex items-center justify-between gap-4 transition-colors ${
              notif.isRead
                ? 'bg-white border-[#DFE7F1] hover:border-[#1769E8]'
                : 'bg-blue-50/60 border-[#1769E8]/40 hover:border-[#1769E8]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#1769E8] shrink-0" />
                )}
                <div className="text-sm font-extrabold text-[#13243B]">
                  {t(notif.titleAr, notif.titleEn)}
                </div>
              </div>
              <div className="text-xs text-[#718096] mt-0.5">
                {t(notif.bodyAr, notif.bodyEn)} · {notif.createdAt}
              </div>
            </div>
            <Bell className="w-4 h-4 text-[#1769E8] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { lang, setLang, t, currentUser, switchPersona, resetDemoData, showToast } =
    usePlastico();
  const [promoIntroDisabled, setPromoIntroDisabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('plastico_promo_intro_disabled') === '1';
    } catch {
      return false;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-6 h-6 text-[#13243B]" />
        <h1 className="text-xl font-extrabold text-[#13243B]">
          {t('إعدادات الحساب والمنصة', 'Account & Platform Settings')}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#13243B]">
            {t('لغة الواجهة والاتجاه:', 'Interface Language:')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLang('ar')}
              className={`py-3 rounded-xl text-xs font-extrabold border cursor-pointer ${
                lang === 'ar'
                  ? 'bg-[#071A33] text-white border-[#071A33]'
                  : 'bg-[#F4F7FC] text-[#13243B] border-[#DFE7F1]'
              }`}
            >
              العربية (RTL)
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`py-3 rounded-xl text-xs font-extrabold border cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#071A33] text-white border-[#071A33]'
                  : 'bg-[#F4F7FC] text-[#13243B] border-[#DFE7F1]'
              }`}
            >
              English (LTR)
            </button>
          </div>
        </div>

        {/* Promotional Welcome Screen Control (§5) */}
        <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold text-[#13243B]">
              {t('الشاشة الترويجية الترحيبية للزوار', 'Promotional Welcome Intro Screen')}
            </div>
            <p className="text-[11px] text-[#718096] mt-0.5">
              {t(
                'تحكم في إظهار أو إخفاء البطاقة التعريفية الترويجية عند فتح المنصة كزائر.',
                'Control whether the promotional intro overlay is shown for visitors.'
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !promoIntroDisabled;
              setPromoIntroDisabled(next);
              try {
                localStorage.setItem('plastico_promo_intro_disabled', next ? '1' : '0');
                if (!next) {
                  localStorage.removeItem('plastico_promo_intro_seen_v1');
                }
              } catch {
                // ignore
              }
              showToast(
                next
                  ? 'تم إيقاف الشاشة الترويجية الترحيبية.'
                  : 'تم تفعيل الشاشة الترويجية الترحيبية للزوار.'
              );
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
              promoIntroDisabled
                ? 'bg-slate-200 text-slate-700'
                : 'bg-[#1769E8] text-white'
            }`}
          >
            {promoIntroDisabled
              ? t('معطّلة (اضغط للتفعيل)', 'Disabled (Click to Enable)')
              : t('مفعّلة للزوار الجدد', 'Enabled for New Visitors')}
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-[#13243B]">
            {t('الدور المهني النشط:', 'Active Professional Role:')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {(
              [
                { r: 'engineer', label: 'مهندس بلاستيك' },
                { r: 'technician', label: 'فني تشغيل وصيانة' },
                { r: 'factory', label: 'صاحب مصنع' },
                { r: 'supplier', label: 'مورد خامات' },
                { r: 'trader', label: 'تاجر / سوق مستعمل' },
              ] as { r: UserRole; label: string }[]
            ).map((item) => (
              <button
                key={item.r}
                type="button"
                onClick={() => switchPersona(item.r)}
                className={`p-3 rounded-xl text-xs font-extrabold border cursor-pointer ${
                  currentUser.role === item.r
                    ? 'bg-[#1769E8] text-white border-[#1769E8]'
                    : 'bg-[#F4F7FC] text-[#13243B] border-[#DFE7F1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-[#DFE7F1]">
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-extrabold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('إعادة ضبط البيانات التجريبية', 'Reset Demo Data')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   REAL DATABASE-BACKED IN-APP CHAT PAGE (/app/messages)
   Persists conversations & messages in Cloud SQL PostgreSQL
   ============================================================================ */
interface ChatThreadMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderNameAr: string;
  text: string;
  attachmentUrl: string;
  createdAt: string;
}

export const MessagesPage: React.FC = () => {
  const {
    lang,
    t,
    isAuthenticated,
    realUser,
    csrfToken,
    conversations,
    refreshConversations,
    startOrOpenConversation,
    isFollowing,
    toggleFollow,
    openLightbox,
    suppliers,
    market,
    showToast,
  } = usePlastico();
  const { formatPrice } = useThemeAndCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConvIdParam = Number(searchParams.get('convId') || 0);
  const listingIdParam = searchParams.get('listingId') || '';
  const prefillParam = searchParams.get('prefill') || '';

  const [selectedConvId, setSelectedConvId] = useState<number | null>(
    activeConvIdParam || null
  );
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [convFilterTab, setConvFilterTab] = useState<'all' | 'unread' | 'favorite'>('all');
  const [favoriteConvIds, setFavoriteConvIds] = useState<number[]>([]);
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [textInput, setTextInput] = useState(prefillParam || '');
  const [replyingToMessage, setReplyingToMessage] =
    useState<ChatThreadMessage | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string>('');
  const [sending, setSending] = useState(false);
  const attachInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefillParam) {
      setTextInput(prefillParam);
    }
  }, [prefillParam]);

  useEffect(() => {
    if (activeConvIdParam) {
      setSelectedConvId(activeConvIdParam);
    } else if (
      !selectedConvId &&
      conversations.length > 0 &&
      typeof window !== 'undefined' &&
      window.innerWidth >= 1024
    ) {
      setSelectedConvId(conversations[0].id);
    }
  }, [activeConvIdParam, conversations, selectedConvId]);

  const loadThreadMessages = useCallback(
    async (convId: number, silent = false) => {
      if (!realUser || !convId) return;
      if (!silent) setLoadingMessages(true);
      try {
        const res = await fetch(`/api/conversations/${convId}/messages`, {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        void refreshConversations();
      } catch {
        // ignore
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [realUser, refreshConversations]
  );

  useEffect(() => {
    if (!selectedConvId || !realUser) return;
    void loadThreadMessages(selectedConvId, false);
    const interval = setInterval(() => {
      void loadThreadMessages(selectedConvId, true);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConvId, realUser, loadThreadMessages]);

  useEffect(() => {
    // Strictly scroll ONLY the internal chat messages container, never the document/window
    const container = messagesContainerRef.current;
    if (container && messages.length > 0) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, selectedConvId]);

  if (!isAuthenticated || !realUser) {
    return (
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center space-y-4 max-w-lg mx-auto my-6">
        <MessageSquare className="w-10 h-10 text-[#1769E8] mx-auto" />
        <h1 className="text-xl font-extrabold text-[#13243B]">
          {t(
            'يرجى تسجيل الدخول لفتح نظام المراسلات والدردشة المباشرة',
            'Please Sign In to Access Direct Messaging'
          )}
        </h1>
        <p className="text-xs text-[#718096] leading-relaxed">
          {t(
            'يتيح لك نظام المراسلات التواصل الفوري مع البائعين والمصانع والموردين وحفظ سجل محادثاتك في قاعدة البيانات.',
            'Sign in to chat directly with sellers, factories, and suppliers.'
          )}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/auth/login?redirect=/app/messages"
            className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('تسجيل الدخول', 'Sign In')}</span>
          </Link>
          <Link
            to="/auth/register"
            className="px-5 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold"
          >
            {t('إنشاء حساب', 'Register')}
          </Link>
        </div>
      </div>
    );
  }

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || null;

  const handleAttachmentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFileToDataUrl(file, 720);
      setAttachmentPreview(dataUrl);
    } catch {
      showToast('تعذر قراءة الصورة المرفقة.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || (!textInput.trim() && !attachmentPreview) || sending) return;

    setSending(true);
    try {
      const formattedText = replyingToMessage
        ? `رداً على "${replyingToMessage.text.slice(0, 50)}":\n${textInput.trim()}`
        : textInput.trim();
      const res = await fetch(`/api/conversations/${selectedConvId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          text: formattedText,
          attachmentUrl: attachmentPreview || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        setTextInput('');
        setReplyingToMessage(null);
        setAttachmentPreview('');
        await refreshConversations();
      } else {
        showToast('تعذر إرسال الرسالة.');
      }
    } catch {
      showToast('حدث خطأ في الاتصال أثناء إرسال الرسالة.');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (convFilterTab === 'unread' && !(c.unreadCount > 0)) return false;
    if (convFilterTab === 'favorite' && !favoriteConvIds.includes(c.id)) return false;
    if (!convSearchQuery.trim()) return true;
    const q = convSearchQuery.toLowerCase();
    return (
      c.otherPartyNameAr.toLowerCase().includes(q) ||
      c.contextTitleAr.toLowerCase().includes(q) ||
      c.lastMessageText.toLowerCase().includes(q)
    );
  });

  const linkedMarketListing = activeConversation
    ? market.find(
        (m) =>
          m.id === activeConversation.contextId ||
          (listingIdParam && m.id === listingIdParam)
      )
    : listingIdParam
    ? market.find((m) => m.id === listingIdParam)
    : undefined;

  return (
    <div className="space-y-4">
      <input
        ref={attachInputRef}
        type="file"
        accept="image/*"
        onChange={handleAttachmentSelect}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#13243B]">
            {t('المراسلات والمحادثات المباشرة', 'Direct In-App Conversations')}
          </h1>
          <p className="text-xs text-[#718096]">
            {t(
              'تواصل مباشرة مع بائعي الماكينات والموردين والمصانع وتابع عروض الأسعار.',
              'Chat directly with machinery sellers, suppliers, and factories.'
            )}
          </p>
        </div>
      </div>

      {/* Quick Start Bar if user wants to message a verified supplier */}
      {conversations.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 space-y-3">
          <h2 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
            {t(
              'ابدأ محادثة فورية مع أحد الموردين أو المصانع المعتمدة:',
              'Start an instant chat with a verified supplier or factory:'
            )}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {suppliers.slice(0, 3).map((sup) => (
              <button
                key={sup.id}
                type="button"
                onClick={async () => {
                  const cid = await startOrOpenConversation({
                    targetKey: `sup-${sup.id}`,
                    targetNameAr: sup.companyNameAr,
                    targetRoleAr: sup.categoryLabelAr || sup.supplierTypeLabelAr,
                    targetAvatar: sup.image || sup.logo,
                    contextType: 'supplier',
                    contextId: sup.id,
                    contextTitleAr: `استفسار توريد: ${sup.companyNameAr}`,
                    initialMessage: `مرحباً ${sup.companyNameAr}، أرغب في الاستفسار عن الأسعار والتوريد.`,
                  });
                  if (cid) {
                    setSelectedConvId(cid);
                    setSearchParams({ convId: String(cid) });
                  }
                }}
                className="p-3.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] text-right flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IndustrialImage
                    src={sup.image || sup.logo}
                    alt={sup.companyNameAr}
                    aspectRatio="aspect-square"
                    className="w-10 h-10 rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#13243B] truncate">
                      {sup.companyNameAr}
                    </div>
                    <div className="text-[11px] text-[#1769E8] font-bold truncate">
                      {sup.categoryLabelAr || sup.supplierTypeLabelAr}
                    </div>
                  </div>
                </div>
                <MessageSquare className="w-4 h-4 text-[#1769E8] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Pane Responsive Chat Container */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[540px]">
        {/* Conversations List Pane */}
        <div
          className={`lg:col-span-4 border-b lg:border-b-0 lg:border-e border-[#DFE7F1] flex flex-col ${
            selectedConvId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="p-3.5 bg-[#071A33] text-white font-extrabold text-xs flex items-center justify-between">
            <span>{t('الرسائل والمحادثات', 'Conversations')}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#1769E8] text-white text-[11px]">
              {filteredConversations.length}
            </span>
          </div>

          {/* 3 Filter Tabs matching Reference UI: الكل / غير مقروءة / المفضلة */}
          <div className="grid grid-cols-3 gap-1 p-2 bg-[#F4F7FC] border-b border-[#DFE7F1]">
            {[
              { id: 'all', labelAr: 'الكل', labelEn: 'All' },
              {
                id: 'unread',
                labelAr: `غير مقروءة (${conversations.filter((c) => c.unreadCount > 0).length})`,
                labelEn: 'Unread',
              },
              { id: 'favorite', labelAr: 'المفضلة', labelEn: 'Starred' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setConvFilterTab(tab.id as any)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                  convFilterTab === tab.id
                    ? 'bg-white text-[#1769E8] shadow-2xs border border-[#DFE7F1]'
                    : 'text-[#718096] hover:text-[#13243B]'
                }`}
              >
                {t(tab.labelAr, tab.labelEn)}
              </button>
            ))}
          </div>

          {/* Search inside conversations */}
          <div className="p-2.5 bg-[#F4F7FC] border-b border-[#DFE7F1]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#718096] absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={convSearchQuery}
                onChange={(e) => setConvSearchQuery(e.target.value)}
                placeholder={t('ابحث في المحادثات...', 'Search chats...')}
                className="w-full ps-8 pe-3 py-1.5 rounded-xl bg-white border border-[#DFE7F1] text-xs text-[#13243B] focus:outline-none focus:border-[#1769E8]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#DFE7F1]">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#718096]">
                {t(
                  'لا توجد محادثات مطابقة. اضغط على "تواصل مع البائع" في أي إعلان لبدء محادثة.',
                  'No matching conversations. Click "Contact Seller" on any listing.'
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setSearchParams({ convId: String(conv.id) });
                    }}
                    className={`w-full p-3.5 text-right flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/90' : 'hover:bg-[#F4F7FC]'
                    }`}
                  >
                    <IndustrialImage
                      src={
                        conv.otherPartyAvatar ||
                        IMAGE_MANIFEST.profiles.supplierTrader
                      }
                      alt={conv.otherPartyNameAr}
                      aspectRatio="aspect-square"
                      className="w-11 h-11 rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-extrabold text-[#13243B] truncate">
                          {conv.otherPartyNameAr}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF8A2A] text-white text-[10px] font-black">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#1769E8] font-bold truncate">
                        {conv.otherPartyRoleAr}
                      </div>
                      {conv.contextTitleAr && (
                        <div className="text-[10px] text-[#718096] truncate mt-0.5">
                          بخصوص: {conv.contextTitleAr}
                        </div>
                      )}
                      <p className="text-xs text-[#13243B]/80 truncate mt-1">
                        {conv.lastMessageText || 'بدء المحادثة...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Conversation Thread Pane */}
        <div
          className={`lg:col-span-8 flex flex-col ${
            !selectedConvId ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-3.5 sm:px-5 bg-[#F4F7FC] border-b border-[#DFE7F1] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedConvId(null);
                      setSearchParams({});
                    }}
                    className="lg:hidden p-1.5 rounded-lg bg-white border border-[#DFE7F1] text-[#13243B]"
                    aria-label="العودة لقائمة المحادثات"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to={`/app/profile/${encodeURIComponent(activeConversation.otherPartyKey)}`}
                    className="flex items-center gap-3 min-w-0 group"
                  >
                    <IndustrialImage
                      src={
                        activeConversation.otherPartyAvatar ||
                        IMAGE_MANIFEST.profiles.supplierTrader
                      }
                      alt={activeConversation.otherPartyNameAr}
                      aspectRatio="aspect-square"
                      className="w-10 h-10 rounded-xl shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#13243B] group-hover:text-[#1769E8] truncate transition-colors">
                        {activeConversation.otherPartyNameAr}
                      </h3>
                      <p className="text-[11px] text-[#1769E8] font-bold truncate">
                        {activeConversation.otherPartyRoleAr}
                      </p>
                    </div>
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/app/profile/${encodeURIComponent(activeConversation.otherPartyKey)}`}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#13243B] border border-[#DFE7F1] text-xs font-extrabold"
                  >
                    {t('الملف الشخصي', 'Profile')}
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      void toggleFollow({
                        targetId: activeConversation.otherPartyKey,
                        targetNameAr: activeConversation.otherPartyNameAr,
                        targetRoleAr: activeConversation.otherPartyRoleAr,
                        targetAvatar: activeConversation.otherPartyAvatar,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isFollowing(activeConversation.otherPartyKey)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#071A33] text-white hover:bg-[#1769E8]'
                    }`}
                  >
                    {isFollowing(activeConversation.otherPartyKey) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{t('متابَع', 'Following')}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>{t('متابعة', 'Follow')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Rich Linked Listing Context Card (§8) */}
              {linkedMarketListing ? (
                <div
                  data-testid="chat-listing-context-card"
                  className="p-3 bg-blue-50/90 border-b border-blue-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={linkedMarketListing.image}
                      alt={linkedMarketListing.titleAr}
                      className="w-14 h-12 rounded-xl object-cover border border-blue-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-[#1769E8] block">
                        {t('إعلان مرتبط بالمحادثة', 'Linked Marketplace Listing')}
                      </span>
                      <div className="text-xs sm:text-sm font-black text-[#071A33] truncate">
                        {linkedMarketListing.titleAr}
                      </div>
                      <div className="text-xs font-extrabold text-emerald-700 font-mono-num">
                        {lang === 'ar'
                          ? formatPrice(linkedMarketListing.price, linkedMarketListing.currency).formattedAr
                          : formatPrice(linkedMarketListing.price, linkedMarketListing.currency).formattedEn}{' '}
                        · {linkedMarketListing.city}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/app/market/${linkedMarketListing.id}`}
                    className="px-3 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold shrink-0 inline-flex items-center gap-1"
                  >
                    <span>{t('عرض الإعلان', 'View Listing')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                activeConversation.contextTitleAr && (
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-[#071A33] truncate">
                      {t('بخصوص الإعلان / الموضوع:', 'Regarding:')}{' '}
                      <strong className="text-[#1769E8]">
                        {activeConversation.contextTitleAr}
                      </strong>
                    </span>
                    {activeConversation.contextType === 'market' &&
                      activeConversation.contextId && (
                        <Link
                          to={`/app/market/${activeConversation.contextId}`}
                          className="text-[#1769E8] font-extrabold hover:underline shrink-0 inline-flex items-center gap-1"
                        >
                          <span>{t('فتح الإعلان', 'View Listing')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                  </div>
                )
              )}

              {/* Messages Feed */}
              <div
                ref={messagesContainerRef}
                data-testid="chat-messages-scroll-container"
                className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px] bg-[#F8FAFC]"
              >
                {loadingMessages && messages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#718096]">
                    {t('جاري تحميل سجل المحادثة...', 'Loading messages...')}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#718096]">
                    {t(
                      'اكتب رسالتك الأولى أدناه لبدء التفاوض أو الاستفسار الفني.',
                      'Send your first message below.'
                    )}
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === realUser.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          isMine ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                            isMine
                              ? 'bg-[#1769E8] text-white font-semibold'
                              : 'bg-white text-[#13243B] border border-[#DFE7F1] shadow-2xs font-medium'
                          }`}
                        >
                          <div
                            className={`text-[10px] font-bold mb-1 ${
                              isMine ? 'text-blue-100' : 'text-[#1769E8]'
                            }`}
                          >
                            {m.senderNameAr}
                          </div>
                          {m.text && <p className="leading-relaxed">{m.text}</p>}
                          {m.attachmentUrl && (
                            <div
                              onClick={() =>
                                openLightbox([m.attachmentUrl], 0, m.text || 'مرفق محادثة')
                              }
                              className="mt-2 rounded-xl overflow-hidden border border-white/20 cursor-zoom-in max-w-[220px]"
                            >
                              <img
                                src={m.attachmentUrl}
                                alt="مرفق"
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[10px] text-[#718096]">
                            {new Date(m.createdAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMine && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                              ✓✓ {t('تم التسليم', 'Delivered')}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setReplyingToMessage(m)}
                            className="text-[10px] font-extrabold text-[#1769E8] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Reply className="w-3 h-3" />
                            <span>{t('رد', 'Reply')}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Replying-To Quote Banner */}
              {replyingToMessage && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center justify-between gap-2 text-xs">
                  <div className="truncate text-[#071A33]">
                    <span className="font-extrabold text-[#1769E8]">
                      {t('الرد على رسالة:', 'Replying to:')}
                    </span>{' '}
                    <span>{replyingToMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReplyingToMessage(null)}
                    className="p-1 rounded-lg hover:bg-blue-100 text-[#13243B] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Quick Inquiry Templates */}
              <div className="px-3.5 py-2 bg-white border-t border-[#DFE7F1] flex items-center gap-1.5 overflow-x-auto">
                {[
                  'مرحبًا، أنا مهتم بالإعلان ده. ممكن أعرف تفاصيل أكتر؟',
                  'هل الماكينة متاحة للمعاينة والتجربة؟',
                  'يرجى إرسال عرض سعر نهائي شامل التوريد',
                  'ما هي حالة البرميل والفتيل والكنترول؟',
                ].map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setTextInput(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] hover:bg-blue-50 text-[#13243B] border border-[#DFE7F1] text-[11px] font-bold whitespace-nowrap cursor-pointer"
                  >
                    {tpl}
                  </button>
                ))}
              </div>

              {/* Attachment Preview */}
              {attachmentPreview && (
                <div className="px-4 py-2 bg-[#F4F7FC] border-t border-[#DFE7F1] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={attachmentPreview}
                      alt="معاينة المرفق"
                      className="w-12 h-12 rounded-lg object-cover border border-[#DFE7F1]"
                    />
                    <span className="text-xs font-bold text-[#13243B]">
                      {t('صورة جاهزة للإرسال', 'Image ready to send')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachmentPreview('')}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Composer Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white border-t border-[#DFE7F1] flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => attachInputRef.current?.click()}
                  title={t('إرفاق صورة', 'Attach image')}
                  className="p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] border border-[#DFE7F1] shrink-0 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#1769E8]" />
                </button>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('اكتب رسالتك للبائع أو الشركة...', 'Type your message...')}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm focus:outline-none focus:border-[#1769E8]"
                />
                <button
                  type="submit"
                  disabled={sending || (!textInput.trim() && !attachmentPreview)}
                  className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] disabled:opacity-50 text-white text-xs font-extrabold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('إرسال', 'Send')}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#718096]">
              <MessageSquare className="w-10 h-10 text-[#1769E8]/50 mb-2" />
              <p>
                {t(
                  'اختر محادثة من القائمة الجانبية أو اضغط على "تواصل مع البائع" في السوق الصناعي.',
                  'Select a conversation from the list or click "Contact Seller" in the Marketplace.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   REAL DATABASE-BACKED FAVORITES / SAVED ITEMS PAGE (/app/saved & /app/favorites)
   ============================================================================ */
export const SavedItemsPage: React.FC = () => {
  const {
    lang,
    t,
    isAuthenticated,
    savedIds,
    savedItems,
    removeSavedItem,
    market,
    requests,
    faults,
    openLightbox,
    startOrOpenConversation,
  } = usePlastico();
  const { formatPrice } = useThemeAndCurrency();
  const navigate = useNavigate();

  // Combine savedItems metadata with rich objects from market/requests/faults
  const enrichedItems = savedItems.map((record) => {
    const mkt = market.find((m) => m.id === record.itemId);
    const req = requests.find((r) => r.id === record.itemId);
    const flt = faults.find((f) => f.id === record.itemId);

    if (mkt) {
      const fp = formatPrice(mkt.price, mkt.currency);
      return {
        ...record,
        titleAr: mkt.titleAr,
        subtitleAr: `${lang === 'ar' ? fp.formattedAr : fp.formattedEn} · ${mkt.city} · ${mkt.conditionAr}`,
        badgeAr: mkt.categoryAr,
        image: mkt.image,
        images: mkt.images || [mkt.image],
        route: `/app/market/${mkt.id}`,
        sellerNameAr: mkt.sellerNameAr,
        sellerId: mkt.sellerId || `seller-${mkt.id}`,
      };
    }
    if (req) {
      return {
        ...record,
        titleAr: req.titleAr,
        subtitleAr: `الكمية: ${req.quantity.toLocaleString()} · ${req.city}`,
        badgeAr: 'طلب تصنيع RFQ',
        image: req.image,
        images: [req.image],
        route: `/app/manufacturing/requests/${req.id}`,
        sellerNameAr: req.publisherName,
        sellerId: `rfq-${req.id}`,
      };
    }
    if (flt) {
      return {
        ...record,
        titleAr: flt.titleAr,
        subtitleAr: `${flt.machineTypeAr} · ${flt.city}`,
        badgeAr: 'عطل فني',
        image: flt.image || IMAGE_MANIFEST.marketplace.injectionMachineWorkshop,
        images: [flt.image || IMAGE_MANIFEST.marketplace.injectionMachineWorkshop],
        route: `/app/faults/${flt.id}`,
        sellerNameAr: flt.publisherName,
        sellerId: flt.publisherId || `flt-${flt.id}`,
      };
    }
    return {
      ...record,
      subtitleAr: 'عنصر محفوظ في حسابك',
      badgeAr: record.itemType === 'market' ? 'السوق الصناعي' : 'عنصر محفوظ',
      image: IMAGE_MANIFEST.marketplace.injectionMachineStudio,
      images: [IMAGE_MANIFEST.marketplace.injectionMachineStudio],
      route: record.route || `/app/market/${record.itemId}`,
      sellerNameAr: 'مورد معتمد',
      sellerId: `item-${record.itemId}`,
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#13243B]">
              {t('قائمة المفضلة والعناصر المحفوظة', 'My Favorites & Saved Items')} ({savedIds.length})
            </h1>
            <p className="text-xs text-[#718096]">
              {t(
                'جميع الماكينات والخامات والإعلانات التي قمت بحفظها في قاعدة بيانات حسابك.',
                'All machines, materials, and listings saved to your account database.'
              )}
            </p>
          </div>
        </div>

        <Link
          to="/app/market"
          className="px-4 py-2 rounded-xl bg-[#071A33] hover:bg-[#1769E8] text-white text-xs font-extrabold transition-colors"
        >
          {t('تصفح السوق الصناعي', 'Browse Marketplace')}
        </Link>
      </div>

      {!isAuthenticated ? (
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-[#1769E8] mx-auto" />
          <h2 className="text-base font-extrabold text-[#13243B]">
            {t(
              'يرجى تسجيل الدخول لعرض وحفظ المفضلة الخاصة بحسابك',
              'Please sign in to view and save favorites'
            )}
          </h2>
          <div className="pt-2">
            <Link
              to="/auth/login?redirect=/app/saved"
              className="px-5 py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold inline-flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('تسجيل الدخول الآن', 'Sign In Now')}</span>
            </Link>
          </div>
        </div>
      ) : enrichedItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-8 text-center space-y-3">
          <Heart className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="text-base font-extrabold text-[#13243B]">
            {t('قائمة المفضلة فارغة حالياً', 'Your favorites list is currently empty')}
          </h2>
          <p className="text-xs text-[#718096] max-w-md mx-auto">
            {t(
              'اضغط على أيقونة القلب على أي ماكينة أو قالب أو خامة في السوق الصناعي لحفظها هنا والرجوع إليها في أي وقت.',
              'Click the heart icon on any machine, mold, or material in the Marketplace to save it here.'
            )}
          </p>
          <div className="pt-2">
            <Link
              to="/app/market"
              className="px-5 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-block"
            >
              {t('استكشاف الماكينات والمعدات', 'Explore Machinery & Equipment')}
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrichedItems.map((item) => (
            <div
              key={item.itemId}
              className="bg-white rounded-2xl border border-[#DFE7F1] overflow-hidden shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div
                  onClick={() => openLightbox(item.images, 0, item.titleAr)}
                  className="relative cursor-zoom-in"
                >
                  <IndustrialImage
                    src={item.image}
                    alt={item.titleAr}
                    aspectRatio="aspect-[16/10]"
                    className="w-full"
                  />
                  <span className="absolute top-3 start-3 px-2.5 py-1 rounded-lg bg-[#071A33]/90 text-white text-[11px] font-extrabold">
                    {item.badgeAr}
                  </span>
                </div>

                <div className="p-4 space-y-1.5">
                  <Link
                    to={item.route}
                    className="text-sm font-extrabold text-[#13243B] hover:text-[#1769E8] line-clamp-2"
                  >
                    {item.titleAr}
                  </Link>
                  <p className="text-xs font-bold text-[#1769E8]">
                    {item.subtitleAr}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-4 pt-2 border-t border-[#DFE7F1] flex items-center justify-between gap-2">
                <Link
                  to={item.route}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold text-center transition-colors"
                >
                  {t('فتح التفاصيل', 'View Details')}
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const convId = await startOrOpenConversation({
                      targetKey: item.sellerId,
                      targetNameAr: item.sellerNameAr,
                      contextType: 'market',
                      contextId: item.itemId,
                      contextTitleAr: item.titleAr,
                    });
                    if (convId) navigate(`/app/messages?convId=${convId}`);
                  }}
                  className="p-2 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white transition-colors cursor-pointer"
                  title={t('مراسلة المعلن', 'Message Seller')}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void removeSavedItem(item.itemId)}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-extrabold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title={t('إزالة من المفضلة', 'Remove from favorites')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('إزالة', 'Remove')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
