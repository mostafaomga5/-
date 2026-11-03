export interface SupplierDirectoryItem {
  id: string;
  companyNameAr: string;
  companyNameEn: string;
  logo: string;
  country: string;
  city: string;
  supplierType:
    | 'raw_materials'
    | 'additives_masterbatch'
    | 'injection_blow_machines'
    | 'auxiliary_equipment'
    | 'heaters'
    | 'chillers_compressors'
    | 'dryers_hoppers'
    | 'molds_tooling'
    | 'spare_parts'
    | 'industrial_services';
  supplierTypeLabelAr: string;
  supplierTypeLabelEn: string;
  categoriesAr: string[];
  productsServicesAr: string[];
  brandsSupplied: string[];
  contactPhone: string;
  contactEmail: string;
  descriptionAr: string;
  descriptionEn: string;
  isVerified: boolean;
  isSample: boolean;
  categoryLabelAr?: string;
  image?: string;
}

export interface AcademyLesson {
  id: string;
  titleAr: string;
  titleEn: string;
  durationMinutes: number;
  summaryAr: string;
  keyPointsAr: string[];
}

export interface AcademyQuizQuestion {
  id: string;
  questionAr: string;
  optionsAr: string[];
  correctIndex: number;
}

export interface AcademyCourseItem {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryId:
    | 'injection_operation'
    | 'defect_diagnosis'
    | 'molds_maintenance'
    | 'polymer_materials'
    | 'industrial_safety'
    | 'preventive_maintenance'
    | 'quality_control'
    | 'extrusion_blow';
  targetAudienceAr: string;
  levelAr: string;
  hours: number;
  instructorAr: string;
  instructorTitleAr: string;
  image: string;
  introAr: string;
  outcomesAr: string[];
  completionRequirementsAr: string;
  lessons: AcademyLesson[];
  quiz: AcademyQuizQuestion[];
}

export const SUPPLIER_CATEGORY_FILTERS = [
  { id: 'all', labelAr: 'جميع الموردين', labelEn: 'All Suppliers' },
  { id: 'raw_materials', labelAr: 'خامات البوليمر الأساسية', labelEn: 'Polymer Raw Materials' },
  { id: 'additives_masterbatch', labelAr: 'الإضافات والماسترباتش', labelEn: 'Additives & Masterbatch' },
  { id: 'injection_blow_machines', labelAr: 'ماكينات الحقن والنفخ', labelEn: 'Injection & Blow Machinery' },
  { id: 'auxiliary_equipment', labelAr: 'المعدات المساعدة', labelEn: 'Auxiliary Equipment' },
  { id: 'heaters', labelAr: 'السخانات والتحكم الحراري', labelEn: 'Heaters & Temp Control' },
  { id: 'chillers_compressors', labelAr: 'الشيلرات والكمبروسرات', labelEn: 'Chillers & Compressors' },
  { id: 'dryers_hoppers', labelAr: 'المجففات والهوبرات والشفاطات', labelEn: 'Dryers, Hoppers & Loaders' },
  { id: 'molds_tooling', labelAr: 'الاسطمبات والقوالب', labelEn: 'Molds & Tooling' },
  { id: 'spare_parts', labelAr: 'قطع الغيار الصناعية', labelEn: 'Spare Parts' },
  { id: 'industrial_services', labelAr: 'الخدمات الصناعية والصيانة', labelEn: 'Industrial Services' },
] as const;

export const MARKETPLACE_15_CATEGORIES = [
  { id: 'all', labelAr: 'جميع الأقسام', labelEn: 'All Categories' },
  { id: 'raw_materials', labelAr: 'الخامات الأساسية', labelEn: 'Raw Materials' },
  { id: 'additives_masterbatch', labelAr: 'الإضافات والماسترباتش', labelEn: 'Additives & Masterbatch' },
  { id: 'injection_machines', labelAr: 'ماكينات الحقن', labelEn: 'Injection Machines' },
  { id: 'blow_machines', labelAr: 'ماكينات النفخ', labelEn: 'Blow Molding Machines' },
  { id: 'extrusion_lines', labelAr: 'خطوط السحب والبثق', labelEn: 'Extrusion Lines' },
  { id: 'film_lines', labelAr: 'خطوط الفيلم', labelEn: 'Film Extrusion Lines' },
  { id: 'molds', labelAr: 'الاسطمبات والقوالب', labelEn: 'Molds & Tooling' },
  { id: 'auxiliary_equipment', labelAr: 'المعدات المساعدة', labelEn: 'Auxiliary Equipment' },
  { id: 'heaters', labelAr: 'السخانات', labelEn: 'Industrial Heaters' },
  { id: 'chillers', labelAr: 'الشيلرات', labelEn: 'Chillers' },
  { id: 'compressors', labelAr: 'الكمبروسرات', labelEn: 'Compressors' },
  { id: 'dryers_hoppers', labelAr: 'المجففات والهوبرات', labelEn: 'Dryers & Hoppers' },
  { id: 'spare_parts', labelAr: 'قطع الغيار', labelEn: 'Spare Parts' },
  { id: 'manufacturing_services', labelAr: 'خدمات التصنيع', labelEn: 'Manufacturing Services' },
  { id: 'used_equipment', labelAr: 'المعدات المستعملة', labelEn: 'Used Equipment' },
] as const;

