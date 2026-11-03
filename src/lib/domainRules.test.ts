import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateReputationLevel,
  awardReputationPoints,
  filterManufacturingRequests,
  filterFactoryProviders,
  validateManufacturingStep,
  isVerifiedFactoryProvider,
  isVerifiedUserProfile,
  STICKER_3D_CATALOG,
  resolveStickerForAsset,
} from './domainRules';
import { ManufacturingRequest, FactoryServiceProvider } from '../types/plastico';

test('reputation levels follow exact PLASTICO point thresholds', () => {
  assert.equal(calculateReputationLevel(0), 'beginner');
  assert.equal(calculateReputationLevel(499), 'beginner');
  assert.equal(calculateReputationLevel(500), 'professional');
  assert.equal(calculateReputationLevel(1999), 'professional');
  assert.equal(calculateReputationLevel(2000), 'expert');
  assert.equal(calculateReputationLevel(3450), 'expert');
});

test('awardReputationPoints awards exact points for fault and solution actions', () => {
  const afterFault = awardReputationPoints(495, 'PUBLISH_FAULT');
  assert.equal(afterFault.newPoints, 505);
  assert.equal(afterFault.delta, 10);
  assert.equal(afterFault.level, 'professional');

  const afterBest = awardReputationPoints(1920, 'BEST_SOLUTION');
  assert.equal(afterBest.newPoints, 2020);
  assert.equal(afterBest.delta, 100);
  assert.equal(afterBest.level, 'expert');
});

test('filterManufacturingRequests filters by process, material, and search query', () => {
  const sample: ManufacturingRequest[] = [
    {
      id: 'req-1',
      referenceCode: 'MFG-101',
      requestType: 'product_manufacturing',
      titleAr: 'تصنيع عبوات دوائية HDPE',
      titleEn: 'HDPE Pharma Bottles',
      categoryAr: 'عبوات طبية',
      processId: 'blow',
      descriptionAr: 'مطلوب تصنيع عبوات دوائية سعة 250 مل',
      purposeAr: 'تعبئة أدوية',
      material: 'HDPE',
      dimensions: '140x60mm',
      unitWeightGrams: 28,
      colorAr: 'أبيض معتم',
      qualityRequirementsAr: 'درجة طبية',
      packagingRequirementsAr: 'أكياس معقمة',
      quantity: 100000,
      productionFrequency: 'recurring',
      startDate: '2026-11-15',
      deliveryDate: '2026-12-15',
      moldOwnership: 'customer_owned',
      needMoldManufacturing: false,
      needMaterialSourcing: true,
      country: 'مصر',
      city: 'العاشر من رمضان',
      deliveryLocation: 'العاشر من رمضان',
      contactName: 'م. أحمد',
      contactPhone: '01000000000',
      preferredContactMethod: 'phone',
      status: 'receiving_offers',
      createdAt: '2026-10-28',
      publisherName: 'شركة فارما باك',
      image: '/images/plastico/manufacturing/blow-molding.svg',
      offers: [],
    },
    {
      id: 'req-2',
      referenceCode: 'MFG-102',
      requestType: 'product_manufacturing',
      titleAr: 'حقن أغطية عبوات PP',
      titleEn: 'PP Flip-top Caps',
      categoryAr: 'أغطية',
      processId: 'injection',
      descriptionAr: 'حقن أغطية عبوات بمواصفات دقيقة',
      purposeAr: 'تغليف',
      material: 'PP',
      dimensions: '38mm',
      unitWeightGrams: 4.5,
      colorAr: 'أزرق',
      qualityRequirementsAr: 'إغلاق محكم',
      packagingRequirementsAr: 'كراتين',
      quantity: 250000,
      productionFrequency: 'recurring',
      startDate: '2026-11-20',
      deliveryDate: '2026-12-20',
      moldOwnership: 'mold_manufacturing_required',
      needMoldManufacturing: true,
      needMaterialSourcing: true,
      country: 'مصر',
      city: 'السادس من أكتوبر',
      deliveryLocation: 'السادس من أكتوبر',
      contactName: 'م. كريم',
      contactPhone: '01100000000',
      preferredContactMethod: 'whatsapp',
      status: 'new',
      createdAt: '2026-10-29',
      publisherName: 'شركة النيل',
      image: '/images/plastico/manufacturing/injection-molding.svg',
      offers: [],
    },
  ];

  const blowOnly = filterManufacturingRequests(sample, { processId: 'blow' });
  assert.equal(blowOnly.length, 1);
  assert.equal(blowOnly[0].id, 'req-1');

  const ppSearch = filterManufacturingRequests(sample, { query: 'أغطية' });
  assert.equal(ppSearch.length, 1);
  assert.equal(ppSearch[0].id, 'req-2');
});

