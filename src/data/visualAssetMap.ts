export interface RoleVisualCardConfig {
  id:
    | 'factory'
    | 'engineer'
    | 'technician'
    | 'worker'
    | 'supplier'
    | 'trader'
    | 'manufacturer'
    | 'visitor';
  dbRole: 'factory' | 'engineer' | 'technician' | 'supplier' | 'trader' | 'visitor';
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  image: string;
  icon3d: string;
  defaultSpecialtyAr: string;
}

/**
 * PHASE 1 & PHASE 2 — Official PLASTICO Visual Asset Intelligence Map
 * Maps every visually inspected /assets/aistudio/ asset to its exact domain context:
 * - 12 Uploaded 3D Industrial Section Icons (Meta_AI_icon_*_v2_*.png)
 * - 34 Realistic Industrial Photos & Cutouts (Meta_AI_*)
 * - 8 Account Registration Personas
 */
export const INDUSTRIAL_3D_ICONS = {
  injection: '/assets/aistudio/Meta_AI_icon_injection_molding_v2_20261101_133419_b34d124d.png',
  blow: '/assets/aistudio/Meta_AI_icon_blow_molding_v2_20261101_133422_6a7feaa6.png',
  extrusion: '/assets/aistudio/Meta_AI_icon_extrusion_v2_20261101_133424_846b2121.png',
  film: '/assets/aistudio/Meta_AI_icon_film_production_v2_20261101_133427_0622ed05.png',
  compression: '/assets/aistudio/Meta_AI_icon_compression_v2_20261101_133617_9bfcd980.png',
  recycling: '/assets/aistudio/Meta_AI_icon_recycling_v2_20261101_133612_1998cc36.png',
  thermoforming: '/assets/aistudio/Meta_AI_icon_thermoforming_v2_20261101_133609_e6ed6245.png',
  rotational: '/assets/aistudio/Meta_AI_icon_rotational_v2_20261101_133615_73127db5.png',
  qcInspection: '/assets/aistudio/Meta_AI_icon_qc_inspection_v2_20261101_133757_129d230b.png',
  printing: '/assets/aistudio/Meta_AI_icon_printing_v2_20261101_133753_7ea88a10.png',
  rawMaterials: '/assets/aistudio/Meta_AI_icon_raw_materials_v2_20261101_133751_807f64a6.png',
  moldMaintenance: '/assets/aistudio/Meta_AI_icon_mold_maintenance_v2_20261101_133749_e4464b6d.png',
} as const;

