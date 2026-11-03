import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  User,
  Building2,
  Wrench,
  Truck,
  Store,
  Compass,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Globe,
  Phone,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { PlasticoLogo } from '../components/PlasticoLogo';
import { AccountType } from '../types/plastico';
import { REGISTRATION_ROLE_CARDS, RoleVisualCardConfig } from '../data/visualAssetMap';
import { triggerAssistantWelcomeIntro } from '../components/SmartPlasticoAssistant';
import {
  ROLE_SKILLS_OPTIONS,
  getRoleSectionTitles,
  sanitizeRoleSkills,
  serializeRoleExtendedMetadata,
} from '../data/roleFieldsConfig';

function localizeAuthError(rawError: string | undefined, lang: 'ar' | 'en'): string {
  const err = (rawError || '').trim();
  if (!err) {
    return lang === 'ar'
      ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.'
      : 'Incorrect email or password. Please check your credentials and try again.';
  }
  const lower = err.toLowerCase();
  if (
    lower.includes('غير صحيح') ||
    lower.includes('invalid') ||
    lower.includes('incorrect') ||
    lower.includes('بيانات الدخول')
  ) {
    return lang === 'ar'
      ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات المدخلة.'
      : 'Incorrect email/phone or password. Please verify your credentials.';
  }
  if (
    lower.includes('خادم') ||
    lower.includes('اتصال') ||
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('server')
  ) {
    return lang === 'ar'
      ? 'تعذر الاتصال بالخادم حالياً. يرجى التحقق من اتصالك بالإنترنت والمحاولة مجدداً.'
      : 'Failed to connect to the server. Please check your connection and try again.';
  }
  if (lower.includes('انتهت') || lower.includes('جلس') || lower.includes('expired')) {
    return lang === 'ar'
      ? 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى للمتابعة.'
      : 'Your session has expired. Please sign in again to continue.';
  }
  return err;
}

/* ============================================================================
   REAL LOGIN PAGE (/auth/login)
   Matches the reference Login Card & connects to POST /api/auth/login
   ============================================================================ */