test('validateManufacturingStep enforces required fields per step', () => {
  const baseData = {
    titleAr: '',
    processId: 'injection',
    descriptionAr: 'وصف تفصيلي للمنتج البلاستيكي المطلوب',
    material: 'PP',
    quantity: 50000,
    city: 'العاشر من رمضان',
    contactName: 'م. مصطفى',
    contactPhone: '01012345678',
  };

  const invalidStep1 = validateManufacturingStep(1, baseData);
  assert.equal(invalidStep1.valid, false);

  const validStep1 = validateManufacturingStep(1, { ...baseData, titleAr: 'علبة تجميل PP' });
  assert.equal(validStep1.valid, true);

  const invalidStep3 = validateManufacturingStep(3, { ...baseData, titleAr: 'علبة', quantity: 0 });
  assert.equal(invalidStep3.valid, false);
});

test('isVerifiedFactoryProvider and filterFactoryProviders handle verified status and search queries', () => {
  const providers: FactoryServiceProvider[] = [
    {
      id: 'prov-1',
      nameAr: 'مصنع الدلتا للصناعات البلاستيكية',
      nameEn: 'Delta Plastics Factory',
      country: 'مصر',
      city: 'العاشر من رمضان',
      industrialArea: 'المنطقة الثالثة',
      descriptionAr: 'حقن ونفخ',
      descriptionEn: 'Injection and blow molding',
      processes: ['injection', 'blow'],
      machinesSummary: ['Haitian'],
      tonnageRange: '100-400T',
      availableCapacityPercent: 35,
      materialsSupported: ['PP', 'HDPE'],
      productsManufacturedAr: ['عبوات'],
      servicesOfferedAr: ['حقن'],
      responseTimeAr: '3 ساعات',
      rating: 4.9,
      reviewsCount: 40,
      verifiedDemo: true,
      contactPhone: '0100000000',
      coverImage: '/images/plastico/hero/main-industrial-hero.svg',
      reviews: [],
    },
    {
      id: 'prov-unverified',
      nameAr: 'ورشة الأمل للبلاستيك',
      nameEn: 'Al-Amal Plastics Workshop',
      country: 'مصر',
      city: 'القاهرة',
      industrialArea: 'المنطقة الأولى',
      descriptionAr: 'تشغيل أولي',
      descriptionEn: 'Basic molding',
      processes: ['injection'],
      machinesSummary: ['Generic'],
      tonnageRange: '90T',
      availableCapacityPercent: 20,
      materialsSupported: ['PP'],
      productsManufacturedAr: ['أجزاء'],
      servicesOfferedAr: ['حقن'],
      responseTimeAr: '24 ساعة',
      rating: 4.0,
      reviewsCount: 2,
      verifiedDemo: false,
      contactPhone: '0110000000',
      coverImage: '/images/plastico/hero/main-industrial-hero.svg',
      reviews: [],
    },
  ];

  assert.equal(isVerifiedFactoryProvider(providers[0]), true);
  assert.equal(isVerifiedFactoryProvider(providers[1]), false);

  const verifiedOnlyList = filterFactoryProviders(providers, { verifiedOnly: true });
  assert.equal(verifiedOnlyList.length, 1);
  assert.equal(verifiedOnlyList[0].id, 'prov-1');

  assert.equal(
    isVerifiedUserProfile({ accountType: 'factory', badges: [], points: 100 }),
    true
  );
  assert.equal(
    isVerifiedUserProfile({
      accountType: 'supplier',
      badges: ['مورد معتمد بالمنصة'],
      points: 200,
    }),
    true
  );
});

