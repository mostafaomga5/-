export type Language = 'ar' | 'en';

export type AccountType =
  | 'technician'
  | 'engineer'
  | 'factory'
  | 'supplier'
  | 'trader'
  | 'visitor';

export type UserRole = AccountType;

export type ReputationLevel = 'beginner' | 'professional' | 'expert';

export type ManufacturingProcessId =
  | 'injection'
  | 'blow'
  | 'film'
  | 'pipe'
  | 'profile'
  | 'sheet'
  | 'vacuum'
  | 'thermoforming'
  | 'recycling'
  | 'mold_tooling'
  | 'assembly';

export type RequestStatus =
  | 'new'
  | 'receiving_offers'
  | 'under_review'
  | 'negotiation'
  | 'agreed'
  | 'in_production'
  | 'completed'
  | 'cancelled'
  | 'استقبال العروض'
  | 'قيد التفاوض'
  | 'تم التعاقد'
  | 'قيد التنفيذ'
  | 'مكتمل';

export type ManufacturingRequestStatus = RequestStatus;

export type MoldOwnershipType =
  | 'customer_owned'
  | 'factory_owned'
  | 'mold_manufacturing_required'
  | 'mold_operation_only';

export type MachineAvailabilityStatus =
  | 'available'
  | 'partially_available'
  | 'fully_booked'
  | 'temporarily_unavailable';

export interface UserProfile {
  id: string;
  accountType: AccountType;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  email?: string;
  phone: string;
  country: string;
  city: string;
  industrialArea?: string;
  yearsExperience: number;
  points: number;
  rating: number;
  reviewsCount: number;
  bioAr: string;
  bioEn: string;
  specializations: string[];
  machineTypes: string[];
  materialsWorkedWith: string[];
  skills: string[];
  certificates?: string[];
  previousFactories?: string[];
  availableCapacityPercent?: number;
  badges: string[];
  avatarUrl?: string;
  avatar?: string;
}

export interface ProcessCategoryInfo {
  id: ManufacturingProcessId;
  nameAr: string;
  nameEn: string;
  shortDescAr: string;
  shortDescEn: string;
  examplesAr: string[];
  examplesEn: string[];
  image: string;
  activeFactoriesCount: number;
  openRequestsCount: number;
}

export interface ManufacturingOffer {
  id: string;
  requestId: string;
  factoryId: string;
  factoryNameAr: string;
  factoryNameEn: string;
  factoryCity: string;
  unitPriceEgp: number;
  pricingBasisAr: string;
  setupCostEgp: number;
  moq: number;
  leadTimeDays: number;
  availableCapacityNote: string;
  materialSourcingAr: string;
  toolingResponsibilityAr: string;
  sampleAvailable: boolean;
  deliveryTermsAr: string;
  expiresAt: string;
  notesAr: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  createdAt: string;
}

export interface ManufacturingRequest {
  id: string;
  referenceCode: string;
  requestType: 'product_manufacturing' | 'mold_operation';
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  processId: ManufacturingProcessId;
  descriptionAr: string;
  purposeAr: string;
  material: string;
  dimensions: string;
  unitWeightGrams: number;
  colorAr: string;
  qualityRequirementsAr: string;
  packagingRequirementsAr: string;
  quantity: number;
  productionFrequency: 'one_time' | 'recurring';
  monthlyQuantity?: number;
  startDate: string;
  deliveryDate: string;
  moldOwnership: MoldOwnershipType;
  needMoldManufacturing: boolean;
  needMaterialSourcing: boolean;
  moldCavities?: number;
  moldWeightKg?: number;
  requiredTonnage?: number;
  country: string;
  city: string;
  deliveryLocation: string;
  contactName: string;
  contactPhone: string;
  preferredContactMethod: 'phone' | 'whatsapp' | 'platform';
  notesAr?: string;
  status: RequestStatus;
  createdAt: string;
  publisherName: string;
  image: string;
  unit?: string;
  attachments?: string[];
  offers: ManufacturingOffer[];
}

export interface AvailableMachineListing {
  id: string;
  factoryId: string;
  factoryNameAr: string;
  processId: ManufacturingProcessId;
  machineTypeAr: string;
  brand: string;
  model: string;
  tonnageOrCapacity: string;
  availableHoursPerDay: number;
  shiftsAvailable: number;
  currentUtilizationPercent: number;
  availableCapacityDescription: string;
  materialsSupported: string[];
  suitableProductsAr: string[];
  city: string;
  industrialArea: string;
  availableFromDate: string;
  status: MachineAvailabilityStatus;
  contactPhone: string;
  image: string;
}

