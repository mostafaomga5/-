import { AccountType } from '../types/plastico';

export interface RoleExtendedMetadata {
  // Factory Owner ('factory')
  factoryActivityType?: string;
  machinesCount?: string;
  productionCapacity?: string;
  productsManufactured?: string;

  // Technician ('technician')
  desiredOrCurrentJob?: string;

  // Engineer ('engineer')
  industrialSectors?: string;
  softwareAndSystems?: string;

  // Supplier ('supplier')
  supplierProducts?: string;
  supplierBrands?: string;
  supplyScope?: string;
  countriesServed?: string;

  // Machinery Trader ('trader')
  equipmentTypes?: string;
  conditionOffered?: string; // 'جديد ومستعمل' | 'جديد فقط' | 'مستعمل فقط'
  traderBrands?: string;
  buySellServices?: string;
  sparePartsAndMaintenance?: string;

  // Raw notes fallback
  notes?: string;
}

export const SUPPLIER_ALLOWED_SKILLS: string[] = [
  'خامات PP',
  'خامات PE',
  'خامات PET',
  'خامات PVC',
  'خامات ABS',
  'خامات هندسية',
  'ماسترباتش ألوان',
  'ماسترباتش أبيض وأسود',
  'إضافات ومحسنات الخامات',
  'خامات معاد تدويرها',
  'خامات بكر ومعاد تدويرها',
  'توريد الخامات محليًا ودوليًا',
  'توفير عينات الخامات',
  'توفير الداتا شيت والشهادات الفنية',
  'القدرة على التوريد بكميات كبيرة أو صغيرة',
];

export const FORBIDDEN_SUPPLIER_MACHINE_SKILLS: string[] = [
  'تشغيل ماكينات الحقن',
  'تشغيل ماكينات النفخ',
  'تشغيل خطوط السحب',
  'ماكينات النفخ',
  'خطوط السحب والفيلم',
  'صيانة القوالب',
  'صيانة الاسطمبات والقوالب',
  'أنظمة PLC',
  'الهيدروليك والـ PLC',
];

export const ROLE_SKILLS_OPTIONS: Record<AccountType, string[]> = {
  factory: [
    'خطوط حقن البلاستيك (Injection)',
    'خطوط نفخ العبوات (Blow Molding)',
    'خطوط سحب المواسير والبروفيلات (Extrusion)',
    'خطوط سحب الفيلم والأكياس (Blown Film)',
    'التشكيل الحراري (Thermoforming)',
    'تصنيع وصيانة الاسطمبات والقوالب',
    'التصنيع للغير (Contract Manufacturing - OEM)',
    'إعادة تدوير وتخريز البلاستيك',
    'الطباعة والتغليف الصناعي',
    'مراقبة الجودة ومعامل الفحص (ISO 9001)',
  ],
  technician: [
    'تشغيل ماكينات الحقن',
    'تشغيل ماكينات النفخ',
    'تشغيل خطوط السحب والفيلم',
    'ضبط قوالب الحقن والنفخ (Mold Setup)',
    'صيانة القوالب والاسطمبات',
    'صيانة الهيدروليك والنيوماتيك',
    'صيانة الكنترول وأنظمة PLC',
    'تغيير الألوان والخامات على الماكينة',
    'تشغيل المقصات والكسارات والخلاطات',
    'فحص جودة المنتج على خط الإنتاج',
  ],
  engineer: [
    'هندسة تشغيل وضبط عمليات الحقن (Process Engineering)',
    'تصميم القوالب والاسطمبات (Moldflow / SolidWorks)',
    'هندسة البوليمرات وخلطات الماسترباتش',
    'توكيد ومراقبة الجودة (QA / QC & MFI Testing)',
    'إدارة الإنتاج وتخطيط التشغيل (Lean / Six Sigma)',
    'أتمتة خطوط الإنتاج وأنظمة PLC & SCADA',
    'إدارة الصيانة الوقائية والتنبؤية للمصانع',
    'تطوير منتجات التغليف والعبوات الدوائية والغذائية',
  ],
  supplier: SUPPLIER_ALLOWED_SKILLS,
  trader: [
    'ماكينات حقن بلاستيك جديدة ومستعملة',
    'ماكينات نفخ عبوات وخطوط سحب',
    'خطوط فيلم ومقصات أكياس',
    'خطوط كسارات وغسيل وتخريز (Recycling)',
    'معدات مساعدة (شيلرات، مجففات، سخانات، لوادر)',
    'توريد قطع غيار الماكينات (فتيل، براميل، هيدروليك)',
    'فحص وتجديد الماكينات المستعملة قبل التسليم',
    'شحن وتخليص جمركي وتركيب خطوط الإنتاج',
  ],
  visitor: [],
};

