import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Language,
  AccountType,
  UserRole,
  UserProfile,
  ManufacturingRequest,
  ManufacturingOffer,
  AvailableMachineListing,
  FactoryServiceProvider,
  IndustrialFault,
  IndustrialJob,
  MarketListing,
  ExhibitionBooth,
  NewsArticle,
  AppNotification,
  RequestStatus,
  MachineAvailabilityStatus,
  ManufacturingProcessId,
} from '../types/plastico';
import {
  DEMO_PROFILES,
  INITIAL_MANUFACTURING_REQUESTS,
  INITIAL_FACTORY_PROVIDERS,
  INITIAL_AVAILABLE_MACHINES,
  INITIAL_FAULTS,
  INITIAL_JOBS,
  INITIAL_MARKET_LISTINGS,
  INITIAL_EXHIBITION_BOOTHS,
  INITIAL_NEWS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import {
  SupplierDirectoryItem,
  AcademyCourseItem,
  INITIAL_SUPPLIERS_DIRECTORY,
  INITIAL_ACADEMY_COURSES,
} from '../data/ecosystemData';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import { awardReputationPoints, POINTS_RULES } from '../lib/domainRules';
import { signInWithGooglePopup } from '../firebase';
import { MediaLightbox } from '../components/MediaLightbox';

export interface RealAuthenticatedUser {
  id: number;
  uid: string;
  email: string;
  name: string;
  accountType: AccountType;
  avatarUrl?: string;
  jobTitle?: string;
  city: string;
  country: string;
  specialty: string;
  bio: string;
  phone: string;
  companyName: string;
  verified: boolean;
  profileCompleted: boolean;
  skills: string[];
  machines?: string[];
  experiences?: Array<{ title: string; company: string; years: string }>;
  certificates?: string[];
  contactPrefs?: { allowChat: boolean; showPhone: boolean; showWhatsapp: boolean };
  experienceYears: number;
  education: string;
  workPreferences: string;
  createdAt?: string;
}

export interface NormalizedUser extends UserProfile {
  role: UserRole;
  name: string;
  title: string;
  reputationPoints: number;
  yearsOfExperience: number;
  email?: string;
  companyName?: string;
  avatarUrl?: string;
  jobTitle?: string;
  machines?: string[];
  experiences?: Array<{ title: string; company: string; years: string }>;
  certificates?: string[];
  contactPrefs?: { allowChat: boolean; showPhone: boolean; showWhatsapp: boolean };
  joinDate?: string;
}

export interface NormalizedOffer extends ManufacturingOffer {
  factoryName: string;
  unitPrice: number;
  currency: string;
  toolingCost: number;
}

export interface NormalizedRequest extends ManufacturingRequest {
  code: string;
  unit: string;
  attachments: string[];
  descriptionEn: string;
  offers: NormalizedOffer[];
}

export interface NormalizedSolution {
  id: string;
  faultId: string;
  authorName: string;
  authorRoleAr: string;
  content: string;
  contentAr: string;
  helpfulVotes: number;
  upvotes: number;
  isAccepted: boolean;
  isBestSolution: boolean;
  createdAt: string;
}

export interface NormalizedFault extends Omit<IndustrialFault, 'solutions'> {
  machineType: string;
  polymerMaterial: string;
  authorName: string;
  authorRoleLabel: string;
  descriptionEn: string;
  solutions: NormalizedSolution[];
}

export interface NormalizedJob extends IndustrialJob {
  companyName: string;
  salaryRange: string;
  experienceRange: string;
  postedAt: string;
  applied?: boolean;
}

export interface NormalizedMarketItem extends MarketListing {
  category: string;
  isUsed?: boolean;
  conditionCode?: 'new' | 'used_excellent' | 'used_good' | 'needs_maintenance';
  isSample?: boolean;
  country?: string;
}

export interface NormalizedMachine extends AvailableMachineListing {
  machineBrand: string;
  factoryName: string;
  availabilityStatus: string;
  hourlyOrPerPieceRate: string;
}

export interface NormalizedNotification extends AppNotification {
  isRead: boolean;
  bodyAr: string;
  bodyEn: string;
  link: string;
}

export interface AcademyProgressState {
  courseId: string;
  completedLessons: string[];
  quizScore: number;
  certificateCode: string;
  issuedAt?: string | null;
}

export interface SavedItemRecord {
  id: number;
  itemType: string;
  itemId: string;
  titleAr: string;
  route: string;
  createdAt?: string;
}

export interface FollowSummaryItem {
  id: string;
  type: string;
  nameAr: string;
  roleAr: string;
  avatar: string;
  createdAt?: string;
}

export interface ConversationSummary {
  id: number;
  otherPartyKey: string;
  otherPartyNameAr: string;
  otherPartyRoleAr: string;
  otherPartyAvatar: string;
  contextType: string;
  contextId: string;
  contextTitleAr: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface PlasticoContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ar: string, en: string) => string;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  realUser: RealAuthenticatedUser | null;
  csrfToken: string | null;
  isVisitorMode: boolean;
  isReadOnlyVisitor: boolean;
  enterVisitorMode: () => void;
  exitVisitorMode: () => void;
  visitorBlockedAction: string | null;
  closeVisitorBlockedModal: () => void;
  guardVisitorAction: (actionNameAr: string) => boolean;
  refreshSession: () => Promise<RealAuthenticatedUser | null>;
  registerRealAccount: (input: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    country: string;
    city?: string;
    accountType: AccountType;
    phone?: string;
    specialty?: string;
    companyName?: string;
    bio?: string;
    experienceYears?: number;
    skills?: string[];
  }) => Promise<{ ok: boolean; error?: string; user?: RealAuthenticatedUser }>;
  loginWithRealCredentials: (input: {
    emailOrPhone: string;
    password: string;
    rememberMe?: boolean;
  }) => Promise<{ ok: boolean; error?: string; user?: RealAuthenticatedUser }>;
  loginWithGoogleAccount: (accountType?: AccountType) => Promise<{
    ok: boolean;
    error?: string;
    user?: RealAuthenticatedUser;
  }>;
  logoutRealSession: () => Promise<void>;
  saveRealProfileUpdate: (patch: {
    name?: string;
    accountType?: AccountType;
    avatarUrl?: string;
    jobTitle?: string;
    country?: string;
    city?: string;
    specialty?: string;
    bio?: string;
    phone?: string;
    companyName?: string;
    experienceYears?: number;
    skills?: string[];
    machines?: string[];
    experiences?: Array<{ title: string; company: string; years: string }>;
    certificates?: string[];
    contactPrefs?: { allowChat: boolean; showPhone: boolean; showWhatsapp: boolean };
    education?: string;
    workPreferences?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  loginAs: (accountType: AccountType, customName?: string) => void;
  logout: () => void;
  currentUser: NormalizedUser;
  switchAccountType: (accountType: AccountType) => void;
  switchPersona: (role: UserRole) => void;
  updateCurrentUserProfile: (patch: Partial<UserProfile>) => void;
  updateProfile: (patch: {
    name?: string;
    title?: string;
    country?: string;
    city?: string;
    yearsOfExperience?: number;
    skills?: string[];
  }) => void;
  requests: NormalizedRequest[];
  createManufacturingRequest: (input: {
    titleAr: string;
    titleEn?: string;
    processId: ManufacturingProcessId;
    material: string;
    color?: string;
    unitWeightGrams?: number;
    dimensions?: string;
    quantity: number;
    unit?: string;
    moldStatus?: string;
    qualityRequirements?: string;
    packagingRequirements?: string;
    deliveryDate?: string;
    city: string;
    descriptionAr?: string;
    descriptionEn?: string;
    contactName: string;
    contactPhone: string;
    attachments?: string[];
  }) => string;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  submitFactoryOffer: (
    requestId: string,
    offerInput: {
      unitPrice: number;
      currency?: string;
      toolingCost: number;
      moq: number;
      leadTimeDays: number;
      notes?: string;
      includedServices?: string[];
    }
  ) => void;
  updateOfferStatus: (
    requestId: string,
    offerId: string,
    status: string
  ) => void;
  providers: FactoryServiceProvider[];
  suppliers: SupplierDirectoryItem[];
  submitSupplierRfq: (input: {
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
  }) => Promise<{ ok: boolean; error?: string }>;
  academyCourses: AcademyCourseItem[];
  academyProgressMap: Record<string, AcademyProgressState>;
  saveCourseProgress: (
    courseId: string,
    completedLessons: string[],
    quizScore: number,
    requiredLessonsCount: number
  ) => Promise<AcademyProgressState | null>;
  machines: NormalizedMachine[];
  updateMachineStatus: (machineId: string, status: MachineAvailabilityStatus) => void;
  faults: NormalizedFault[];
  createFault: (input: {
    titleAr: string;
    titleEn?: string;
    machineType: string;
    polymerMaterial: string;
    descriptionAr: string;
    descriptionEn?: string;
    symptoms?: string[];
    image?: string;
    images?: string[];
  }) => void;
  addFaultSolution: (
    faultId: string,
    contentAr: string,
    rootCauseAr?: string,
    stepsAr?: string[]
  ) => void;
  upvoteFaultSolution: (faultId: string, solutionId: string) => void;
  acceptFaultSolution: (faultId: string, solutionId: string) => void;
  jobs: NormalizedJob[];
  applyForJob: (jobId: string) => void;
  createJob: (input: {
    titleAr: string;
    titleEn?: string;
    companyName: string;
    city: string;
    country?: string;
    jobTypeAr?: string;
    experienceRange?: string;
    salaryRange?: string;
    specialtyAr?: string;
    requirements?: string[];
  }) => void;
  market: NormalizedMarketItem[];
  createMarketItem: (input: {
    titleAr: string;
    titleEn?: string;
    category: string;
    conditionAr: string;
    conditionCode?: 'new' | 'used_excellent' | 'used_good' | 'needs_maintenance';
    isUsed?: boolean;
    manufacturer?: string;
    model?: string;
    year?: number;
    price: number;
    currency?: string;
    city: string;
    country?: string;
    sellerName?: string;
    sellerRole?: string;
    specs?: string[];
    image: string;
    images?: string[];
  }) => void;
  reportMarketItem: (id: string) => Promise<void>;
  savedIds: string[];
  savedItems: SavedItemRecord[];
  toggleSavedItem: (
    id: string,
    meta?: { itemType?: string; titleAr?: string; route?: string }
  ) => void;
  removeSavedItem: (itemId: string) => Promise<void>;
  // Follows system
  followingIds: string[];
  followersCount: number;
  followingCount: number;
  followersList: FollowSummaryItem[];
  followingList: FollowSummaryItem[];
  isFollowing: (targetId: string) => boolean;
  getFollowerCount: (targetId: string, baseCount?: number) => number;
  toggleFollow: (target: {
    targetId: string;
    targetType?: string;
    targetNameAr: string;
    targetRoleAr?: string;
    targetAvatar?: string;
  }) => Promise<boolean>;
  // Likes system
  isLiked: (itemType: string, itemId: string) => boolean;
  getLikeCount: (itemType: string, itemId: string, baseCount?: number) => number;
  toggleLike: (itemType: string, itemId: string) => Promise<void>;
  // In-App Chat system
  conversations: ConversationSummary[];
  unreadChatCount: number;
  refreshConversations: () => Promise<void>;
  startOrOpenConversation: (input: {
    targetKey: string;
    targetNameAr: string;
    targetRoleAr?: string;
    targetAvatar?: string;
    contextType?: string;
    contextId?: string;
    contextTitleAr?: string;
    initialMessage?: string;
  }) => Promise<number | null>;
  // Unified Lightbox
  openLightbox: (images: string[], initialIndex?: number, titleAr?: string) => void;
  booths: ExhibitionBooth[];
  expoBooths: ExhibitionBooth[];
  news: (NewsArticle & { publishedAt: string })[];
  notifications: NormalizedNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toastMessage: string | null;
  showToast: (msgAr: string, msgEn?: string) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'plastico_demo_state_v3';

// Additional industrial sample items covering heaters, chillers, compressors, dryers using real uploaded assets
const EXTRA_MARKETPLACE_SAMPLES: MarketListing[] = [
  {
    id: 'mkt-heater-1',
    titleAr: 'طقم سخانات قمصان سيراميك موفرة للطاقة لماكينات الحقن والسحب',
    titleEn: 'Energy-Saving Ceramic Band Heaters Set for Injection & Extrusion',
    categoryAr: 'السخانات',
    categoryId: 'auxiliaries',
    brand: 'ThermoTech',
    model: 'CBH-220V-2400W',
    conditionAr: 'جديد',
    price: 185,
    currency: 'USD',
    city: 'السادس من أكتوبر',
    year: 2026,
    specsAr: {
      الحالة: 'جديد',
      القدرة: '1500W - 3200W',
      العزل: 'ألياف سيراميك حرارية',
      الاستخدام: 'براميل الحقن والسحب',
    },
    descriptionAr:
      'سخانات سيراميك صناعية عالية الكفاءة مع عزل حراري يقلل استهلاك الكهرباء بنسبة 25%، متوفرة بجميع الأقطار.',
    sellerId: 'sup-thermotech',
    sellerNameAr: 'المركز الهندسي للسخانات والتحكم الحراري',
    sellerTypeAr: 'مورد معتمد',
    sellerAvatar: IMAGE_MANIFEST.profiles.engineer,
    sellerPhone: '+20 102 775 3310',
    featured: true,
    image: IMAGE_MANIFEST.marketplace.extrusionPipeLine,
    images: [
      IMAGE_MANIFEST.marketplace.extrusionPipeLine,
      IMAGE_MANIFEST.marketplace.injectionMachineStudio,
      IMAGE_MANIFEST.icons3d.extrusion,
    ],
    likesCount: 28,
    createdAt: 'منذ ساعتين',
  },
  {
    id: 'mkt-heater-2',
    titleAr: 'سخانات فوهة نحاسية ومدمجة مع حساس حرارة K-Type',
    titleEn: 'Sealed Brass Nozzle Band Heaters with K-Type Thermocouple',
    categoryAr: 'السخانات',
    categoryId: 'auxiliaries',
    brand: 'Watlow-Spec',
    model: 'NB-45x50',
    conditionAr: 'جديد',
    price: 45,
    currency: 'USD',
    city: 'العاشر من رمضان',
    year: 2026,
    specsAr: {
      الحالة: 'جديد',
      المعدن: 'نحاس مختوم ضد تسريب المصهور',
      الحساس: 'مدمج J/K Type',
    },
    descriptionAr:
      'سخانات فوهة محكمة الإغلاق تتحمل درجات حرارة حتى 450 درجة مئوية ومقاومة لتسرب خامة البوليمر.',
    sellerId: 'sup-thermotech',
    sellerNameAr: 'المركز الهندسي للسخانات والتحكم الحراري',
    sellerTypeAr: 'مورد معتمد',
    sellerAvatar: IMAGE_MANIFEST.profiles.engineer,
    sellerPhone: '+20 102 775 3310',
    featured: false,
    image: IMAGE_MANIFEST.marketplace.precisionMoldCutout,
    images: [
      IMAGE_MANIFEST.marketplace.precisionMoldCutout,
      IMAGE_MANIFEST.marketplace.injectionClampUnit,
    ],
    likesCount: 19,
    createdAt: 'منذ يوم',
  },
  {
    id: 'mkt-chiller-1',
    titleAr: 'شيلر تبريد مياه قوالب 15 طن تبريد (تبريد هواء) — مستعمل بحالة ممتازة',
    titleEn: '15-Ton Air-Cooled Industrial Water Chiller — Used Excellent',
    categoryAr: 'الشيلرات',
    categoryId: 'auxiliaries',
    brand: 'Shini',
    model: 'SIC-15A',
    conditionAr: 'مستعمل — حالة ممتازة',
    price: 4200,
    currency: 'USD',
    city: 'برج العرب',
    year: 2023,
    specsAr: {
      الحالة: 'مستعمل — حالة ممتازة',
      القدرة: '15 طن تبريد',
      الضاغط: 'Copeland Scroll',
    },
    descriptionAr:
      'شيلر صناعي لتبريد قوالب الحقن والنفخ، خزان استانلس ستيل، تم فحصه بالكامل وجاهز للتجربة.',
    sellerId: 'sup-technocool',
    sellerNameAr: 'تكنو كول لأنظمة التبريد',
    sellerTypeAr: 'تاجر معدات معتمد',
    sellerAvatar: IMAGE_MANIFEST.profiles.supplierTrader,
    sellerPhone: '+20 111 980 2210',
    featured: true,
    image: IMAGE_MANIFEST.marketplace.rotomoldingMachine,
    images: [
      IMAGE_MANIFEST.marketplace.rotomoldingMachine,
      IMAGE_MANIFEST.marketplace.blowMoldingMachine,
    ],
    likesCount: 34,
    createdAt: 'منذ 3 أيام',
  },
  {
    id: 'mkt-dryer-1',
    titleAr: 'مجفف خامة هوبر استانلس 100 كجم مع شفاط أوتوماتيكي',
    titleEn: '100kg Stainless Hopper Dryer with Auto Vacuum Loader',
    categoryAr: 'المجففات والهوبرات',
    categoryId: 'auxiliaries',
    brand: 'Shini',
    model: 'SHD-100U + SAL-300',
    conditionAr: 'جديد',
    price: 1150,
    currency: 'USD',
    city: 'العاشر من رمضان',
    year: 2025,
    specsAr: {
      الحالة: 'جديد',
      السعة: '100 كجم',
      البرميل: 'استانلس معزول حرارياً',
    },
    descriptionAr:
      'مجفف خامة معزول حرارياً مع شفاط خامة أوتوماتيكي ومؤقت تشغيل أسبوعي.',
    sellerId: 'sup-technocool',
    sellerNameAr: 'تكنو كول لأنظمة التبريد',
    sellerTypeAr: 'مورد معتمد',
    sellerAvatar: IMAGE_MANIFEST.profiles.supplierTrader,
    sellerPhone: '+20 111 980 2210',
    featured: false,
    image: IMAGE_MANIFEST.marketplace.thermoformingLine,
    images: [
      IMAGE_MANIFEST.marketplace.thermoformingLine,
      IMAGE_MANIFEST.marketplace.granulesBlueOrange,
    ],
    likesCount: 22,
    createdAt: 'منذ 4 أيام',
  },
];

const PlasticoContext = createContext<PlasticoContextValue | undefined>(undefined);

export const PlasticoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // REAL BACKEND AUTHENTICATION STATE
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [realUser, setRealUser] = useState<RealAuthenticatedUser | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isVisitorMode, setIsVisitorMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('plastico_visitor_mode') === '1';
    } catch {
      return false;
    }
  });
  const [visitorBlockedAction, setVisitorBlockedAction] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<Record<AccountType, UserProfile>>(DEMO_PROFILES);
  const [activeAccountType, setActiveAccountType] = useState<AccountType>('engineer');
  const [requests, setRequests] = useState<ManufacturingRequest[]>(
    INITIAL_MANUFACTURING_REQUESTS
  );
  const [providers] = useState<FactoryServiceProvider[]>(
    INITIAL_FACTORY_PROVIDERS
  );
  const [suppliers] = useState<SupplierDirectoryItem[]>(INITIAL_SUPPLIERS_DIRECTORY);
  const [academyCourses] = useState<AcademyCourseItem[]>(INITIAL_ACADEMY_COURSES);
  const [academyProgressMap, setAcademyProgressMap] = useState<
    Record<string, AcademyProgressState>
  >({});
  const [machines, setMachines] = useState<AvailableMachineListing[]>(
    INITIAL_AVAILABLE_MACHINES
  );
  const [faults, setFaults] = useState<IndustrialFault[]>(INITIAL_FAULTS);
  const [jobs, setJobs] = useState<IndustrialJob[]>(INITIAL_JOBS);
  const [market, setMarket] = useState<MarketListing[]>([
    ...EXTRA_MARKETPLACE_SAMPLES,
    ...INITIAL_MARKET_LISTINGS,
  ]);
  const [dbMarketListings, setDbMarketListings] = useState<NormalizedMarketItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItemRecord[]>([]);

  // Follows state
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followersList, setFollowersList] = useState<FollowSummaryItem[]>([]);
  const [followingList, setFollowingList] = useState<FollowSummaryItem[]>([]);
  const [targetFollowerDeltas, setTargetFollowerDeltas] = useState<Record<string, number>>({});

  // Likes state
  const [likedKeys, setLikedKeys] = useState<string[]>([]);
  const [likeCountsMap, setLikeCountsMap] = useState<Record<string, number>>({});

  // Chat state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  // Lightbox state
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: string[];
    initialIndex: number;
    titleAr?: string;
  }>({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  const [booths] = useState<ExhibitionBooth[]>(INITIAL_EXHIBITION_BOOTHS);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAuthenticated = Boolean(realUser);
  const isReadOnlyVisitor = !realUser || realUser.accountType === 'visitor';

  const showToast = useCallback(
    (msgAr: string, msgEn?: string) => {
      const text = lang === 'ar' ? msgAr : msgEn || msgAr;
      setToastMessage(text);
      setTimeout(() => {
        setToastMessage((prev) => (prev === text ? null : prev));
      }, 3600);
    },
    [lang]
  );

  const enterVisitorMode = useCallback(() => {
    try {
      sessionStorage.setItem('plastico_visitor_mode', '1');
      sessionStorage.setItem('plastico_splash_shown_session_v1', '1');
    } catch {
      // ignore
    }
    setIsVisitorMode(true);
    setActiveAccountType('visitor');
  }, []);

  const exitVisitorMode = useCallback(() => {
    try {
      sessionStorage.removeItem('plastico_visitor_mode');
    } catch {
      // ignore
    }
    setIsVisitorMode(false);
  }, []);

  const closeVisitorBlockedModal = useCallback(() => {
    setVisitorBlockedAction(null);
  }, []);

  const guardVisitorAction = useCallback(
    (actionNameAr: string): boolean => {
      if (!realUser || realUser.accountType === 'visitor') {
        setVisitorBlockedAction(actionNameAr);
        showToast(
          `وضع الزائر للتصفح فقط — لا يُسمح بـ "${actionNameAr}" بدون حساب فعلي`,
          `Visitor Mode is read-only — "${actionNameAr}" is not permitted`
        );
        return false;
      }
      return true;
    },
    [realUser, showToast]
  );

  const openLightbox = useCallback(
    (images: string[], initialIndex = 0, titleAr?: string) => {
      const clean = images.filter(Boolean);
      if (clean.length === 0) return;
      setLightboxState({
        isOpen: true,
        images: clean,
        initialIndex,
        titleAr,
      });
    },
    []
  );

  // Sync real server session on mount
  const refreshSession = useCallback(async (): Promise<RealAuthenticatedUser | null> => {
    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) {
        setRealUser(null);
        setCsrfToken(null);
        return null;
      }
      const data = await res.json();
      if (data.authenticated && data.user) {
        const u = data.user as RealAuthenticatedUser;
        setRealUser(u);
        setCsrfToken(data.csrfToken || null);
        if (u.accountType && DEMO_PROFILES[u.accountType as AccountType]) {
          setActiveAccountType(u.accountType as AccountType);
        }
        return u;
      }
      setRealUser(null);
      setCsrfToken(null);
      return null;
    } catch {
      setRealUser(null);
      setCsrfToken(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Load live marketplace listings from Cloud SQL
  const loadCloudSqlMarketplace = useCallback(async () => {
    try {
      const res = await fetch('/api/marketplace');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.listings)) {
        const mapped: NormalizedMarketItem[] = data.listings.map((row: any) => {
          let specsAr: Record<string, string> = {};
          try {
            specsAr = JSON.parse(row.specsJson || '{}');
          } catch {
            specsAr = {};
          }
          let parsedImages: string[] = [];
          try {
            parsedImages = JSON.parse(row.imagesJson || '[]');
          } catch {
            parsedImages = [];
          }
          const primaryImage =
            row.image ||
            parsedImages[0] ||
            IMAGE_MANIFEST.marketplace.injectionMachineStudio;
          const allImages =
            parsedImages.length > 0 ? parsedImages : [primaryImage];

          const condLabel =
            row.conditionCode === 'used_excellent'
              ? 'مستعمل — حالة ممتازة'
              : row.conditionCode === 'used_good'
              ? 'مستعمل — حالة جيدة'
              : row.conditionCode === 'needs_maintenance'
              ? 'يحتاج صيانة'
              : 'جديد';
          return {
            id: `db-mkt-${row.id}`,
            titleAr: row.titleAr,
            titleEn: row.titleEn || row.titleAr,
            categoryAr: row.category,
            categoryId: 'injection_machines',
            category: row.category,
            brand: row.manufacturer || 'Industrial',
            model: row.model || String(row.year || 2025),
            conditionAr: condLabel,
            conditionCode: row.conditionCode || 'new',
            isUsed: Boolean(row.isUsed),
            price: Number(row.price || 0),
            currency: row.currency || 'USD',
            city: row.city || 'العاشر من رمضان',
            country: row.country || 'مصر',
            year: Number(row.year || 2025),
            specsAr: { الحالة: condLabel, ...specsAr },
            descriptionAr: row.descriptionAr || row.titleAr,
            sellerId: row.userId ? `usr-${row.userId}` : 'sup-verified',
            sellerNameAr: row.sellerNameAr || 'مورد معتمد',
            sellerTypeAr: 'إعلان موثق في قاعدة البيانات',
            sellerAvatar: IMAGE_MANIFEST.profiles.factoryOwner,
            sellerPhone: row.sellerPhone || '+20 100 245 8890',
            featured: true,
            isSample: Boolean(row.isSample),
            image: primaryImage,
            images: allImages,
            likesCount: 15,
            createdAt: 'الآن',
          };
        });
        setDbMarketListings(mapped);
      }
    } catch {
      // non-fatal
    }
  }, []);

  // Load database-backed Favorites
  const loadUserFavorites = useCallback(async () => {
    if (!realUser) {
      setSavedItems([]);
      setSavedIds([]);
      return;
    }
    try {
      const res = await fetch('/api/favorites', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.items)) {
        setSavedItems(data.items);
        setSavedIds(data.items.map((it: any) => String(it.itemId)));
      }
    } catch {
      // ignore
    }
  }, [realUser]);

  // Load database-backed Follows
  const loadUserFollows = useCallback(async () => {
    if (!realUser) {
      setFollowingIds([]);
      setFollowersCount(0);
      setFollowingCount(0);
      setFollowersList([]);
      setFollowingList([]);
      return;
    }
    try {
      const res = await fetch('/api/follows', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setFollowingIds(Array.isArray(data.followingIds) ? data.followingIds : []);
      setFollowersCount(Number(data.followersCount || 0));
      setFollowingCount(Number(data.followingCount || 0));
      setFollowersList(Array.isArray(data.followersList) ? data.followersList : []);
      setFollowingList(Array.isArray(data.followingList) ? data.followingList : []);
    } catch {
      // ignore
    }
  }, [realUser]);

  // Load database-backed Likes
  const loadLikesSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/likes', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setLikeCountsMap(data.countsMap || {});
      setLikedKeys(Array.isArray(data.likedByMe) ? data.likedByMe : []);
    } catch {
      // ignore
    }
  }, []);

  // Load database-backed Conversations
  const refreshConversations = useCallback(async () => {
    if (!realUser) {
      setConversations([]);
      return;
    }
    try {
      const res = await fetch('/api/conversations', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch {
      // ignore
    }
  }, [realUser]);

  const loadUserAcademyProgress = useCallback(async () => {
    if (!realUser) {
      setAcademyProgressMap({});
      return;
    }
    try {
      const res = await fetch('/api/academy/progress', {
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.progress)) {
        const nextMap: Record<string, AcademyProgressState> = {};
        for (const item of data.progress) {
          nextMap[item.courseId] = {
            courseId: item.courseId,
            completedLessons: item.completedLessons || [],
            quizScore: Number(item.quizScore || 0),
            certificateCode: item.certificateCode || '',
            issuedAt: item.issuedAt || null,
          };
        }
        setAcademyProgressMap(nextMap);
      }
    } catch {
      // ignore
    }
  }, [realUser]);

  useEffect(() => {
    void refreshSession();
    void loadCloudSqlMarketplace();
    void loadLikesSummary();
  }, [refreshSession, loadCloudSqlMarketplace, loadLikesSummary]);

  useEffect(() => {
    void loadUserAcademyProgress();
    void loadUserFavorites();
    void loadUserFollows();
    void refreshConversations();
  }, [
    loadUserAcademyProgress,
    loadUserFavorites,
    loadUserFollows,
    refreshConversations,
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lang) setLangState(parsed.lang);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lang,
        })
      );
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (next: Language) => setLangState(next);
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  // Real Registration API Call
  const registerRealAccount: PlasticoContextValue['registerRealAccount'] = async (
    input
  ) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'تعذر إنشاء الحساب.' };
      }
      setRealUser(data.user);
      setCsrfToken(data.csrfToken || null);
      if (data.user?.accountType !== 'visitor') {
        exitVisitorMode();
      }
      if (data.user?.accountType && DEMO_PROFILES[data.user.accountType as AccountType]) {
        setActiveAccountType(data.user.accountType as AccountType);
      }
      showToast('تم إنشاء حسابك في بلاستيكو بنجاح!', 'Account created successfully!');
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, error: 'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.' };
    }
  };

  // Real Login API Call
  const loginWithRealCredentials: PlasticoContextValue['loginWithRealCredentials'] =
    async (input) => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || 'بيانات الدخول غير صحيحة.' };
        }
        setRealUser(data.user);
        setCsrfToken(data.csrfToken || null);
        if (data.user?.accountType !== 'visitor') {
          exitVisitorMode();
        }
        if (
          data.user?.accountType &&
          DEMO_PROFILES[data.user.accountType as AccountType]
        ) {
          setActiveAccountType(data.user.accountType as AccountType);
        }
        showToast('تم تسجيل الدخول بنجاح!', 'Signed in successfully!');
        return { ok: true, user: data.user };
      } catch {
        return { ok: false, error: 'تعذر الاتصال بالخادم.' };
      }
    };

  // Real Google Sign-In
  const loginWithGoogleAccount: PlasticoContextValue['loginWithGoogleAccount'] =
    async (accountType = 'engineer') => {
      try {
        const cred = await signInWithGooglePopup();
        if (!cred) {
          return { ok: false, error: 'تعذر تسجيل الدخول عبر Google.' };
        }
        const idToken = cred.idToken || (await cred.user.getIdToken().catch(() => ''));
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken, accountType }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || 'تعذر تسجيل الدخول عبر Google.' };
        }
        setRealUser(data.user);
        setCsrfToken(data.csrfToken || null);
        exitVisitorMode();
        showToast('تم تسجيل الدخول بحساب Google بنجاح!', 'Signed in with Google!');
        return { ok: true, user: data.user };
      } catch (err: any) {
        return {
          ok: false,
          error:
            err?.code === 'auth/popup-closed-by-user'
              ? 'تم إغلاق نافذة تسجيل الدخول قبل الإكمال.'
              : 'تعذر إتمام تسجيل الدخول عبر Google.',
        };
      }
    };

  // Real Logout API Call
  const logoutRealSession = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      });
    } catch {
      // ignore
    }
    setRealUser(null);
    setCsrfToken(null);
    exitVisitorMode();
    setSavedItems([]);
    setSavedIds([]);
    setConversations([]);
    showToast('تم تسجيل الخروج بنجاح', 'Signed out successfully');
  };

  // Real Profile Update API Call
  const saveRealProfileUpdate: PlasticoContextValue['saveRealProfileUpdate'] =
    async (patch) => {
      if (!guardVisitorAction('تعديل الملف الشخصي')) {
        return { ok: false, error: 'لا يُسمح بتعديل الملف الشخصي في وضع الزائر.' };
      }
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          },
          body: JSON.stringify(patch),
        });
        const data = await res.json();
        if (!res.ok) {
          return { ok: false, error: data.error || 'تعذر حفظ التعديلات.' };
        }
        setRealUser(data.user);
        if (
          data.user?.accountType &&
          DEMO_PROFILES[data.user.accountType as AccountType]
        ) {
          setActiveAccountType(data.user.accountType as AccountType);
        }
        showToast('تم حفظ بيانات ملفك الشخصي في قاعدة البيانات!', 'Profile saved to database!');
        return { ok: true };
      } catch {
        return { ok: false, error: 'حدث خطأ أثناء الاتصال بالخادم.' };
      }
    };

  const rawUser = profiles[activeAccountType] || DEMO_PROFILES.engineer;
  const currentUser: NormalizedUser = useMemo(() => {
    if (realUser) {
      const roleFallback =
        DEMO_PROFILES[realUser.accountType as AccountType] || DEMO_PROFILES.engineer;
      const resolvedAvatar =
        realUser.avatarUrl && realUser.avatarUrl.trim()
          ? realUser.avatarUrl
          : roleFallback.avatar;
      return {
        ...roleFallback,
        id: `usr-${realUser.id}`,
        accountType: (realUser.accountType as AccountType) || 'engineer',
        role: (realUser.accountType as UserRole) || 'engineer',
        nameAr: realUser.name || roleFallback.nameAr,
        nameEn: realUser.name || roleFallback.nameEn,
        name: realUser.name || roleFallback.nameAr,
        avatar: resolvedAvatar,
        avatarUrl: resolvedAvatar,
        jobTitle: realUser.jobTitle || realUser.specialty || roleFallback.titleAr,
        titleAr:
          realUser.jobTitle ||
          realUser.specialty ||
          realUser.companyName ||
          roleFallback.titleAr,
        titleEn:
          realUser.jobTitle ||
          realUser.specialty ||
          realUser.companyName ||
          roleFallback.titleEn,
        title:
          realUser.jobTitle ||
          realUser.specialty ||
          realUser.companyName ||
          (lang === 'ar' ? roleFallback.titleAr : roleFallback.titleEn),
        country: realUser.country || 'مصر',
        city: realUser.city || 'العاشر من رمضان',
        bioAr: realUser.bio || roleFallback.bioAr,
        phone: realUser.phone || roleFallback.phone,
        verified: Boolean(realUser.verified),
        skills:
          realUser.skills && realUser.skills.length > 0
            ? realUser.skills
            : roleFallback.skills,
        machines: realUser.machines || ['Haitian MA-2500', 'Engel Victory'],
        experiences: realUser.experiences || [],
        certificates: realUser.certificates || [],
        contactPrefs: realUser.contactPrefs || {
          allowChat: true,
          showPhone: true,
          showWhatsapp: true,
        },
        yearsExperience: realUser.experienceYears || roleFallback.yearsExperience,
        yearsOfExperience: realUser.experienceYears || roleFallback.yearsExperience,
        reputationPoints: roleFallback.points,
        email: realUser.email,
        companyName: realUser.companyName,
        joinDate: realUser.createdAt
          ? new Date(realUser.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'long',
            })
          : 'نوفمبر 2026',
      };
    }

    return {
      ...rawUser,
      role: rawUser.accountType,
      name: lang === 'ar' ? rawUser.nameAr : rawUser.nameEn,
      title: lang === 'ar' ? rawUser.titleAr : rawUser.titleEn,
      avatarUrl: rawUser.avatar,
      jobTitle: rawUser.titleAr,
      machines: ['Haitian MA-2500', 'KraussMaffei GX'],
      experiences: [],
      certificates: [],
      contactPrefs: { allowChat: true, showPhone: true, showWhatsapp: true },
      reputationPoints: rawUser.points,
      yearsOfExperience: rawUser.yearsExperience,
      joinDate: 'نوفمبر 2026',
    };
  }, [realUser, rawUser, lang]);

  const loginAs = (accountType: AccountType) => {
    setActiveAccountType(accountType);
  };

  const logout = () => {
    void logoutRealSession();
  };

  const switchAccountType = (accountType: AccountType) => {
    setActiveAccountType(accountType);
    if (realUser) {
      void saveRealProfileUpdate({ accountType });
    }
  };

  const switchPersona = (role: UserRole) => switchAccountType(role);

  const updateCurrentUserProfile = (patch: Partial<UserProfile>) => {
    setProfiles((prev) => ({
      ...prev,
      [activeAccountType]: {
        ...prev[activeAccountType],
        ...patch,
      },
    }));
  };

  const updateProfile = (patch: {
    name?: string;
    title?: string;
    country?: string;
    city?: string;
    yearsOfExperience?: number;
    skills?: string[];
  }) => {
    if (realUser) {
      void saveRealProfileUpdate({
        name: patch.name,
        specialty: patch.title,
        jobTitle: patch.title,
        country: patch.country,
        city: patch.city,
        experienceYears: patch.yearsOfExperience,
        skills: patch.skills,
      });
    }
    updateCurrentUserProfile({
      nameAr: patch.name ?? rawUser.nameAr,
      nameEn: patch.name ?? rawUser.nameEn,
      titleAr: patch.title ?? rawUser.titleAr,
      titleEn: patch.title ?? rawUser.titleEn,
      country: patch.country ?? rawUser.country,
      city: patch.city ?? rawUser.city,
      yearsExperience: patch.yearsOfExperience ?? rawUser.yearsExperience,
      skills: patch.skills ?? rawUser.skills,
    });
  };

  const awardPointsToCurrentUser = (action: keyof typeof POINTS_RULES) => {
    setProfiles((prev) => {
      const current = prev[activeAccountType];
      const { newPoints } = awardReputationPoints(current.points, action);
      return {
        ...prev,
        [activeAccountType]: {
          ...current,
          points: newPoints,
        },
      };
    });
  };

  const normalizedRequests: NormalizedRequest[] = useMemo(
    () =>
      requests.map((r) => ({
        ...r,
        code: r.referenceCode,
        unit: 'قطعة',
        attachments: [r.image],
        descriptionEn: r.descriptionAr,
        offers: r.offers.map((o) => ({
          ...o,
          factoryName: o.factoryNameAr,
          unitPrice: o.unitPriceEgp,
          currency: 'EGP',
          toolingCost: o.setupCostEgp,
        })),
      })),
    [requests]
  );

  const createManufacturingRequest = (input: {
    titleAr: string;
    titleEn?: string;
    processId: ManufacturingProcessId;
    material: string;
    color?: string;
    unitWeightGrams?: number;
    dimensions?: string;
    quantity: number;
    unit?: string;
    moldStatus?: string;
    qualityRequirements?: string;
    packagingRequirements?: string;
    deliveryDate?: string;
    city: string;
    descriptionAr?: string;
    descriptionEn?: string;
    contactName: string;
    contactPhone: string;
    attachments?: string[];
  }): string => {
    if (!guardVisitorAction('نشر طلب تصنيع (RFQ)')) {
      return '';
    }
    const id = `mfg-req-${Date.now()}`;
    const num = 105 + requests.length;
    const newReq: ManufacturingRequest = {
      id,
      referenceCode: `MFG-2026-${num}`,
      requestType: 'product_manufacturing',
      titleAr: input.titleAr,
      titleEn: input.titleEn || input.titleAr,
      categoryAr: 'تصنيع وتشغيل للغير',
      processId: input.processId,
      descriptionAr: input.descriptionAr || input.titleAr,
      purposeAr: 'إنتاج تجاري',
      material: input.material,
      dimensions: input.dimensions || 'قياسي',
      unitWeightGrams: input.unitWeightGrams || 25,
      colorAr: input.color || 'أبيض',
      qualityRequirementsAr: input.qualityRequirements || 'خامة بكر 100%',
      packagingRequirementsAr: input.packagingRequirements || 'كراتين مضلعة',
      quantity: input.quantity,
      productionFrequency: 'recurring',
      startDate: '2026-11-15',
      deliveryDate: input.deliveryDate || '2026-12-25',
      moldOwnership: 'customer_owned',
      needMoldManufacturing: false,
      needMaterialSourcing: true,
      country: 'مصر',
      city: input.city,
      deliveryLocation: input.city,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      preferredContactMethod: 'phone',
      status: 'receiving_offers',
      createdAt: 'الآن',
      publisherName: currentUser.name,
      image:
        input.attachments?.[0] ||
        IMAGE_MANIFEST.marketplace.petBottlesCapsSet,
      offers: [],
    };
    setRequests((prev) => [newReq, ...prev]);

    if (realUser) {
      void fetch('/api/rfqs', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          referenceCode: newReq.referenceCode,
          titleAr: newReq.titleAr,
          processId: newReq.processId,
          material: newReq.material,
          quantity: newReq.quantity,
          city: newReq.city,
          status: newReq.status,
        }),
      });
    }

    showToast('تم نشر طلب التصنيع (RFQ) بنجاح!', 'RFQ published successfully!');
    return id;
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
    if (!guardVisitorAction('تحديث حالة طلب التصنيع')) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
    showToast('تم تحديث حالة طلب التصنيع بنجاح', 'Request status updated');
  };

  const submitFactoryOffer = (
    requestId: string,
    offerInput: {
      unitPrice: number;
      currency?: string;
      toolingCost: number;
      moq: number;
      leadTimeDays: number;
      notes?: string;
      includedServices?: string[];
    }
  ) => {
    if (!guardVisitorAction('تقديم عرض سعر تصنيعي')) return;
    const newOffer: ManufacturingOffer = {
      id: `off-${Date.now()}`,
      requestId,
      factoryId: currentUser.id,
      factoryNameAr: currentUser.companyName || 'مصنع الدلتا للصناعات البلاستيكية الدقيقة',
      factoryNameEn: 'Delta Precision Plastics Factory',
      factoryCity: currentUser.city,
      unitPriceEgp: offerInput.unitPrice,
      pricingBasisAr: 'شامل الخامة والتشغيل',
      setupCostEgp: offerInput.toolingCost,
      moq: offerInput.moq,
      leadTimeDays: offerInput.leadTimeDays,
      availableCapacityNote: 'خط إنتاج جاهز فوراً',
      materialSourcingAr: 'شامل الخامة البكر',
      toolingResponsibilityAr: 'صيانة دورية مجانية',
      sampleAvailable: true,
      deliveryTermsAr: 'تسليم أرض المصنع',
      expiresAt: '2026-12-01',
      notesAr: offerInput.notes || 'عرض شامل الخامة البكر والتعبئة.',
      status: 'pending',
      createdAt: 'الآن',
    };
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, offers: [newOffer, ...r.offers] } : r
      )
    );
    showToast('تم تقديم عرض السعر من مصنعك بنجاح!', 'Factory quote submitted!');
  };

  const updateOfferStatus = (requestId: string, offerId: string, status: string) => {
    if (!guardVisitorAction('تحديث حالة عرض السعر')) return;
    const mapped: ManufacturingOffer['status'] =
      status === 'مقبول'
        ? 'accepted'
        : status === 'قيد التفاوض'
        ? 'negotiating'
        : 'pending';
    setRequests((prev) =>
      prev.map((r) =>
        r.id !== requestId
          ? r
          : {
              ...r,
              offers: r.offers.map((o) =>
                o.id === offerId ? { ...o, status: mapped } : o
              ),
            }
      )
    );
    showToast(`تم تحديث حالة العرض إلى: ${status}`, `Offer updated: ${status}`);
  };

  const submitSupplierRfq: PlasticoContextValue['submitSupplierRfq'] = async (
    input
  ) => {
    if (!guardVisitorAction('إرسال طلب عرض سعر للمورد')) {
      return {
        ok: false,
        error: 'وضع الزائر مخصص للتصفح فقط — يرجى تسجيل الدخول بحساب فعلي.',
      };
    }
    try {
      const res = await fetch('/api/suppliers/rfq', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error || 'تعذر إرسال طلب عرض السعر.' };
      }
      showToast(
        'تم إرسال طلب عرض السعر للمورد وحفظه في حسابك بنجاح!',
        'Supplier RFQ submitted and saved!'
      );
      return { ok: true };
    } catch {
      return { ok: false, error: 'تعذر الاتصال بالخادم.' };
    }
  };

  const saveCourseProgress: PlasticoContextValue['saveCourseProgress'] = async (
    courseId,
    completedLessons,
    quizScore,
    requiredLessonsCount
  ) => {
    if (!guardVisitorAction('حفظ تقدم الدورة وإصدار الشهادة')) {
      return null;
    }
    try {
      const res = await fetch('/api/academy/progress', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({
          courseId,
          completedLessons,
          quizScore,
          requiredLessonsCount,
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const row = data.progress;
      const state: AcademyProgressState = {
        courseId,
        completedLessons,
        quizScore,
        certificateCode: row?.certificateCode || '',
        issuedAt: row?.issuedAt || null,
      };
      setAcademyProgressMap((prev) => ({
        ...prev,
        [courseId]: state,
      }));
      if (state.certificateCode) {
        showToast(
          `تهانينا! تم إصدار شهادة إتمام الدورة برقم ${state.certificateCode}`,
          `Certificate issued: ${state.certificateCode}`
        );
      } else {
        showToast('تم حفظ تقدمك في الدرس بنجاح', 'Lesson progress saved');
      }
      return state;
    } catch {
      return null;
    }
  };

  const normalizedMachines: NormalizedMachine[] = useMemo(
    () =>
      machines.map((m) => ({
        ...m,
        machineBrand: `${m.brand} ${m.model}`,
        factoryName: m.factoryNameAr,
        availabilityStatus: 'متاحة للتشغيل للغير',
        hourlyOrPerPieceRate: `${m.availableHoursPerDay} ساعة/يوم متاحة`,
      })),
    [machines]
  );

  const updateMachineStatus = (
    machineId: string,
    status: MachineAvailabilityStatus
  ) => {
    if (!guardVisitorAction('تحديث حالة الماكينة')) return;
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, status } : m))
    );
  };

  const normalizedFaults: NormalizedFault[] = useMemo(
    () =>
      faults.map((f) => ({
        ...f,
        machineType: f.machineTypeAr,
        polymerMaterial: f.materialUsed,
        authorName: f.publisherName,
        authorRoleLabel: `${f.publisherRoleAr} - ${f.city}`,
        descriptionEn: f.descriptionAr,
        solutions: f.solutions.map((s) => ({
          id: s.id,
          faultId: s.faultId,
          authorName: s.authorName,
          authorRoleAr: s.authorRoleAr,
          content: s.contentAr,
          contentAr: s.contentAr,
          helpfulVotes: s.upvotes,
          upvotes: s.upvotes,
          isAccepted: s.isBestSolution,
          isBestSolution: s.isBestSolution,
          createdAt: s.createdAt,
        })),
      })),
    [faults]
  );

  const createFault = (input: {
    titleAr: string;
    titleEn?: string;
    machineType: string;
    polymerMaterial: string;
    descriptionAr: string;
    descriptionEn?: string;
    symptoms?: string[];
    image?: string;
    images?: string[];
  }) => {
    if (!guardVisitorAction('نشر عطل أو سؤال فني')) return;
    const primaryImg =
      input.image ||
      (input.images && input.images.length > 0
        ? input.images[0]
        : IMAGE_MANIFEST.marketplace.injectionMachineWorkshop);
    const allImgs =
      input.images && input.images.length > 0 ? input.images : [primaryImg];
    const newFault: IndustrialFault = {
      id: `flt-${Date.now()}`,
      titleAr: input.titleAr,
      titleEn: input.titleEn || input.titleAr,
      machineTypeAr: input.machineType,
      machineBrand: 'Haitian',
      machineModel: 'MA-2500',
      specializationAr: 'هيدروليك وكنترول',
      descriptionAr: input.descriptionAr,
      symptomsAr: input.symptoms || ['فصل مفاجئ'],
      materialUsed: input.polymerMaterial,
      urgency: 'urgent',
      status: 'open',
      publisherId: currentUser.id,
      publisherName: currentUser.name,
      publisherRoleAr: currentUser.title,
      publisherAvatar: currentUser.avatar,
      city: currentUser.city,
      createdAt: 'الآن',
      image: primaryImg,
      images: allImgs,
      likesCount: 1,
      solutions: [],
    };
    setFaults((prev) => [newFault, ...prev]);
    awardPointsToCurrentUser('PUBLISH_FAULT');
    showToast('تم نشر السؤال الفني بنجاح!', 'Technical question published!');
  };

  const addFaultSolution = (
    faultId: string,
    contentAr: string,
    rootCauseAr = 'خلل في حساس الضغط'
  ) => {
    if (!guardVisitorAction('إضافة تعليق أو حل فني')) return;
    setFaults((prev) =>
      prev.map((f) =>
        f.id !== faultId
          ? f
          : {
              ...f,
              solutions: [
                ...f.solutions,
                {
                  id: `sol-${Date.now()}`,
                  faultId,
                  authorName: currentUser.name,
                  authorRoleAr: currentUser.title,
                  authorAccountType: currentUser.accountType,
                  contentAr,
                  rootCauseAr,
                  stepsAr: [contentAr],
                  upvotes: 1,
                  isBestSolution: false,
                  createdAt: 'الآن',
                },
              ],
            }
      )
    );
    awardPointsToCurrentUser('PUBLISH_SOLUTION');
    showToast('تم نشر حلك الفني بنجاح!', 'Technical solution posted!');
  };

  const upvoteFaultSolution = (faultId: string, solutionId: string) => {
    if (!guardVisitorAction('تأييد الحل الفني')) return;
    setFaults((prev) =>
      prev.map((f) =>
        f.id !== faultId
          ? f
          : {
              ...f,
              solutions: f.solutions.map((s) =>
                s.id === solutionId ? { ...s, upvotes: s.upvotes + 1 } : s
              ),
            }
      )
    );
    awardPointsToCurrentUser('POSITIVE_RATING');
    showToast('تم تأييد الحل الفني كمفيد', 'Solution marked helpful');
  };

  const acceptFaultSolution = (faultId: string, solutionId: string) => {
    if (!guardVisitorAction('اعتماد أفضل حل')) return;
    setFaults((prev) =>
      prev.map((f) =>
        f.id !== faultId
          ? f
          : {
              ...f,
              status: 'solved',
              solutions: f.solutions.map((s) => ({
                ...s,
                isBestSolution: s.id === solutionId,
              })),
            }
      )
    );
    awardPointsToCurrentUser('BEST_SOLUTION');
    showToast('تم اعتماد هذا الحل كأفضل حل مجرب!', 'Marked as Best Solution!');
  };

  const normalizedJobs: NormalizedJob[] = useMemo(
    () =>
      jobs.map((j) => ({
        ...j,
        companyName: j.factoryNameAr,
        salaryRange: j.salaryRangeAr,
        experienceRange: j.experienceRequiredAr,
        postedAt: j.createdAt,
        applied: j.appliedByCurrentUser,
      })),
    [jobs]
  );

  const applyForJob = (jobId: string) => {
    if (!guardVisitorAction('التقديم على وظيفة')) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, appliedByCurrentUser: true, applicantsCount: j.applicantsCount + 1 }
          : j
      )
    );
    showToast(
      'تم إرسال ملفك المهني للتقديم على الوظيفة بنجاح!',
      'Applied with your professional profile!'
    );
  };

  const createJob = (input: {
    titleAr: string;
    titleEn?: string;
    companyName: string;
    city: string;
    salaryRange?: string;
  }) => {
    if (!guardVisitorAction('نشر إعلان وظيفة')) return;
    const newJob: IndustrialJob = {
      id: `job-${Date.now()}`,
      titleAr: input.titleAr,
      titleEn: input.titleEn || input.titleAr,
      factoryNameAr: input.companyName,
      city: input.city,
      industrialArea: input.city,
      jobTypeAr: 'دوام كامل',
      specializationAr: 'صيانة وتشغيل',
      machineTypeAr: 'ماكينات حقن',
      experienceRequiredAr: 'خبرة 2 - 5 سنوات',
      salaryRangeAr: input.salaryRange || 'حسب الخبرة',
      descriptionAr: input.titleAr,
      responsibilitiesAr: ['تشغيل وصيانة خطوط الإنتاج'],
      requirementsAr: ['خبرة في مصانع البلاستيك'],
      skillsRequired: ['حقن', 'هيدروليك'],
      deadline: '2026-12-30',
      createdAt: 'الآن',
      applicantsCount: 1,
    };
    setJobs((prev) => [newJob, ...prev]);
    showToast('تم نشر الوظيفة بنجاح في منصة التوظيف!', 'Job posted successfully!');
  };

  const normalizedMarket: NormalizedMarketItem[] = useMemo(() => {
    const seedMapped: NormalizedMarketItem[] = market.map((m) => {
      let cat = m.categoryId as string;
      if (m.id.includes('heater')) cat = 'heaters';
      else if (m.id.includes('chiller')) cat = 'chillers';
      else if (m.id.includes('dryer')) cat = 'dryers_hoppers';
      else if (m.categoryId === 'injection_machines') cat = 'injection_machines';
      else if (m.categoryId === 'molds') cat = 'molds';
      else if (m.categoryId === 'raw_materials') cat = 'raw_materials';
      else if (m.categoryId === 'auxiliaries') cat = 'auxiliary_equipment';

      const isUsedItem =
        m.conditionAr.includes('مستعمل') ||
        m.conditionAr.includes('ممتازة') ||
        m.conditionAr.includes('جيدة') ||
        m.conditionAr.includes('صيانة');

      const conditionCode: NormalizedMarketItem['conditionCode'] =
        m.conditionAr.includes('صيانة')
          ? 'needs_maintenance'
          : m.conditionAr.includes('جيدة')
          ? 'used_good'
          : isUsedItem
          ? 'used_excellent'
          : 'new';

      return {
        ...m,
        images: m.images && m.images.length > 0 ? m.images : [m.image],
        category: cat,
        isUsed: isUsedItem,
        conditionCode,
        isSample: true,
        country: 'مصر',
      };
    });

    return [...dbMarketListings, ...seedMapped];
  }, [market, dbMarketListings]);

  const createMarketItem: PlasticoContextValue['createMarketItem'] = (input) => {
    if (!guardVisitorAction('نشر إعلان في السوق الصناعي')) return;
    const isUsed =
      input.isUsed !== undefined
        ? input.isUsed
        : input.conditionCode !== 'new' && !input.conditionAr.includes('جديد');
    const condCode =
      input.conditionCode || (isUsed ? 'used_excellent' : 'new');
    const imagesList =
      input.images && input.images.length > 0 ? input.images : [input.image];

    if (realUser) {
      void (async () => {
        try {
          const res = await fetch('/api/marketplace', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
            },
            body: JSON.stringify({
              titleAr: input.titleAr,
              titleEn: input.titleEn || input.titleAr,
              category: input.category,
              isUsed,
              conditionCode: condCode,
              manufacturer: input.manufacturer || 'Haitian',
              model: input.model || '2024',
              year: input.year || 2024,
              price: input.price,
              currency: input.currency || 'USD',
              city: input.city,
              country: input.country || 'مصر',
              descriptionAr: input.titleAr,
              image: imagesList[0],
              images: imagesList,
            }),
          });
          if (res.ok) {
            await loadCloudSqlMarketplace();
          }
        } catch {
          // fallback below
        }
      })();
    }

    const item: MarketListing = {
      id: `mkt-${Date.now()}`,
      titleAr: input.titleAr,
      titleEn: input.titleEn || input.titleAr,
      categoryAr: input.category,
      categoryId: 'injection_machines',
      brand: input.manufacturer || 'Haitian',
      model: input.model || '2024',
      conditionAr: input.conditionAr || (isUsed ? 'مستعمل — حالة ممتازة' : 'جديد'),
      price: input.price,
      currency: (input.currency as any) || 'USD',
      city: input.city,
      year: input.year || 2024,
      specsAr: { الحالة: input.conditionAr },
      descriptionAr: input.titleAr,
      sellerId: currentUser.id,
      sellerNameAr: currentUser.name,
      sellerTypeAr: 'معلن مسجل',
      sellerAvatar: currentUser.avatar,
      sellerPhone: currentUser.phone,
      featured: true,
      image: imagesList[0],
      images: imagesList,
      likesCount: 1,
      createdAt: 'الآن',
    };
    setMarket((prev) => [item, ...prev]);
    showToast('تم إضافة العرض في السوق الصناعي بنجاح!', 'Listing added to Marketplace!');
  };

  const reportMarketItem = async (id: string) => {
    if (!guardVisitorAction('الإبلاغ عن إعلان')) return;
    if (id.startsWith('db-mkt-')) {
      const numericId = Number(id.replace('db-mkt-', ''));
      await fetch(`/api/marketplace/${numericId}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      }).catch(() => {});
    }
    showToast(
      'تم استلام بلاغك لمراجعة الإعلان من فريق الجودة.',
      'Listing reported for quality review.'
    );
  };

  // Database-backed Favorites toggle
  const toggleSavedItem = (
    id: string,
    meta?: { itemType?: string; titleAr?: string; route?: string }
  ) => {
    if (!guardVisitorAction('حفظ العناصر في المفضلة')) {
      return;
    }

    // Resolve item metadata if not passed explicitly
    let itemType = meta?.itemType || 'market';
    let titleAr = meta?.titleAr || id;
    let route = meta?.route || `/app/market/${id}`;

    if (!meta?.titleAr) {
      const mkt = normalizedMarket.find((x) => x.id === id);
      const req = normalizedRequests.find((x) => x.id === id);
      const flt = normalizedFaults.find((x) => x.id === id);
      const job = normalizedJobs.find((x) => x.id === id);
      if (mkt) {
        itemType = 'market';
        titleAr = mkt.titleAr;
        route = `/app/market/${mkt.id}`;
      } else if (req) {
        itemType = 'rfq';
        titleAr = req.titleAr;
        route = `/app/manufacturing/${req.id}`;
      } else if (flt) {
        itemType = 'fault';
        titleAr = flt.titleAr;
        route = `/app/faults/${flt.id}`;
      } else if (job) {
        itemType = 'job';
        titleAr = job.titleAr;
        route = `/app/jobs`;
      }
    }

    // Optimistic UI update
    const currentlySaved = savedIds.includes(id);
    if (currentlySaved) {
      setSavedIds((prev) => prev.filter((x) => x !== id));
      setSavedItems((prev) => prev.filter((x) => x.itemId !== id));
    } else {
      setSavedIds((prev) => [...prev, id]);
      setSavedItems((prev) => [
        {
          id: Date.now(),
          itemType,
          itemId: id,
          titleAr,
          route,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    void (async () => {
      try {
        const res = await fetch('/api/favorites/toggle', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          },
          body: JSON.stringify({
            itemType,
            itemId: id,
            titleAr,
            route,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            setSavedItems(data.items);
            setSavedIds(data.items.map((it: any) => String(it.itemId)));
          }
          showToast(
            data.saved
              ? 'تم حفظ العنصر في المفضلة بنجاح'
              : 'تمت إزالة العنصر من المفضلة',
            data.saved ? 'Saved to favorites' : 'Removed from favorites'
          );
        }
      } catch {
        // ignore
      }
    })();
  };

  const removeSavedItem = async (itemId: string) => {
    if (!guardVisitorAction('إزالة عنصر من المفضلة')) return;
    setSavedIds((prev) => prev.filter((x) => x !== itemId));
    setSavedItems((prev) => prev.filter((x) => x.itemId !== itemId));
    if (!realUser) return;
    try {
      const res = await fetch(`/api/favorites/${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          setSavedItems(data.items);
          setSavedIds(data.items.map((it: any) => String(it.itemId)));
        }
        showToast('تمت إزالة العنصر من المفضلة', 'Removed from favorites');
      }
    } catch {
      // ignore
    }
  };

  // Database-backed Follow / Unfollow
  const isFollowing = useCallback(
    (targetId: string) => followingIds.includes(targetId),
    [followingIds]
  );

  const getFollowerCount = useCallback(
    (targetId: string, baseCount = 42) => {
      const delta = targetFollowerDeltas[targetId] ?? (followingIds.includes(targetId) ? 1 : 0);
      return Math.max(0, baseCount + delta);
    },
    [targetFollowerDeltas, followingIds]
  );

  const toggleFollow: PlasticoContextValue['toggleFollow'] = async (target) => {
    if (!guardVisitorAction('متابعة الحسابات والشركات')) {
      return false;
    }
    if (!realUser) return false;
    if (target.targetId === `usr-${realUser.id}`) {
      showToast('لا يمكنك متابعة حسابك الشخصي.', 'You cannot follow your own account.');
      return false;
    }

    const wasFollowing = followingIds.includes(target.targetId);
    setFollowingIds((prev) =>
      wasFollowing
        ? prev.filter((id) => id !== target.targetId)
        : [...prev, target.targetId]
    );
    setTargetFollowerDeltas((prev) => ({
      ...prev,
      [target.targetId]: wasFollowing ? 0 : 1,
    }));

    try {
      const res = await fetch('/api/follows/toggle', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify(target),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'تعذر تنفيذ المتابعة.');
        return wasFollowing;
      }
      const data = await res.json();
      setFollowingIds(Array.isArray(data.followingIds) ? data.followingIds : []);
      setFollowersCount(Number(data.followersCount || 0));
      setFollowingCount(Number(data.followingCount || 0));
      setFollowersList(Array.isArray(data.followersList) ? data.followersList : []);
      setFollowingList(Array.isArray(data.followingList) ? data.followingList : []);
      showToast(
        data.following
          ? `تمت متابعة ${target.targetNameAr} بنجاح`
          : `تم إلغاء متابعة ${target.targetNameAr}`,
        data.following ? `Following ${target.targetNameAr}` : `Unfollowed ${target.targetNameAr}`
      );
      return Boolean(data.following);
    } catch {
      return wasFollowing;
    }
  };

  // Database-backed Likes
  const isLiked = useCallback(
    (itemType: string, itemId: string) =>
      likedKeys.includes(`${itemType}:${itemId}`),
    [likedKeys]
  );

  const getLikeCount = useCallback(
    (itemType: string, itemId: string, baseCount = 12) => {
      const key = `${itemType}:${itemId}`;
      const dbCount = likeCountsMap[key] || 0;
      return baseCount + dbCount;
    },
    [likeCountsMap]
  );

  const toggleLike = async (itemType: string, itemId: string) => {
    if (!guardVisitorAction('تسجيل الإعجاب بالمحتوى')) {
      return;
    }
    const key = `${itemType}:${itemId}`;
    const already = likedKeys.includes(key);

    // Optimistic update
    setLikedKeys((prev) =>
      already ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setLikeCountsMap((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + (already ? -1 : 1)),
    }));

    try {
      const res = await fetch('/api/likes/toggle', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
        body: JSON.stringify({ itemType, itemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikeCountsMap((prev) => ({
          ...prev,
          [key]: Number(data.count || 0),
        }));
      }
    } catch {
      // ignore
    }
  };

  // Database-backed In-App Chat
  const unreadChatCount = useMemo(
    () =>
      conversations.reduce(
        (acc, c) => acc + (Number(c.unreadCount) || 0),
        0
      ),
    [conversations]
  );

  const startOrOpenConversation: PlasticoContextValue['startOrOpenConversation'] =
    async (input) => {
      if (!guardVisitorAction('بدء محادثة أو مراسلة')) {
        return null;
      }
      try {
        const res = await fetch('/api/conversations/start', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showToast(err.error || 'تعذر بدء المحادثة.');
          return null;
        }
        const data = await res.json();
        await refreshConversations();
        return Number(data.conversation?.id) || null;
      } catch {
        showToast('تعذر الاتصال بخادم المحادثات.');
        return null;
      }
    };

  const normalizedNews = useMemo(
    () =>
      news.map((n) => ({
        ...n,
        publishedAt: n.publishedDate,
      })),
    [news]
  );

  const normalizedNotifications: NormalizedNotification[] = useMemo(
    () =>
      notifications.map((n) => ({
        ...n,
        isRead: n.read,
        bodyAr: n.messageAr,
        bodyEn: n.messageEn,
        link: n.targetLink,
      })),
    [notifications]
  );

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (realUser && id.startsWith('db-notif-')) {
      const numId = Number(id.replace('db-notif-', ''));
      if (numId > 0) {
        void fetch('/api/notifications/read', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
          },
          body: JSON.stringify({ notificationId: numId }),
        }).catch(() => {});
      }
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (realUser) {
      void fetch('/api/notifications/read-all', {
        method: 'POST',
        credentials: 'include',
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {},
      }).catch(() => {});
    }
    showToast('تم تحديد جميع الإشعارات كمقروءة', 'All notifications marked as read');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfiles(DEMO_PROFILES);
    setRequests(INITIAL_MANUFACTURING_REQUESTS);
    setMachines(INITIAL_AVAILABLE_MACHINES);
    setFaults(INITIAL_FAULTS);
    setJobs(INITIAL_JOBS);
    setMarket([...EXTRA_MARKETPLACE_SAMPLES, ...INITIAL_MARKET_LISTINGS]);
    setNews(INITIAL_NEWS);
    setNotifications(INITIAL_NOTIFICATIONS);
    showToast('تم استعادة البيانات الافتراضية بنجاح', 'Demo data reset to defaults');
  };

  return (
    <PlasticoContext.Provider
      value={{
        lang,
        setLang,
        t,
        isSearchOpen,
        setIsSearchOpen,
        isAuthenticated,
        authLoading,
        realUser,
        csrfToken,
        isVisitorMode,
        isReadOnlyVisitor,
        enterVisitorMode,
        exitVisitorMode,
        visitorBlockedAction,
        closeVisitorBlockedModal,
        guardVisitorAction,
        refreshSession,
        registerRealAccount,
        loginWithRealCredentials,
        loginWithGoogleAccount,
        logoutRealSession,
        saveRealProfileUpdate,
        loginAs,
        logout,
        currentUser,
        switchAccountType,
        switchPersona,
        updateCurrentUserProfile,
        updateProfile,
        requests: normalizedRequests,
        createManufacturingRequest,
        updateRequestStatus,
        submitFactoryOffer,
        updateOfferStatus,
        providers,
        suppliers,
        submitSupplierRfq,
        academyCourses,
        academyProgressMap,
        saveCourseProgress,
        machines: normalizedMachines,
        updateMachineStatus,
        faults: normalizedFaults,
        createFault,
        addFaultSolution,
        upvoteFaultSolution,
        acceptFaultSolution,
        jobs: normalizedJobs,
        applyForJob,
        createJob,
        market: normalizedMarket,
        createMarketItem,
        reportMarketItem,
        savedIds,
        savedItems,
        toggleSavedItem,
        removeSavedItem,
        followingIds,
        followersCount,
        followingCount,
        followersList,
        followingList,
        isFollowing,
        getFollowerCount,
        toggleFollow,
        isLiked,
        getLikeCount,
        toggleLike,
        conversations,
        unreadChatCount,
        refreshConversations,
        startOrOpenConversation,
        openLightbox,
        booths,
        expoBooths: booths,
        news: normalizedNews,
        notifications: normalizedNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        toastMessage,
        showToast,
        resetDemoData,
      }}
    >
      {children}
      <MediaLightbox
        isOpen={lightboxState.isOpen}
        images={lightboxState.images}
        initialIndex={lightboxState.initialIndex}
        titleAr={lightboxState.titleAr}
        onClose={() =>
          setLightboxState((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
    </PlasticoContext.Provider>
  );
};

export const usePlastico = (): PlasticoContextValue => {
  const ctx = useContext(PlasticoContext);
  if (!ctx) {
    throw new Error('usePlastico must be used inside PlasticoProvider');
  }
  return ctx;
};