export const LoginPage: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    loginWithRealCredentials,
    loginWithGoogleAccount,
    enterVisitorMode,
  } = usePlastico();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/app/home';
  const sessionExpiredParam = searchParams.get('expired') === '1';

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    sessionExpiredParam
      ? localizeAuthError('انتهت الجلسة', lang)
      : null
  );

  const errorAlertRef = useRef<HTMLDivElement | null>(null);
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const scrollErrorIntoView = () => {
    window.requestAnimationFrame(() => {
      if (errorAlertRef.current) {
        errorAlertRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        errorAlertRef.current.focus({ preventScroll: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  useEffect(() => {
    if (errorMsg) {
      scrollErrorIntoView();
    }
  }, [errorMsg]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const result = await loginWithRealCredentials({
        emailOrPhone,
        password,
        rememberMe,
      });

      setSubmitting(false);
      if (!result.ok) {
        const localized = localizeAuthError(result.error, lang);
        setErrorMsg(localized);
        scrollErrorIntoView();
        return;
      }
      triggerAssistantWelcomeIntro();
      navigate(redirectTarget);
    } catch {
      setSubmitting(false);
      const localized = localizeAuthError('فشل الاتصال بالخادم', lang);
      setErrorMsg(localized);
      scrollErrorIntoView();
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const result = await loginWithGoogleAccount('engineer');
    setSubmitting(false);
    if (!result.ok) {
      const localized = localizeAuthError(
        result.error || 'تعذر تسجيل الدخول عبر Google.',
        lang
      );
      setErrorMsg(localized);
      scrollErrorIntoView();
      return;
    }
    triggerAssistantWelcomeIntro();
    navigate(redirectTarget);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Link to="/">
          <PlasticoLogo variant="horizontal" theme="light" size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
          >
            <Globe className="w-3.5 h-3.5 text-[#1769E8]" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              enterVisitorMode();
              navigate('/app/home');
            }}
            className="px-3.5 py-1.5 rounded-lg bg-white border border-[#DFE7F1] text-xs font-bold text-[#13243B] hover:border-[#1769E8] cursor-pointer"
          >
            {t('تصفح كزائر', 'Browse as Visitor')}
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#DFE7F1] shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <PlasticoLogo variant="horizontal" theme="light" size="md" />
            <h1 className="text-2xl font-extrabold text-[#13243B] mt-5">
              {t('مرحباً بك في بلاستيكو', 'Welcome to PLASTICO')}
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] font-medium mt-1">
              {t(
                'سجل الدخول للوصول إلى عالم بلاستيكو وإدارة حسابك الصناعي',
                'Sign in to access the PLASTICO ecosystem and manage your account'
              )}
            </p>
          </div>

          {errorMsg && (
            <div
              ref={errorAlertRef}
              tabIndex={-1}
              role="alert"
              aria-live="assertive"
              data-testid="login-error-alert"
              className="scroll-mt-24 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs sm:text-sm font-extrabold flex items-start gap-2.5 shadow-md transition-all duration-200 focus:outline-none"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-black text-rose-900 mb-0.5">
                  {t('تنبيه تسجيل الدخول', 'Sign-In Alert')}
                </div>
                <span className="leading-relaxed block break-words">{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email or Phone */}
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1.5">
                {t('البريد الإلكتروني أو رقم الهاتف', 'Email or Phone Number')}
              </label>
              <div className="flex items-center input-3d rounded-xl px-3.5 py-3">
                <Mail className="w-4 h-4 text-[#718096] shrink-0" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={t(
                    'البريد الإلكتروني أو رقم الهاتف',
                    'Email address or phone number'
                  )}
                  className="flex-1 min-w-0 px-3 bg-transparent text-xs sm:text-sm text-[#13243B] placeholder-[#718096] focus:outline-none"
                />
              </div>
            </div>

            {/* Password with Show/Hide */}
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1.5">
                {t('كلمة المرور', 'Password')}
              </label>
              <div className="flex items-center input-3d rounded-xl px-3.5 py-3">
                <Lock className="w-4 h-4 text-[#718096] shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('كلمة المرور', 'Password')}
                  className="flex-1 min-w-0 px-3 bg-transparent text-xs sm:text-sm text-[#13243B] placeholder-[#718096] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={t('إظهار أو إخفاء كلمة المرور', 'Toggle password visibility')}
                  className="text-[#718096] hover:text-[#13243B]"
                >
                  {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 font-bold text-[#13243B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#DFE7F1] text-[#1769E8] focus:ring-[#1769E8]"
                />
                <span>{t('تذكرني', 'Remember me')}</span>
              </label>

              <Link
                to="/auth/forgot-password"
                className="font-extrabold text-[#1769E8] hover:underline"
              >
                {t('نسيت كلمة المرور؟', 'Forgot password?')}
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] disabled:opacity-50 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>
                {submitting
                  ? t('جاري تسجيل الدخول...', 'Signing in...')
                  : t('تسجيل الدخول', 'Sign In')}
              </span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3">
              <div className="h-px bg-[#DFE7F1] flex-1" />
              <span className="text-xs font-bold text-[#718096]">
                {t('أو سجل باستخدام', 'Or sign in with')}
              </span>
              <div className="h-px bg-[#DFE7F1] flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#F4F7FC] hover:bg-slate-200/70 border border-[#DFE7F1] text-[#13243B] text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-white border border-[#DFE7F1] flex items-center justify-center text-xs font-black text-[#EA4335]">
                G
              </span>
              <span>{t('تسجيل الدخول عبر Google', 'Continue with Google')}</span>
            </button>

            {/* Visitor Read-Only Mode Button */}
            <button
              type="button"
              data-testid="enter-visitor-btn"
              onClick={() => {
                enterVisitorMode();
                navigate(redirectTarget);
              }}
              className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#FF8A2A] shrink-0" />
              <span>
                {t(
                  'الدخول كزائر (تصفح فقط بدون نشر أو تعليق)',
                  'Enter as Visitor (Read-Only Browsing Only)'
                )}
              </span>
            </button>
          </div>

          <div className="text-center text-xs font-bold text-[#718096] pt-2 border-t border-[#DFE7F1]">
            {t('ليس لديك حساب؟', "Don't have an account?")}{' '}
            <Link
              to="/auth/register"
              className="text-[#1769E8] font-extrabold hover:underline"
            >
              {t('إنشاء حساب جديد', 'Create a new account')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   REAL TWO-STEP REGISTRATION PAGE (/auth/register)
   Step 1: Full name, Email, Password, Confirm password, Country, Account type
   Step 2: Dynamic Role-Specific Profile Completion
   ============================================================================ */
export const RegisterPage: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    registerRealAccount,
    saveRealProfileUpdate,
    enterVisitorMode,
  } = usePlastico();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('مصر');
  const [city, setCity] = useState('العاشر من رمضان');
  const [selectedRoleCardId, setSelectedRoleCardId] =
    useState<RoleVisualCardConfig['id']>('engineer');
  const [accountType, setAccountType] = useState<AccountType>('engineer');
  const [showPass, setShowPass] = useState(false);

  // Common Step 2 Fields
  const [specialty, setSpecialty] = useState('هندسة تشغيل وضبط جودة البوليمرات');
  const [jobTitle, setJobTitle] = useState('مهندس إنتاج وجودة');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [bio, setBio] = useState('');
  const [educationAndCerts, setEducationAndCerts] = useState('');
  const [machinesAndSystems, setMachinesAndSystems] = useState('Haitian MA-2500، Engel Victory');
  const [pastExperienceSummary, setPastExperienceSummary] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'هندسة تشغيل وضبط عمليات الحقن (Process Engineering)',
    'توكيد ومراقبة الجودة (QA / QC & MFI Testing)',
  ]);

  // Factory-Specific Extended Fields
  const [factoryActivityType, setFactoryActivityType] = useState('حقن ونفخ عبوات ومنتجات بلاستيكية');
  const [machinesCount, setMachinesCount] = useState('12 ماكينة وخط إنتاج');
  const [productionCapacity, setProductionCapacity] = useState('450 طن شهرياً');
  const [productsManufactured, setProductsManufactured] = useState('عبوات دوائية، جراكن HDPE، وصناديق صناعية');

  // Engineer-Specific Extended Fields
  const [industrialSectors, setIndustrialSectors] = useState('الحقن، القوالب، والتغليف الدوائي');
  const [softwareAndSystems, setSoftwareAndSystems] = useState('SolidWorks, Moldflow, AutoCAD, Siemens PLC');

  // Supplier-Specific Extended Fields (Raw Materials & Masterbatch ONLY)
  const [supplierProducts, setSupplierProducts] = useState('خامات PP حَقن وسحب، HDPE نفخ وفيلم، ماسترباتش ألوان وأبيض');
  const [supplierBrands, setSupplierBrands] = useState('SABIC, Borouge, Tasnee, EPPC');
  const [supplyScope, setSupplyScope] = useState('توريد محلي ودولي — كميات كبيرة وصغيرة مع توفير عينات وداتا شيت');
  const [countriesServed, setCountriesServed] = useState('مصر، السعودية، الإمارات، الأردن');

  // Trader-Specific Extended Fields (Machinery & Equipment)
  const [equipmentTypes, setEquipmentTypes] = useState('ماكينات حقن، ماكينات نفخ، شيلرات، ومجففات');
  const [conditionOffered, setConditionOffered] = useState('جديد ومستعمل مفحوص فنياً');
  const [traderBrands, setTraderBrands] = useState('Haitian, Engel, Chen Hsong, KraussMaffei');
  const [buySellServices, setBuySellServices] = useState('بيع وشراء واستبدال خطوط الإنتاج والماكينات');
  const [sparePartsAndMaintenance, setSparePartsAndMaintenance] = useState('متوفر قطع غيار (فتيل، براميل، هيدروليك) وصيانة ما قبل التسليم');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const registerErrorRef = useRef<HTMLDivElement | null>(null);

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (errorMsg && registerErrorRef.current) {
      registerErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMsg]);

  const handleSelectRoleCard = (card: RoleVisualCardConfig) => {
    const newRole = card.dbRole as AccountType;
    setSelectedRoleCardId(card.id);
    setAccountType(newRole);
    setSpecialty(card.defaultSpecialtyAr);
    const defaultRoleSkills = ROLE_SKILLS_OPTIONS[newRole] || [];
    setSelectedSkills(defaultRoleSkills.slice(0, 3));
    if (newRole === 'supplier') {
      setMachinesAndSystems('SABIC, Borouge, Tasnee');
    } else if (newRole === 'engineer') {
      setMachinesAndSystems('SolidWorks, Moldflow, Haitian CNC');
    } else {
      setMachinesAndSystems('Haitian MA-2500، Engel Victory');
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(t('تأكيد كلمة المرور غير مطابق.', 'Passwords do not match.'));
      return;
    }
    if (password.length < 6) {
      setErrorMsg(
        t(
          'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.',
          'Password must be at least 6 characters.'
        )
      );
      return;
    }

    setSubmitting(true);
    const result = await registerRealAccount({
      fullName,
      email,
      password,
      confirmPassword,
      country,
      city,
      accountType,
    });
    setSubmitting(false);

    if (!result.ok) {
      setErrorMsg(localizeAuthError(result.error || 'تعذر إنشاء الحساب.', lang));
      return;
    }

    triggerAssistantWelcomeIntro();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Complete = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const cleanedSkills = sanitizeRoleSkills(accountType, selectedSkills);
    const extendedMeta = serializeRoleExtendedMetadata({
      factoryActivityType: accountType === 'factory' ? factoryActivityType : undefined,
      machinesCount: accountType === 'factory' ? machinesCount : undefined,
      productionCapacity: accountType === 'factory' ? productionCapacity : undefined,
      productsManufactured: accountType === 'factory' ? productsManufactured : undefined,
      desiredOrCurrentJob: accountType === 'technician' ? jobTitle : undefined,
      industrialSectors: accountType === 'engineer' ? industrialSectors : undefined,
      softwareAndSystems: accountType === 'engineer' ? softwareAndSystems : undefined,
      supplierProducts: accountType === 'supplier' ? supplierProducts : undefined,
      supplierBrands: accountType === 'supplier' ? supplierBrands : undefined,
      supplyScope: accountType === 'supplier' ? supplyScope : undefined,
      countriesServed: accountType === 'supplier' ? countriesServed : undefined,
      equipmentTypes: accountType === 'trader' ? equipmentTypes : undefined,
      conditionOffered: accountType === 'trader' ? conditionOffered : undefined,
      traderBrands: accountType === 'trader' ? traderBrands : undefined,
      buySellServices: accountType === 'trader' ? buySellServices : undefined,
      sparePartsAndMaintenance: accountType === 'trader' ? sparePartsAndMaintenance : undefined,
    });

    const parsedMachines = (
      accountType === 'supplier'
        ? supplierBrands
        : accountType === 'trader'
        ? traderBrands
        : accountType === 'engineer'
        ? softwareAndSystems
        : machinesAndSystems
    )
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedCerts = educationAndCerts
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    await saveRealProfileUpdate({
      name: fullName,
      accountType,
      country,
      city,
      jobTitle: jobTitle || specialty,
      specialty: accountType === 'factory' ? factoryActivityType : specialty,
      companyName,
      phone,
      experienceYears,
      bio,
      education: educationAndCerts,
      workPreferences: extendedMeta,
      skills: cleanedSkills,
      machines: parsedMachines,
      certificates: parsedCerts,
      experiences: pastExperienceSummary.trim()
        ? [
            {
              title: jobTitle || specialty,
              company: companyName || pastExperienceSummary.trim(),
              years: `${experienceYears} سنوات`,
            },
          ]
        : undefined,
    });
    setSubmitting(false);
    triggerAssistantWelcomeIntro();
    navigate('/app/home');
  };

  const toggleSkill = (sk: string) => {
    setSelectedSkills((prev) =>
      prev.includes(sk) ? prev.filter((x) => x !== sk) : [...prev, sk]
    );
  };

  const roleLabels = getRoleSectionTitles(accountType);
  const availableRoleSkills = ROLE_SKILLS_OPTIONS[accountType] || ROLE_SKILLS_OPTIONS.engineer;

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-between overflow-x-hidden">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 flex items-center justify-between">
        <Link to="/">
          <PlasticoLogo variant="horizontal" theme="light" size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
          >
            <Globe className="w-3.5 h-3.5 text-[#1769E8]" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
          <Link
            to="/auth/login"
            className="px-3.5 py-1.5 rounded-lg bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#1769E8]"
          >
            {t('تسجيل الدخول', 'Sign In')}
          </Link>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#DFE7F1] shadow-xl p-4 sm:p-8 space-y-5">
          {/* Step Indicator */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold text-[#1769E8]">
                {step === 1
                  ? t('الخطوة 1 من 2 — بيانات الحساب الأساسية', 'Step 1 of 2 — Core Account Details')
                  : t(
                      `الخطوة 2 من 2 — ${roleLabels.roleTitleAr}`,
                      `Step 2 of 2 — ${roleLabels.roleTitleEn}`
                    )}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#13243B] mt-1">
                {step === 1
                  ? t('إنشاء حساب جديد في بلاستيكو', 'Create Your PLASTICO Account')
                  : t(roleLabels.roleTitleAr, roleLabels.roleTitleEn)}
              </h1>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-extrabold text-[#071A33] font-mono-num shrink-0">
              {step}/2
            </div>
          </div>

          {errorMsg && (
            <div
              ref={registerErrorRef}
              role="alert"
              data-testid="register-error-alert"
              className="scroll-mt-24 p-3.5 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('الاسم الكامل أو اسم الجهة', 'Full Name')} *
                </label>
                <div className="flex items-center input-3d rounded-xl px-3.5 py-2.5">
                  <User className="w-4 h-4 text-[#718096] shrink-0" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('مثال: م. أحمد محمود علي', 'e.g., Eng. Ahmed Mahmoud')}
                    className="flex-1 min-w-0 px-3 bg-transparent text-xs sm:text-sm text-[#13243B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t('البريد الإلكتروني', 'Email Address')} *
                </label>
                <div className="flex items-center input-3d rounded-xl px-3.5 py-2.5">
                  <Mail className="w-4 h-4 text-[#718096] shrink-0" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="flex-1 min-w-0 px-3 bg-transparent text-xs sm:text-sm text-[#13243B] focus:outline-none"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('كلمة المرور', 'Password')} *
                  </label>
                  <div className="flex items-center input-3d rounded-xl px-3.5 py-2.5">
                    <Lock className="w-4 h-4 text-[#718096] shrink-0" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('6 أحرف على الأقل', 'Min 6 characters')}
                      className="flex-1 min-w-0 px-2.5 bg-transparent text-xs sm:text-sm text-[#13243B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-[#718096]"
                    >
                      {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('تأكيد كلمة المرور', 'Confirm Password')} *
                  </label>
                  <div className="flex items-center input-3d rounded-xl px-3.5 py-2.5">
                    <Lock className="w-4 h-4 text-[#718096] shrink-0" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('أعد كتابة كلمة المرور', 'Repeat password')}
                      className="flex-1 min-w-0 px-2.5 bg-transparent text-xs sm:text-sm text-[#13243B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Country & Industrial City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('الدولة', 'Country')} *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#13243B]"
                  >
                    <option value="مصر">{t('مصر', 'Egypt')}</option>
                    <option value="السعودية">{t('السعودية', 'Saudi Arabia')}</option>
                    <option value="الإمارات">{t('الإمارات', 'UAE')}</option>
                    <option value="الأردن">{t('الأردن', 'Jordan')}</option>
                    <option value="المغرب">{t('المغرب', 'Morocco')}</option>
                    <option value="الجزائر">{t('الجزائر', 'Algeria')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#13243B] mb-1">
                    {t('المدينة الصناعية', 'Industrial City')}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full input-3d rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#13243B]"
                  />
                </div>
              </div>

              {/* Visually Rich Role Account Type Selection Cards */}
              <div className="space-y-2.5 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs sm:text-sm font-extrabold text-[#13243B]">
                    {t(
                      'اختر دورك الصناعي في بلاستيكو (يخصص حقول التسجيل والملف المهني)',
                      'Select Your Industrial Role in PLASTICO'
                    )}{' '}
                    *
                  </label>
                  <span className="text-[11px] font-bold text-[#1769E8]">
                    {t('محدد حالياً:', 'Selected:')}{' '}
                    {t(
                      REGISTRATION_ROLE_CARDS.find((r) => r.id === selectedRoleCardId)?.titleAr || '',
                      REGISTRATION_ROLE_CARDS.find((r) => r.id === selectedRoleCardId)?.titleEn || ''
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  {REGISTRATION_ROLE_CARDS.map((roleCard) => {
                    const active = selectedRoleCardId === roleCard.id;
                    return (
                      <button
                        key={roleCard.id}
                        type="button"
                        data-testid={`role-card-${roleCard.id}`}
                        onClick={() => handleSelectRoleCard(roleCard)}
                        aria-pressed={active}
                        className={`group rounded-2xl border overflow-hidden text-start transition-all flex flex-col justify-between cursor-pointer ${
                          active
                            ? 'bg-[#1769E8]/6 border-[#1769E8] ring-2 ring-[#1769E8] shadow-md'
                            : 'bg-[#F4F7FC] border-[#DFE7F1] hover:border-[#1769E8]/60 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="relative aspect-[4/3] w-full bg-[#071A33] overflow-hidden">
                            <img
                              src={roleCard.image}
                              alt={t(roleCard.titleAr, roleCard.titleEn)}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            />
                            <span
                              className={`absolute top-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold backdrop-blur-xs ${
                                active
                                  ? 'bg-[#FF8A2A] text-white'
                                  : 'bg-[#071A33]/80 text-[#27BED6] border border-white/15'
                              }`}
                            >
                              {t(roleCard.badgeAr, roleCard.badgeEn)}
                            </span>
                            {active && (
                              <span className="absolute top-2 end-2 w-6 h-6 rounded-full bg-[#1769E8] text-white flex items-center justify-center shadow-md">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                          <div className="p-2.5 sm:p-3 space-y-1">
                            <div className="text-xs sm:text-[13px] font-extrabold text-[#13243B] leading-snug">
                              {t(roleCard.titleAr, roleCard.titleEn)}
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-[#718096] leading-relaxed line-clamp-2">
                              {t(roleCard.subtitleAr, roleCard.subtitleEn)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] disabled:opacity-50 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>
                  {submitting
                    ? t('جاري إنشاء الحساب...', 'Creating account...')
                    : t('إنشاء الحساب والمتابعة لتخصيص ملفك', 'Create Account & Continue')}
                </span>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                data-testid="register-visitor-btn"
                onClick={() => {
                  enterVisitorMode();
                  navigate('/app/home');
                }}
                className="w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#FF8A2A] shrink-0" />
                <span>
                  {t(
                    'المتابعة كزائر (تصفح فقط بدون نشر أو تعليق)',
                    'Continue as Visitor (View-Only Mode)'
                  )}
                </span>
              </button>

              <div className="text-center text-xs font-bold text-[#718096] pt-2 border-t border-[#DFE7F1]">
                {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                <Link
                  to="/auth/login"
                  className="text-[#1769E8] font-extrabold hover:underline"
                >
                  {t('تسجيل الدخول', 'Sign In')}
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: Dynamic Role-Specific Details for Each of the 5 Industrial Roles */
            <form
              onSubmit={handleStep2Complete}
              data-testid={`register-step2-${accountType}`}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {t(
                    'تم حفظ حسابك في قاعدة البيانات! أكمل الآن البيانات المخصصة لدورك الصناعي لبناء ملفك المهني المتكامل.',
                    'Account created! Complete the fields tailored to your industrial role below.'
                  )}
                </span>
              </div>

              {/* ROLE 1: FACTORY OWNER ('factory') */}
              {accountType === 'factory' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {t('بيانات المصنع وخطوط الإنتاج والطاقة التصنيعية', 'Factory & Production Capacity Details')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('اسم المصنع', 'Factory Name')} *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={t('مثال: مصنع الدلتا للصناعات البلاستيكية', 'e.g., Delta Plastics Factory')}
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('نوع النشاط الصناعي', 'Industrial Activity Type')}
                      </label>
                      <input
                        type="text"
                        value={factoryActivityType}
                        onChange={(e) => setFactoryActivityType(e.target.value)}
                        placeholder={t('حقن، نفخ، سحب مواسير، فيلم وتغليف...', 'Injection, Blow, Extrusion, Film...')}
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('عدد الماكينات وخطوط الإنتاج', 'Number of Machines')}
                      </label>
                      <input
                        type="text"
                        value={machinesCount}
                        onChange={(e) => setMachinesCount(e.target.value)}
                        placeholder="مثال: 14 ماكينة حقن ونفخ"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('الطاقة الإنتاجية الشهرية', 'Monthly Production Capacity')}
                      </label>
                      <input
                        type="text"
                        value={productionCapacity}
                        onChange={(e) => setProductionCapacity(e.target.value)}
                        placeholder="مثال: 500 طن / شهر"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('بيانات التواصل (هاتف / واتساب المصنع)', 'Factory Contact Phone')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+20 100 000 0000"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#13243B] mb-1">
                      {t('المنتجات التي يصنعها المصنع', 'Products Manufactured')}
                    </label>
                    <input
                      type="text"
                      value={productsManufactured}
                      onChange={(e) => setProductsManufactured(e.target.value)}
                      placeholder="مثال: عبوات غذائية ودوائية، جراكن HDPE، صناديق بلاستيكية، مواسير UPVC"
                      className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* ROLE 2: TECHNICIAN & WORKER ('technician') */}
              {accountType === 'technician' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {t('بيانات الفني والعامل الصناعي', 'Technician & Worker Details')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('التخصص الصناعي', 'Industrial Specialty')}
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="مثال: فني تشغيل وضبط قوالب حقن بلاستيك"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('الوظيفة الحالية أو المطلوبة', 'Current or Desired Job')}
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="مثال: مشرف وردية حقن / فني صيانة قوالب"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('سنوات الخبرة العملية', 'Years of Experience')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('الماكينات التي تمتلك خبرة بها', 'Machines Experienced With')}
                      </label>
                      <input
                        type="text"
                        value={machinesAndSystems}
                        onChange={(e) => setMachinesAndSystems(e.target.value)}
                        placeholder="Haitian، Chen Hsong، ماكينات نفخ وسحب"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('رقم الهاتف للتواصل', 'Contact Phone')}
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+20 100 000 0000"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('الخبرات السابقة (المصانع التي عملت بها)', 'Previous Experiences')}
                      </label>
                      <input
                        type="text"
                        value={pastExperienceSummary}
                        onChange={(e) => setPastExperienceSummary(e.target.value)}
                        placeholder="مثال: مصنع الوطنية للبلاستيك (4 سنوات)"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('المؤهلات والشهادات الفنية', 'Qualifications & Certificates')}
                      </label>
                      <input
                        type="text"
                        value={educationAndCerts}
                        onChange={(e) => setEducationAndCerts(e.target.value)}
                        placeholder="مثال: دبلوم صناعي + شهادة صيانة هيدروليك"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 3: ENGINEER ('engineer') */}
              {accountType === 'engineer' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {t('بيانات المهندس الصناعي والخبرات الهندسية', 'Industrial Engineer Details')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('التخصص الهندسي', 'Engineering Specialty')}
                      </label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="مثال: هندسة ميكانيكا وإنتاج / هندسة بوليمرات وجودة"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('المجالات الصناعية', 'Industrial Sectors')}
                      </label>
                      <input
                        type="text"
                        value={industrialSectors}
                        onChange={(e) => setIndustrialSectors(e.target.value)}
                        placeholder="الحقن، القوالب، النفخ، الفيلم، وتوكيد الجودة"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('سنوات الخبرة العملية', 'Practical Experience (Years)')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('البرامج والأنظمة التي تجيد استخدامها', 'Software & Systems Mastered')}
                      </label>
                      <input
                        type="text"
                        value={softwareAndSystems}
                        onChange={(e) => setSoftwareAndSystems(e.target.value)}
                        placeholder="SolidWorks, Moldflow, AutoCAD, Siemens PLC, ERP, ISO 9001"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('المؤهلات والشهادات المعتمدة', 'Qualifications & Certificates')}
                      </label>
                      <input
                        type="text"
                        value={educationAndCerts}
                        onChange={(e) => setEducationAndCerts(e.target.value)}
                        placeholder="بكالوريوس هندسة، Six Sigma Green Belt، PMP"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('الخبرات والمشروعات السابقة', 'Past Experiences & Projects')}
                      </label>
                      <input
                        type="text"
                        value={pastExperienceSummary}
                        onChange={(e) => setPastExperienceSummary(e.target.value)}
                        placeholder="تأسيس خط حقن عبوات طبية وتقليل الهالك بنسبة 18%"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 4: RAW MATERIALS & MASTERBATCH SUPPLIER ('supplier') */}
              {accountType === 'supplier' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {t(
                      'بيانات مورد الخامات والماسترباتش ونطاق التوريد',
                      'Raw Materials & Masterbatch Supplier Details'
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('اسم شركة التوريد أو الوكالة', 'Supplier Company Name')} *
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="مثال: الشركة العربية لتوريد البوليمرات والماسترباتش"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('المنتجات والدرجات المتوفرة', 'Supplied Polymer Grades & Products')}
                      </label>
                      <input
                        type="text"
                        value={supplierProducts}
                        onChange={(e) => setSupplierProducts(e.target.value)}
                        placeholder="خامات PP، PE، PET، PVC، ABS، ماسترباتش ألوان وأبيض وأسود"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('العلامات التجارية المتوفرة', 'Brands Supplied')}
                      </label>
                      <input
                        type="text"
                        value={supplierBrands}
                        onChange={(e) => setSupplierBrands(e.target.value)}
                        placeholder="SABIC, Borouge, Tasnee, ExxonMobil"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('نطاق التوريد والكميات', 'Supply Scope & Volumes')}
                      </label>
                      <input
                        type="text"
                        value={supplyScope}
                        onChange={(e) => setSupplyScope(e.target.value)}
                        placeholder="توريد محلي ودولي — كميات كبيرة وصغيرة + عينات"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('الدول والمناطق التي يخدمها المورد', 'Countries & Regions Served')}
                      </label>
                      <input
                        type="text"
                        value={countriesServed}
                        onChange={(e) => setCountriesServed(e.target.value)}
                        placeholder="مصر، السعودية، الإمارات، الأردن، المغرب"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ROLE 5: MACHINERY & EQUIPMENT TRADER ('trader') */}
              {accountType === 'trader' && (
                <div className="space-y-3.5 p-4 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1]">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {t(
                      'بيانات تاجر الماكينات والمعدات الصناعية',
                      'Machinery & Equipment Trader Details'
                    )}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('اسم المعرض أو الشركة التجارية', 'Showroom / Company Name')}
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="مثال: الدولية لتجارة ماكينات البلاستيك المستعملة والجديدة"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('أنواع الماكينات والمعدات', 'Types of Machinery & Equipment')}
                      </label>
                      <input
                        type="text"
                        value={equipmentTypes}
                        onChange={(e) => setEquipmentTypes(e.target.value)}
                        placeholder="ماكينات حقن، نفخ، خطوط سحب، كسارات، شيلرات، وسخانات"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('حالة المعدات (جديد / مستعمل)', 'New or Used Status')}
                      </label>
                      <select
                        value={conditionOffered}
                        onChange={(e) => setConditionOffered(e.target.value)}
                        className="w-full input-3d rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold text-[#13243B]"
                      >
                        <option value="جديد ومستعمل مفحوص فنياً">
                          {t('جديد ومستعمل مفحوص فنياً', 'New & Inspected Used')}
                        </option>
                        <option value="ماكينات مستعملة استيراد خارج">
                          {t('ماكينات مستعملة استيراد خارج', 'Imported Used Machinery')}
                        </option>
                        <option value="ماكينات ومعدات جديدة بالضمان">
                          {t('ماكينات ومعدات جديدة بالضمان', 'Brand New with Warranty')}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('العلامات التجارية المتوفرة', 'Machinery Brands')}
                      </label>
                      <input
                        type="text"
                        value={traderBrands}
                        onChange={(e) => setTraderBrands(e.target.value)}
                        placeholder="Haitian, Engel, Arburg, KraussMaffei, Battenfeld"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#13243B] mb-1">
                        {t('خدمات البيع والشراء وقطع الغيار والصيانة', 'Buy/Sell, Spare Parts & Maintenance')}
                      </label>
                      <input
                        type="text"
                        value={sparePartsAndMaintenance}
                        onChange={(e) => setSparePartsAndMaintenance(e.target.value)}
                        placeholder="بيع وشراء واستبدال + توفير قطع غيار وصيانة"
                        className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-SpecificSelectable Options / Capabilities Chips */}
              <div>
                <label className="block text-xs font-extrabold text-[#13243B] mb-1.5">
                  {t(roleLabels.skillsLabelAr, roleLabels.skillsLabelEn)}
                </label>
                <div
                  className="flex flex-wrap gap-1.5"
                  data-testid="role-specific-skills-list"
                >
                  {availableRoleSkills.map((sk) => {
                    const active = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => toggleSkill(sk)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${
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

              <div>
                <label className="block text-xs font-bold text-[#13243B] mb-1">
                  {t(roleLabels.bioLabelAr, roleLabels.bioLabelEn)}
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t(
                    'اكتب نبذة مختصرة تظهر في ملفك المهني أمام المصانع والشركات...',
                    'Write a brief summary displayed on your industrial profile...'
                  )}
                  className="w-full input-3d rounded-xl px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/app/home')}
                  className="px-4 py-3 rounded-xl bg-[#F4F7FC] hover:bg-slate-200/70 text-[#13243B] text-xs font-extrabold cursor-pointer"
                >
                  {t('تخطي وإكمال لاحقاً', 'Skip & Complete Later')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {submitting
                      ? t('جاري الحفظ...', 'Saving...')
                      : t('حفظ الملف المخصص والدخول للمنصة', 'Save Role Profile & Open Platform')}
                  </span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   PASSWORD RESET PAGE (/auth/forgot-password)
   ============================================================================ */
export const ForgotPasswordPage: React.FC = () => {
  const { t } = usePlastico();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'redeem' | 'done'>('request');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'تعذر إرسال الطلب.');
      } else {
        setMessage(data.message);
        if (data.previewResetToken) {
          setResetToken(data.previewResetToken);
        }
        setStep('redeem');
      }
    } catch {
      setErrorMsg('تعذر الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'رمز الاستعادة غير صالح.');
      } else {
        setMessage(data.message);
        setStep('done');
      }
    } catch {
      setErrorMsg('تعذر الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex flex-col justify-center px-4 py-10">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-[#DFE7F1] p-6 sm:p-8 shadow-xl space-y-5">
        <PlasticoLogo variant="horizontal" theme="light" size="sm" />
        <div>
          <h1 className="text-xl font-extrabold text-[#13243B]">
            {t('استعادة كلمة المرور', 'Reset Your Password')}
          </h1>
          <p className="text-xs text-[#718096] mt-1">
            {t(
              'أدخل بريدك الإلكتروني لإصدار رمز آمن لإعادة تعيين كلمة المرور.',
              'Enter your email address to generate a time-limited password reset token.'
            )}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {message && (
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-[#13243B] text-xs font-bold">
            {message}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('البريد الإلكتروني المسجل', 'Registered Email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs sm:text-sm font-extrabold"
            >
              {loading
                ? t('جاري المعالجة...', 'Processing...')
                : t('إرسال رمز الاستعادة', 'Send Reset Token')}
            </button>
          </form>
        )}

        {step === 'redeem' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('رمز الاستعادة (صالح لمدة 30 دقيقة)', 'Reset Token (Valid 30m)')}
              </label>
              <div className="flex items-center input-3d rounded-xl px-3 py-2.5">
                <KeyRound className="w-4 h-4 text-[#1769E8]" />
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="flex-1 px-2 bg-transparent text-xs font-mono-num focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#13243B] mb-1">
                {t('كلمة المرور الجديدة', 'New Password')}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('6 أحرف على الأقل', 'At least 6 characters')}
                className="w-full input-3d rounded-xl px-3.5 py-2.5 text-xs sm:text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs sm:text-sm font-extrabold"
            >
              {t('تحديث كلمة المرور الآن', 'Update Password Now')}
            </button>
          </form>
        )}

        {step === 'done' && (
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="w-full py-3 rounded-xl bg-[#1769E8] text-white text-xs sm:text-sm font-extrabold"
          >
            {t('الانتقال لتسجيل الدخول', 'Proceed to Sign In')}
          </button>
        )}

        <div className="text-center pt-2 border-t border-[#DFE7F1]">
          <Link to="/auth/login" className="text-xs font-extrabold text-[#1769E8]">
            {t('العودة لتسجيل الدخول', 'Back to Sign In')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export const OnboardingRolePage: React.FC = () => <RegisterPage />;
export const OnboardingSetupPage: React.FC = () => <RegisterPage />;

/* ============================================================================
   About, How It Works & Contact Pages
   ============================================================================ */
export const AboutPage: React.FC = () => {
  const { t } = usePlastico();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE7F1] shadow-xs space-y-4">
        <PlasticoLogo variant="horizontal" size="md" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#13243B]">
          {t('عن منصة بلاستيكو PLASTICO', 'About PLASTICO Platform')}
        </h1>
        <p className="text-sm text-[#718096] leading-relaxed">
          {t(
            'أول منصة عربية متكاملة تجمع منظومة صناعة البلاستيك: المصانع، الموردين، المهندسين، الفنيين، المعارض الافتراضية، الأكاديمية، والفرص في تجربة واحدة.',
            'The integrated digital ecosystem connecting the plastics industry across the Arab world and beyond.'
          )}
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1769E8]">
          <ShieldCheck className="w-4 h-4" />
          <span>{t('منظومة صناعية موثوقة', 'Trusted Industrial Ecosystem')}</span>
        </div>
        <Link
          to="/"
          className="inline-flex px-6 py-3 rounded-xl bg-[#071A33] text-white text-xs font-extrabold"
        >
          {t('العودة للرئيسية', 'Back to Home')}
        </Link>
      </div>
    </div>
  );
};

export const HowItWorksPage: React.FC = () => <AboutPage />;

export const ContactPage: React.FC = () => {
  const { t, showToast } = usePlastico();
  const [msg, setMsg] = useState('');
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DFE7F1] shadow-xs space-y-4">
        <PlasticoLogo variant="horizontal" size="sm" />
        <h1 className="text-xl font-extrabold text-[#13243B]">
          {t('المساعدة والدعم الفني', 'Help & Support')}
        </h1>
        <textarea
          rows={4}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={t('اكتب استفسارك أو اقتراحك لفريق بلاستيكو...', 'Write your message...')}
          className="w-full p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-sm text-[#13243B]"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMsg('');
              showToast('تم إرسال رسالتك لفريق الدعم بنجاح!', 'Message sent to support!');
            }}
            className="px-6 py-3 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold"
          >
            {t('إرسال الرسالة', 'Send Message')}
          </button>
          <Link to="/" className="text-xs font-bold text-[#1769E8]">
            {t('العودة للرئيسية', 'Back to Home')}
          </Link>
        </div>
      </div>
    </div>
  );
};
