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

