import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Camera,
  Heart,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Store,
  Truck,
  Building2,
  GraduationCap,
  Users,
  Wrench,
  Briefcase,
  Factory,
  Award,
  FileText,
  Plus,
  UserCheck,
  LogIn,
  MessageSquare,
  Sparkles,
  Package,
  Share2,
  Bookmark,
  Send,
  Newspaper,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Flame,
  Bot,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import {
  SupplierPremiumDashboardSection,
  InteractiveRfqSection,
} from '../components/RfqAndSupplierSections';
import { openPlasticoOnboardingTour } from '../components/OnboardingWelcomeModal';
import { InteractiveFlipCards } from '../components/InteractiveFlipCards';
import { useThemeAndCurrency } from '../components/ThemeAndCurrencyControls';
import { VerifiedFactoryBadge } from '../components/VerifiedFactoryBadge';
import {
  MaterialsIntelligenceWidget,
  FeaturedExpertsSidebarWidget,
  INDUSTRIAL_CREATORS_LIST,
} from './MaterialsAndExpertsPages';

type HomeFeedTab =
  | 'latest_posts'
  | 'latest_news'
  | 'tech_discussions'
  | 'followed_experts'
  | 'trending_topics';

interface SocialFeedPostItem {
  id: string;
  postType: 'social_post' | 'fault_discussion' | 'news_editorial' | 'expert_article';
  authorId: string;
  authorNameAr: string;
  authorRoleAr: string;
  authorAvatar: string;
  authorVerified: boolean;
  cityAr: string;
  createdAtAr: string;
  titleAr?: string;
  bodyAr: string;
  image?: string;
  tagsAr: string[];
  machineTypeAr?: string;
  polymerAr?: string;
  solutionsCount?: number;
  hasApprovedSolution?: boolean;
  detailRoute: string;
}