export function sanitizeRoleSkills(role: AccountType, skills: string[]): string[] {
  if (role === 'supplier') {
    const cleaned = skills.filter(
      (sk) =>
        !FORBIDDEN_SUPPLIER_MACHINE_SKILLS.some((bad) =>
          sk.toLowerCase().includes(bad.toLowerCase())
        ) &&
        !sk.includes('تشغيل ماكينات') &&
        !sk.includes('صيانة القوالب') &&
        !sk.includes('PLC')
    );
    return cleaned.length > 0
      ? cleaned
      : ['خامات PP', 'خامات PE', 'ماسترباتش ألوان', 'توفير الداتا شيت والشهادات الفنية'];
  }
  return skills;
}

export function parseRoleExtendedMetadata(rawWorkPreferences?: string | null): RoleExtendedMetadata {
  if (!rawWorkPreferences) return {};
  const trimmed = rawWorkPreferences.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        return parsed as RoleExtendedMetadata;
      }
    } catch {
      return { notes: trimmed };
    }
  }
  return { notes: trimmed };
}

export function serializeRoleExtendedMetadata(meta: RoleExtendedMetadata): string {
  return JSON.stringify(meta);
}

export function getRoleSectionTitles(role: AccountType): {
  roleTitleAr: string;
  roleTitleEn: string;
  skillsLabelAr: string;
  skillsLabelEn: string;
  machinesLabelAr: string;
  machinesLabelEn: string;
  specialtyLabelAr: string;
  specialtyLabelEn: string;
  companyLabelAr: string;
  companyLabelEn: string;
  bioLabelAr: string;
  bioLabelEn: string;
} {
  switch (role) {
    case 'factory':
      return {
        roleTitleAr: 'ملف صاحب المصنع والمنشأة الصناعية',
        roleTitleEn: 'Factory Owner & Industrial Plant Profile',
        skillsLabelAr: 'التخصصات وخطوط الإنتاج بالمصنع',
        skillsLabelEn: 'Factory Specializations & Production Lines',
        machinesLabelAr: 'الماكينات وخطوط الإنتاج المتوفرة',
        machinesLabelEn: 'Available Machines & Production Lines',
        specialtyLabelAr: 'نوع النشاط الصناعي للمصنع',
        specialtyLabelEn: 'Factory Industrial Activity Type',
        companyLabelAr: 'اسم المصنع الرسمي',
        companyLabelEn: 'Official Factory Name',
        bioLabelAr: 'نبذة عن المصنع والقدرات التصنيعية',
        bioLabelEn: 'About the Factory & Manufacturing Capabilities',
      };
    case 'technician':
      return {
        roleTitleAr: 'الملف المهني للفني والعامل الصناعي',
        roleTitleEn: 'Technician & Operator Professional Profile',
        skillsLabelAr: 'المهارات الفنية والتشغيلية',
        skillsLabelEn: 'Technical & Operational Skills',
        machinesLabelAr: 'الماكينات التي يمتلك خبرة عملية بها',
        machinesLabelEn: 'Machines Experienced With',
        specialtyLabelAr: 'التخصص الصناعي الدقيق',
        specialtyLabelEn: 'Industrial Specialty',
        companyLabelAr: 'جهة العمل الحالية أو السابقة',
        companyLabelEn: 'Current or Previous Employer',
        bioLabelAr: 'نبذة عن الخبرة العملية والمهنية',
        bioLabelEn: 'Practical Experience Summary',
      };
    case 'engineer':
      return {
        roleTitleAr: 'الملف المهني للمهندس الصناعي',
        roleTitleEn: 'Industrial Engineer Professional Profile',
        skillsLabelAr: 'المجالات الصناعية والتخصصات الهندسية',
        skillsLabelEn: 'Industrial Sectors & Engineering Specialties',
        machinesLabelAr: 'البرامج والأنظمة الهندسية والماكينات التي يجيدها',
        machinesLabelEn: 'Mastered Engineering Software, Systems & Machines',
        specialtyLabelAr: 'التخصص الهندسي',
        specialtyLabelEn: 'Engineering Specialty',
        companyLabelAr: 'المصنع / الشركة الحالية',
        companyLabelEn: 'Current Factory / Company',
        bioLabelAr: 'نبذة عن الخبرات والمشروعات الهندسية السابقة',
        bioLabelEn: 'Engineering Experience & Past Projects',
      };
    case 'supplier':
      return {
        roleTitleAr: 'ملف مورد الخامات والماسترباتش المعتمد',
        roleTitleEn: 'Verified Raw Materials & Masterbatch Supplier Profile',
        skillsLabelAr: 'الخامات، الماسترباتش، وقدرات التوريد المتاحة',
        skillsLabelEn: 'Available Polymers, Masterbatch & Supply Capabilities',
        machinesLabelAr: 'العلامات التجارية والدرجات (Grades) المتوفرة',
        machinesLabelEn: 'Brands & Polymer Grades Supplied',
        specialtyLabelAr: 'تخصص التوريد الرئيسي (بوليمرات / ماسترباتش / إضافات)',
        specialtyLabelEn: 'Primary Supply Specialty',
        companyLabelAr: 'اسم شركة التوريد أو الوكالة التجارية',
        companyLabelEn: 'Supplier Company or Agency Name',
        bioLabelAr: 'نبذة عن شركة التوريد، المخازن، وشروط التوريد',
        bioLabelEn: 'Supplier Bio, Warehouses & Supply Terms',
      };
    case 'trader':
      return {
        roleTitleAr: 'ملف تاجر الماكينات والمعدات الصناعية',
        roleTitleEn: 'Machinery & Industrial Equipment Trader Profile',
        skillsLabelAr: 'أنواع الماكينات والمعدات وخدمات البيع والشراء',
        skillsLabelEn: 'Machinery Types & Buy/Sell Services',
        machinesLabelAr: 'العلامات التجارية والموديلات المتوفرة بالمعرض',
        machinesLabelEn: 'Available Machinery Brands & Models',
        specialtyLabelAr: 'تخصص تجارة المعدات (جديد / مستعمل / خطوط إنتاج)',
        specialtyLabelEn: 'Equipment Trading Specialty',
        companyLabelAr: 'اسم المعرض أو شركة تجارة الماكينات',
        companyLabelEn: 'Showroom or Trading Company Name',
        bioLabelAr: 'نبذة عن المعرض وخدمات الفحص وقطع الغيار والصيانة',
        bioLabelEn: 'Showroom Overview, Inspection, Spare Parts & Maintenance',
      };
    default:
      return {
        roleTitleAr: 'الملف الصناعي',
        roleTitleEn: 'Industrial Profile',
        skillsLabelAr: 'المهارات والتخصصات',
        skillsLabelEn: 'Skills & Specialties',
        machinesLabelAr: 'الماكينات والأنظمة',
        machinesLabelEn: 'Machines & Systems',
        specialtyLabelAr: 'التخصص',
        specialtyLabelEn: 'Specialty',
        companyLabelAr: 'اسم الشركة / المصنع',
        companyLabelEn: 'Company / Factory Name',
        bioLabelAr: 'نبذة تعريفية',
        bioLabelEn: 'Bio',
      };
  }
}