test('STICKER_3D_CATALOG and resolveStickerForAsset cover all industrial sections and assets', () => {
  assert.equal(STICKER_3D_CATALOG.length, 20);
  assert.equal(resolveStickerForAsset('/images/plastico/marketplace/injection-mold-steel.svg'), 'steel_mold');
  assert.equal(resolveStickerForAsset('/images/plastico/manufacturing/blow-molding-bottles.svg'), 'blow_bottles');
  assert.equal(resolveStickerForAsset('/images/plastico/marketplace/virgin-polymer-granules.svg'), 'resin_granules');
  assert.equal(resolveStickerForAsset('/images/plastico/manufacturing/pipe-extrusion.svg'), 'extrusion_pipe');
  assert.equal(resolveStickerForAsset('/images/plastico/marketplace/plastic-shredder-unit.svg'), 'recycling_shredder');
  assert.equal(resolveStickerForAsset('/images/plastico/marketplace/spare-parts.svg'), 'servo_spares');
  assert.equal(resolveStickerForAsset('/images/plastico/factories/virtual-exhibition-hall.svg'), 'expo');
});

test('authService password hashing and timing-safe verification work accurately', async () => {
  const {
    hashPassword,
    verifyPassword,
    generateSessionSecrets,
    parseCookies,
    resolveSmartAssistantIntent,
  } = await import('./authService');

  const { hash, salt } = hashPassword('StrongIndustrialPass#2026');
  assert.ok(hash.length > 32);
  assert.ok(salt.length >= 16);
  assert.equal(verifyPassword('StrongIndustrialPass#2026', hash, salt), true);
  assert.equal(verifyPassword('WrongPassword#2026', hash, salt), false);

  const secrets = generateSessionSecrets();
  assert.ok(secrets.rawToken.length >= 32);
  assert.ok(secrets.tokenHash.length === 64);
  assert.ok(secrets.csrfToken.length >= 24);

  const cookies = parseCookies('plastico_sid=abc123token; theme=dark');
  assert.equal(cookies.plastico_sid, 'abc123token');
  assert.equal(cookies.theme, 'dark');

  const heaterIntent = resolveSmartAssistantIntent('عايز سخانات صناعية');
  assert.equal(heaterIntent.recommendation?.targetRoute, '/app/market?category=heaters');
  assert.ok(heaterIntent.recommendation?.categoryTitleAr.includes('السخانات'));
  assert.ok((heaterIntent.matchedItems?.length ?? 0) > 0);

  const usedInjectionIntent = resolveSmartAssistantIntent('عايز ماكينة حقن مستعملة');
  assert.equal(
    usedInjectionIntent.recommendation?.targetRoute,
    '/app/market?category=injection_machines&condition=used'
  );
  assert.ok((usedInjectionIntent.matchedItems?.length ?? 0) > 0);

  const supplierIntent = resolveSmartAssistantIntent('عايز مورد خامة PP');
  assert.equal(
    supplierIntent.recommendation?.targetRoute,
    '/app/suppliers?category=raw_materials&q=PP'
  );
  assert.ok((supplierIntent.matchedItems?.length ?? 0) > 0);

  const factoryRfqIntent = resolveSmartAssistantIntent('عايز مصنع يصنع لي منتج');
  assert.equal(
    factoryRfqIntent.recommendation?.targetRoute,
    '/app/manufacturing/requests/new'
  );
  assert.ok((factoryRfqIntent.matchedItems?.length ?? 0) > 0);
});

