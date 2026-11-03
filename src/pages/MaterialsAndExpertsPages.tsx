import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertCircle,
  Layers,
  Globe,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  UserPlus,
  UserCheck,
  MessageSquare,
  BookOpen,
  Video,
  Wrench,
  Sparkles,
  Filter,
  Building2,
  Briefcase,
  Truck,
  BarChart3,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import { SmartPlasticoAssistant, PlasticoRobotAvatar } from '../components/SmartPlasticoAssistant';
import { useThemeAndCurrency } from '../components/ThemeAndCurrencyControls';

export interface PolymerCatalogSpec {
  code: 'PP' | 'HDPE' | 'LDPE' | 'LLDPE' | 'PET' | 'PVC' | 'ABS' | 'PS' | 'PA';
  nameAr: string;
  nameEn: string;
  gradesAr: string[];
  applicationsAr: string;
  mfiRange: string;
  marketRegionAr: string;
  unitAr: string;
  supplyTrendAr: string;
  analysisSummaryAr: string;
  image: string;
}

export const POLYMER_INTELLIGENCE_SPECS: PolymerCatalogSpec[] = [
  {
    code: 'PP',
    nameAr: 'بولي بروبيلين (Polypropylene)',
    nameEn: 'Polypropylene (PP)',
    gradesAr: ['PP Raffia (Sabic 500P)', 'PP Injection (575P)', 'PP Copolymer (Impact)'],
    applicationsAr: 'عبوات الحقن، الأجولة المنسوجة، الكراسي، قطع غيار الأجهزة المنزلية',
    mfiRange: '3.0 – 25 g/10min',
    marketRegionAr: 'مصر / الخليج / الشرق الأوسط',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'طلب مرتفع من مصانع التعبئة والحقن مع ترقب شحنات الخليج الشهرية',
    analysisSummaryAr:
      'يتأثر تسعير خامات PP Homo & Copolymer بتكلفة البروبيلين العالمية ومعدلات تشغيل مصافي البتروكيماويات الإقليمية وتكاليف الشحن البحري.',
    image: IMAGE_MANIFEST.marketplace.resinGranules,
  },
  {
    code: 'HDPE',
    nameAr: 'بولي إيثيلين عالي الكثافة (HDPE)',
    nameEn: 'High-Density Polyethylene (HDPE)',
    gradesAr: ['HDPE Blow Molding (B5429)', 'HDPE Film (F00952)', 'HDPE Pipe (PE100)'],
    applicationsAr: 'العبوات المنفوخة، جراكن الكيماويات، مواسير المياه والغاز، أكياس التسوق',
    mfiRange: '0.05 – 2.0 g/10min',
    marketRegionAr: 'مصر / السعودية / الإمارات',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'استقرار نسبي في درجات النفخ مع زيادة الطلب على درجات مواسير PE100',
    analysisSummaryAr:
      'درجات HDPE Blow وFilm تشهد طلباً مستمراً من قطاع المنظفات والأغذية، بينما ترتبط عقود PE100 بمشروعات البنية التحتية.',
    image: IMAGE_MANIFEST.marketplace.granulesBlueOrange,
  },
  {
    code: 'LDPE',
    nameAr: 'بولي إيثيلين منخفض الكثافة (LDPE)',
    nameEn: 'Low-Density Polyethylene (LDPE)',
    gradesAr: ['LDPE Heavy Duty Film', 'LDPE General Purpose (HP4023)', 'LDPE Lamination'],
    applicationsAr: 'أفلام التغليف الشفافة، الشرنك الحراري، الصوب الزراعية، تبطين الورق',
    mfiRange: '0.3 – 7.0 g/10min',
    marketRegionAr: 'مصر / الشرق الأوسط',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'طلب موسمي نشط من مصانع أفلام الشرنك والتغليف الزراعي',
    analysisSummaryAr:
      'خامات LDPE للفيلم الشفاف والشرنك تعتمد بشكل مباشر على توافر الحصص المحلية وتكلفة الاستيراد.',
    image: IMAGE_MANIFEST.marketplace.polymerLabJars,
  },
  {
    code: 'LLDPE',
    nameAr: 'بولي إيثيلين خطي منخفض الكثافة (LLDPE)',
    nameEn: 'Linear Low-Density Polyethylene (LLDPE)',
    gradesAr: ['LLDPE Butene C4 (118WJ)', 'LLDPE Hexene C6', 'LLDPE Rotomolding'],
    applicationsAr: 'أفلام الاسترتش الصناعي، خزانات الروتومولدنج، خلطات أفلام التغليف المرنة',
    mfiRange: '1.0 – 3.5 g/10min',
    marketRegionAr: 'الخليج / مصر / شمال أفريقيا',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'نمو متواصل في استهلاك مصانع الاسترتش فيلم والتغليف المرن',
    analysisSummaryAr:
      'يُستخدم LLDPE C4/C6 بنسبة عالية في خلطات البثق لتحسين مقاومة الثقب والشد في أفلام التعبئة.',
    image: IMAGE_MANIFEST.marketplace.resinGranules,
  },
  {
    code: 'PET',
    nameAr: 'بولي إيثيلين تيريفثالات (PET Bottle Grade)',
    nameEn: 'Polyethylene Terephthalate (PET)',
    gradesAr: ['PET Bottle Grade IV 0.80', 'PET Carbonated IV 0.84', 'rPET Food Grade'],
    applicationsAr: 'بريفورم زجاجات المياه والمشروبات الغازية، عبوات الزيوت، رقائق التيرموفورمنج',
    mfiRange: 'IV 0.78 – 0.85 dL/g',
    marketRegionAr: 'مصر / آسيا / الشرق الأوسط',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'ارتفاع موسمي في الطلب مع ذروة إنتاج مصانع المياه والمشروبات',
    analysisSummaryAr:
      'يتأثر PET بتكاليف حمض التيريفثاليك (PTA) والمونو إيثيلين جلايكول (MEG) وأجور الشحن الآسيوي.',
    image: IMAGE_MANIFEST.marketplace.recyclingCrusherLine,
  },
  {
    code: 'PVC',
    nameAr: 'بولي فينيل كلورايد (PVC Suspension)',
    nameEn: 'Polyvinyl Chloride (PVC)',
    gradesAr: ['PVC K-Value 67 (Pipes & Profiles)', 'PVC K-57 (Fittings & Rigid)', 'PVC K-70 (Cables)'],
    applicationsAr: 'مواسير الصرف والكهرباء، قطاعات النوافذ، كابلات الكهرباء، الخراطيم المرنة',
    mfiRange: 'K-Value 57 – 70',
    marketRegionAr: 'مصر / تركيا / الولايات المتحدة / آسيا',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'مرتبط بحركة قطاع التشييد والبناء وتكاليف الطاقة والكلور-ألكالي',
    analysisSummaryAr:
      'تُعد درجة K67 الأكثر تداولاً في مصانع المواسير والقطاعات مع حساسية عالية لأسعار الطاقة والشحن.',
    image: IMAGE_MANIFEST.marketplace.resinGranules,
  },
  {
    code: 'ABS',
    nameAr: 'أكريلونيتريل بوتادين ستايرين (ABS)',
    nameEn: 'ABS Engineering Resin',
    gradesAr: ['ABS High Impact Injection', 'ABS Heat Resistant', 'ABS Electroplating Grade'],
    applicationsAr: 'الأجزاء الهندسية، هياكل الأجهزة الكهربائية، قطع غيار السيارات، الخوذات',
    mfiRange: '12 – 24 g/10min',
    marketRegionAr: 'شرق آسيا / أوروبا / مصر',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'طلب مستقر من مصانع الأجهزة المنزلية والصناعات المغذية للسيارات',
    analysisSummaryAr:
      'خامة هندسية تعتمد على أسعار الستايرين والبوتادين والأكريلونيتريل عالمياً.',
    image: IMAGE_MANIFEST.marketplace.polymerLabJars,
  },
  {
    code: 'PS',
    nameAr: 'بولي ستايرين (GPPS / HIPS)',
    nameEn: 'Polystyrene (GPPS & HIPS)',
    gradesAr: ['GPPS Crystal Clear', 'HIPS High Impact Sheet/Thermoforming', 'EPS Expandable'],
    applicationsAr: 'أكواب وأطباق التيرموفورمنج، أدراج الثلاجات، العزل الحراري',
    mfiRange: '2.5 – 10 g/10min',
    marketRegionAr: 'مصر / الشرق الأوسط',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'توازن بين GPPS الشفاف وHIPS عالي الصدمات لخطوط الشيت والتشكيل الحراري',
    analysisSummaryAr:
      'يتابع المصنعون الفارق السعري بين GPPS وHIPS لضبط خلطات البثق والتشكيل الحراري.',
    image: IMAGE_MANIFEST.marketplace.resinGranules,
  },
  {
    code: 'PA',
    nameAr: 'بولي أميد / نايلون هندسي (PA6 / PA66)',
    nameEn: 'Polyamide (Nylon PA6 / PA66)',
    gradesAr: ['PA6 Unreinforced', 'PA66 + 30% Glass Fiber (GF30)', 'PA6 Film Grade'],
    applicationsAr: 'التروس الميكانيكية، الأجزاء الحرارية تحت غطاء المحرك، أفيزات الكابلات، أفلام التغليف الحاجزة',
    mfiRange: 'RV 2.4 – 3.2',
    marketRegionAr: 'أوروبا / آسيا / السوق المحلي',
    unitAr: 'طن متري (MT)',
    supplyTrendAr: 'طلب متخصص من مصانع القطع الهندسية الدقيقة ومكونات السيارات والكهرباء',
    analysisSummaryAr:
      'الدرجات المسلحة بالألياف الزجاجية (GF30) تتطلب تجفيفاً دقيقاً قبل الحقن وتُورّد بعقود فنية موثقة.',
    image: IMAGE_MANIFEST.marketplace.polymerLabJars,
  },
];