export const AppDashboard: React.FC = () => {
  const { formatPrice } = useThemeAndCurrency();
  const {
    lang,
    t,
    setIsSearchOpen,
    isAuthenticated,
    realUser,
    currentUser,
    market,
    faults,
    news,
    createFault,
    savedIds,
    toggleSavedItem,
    isLiked,
    getLikeCount,
    toggleLike,
    isFollowing,
    academyProgressMap,
    unreadChatCount,
    openLightbox,
    showToast,
    guardVisitorAction,
  } = usePlastico();
  const navigate = useNavigate();

  const [dashboardSummary, setDashboardSummary] = useState<{
    rfqs: any[];
    supplierRfqs: any[];
    listings: any[];
    academy: any[];
  } | null>(null);
  const [showSupplierDashboardPreview, setShowSupplierDashboardPreview] =
    useState<boolean>(false);

  // Social Feed State
  const [activeFeedTab, setActiveFeedTab] = useState<HomeFeedTab>('latest_posts');
  const [composerMode, setComposerMode] = useState<
    'post' | 'question' | 'fault' | 'news_analysis'
  >('post');
  const [composerTitle, setComposerTitle] = useState('');
  const [composerText, setComposerText] = useState('');
  const [composerTag, setComposerTag] = useState('PP / HDPE');
  const [composerMachine, setComposerMachine] = useState('ماكينة حقن بلاستيك');
  const [composerImagePreview, setComposerImagePreview] = useState<string>('');
  const [customSocialPosts, setCustomSocialPosts] = useState<SocialFeedPostItem[]>([]);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [commentInputByPost, setCommentInputByPost] = useState<Record<string, string>>({});
  const [commentsMap, setCommentsMap] = useState<
    Record<
      string,
      Array<{
        id: string;
        authorName: string;
        authorId: string;
        text: string;
        createdAt: string;
      }>
    >
  >({
    'social-post-1': [
      {
        id: 'c-101',
        authorName: 'م. طارق منصور',
        authorId: 'expert-tarek-mansour',
        text: 'نعم، رفع درجة حرارة القالب إلى 45°C مع تقليل سرعة الحقن في آخر 10% من المشوار ينهي مشكلة الخطوط الفضية في خامات PP.',
        createdAt: 'منذ ساعة',
      },
    ],
  });

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!isAuthenticated) {
      setDashboardSummary(null);
      return;
    }
    void (async () => {
      try {
        const res = await fetch('/api/dashboard/summary', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardSummary(data);
        }
      } catch {
        // ignore
      }
    })();
  }, [isAuthenticated, realUser]);

  const handleComposerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      setComposerImagePreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handlePublishSocialPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardVisitorAction('نشر منشور أو سؤال فني في المجتمع الصناعي')) return;
    if (!composerText.trim()) return;

    const effectiveTitle =
      composerTitle.trim() ||
      composerText.trim().slice(0, 75) + (composerText.trim().length > 75 ? '...' : '');

    // If user selected fault or technical question, also persist to the Faults community
    if (composerMode === 'fault' || composerMode === 'question') {
      createFault({
        titleAr: effectiveTitle,
        titleEn: effectiveTitle,
        machineType: composerMachine,
        polymerMaterial: composerTag,
        descriptionAr: composerText.trim(),
        descriptionEn: composerText.trim(),
        symptoms: [composerMode === 'fault' ? 'عطل فني' : 'سؤال فني', composerTag, composerMachine],
        image: composerImagePreview || undefined,
        images: composerImagePreview ? [composerImagePreview] : undefined,
      });
    }

    const newItem: SocialFeedPostItem = {
      id: `user-post-${Date.now()}`,
      postType:
        composerMode === 'fault'
          ? 'fault_discussion'
          : composerMode === 'news_analysis'
            ? 'news_editorial'
            : 'social_post',
      authorId: realUser?.id ? String(realUser.id) : 'expert-karim-elsayed',
      authorNameAr: realUser?.name || 'عضو صناعي في بلاستيكو',
      authorRoleAr: realUser?.specialty || 'مهندس صناعات بلاستيكية',
      authorAvatar: realUser?.avatarUrl || currentUser.avatar || IMAGE_MANIFEST.profiles.industrialEngineer,
      authorVerified: Boolean(realUser?.verified),
      cityAr: realUser?.city || 'القاهرة',
      createdAtAr: 'الآن',
      titleAr: composerTitle.trim() || undefined,
      bodyAr: composerText.trim(),
      image: composerImagePreview || undefined,
      tagsAr: [composerTag, composerMachine],
      machineTypeAr: composerMachine,
      polymerAr: composerTag,
      solutionsCount: 0,
      detailRoute: composerMode === 'fault' ? '/app/faults' : '/app/home',
    };

    setCustomSocialPosts((prev) => [newItem, ...prev]);
    setComposerTitle('');
    setComposerText('');
    setComposerImagePreview('');
    showToast(
      'تم نشر مشاركتك في تغذية المجتمع الصناعي بنجاح!',
      'Your post has been published to the industrial feed!'
    );
  };

  // Combine rich social posts, faults, news, and expert insights into the unified feed
  const unifiedFeedItems: SocialFeedPostItem[] = useMemo(() => {
    const baseCuratedPosts: SocialFeedPostItem[] = [
      {
        id: 'social-post-1',
        postType: 'social_post',
        authorId: 'expert-karim-elsayed',
        authorNameAr: 'م. كريم السيد',
        authorRoleAr: 'استشاري تشغيل وصيانة ماكينات الحقن',
        authorAvatar: IMAGE_MANIFEST.profiles.industrialEngineer,
        authorVerified: true,
        cityAr: 'العاشر من رمضان',
        createdAtAr: 'منذ ساعتين',
        titleAr: 'ما هي أفضل معالجة لعيوب السطح (Sink Marks & Silver Streaks) في منتجات PP؟',
        bodyAr:
          'من واقع تجارب التشغيل هذا الأسبوع على ماكينات الحقن 250 طن: ضبط ضغط التعويض (Holding Pressure) مع تجفيف الماسترباتش قبل الخلط يقلل نسبة الهالك بنسبة 35%. شاركنا برأيك وخبرتك في المصنع.',
        image: IMAGE_MANIFEST.marketplace.granulesBlueOrange,
        tagsAr: ['PP', 'حقن بلاستيك', 'جودة السطح', 'ضبط بارامترات'],
        detailRoute: '/app/faults',
      },
      {
        id: 'social-post-2',
        postType: 'expert_article',
        authorId: 'sup-sabic-eg',
        authorNameAr: 'شركة البلاستيك المتقدمة للبوليمرات',
        authorRoleAr: 'مورد معتمد ومصنع رائد في صناعة البلاستيك',
        authorAvatar: IMAGE_MANIFEST.profiles.factoryOwner,
        authorVerified: true,
        cityAr: 'القاهرة',
        createdAtAr: 'منذ 3 ساعات',
        titleAr: 'تطورات جديدة في تكنولوجيا إعادة التدوير وتخريز خامات HDPE وrPET',
        bodyAr:
          'ارتفاع كفاءة خطوط الغسيل الساخن وفلاتر المصهور الليزرية أتاح للمصانع المحلية استخدام نسب خلط تصل إلى 30% من خامات rHDPE عالية النقاء دون التأثير على مقاومة الصدمات في العبوات الصناعية.',
        image: IMAGE_MANIFEST.marketplace.recyclingCrusherLine,
        tagsAr: ['إعادة التدوير', 'rHDPE', 'rPET', 'تكنولوجيا المصانع'],
        detailRoute: '/app/news',
      },
    ];

    const faultFeedItems: SocialFeedPostItem[] = faults.slice(0, 4).map((f) => ({
      id: `feed-fault-${f.id}`,
      postType: 'fault_discussion',
      authorId: f.publisherId || 'expert-tarek-mansour',
      authorNameAr: f.publisherName || 'مهندس صيانة وتشغيل',
      authorRoleAr: f.publisherRoleAr || 'مناقشة أعطال فنية',
      authorAvatar: f.publisherAvatar || IMAGE_MANIFEST.profiles.technician,
      authorVerified: true,
      cityAr: f.city || 'العاشر من رمضان',
      createdAtAr: f.createdAt || 'منذ 4 ساعات',
      titleAr: f.titleAr,
      bodyAr: f.descriptionAr,
      image: f.image,
      tagsAr: [f.machineType, f.polymerMaterial, ...(f.symptomsAr || []).slice(0, 2)],
      machineTypeAr: f.machineType,
      polymerAr: f.polymerMaterial,
      solutionsCount: f.solutions.length,
      hasApprovedSolution: f.solutions.some((s) => s.isAccepted),
      detailRoute: `/app/faults/${f.id}`,
    }));

    const newsFeedItems: SocialFeedPostItem[] = news.slice(0, 3).map((n) => ({
      id: `feed-news-${n.id}`,
      postType: 'news_editorial',
      authorId: 'expert-nadia-fahmy',
      authorNameAr: 'تحرير بلاستيكو الصناعي · د.م. نادية فهمي',
      authorRoleAr: 'مركز أخبار وتحليلات صناعة البلاستيك',
      authorAvatar: IMAGE_MANIFEST.profiles.factoryOwner,
      authorVerified: true,
      cityAr: 'مصر والشرق الأوسط',
      createdAtAr: n.publishedAt,
      titleAr: n.titleAr,
      bodyAr: n.summaryAr,
      image: n.image,
      tagsAr: [n.categoryAr || 'أخبار الصناعة', 'تحليلات السوق'],
      detailRoute: `/app/news/${n.id}`,
    }));

    const all = [...customSocialPosts, ...baseCuratedPosts, ...faultFeedItems, ...newsFeedItems];

    if (activeFeedTab === 'latest_news') {
      return all.filter((i) => i.postType === 'news_editorial' || i.postType === 'expert_article');
    }
    if (activeFeedTab === 'tech_discussions') {
      return all.filter((i) => i.postType === 'fault_discussion' || i.id === 'social-post-1');
    }
    if (activeFeedTab === 'followed_experts') {
      const followed = all.filter(
        (i) => isFollowing(i.authorId) || i.authorId.startsWith('expert-')
      );
      return followed.length > 0 ? followed : all;
    }
    if (activeFeedTab === 'trending_topics') {
      return [...all].sort(
        (a, b) => getLikeCount('fault', b.id, 42) - getLikeCount('fault', a.id, 38)
      );
    }
    return all;
  }, [activeFeedTab, customSocialPosts, faults, news, isFollowing, getLikeCount]);

  // Quick 6 Visual Category Tiles from Reference UI
  const quickVisualTiles = [
    {
      to: '/app/jobs',
      labelAr: 'الوظائف',
      labelEn: 'Jobs',
      image: IMAGE_MANIFEST.icons3d.thermoforming,
      bgClass: 'from-[#0B2B59] to-[#071A33]',
    },
    {
      to: '/app/faults',
      labelAr: 'الأعطال والصيانة',
      labelEn: 'Faults & Maint.',
      image: IMAGE_MANIFEST.icons3d.moldMaintenance,
      bgClass: 'from-[#103466] to-[#071A33]',
    },
    {
      to: '/app/market',
      labelAr: 'السوق الصناعي',
      labelEn: 'Marketplace',
      image: IMAGE_MANIFEST.icons3d.injection,
      bgClass: 'from-[#0D324D] to-[#071A33]',
    },
    {
      to: '/app/suppliers',
      labelAr: 'الموردون',
      labelEn: 'Suppliers',
      image: IMAGE_MANIFEST.icons3d.rawMaterials,
      bgClass: 'from-[#0B2B59] to-[#071A33]',
    },
    {
      to: '/app/companies',
      labelAr: 'المصانع',
      labelEn: 'Factories',
      image: IMAGE_MANIFEST.icons3d.blow,
      bgClass: 'from-[#103466] to-[#071A33]',
    },
    {
      to: '/app/market/machinery',
      labelAr: 'الماكينات',
      labelEn: 'Machinery',
      image: IMAGE_MANIFEST.icons3d.extrusion,
      bgClass: 'from-[#0D324D] to-[#071A33]',
    },
  ];

  const entrySections = [
    {
      to: '/app/market',
      labelAr: 'السوق الصناعي',
      labelEn: 'Industrial Marketplace',
      descAr: 'خامات بوليمر، ماكينات حقن ونفخ وسحب، ومعدات مستعملة ومساعدة',
      descEn: 'Polymer resins, injection/blow/extrusion machines & used equipment',
      badgeAr: '15 قسماً صناعياً',
      badgeEn: '15 Categories',
      icon: Store,
      icon3d: IMAGE_MANIFEST.icons3d.injection,
      accentBg: 'from-[#0B2B59] to-[#071A33]',
      accentBadge: 'bg-[#1769E8]/20 text-[#27BED6] border-[#27BED6]/30',
    },
    {
      to: '/app/suppliers',
      labelAr: 'دليل الموردين',
      labelEn: 'Suppliers Directory',
      descAr: 'موردو خامات PP/PE/PET، الماسترباتش، السخانات، وطلب عروض الأسعار',
      descEn: 'Verified suppliers of PP/PE/PET resins, masterbatch, heaters & RFQs',
      badgeAr: 'توريد محلي ودولي',
      badgeEn: 'Local & Global Supply',
      icon: Truck,
      icon3d: IMAGE_MANIFEST.icons3d.rawMaterials,
      accentBg: 'from-[#0D324D] to-[#071A33]',
      accentBadge: 'bg-[#27BED6]/20 text-[#27BED6] border-[#27BED6]/30',
    },
    {
      to: '/app/expo',
      labelAr: 'المعارض الافتراضية',
      labelEn: 'Virtual Exhibitions',
      descAr: 'أجنحة المصانع، خطوط الإنتاج، الشهادات، والكتالوجات التفاعلية',
      descEn: 'Virtual factory pavilions, production lines & interactive catalogs',
      badgeAr: 'أجنحة مصانع موثقة',
      badgeEn: 'Verified Factory Halls',
      icon: Building2,
      icon3d: IMAGE_MANIFEST.icons3d.blow,
      accentBg: 'from-[#0B2B59] to-[#071A33]',
      accentBadge: 'bg-[#1769E8]/20 text-[#27BED6] border-[#27BED6]/30',
    },
    {
      to: '/app/training',
      labelAr: 'أكاديمية بلاستيكو',
      labelEn: 'PLASTICO Academy',
      descAr: 'دورات عملية في الحقن، النفخ، القوالب، وتشخيص العيوب مع شهادات إتمام',
      descEn: 'Practical courses in molding, tooling & defect troubleshooting',
      badgeAr: 'شهادات موثقة',
      badgeEn: 'Verified Certificates',
      icon: GraduationCap,
      icon3d: IMAGE_MANIFEST.icons3d.qcInspection,
      accentBg: 'from-[#2A1B0E] to-[#071A33]',
      accentBadge: 'bg-[#FF8A2A]/20 text-[#FF8A2A] border-[#FF8A2A]/30',
    },
    {
      to: '/app/faults',
      labelAr: 'المجتمع الصناعي',
      labelEn: 'Industrial Community',
      descAr: 'نقاشات تقنية وتبادل خبرات بين المهندسين والفنيين وأصحاب المصانع',
      descEn: 'Technical discussions connecting engineers, technicians & plant owners',
      badgeAr: 'خبراء البلاستيك',
      badgeEn: 'Plastics Experts',
      icon: Users,
      icon3d: IMAGE_MANIFEST.icons3d.printing,
      accentBg: 'from-[#0B2B59] to-[#071A33]',
      accentBadge: 'bg-[#1769E8]/20 text-[#27BED6] border-[#27BED6]/30',
    },
    {
      to: '/app/faults',
      labelAr: 'الأعطال والصيانة',
      labelEn: 'Faults & Maintenance',
      descAr: 'موسوعة تشخيص وحلول أعطال ماكينات الحقن والنفخ والسحب والقوالب',
      descEn: 'Troubleshooting encyclopedia for injection, blow, extrusion & molds',
      badgeAr: 'حلول مجربة بالمصانع',
      badgeEn: 'Field-Tested Solutions',
      icon: Wrench,
      icon3d: IMAGE_MANIFEST.icons3d.moldMaintenance,
      accentBg: 'from-[#2A1B0E] to-[#071A33]',
      accentBadge: 'bg-[#FF8A2A]/20 text-[#FF8A2A] border-[#FF8A2A]/30',
    },
    {
      to: '/app/jobs',
      labelAr: 'الوظائف الصناعية',
      labelEn: 'Industrial Jobs',
      descAr: 'فرص عمل للمهندسين، الفنيين، مشغلي الماكينات، ومراقبي الجودة',
      descEn: 'Career opportunities for engineers, technicians, operators & QC',
      badgeAr: 'توظيف مباشر',
      badgeEn: 'Direct Hiring',
      icon: Briefcase,
      icon3d: IMAGE_MANIFEST.icons3d.thermoforming,
      accentBg: 'from-[#0B2B59] to-[#071A33]',
      accentBadge: 'bg-[#1769E8]/20 text-[#27BED6] border-[#27BED6]/30',
    },
    {
      to: '/app/manufacturing',
      labelAr: 'خدمات التصنيع (RFQ)',
      labelEn: 'Manufacturing Services (RFQ)',
      descAr: 'طلبات التصنيع للغير، تشغيل طاقات الماكينات المتاحة، وتصنيع الاسطمبات',
      descEn: 'Contract manufacturing RFQs, machine capacity & mold tooling',
      badgeAr: 'عروض أسعار المصانع',
      badgeEn: 'Factory Quotes',
      icon: Factory,
      icon3d: IMAGE_MANIFEST.icons3d.extrusion,
      accentBg: 'from-[#0D324D] to-[#071A33]',
      accentBadge: 'bg-[#27BED6]/20 text-[#27BED6] border-[#27BED6]/30',
    },
  ];

  const renderRoleDashboardCard = () => {
    if (!isAuthenticated || !realUser) {
      return (
        <div className="rounded-3xl bg-[#071A33] text-white overflow-hidden border border-[#1769E8]/35 relative shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-5 sm:p-7 space-y-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1769E8]/25 border border-[#27BED6]/30 text-xs font-extrabold text-[#27BED6]">
                {t('PLASTICO Industrial Ecosystem', 'PLASTICO Industrial Ecosystem')}
              </span>
              <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                {t(
                  'صناعة البلاستيك مستقبل أقوى مع PLASTICO',
                  'Stronger Plastics Industry Future with PLASTICO'
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t(
                  'المنظومة الصناعية الاجتماعية والتجارية المتكاملة: مجتمع الأعطال والحلول، سوق الماكينات والخامات، أخبار وتحليلات البوليمر، والوظائف المهنية في مكان واحد.',
                  'The unified industrial social & commercial ecosystem for plastics factories, engineers, suppliers, and machinery.'
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={openPlasticoOnboardingTour}
                  className="px-4 py-2.5 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>{t('اكتشف المزيد ←', 'Explore Platform ←')}</span>
                </button>
                <Link
                  to="/auth/login"
                  className="px-4 py-2.5 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('تسجيل الدخول', 'Sign In')}</span>
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-extrabold"
                >
                  {t('إنشاء حساب', 'Register')}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 h-44 sm:h-56 lg:h-full relative overflow-hidden">
              <img
                src={IMAGE_MANIFEST.hero.mainFactory}
                alt="PLASTICO Industrial Ecosystem"
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-[#071A33] via-[#071A33]/40 to-transparent" />
            </div>
          </div>
        </div>
      );
    }

    const role = realUser.accountType;
    const certCount = Object.values(academyProgressMap).filter(
      (p) => Boolean(p.certificateCode)
    ).length;

    return (
      <div className="rounded-3xl bg-[#071A33] text-white p-5 sm:p-6 border border-[#1769E8]/35 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1769E8]/25 text-[#27BED6] text-xs font-extrabold mb-1.5">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>
                {role === 'factory'
                  ? t('حساب مصنع معتمد', 'Factory Account')
                  : role === 'supplier'
                    ? t('حساب مورد خامات ومعدات', 'Supplier Account')
                    : role === 'trader'
                      ? t('حساب تاجر معدات وماكينات', 'Equipment Trader')
                      : role === 'technician'
                        ? t('حساب فني تشغيل وصيانة', 'Technician Account')
                        : t('حساب مهندس صناعي', 'Industrial Engineer')}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-white break-words">
              {t('مرحباً بك في مجتمع بلاستيكو،', 'Welcome back,')} {realUser.name}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5 break-words">
              {realUser.city}، {realUser.country}
              {realUser.specialty ? ` · ${realUser.specialty}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSupplierDashboardPreview((prev) => !prev)}
              data-testid="toggle-supplier-dashboard-btn"
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSupplierDashboardPreview
                  ? 'bg-[#27BED6] text-[#071A33]'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>
                {showSupplierDashboardPreview
                  ? t('إخفاء لوحة المورد', 'Hide Supplier Panel')
                  : t('لوحة تحكم المورد', 'Supplier Dashboard')}
              </span>
            </button>
            <Link
              to="/app/profile"
              className="px-3.5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] text-white text-xs font-extrabold transition-colors"
            >
              {t('إدارة حسابي ولوحة التحكم', 'My Account Workspace')}
            </Link>
            <Link
              to="/app/ai"
              className="px-3.5 py-2 rounded-xl bg-[#FF8A2A] hover:bg-[#F07B1A] text-white text-xs font-extrabold inline-flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>PLASTICO AI</span>
            </Link>
          </div>
        </div>

        {/* Compact Quick Summary Strip (Full Management lives inside /app/profile) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            to="/app/manufacturing"
            className="p-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-slate-300 truncate">{t('طلبات التصنيع RFQ', 'RFQs')}</span>
            <span className="text-sm font-black text-white font-mono-num">
              {dashboardSummary?.rfqs?.length ?? 0}
            </span>
          </Link>
          <Link
            to="/app/messages"
            className="p-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-slate-300 truncate">{t('الرسائل النشطة', 'Messages')}</span>
            <span className="text-sm font-black text-[#27BED6] font-mono-num">
              {unreadChatCount}
            </span>
          </Link>
          <Link
            to="/app/training"
            className="p-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-slate-300 truncate">{t('شهادات الأكاديمية', 'Certificates')}</span>
            <span className="text-sm font-black text-emerald-400 font-mono-num">{certCount}</span>
          </Link>
          <Link
            to="/app/saved"
            className="p-3 rounded-xl bg-white/8 hover:bg-white/12 border border-white/10 transition-colors flex items-center justify-between"
          >
            <span className="text-xs text-slate-300 truncate">{t('العناصر المحفوظة', 'Saved')}</span>
            <span className="text-sm font-black text-[#FF8A2A] font-mono-num">{savedIds.length}</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Universal Search Bar */}
      <div className="flex items-center gap-2.5 bg-white rounded-2xl p-2 border border-[#DFE7F1] shadow-2xs">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2 text-start text-[#718096] hover:text-[#13243B] transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 text-[#1769E8] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold truncate">
            {t(
              'ابحث في المنصة عن ماكينات، خامات PP/HDPE، أعطال فنية، موردين، مصانع، أو وظائف...',
              'Search PLASTICO for machinery, PP/HDPE resins, technical faults, suppliers, or jobs...'
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/app/visual-search')}
          title={t('البحث بالصورة', 'Visual Search by Photo')}
          className="p-2.5 rounded-xl bg-[#071A33] hover:bg-[#1769E8] text-white transition-colors shrink-0 cursor-pointer"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Hero / Role Banner */}
      {renderRoleDashboardCard()}

      {showSupplierDashboardPreview && (
        <SupplierPremiumDashboardSection dashboardSummary={dashboardSummary} />
      )}

      {/* 3. Quick 6 Industrial Visual Tiles (Matching Reference Mobile & Desktop UI) */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3" data-testid="quick-visual-category-tiles">
        {quickVisualTiles.map((tile) => (
          <Link
            key={tile.labelAr}
            to={tile.to}
            className={`group rounded-2xl bg-gradient-to-b ${tile.bgClass} p-3 text-white border border-[#1769E8]/30 hover:border-[#27BED6] shadow-xs flex flex-col items-center justify-between text-center gap-2 transition-transform hover:-translate-y-0.5`}
          >
            <img
              src={tile.image}
              alt={tile.labelAr}
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
            />
            <span className="text-[11px] sm:text-xs font-extrabold text-white leading-tight">
              {t(tile.labelAr, tile.labelEn)}
            </span>
          </Link>
        ))}
      </div>

      {/* 4. Core Social Industrial Center (Main Feed + Contextual Right/Left Sidebar on Desktop) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Social & Technical Feed Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Post Composer Box (`مربع النشر الصناعي`) */}
          <form
            onSubmit={handlePublishSocialPost}
            data-testid="home-post-composer"
            className="bg-white rounded-2xl border border-[#DFE7F1] p-4 sm:p-5 space-y-3.5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={
                    realUser?.avatarUrl ||
                    currentUser.avatar ||
                    IMAGE_MANIFEST.profiles.industrialEngineer
                  }
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover border border-[#1769E8]/40 shrink-0"
                />
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                    {t('شارك خبرتك أو اطرح سؤالاً فنياً في مجتمع بلاستيكو', 'Share an Industrial Post or Technical Question')}
                  </h2>
                  <p className="text-[11px] text-[#718096]">
                    {t('يصل منشورك للمهندسين والمصانع والموردين المتخصصين', 'Visible to plastics engineers, factories, and suppliers')}
                  </p>
                </div>
              </div>

              {/* Post Mode Selector */}
              <div className="flex items-center gap-1 bg-[#F4F7FC] p-1 rounded-xl border border-[#DFE7F1]">
                {[
                  { id: 'post', labelAr: 'منشور عام', labelEn: 'Post' },
                  { id: 'question', labelAr: 'سؤال فني', labelEn: 'Question' },
                  { id: 'fault', labelAr: 'عطل ماكينة', labelEn: 'Fault' },
                  { id: 'news_analysis', labelAr: 'تحليل سوق', labelEn: 'Analysis' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setComposerMode(m.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors cursor-pointer ${
                      composerMode === m.id
                        ? 'bg-[#1769E8] text-white'
                        : 'text-[#4A5568] hover:text-[#071A33]'
                    }`}
                  >
                    {t(m.labelAr, m.labelEn)}
                  </button>
                ))}
              </div>
            </div>

            {(composerMode === 'fault' || composerMode === 'question') && (
              <input
                type="text"
                value={composerTitle}
                onChange={(e) => setComposerTitle(e.target.value)}
                placeholder={t(
                  'عنوان المشكلة الفنية أو السؤال (مثال: رايش في اسطمبة حقن 4 عين)...',
                  'Issue or question title...'
                )}
                className="w-full px-3.5 py-2 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B] focus:outline-none focus:border-[#1769E8]"
              />
            )}

            <textarea
              rows={2}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder={t(
                'اكتب منشورك، تفاصيل العطل، ظروف التشغيل، أو سؤالك عن خامات PP / HDPE / PET...',
                'Write your post, machine operating conditions, or polymer question...'
              )}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm text-[#13243B] focus:outline-none focus:border-[#1769E8]"
            />

            {composerImagePreview && (
              <div className="relative inline-block">
                <img
                  src={composerImagePreview}
                  alt="Preview"
                  className="h-28 rounded-xl object-cover border border-[#DFE7F1]"
                />
                <button
                  type="button"
                  onClick={() => setComposerImagePreview('')}
                  className="absolute top-1.5 end-1.5 p-1 rounded-full bg-rose-600 text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#DFE7F1]">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 text-[#13243B] border border-[#DFE7F1] text-xs font-extrabold cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-[#1769E8]" />
                  <span>{t('إرفاق صورة', 'Photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleComposerImageUpload}
                    className="hidden"
                  />
                </label>

                <select
                  value={composerTag}
                  onChange={(e) => setComposerTag(e.target.value)}
                  aria-label={t('وسم الخامة أو التخصص', 'Tag')}
                  className="px-2.5 py-1.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                >
                  <option value="PP / HDPE">PP / HDPE</option>
                  <option value="PET / rPET">PET / rPET</option>
                  <option value="PVC / ABS">PVC / ABS</option>
                  <option value="حقن بلاستيك">حقن بلاستيك</option>
                  <option value="صيانة قوالب">صيانة قوالب</option>
                  <option value="خطوط فيلم وسحب">خطوط فيلم وسحب</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!composerText.trim()}
                className="px-5 py-2 rounded-xl bg-[#1769E8] hover:bg-[#1258C7] disabled:opacity-50 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('نشر في المجتمع', 'Publish Post')}</span>
              </button>
            </div>
          </form>

          {/* 5 Feed Navigation Tabs (Section 6) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'latest_posts', labelAr: 'آخر المنشورات', labelEn: 'Latest Posts', icon: Flame },
                { id: 'latest_news', labelAr: 'أحدث الأخبار', labelEn: 'Latest News', icon: Newspaper },
                { id: 'tech_discussions', labelAr: 'المناقشات الفنية', labelEn: 'Tech Discussions', icon: Wrench },
                { id: 'followed_experts', labelAr: 'المتخصصون الذين أتابعهم', labelEn: 'Followed Experts', icon: Users },
                { id: 'trending_topics', labelAr: 'الموضوعات الرائجة', labelEn: 'Trending Topics', icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeFeedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFeedTab(tab.id as HomeFeedTab)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#071A33] text-white shadow-2xs'
                        : 'bg-white text-[#4A5568] border border-[#DFE7F1] hover:border-[#1769E8]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#FF8A2A]' : 'text-[#1769E8]'}`} />
                    <span>{t(tab.labelAr, tab.labelEn)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unified Social & Industrial Feed Cards */}
          <div className="space-y-4" data-testid="industrial-social-feed">
            {unifiedFeedItems.map((post) => {
              const liked = isLiked('fault', post.id);
              const likeCount = getLikeCount('fault', post.id, post.id === 'social-post-1' ? 124 : 87);
              const isSaved = savedIds.includes(post.id);
              const postComments = commentsMap[post.id] || [];
              const commentsOpen = openCommentsPostId === post.id;

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border border-[#DFE7F1] hover:border-[#1769E8]/50 transition-all overflow-hidden shadow-2xs"
                >
                  {/* Author Header */}
                  <div className="p-4 pb-3 flex items-start justify-between gap-3">
                    <Link
                      to={`/app/profile/${encodeURIComponent(post.authorId)}`}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      <img
                        src={post.authorAvatar}
                        alt={post.authorNameAr}
                        className="w-11 h-11 rounded-full object-cover border border-[#1769E8]/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-[#071A33] group-hover:text-[#1769E8] transition-colors">
                            {post.authorNameAr}
                          </span>
                          {post.authorVerified && <VerifiedFactoryBadge variant="compact" />}
                        </div>
                        <div className="text-[11px] font-bold text-[#1769E8] truncate">
                          {post.authorRoleAr}
                        </div>
                        <div className="text-[10px] text-[#718096]">
                          {post.createdAtAr} · {post.cityAr}
                        </div>
                      </div>
                    </Link>

                    {/* Post Type Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0 ${
                        post.postType === 'fault_discussion'
                          ? 'bg-[#FF8A2A]/15 text-[#FF8A2A] border border-[#FF8A2A]/30'
                          : post.postType === 'news_editorial'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-[#1769E8] border border-blue-200'
                      }`}
                    >
                      {post.postType === 'fault_discussion'
                        ? t('عطل ومناقشة فنية', 'Technical Fault')
                        : post.postType === 'news_editorial'
                          ? t('تقرير إخباري', 'Industry News')
                          : post.postType === 'expert_article'
                            ? t('مقال خبير', 'Expert Insight')
                            : t('منشور صناعي', 'Social Post')}
                    </span>
                  </div>

                  {/* Post Content Body */}
                  <div className="px-4 pb-3 space-y-2.5">
                    {post.titleAr && (
                      <Link
                        to={post.detailRoute}
                        className="text-sm sm:text-base font-extrabold text-[#071A33] hover:text-[#1769E8] block leading-snug"
                      >
                        {post.titleAr}
                      </Link>
                    )}
                    <p className="text-xs sm:text-sm text-[#13243B] leading-relaxed">
                      {post.bodyAr}
                    </p>

                    {/* Technical Metadata Strip for Fault Cards */}
                    {post.postType === 'fault_discussion' && (
                      <div className="p-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-[#071A33]">
                            {t('الماكينة:', 'Machine:')} {post.machineTypeAr}
                          </span>
                          <span className="text-[#718096]">·</span>
                          <span className="font-bold text-[#1769E8] font-mono-num">
                            {t('الخامة:', 'Polymer:')} {post.polymerAr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {post.hasApprovedSolution && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{t('حل معتمد ✓', 'Verified Solution')}</span>
                            </span>
                          )}
                          <Link
                            to={post.detailRoute}
                            className="font-extrabold text-[#1769E8] hover:underline"
                          >
                            {post.solutionsCount || 0} {t('ردود فنية ←', 'Solutions ←')}
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tagsAr.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {post.tagsAr.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-md bg-[#F4F7FC] text-[#4A5568] border border-[#DFE7F1] text-[10px] font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Optional Media Image */}
                  {post.image && (
                    <div
                      onClick={() => openLightbox([post.image!], 0, post.titleAr || post.bodyAr)}
                      className="px-4 pb-3 cursor-zoom-in"
                    >
                      <div className="rounded-xl overflow-hidden border border-[#DFE7F1] max-h-72">
                        <IndustrialImage
                          src={post.image}
                          alt={post.titleAr || post.authorNameAr}
                          aspectClass="aspect-[16/9]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Footer (Like, Comment, Share, Save) matching Reference UI */}
                  <div className="px-4 py-2.5 bg-[#F8FAFC] border-t border-[#DFE7F1] flex items-center justify-between gap-2 text-xs font-extrabold text-[#4A5568]">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <button
                        type="button"
                        onClick={() => void toggleLike('fault', post.id)}
                        className={`min-h-[38px] inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                          liked ? 'text-rose-600' : 'hover:text-rose-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600 text-rose-600' : ''}`} />
                        <span className="font-mono-num">{likeCount}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenCommentsPostId((prev) => (prev === post.id ? null : post.id))
                        }
                        className="min-h-[38px] inline-flex items-center gap-1.5 hover:text-[#1769E8] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>
                          {t('تعليق', 'Comment')}{' '}
                          {postComments.length > 0 ? `(${postComments.length})` : ''}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            void navigator.clipboard.writeText(
                              `${window.location.origin}${post.detailRoute}`
                            );
                          }
                          showToast('تم نسخ رابط المنشور للمشاركة!', 'Post link copied!');
                        }}
                        className="min-h-[38px] inline-flex items-center gap-1.5 hover:text-[#1769E8] transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{t('مشاركة', 'Share')}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleSavedItem(post.id, {
                          itemType: 'fault',
                          titleAr: post.titleAr || post.bodyAr.slice(0, 50),
                          route: post.detailRoute,
                        })
                      }
                      aria-label={t('حفظ المنشور', 'Save post')}
                      className={`min-h-[38px] inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        isSaved ? 'text-[#1769E8]' : 'hover:text-[#1769E8]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#1769E8]' : ''}`} />
                      <span>{isSaved ? t('محفوظ', 'Saved') : t('حفظ', 'Save')}</span>
                    </button>
                  </div>

                  {/* Expandable Inline Comments & Replies */}
                  {commentsOpen && (
                    <div className="p-4 bg-[#F4F7FC] border-t border-[#DFE7F1] space-y-3">
                      {postComments.length === 0 ? (
                        <p className="text-xs text-[#718096]">
                          {t('كن أول من يضيف تعليقاً فنياً على هذا المنشور.', 'Be the first to comment.')}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {postComments.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 rounded-xl bg-white border border-[#DFE7F1] text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <Link
                                  to={`/app/profile/${encodeURIComponent(c.authorId)}`}
                                  className="font-extrabold text-[#071A33] hover:text-[#1769E8]"
                                >
                                  {c.authorName}
                                </Link>
                                <span className="text-[10px] text-[#718096]">{c.createdAt}</span>
                              </div>
                              <p className="text-[#13243B] leading-relaxed">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentInputByPost[post.id] || ''}
                          onChange={(e) =>
                            setCommentInputByPost((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder={t('أضف تعليقك أو رأيك الهندسي...', 'Add your technical comment...')}
                          className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#DFE7F1] text-xs text-[#13243B] focus:outline-none focus:border-[#1769E8]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const txt = (commentInputByPost[post.id] || '').trim();
                            if (!txt) return;
                            setCommentsMap((prev) => ({
                              ...prev,
                              [post.id]: [
                                ...(prev[post.id] || []),
                                {
                                  id: `c-${Date.now()}`,
                                  authorName: realUser?.name || 'عضو صناعي',
                                  authorId: realUser?.id ? String(realUser.id) : 'expert-karim-elsayed',
                                  text: txt,
                                  createdAt: 'الآن',
                                },
                              ],
                            }));
                            setCommentInputByPost((prev) => ({ ...prev, [post.id]: '' }));
                          }}
                          className="px-4 py-2 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold cursor-pointer"
                        >
                          {t('إرسال', 'Reply')}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Contextual Industrial Sidebar Column (Materials Intelligence + Industry News + Experts) */}
        <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          {/* 1. Raw Materials Price Intelligence Widget */}
          <MaterialsIntelligenceWidget />

          {/* 2. Latest Industry News Widget (Matching Reference UI) */}
          <div className="bg-white rounded-2xl border border-[#DFE7F1] p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#1769E8]" />
                <h3 className="text-xs sm:text-sm font-extrabold text-[#071A33]">
                  {t('أخبار الصناعة والتحليلات', 'Industry News')}
                </h3>
              </div>
              <Link
                to="/app/news"
                className="text-[11px] font-extrabold text-[#1769E8] hover:underline"
              >
                {t('عرض الكل ←', 'View All ←')}
              </Link>
            </div>

            <div className="space-y-2.5">
              {news.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  to={`/app/news/${item.id}`}
                  className="p-2.5 rounded-xl bg-[#F4F7FC] hover:bg-blue-50/70 border border-[#DFE7F1] flex items-center gap-3 transition-colors group"
                >
                  <img
                    src={item.image}
                    alt={item.titleAr}
                    className="w-16 h-14 rounded-xl object-cover border border-[#DFE7F1] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-extrabold text-[#13243B] group-hover:text-[#1769E8] line-clamp-2 leading-snug">
                      {t(item.titleAr, item.titleEn)}
                    </h4>
                    <span className="text-[10px] text-[#718096] block mt-1">
                      {item.publishedAt}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 3. Featured Industrial Experts & Creators Widget */}
          <FeaturedExpertsSidebarWidget />
        </aside>
      </section>

      {/* 5. 4 Main Interactive 3D Flip Cards */}
      <InteractiveFlipCards compact />

      {/* 6. Upgraded 8 Main Platform Section Cards with Large 3D Industrial Visuals */}
      <section className="space-y-4" data-testid="upgraded-section-cards">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-extrabold text-[#1769E8]">
              {t('قطاعات المنصة المتكاملة', 'Integrated Platform Sectors')}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#13243B]">
              {t('الأقسام الرئيسية لمنظومة بلاستيكو', 'Core PLASTICO Platform Modules')}
            </h2>
          </div>
          <button
            type="button"
            onClick={openPlasticoOnboardingTour}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-extrabold text-[#1769E8] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A2A]" />
            <span>{t('التعريف بالمنصة ومزايا كل قسم', 'Platform Tour & Module Guide')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {entrySections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.labelAr}
                to={sec.to}
                className="group rounded-2xl bg-white border border-[#DFE7F1] hover:border-[#1769E8] shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between min-w-0"
              >
                <div
                  className={`relative h-36 bg-gradient-to-br ${sec.accentBg} p-4 flex items-center justify-between overflow-hidden`}
                >
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-extrabold w-fit ${sec.accentBadge}`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{t(sec.badgeAr, sec.badgeEn)}</span>
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#FF8A2A] transition-colors">
                      {t(sec.labelAr, sec.labelEn)}
                    </h3>
                  </div>

                  <img
                    src={sec.icon3d}
                    alt={t(sec.labelAr, sec.labelEn)}
                    className="w-24 h-24 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] group-hover:scale-110 transition-transform duration-300 shrink-0"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
                  <p className="text-xs text-[#4A5568] leading-relaxed font-medium">
                    {t(sec.descAr, sec.descEn)}
                  </p>
                  <div className="pt-2.5 border-t border-[#DFE7F1] flex items-center justify-between text-xs font-extrabold text-[#1769E8] group-hover:text-[#071A33] transition-colors">
                    <span>{t('دخول القسم الآن', 'Open Module')}</span>
                    <ArrowIcon className="w-4 h-4 group-hover:translate-x-[-3px] transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 7. Featured Marketplace & Auxiliary Equipment */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-extrabold text-[#13243B]">
            {t('عروض مميزة في السوق الصناعي', 'Featured Marketplace Listings')}
          </h2>
          <Link
            to="/app/market"
            className="text-xs font-extrabold text-[#1769E8] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>{t('عرض كل السوق', 'View All Marketplace')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {market.slice(0, 3).map((item) => {
            const isSaved = savedIds.includes(item.id);
            return (
              <Link
                key={item.id}
                to={`/app/market/${item.id}`}
                className="card-3d rounded-2xl overflow-hidden flex flex-col justify-between min-w-0"
              >
                <div className="relative">
                  <IndustrialImage
                    src={item.image}
                    alt={item.titleAr}
                    aspectClass="aspect-[16/10]"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSavedItem(item.id);
                    }}
                    aria-label={t('حفظ العنصر', 'Save item')}
                    className="absolute top-2.5 end-2.5 w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center shadow-xs"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isSaved ? 'text-rose-600 fill-rose-600' : 'text-[#13243B]'
                      }`}
                    />
                  </button>
                </div>
                <div className="p-4 space-y-1.5 min-w-0">
                  <span className="text-[11px] font-bold text-[#1769E8] block">
                    {item.conditionAr}
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#13243B] line-clamp-1">
                    {t(item.titleAr, item.titleEn)}
                  </h3>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span
                      data-testid={`dashboard-market-price-${item.id}`}
                      className="text-sm font-extrabold text-[#071A33] font-mono-num"
                    >
                      {lang === 'ar'
                        ? formatPrice(item.price, item.currency).formattedAr
                        : formatPrice(item.price, item.currency).formattedEn}
                    </span>
                    <span className="text-[11px] text-[#718096] flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.city}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 8. Interactive In-Platform Manufacturing Requests & RFQ System */}
      <InteractiveRfqSection />
    </div>
  );
};