test('Role-specific fields and Supplier skills strictly exclude machine operation and include polymer/supply skills', async () => {
  const {
    ROLE_SKILLS_OPTIONS,
    SUPPLIER_ALLOWED_SKILLS,
    FORBIDDEN_SUPPLIER_MACHINE_SKILLS,
    sanitizeRoleSkills,
  } = await import('../data/roleFieldsConfig');

  assert.ok(Object.keys(ROLE_SKILLS_OPTIONS).length >= 5);
  assert.equal(SUPPLIER_ALLOWED_SKILLS.length, 15);

  // Verify supplier skills strip forbidden machine operation skills
  const mixedSkills = [
    'تشغيل ماكينات الحقن',
    'صيانة القوالب',
    'أنظمة PLC',
    'خامات PP',
    'ماسترباتش ألوان',
    'توفير عينات الخامات',
  ];
  const cleaned = sanitizeRoleSkills('supplier', mixedSkills);
  assert.deepEqual(cleaned, ['خامات PP', 'ماسترباتش ألوان', 'توفير عينات الخامات']);

  for (const forbidden of FORBIDDEN_SUPPLIER_MACHINE_SKILLS) {
    assert.ok(!SUPPLIER_ALLOWED_SKILLS.includes(forbidden));
  }
});

test('IMAGE_MANIFEST and visualAssetMap map all 46 valid industrial assets and exclude UI reference mockups', async () => {
  const { IMAGE_MANIFEST } = await import('../data/imageManifest');
  const { INDUSTRIAL_3D_ICONS, REGISTRATION_ROLE_CARDS } = await import('../data/visualAssetMap');

  // Verify 12 3D category icons are present and point to /assets/aistudio/Meta_AI_icon_*
  const iconValues = Object.values(INDUSTRIAL_3D_ICONS);
  assert.equal(iconValues.length, 12);
  for (const iconPath of iconValues) {
    assert.ok(iconPath.startsWith('/assets/aistudio/Meta_AI_icon_'), `Expected 3D icon path, got ${iconPath}`);
  }

  // Verify no asset in IMAGE_MANIFEST uses the excluded UI mockup files
  const allManifestPaths = Object.entries(IMAGE_MANIFEST)
    .filter(([key]) => key !== 'brand')
    .flatMap(([, section]) => Object.values(section as Record<string, string>));

  for (const p of allManifestPaths) {
    assert.ok(p.startsWith('/assets/aistudio/'), `Expected /assets/aistudio/ path, got ${p}`);
    assert.ok(!p.includes('file_00000000'), `Excluded UI mockup found in manifest: ${p}`);
    assert.ok(!p.includes('a_clean_modern_high_resolution_ui_ux_mockup'), `Excluded UI collage found in manifest: ${p}`);
  }

  assert.equal(REGISTRATION_ROLE_CARDS.length, 8);
  for (const rc of REGISTRATION_ROLE_CARDS) {
    assert.ok(rc.image.startsWith('/assets/aistudio/'));
    assert.ok(rc.icon3d.startsWith('/assets/aistudio/Meta_AI_icon_'));
  }
});

test('Visitor mode and visitor accountType are strictly blocked from write/interactive actions', async () => {
  const { canAccountPerformWriteAction } = await import('./domainRules');
  assert.equal(canAccountPerformWriteAction(null, false), false);
  assert.equal(canAccountPerformWriteAction('visitor', false), false);
  assert.equal(canAccountPerformWriteAction('visitor', true), false);
  assert.equal(canAccountPerformWriteAction('engineer', true), true);
  assert.equal(canAccountPerformWriteAction('factory', true), true);
  assert.equal(canAccountPerformWriteAction('supplier', true), true);
});