export const INITIAL_SUPPLIERS_DIRECTORY: SupplierDirectoryItem[] = [
  {
    id: 'sup-1',
    companyNameAr: 'الشركة العربية لتوريد البوليمرات والخامات (PolymerArabia)',
    companyNameEn: 'PolymerArabia Raw Materials Supply',
    logo: '/assets/aistudio/Meta_AI_886293190_1678830613934074_2076821796018713871_n_20261101_133112.webp_a8042563.jpg',
    country: 'مصر',
    city: 'العاشر من رمضان',
    supplierType: 'raw_materials',
    supplierTypeLabelAr: 'خامات البوليمر الأساسية',
    supplierTypeLabelEn: 'Polymer Raw Materials',
    categoriesAr: ['PP الحقن والسحب', 'HDPE فيلم ونفخ', 'LDPE تغليف', 'PET عبوات'],
    productsServicesAr: [
      'بولي بروبيلين حقن (PP Raffia & Injection MFI 12-35)',
      'بولي إيثيلين عالي الكثافة (HDPE Blow & Film)',
      'حبيبات PET بكر مخصصة لتصنيع البريفورم',
    ],
    brandsSupplied: ['SABIC', 'Borouge', 'SIDPEC', 'ETHYDCO'],
    contactPhone: '+20 100 412 8890',
    contactEmail: 'sales@polymerarabia.example',
    descriptionAr:
      'توريد خامات البوليمر البكر مع شهادات التحليل المعملي (COA) والتسليم المباشر للمصانع.',
    descriptionEn:
      'Direct supply of virgin polymer resins with laboratory COA certificates.',
    isVerified: true,
    isSample: true,
  },
  {
    id: 'sup-2',
    companyNameAr: 'المركز الهندسي للسخانات والتحكم الحراري (ThermoTech)',
    companyNameEn: 'ThermoTech Industrial Heaters & Control',
    logo: '/assets/aistudio/Meta_AI_862883601_1397348135504235_7284036699704388464_n_20261101_133929.webp_f59af714.jpg',
    country: 'مصر',
    city: 'السادس من أكتوبر',
    supplierType: 'heaters',
    supplierTypeLabelAr: 'السخانات والتحكم الحراري',
    supplierTypeLabelEn: 'Heaters & Temperature Control',
    categoriesAr: ['سخانات سيراميك', 'سخانات فوهة نحاسية', 'سخانات المانيفولد', 'حساسات حرارة K/J'],
    productsServicesAr: [
      'سخانات قمصان سيراميك موفرة للطاقة لماكينات الحقن والسحب',
      'سخانات فوهة (Nozzle Band Heaters) نحاس واستانلس',
      'سخانات الهوت رنر (Hot Runner Coil Heaters) وحساسات الثرموكبل',
    ],
    brandsSupplied: ['ThermoTech', 'Watlow Compatible', 'Omron PID'],
    contactPhone: '+20 102 775 3310',
    contactEmail: 'info@thermotech-eg.example',
    descriptionAr:
      'تصنيع وتوريد السخانات الصناعية القياسية والمفصلة حسب القطر والقدرة بالواط لماكينات البلاستيك.',
    descriptionEn:
      'Manufacturing and supplying custom ceramic, mica, and hot-runner heaters.',
    isVerified: true,
    isSample: true,
  },
  {
    id: 'sup-3',
    companyNameAr: 'شركة النيل للماستر باتش والإضافات التخصصية',
    companyNameEn: 'Nile Masterbatch & Specialty Additives',
    logo: '/assets/aistudio/Meta_AI_884622543_1843836499970692_4261278643668307607_n_20261101_134217.webp_4943d8ac.jpg',
    country: 'السعودية',
    city: 'الرياض',
    supplierType: 'additives_masterbatch',
    supplierTypeLabelAr: 'الإضافات والماسترباتش',
    supplierTypeLabelEn: 'Additives & Masterbatch',
    categoriesAr: ['ماسترباتش أبيض TIO2', 'ماسترباتش أسود وألوان', 'مضادات الأشعة UV', 'مفاتيح انزلاق Slip'],
    productsServicesAr: [
      'ماسترباتش أبيض بتركيز ثاني أكسيد التيتانيوم حتى 70%',
      'إضافات مقاومة للأشعة فوق البنفسجية (UV Stabilizers) للفيلم الزراعي',
      'كربونات كالسيوم معالجة (CaCO3 Filler Masterbatch)',
    ],
    brandsSupplied: ['NileColor', 'Clariant Partner', 'Cabot Grade'],
    contactPhone: '+966 50 812 4400',
    contactEmail: 'orders@nilemasterbatch.example',
    descriptionAr:
      'حلول تلوين وإضافات بوليمر مطابقة لمواصفات الصناعات الغذائية والتغليف الدوائي.',
    descriptionEn: 'Food-contact compliant masterbatch and polymer functional additives.',
    isVerified: true,
    isSample: true,
  },
  {
    id: 'sup-4',
    companyNameAr: 'تكنو كول لأنظمة الشيلرات والكمبروسرات والمجففات',
    companyNameEn: 'TechnoCool Chillers, Compressors & Dryers',
    logo: '/assets/aistudio/Meta_AI_883256061_1138390202214240_3243738194416996884_n_20261101_133931.webp_fa0ae649.jpg',
    country: 'مصر',
    city: 'برج العرب',
    supplierType: 'chillers_compressors',
    supplierTypeLabelAr: 'الشيلرات والكمبروسرات',
    supplierTypeLabelEn: 'Chillers & Compressors',
    categoriesAr: ['شيلرات تبريد القوالب', 'كمبروسرات حلزونية', 'مجففات وهوبرات', 'شفاطات خامة'],
    productsServicesAr: [
      'شيلرات تبريد مياه صناعية بقدرات من 5 طن إلى 60 طن تبريد',
      'كمبروسرات هواء حلزونية (Screw Air Compressors) لماكينات النفخ',
      'مجففات خامة استانلس وهوبرات أوتوماتيكية (Auto-Loaders)',
    ],
    brandsSupplied: ['Shini', 'Topstar', 'Atlas Copco Service'],
    contactPhone: '+20 111 980 2210',
    contactEmail: 'support@technocool.example',
    descriptionAr:
      'تجهيز المصانع بالمعدات المساعدة المتكاملة وشبكات التبريد والهواء المضغوط مع الصيانة والضمان.',
    descriptionEn:
      'Complete factory auxiliary systems: water chillers, air compressors, and hopper dryers.',
    isVerified: false,
    isSample: true,
  },
  {
    id: 'sup-5',
    companyNameAr: 'المجموعة الهندسية لتصنيع الاسطمبات والقوالب الدقيقة',
    companyNameEn: 'Precision Molds & Tooling Engineering Group',
    logo: '/assets/aistudio/Meta_AI_884187226_998779499215523_8575493471051958551_n_20261101_133206_05671884.webp',
    country: 'مصر',
    city: 'العبور',
    supplierType: 'molds_tooling',
    supplierTypeLabelAr: 'الاسطمبات والقوالب',
    supplierTypeLabelEn: 'Molds & Tooling',
    categoriesAr: ['قوالب حقن متعددة الفجوات', 'قوالب بريفورم وأغطية', 'قوالب نفخ عبوات', 'صيانة وتعديل قوالب'],
    productsServicesAr: [
      'تصميم وتصنيع اسطمبات الحقن بصلب معالج P20 و H13 و S136',
      'أنظمة الهوت رنر (Hot Runner Molds) لتقليل الهالك وزمن الدورة',
      'صيانة وتلميع القوالب بالليزر والـ EDM',
    ],
    brandsSupplied: ['Böhler Steel', 'Yudo Hot Runner', 'Hasco Standards'],
    contactPhone: '+20 106 334 5511',
    contactEmail: 'tooling@precisionmolds.example',
    descriptionAr:
      'خبرة هندسية في تصميم وتصنيع قوالب الحقن والنفخ واختبار العينات قبل التسليم.',
    descriptionEn:
      'Engineering design, CNC machining, and testing of multi-cavity injection and blow molds.',
    isVerified: true,
    isSample: true,
  },
  {
    id: 'sup-6',
    companyNameAr: 'شركة الرواد لتوريد ماكينات الحقن والنفخ وقطع الغيار',
    companyNameEn: 'Al-Rowad Injection & Blow Machinery Supply',
    logo: '/assets/aistudio/Meta_AI_876711241_1165794242468368_1352144977164666078_n_20261101_133109.webp_7686cffc.jpg',
    country: 'الإمارات',
    city: 'دبي',
    supplierType: 'injection_blow_machines',
    supplierTypeLabelAr: 'ماكينات الحقن والنفخ',
    supplierTypeLabelEn: 'Injection & Blow Machinery',
    categoriesAr: ['ماكينات حقن سيرفو', 'ماكينات نفخ PET', 'فتائل وبراميل بريميتال', 'كروت PLC وهيدروليك'],
    productsServicesAr: [
      'ماكينات حقن سيرفو موفرة للطاقة من 90 طن حتى 1200 طن',
      'فتائل وبراميل (Screws & Barrels) مزدوجة المعدن Bimetallic',
      'طلمبات وصمامات هيدروليك Rexroth و Vickers وقطع غيار إلكترونية',
    ],
    brandsSupplied: ['Haitian', 'Chen Hsong', 'Techmation'],
    contactPhone: '+971 55 390 1122',
    contactEmail: 'machinery@alrowad.example',
    descriptionAr:
      'توريد خطوط الإنتاج الجديدة وقطع الغيار الأصلية مع دعم التركيب والتشغيل التجريبي.',
    descriptionEn:
      'Supply of servo injection machines, blow molding lines, and genuine spare parts.',
    isVerified: true,
    isSample: true,
  },
];

