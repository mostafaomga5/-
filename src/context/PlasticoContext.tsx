import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
import { awardReputationPoints, POINTS_RULES } from '../lib/domainRules';

export interface NormalizedUser extends UserProfile {
  role: UserRole;
  name: string;
  title: string;
  reputationPoints: number;
  yearsOfExperience: number;
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

interface PlasticoContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (ar: string, en: string) => string;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthenticated: boolean;
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
    price: number;
    currency?: string;
    city: string;
    sellerName?: string;
    sellerRole?: string;
    specs?: string[];
    image: string;
  }) => void;
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

const STORAGE_KEY = 'plastico_demo_state_v2';

const PlasticoContext = createContext<PlasticoContextValue | undefined>(undefined);

export const PlasticoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('ar');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [profiles, setProfiles] = useState<Record<AccountType, UserProfile>>(DEMO_PROFILES);
  const [activeAccountType, setActiveAccountType] = useState<AccountType>('engineer');
  const [requests, setRequests] = useState<ManufacturingRequest[]>(
    INITIAL_MANUFACTURING_REQUESTS
  );
  const [providers, setProviders] = useState<FactoryServiceProvider[]>(
    INITIAL_FACTORY_PROVIDERS
  );
  const [machines, setMachines] = useState<AvailableMachineListing[]>(
    INITIAL_AVAILABLE_MACHINES
  );
  const [faults, setFaults] = useState<IndustrialFault[]>(INITIAL_FAULTS);
  const [jobs, setJobs] = useState<IndustrialJob[]>(INITIAL_JOBS);
  const [market, setMarket] = useState<MarketListing[]>(INITIAL_MARKET_LISTINGS);
  const [booths] = useState<ExhibitionBooth[]>(INITIAL_EXHIBITION_BOOTHS);
  const [news, setNews] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.lang) setLangState(parsed.lang);
        if (parsed.activeAccountType) setActiveAccountType(parsed.activeAccountType);
        if (parsed.profiles) setProfiles(parsed.profiles);
        if (parsed.requests) setRequests(parsed.requests);
        if (parsed.faults) setFaults(parsed.faults);
        if (parsed.jobs) setJobs(parsed.jobs);
        if (parsed.market) setMarket(parsed.market);
        if (parsed.notifications) setNotifications(parsed.notifications);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          lang,
          activeAccountType,
          profiles,
          requests,
          faults,
          jobs,
          market,
          notifications,
        })
      );
    } catch {
      // ignore storage quota
    }
  }, [lang, activeAccountType, profiles, requests, faults, jobs, market, notifications]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (next: Language) => setLangState(next);
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  const showToast = (msgAr: string, msgEn?: string) => {
    const text = lang === 'ar' ? msgAr : msgEn || msgAr;
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage((prev) => (prev === text ? null : prev));
    }, 3400);
  };

  const rawUser = profiles[activeAccountType] || DEMO_PROFILES.engineer;
  const currentUser: NormalizedUser = useMemo(
    () => ({
      ...rawUser,
      role: rawUser.accountType,
      name: lang === 'ar' ? rawUser.nameAr : rawUser.nameEn,
      title: lang === 'ar' ? rawUser.titleAr : rawUser.titleEn,
      reputationPoints: rawUser.points,
      yearsOfExperience: rawUser.yearsExperience,
    }),
    [rawUser, lang]
  );

  const loginAs = (accountType: AccountType, customName?: string) => {
    setActiveAccountType(accountType);
    setIsAuthenticated(true);
    if (customName && customName.trim()) {
      setProfiles((prev) => ({
        ...prev,
        [accountType]: {
          ...prev[accountType],
          nameAr: customName.trim(),
          nameEn: customName.trim(),
        },
      }));
    }
    showToast('تم تسجيل الدخول بنجاح!', 'Signed in successfully!');
  };

  const logout = () => {
    setIsAuthenticated(false);
    showToast('تم تسجيل الخروج بنجاح', 'Signed out');
  };

  const switchAccountType = (accountType: AccountType) => {
    setActiveAccountType(accountType);
    setIsAuthenticated(true);
    showToast(
      `تم التبديل إلى حساب: ${DEMO_PROFILES[accountType].nameAr}`,
      `Switched role to: ${DEMO_PROFILES[accountType].nameEn}`
    );
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
        '/images/plastico/manufacturing/blow-molding-bottles.svg',
      offers: [],
    };
    setRequests((prev) => [newReq, ...prev]);
    showToast('تم نشر طلب التصنيع (RFQ) بنجاح!', 'RFQ published successfully!');
    return id;
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
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
    const newOffer: ManufacturingOffer = {
      id: `off-${Date.now()}`,
      requestId,
      factoryId: currentUser.id,
      factoryNameAr: 'مصنع الدلتا للصناعات البلاستيكية الدقيقة',
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
  }) => {
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
      publisherName: currentUser.name,
      publisherRoleAr: currentUser.title,
      city: currentUser.city,
      createdAt: 'الآن',
      image: '/images/plastico/manufacturing/thermoforming-packaging.svg',
      solutions: [],
    };
    setFaults((prev) => [newFault, ...prev]);
    awardPointsToCurrentUser('PUBLISH_FAULT');
    showToast('تم نشر العطل بنجاح (+10 نقاط سمعة)!', 'Fault published (+10 pts)!');
  };

  const addFaultSolution = (
    faultId: string,
    contentAr: string,
    rootCauseAr = 'خلل في حساس الضغط'
  ) => {
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
    showToast('تم نشر حلك الفني بنجاح (+50 نقطة سمعة)!', 'Solution added (+50 pts)!');
  };

  const upvoteFaultSolution = (faultId: string, solutionId: string) => {
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
    showToast('تم تسجيل إعجابك بالحل الفني (+20 نقطة)', 'Upvoted solution (+20 pts)');
  };

  const acceptFaultSolution = (faultId: string, solutionId: string) => {
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
    showToast('تم اعتماد هذا الحل كأفضل حل (+100 نقطة)!', 'Marked as Best Solution!');
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
      salaryRangeAr: input.salaryRange || '$800 - $1,200',
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

  const normalizedMarket: NormalizedMarketItem[] = useMemo(
    () =>
      market.map((m) => ({
        ...m,
        category:
          m.categoryId === 'injection_machines'
            ? 'used_machines'
            : m.categoryId,
      })),
    [market]
  );

  const createMarketItem = (input: {
    titleAr: string;
    titleEn?: string;
    category: string;
    conditionAr: string;
    price: number;
    city: string;
    image: string;
  }) => {
    const item: MarketListing = {
      id: `mkt-${Date.now()}`,
      titleAr: input.titleAr,
      titleEn: input.titleEn || input.titleAr,
      categoryAr: 'ماكينات ومعدات',
      categoryId: 'injection_machines',
      brand: 'Haitian',
      model: '2024',
      conditionAr: 'ممتازة',
      price: input.price,
      currency: 'USD',
      city: input.city,
      year: 2022,
      specsAr: { الحالة: input.conditionAr },
      descriptionAr: input.titleAr,
      sellerNameAr: currentUser.name,
      sellerTypeAr: 'تاجر معتمد',
      sellerPhone: currentUser.phone,
      featured: true,
      image: input.image,
      createdAt: 'الآن',
    };
    setMarket((prev) => [item, ...prev]);
    showToast('تم إضافة المنتج للبيع في السوق بنجاح!', 'Product added to Marketplace!');
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
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('تم تحديد جميع الإشعارات كمقروءة', 'All notifications marked as read');
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfiles(DEMO_PROFILES);
    setRequests(INITIAL_MANUFACTURING_REQUESTS);
    setProviders(INITIAL_FACTORY_PROVIDERS);
    setMachines(INITIAL_AVAILABLE_MACHINES);
    setFaults(INITIAL_FAULTS);
    setJobs(INITIAL_JOBS);
    setMarket(INITIAL_MARKET_LISTINGS);
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
