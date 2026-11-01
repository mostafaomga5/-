import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Camera,
  Crown,
  Wrench,
  Settings,
  Award,
  Briefcase,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { PlasticoLogo } from '../components/PlasticoLogo';
import { UserRole } from '../types/plastico';

/* ============================================================================
   Screen 02: Create Account & Login (/auth/register & /auth/login)
   Matches Image 1 (right phone) & Image 6 (Screen 2)
   ============================================================================ */
export const RegisterPage: React.FC = () => {
  const { lang, t, showToast } = usePlastico();
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const BackChevron = lang === 'ar' ? ChevronRight : ChevronLeft;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'مرحباً بك في بلاستيكو! اختر دورك المهني لتخصيص تجربتك.',
      'Welcome to PLASTICO! Select your professional role.'
    );
    navigate('/onboarding/type');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between relative overflow-hidden">
      <div className="w-full max-w-md mx-auto px-5 pt-6 pb-10 relative z-10 flex-1 flex flex-col justify-between">
        {/* Top Bar: Back + Skip */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/app/home')}
            className="text-xs sm:text-sm font-bold text-[#0B2A5B] hover:text-[#1D6BF3]"
          >
            {t('تخطى', 'Skip')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label={t('رجوع', 'Back')}
            className="p-2 rounded-full hover:bg-slate-200/60 text-[#0B2A5B]"
          >
            <BackChevron className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center mt-2">
          <PlasticoLogo variant="stacked" theme="light" size="lg" showTagline />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A5B] mt-5">
            {t('مرحباً بك في بلاستيكو', 'Welcome to PLASTICO')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
            {t(
              'أنشئ حسابك وابدأ رحلتك مع مجتمع أكبر',
              'Create your account and start your journey with a bigger community'
            )}
          </p>
        </div>

        {/* Form matching Image 1 Screen 02 */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Segmented Toggle: Phone vs Email */}
          <div className="grid grid-cols-2 p-1.5 rounded-full bg-[#EEF2F8] border border-slate-200/80">
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`py-2.5 px-4 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                authMethod === 'phone'
                  ? 'bg-[#0B2A5B] text-white shadow-sm'
                  : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{t('الهاتف', 'Phone')}</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`py-2.5 px-4 rounded-full text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                authMethod === 'email'
                  ? 'bg-[#0B2A5B] text-white shadow-sm'
                  : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{t('البريد الإلكتروني', 'Email')}</span>
            </button>
          </div>

          {authMethod === 'phone' ? (
            <div
              dir="ltr"
              className="flex items-center bg-white rounded-2xl border border-slate-200 px-3.5 py-3 shadow-2xs focus-within:border-[#1D6BF3]"
            >
              <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 text-xs font-extrabold text-[#0B2A5B]">
                <span className="inline-block w-5 h-3.5 rounded-xs bg-gradient-to-b from-red-600 via-white to-black border border-slate-300" />
                <span>+20</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('رقم الهاتف', 'Phone number')}
                className="flex-1 min-w-0 px-3 bg-transparent text-sm text-[#0B2A5B] placeholder-slate-400 text-right focus:outline-none"
              />
            </div>
          ) : (
            <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-2xs focus-within:border-[#1D6BF3]">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('البريد الإلكتروني المهني', 'Work email address')}
                className="flex-1 px-3 bg-transparent text-sm text-[#0B2A5B] placeholder-slate-400 focus:outline-none"
              />
            </div>
          )}

          {/* Password Field */}
          <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-2xs focus-within:border-[#1D6BF3]">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-slate-400 hover:text-[#0B2A5B]"
            >
              {showPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('كلمة المرور', 'Password')}
              className="flex-1 px-3 bg-transparent text-sm text-[#0B2A5B] placeholder-slate-400 focus:outline-none"
            />
            <Lock className="w-4 h-4 text-[#0B2A5B] shrink-0" />
          </div>

          {/* 3 Reassurance Checkmarks Box matching Image 1 Screen 02 */}
          <div className="rounded-2xl bg-[#EEF2F8] p-4 space-y-2 border border-slate-200/70">
            {[
              t('حسابك آمن ومشفر', 'Your account is secure & encrypted'),
              t('لن نرسل رسائل مزعجة', 'We never send spam messages'),
              t('يمكنك التحكم ببياناتك دائماً', 'You are always in control of your data'),
            ].map((line) => (
              <div key={line} className="flex items-center gap-2 text-xs font-bold text-[#0B2A5B]">
                <CheckCircle2 className="w-4 h-4 text-[#1D6BF3] shrink-0" />
                <span>{line}</span>
              </div>
            ))}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-3 transition-all"
          >
            <span>{t('إنشاء حساب', 'Create Account')}</span>
            <ArrowIcon className="w-5 h-5" />
          </button>
        </form>

        {/* Social Login & Login Link */}
        <div className="space-y-4 mt-5 text-center">
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-bold text-slate-500">
              {t('أو تابع باستخدام', 'Or continue with')}
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'f', color: 'text-[#1877F2]' },
              { label: 'Apple', color: 'text-slate-900' },
              { label: 'G', color: 'text-[#EA4335]' },
            ].map((soc) => (
              <button
                key={soc.label}
                type="button"
                onClick={() => navigate('/onboarding/type')}
                className="py-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 font-extrabold text-sm shadow-2xs flex items-center justify-center"
              >
                <span className={soc.color}>{soc.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-600 pt-1">
            {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
            <Link to="/auth/login" className="text-[#1D6BF3] font-extrabold hover:underline">
              {t('تسجيل الدخول', 'Sign In')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navy Wave Decoration matching Image 1 Screen 02 */}
      <div className="bg-gradient-to-l from-[#071D42] via-[#0B2A5B] to-[#123E82] py-4 px-6 text-white flex items-center justify-between">
        <span className="text-[10px] tracking-[0.2em] font-bold text-blue-200 uppercase">
          SAME PEOPLE • GREATER IMPACT
        </span>
        <img src="/brand/plastico-symbol.svg" alt="" className="w-8 h-8 object-contain" />
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { lang, t, showToast } = usePlastico();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('تم تسجيل الدخول بنجاح!', 'Signed in successfully!');
    navigate('/app/home');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-10 flex-1 flex flex-col justify-center">
        <div className="text-center mb-6">
          <PlasticoLogo variant="stacked" theme="light" size="lg" />
          <h1 className="text-2xl font-extrabold text-[#0B2A5B] mt-4">
            {t('مرحباً بك مجدداً', 'Welcome Back')}
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            {t('سجل دخولك لمتابعة أعمالك في مجتمع بلاستيكو', 'Sign in to your PLASTICO account')}
          </p>
        </div>

        {/* Toggle Tabs matching Image 6 Screen 2 */}
        <div className="grid grid-cols-2 p-1.5 rounded-full bg-[#EEF2F8] border border-slate-200 mb-5">
          <Link
            to="/auth/register"
            className="py-2.5 px-4 rounded-full text-xs font-extrabold text-center text-[#0B2A5B]"
          >
            {t('إنشاء حساب', 'Register')}
          </Link>
          <span className="py-2.5 px-4 rounded-full text-xs font-extrabold text-center bg-[#0B2A5B] text-white shadow-sm">
            {t('تسجيل الدخول', 'Sign In')}
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
            <Mail className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('البريد الإلكتروني أو رقم الهاتف', 'Email or phone number')}
              className="flex-1 px-3 bg-transparent text-sm text-[#0B2A5B] focus:outline-none"
            />
          </div>

          <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-3.5">
            <Lock className="w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('كلمة المرور', 'Password')}
              className="flex-1 px-3 bg-transparent text-sm text-[#0B2A5B] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 mt-2"
          >
            <span>{t('تسجيل الدخول', 'Sign In')}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
   Screens 03 & 04: Role Selection (2/4) & Engineer vs Technician (3/4)
   Matches Image 3 (both phones) & Image 6 (Screens 3 & 4)
   ============================================================================ */
export const OnboardingRolePage: React.FC = () => {
  const { lang, t, currentUser, switchPersona } = usePlastico();
  const navigate = useNavigate();
  const [step, setStep] = useState<2 | 3>(2);
  const [selectedGroup, setSelectedGroup] = useState<
    'tech_eng' | 'factory' | 'supplier' | 'trader' | 'interested'
  >('tech_eng');
  const [subRole, setSubRole] = useState<'engineer' | 'technician'>(
    currentUser.role === 'technician' ? 'technician' : 'engineer'
  );
  const [specialty, setSpecialty] = useState('ميكانيكا');

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const BackChevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  const handleContinueFromStep2 = () => {
    if (selectedGroup === 'tech_eng') {
      setStep(3);
    } else {
      const roleMap: Record<string, UserRole> = {
        factory: 'factory',
        supplier: 'supplier',
        trader: 'trader',
        interested: 'engineer',
      };
      switchPersona(roleMap[selectedGroup] || 'factory');
      navigate('/onboarding/setup');
    }
  };

  const handleContinueFromStep3 = () => {
    switchPersona(subRole);
    navigate('/onboarding/setup');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between py-6 px-4">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between">
        {/* Top Bar with Back, Logo, Skip, and Progress 2/4 or 3/4 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/app/home')}
              className="text-xs sm:text-sm font-extrabold text-[#1D6BF3]"
            >
              {t('تخطي', 'Skip')}
            </button>
            <PlasticoLogo variant="horizontal" size="sm" />
            <button
              type="button"
              onClick={() => (step === 3 ? setStep(2) : navigate('/auth/register'))}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#0B2A5B]"
            >
              <span>{t('رجوع', 'Back')}</span>
              <BackChevron className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-[#0B2A5B] font-mono-num">
              {step}/4
            </span>
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-l from-[#1D6BF3] to-[#0B2A5B] transition-all duration-300 ${
                  step === 2 ? 'w-2/4' : 'w-3/4'
                }`}
              />
            </div>
          </div>
        </div>

        {step === 2 ? (
          /* STEP 2/4: Role Cards Grid matching Image 3 Left Phone */
          <div className="my-5 space-y-5">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A5B] leading-snug">
                {t('أنت داخل بلاستيكو', 'Inside PLASTICO,')}
                <span className="block">{t('بصفتك إيه؟', 'What is your role?')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {t(
                  'اختر الدور المناسب لك لنقدم لك تجربة مخصصة',
                  'Choose the role that fits you for a tailored experience'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Card 1: فني أو مهندس */}
              <button
                type="button"
                onClick={() => setSelectedGroup('tech_eng')}
                className={`relative rounded-3xl p-3 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  selectedGroup === 'tech_eng'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {selectedGroup === 'tech_eng' && (
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="w-full h-28 rounded-2xl bg-gradient-to-b from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden mb-2.5">
                  <img
                    src="/images/plastico/team/engineer-avatar.svg"
                    alt=""
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="text-sm font-extrabold text-[#0B2A5B]">
                  {t('فني أو مهندس', 'Technician or Engineer')}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {t('شارك خبراتك وساعد المجتمع', 'Share expertise & solve faults')}
                </p>
              </button>

              {/* Card 2: صاحب مصنع */}
              <button
                type="button"
                onClick={() => setSelectedGroup('factory')}
                className={`relative rounded-3xl p-3 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  selectedGroup === 'factory'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {selectedGroup === 'factory' && (
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="w-full h-28 rounded-2xl bg-gradient-to-b from-slate-100 to-blue-50 flex items-center justify-center overflow-hidden mb-2.5">
                  <img
                    src="/images/plastico/factories/factory-3-packaging.svg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm font-extrabold text-[#0B2A5B]">
                  {t('صاحب مصنع', 'Factory Owner')}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {t('أدر مصنعك وتواصل مع الكفاءات', 'Manage plant & connect with talent')}
                </p>
              </button>

              {/* Card 3: مورد */}
              <button
                type="button"
                onClick={() => setSelectedGroup('supplier')}
                className={`relative rounded-3xl p-3 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  selectedGroup === 'supplier'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {selectedGroup === 'supplier' && (
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="w-full h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2.5">
                  <img
                    src="/images/plastico/marketplace/virgin-polymer-granules.svg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm font-extrabold text-[#0B2A5B]">
                  {t('مورد', 'Supplier')}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {t('اعرض منتجاتك ووصل لعملاء جدد', 'Showcase resins & reach buyers')}
                </p>
              </button>

              {/* Card 4: تاجر / سوق مستعمل */}
              <button
                type="button"
                onClick={() => setSelectedGroup('trader')}
                className={`relative rounded-3xl p-3 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  selectedGroup === 'trader'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {selectedGroup === 'trader' && (
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="w-full h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden mb-2.5">
                  <img
                    src="/images/plastico/marketplace/used-injection-machine.svg"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm font-extrabold text-[#0B2A5B]">
                  {t('تاجر / سوق مستعمل', 'Trader / Used Market')}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {t('بيع وشراء ماكينات وقوالب وقطع غيار', 'Buy & sell machines, molds & parts')}
                </p>
              </button>

              {/* Card 5: مستخدم مهتم */}
              <button
                type="button"
                onClick={() => setSelectedGroup('interested')}
                className={`relative rounded-3xl p-3 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  selectedGroup === 'interested'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200/80 hover:border-blue-300'
                }`}
              >
                {selectedGroup === 'interested' && (
                  <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="w-full h-24 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden mb-2">
                  <img
                    src="/images/plastico/team/engineer-avatar.svg"
                    alt=""
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <div className="text-sm font-extrabold text-[#0B2A5B]">
                  {t('مستخدم مهتم', 'Interested Learner')}
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                  {t('تعلم وتابع أخبار الصناعة', 'Learn & follow industry news')}
                </p>
              </button>

              {/* Motivational Typography Block matching Image 3 bottom-left */}
              <div className="flex flex-col items-center justify-center text-center p-3">
                <span className="text-sm font-bold text-[#1D6BF3]">
                  {t('مهما كان دورك', 'Whatever your role')}
                </span>
                <span className="text-lg font-extrabold text-[#0B2A5B] leading-snug mt-1">
                  {t('كلنا معاً لصناعة مستقبل أقوى', 'All together for a stronger future')}
                </span>
                <div className="w-20 h-1 rounded-full bg-[#1D6BF3] mt-2" />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleContinueFromStep2}
                className="w-full py-4 px-6 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-3 transition-all"
              >
                <span>{t('متابعة', 'Continue')}</span>
                <ArrowIcon className="w-5 h-5" />
              </button>
              <p className="text-center text-xs font-bold text-slate-400">
                {t('مجتمع صناعي .. تأثير أكبر', 'Industrial Community .. Greater Impact')}
              </p>
            </div>
          </div>
        ) : (
          /* STEP 3/4: هل أنت فني أم مهندس؟ matching Image 3 Right Phone & Image 6 Screen 4 */
          <div className="my-5 space-y-4">
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A5B]">
                {t('هل أنت فني أم مهندس؟', 'Are you a Technician or Engineer?')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {t('اختر ما ينطبق عليك', 'Choose what applies to you')}
              </p>
            </div>

            {/* Two Tall Cards: مهندس vs فني */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSubRole('engineer')}
                className={`relative rounded-3xl p-4 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  subRole === 'engineer'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {subRole === 'engineer' && (
                  <span className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="text-base font-extrabold text-[#0B2A5B] mb-2">
                  {t('مهندس', 'Engineer')}
                </div>
                <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-blue-100 to-slate-50 flex items-center justify-center overflow-hidden mb-3">
                  <img
                    src="/images/plastico/team/engineer-avatar.svg"
                    alt="Engineer"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <p className="text-xs text-[#0B2A5B] font-bold leading-snug">
                  {t(
                    'خبرة هندسية وتصميم وحلول تقنية',
                    'Engineering expertise, design & technical solutions'
                  )}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSubRole('technician')}
                className={`relative rounded-3xl p-4 bg-white text-center transition-all border-2 shadow-xs flex flex-col items-center ${
                  subRole === 'technician'
                    ? 'border-[#1D6BF3] ring-2 ring-blue-200'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {subRole === 'technician' && (
                  <span className="absolute top-3 left-3 w-6 h-6 rounded-full bg-[#1D6BF3] text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
                <div className="text-base font-extrabold text-[#0B2A5B] mb-2">
                  {t('فني', 'Technician')}
                </div>
                <div className="w-full h-36 rounded-2xl bg-gradient-to-b from-slate-100 to-blue-50 flex items-center justify-center overflow-hidden mb-3">
                  <img
                    src="/images/plastico/team/engineer-avatar.svg"
                    alt="Technician"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <p className="text-xs text-[#0B2A5B] font-bold leading-snug">
                  {t(
                    'خبرة عملية في تشغيل وصيانة الماكينات',
                    'Hands-on expertise in machine operation & maintenance'
                  )}
                </p>
              </button>
            </div>

            {/* Quick Specialty Pills matching Image 6 Screen 4 */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['ميكانيكا', 'هيدروليك', 'تحكم وكهرباء', 'جودة وخامات'].map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSpecialty(spec)}
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-colors ${
                    specialty === spec
                      ? 'bg-[#0B2A5B] text-white'
                      : 'bg-white border border-slate-200 text-[#0B2A5B]'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>

            {/* Benefits Box matching Image 3 Right Phone */}
            <div className="rounded-3xl bg-white p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0B2A5B] text-center">
                {subRole === 'engineer'
                  ? t('مزايا حسابك كمهندس في بلاستيكو', 'Your Engineer Account Benefits in PLASTICO')
                  : t('مزايا حسابك كفني في بلاستيكو', 'Your Technician Account Benefits in PLASTICO')}
              </h3>
              {[
                {
                  icon: User,
                  textAr: 'إظهار خبراتك وتخصصك للجهات الباحثة عن مهندسين وفنيين',
                  textEn: 'Showcase your specialty to hiring factories',
                },
                {
                  icon: Wrench,
                  textAr: 'المشاركة في حل الأعطال التقنية المعقدة واكتساب نقاط سمعة',
                  textEn: 'Solve complex machine faults & earn reputation points',
                },
                {
                  icon: Settings,
                  textAr: 'الوصول إلى أحدث التقنيات والكورسات الهندسية المعتمدة',
                  textEn: 'Access modern technologies & certified courses',
                },
                {
                  icon: Briefcase,
                  textAr: 'فرص توظيف محلية ودولية في كبرى مصانع البلاستيك',
                  textEn: 'Local & regional job opportunities in top factories',
                },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.textAr} className="flex items-center gap-2.5 text-xs font-semibold text-[#0B2A5B]">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1D6BF3] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span>{t(b.textAr, b.textEn)}</span>
                  </div>
                );
              })}
            </div>

            {/* Gold Crown Banner matching Image 3 Right Phone */}
            <div className="rounded-2xl bg-[#FEF6E0] border border-amber-200/80 p-3.5 flex items-center justify-between gap-3">
              <div className="flex-1 text-center">
                <div className="text-xs font-extrabold text-[#0B2A5B]">
                  {t('خبراتك تصنع فرقاً حقيقياً', 'Your expertise makes a real difference')}
                </div>
                <div className="text-[11px] font-bold text-slate-600">
                  {t('وانضم إلى مجتمع هندسي قوي', 'Join a powerful engineering community')}
                </div>
              </div>
              <Crown className="w-7 h-7 text-amber-500 fill-amber-400 shrink-0" />
            </div>

            {/* Bottom Dual Buttons: متابعة & السابق */}
            <div className="grid grid-cols-12 gap-3 pt-1">
              <button
                type="button"
                onClick={handleContinueFromStep3}
                className="col-span-8 py-4 px-5 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2"
              >
                <span>{t('متابعة', 'Continue')}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="col-span-4 py-4 px-4 rounded-full bg-[#E8EEF6] hover:bg-slate-200 text-[#0B2A5B] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5"
              >
                <span>{t('السابق', 'Back')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   Screen 05: Step 4/4 Complete Professional Profile (/onboarding/setup)
   Matches Image 4 (left phone) & Image 6 (Screen 5)
   ============================================================================ */
export const OnboardingSetupPage: React.FC = () => {
  const { lang, t, currentUser, updateProfile, showToast } = usePlastico();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('أحمد محمد علي');
  const [specialty, setSpecialty] = useState('ميكانيكا');
  const [yearsExp, setYearsExp] = useState(5);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([
    'ماكينات حقن',
    'ماكينات إعادة تدوير',
  ]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(['PET']);
  const [companies, setCompanies] = useState([
    {
      id: 'comp-1',
      name: 'المصرية للبلاستيك',
      role: 'فني صيانة | 2022 - 2024',
      code: 'RTHE',
    },
    {
      id: 'comp-2',
      name: 'دلتا للصناعات البلاستيكية',
      role: 'مشرف صيانة | 2020 - 2022',
      code: 'DELTA',
    },
  ]);
  const [country, setCountry] = useState('مصر');
  const [city, setCity] = useState('القاهرة');

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;
  const BackChevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  const toggleMachine = (m: string) => {
    setSelectedMachines((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((x) => x !== mat) : [...prev, mat]
    );
  };

  const handleAddCompany = () => {
    const nextId = `comp-${Date.now()}`;
    setCompanies((prev) => [
      ...prev,
      {
        id: nextId,
        name: 'شركة النيل للبلاستيك',
        role: 'مهندس صيانة | 2024 - الآن',
        code: 'NILE',
      },
    ]);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: fullName,
      title: `مهندس ${specialty}`,
      country,
      city,
      yearsOfExperience: yearsExp,
      skills: [...selectedMachines, ...selectedMaterials],
    });
    showToast('تم إنشاء ملفك المهني بنجاح!', 'Your professional profile is ready!');
    navigate('/app/profile');
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] py-6 px-4">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Top Bar with Progress 4/4 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/app/home')}
              className="text-xs sm:text-sm font-extrabold text-[#1D6BF3]"
            >
              {t('تخطي', 'Skip')}
            </button>
            <PlasticoLogo variant="horizontal" size="sm" />
            <button
              type="button"
              onClick={() => navigate('/onboarding/type')}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#0B2A5B]"
            >
              <span>{t('رجوع', 'Back')}</span>
              <BackChevron className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-[#0B2A5B] font-mono-num">4/4</span>
            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div className="w-full h-full rounded-full bg-gradient-to-l from-[#1D6BF3] to-[#0B2A5B]" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-[#0B2A5B]">
            {t('أكمل بياناتك المهنية', 'Complete Your Professional Profile')}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {t(
              'معلوماتك تساعدك على الحصول على فرص أفضل',
              'Your details help you get matched with better opportunities'
            )}
          </p>
        </div>

        {/* Avatar Upload Row */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <img
              src="/images/plastico/team/engineer-avatar.svg"
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow-sm"
            />
            <span className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-[#0B2A5B] text-white flex items-center justify-center shadow">
              <Camera className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xs font-bold text-[#1D6BF3]">
            <div>{t('أضف صورتك', 'Add your photo')}</div>
            <div className="text-slate-500">{t('(اختياري)', '(Optional)')}</div>
          </div>
        </div>

        {/* Form matching Image 4 Left Phone */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#0B2A5B]">
              {t('الاسم الكامل', 'Full Name')} <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-[#0B2A5B] focus:outline-none focus:border-[#1D6BF3]"
            />
          </div>

          {/* Specialty & Years of Experience */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#0B2A5B]">
                {t('التخصص الهندسي', 'Specialty')} <span className="text-[#EF4444]">*</span>
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3.5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-[#0B2A5B] focus:outline-none focus:border-[#1D6BF3]"
              >
                <option value="ميكانيكا">ميكانيكا</option>
                <option value="هيدروليك">هيدروليك</option>
                <option value="كهرباء وتحكم">كهرباء وتحكم</option>
                <option value="بوليمرات وجودة">بوليمرات وجودة</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#0B2A5B]">
                {t('سنوات الخبرة', 'Experience')} <span className="text-[#EF4444]">*</span>
              </label>
              <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-white border border-slate-200">
                <span className="text-sm font-extrabold text-[#0B2A5B] font-mono-num">
                  {yearsExp} {t('سنوات', 'Years')}
                </span>
                <button
                  type="button"
                  onClick={() => setYearsExp((y) => y + 1)}
                  className="w-7 h-7 rounded-lg bg-blue-50 text-[#1D6BF3] flex items-center justify-center font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Machine Types Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[#0B2A5B]">
              {t('أنواع الماكينات التي عملت عليها', 'Machines You Have Worked With')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'ماكينات حقن',
                'ماكينات نفخ',
                'ماكينات سحب',
                'ماكينات إعادة تدوير',
                'ماكينات فيلم',
              ].map((m) => {
                const active = selectedMachines.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMachine(m)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-[#0B2A5B] text-white shadow-xs'
                        : 'bg-[#E8EEF6] text-[#0B2A5B] hover:bg-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Materials Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[#0B2A5B]">
              {t('الخامات التي لديك خبرة بها', 'Polymers & Resins Experience')}
            </label>
            <div className="flex flex-wrap gap-2">
              {['ABS', 'PVC', 'PET', 'PE', 'PP', 'HDPE'].map((mat) => {
                const active = selectedMaterials.includes(mat);
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleMaterial(mat)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      active
                        ? 'bg-[#0B2A5B] text-white shadow-xs'
                        : 'bg-[#E8EEF6] text-[#0B2A5B] hover:bg-slate-200'
                    }`}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Previous Companies */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[#0B2A5B]">
              {t('الشركات التي عملت بها (اختياري)', 'Previous Companies (Optional)')}
            </label>
            <div className="space-y-2">
              {companies.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 rounded-xl bg-blue-50 text-[#1D6BF3] text-xs font-extrabold">
                      {comp.code}
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
                        {comp.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{comp.role}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setCompanies((prev) => prev.filter((item) => item.id !== comp.id))
                    }
                    className="p-1.5 text-slate-400 hover:text-[#EF4444]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddCompany}
                className="w-full py-2.5 rounded-xl border border-[#1D6BF3] text-[#1D6BF3] text-xs font-extrabold hover:bg-blue-50 transition-colors"
              >
                + {t('إضافة شركة أخرى', 'Add Another Company')}
              </button>
            </div>
          </div>

          {/* City & Country */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-[#0B2A5B]">
              {t('المدينة / الدولة', 'City / Country')} <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-3.5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-[#0B2A5B]"
              >
                <option value="مصر">مصر</option>
                <option value="السعودية">السعودية</option>
                <option value="الإمارات">الإمارات</option>
              </select>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3.5 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-[#0B2A5B]"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="العاشر من رمضان">العاشر من رمضان</option>
                <option value="6 أكتوبر">6 أكتوبر</option>
                <option value="الإسكندرية">الإسكندرية</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-full bg-[#0B2A5B] hover:bg-[#133B7A] text-white font-extrabold text-base shadow-lg flex items-center justify-center gap-3 mt-2"
          >
            <span>{t('إنشاء حسابي الآن', 'Create My Profile Now')}</span>
            <ArrowIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#0B2A5B]" />
            <span>{t('بياناتك آمنة ومشفرة بالكامل', 'Your data is fully encrypted & secure')}</span>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================================
   About, How It Works & Contact Pages (Clean Light-Mode)
   ============================================================================ */
export const AboutPage: React.FC = () => {
  const { t } = usePlastico();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <PlasticoLogo variant="horizontal" size="md" />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A5B]">
          {t('عن منصة بلاستيكو PLASTICO', 'About PLASTICO Platform')}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {t(
            'بلاستيكو هي المنظومة الصناعية الرقمية الأولى لربط المصانع، المهندسين، الفنيين، الموردين، والتجار في قطاع صناعة البلاستيك في مصر والوطن العربي.',
            'PLASTICO is the premier digital ecosystem connecting factories, engineers, technicians, suppliers, and traders in the Arab plastics industry.'
          )}
        </p>
        <Link
          to="/app/home"
          className="inline-flex px-6 py-3 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold"
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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <PlasticoLogo variant="horizontal" size="sm" />
        <h1 className="text-xl font-extrabold text-[#0B2A5B]">
          {t('المساعدة والدعم الفني', 'Help & Support')}
        </h1>
        <textarea
          rows={4}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={t('اكتب استفسارك أو اقتراحك لفريق بلاستيكو...', 'Write your message...')}
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-[#0B2A5B]"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMsg('');
              showToast('تم إرسال رسالتك لفريق الدعم بنجاح!', 'Message sent to support!');
            }}
            className="px-6 py-3 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold"
          >
            {t('إرسال الرسالة', 'Send Message')}
          </button>
          <Link to="/app/home" className="text-xs font-bold text-[#1D6BF3]">
            {t('العودة للتطبيق', 'Back to App')}
          </Link>
        </div>
      </div>
    </div>
  );
};