export const INITIAL_ACADEMY_COURSES: AcademyCourseItem[] = [
  {
    id: 'course-injection-mastery',
    titleAr: 'احتراف تشغيل وضبط ماكينات حقن البلاستيك (Injection Molding)',
    titleEn: 'Mastering Plastic Injection Molding Machine Operation & Setup',
    categoryAr: 'تشغيل ماكينات الحقن',
    categoryId: 'injection_operation',
    targetAudienceAr: 'الفنيون، مشغلو الماكينات، ومهندسو الإنتاج الجدد',
    levelAr: 'تأسيسي إلى متقدم',
    hours: 12,
    instructorAr: 'م. طارق عبد السلام',
    instructorTitleAr: 'استشاري تشغيل خطوط الحقن والقوالب',
    image: '/assets/aistudio/Meta_AI_880351882_1852609526057940_742775317561305654_n_20261101_134136.webp_87b23082.jpg',
    introAr:
      'دورة عملية متكاملة تشرح دورة الحقن من استلام الخامة وتجفيفها، مروراً بضبط درجات حرارة البرميل، ضغوط وسرعات الحقن، ضغط التثبيت (Holding Pressure)، وزمن التبريد حتى استخراج المنتج بأعلى جودة.',
    outcomesAr: [
      'فهم أجزاء ماكينة الحقن (وحدة الحقن، وحدة الغلق، والنظام الهيدروليكي/السيرفو)',
      'ضبط منحنى درجات حرارة البرميل والفوهة حسب نوع البوليمر (PP, HDPE, ABS, PC)',
      'حساب وزن الحقنة (Shot Weight) وضبط نقطة التحول V/P Switchover بدقة',
      'تقليل زمن الدورة (Cycle Time) دون التأثير على سلامة الأبعاد',
    ],
    completionRequirementsAr:
      'إتمام جميع الدروس الأربعة (100%) واجتياز التقييم الفني بنسبة 70% فأعلى لإصدار شهادة بلاستيكو الموثقة.',
    lessons: [
      {
        id: 'les-1',
        titleAr: 'الدرس الأول: مكونات ماكينة الحقن ومراحل الدورة الأساسية',
        titleEn: 'Lesson 1: Injection Machine Components & Core Cycle Stages',
        durationMinutes: 35,
        summaryAr:
          'يتناول هذا الدرس التشريح الكامل لماكينة الحقن: القادوس (Hopper)، البرميل والفتيل (Barrel & Screw)، السخانات، القالب، ووحدة الغلق (Toggle / Hydraulic Clamping).',
        keyPointsAr: [
          'المراحل الخمس للدورة: غلق القالب -> الحقن -> التثبيت (Holding) -> التغذية والتبريد -> فتح القالب والطرد.',
          'أهمية تجفيف الخامات الشرهة للرطوبة مثل PET و PA6 و PC قبل دخول البرميل.',
          'حماية القالب (Low-Pressure Mold Protection) لمنع كسر الفجوات.',
        ],
      },
      {
        id: 'les-2',
        titleAr: 'الدرس الثاني: ضبط الحرارة، سرعة الحقن، وضغط التثبيت',
        titleEn: 'Lesson 2: Temperature Profiles, Injection Speed & Holding Pressure',
        durationMinutes: 45,
        summaryAr:
          'كيفية بناء التدرج الحراري الصحيح من منطقة التغذية حتى الفوهة، وكيفية معايرة سرعة ملء القالب وضغط التعويض لمنع الانكماش.',
        keyPointsAr: [
          'تدرج الحرارة التصاعدي من الخلف للأمام لمنع تكسير السلاسل البوليمرية.',
          'تحديد نقطة التحول من سرعة الحقن إلى ضغط التثبيت عند امتلاء 95% من الفجوة.',
          'ضبط الضغط الخلفي (Back Pressure) لضمان تجانس المصهور والماسترباتش.',
        ],
      },
      {
        id: 'les-3',
        titleAr: 'الدرس الثالث: تشخيص عيوب الحقن الشائعة وعلاجها الفوري',
        titleEn: 'Lesson 3: Diagnosing & Fixing Common Injection Molding Defects',
        durationMinutes: 40,
        summaryAr:
          'جدول عملي لربط كل عيب ظاهري في المنتج بالسبب الجذري في بارامترات الماكينة أو القالب.',
        keyPointsAr: [
          'علاج نقص المنتج (Short Shot) عبر مراجعة الوسادة البلاستيكية (Cushion) وتنفيس الهواء.',
          'علاج الرايش (Flash) عبر خفض ضغط الحقن المفرط والتأكد من قوة غلق القالب.',
          'علاج علامات الغوص (Sink Marks) والخطوط الفضية (Silver Streaks).',
        ],
      },
      {
        id: 'les-4',
        titleAr: 'الدرس الرابع: الصيانة اليومية وقواعد السلامة المهنية',
        titleEn: 'Lesson 4: Daily Machine Care & Industrial Safety Standards',
        durationMinutes: 30,
        summaryAr:
          'قائمة الفحص اليومي (Checklist) لمستوى وحرارة الزيت الهيدروليكي، التشحيم المركزي، وتأمين الأبواب الواقية.',
        keyPointsAr: [
          'فحص حرارة زيت الهيدروليك (المدى المثالي 40°C - 50°C) ونظافة الفلاتر.',
          'تنظيف البرميل (Purging) عند تغيير الخامة أو اللون.',
          'اختبار أقفال الأمان الميكانيكية والكهربائية وحساسات الباب قبل بدء الوردية.',
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        questionAr: 'ما هو التوقيت المثالي للتحول من مرحلة الحقن إلى مرحلة ضغط التثبيت (V/P Switchover)؟',
        optionsAr: [
          'عند امتلاء حوالي 95% إلى 98% من فجوة القالب',
          'قبل بدء دخول المصهور للقالب',
          'بعد فتح القالب وخروج المنتج',
        ],
        correctIndex: 0,
      },
      {
        id: 'q2',
        questionAr: 'ما هو السبب الأكثر شيوعاً لظهور الخطوط الفضية (Silver Streaks) على سطح المنتج؟',
        optionsAr: [
          'وجود رطوبة في الخامة أو تكسير حراري للمصهور',
          'انخفاض درجة حرارة مياه الشيلر فقط',
          'زيادة زمن فتح القالب',
        ],
        correctIndex: 0,
      },
      {
        id: 'q3',
        questionAr: 'ما هي وظيفة حماية القالب بالضغط المنخفض (Low-Pressure Mold Protection)؟',
        optionsAr: [
          'إيقاف غلق القالب فوراً إذا وُجد جسم عالق بين نصفي الاسطمبة لحمايتها من الكسر',
          'زيادة سرعة الحقن لأقصى درجة',
          'رفع حرارة السخانات أوتوماتيكياً',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-molds-maintenance',
    titleAr: 'هندسة صيانة الاسطمبات والقوالب وأنظمة التبريد والهوت رنر',
    titleEn: 'Mold Maintenance, Cooling Channels & Hot Runner Systems',
    categoryAr: 'الاسطمبات والقوالب',
    categoryId: 'molds_maintenance',
    targetAudienceAr: 'مهندسو الصيانة، فنيو الاسطمبات، ومشرفو الإنتاج',
    levelAr: 'متقدم',
    hours: 10,
    instructorAr: 'م. محمود الشناوي',
    instructorTitleAr: 'خبير تصميم وصيانة اسطمبات الحقن والنفخ',
    image: '/assets/aistudio/Meta_AI_884672840_2293648131420566_4396917701512321876_n_20261101_134132.webp_a3fc4a82.jpg',
    introAr:
      'دليل تطبيقي لصيانة القوالب الوقائية، تنظيف مجاري التبريد من التكلسات، ضبط سخانات الهوت رنر، والحفاظ على دقة أسطح الفصل (Parting Line).',
    outcomesAr: [
      'تنظيف ومعالجة مسارات التبريد لرفع كفاءة التبادل الحراري',
      'فحص وضبط سخانات وحساسات الـ Hot Runner ومنع تسريب الخامة',
      'صيانة البنوز الدليلية (Guide Pins) وبنوز الطرد (Ejector Pins)',
    ],
    completionRequirementsAr:
      'إتمام جميع الدروس الثلاثة واجتياز الاختبار النهائي بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 'm-les-1',
        titleAr: 'الدرس الأول: تصميم مسارات التبريد وتأثيرها على زمن الدورة',
        titleEn: 'Lesson 1: Mold Cooling Circuit Design & Cycle Time Impact',
        durationMinutes: 40,
        summaryAr:
          'يمثل زمن التبريد أكثر من 60% من زمن دورة الحقن. نشرح هنا كيفية تحقيق التدفق المضطرب (Turbulent Flow) ومنع انسداد القنوات.',
        keyPointsAr: [
          'الفرق بين التدفق الصفائحي والمضطرب في قنوات تبريد القالب.',
          'إزالة الأملاح والتكلسات دورياً للحفاظ على ثبات أبعاد المنتج.',
        ],
      },
      {
        id: 'm-les-2',
        titleAr: 'الدرس الثاني: صيانة أنظمة الهوت رنر (Hot Runner) والسخانات',
        titleEn: 'Lesson 2: Hot Runner Manifold & Heater Diagnostics',
        durationMinutes: 45,
        summaryAr:
          'طرق فحص مقاومة السخانات، عزل الرطوبة (Soft Start)، ومنع تفحم البوليمر داخل البوابات الساخنة.',
        keyPointsAr: [
          'أهمية التسخين التدريجي (Soft Start) لطرد الرطوبة من عزل السخانات.',
          'قياس الأوم (Resistance) والعزل لكل منطقة حرارية قبل التركيب.',
        ],
      },
      {
        id: 'm-les-3',
        titleAr: 'الدرس الثالث: فتحات تهوية الغازات (Venting) وحماية خط الفصل',
        titleEn: 'Lesson 3: Mold Venting & Parting Line Preservation',
        durationMinutes: 35,
        summaryAr:
          'كيف يؤدي انسداد فتحات التهوية الدقيقة إلى احتراق طرف المنتج (Diesel Effect) ونقص الحقن.',
        keyPointsAr: [
          'أعماق فتحات التهوية القياسية حسب نوع الخامة (0.015 - 0.03 مم).',
          'تنظيف فتحات التهوية في كل وردية دون خدش سطح الصلب.',
        ],
      },
    ],
    quiz: [
      {
        id: 'mq1',
        questionAr: 'ماذا يحدث عند انسداد فتحات تهوية الهواء (Vents) داخل القالب؟',
        optionsAr: [
          'انحباس الهواء واحتراق طرف المنتج (Burn Marks / Diesel Effect) أو نقص الملء',
          'انخفاض استهلاك الكهرباء',
          'زيادة لمعان المنتج',
        ],
        correctIndex: 0,
      },
      {
        id: 'mq2',
        questionAr: 'لماذا نستخدم خاصية التسخين التدريجي (Soft Start) في سخانات الهوت رنر؟',
        optionsAr: [
          'لتبخير الرطوبة المحتبسة داخل عزل السخان وحمايته من الاحتراق',
          'لتبريد القالب بسرعة',
          'لتقليل وزن المنتج',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-polymers-science',
    titleAr: 'دليل خامات البوليمر، الإضافات، ومعامل الانصهار (MFI)',
    titleEn: 'Polymer Raw Materials, Masterbatch & Melt Flow Index Guide',
    categoryAr: 'خامات البوليمر والإضافات',
    categoryId: 'polymer_materials',
    targetAudienceAr: 'مهندسو الجودة، مسؤولو المشتريات، وفنيو الخلط والتشغيل',
    levelAr: 'متوسط',
    hours: 8,
    instructorAr: 'د. سارة المنياوي',
    instructorTitleAr: 'استشارية هندسة البوليمرات ومراقبة الجودة',
    image: '/assets/aistudio/Meta_AI_884622543_1843836499970692_4261278643668307607_n_20261101_134217.webp_4943d8ac.jpg',
    introAr:
      'تعرف على الفروق الجوهرية بين البوليمرات المتبلورة وغير المتبلورة (PP, HDPE, LDPE, LLDPE, PET, PVC, ABS, PC)، وكيفية قراءة شهادة التحليل ومعامل السيولة MFI.',
    outcomesAr: [
      'التمييز بين درجات الحقن والنفخ والفيلم والسحب عبر معامل الانصهار MFI',
      'تحديد نسب خلط الماسترباتش والخامة المعاد تدويرها دون الإخلال بالخواص الميكانيكية',
      'شروط التخزين والتجفيف القياسية لكل عائلة بوليمر',
    ],
    completionRequirementsAr:
      'إتمام جميع الدروس واجتياز التقييم بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 'p-les-1',
        titleAr: 'الدرس الأول: عائلات البوليمر ومعامل السيولة (MFI / MFR)',
        titleEn: 'Lesson 1: Polymer Families & Melt Flow Index (MFI)',
        durationMinutes: 40,
        summaryAr:
          'كيف تختار الدرجة الصحيحة: لماذا يحتاج الحقن الرقيق إلى MFI مرتفع بينما يحتاج الفيلم والنفخ إلى MFI منخفض؟',
        keyPointsAr: [
          'علاقة معامل الانصهار (MFI) بالوزن الجزيئي ولزوجة المصهور.',
          'مقارنة PP و HDPE و LDPE من حيث الكثافة والانكماش.',
        ],
      },
      {
        id: 'p-les-2',
        titleAr: 'الدرس الثاني: الماسترباتش والإضافات الوظيفية (UV, Slip, Antistatic)',
        titleEn: 'Lesson 2: Masterbatch & Functional Additives',
        durationMinutes: 35,
        summaryAr:
          'اختيار الحامل البوليمري المتوافق للماسترباتش وضمان التوزيع المتجانس للون والإضافات.',
        keyPointsAr: [
          'أهمية توافق حامل الماسترباتش (Carrier Resin) مع الخامة الأساسية.',
          'ضبط نسب الإضافة القياسية (1% إلى 4%) لتجنب فصل الطبقات.',
        ],
      },
    ],
    quiz: [
      {
        id: 'pq1',
        questionAr: 'أي نوع من المنتجات يتطلب خامة ذات معامل انصهار (MFI) مرتفع؟',
        optionsAr: [
          'منتجات الحقن ذات الجدران الرقيقة والمسارات الطويلة',
          'مواسير الضغط العالي',
          'براميل النفخ الكبيرة',
        ],
        correctIndex: 0,
      },
      {
        id: 'pq2',
        questionAr: 'ما الشرط الأساسي عند اختيار الماسترباتش لتلوين خامة البوليمر؟',
        optionsAr: [
          'توافق الخامة الحاملة للماسترباتش (Carrier Resin) مع الخامة الأساسية',
          'عدم تجفيف الخامة نهائياً',
          'تشغيل الماكينة بدون ضغط خلفي',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-defect-diagnosis',
    titleAr: 'التشخيص الجذري لعيوب الحقن والنفخ (Sink Marks, Flash, Warpage)',
    titleEn: 'Root-Cause Diagnosis of Injection & Blow Molding Defects',
    categoryAr: 'تشخيص العيوب والأعطال',
    categoryId: 'defect_diagnosis',
    targetAudienceAr: 'مهندسو الجودة، فنيو الضبط، ومشرفو خطوط الحقن',
    levelAr: 'متقدم',
    hours: 9,
    instructorAr: 'م. هاني عبد الفتاح',
    instructorTitleAr: 'خبير تحليل عيوب التشكيل وضبط العمليات',
    image: '/assets/aistudio/Meta_AI_863290530_1148864234244118_9061362439891882620_n_20261101_134222.webp_3f4ca191.jpg',
    introAr:
      'منهجية علمية لتحليل العيوب البصرية والهندسية في المنتجات البلاستيكية (علامات الغوص، الرايش، نقص الحقن، التقوس، وخطوط اللحام) وربطها بمخطط إيشيكاوا للأسباب الجذرية.',
    outcomesAr: [
      'القضاء على علامات الانكماش (Sink Marks) عبر موازنة ضغط وزمن التثبيت',
      'معالجة التقوس والالتواء (Warpage) الناتج عن عدم انتظام التبريد',
      'تحليل أسباب الرايش (Flash) ونقص الملء (Short Shot) منهجياً',
    ],
    completionRequirementsAr:
      'إتمام الدروس واجتياز الاختبار الفني بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 'd-les-1',
        titleAr: 'الدرس الأول: تحليل عيوب السطح والامتلاء (Short Shot, Flash, Sink Marks)',
        titleEn: 'Lesson 1: Surface & Filling Defects Analysis',
        durationMinutes: 45,
        summaryAr:
          'دراسة عملية بالصور المكبرة للعيوب الأربعة الأكثر تكراراً في صالات الحقن وطرق علاجها من الشاشة.',
        keyPointsAr: [
          'التمييز بين نقص الحقن الناتج عن ضعف السرعة والناتج عن انحباس الهواء.',
          'علاقة سماكة الجدار وتصميم الأعصاب (Ribs) بظهور علامات الغوص.',
        ],
      },
      {
        id: 'd-les-2',
        titleAr: 'الدرس الثاني: مخطط السبب والأثر (Fishbone) لتشخيص أعطال الماكينة',
        titleEn: 'Lesson 2: Fishbone Root-Cause Analysis for Molding Faults',
        durationMinutes: 40,
        summaryAr:
          'تطبيق منهجية العناصر الأربعة (الماكينة، القالب، الخامة، المشغل) للوصول للسبب الجذري دون تجارب عشوائية.',
        keyPointsAr: [
          'تثبيت المتغيرات وتعديل بارامتر واحد فقط في كل تجربة.',
          'توثيق بطاقة الإعدادات القياسية (Master Setup Sheet).',
        ],
      },
    ],
    quiz: [
      {
        id: 'dq1',
        questionAr: 'ما هو الإجراء الصحيح لعلاج علامات الغوص (Sink Marks) في المناطق السميكة؟',
        optionsAr: [
          'زيادة ضغط وزمن التثبيت (Holding Pressure & Time) مع التأكد من وجود مخدة بلاستيكية كافية',
          'إيقاف مياه التبريد تماماً',
          'تقليل ضغط التثبيت إلى الصفر',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-quality-control',
    titleAr: 'القياس الهندسي الدقيق ومراقبة الجودة المعملية للمنتجات البلاستيكية',
    titleEn: 'Precision Metrology & Laboratory Quality Control for Plastics',
    categoryAr: 'الجودة والفحص المعملي',
    categoryId: 'quality_control',
    targetAudienceAr: 'مهندسو وفاحصو الجودة (QC / QA) ومسؤولو المعامل',
    levelAr: 'متوسط إلى متقدم',
    hours: 8,
    instructorAr: 'م. رانيا الشاذلي',
    instructorTitleAr: 'مديرة توكيد الجودة والمعامل الهندسية',
    image: '/assets/aistudio/Meta_AI_881849649_1778394493449732_2661559922406400197_n_20261101_134326.webp_963a90a7.jpg',
    introAr:
      'دورة تطبيقية في استخدام أدوات القياس الدقيقة (القدمة الديجيتال، الميكرومتر، ومحددات القياس)، اختبارات الشد والصدم، وحساب نسب الانكماش والتفاوتات الهندسية.',
    outcomesAr: [
      'إجراء الفحص البعدي الدقيق باستخدام القدمة الرقمية والميكرومتر',
      'تفسير نتائج اختبار الشد (Tensile Test) ومعامل المرونة للبوليمرات',
      'بناء خرائط ضبط الجودة الإحصائية (SPC) على خطوط الإنتاج',
    ],
    completionRequirementsAr:
      'إتمام الدروس واجتياز الاختبار بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 'qc-les-1',
        titleAr: 'الدرس الأول: أدوات القياس الهندسي وحساب انكماش القالب (Shrinkage)',
        titleEn: 'Lesson 1: Dimensional Metrology & Mold Shrinkage Calculation',
        durationMinutes: 40,
        summaryAr:
          'متى تقيس المنتج بعد خروجه من الماكينة؟ وكيف تحسب الانكماش الفعلي مقارنة بانكماش التصميم.',
        keyPointsAr: [
          'أهمية تثبيت زمن القياس بعد التبريد الكامل (24 ساعة للمنتجات المتبلورة).',
          'استخدام محددات القبول والرفض (Go / No-Go Gauges) على الخط.',
        ],
      },
      {
        id: 'qc-les-2',
        titleAr: 'الدرس الثاني: اختبارات الشد والضغط والتسريب للعبوات والقطع الهندسية',
        titleEn: 'Lesson 2: Tensile, Top-Load & Leak Testing Standards',
        durationMinutes: 35,
        summaryAr:
          'شرح عملي لاختبار الشد المعملي (ASTM D638) واختبار تحمل الرص العلوي للعبوات والجراكن.',
        keyPointsAr: [
          'قراءة منحنى الإجهاد والانفعال (Stress-Strain Curve) للعينات البلاستيكية.',
          'معايير قبول عبوات الأدوية والكيماويات في اختبار التسريب والاسقاط.',
        ],
      },
    ],
    quiz: [
      {
        id: 'qcq1',
        questionAr: 'لماذا يجب إعادة قياس أبعاد منتجات البولي بروبيلين (PP) بعد 24 ساعة من الحقن؟',
        optionsAr: [
          'لأن البوليمرات شبه المتبلورة تستمر في التبلور والانكماش البعدي بعد خروجها من القالب',
          'لأن لون المنتج يتغير بعد 24 ساعة',
          'لأن القدمة الرقمية لا تعمل إلا في اليوم التالي',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-preventive-maintenance',
    titleAr: 'الصيانة الوقائية للفتيل والبرميل والأنظمة الهيدروليكية (Screw & Barrel)',
    titleEn: 'Preventive Maintenance for Screw, Barrel & Hydraulic Systems',
    categoryAr: 'الصيانة الوقائية والميكانيكية',
    categoryId: 'preventive_maintenance',
    targetAudienceAr: 'مهندسو وفنيو الصيانة الميكانيكية والهيدروليكية',
    levelAr: 'متقدم',
    hours: 10,
    instructorAr: 'م. طارق عبد الرحمن الشافعي',
    instructorTitleAr: 'استشاري صيانة ماكينات البلاستيك والهيدروليك',
    image: '/assets/aistudio/Meta_AI_883892470_1099447392987597_4557763958560017517_n_20261101_134129.webp_52b956d0.jpg',
    introAr:
      'برنامج عملي لفحص وصيانة مجموعة الحقن (الفتيل، البرميل، ومجموعة اللابستر Check-Ring)، قياس التآكل، وجدولة الصيانة الوقائية لمنع التوقفات المفاجئة.',
    outcomesAr: [
      'فك وفحص رأس الفتيل ومجموعة اللابستر (Non-Return Valve) وقياس الخلوص',
      'معايرة استقامة البرميل وفحص سخانات القمصان والازدواج الحراري',
      'تحليل نظافة زيت الهيدروليك وصيانة الصمامات التناسبية',
    ],
    completionRequirementsAr:
      'إتمام الدروس واجتياز التقييم بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 'pm-les-1',
        titleAr: 'الدرس الأول: فحص تآكل الفتيل والبرميل ومجموعة اللابستر',
        titleEn: 'Lesson 1: Screw, Barrel & Check-Ring Wear Inspection',
        durationMinutes: 45,
        summaryAr:
          'كيفية اكتشاف التآكل المبكر في ريش الفتيل وقياس القطر الداخلي للبرميل.',
        keyPointsAr: [
          'أعراض تلف كلبس اللابستر: عدم ثبات وزن القطعة وهروب مخدة الحقن (Cushion).',
          'متى نستخدم فتيل مزدوج المعدن (Bimetallic) مع الخامات المسلحة بالفايبر.',
        ],
      },
    ],
    quiz: [
      {
        id: 'pmq1',
        questionAr: 'ما هو العرض المباشر لتآكل مجموعة اللابستر (Check Ring) في مقدمة الفتيل؟',
        optionsAr: [
          'رجوع المصهور للخلف أثناء الحقن وعدم ثبات مخدة البلاستيك (Melt Cushion)',
          'توقف مروحة تبريد الموتور',
          'انطفاء شاشة الـ PLC',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-industrial-safety',
    titleAr: 'السلامة المهنية وتأمين ماكينات البلاستيك ونظام عزل الطاقة (LOTO)',
    titleEn: 'Industrial Machine Safety & Lockout/Tagout (LOTO) in Plastics Plants',
    categoryAr: 'السلامة المهنية وتأمين المصانع',
    categoryId: 'industrial_safety',
    targetAudienceAr: 'جميع العاملين، الفنيين، مهندسي التشغيل، ومسؤولي HSE',
    levelAr: 'أساسي إلزامي',
    hours: 6,
    instructorAr: 'م. عادل الغندور',
    instructorTitleAr: 'استشاري السلامة الصناعية وتأمين الماكينات',
    image: '/assets/aistudio/Meta_AI_884732409_1094158736948761_7620438826375320955_n_20261101_134500.webp_6bc4fdec.jpg',
    introAr:
      'القواعد الذهبية للعمل الآمن أمام ماكينات الحقن والنفخ والكسارات، تطبيق إجراءات العزل والتأمين بالقفـل (Lockout / Tagout) أثناء صيانة القوالب، والوقاية من الحروق الحرارية.',
    outcomesAr: [
      'تطبيق نظام القفل واللافتة التحذيرية (LOTO) قبل دخول منطقة القالب',
      'فحص الإنترلوك الميكانيكي والكهربائي والهيدروليكي لأبواب الأمان',
      'استخدام مهمات الوقاية الشخصية عند التعامل مع المصهور الساخن والفرن',
    ],
    completionRequirementsAr:
      'إتمام الدروس واجتياز التقييم بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 's-les-1',
        titleAr: 'الدرس الأول: إجراءات عزل الطاقة (LOTO) أثناء تركيب وصيانة الاسطمبات',
        titleEn: 'Lesson 1: Lockout / Tagout Procedures During Mold Setup',
        durationMinutes: 35,
        summaryAr:
          'خطوات تأمين الماكينة وفصل المضخة والضغط المتبقي قبل إدخال اليد أو الأدوات بين نصفي القالب.',
        keyPointsAr: [
          'ممنوع نهائياً تجاوز أو قفل حساسات باب الأمان (Safety Interlocks).',
          'ارتداء واقي الوجه والقفازات الحرارية أثناء تطهير البرميل (Purging).',
        ],
      },
    ],
    quiz: [
      {
        id: 'sq1',
        questionAr: 'ما هو الإجراء الإلزامي الأول قبل دخول الفني لمنطقة القالب لإجراء صيانة؟',
        optionsAr: [
          'إيقاف الماكينة وفصل مصدر الطاقة وتطبيق قفل الأمان الشخصي (LOTO)',
          'ترك المضخة تعمل في الوضع الأوتوماتيكي',
          'إلغاء حساس الباب لتوفير الوقت',
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'course-extrusion-blow',
    titleAr: 'تكنولوجيا سحب الأفلام، النفخ، وحساب تكاليف وتسعير منتجات البلاستيك',
    titleEn: 'Blown Film, Blow Molding & Plastics Product Costing Mastery',
    categoryAr: 'السحب والنفخ والتسعير الصناعي',
    categoryId: 'extrusion_blow',
    targetAudienceAr: 'مديرو المصانع، مهندسو السحب والنفخ، ومسؤولو التسعير',
    levelAr: 'متقدم',
    hours: 11,
    instructorAr: 'م. وائل الكيلاني',
    instructorTitleAr: 'استشاري تشغيل خطوط البثق والتسعير الصناعي',
    image: '/assets/aistudio/Meta_AI_883961476_1092751233753688_9037033819082647546_n_20261101_134321.webp_fba8f2a5.jpg',
    introAr:
      'تجمع هذه الدورة بين ضبط خطوط سحب الفيلم والنفخ (Blow Ratio, Frost Line, Parison Control) وبين المعادلات العملية لحساب تكلفة الكيلوجرام والقطعة شاملة الخامة والكهرباء والإهلاك.',
    outcomesAr: [
      'ضبط نسبة النفخ (BUR) وخط التجميد في أبراج الفيلم ونفخ الجراكن',
      'حساب التكلفة الصناعية الدقيقة للقطعة (خامة + هالك + زمن دورة + طاقة)',
      'تحديد نقطة التعادل (Break-even) وتسعير طلبيات التشغيل للغير',
    ],
    completionRequirementsAr:
      'إتمام الدروس واجتياز التقييم بنسبة 70% فأعلى.',
    lessons: [
      {
        id: 'eb-les-1',
        titleAr: 'الدرس الأول: ضبط برج الفيلم والباريسون في ماكينات النفخ',
        titleEn: 'Lesson 1: Blown Film Tower & Parison Thickness Control',
        durationMinutes: 40,
        summaryAr:
          'التحكم في ثبات الفقاعة وتوزيع السماكة في رولات الفيلم وعبوات النفخ.',
        keyPointsAr: [
          'ضبط حلقة هواء التبريد وارتفاع خط التجميد (Frost Line Height).',
          'استخدام جهاز التحكم في سماكة الباريسون لتوفير وزن الجركن مع الحفاظ على المتانة.',
        ],
      },
      {
        id: 'eb-les-2',
        titleAr: 'الدرس الثاني: معادلات تسعير منتجات البلاستيك وحساب تكلفة الساعة للماكينة',
        titleEn: 'Lesson 2: Plastics Product Costing & Machine Hourly Rate',
        durationMinutes: 45,
        summaryAr:
          'كيف تحسب سعر القطعة بدقة هندسية وتجارية قبل تقديم عرض السعر للعميل.',
        keyPointsAr: [
          'حساب الإنتاجية في الساعة = (3600 ÷ زمن الدورة) × عدد فجوات القالب × كفاءة الخط.',
          'توزيع تكلفة الكهرباء والعمالة والإهلاك على ساعة تشغيل الماكينة.',
        ],
      },
    ],
    quiz: [
      {
        id: 'ebq1',
        questionAr: 'كيف يؤثر تخفيض زمن الدورة (Cycle Time) بمقدار 4 ثوانٍ على تكلفة القطعة الواحدة؟',
        optionsAr: [
          'يزيد عدد القطع المنتجة في الساعة فيخفض نصيب القطعة من تكلفة الكهرباء والتشغيل',
          'يرفع تكلفة القطعة',
          'لا يؤثر إطلاقاً على التكلفة',
        ],
        correctIndex: 0,
      },
    ],
  },
];