export const REGISTRATION_ROLE_CARDS: RoleVisualCardConfig[] = [
  {
    id: 'factory',
    dbRole: 'factory',
    titleAr: 'صاحب مصنع / مدير تشغيل',
    titleEn: 'Factory Owner / Plant Director',
    subtitleAr: 'إدارة خطوط الإنتاج، طلب الخامات والماكينات، وتوظيف الكفاءات',
    subtitleEn: 'Manage production lines, source materials & machinery, and hire talent',
    badgeAr: 'إدارة وتشغيل مصانع',
    badgeEn: 'Plant Management',
    image: '/assets/aistudio/Meta_AI_883815698_1419668040332169_5473236558783318393_n_20261101_134454_5ba81ece.webp',
    icon3d: INDUSTRIAL_3D_ICONS.injection,
    defaultSpecialtyAr: 'إدارة وتشغيل مصانع البلاستيك',
  },
  {
    id: 'engineer',
    dbRole: 'engineer',
    titleAr: 'مهندس بلاستيك وجودة',
    titleEn: 'Plastics & Process Engineer',
    subtitleAr: 'ضبط معايير التشغيل، تحليل الإنتاجية، وحل المشكلات الهندسية',
    subtitleEn: 'Process optimization, yield analysis, and engineering solutions',
    badgeAr: 'هندسة تشغيل وجودة',
    badgeEn: 'Process Engineering',
    image: '/assets/aistudio/Meta_AI_884622517_1453094866938030_5794883959523257281_n_20261101_134457.webp_9ad0b4f9.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.qcInspection,
    defaultSpecialtyAr: 'هندسة تشغيل وضبط جودة البوليمرات',
  },
  {
    id: 'technician',
    dbRole: 'technician',
    titleAr: 'فني صيانة واسطمبات',
    titleEn: 'Mold & Maintenance Technician',
    subtitleAr: 'صيانة القوالب والماكينات، تشخيص الأعطال، وضبط الدورات',
    subtitleEn: 'Mold maintenance, machine troubleshooting, and cycle setup',
    badgeAr: 'صيانة وقوالب TECH-MECH',
    badgeEn: 'Molds & Maintenance',
    image: '/assets/aistudio/Meta_AI_884672840_2293648131420566_4396917701512321876_n_20261101_134132.webp_a3fc4a82.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.moldMaintenance,
    defaultSpecialtyAr: 'صيانة ماكينات البلاستيك والاسطمبات',
  },
  {
    id: 'worker',
    dbRole: 'technician',
    titleAr: 'عامل إنتاج وفحص جودة',
    titleEn: 'Production & QC Worker',
    subtitleAr: 'متابعة خطوط الإنتاج، فرز وتعبئة العبوات، وفحص سلامة المنتج',
    subtitleEn: 'Line operation, bottle inspection, sorting, and packaging',
    badgeAr: 'تشغيل وإنتاج',
    badgeEn: 'Production Line',
    image: '/assets/aistudio/Meta_AI_886086263_1442924207259899_5952253466248895347_n_20261101_134547.webp_80bf1424.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.blow,
    defaultSpecialtyAr: 'تشغيل خطوط الإنتاج وفحص العبوات',
  },
  {
    id: 'supplier',
    dbRole: 'supplier',
    titleAr: 'مورد خامات وماسترباتش',
    titleEn: 'Polymers & Masterbatch Supplier',
    subtitleAr: 'توريد حبيبات PP, PE, PET, PVC والإضافات واستقبال طلبات التسعير',
    subtitleEn: 'Supply PP, PE, PET, PVC granules & additives and receive RFQs',
    badgeAr: 'توريد خامات بوليمر',
    badgeEn: 'Raw Materials',
    image: '/assets/aistudio/Meta_AI_884732422_976269862224828_8616113646332940793_n_20261101_134540.webp_6dac747d.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.rawMaterials,
    defaultSpecialtyAr: 'توريد الخامات الأساسية والماسترباتش',
  },
  {
    id: 'trader',
    dbRole: 'trader',
    titleAr: 'تاجر ماكينات ومعدات',
    titleEn: 'Machinery & Equipment Trader',
    subtitleAr: 'بيع وشراء وتقييم خطوط الإنتاج والماكينات الجديدة والمستعملة',
    subtitleEn: 'Buy, sell, and inspect new and used plastic machinery',
    badgeAr: 'ماكينات جديدة ومستعملة',
    badgeEn: 'Machinery Trading',
    image: '/assets/aistudio/Meta_AI_884757328_1652271796430677_1375570637085139979_n_20261101_134452.webp_cddfb468.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.extrusion,
    defaultSpecialtyAr: 'تجارة ماكينات الحقن والنفخ والمعدات المساعدة',
  },
  {
    id: 'manufacturer',
    dbRole: 'factory',
    titleAr: 'مصنّع / تشغيل للغير',
    titleEn: 'Contract Manufacturer',
    subtitleAr: 'استغلال الطاقة الإنتاجية المتاحة وتنفيذ طلبيات التصنيع للعملاء',
    subtitleEn: 'Offer available machine capacity and fulfill contract orders',
    badgeAr: 'تصنيع تعاقدي',
    badgeEn: 'Contract Molding',
    image: '/assets/aistudio/Meta_AI_885150414_2941915856180897_8448256024601957010_n_20261101_134323.webp_a9e0d2ef.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.compression,
    defaultSpecialtyAr: 'خدمات التصنيع للغير وتشغيل الاسطمبات',
  },
  {
    id: 'visitor',
    dbRole: 'visitor',
    titleAr: 'زائر (تصفح فقط)',
    titleEn: 'Visitor (View-Only Mode)',
    subtitleAr: 'تصفح الأقسام والاطلاع فقط — غير مسموح بالنشر أو التعليق أو التفاعل',
    subtitleEn: 'Browse platform sections in read-only mode — no posting, commenting, or interacting',
    badgeAr: 'تصفح فقط بدون تفاعل',
    badgeEn: 'View-Only Visitor',
    image: '/assets/aistudio/Meta_AI_884622543_1843836499970692_4261278643668307607_n_20261101_134217.webp_4943d8ac.jpg',
    icon3d: INDUSTRIAL_3D_ICONS.qcInspection,
    defaultSpecialtyAr: 'تصفح واطلاع فقط (زائر)',
  },
];

export const TRANSPARENT_MACHINERY_ASSETS = {
  injection450T: '/assets/aistudio/Meta_AI_876711241_1165794242468368_1352144977164666078_n_20261101_133109.webp_7686cffc.jpg',
  blowMolding: '/assets/aistudio/Meta_AI_876839733_1502772955027799_3762007972413334220_n_20261101_133229_d51f03ef.webp',
  rotomolding3000: '/assets/aistudio/Meta_AI_883256061_1138390202214240_3243738194416996884_n_20261101_133931.webp_fa0ae649.jpg',
  extruderCutaway: '/assets/aistudio/Meta_AI_862883601_1397348135504235_7284036699704388464_n_20261101_133929.webp_f59af714.jpg',
  blownFilmTower: '/assets/aistudio/Meta_AI_879375238_1432711818330676_7589963770503688744_n_20261101_134219.webp_5b6b70ab.jpg',
  thermoform3000: '/assets/aistudio/Meta_AI_866186440_1150636294091902_7275084427761626990_n_20261101_133934_d7d1ef75.webp',
  polymerPellets: '/assets/aistudio/Meta_AI_886293190_1678830613934074_2076821796018713871_n_20261101_133112.webp_a8042563.jpg',
  tensileTester: '/assets/aistudio/Meta_AI_860817909_1660197295562575_5007714658761595157_n_20261101_133927.webp_1af8ffbc.jpg',
} as const;

export const EXHIBITION_SHOWROOM_ASSETS = {
  machineryHall: '/assets/aistudio/Meta_AI_884757328_1652271796430677_1375570637085139979_n_20261101_134452.webp_cddfb468.jpg',
  polymersPavilion: '/assets/aistudio/Meta_AI_884551682_1668600864929841_5119881379252019218_n_20261101_134411.webp_c8bd272d.jpg',
  moldsShowroom: '/assets/aistudio/Meta_AI_863143701_2045633466001109_5450531851762887127_n_20261101_134359.webp_92c81219.jpg',
  packagingPlant: '/assets/aistudio/Meta_AI_885150414_2941915856180897_8448256024601957010_n_20261101_134323.webp_a9e0d2ef.jpg',
} as const;