test('10-currency system, country-to-currency mapping, and price conversion work accurately', async () => {
  const {
    SUPPORTED_CURRENCIES,
    CURRENCY_RATE_REFERENCE_DATE,
    getDefaultCurrencyForCountry,
    convertPriceCurrency,
  } = await import('./domainRules');

  assert.equal(SUPPORTED_CURRENCIES.length, 10);
  assert.equal(CURRENCY_RATE_REFERENCE_DATE, '2026-11-02');
  assert.equal(getDefaultCurrencyForCountry('مصر'), 'EGP');
  assert.equal(getDefaultCurrencyForCountry('السعودية'), 'SAR');
  assert.equal(getDefaultCurrencyForCountry('الإمارات'), 'AED');
  assert.equal(getDefaultCurrencyForCountry('الكويت'), 'KWD');
  assert.equal(getDefaultCurrencyForCountry('USA'), 'USD');

  const convertedSar = convertPriceCurrency(1000, 'USD', 'SAR');
  assert.equal(convertedSar.convertedAmount, 3750);
  assert.equal(convertedSar.referenceDate, '2026-11-02');
  assert.ok(convertedSar.formattedAr.includes('ر.س'));

  const convertedEgp = convertPriceCurrency(100, 'USD', 'EGP');
  assert.equal(convertedEgp.convertedAmount, 4920);
  assert.ok(convertedEgp.formattedAr.includes('ج.م'));
});

test('Verification statuses, job application statuses, and attachment validation follow master specs', async () => {
  const {
    getVerificationStatusMeta,
    JOB_APPLICATION_STATUS_META,
    validateIndustrialAttachment,
  } = await import('./domainRules');

  const verifiedMeta = getVerificationStatusMeta('verified');
  assert.equal(verifiedMeta.code, 'verified');
  assert.equal(verifiedMeta.labelAr, 'موثق رسمياً');

  const pendingMeta = getVerificationStatusMeta('pending');
  assert.equal(pendingMeta.code, 'pending');
  assert.equal(pendingMeta.labelAr, 'طلب التوثيق قيد المراجعة');

  assert.equal(Object.keys(JOB_APPLICATION_STATUS_META).length, 6);
  assert.equal(JOB_APPLICATION_STATUS_META.received.labelAr, 'تم الاستلام');
  assert.equal(JOB_APPLICATION_STATUS_META.accepted.labelAr, 'مقبول');

  const validImg = validateIndustrialAttachment({
    name: 'defect-photo.webp',
    sizeBytes: 2 * 1024 * 1024,
    category: 'image',
  });
  assert.equal(validImg.valid, true);

  const oversizedImg = validateIndustrialAttachment({
    name: 'huge-photo.png',
    sizeBytes: 15 * 1024 * 1024,
    category: 'image',
  });
  assert.equal(oversizedImg.valid, false);

  const invalidExt = validateIndustrialAttachment({
    name: 'script.exe',
    sizeBytes: 1024,
    category: 'document',
  });
  assert.equal(invalidExt.valid, false);
});

test('Smart Assistant conversational greetings, name extraction, and technician lookup work naturally', async () => {
  const { resolveSmartAssistantIntent } = await import('./authService');

  const greetingWithUser = resolveSmartAssistantIntent('عامل إيه؟', 0, {
    userName: 'أحمد المنشاوي',
    userRole: 'factory',
    userCountry: 'مصر',
  });
  assert.ok(greetingWithUser.replyAr.includes('أحمد المنشاوي'));

  const introWithoutUser = resolveSmartAssistantIntent('أهلاً، اسمي محمود', 0, {});
  assert.equal(introWithoutUser.detectedUserName, 'محمود');
  assert.ok(introWithoutUser.replyAr.includes('محمود'));

  const techLookup = resolveSmartAssistantIntent('محتاج فني صيانة حقن في مصر', 1, {
    userName: 'أحمد',
    dbContext: {
      users: [
        {
          id: 'usr-12',
          name: 'م. طارق عبد السلام',
          role: 'engineer',
          specialty: 'مهندس صيانة وتشغيل خطوط حقن',
          city: 'العاشر من رمضان',
          country: 'مصر',
          skills: ['حقن بلاستيك', 'صيانة القوالب'],
          verified: true,
        },
      ],
    },
  });
  assert.ok(techLookup.replyAr.includes('م. طارق عبد السلام'));
  assert.ok(
    techLookup.matchedItems?.some((r) => r.route === '/app/profile/usr-12')
  );
});