export interface FactoryServiceProvider {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;
  city: string;
  industrialArea: string;
  descriptionAr: string;
  descriptionEn: string;
  processes: ManufacturingProcessId[];
  machinesSummary: string[];
  tonnageRange: string;
  availableCapacityPercent: number;
  materialsSupported: string[];
  productsManufacturedAr: string[];
  servicesOfferedAr: string[];
  responseTimeAr: string;
  rating: number;
  reviewsCount: number;
  verifiedDemo: boolean;
  contactPhone: string;
  website?: string;
  coverImage: string;
  reviews: {
    id: string;
    author: string;
    role: string;
    rating: number;
    commentAr: string;
    date: string;
  }[];
}

export interface FaultSolution {
  id: string;
  faultId: string;
  authorName: string;
  authorRoleAr: string;
  authorAccountType?: AccountType;
  contentAr: string;
  content?: string;
  rootCauseAr?: string;
  stepsAr?: string[];
  upvotes: number;
  helpfulVotes?: number;
  isBestSolution: boolean;
  isAccepted?: boolean;
  createdAt: string;
}

export interface IndustrialFault {
  id: string;
  titleAr: string;
  titleEn: string;
  machineTypeAr: string;
  machineType?: string;
  machineBrand: string;
  machineModel: string;
  specializationAr: string;
  descriptionAr: string;
  symptomsAr: string[];
  materialUsed: string;
  polymerMaterial?: string;
  urgency: 'urgent' | 'medium' | 'low';
  status: 'open' | 'solved';
  publisherId?: string;
  publisherName: string;
  publisherRoleAr: string;
  publisherAvatar?: string;
  city: string;
  createdAt: string;
  image: string;
  images?: string[];
  savedByCurrentUser?: boolean;
  likesCount?: number;
  likedByCurrentUser?: boolean;
  solutions: FaultSolution[];
}

export interface IndustrialJob {
  id: string;
  titleAr: string;
  titleEn: string;
  factoryNameAr: string;
  companyName?: string;
  city: string;
  industrialArea: string;
  jobTypeAr: 'دوام كامل' | 'ورديات' | 'عقد استشاري';
  specializationAr: string;
  machineTypeAr: string;
  experienceRequiredAr: string;
  salaryRangeAr: string;
  descriptionAr: string;
  responsibilitiesAr: string[];
  requirementsAr: string[];
  skillsRequired: string[];
  deadline: string;
  createdAt: string;
  applicantsCount: number;
  appliedByCurrentUser?: boolean;
}

export interface MarketListing {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryId: 'injection_machines' | 'blow_machines' | 'extrusion_lines' | 'molds' | 'raw_materials' | 'spare_parts' | 'auxiliary' | 'auxiliaries' | 'recycling_machines' | 'film_lines';
  brand: string;
  model: string;
  conditionAr: 'جديد' | 'ممتازة' | 'جيدة' | 'تحتاج صيانة' | string;
  price: number;
  currency: 'EGP' | 'SAR' | 'AED' | 'USD';
  city: string;
  year: number;
  specsAr: Record<string, string>;
  descriptionAr: string;
  sellerId?: string;
  sellerNameAr: string;
  sellerTypeAr: string;
  sellerPhone: string;
  sellerAvatar?: string;
  featured: boolean;
  image: string;
  images?: string[];
  likesCount?: number;
  createdAt: string;
}

export interface ExhibitionBooth {
  id: string;
  companyNameAr: string;
  companyNameEn: string;
  boothType: 'factory' | 'supplier';
  hallNameAr: string;
  boothNumber: string;
  city: string;
  country: string;
  taglineAr: string;
  descriptionAr: string;
  categoriesAr: string[];
  processesOrMaterials: string[];
  machinesOrProducts: string[];
  geographicCoverage: string[];
  rating: number;
  reviewsCount: number;
  contactPhone: string;
  bannerImage: string;
  featuredProducts?: {
    nameAr: string;
    specAr: string;
    image: string;
  }[];
  productsShowcase: {
    nameAr: string;
    specAr: string;
    image: string;
  }[];
}

export interface NewsArticle {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryId: 'market' | 'raw_materials' | 'technology' | 'machinery' | 'maintenance' | 'recycling' | 'regulations' | 'reports';
  summaryAr: string;
  contentAr: string[];
  authorAr: string;
  readTimeMinutes: number;
  publishedDate: string;
  image: string;
  savedByCurrentUser?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'offer' | 'status' | 'job' | 'fault_solution' | 'review';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  targetLink: string;
  createdAt: string;
  read: boolean;
}