export interface IndustrialCreatorProfile {
  id: string;
  nameAr: string;
  nameEn: string;
  roleTitleAr: string;
  specialtyCategory: 'injection' | 'molds' | 'polymers' | 'recycling' | 'extrusion';
  specialtyLabelAr: string;
  companyAr: string;
  cityAr: string;
  verifiedByPolicy: boolean;
  followersCount: number;
  articlesCount: number;
  solvedCasesCount: number;
  avatar: string;
  bioAr: string;
  latestInsightTitleAr: string;
  latestInsightType: 'article' | 'video' | 'factory_update';
  latestInsightSummaryAr: string;
  publishedAtAr: string;
}

export const INDUSTRIAL_CREATORS_LIST: IndustrialCreatorProfile[] = [
  {
    id: 'expert-karim-elsayed',
    nameAr: 'م. كريم السيد',
    nameEn: 'Eng. Karim El-Sayed',
    roleTitleAr: 'استشاري تشغيل وصيانة ماكينات الحقن وصانع محتوى هندسي',
    specialtyCategory: 'injection',
    specialtyLabelAr: 'حقن بلاستيك وتشخيص عيوب',
    companyAr: 'المركز الهندسي لتطوير مصانع البلاستيك',
    cityAr: 'العاشر من رمضان',
    verifiedByPolicy: true,
    followersCount: 1420,
    articlesCount: 28,
    solvedCasesCount: 64,
    avatar: IMAGE_MANIFEST.profiles.industrialEngineer,
    bioAr:
      'خبرة 16 عاماً في ضبط بارامترات الحقن (Injection Parameters)، تقليل زمن الدورة (Cycle Time)، ومعالجة عيوب التشرخ والانكماش في خامات PP وABS وPA66.',
    latestInsightTitleAr: 'دليل عملي لمعالجة عيوب السطح (Silver Streaks & Sink Marks) في منتجات PP وABS',
    latestInsightType: 'article',
    latestInsightSummaryAr:
      'شرح تفصيلي لتأثير رطوبة الخامة، سرعة الحقن في المرحلة الأولى، وضغط التعويض (Holding Pressure) مع جدول ضبط قياسي للمصانع.',
    publishedAtAr: 'منذ 3 ساعات',
  },
  {
    id: 'expert-tarek-mansour',
    nameAr: 'م. طارق منصور',
    nameEn: 'Eng. Tarek Mansour',
    roleTitleAr: 'خبير تصميم وصيانة اسطمبات الحقن والنفخ (Hot Runner Specialist)',
    specialtyCategory: 'molds',
    specialtyLabelAr: 'تصميم وصيانة القوالب',
    companyAr: 'النيل لتصنيع الاسطمبات الدقيقة',
    cityAr: 'السادس من أكتوبر',
    verifiedByPolicy: true,
    followersCount: 980,
    articlesCount: 19,
    solvedCasesCount: 51,
    avatar: IMAGE_MANIFEST.profiles.technician,
    bioAr:
      'متخصص في تصميم مسارات التبريد التوافقي، موازنة بوابات الحقن الساخن (Hot Runner)، ومعالجة مشاكل الرايش (Flash) وتآكل دلائل القالب.',
    latestInsightTitleAr: 'كيف تخفض زمن دورة الحقن بنسبة 18% عبر تحسين دوائر تبريد الاسطمبة؟',
    latestInsightType: 'video',
    latestInsightSummaryAr:
      'مراجعة هندسية من داخل ورشة القوالب لطريقة فحص فرق درجات الحرارة (Delta-T) وتجنب النقاط الساخنة حول الكور.',
    publishedAtAr: 'منذ يوم واحد',
  },
  {
    id: 'expert-nadia-fahmy',
    nameAr: 'د.م. نادية فهمي',
    nameEn: 'Dr. Eng. Nadia Fahmy',
    roleTitleAr: 'محللة أسواق البوليمرات واستشارية خلطات الخامات والماسترباتش',
    specialtyCategory: 'polymers',
    specialtyLabelAr: 'خامات البوليمر وتحليلات السوق',
    companyAr: 'مختبر البوليمرات المتقدمة',
    cityAr: 'القاهرة الجديدة',
    verifiedByPolicy: true,
    followersCount: 1850,
    articlesCount: 34,
    solvedCasesCount: 42,
    avatar: IMAGE_MANIFEST.profiles.factoryOwner,
    bioAr:
      'متخصصة في توصيف درجات البوليمر (MFI / Density / IV)، بدائل الخامات لتقليل التكلفة، وتحليل اتجاهات سلاسل الإمداد الإقليمية لخامات PP وPE وPET.',
    latestInsightTitleAr: 'قراءة فنية في مواصفات درجات HDPE للنفخ والفيلم وكيفية اختيار الماسترباتش المتوافق',
    latestInsightType: 'article',
    latestInsightSummaryAr:
      'مقارنة معملية بين درجات البثق والنفخ وتأثير نسبة الإضافات الحرارية ومضادات الأكسدة على جودة المنتج النهائي.',
    publishedAtAr: 'منذ يومين',
  },
  {
    id: 'expert-mahmoud-zaki',
    nameAr: 'م. محمود زكي',
    nameEn: 'Eng. Mahmoud Zaki',
    roleTitleAr: 'مدير خطوط إعادة التدوير وتخريز البلاستيك (rPET & rHDPE)',
    specialtyCategory: 'recycling',
    specialtyLabelAr: 'إعادة التدوير والاستدامة',
    companyAr: 'جرين بلاست لتدوير البوليمرات',
    cityAr: 'برج العرب - الإسكندرية',
    verifiedByPolicy: true,
    followersCount: 760,
    articlesCount: 15,
    solvedCasesCount: 37,
    avatar: IMAGE_MANIFEST.profiles.supplierTrader,
    bioAr:
      'خبير في خطوط الغسيل الساخن، فلاتر المصهور (Melt Filters)، ورفع جودة حبيبات البلاستيك المعاد تدويره للاستخدام الصناعي.',
    latestInsightTitleAr: 'تحديث من أرض المصنع: رفع نقاء كسر HDPE وPET وتقليل الرطوبة قبل مرحلة التخريز',
    latestInsightType: 'factory_update',
    latestInsightSummaryAr:
      'خطوات عملية لضبط سرعة المجفف الطردي واختيار شبك الفلتر المناسب لمنع الشوائب السوداء في الخرز.',
    publishedAtAr: 'منذ 4 أيام',
  },
];

/* ============================================================================
   COMPACT MATERIALS INTELLIGENCE WIDGET (For Home Feed Contextual Sidebar)
   Strictly adheres to Non-Negotiable Rule: No fake stock exchange ticker numbers!
   ============================================================================ */
export const MaterialsIntelligenceWidget: React.FC = () => {
  const { t, market, lang } = usePlastico();
  const { formatPrice } = useThemeAndCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const verifiedMaterialListings = useMemo(
    () => market.filter((m) => m.category === 'raw_materials').slice(0, 3),
    [market]
  );

  return (
    <div
      data-testid="materials-intelligence-widget"
      className="bg-white rounded-2xl border border-[#DFE7F1] overflow-hidden shadow-2xs"
    >
      {/* Deep Navy Header */}
      <div className="bg-[#071A33] text-white p-4 border-b border-white/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#27BED6]" />
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              {t('مركز أسعار وتحليلات الخامات', 'Materials Price Intelligence')}
            </h3>
          </div>
          <Link
            to="/app/materials"
            className="text-[11px] font-extrabold text-[#27BED6] hover:underline inline-flex items-center gap-0.5"
          >
            <span>{t('التفاصيل', 'Full View')}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Period Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 mt-3 p-1 rounded-xl bg-white/10">
          {[
            { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
            { id: 'week', labelAr: 'أسبوع', labelEn: 'Week' },
            { id: 'month', labelAr: 'شهر', labelEn: 'Month' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedPeriod(tab.id as 'today' | 'week' | 'month')}
              className={`py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                selectedPeriod === tab.id
                  ? 'bg-[#1769E8] text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t(tab.labelAr, tab.labelEn)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Mandatory Honest Verification Notice (No fabricated live stock ticker) */}
        <div
          data-testid="unverified-exchange-notice"
          className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5"
        >
          <ShieldAlert className="w-4 h-4 text-[#FF8A2A] shrink-0 mt-0.5" />
          <div className="space-y-1 text-[11px]">
            <div className="font-extrabold text-[#071A33]">
              {t('لا توجد بيانات أسعار بورصة حية موثقة حاليًا', 'No verified live exchange feed connected')}
            </div>
            <p className="text-[#4A5568] leading-relaxed">
              {t(
                'التزاماً بالمصداقية الصناعية، لا نعرض أرقام بورصة وهمية. يتم أدناه عرض عروض الموردين الفعلية المسجلة بالسوق والمواصفات الفنية لـ PP وHDPE وPET.',
                'We never display fabricated exchange numbers. Below are real supplier marketplace offers and technical polymer specs.'
              )}
            </p>
          </div>
        </div>

        {/* Monitored Polymer Chips */}
        <div className="grid grid-cols-3 gap-2">
          {POLYMER_INTELLIGENCE_SPECS.slice(0, 3).map((poly) => (
            <Link
              key={poly.code}
              to={`/app/materials?polymer=${poly.code}`}
              className="p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 border border-[#DFE7F1] text-center transition-colors"
            >
              <div className="text-xs font-black text-[#071A33] font-mono-num">
                {poly.code}
              </div>
              <div className="text-[10px] text-[#1769E8] font-bold truncate mt-0.5">
                {poly.mfiRange}
              </div>
              <div className="text-[9px] text-[#718096] mt-0.5">
                {t('تقرير فني', 'Tech Report')}
              </div>
            </Link>
          ))}
        </div>

        {/* Real Verified Supplier Offers from Marketplace */}
        {verifiedMaterialListings.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-extrabold text-[#13243B] flex items-center justify-between">
              <span>{t('عروض خامات معلنة في السوق الصناعي:', 'Active Supplier Resin Offers:')}</span>
              <span className="text-[10px] text-[#718096]">{t('للـطن / العبوة', 'Per Unit')}</span>
            </div>
            {verifiedMaterialListings.map((item) => {
              const fp = formatPrice(item.price, item.currency);
              return (
                <Link
                  key={item.id}
                  to={`/app/market/${item.id}`}
                  className="p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-[#13243B] truncate">
                      {item.titleAr}
                    </div>
                    <div className="text-[10px] text-[#718096] truncate">
                      {item.sellerNameAr} · {item.city}
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#1769E8] font-mono-num shrink-0">
                    {lang === 'ar' ? fp.formattedAr : fp.formattedEn}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <Link
          to="/app/materials"
          className="w-full py-2.5 px-3 rounded-xl bg-[#071A33] hover:bg-[#1769E8] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{t('فتح لوحة الخامات وتحليلات السوق', 'Open Materials Intelligence')}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

/* ============================================================================
   FEATURED EXPERTS SIDEBAR WIDGET (For Home Feed Contextual Sidebar)
   ============================================================================ */
export const FeaturedExpertsSidebarWidget: React.FC = () => {
  const { t, isFollowing, toggleFollow } = usePlastico();

  return (
    <div className="bg-white rounded-2xl border border-[#DFE7F1] p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF8A2A]" />
          <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
            {t('خبراء وصنّاع محتوى الصناعة', 'Industrial Experts & Creators')}
          </h3>
        </div>
        <Link
          to="/app/experts"
          className="text-[11px] font-extrabold text-[#1769E8] hover:underline"
        >
          {t('عرض الكل', 'View All')}
        </Link>
      </div>

      <div className="space-y-2.5">
        {INDUSTRIAL_CREATORS_LIST.slice(0, 3).map((exp) => {
          const following = isFollowing(exp.id);
          return (
            <div
              key={exp.id}
              className="p-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex items-center justify-between gap-2"
            >
              <Link
                to={`/app/profile/${exp.id}`}
                className="flex items-center gap-2.5 min-w-0 flex-1 group"
              >
                <img
                  src={exp.avatar}
                  alt={exp.nameAr}
                  className="w-10 h-10 rounded-full object-cover border border-[#1769E8]/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-[#13243B] group-hover:text-[#1769E8] truncate">
                      {exp.nameAr}
                    </span>
                    {exp.verifiedByPolicy && <VerifiedFactoryBadge variant="compact" />}
                  </div>
                  <div className="text-[10px] font-bold text-[#1769E8] truncate">
                    {exp.specialtyLabelAr}
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() =>
                  void toggleFollow({
                    targetId: exp.id,
                    targetNameAr: exp.nameAr,
                    targetRoleAr: exp.roleTitleAr,
                    targetAvatar: exp.avatar,
                  })
                }
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold shrink-0 transition-colors cursor-pointer ${
                  following
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-[#1769E8] hover:bg-[#1258C7] text-white'
                }`}
              >
                {following ? t('متابَع', 'Following') : t('متابعة', 'Follow')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   FULL MATERIALS INTELLIGENCE PAGE (/app/materials)
   Covers PP, HDPE, LDPE, LLDPE, PET, PVC, ABS, PS, PA
   ============================================================================ */
export const MaterialsIntelligencePage: React.FC = () => {
  const { t, market, suppliers, startOrOpenConversation, lang } = usePlastico();
  const { formatPrice, currency } = useThemeAndCurrency();
  const navigate = useNavigate();

  const [selectedPolymer, setSelectedPolymer] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'historical'>('today');
  const [compareCodes, setCompareCodes] = useState<string[]>(['PP', 'HDPE', 'PET']);

  const filteredPolymers = useMemo(() => {
    return POLYMER_INTELLIGENCE_SPECS.filter((p) => {
      if (selectedPolymer !== 'ALL' && p.code !== selectedPolymer) return false;
      if (selectedRegion !== 'ALL' && !p.marketRegionAr.includes(selectedRegion)) return false;
      return true;
    });
  }, [selectedPolymer, selectedRegion]);

  const rawMaterialListings = useMemo(
    () =>
      market.filter(
        (m) =>
          m.category === 'raw_materials' ||
          m.category === 'additives_masterbatch' ||
          m.category === 'recycling_lines'
      ),
    [market]
  );

  const toggleComparePolymer = (code: string) => {
    setCompareCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev.slice(-2), code]
    );
  };

  return (
    <div className="space-y-6" data-testid="materials-intelligence-page">
      {/* Deep Navy Header Banner */}
      <div className="rounded-3xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/35 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1769E8]/25 border border-[#27BED6]/30 text-[#27BED6] text-xs font-extrabold">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('Materials Intelligence · مركز معلومات الخامات والسوق', 'Materials Price & Market Intelligence')}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
              {t(
                'متابعة وتحليل خامات البوليمر واتجاهات العرض والطلب الصناعي',
                'Polymer Resin Intelligence, Technical Grades & Supply Trends'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {t(
                'قاعدة بيانات فنية وتجارية شاملة لخامات PP وHDPE وLDPE وLLDPE وPET وPVC وABS وPS وPA مع عروض الموردين الموثقين وتقارير السوق.',
                'Comprehensive technical and market intelligence for PP, HDPE, LDPE, LLDPE, PET, PVC, ABS, PS, and PA resins.'
              )}
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1.5 rounded-2xl border border-white/15 self-start">
            {[
              { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
              { id: 'week', labelAr: 'أسبوع', labelEn: '1 Week' },
              { id: 'month', labelAr: 'شهر', labelEn: '1 Month' },
              { id: 'historical', labelAr: 'فترات تاريخية', labelEn: 'Historical' },
            ].map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-[#1769E8] text-white shadow-sm'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {t(tf.labelAr, tf.labelEn)}
              </button>
            ))}
          </div>
        </div>

        {/* Non-Negotiable Data Integrity & Verification Banner */}
        <div
          data-testid="materials-honest-verification-banner"
          className="p-4 rounded-2xl bg-amber-500/15 border border-[#FF8A2A]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#FF8A2A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs sm:text-sm font-extrabold text-white">
                {t(
                  'حالة مؤشر البورصة الحية: لا توجد بيانات أسعار موثقة حاليًا (يتطلب ربط مصدر تسعير خارجي رسمي)',
                  'Live Exchange Feed Status: No verified live exchange data currently connected'
                )}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {t(
                  'التزاماً بمعايير الشفافية الصناعية في PLASTICO، يُمنع عرض أي أرقام بورصة عشوائية أو غير موثقة. لتفعيل شريط الأسعار اللحظي، يتطلب ربط مفتاح API رسمي (مثل ICIS Polymer Price Feed أو S&P Global Platts أو قائمة تسعير الموزعين المعتمدين). يمكنك أدناه استعراض عروض أسعار الموردين الفعليين المسجلين على المنصة.',
                  'Per PLASTICO data integrity rules, unverified stock ticker numbers are never fabricated. Connect an official pricing feed (ICIS / Platts / Authorized Distributor API) or browse real supplier offers below.'
                )}
              </p>
            </div>
          </div>
          <Link
            to="/app/suppliers?category=raw_materials"
            className="px-4 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold shrink-0 text-center"
          >
            {t('اطلب عرض سعر رسمي من الموردين', 'Request Verified Supplier Quote')}
          </Link>
        </div>
      </div>

      {/* Polymer Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedPolymer('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer ${
              selectedPolymer === 'ALL'
                ? 'bg-[#071A33] text-white'
                : 'bg-[#F4F7FC] text-[#13243B] hover:bg-slate-200'
            }`}
          >
            {t('جميع البوليمرات (9)', 'All Polymers (9)')}
          </button>
          {POLYMER_INTELLIGENCE_SPECS.map((poly) => (
            <button
              key={poly.code}
              type="button"
              onClick={() => setSelectedPolymer(poly.code)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold font-mono-num whitespace-nowrap cursor-pointer ${
                selectedPolymer === poly.code
                  ? 'bg-[#1769E8] text-white'
                  : 'bg-[#F4F7FC] text-[#13243B] hover:bg-blue-50'
              }`}
            >
              {poly.code}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Globe className="w-4 h-4 text-[#1769E8]" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            aria-label={t('السوق الجغرافي', 'Geographic Market')}
            className="px-3 py-2 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-extrabold text-[#13243B]"
          >
            <option value="ALL">{t('كل الأسواق الإقليمية', 'All Regional Markets')}</option>
            <option value="مصر">{t('السوق المصري', 'Egypt Market')}</option>
            <option value="الخليج">{t('سوق الخليج والسعودية', 'GCC & Saudi Market')}</option>
            <option value="الشرق الأوسط">{t('الشرق الأوسط وشمال أفريقيا', 'MENA Region')}</option>
          </select>
        </div>
      </div>

      {/* Polymer Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPolymers.map((poly) => {
          const isCompared = compareCodes.includes(poly.code);
          return (
            <div
              key={poly.code}
              className="bg-white rounded-2xl border border-[#DFE7F1] hover:border-[#1769E8] transition-all p-5 flex flex-col justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#071A33] text-[#27BED6] text-xs font-black font-mono-num">
                      {poly.code}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold text-[#13243B] mt-1.5">
                      {t(poly.nameAr, poly.nameEn)}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleComparePolymer(poly.code)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border cursor-pointer ${
                      isCompared
                        ? 'bg-[#1769E8]/10 text-[#1769E8] border-[#1769E8]'
                        : 'bg-[#F4F7FC] text-[#718096] border-[#DFE7F1]'
                    }`}
                  >
                    {isCompared ? t('✓ في المقارنة', '✓ Comparing') : t('+ مقارنة', '+ Compare')}
                  </button>
                </div>

                {/* Structured Required Metadata Table */}
                <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#718096]">{t('السوق الجغرافي:', 'Market:')}</span>
                    <span className="font-bold text-[#13243B]">{poly.marketRegionAr}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#718096]">{t('العملة / الوحدة:', 'Currency / Unit:')}</span>
                    <span className="font-bold text-[#13243B] font-mono-num">
                      {currency} / {poly.unitAr}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#718096]">{t('معامل الانسياب (MFI/IV):', 'MFI / Grade:')}</span>
                    <span className="font-bold text-[#1769E8] font-mono-num">{poly.mfiRange}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#DFE7F1]">
                    <span className="text-[#718096]">{t('سعر البورصة اللحظي:', 'Live Exchange Price:')}</span>
                    <span className="font-extrabold text-amber-700 text-[11px]">
                      {t('لا توجد بيانات أسعار موثقة حاليًا', 'No verified live data')}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-extrabold text-[#071A33] mb-1">
                    {t('الدرجات التجارية والفنية المتداولة:', 'Commercial & Technical Grades:')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {poly.gradesAr.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1769E8] border border-blue-200 text-[11px] font-bold font-mono-num"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#4A5568] leading-relaxed">
                  <strong className="text-[#13243B]">{t('تحليل الاتجاه:', 'Market Trend:')}</strong>{' '}
                  {poly.analysisSummaryAr}
                </p>
              </div>

              <div className="pt-3 border-t border-[#DFE7F1] flex items-center justify-between gap-2">
                <Link
                  to={`/app/market?category=raw_materials&q=${encodeURIComponent(poly.code)}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold text-center transition-colors"
                >
                  {t(`عروض ${poly.code} في السوق`, `Browse ${poly.code} Offers`)}
                </Link>
                <Link
                  to="/app/suppliers?category=raw_materials"
                  className="py-2 px-3 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] border border-[#DFE7F1] text-xs font-extrabold"
                >
                  {t('الموردون', 'Suppliers')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Polymer Technical & Supply Comparison Matrix */}
      {compareCodes.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-extrabold text-[#1769E8]">
                {t('مقارنة الخامات المختارة', 'Multi-Polymer Comparison')}
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[#13243B]">
                {t(
                  'مقارنة المواصفات واتجاهات العرض والطلب للبوليمرات المحددة',
                  'Technical Grade & Supply Trend Comparison'
                )}
              </h2>
            </div>
            <span className="text-xs font-bold text-[#718096]">
              {t('الفترة المحددة:', 'Selected Period:')}{' '}
              <strong className="text-[#071A33]">
                {timeframe === 'today'
                  ? 'اليوم'
                  : timeframe === 'week'
                    ? 'أسبوع'
                    : timeframe === 'month'
                      ? 'شهر'
                      : 'فترات تاريخية'}
              </strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-[#071A33] text-white">
                  <th className="p-3 rounded-tr-xl font-extrabold">{t('الخامة', 'Polymer')}</th>
                  <th className="p-3 font-extrabold">{t('أبرز الدرجات (Grades)', 'Key Grades')}</th>
                  <th className="p-3 font-extrabold">{t('MFI / IV', 'MFI / IV')}</th>
                  <th className="p-3 font-extrabold">{t('اتجاه العرض والطلب', 'Supply & Demand Trend')}</th>
                  <th className="p-3 rounded-tl-xl font-extrabold">{t('حالة السعر الموثق', 'Verified Price Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7F1]">
                {POLYMER_INTELLIGENCE_SPECS.filter((p) => compareCodes.includes(p.code)).map(
                  (poly) => (
                    <tr key={poly.code} className="hover:bg-[#F4F7FC]">
                      <td className="p-3 font-black text-[#071A33] font-mono-num">
                        {poly.code} — {poly.nameAr}
                      </td>
                      <td className="p-3 font-semibold text-[#1769E8]">
                        {poly.gradesAr.join(' · ')}
                      </td>
                      <td className="p-3 font-mono-num font-bold text-[#13243B]">
                        {poly.mfiRange}
                      </td>
                      <td className="p-3 text-[#4A5568]">{poly.supplyTrendAr}</td>
                      <td className="p-3 font-bold text-amber-700">
                        {t('لا توجد بيانات أسعار موثقة حاليًا', 'No verified live data')}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Real Active Raw Material Listings from Marketplace */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold text-[#FF8A2A]">
              {t('عروض حقيقية من قاعدة البيانات', 'Live Database Supplier Listings')}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#13243B]">
              {t('عروض الخامات والماسترباتش والخرز المعاد تدويره في السوق', 'Active Raw Material & Masterbatch Offers')}
            </h2>
          </div>
          <Link
            to="/app/market?category=raw_materials"
            className="text-xs font-extrabold text-[#1769E8] hover:underline"
          >
            {t('كل عروض الخامات ←', 'All Resin Listings ←')}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rawMaterialListings.slice(0, 6).map((item) => {
            const fp = formatPrice(item.price, item.currency);
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#DFE7F1] p-4 flex flex-col justify-between gap-3 bg-[#F4F7FC]/60 hover:border-[#1769E8] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1769E8]/10 text-[#1769E8] text-[11px] font-extrabold">
                      {item.categoryAr}
                    </span>
                    <span className="text-[11px] text-[#718096]">{item.city}</span>
                  </div>
                  <Link
                    to={`/app/market/${item.id}`}
                    className="text-sm font-extrabold text-[#13243B] hover:text-[#1769E8] block"
                  >
                    {item.titleAr}
                  </Link>
                  <Link
                    to={`/app/profile/${encodeURIComponent(item.sellerId || `seller-${item.id}`)}`}
                    className="text-xs font-bold text-[#718096] hover:text-[#1769E8] block"
                  >
                    {item.sellerNameAr}
                  </Link>
                </div>

                <div className="pt-2.5 border-t border-[#DFE7F1] flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-[#071A33] font-mono-num">
                    {lang === 'ar' ? fp.formattedAr : fp.formattedEn}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/app/market/${item.id}`}
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B] hover:border-[#1769E8]"
                    >
                      {t('التفاصيل', 'Details')}
                    </Link>
                    <button
                      type="button"
                      onClick={async () => {
                        const cid = await startOrOpenConversation({
                          targetKey: item.sellerId || `seller-${item.id}`,
                          targetNameAr: item.sellerNameAr,
                          contextType: 'market',
                          contextId: item.id,
                          contextTitleAr: item.titleAr,
                        });
                        if (cid) navigate(`/app/messages?convId=${cid}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold cursor-pointer"
                    >
                      {t('تواصل', 'Contact')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   INDUSTRIAL INFLUENCERS, EXPERTS & CONTENT CREATORS PAGE (/app/experts)
   ============================================================================ */
export const IndustrialExpertsPage: React.FC = () => {
  const { t, isFollowing, toggleFollow, startOrOpenConversation } = usePlastico();
  const navigate = useNavigate();
  const [specFilter, setSpecFilter] = useState<string>('ALL');

  const filteredExperts = useMemo(() => {
    if (specFilter === 'ALL') return INDUSTRIAL_CREATORS_LIST;
    return INDUSTRIAL_CREATORS_LIST.filter((e) => e.specialtyCategory === specFilter);
  }, [specFilter]);

  return (
    <div className="space-y-6" data-testid="industrial-experts-page">
      {/* Header Banner */}
      <div className="rounded-3xl bg-[#071A33] text-white p-6 sm:p-8 border border-[#1769E8]/35 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A2A]/20 border border-[#FF8A2A]/40 text-[#FF8A2A] text-xs font-extrabold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('شبكة خبراء وصنّاع محتوى صناعة البلاستيك', 'Industrial Influencers & Experts Network')}</span>
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-white">
          {t(
            'تابع نخبة المهندسين واستشاريي الماكينات والقوالب ومحللي سوق البوليمرات',
            'Follow Leading Plastics Engineers, Tooling Consultants & Polymer Analysts'
          )}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {t(
            'محتوى هندسي موثق من أرض المصانع: مقالات فنية طويلة، تشخيص أعطال بالصور والفيديو، ومراجعات عملية لخطوط الإنتاج والخامات. شارة التوثيق تُمنح فقط بعد مراجعة السجل المهني وفق سياسة المنصة.',
            'Field-tested engineering articles, troubleshooting case studies, and polymer market insights. Verification badges are strictly policy-based.'
          )}
        </p>
      </div>

      {/* Specialty Filter Pills */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-3.5 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'ALL', labelAr: 'كل التخصصات', labelEn: 'All Specialties' },
          { id: 'injection', labelAr: 'حقن بلاستيك وتشخيص أعطال', labelEn: 'Injection Molding' },
          { id: 'molds', labelAr: 'تصميم وصيانة القوالب', labelEn: 'Molds & Tooling' },
          { id: 'polymers', labelAr: 'خامات وتحليلات البوليمر', labelEn: 'Polymers & Market' },
          { id: 'recycling', labelAr: 'إعادة التدوير والتخريز', labelEn: 'Recycling Lines' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSpecFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
              specFilter === tab.id
                ? 'bg-[#1769E8] text-white'
                : 'bg-[#F4F7FC] text-[#13243B] hover:bg-blue-50'
            }`}
          >
            {t(tab.labelAr, tab.labelEn)}
          </button>
        ))}
      </div>

      {/* Creators & Experts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredExperts.map((exp) => {
          const following = isFollowing(exp.id);
          return (
            <div
              key={exp.id}
              className="bg-white rounded-2xl border border-[#DFE7F1] hover:border-[#1769E8] transition-all p-5 sm:p-6 flex flex-col justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/app/profile/${exp.id}`}
                    className="flex items-center gap-3.5 group min-w-0"
                  >
                    <img
                      src={exp.avatar}
                      alt={exp.nameAr}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1769E8]/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-base font-extrabold text-[#071A33] group-hover:text-[#1769E8] transition-colors">
                          {exp.nameAr}
                        </h2>
                        {exp.verifiedByPolicy && <VerifiedFactoryBadge variant="compact" />}
                      </div>
                      <p className="text-xs font-bold text-[#1769E8] mt-0.5">
                        {exp.roleTitleAr}
                      </p>
                      <p className="text-[11px] text-[#718096] mt-0.5">
                        {exp.companyAr} · {exp.cityAr}
                      </p>
                    </div>
                  </Link>
                </div>

                <p className="text-xs text-[#4A5568] leading-relaxed">{exp.bioAr}</p>

                {/* Content Performance Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-center">
                  <div>
                    <div className="text-sm font-black text-[#071A33] font-mono-num">
                      {exp.followersCount + (following ? 1 : 0)}
                    </div>
                    <div className="text-[10px] text-[#718096] font-bold">
                      {t('متابع صُنّاعي', 'Followers')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#1769E8] font-mono-num">
                      {exp.articlesCount}
                    </div>
                    <div className="text-[10px] text-[#718096] font-bold">
                      {t('مقال وتقرير فني', 'Articles')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-emerald-700 font-mono-num">
                      {exp.solvedCasesCount}
                    </div>
                    <div className="text-[10px] text-[#718096] font-bold">
                      {t('حل عطل معتمد', 'Solved Faults')}
                    </div>
                  </div>
                </div>

                {/* Latest Published Technical Content */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-[#1769E8] inline-flex items-center gap-1">
                      {exp.latestInsightType === 'video' ? (
                        <Video className="w-3.5 h-3.5" />
                      ) : exp.latestInsightType === 'factory_update' ? (
                        <Wrench className="w-3.5 h-3.5" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {exp.latestInsightType === 'video'
                          ? t('فيديو تحليلي من الورشة', 'Technical Video')
                          : exp.latestInsightType === 'factory_update'
                            ? t('تحديث من أرض المصنع', 'Factory Floor Update')
                            : t('مقال هندسي متخصص', 'Expert Article')}
                      </span>
                    </span>
                    <span className="text-[#718096]">{exp.publishedAtAr}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {exp.latestInsightTitleAr}
                  </h3>
                  <p className="text-xs text-[#4A5568] leading-relaxed">
                    {exp.latestInsightSummaryAr}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#DFE7F1] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    void toggleFollow({
                      targetId: exp.id,
                      targetNameAr: exp.nameAr,
                      targetRoleAr: exp.roleTitleAr,
                      targetAvatar: exp.avatar,
                    })
                  }
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    following
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#1769E8] hover:bg-[#1258C7] text-white'
                  }`}
                >
                  {following ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{t('تتابعه حالياً', 'Following')}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{t('متابعة الخبير', 'Follow Expert')}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const cid = await startOrOpenConversation({
                      targetKey: exp.id,
                      targetNameAr: exp.nameAr,
                      targetRoleAr: exp.roleTitleAr,
                      targetAvatar: exp.avatar,
                      contextType: 'expert',
                      contextId: exp.id,
                      contextTitleAr: `استشارة فنية مع ${exp.nameAr}`,
                    });
                    if (cid) navigate(`/app/messages?convId=${cid}`);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-[#071A33] hover:bg-[#0D284D] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#27BED6]" />
                  <span>{t('استشارة / مراسلة', 'Message')}</span>
                </button>

                <Link
                  to={`/app/profile/${exp.id}`}
                  className="py-2.5 px-3 rounded-xl bg-[#F4F7FC] hover:bg-slate-200 text-[#13243B] border border-[#DFE7F1] text-xs font-extrabold"
                >
                  {t('الملف', 'Profile')}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   DEDICATED PLASTICO AI WORKSPACE PAGE (/app/ai)
   Matches reference UI with quick action chips + full embedded assistant
   ============================================================================ */
export const PlasticoAiPage: React.FC = () => {
  const { t, realUser } = usePlastico();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto" data-testid="plastico-ai-page">
      {/* Top Industrial AI Banner matching reference UI */}
      <div className="rounded-3xl bg-[#071A33] text-white p-5 sm:p-7 border border-[#1769E8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <PlasticoRobotAvatar size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">PLASTICO AI</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('متصل الآن', 'Online Now')}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              {realUser?.name
                ? t(
                    `مرحباً ${realUser.name} — أنا مساعدك الصناعي المتخصص في صناعة البلاستيك. كيف يمكنني مساعدتك اليوم؟`,
                    `Hello ${realUser.name} — I am your specialized plastics industry assistant.`
                  )
                : t(
                    'أنا مساعدك الصناعي في PLASTICO لتشخيص الأعطال، مقارنة الخامات، والبحث عن الموردين والماكينات والوظائف.',
                    'Your PLASTICO industrial assistant for troubleshooting, polymer grades, suppliers, machinery, and jobs.'
                  )}
            </p>
          </div>
        </div>

        {/* 4 Quick Action Pills from Reference UI */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/app/jobs')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-[#1769E8] text-white border border-white/15 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5 text-[#27BED6]" />
            <span>{t('ابحث عن وظيفة', 'Find a Job')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/suppliers')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-[#1769E8] text-white border border-white/15 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>{t('ابحث عن مورد', 'Find a Supplier')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/faults')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-[#1769E8] text-white border border-white/15 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('شرح مشكلة فنية', 'Technical Issue')}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/materials')}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-[#1769E8] text-white border border-white/15 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#27BED6]" />
            <span>{t('تحديثات السوق', 'Market Updates')}</span>
          </button>
        </div>
      </div>

      {/* Embedded Full-Width Assistant Conversation Panel */}
      <SmartPlasticoAssistant mode="embedded" />
    </div>
  );
};
