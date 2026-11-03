import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'plastico_sid';
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string, existingSalt?: string): {
  hash: string;
  salt: string;
} {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

export function verifyPassword(
  password: string,
  storedHash: string | null | undefined,
  storedSalt: string | null | undefined
): boolean {
  if (!storedHash || !storedSalt) return false;
  try {
    const { hash } = hashPassword(password, storedSalt);
    const hashBuf = Buffer.from(hash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (hashBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, storedBuf);
  } catch {
    return false;
  }
}

export function generateSessionSecrets(): {
  rawToken: string;
  tokenHash: string;
  csrfToken: string;
} {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const csrfToken = crypto.randomBytes(24).toString('hex');
  return { rawToken, tokenHash, csrfToken };
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(val);
      } catch {
        out[key] = val;
      }
    }
  }
  return out;
}

export function formatSessionCookie(
  rawToken: string,
  maxAgeSeconds: number,
  isSecure = true
): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(rawToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function clearSessionCookie(isSecure = true): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecure) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  maxAttempts = 12,
  windowMs = 60_000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);
  if (!bucket || now >= bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export interface AssistantMatchedItem {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  route: string;
}

export interface AssistantContextOptions {
  userName?: string;
  userRole?: string;
  userCity?: string;
  userCountry?: string;
  history?: Array<{ role: string; text: string }>;
  dbContext?: {
    listings?: Array<{
      id: string;
      titleAr: string;
      category: string;
      price: number;
      currency: string;
      city: string;
      isUsed: boolean | null;
      sellerNameAr: string | null;
    }>;
    users?: Array<{
      id: string;
      name: string;
      role: string;
      specialty: string;
      city: string;
      country: string;
      skills: string[];
      verified: boolean;
    }>;
  };
}

export interface AssistantRecommendation {
  replyAr: string;
  replyEn: string;
  detectedUserName?: string;
  followUpQuestionsAr?: string[];
  matchedItems?: AssistantMatchedItem[];
  recommendation?: {
    categoryTitleAr: string;
    categoryTitleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    buttonLabelAr: string;
    buttonLabelEn: string;
    targetRoute: string;
  };
}

function normalizeArabicQuery(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/مكينه|مكينة|ماكينه/g, 'ماكينه')
    .replace(/سخنات|سخانات|سخان/g, 'سخان')
    .replace(/مشتعمله|مستعملة|مستعمله/g, 'مستعمل')
    .replace(/\s+/g, ' ');
}

export function extractIntroducedName(message: string): string | null {
  const trimmed = message.trim();
  const patterns = [
    /(?:انا اسمي|اسمي|معاك|انا المهندس|انا الفني|انا الحاج)\s+([\u0600-\u06FFa-zA-Z]{2,20}(?:\s+[\u0600-\u06FFa-zA-Z]{2,20})?)/i,
    /^(?:انا)\s+(?!(?:عايز|محتاج|ابحث|بدور|عندي|بسأل|مهتم))([\u0600-\u06FFa-zA-Z]{2,18})$/i,
    /(?:my name is|i am|i'm)\s+([a-zA-Z]{2,20})/i,
  ];
  for (const pat of patterns) {
    const m = trimmed.match(pat);
    if (m && m[1]) {
      return m[1].trim();
    }
  }
  return null;
}

export function resolveSmartAssistantIntent(
  userMessage: string,
  _historyCount = 0,
  ctx?: AssistantContextOptions
): AssistantRecommendation {
  const qRaw = userMessage.toLowerCase().trim();
  const q = normalizeArabicQuery(userMessage);
  const introduced = extractIntroducedName(userMessage);
  const activeName = introduced || ctx?.userName?.trim() || '';
  const nameGreetingAr = activeName ? `يا ${activeName}` : 'بك';
  const nameGreetingEn = activeName ? `, ${activeName}` : '';

  // 0A. Natural Greeting / Small Talk / Identity ("أهلاً", "عامل إيه", "صباح الخير", "أنت مين", "محتاج مساعدة")
  const isPureGreeting =
    /^(اهلا|مرحبا|السلام عليكم|سلام عليكم|صباح الخير|مساء الخير|ازيك|عامل ايه|اخبارك|هاي|هلا|hello|hi|hey|good morning|good evening)[\s!؟?،.]*$/i.test(
      q
    ) ||
    q === 'عامل ايه' ||
    q.includes('اخبارك ايه') ||
    q.includes('انت مين') ||
    q.includes('تقدر تساعدني في ايه') ||
    (introduced && q.split(' ').length <= 4);

  if (isPureGreeting) {
    return {
      detectedUserName: introduced || undefined,
      replyAr: activeName
        ? `أهلاً وسهلاً ${nameGreetingAr}! نورت منصة بلاستيكو الصناعية. أنا بخير وجاهز لمساعدتك فوراً في أي حاجة تخص مصنعك أو شغلك في قطاع البلاستيك (سواء بتدور على ماكينة، مورد خامات PP/PE، فني أو مهندس، أو تشخيص عطل فني). تحب نبدأ بإيه النهارده؟`
        : `أهلاً وسهلاً بحضرتك في منصة PLASTICO الصناعية! أنا المساعد الذكي للمنصة، أقدر أساعدك توصل لموردي الخامات، الماكينات الجديدة والمستعملة، الفنيين والمهندسين، أو حلول أعطال التشغيل. أتشرف بمعرفة اسم حضرتك، وقولي محتاج أساعدك في إيه النهارده؟`,
      replyEn: activeName
        ? `Welcome${nameGreetingEn}! Great to have you on PLASTICO. How can I help you today with machinery, polymer resins, technicians, or technical troubleshooting?`
        : `Welcome to PLASTICO Industrial Ecosystem! I can help you find polymer suppliers, machinery, technicians, or troubleshooting solutions. May I know your name, and how can I assist you today?`,
      followUpQuestionsAr: [
        'محتاج فني حقن في العاشر من رمضان',
        'عايز مورد خامات PP',
        'عايز ماكينة حقن مستعملة',
        'عايز مصنع يصنع لي منتج',
      ],
    };
  }

  // 0B. Searching for Technicians or Engineers ("محتاج فني حقن في العاشر من رمضان")
  if (
    (q.includes('فني') || q.includes('مهندس') || q.includes('عامل') || q.includes('صنايعي') || q.includes('مشغل')) &&
    !q.includes('سخان')
  ) {
    const dbTechs = (ctx?.dbContext?.users || []).filter(
      (u) => u.role === 'technician' || u.role === 'engineer'
    );
    const cityFilter = q.includes('العاشر')
      ? 'العاشر من رمضان'
      : q.includes('اكتوبر')
      ? 'السادس من أكتوبر'
      : q.includes('برج العرب')
      ? 'برج العرب'
      : q.includes('العبور')
      ? 'العبور'
      : '';

    const matchedUsers = dbTechs.filter((u) =>
      cityFilter ? u.city.includes(cityFilter) : true
    );

    const matchedItems: AssistantMatchedItem[] =
      matchedUsers.length > 0
        ? matchedUsers.slice(0, 3).map((u) => ({
            id: u.id,
            titleAr: `${u.name} — ${u.specialty || (u.role === 'engineer' ? 'مهندس بلاستيك' : 'فني تشغيل وصيانة')}`,
            titleEn: `${u.name} — ${u.specialty || u.role}`,
            subtitleAr: `${u.city}، ${u.country} · المهارات: ${(u.skills || []).slice(0, 3).join('، ') || 'تشغيل وصيانة خطوط البلاستيك'}`,
            subtitleEn: `${u.city}, ${u.country}`,
            badgeAr: u.role === 'engineer' ? 'مهندس مسجل' : 'فني مسجل',
            badgeEn: u.role === 'engineer' ? 'Registered Engineer' : 'Registered Technician',
            route: `/app/profile/${u.id}`,
          }))
        : [
            {
              id: 'usr-tech-demo',
              titleAr: 'قسم الكفاءات الفنية والوظائف الصناعية',
              titleEn: 'Technical Talent & Industrial Jobs',
              subtitleAr: cityFilter
                ? `تصفح الفنيين والمهندسين المتاحين في ${cityFilter} أو انشر طلب توظيف مباشر`
                : 'تصفح الفنيين والمهندسين المتاحين أو انشر إعلان توظيف مباشر',
              subtitleEn: 'Browse available technicians & engineers or post a job opening',
              badgeAr: 'توظيف مباشر',
              badgeEn: 'Direct Hiring',
              route: '/app/jobs',
            },
          ];

    return {
      detectedUserName: introduced || undefined,
      replyAr:
        matchedUsers.length > 0
          ? `أهلاً ${nameGreetingAr}! بحثت لك في قاعدة بيانات بلاستيكو ولقيت ${matchedUsers.length} من الفنيين والمهندسين المسجلين${cityFilter ? ` في ${cityFilter}` : ''} (${matchedUsers.slice(0, 3).map((u) => u.name).join('، ')}). تقدر تفتح الملف الشخصي لأي حد فيهم وتتواصل معاه مباشرة:`
          : `أهلاً ${nameGreetingAr}! حالياً مفيش فني مطابق تماماً لنفس الفلتر الدقيق في قاعدة البيانات المسجلة، لكن تقدر تستعرض كل الفنيين والمهندسين المتاحين في قسم التوظيف أو تنشر إعلان وظيفة مجاني عشان يتواصلوا معاك فوراً:`,
      replyEn:
        matchedUsers.length > 0
          ? `Found ${matchedUsers.length} registered technicians/engineers matching your request in the PLASTICO database:`
          : `You can browse all available technicians and engineers or post a direct job requirement in the Jobs portal:`,
      followUpQuestionsAr: [
        'عرض كل الفنيين والمهندسين في الوظائف',
        'نشر إعلان مطلوب فني حقن',
        'البحث عن مهندس صيانة هيدروليك و PLC',
      ],
      matchedItems,
      recommendation: {
        categoryTitleAr: 'بوابة الكفاءات الفنية والتوظيف الصناعي',
        categoryTitleEn: 'Technical Talent & Jobs Portal',
        descriptionAr:
          'استعرض ملفات المهندسين والفنيين ومشغلي الماكينات وتواصل معهم مباشرة عبر رسائل المنصة.',
        descriptionEn:
          'Browse engineer and technician profiles and message them directly.',
        buttonLabelAr: 'افتح قسم الكفاءات والوظائف',
        buttonLabelEn: 'Open Talent & Jobs',
        targetRoute: '/app/jobs',
      },
    };
  }

  // 1. Manufacturing RFQ / Contract Manufacturing ("عايز مصنع يصنع لي منتج")
  if (
    (q.includes('مصنع') && (q.includes('يصنع') || q.includes('تصنيع') || q.includes('منتج') || q.includes('عبوات') || q.includes('تشغيل'))) ||
    q.includes('طلب تصنيع') ||
    q.includes('تصنيع للغير') ||
    q.includes('rfq') ||
    q.includes('عايز اصنع') ||
    q.includes('محتاج مصنع يصنع')
  ) {
    return {
      detectedUserName: introduced || undefined,
      replyAr:
        `تمام ${nameGreetingAr}! يمكنك الآن إرسال طلب تصنيع وعرض سعر (RFQ) مباشرة للمصانع المعتمدة في بلاستيكو مع تحديد نوع المنتج، الخامة، الكمية، والمواصفات الفنية لتلقي ومقارنة عروض المصانع:`,
      replyEn:
        'Got it! You can immediately submit a Manufacturing Request (RFQ) to verified factories on PLASTICO, specifying product type, resin, quantity, and specs to receive and compare factory offers:',
      followUpQuestionsAr: [
        'إنشاء طلب تصنيع جديد (RFQ)',
        'تصفح المصانع المتاحة للتصنيع للغير',
        'طلب تصنيع اسطمبة أو قالب جديد',
      ],
      matchedItems: [
        {
          id: 'rfq-new-action',
          titleAr: 'نموذج طلب تصنيع وعروض أسعار (RFQ)',
          titleEn: 'New Manufacturing Request (RFQ) Form',
          subtitleAr: 'حدد المنتج والخامة والكمية واستقبل عروض المصانع المعتمدة',
          subtitleEn: 'Specify product, resin & quantity to receive verified factory quotes',
          badgeAr: 'إجراء فوري',
          badgeEn: 'Instant Action',
          route: '/app/manufacturing/requests/new',
        },
        {
          id: 'fac-1',
          titleAr: 'مصنع النيل للصناعات البلاستيكية — العاشر من رمضان',
          titleEn: 'Nile Plastics Factory — 10th of Ramadan',
          subtitleAr: 'متاح خطوط حقن ونفخ عبوات (160 طن إلى 650 طن) للتصنيع للغير',
          subtitleEn: 'Available injection & blow lines (160T–650T) for contract manufacturing',
          badgeAr: 'مصنع موثق',
          badgeEn: 'Verified Factory',
          route: '/app/manufacturing',
        },
      ],
      recommendation: {
        categoryTitleAr: 'طلبات التصنيع وعروض الأسعار — RFQ',
        categoryTitleEn: 'Manufacturing Requests & RFQs',
        descriptionAr:
          'أنشئ طلب تصنيع (RFQ) الآن وأرسله للمصانع المناسبة مع مقارنة الأسعار ومدة التنفيذ.',
        descriptionEn:
          'Create a Manufacturing RFQ now and send it to matching factories to compare pricing and lead times.',
        buttonLabelAr: 'أنشئ طلب تصنيع الآن (RFQ)',
        buttonLabelEn: 'Create Manufacturing RFQ Now',
        targetRoute: '/app/manufacturing/requests/new',
      },
    };
  }

  // 2. Industrial Heaters / سخانات صناعية ("عايز سخانات صناعية")
  if (
    q.includes('سخان') ||
    qRaw.includes('heater') ||
    q.includes('تدفئه') ||
    q.includes('سيراميك') ||
    q.includes('نوزل')
  ) {
    return {
      replyAr:
        'تم العثور على عروض السخانات الصناعية (سخانات القوالب، السخانات السيراميك، وسخانات الفوهة والنحاس) في السوق الصناعي ودليل الموردين:',
      replyEn:
        'Found industrial heaters (mold heaters, ceramic band heaters, and brass nozzle heaters) in the Marketplace and Suppliers Directory:',
      followUpQuestionsAr: [
        'عرض كل السخانات الصناعية في السوق',
        'موردي السخانات والتحكم الحراري',
        'طلب عرض سعر سخانات بمقاس خاص',
      ],
      matchedItems: [
        {
          id: 'mkt-heater-1',
          titleAr: 'طقم سخانات سيراميك ونحاس لماكينات الحقن والسحب',
          titleEn: 'Ceramic & Brass Band Heaters Set for Injection & Extrusion',
          subtitleAr: 'العاشر من رمضان، مصر · متوفر جميع المقاسات والقدرات بالواط',
          subtitleEn: '10th of Ramadan, Egypt · All diameters & wattages in stock',
          badgeAr: '450 USD',
          badgeEn: '450 USD',
          route: '/app/market?category=heaters',
        },
        {
          id: 'sup-heater-1',
          titleAr: 'الشركة الهندسية للسخانات الصناعية وأنظمة التحكم الحراري',
          titleEn: 'Engineering Co. for Industrial Heaters & Thermal Control',
          subtitleAr: 'تصنيع وتوريد سخانات سيراميك، سخانات الهوت رنر، وحساسات حرارة',
          subtitleEn: 'Ceramic heaters, hot runner coils & thermocouples',
          badgeAr: 'مورد معتمد',
          badgeEn: 'Verified Supplier',
          route: '/app/suppliers?category=heaters_thermal',
        },
      ],
      recommendation: {
        categoryTitleAr: 'السوق الصناعي — قسم السخانات الصناعية',
        categoryTitleEn: 'Marketplace — Industrial Heaters Section',
        descriptionAr:
          'تم تطبيق فلتر السخانات الصناعية لعرض جميع السخانات المتوفرة ومورديها مباشرة.',
        descriptionEn:
          'Industrial Heaters filter applied to show all available heaters and suppliers.',
        buttonLabelAr: 'افتح قسم السخانات الصناعية',
        buttonLabelEn: 'Open Industrial Heaters',
        targetRoute: '/app/market?category=heaters',
      },
    };
  }

  // 3. Injection Molding Machines (Used or New) ("عايز ماكينة حقن مستعملة")
  if (
    q.includes('حقن') ||
    qRaw.includes('injection') ||
    q.includes('هايتيان') ||
    q.includes('انجل') ||
    (q.includes('ماكينه') && !q.includes('نفخ') && !q.includes('سحب') && !q.includes('فيلم'))
  ) {
    const wantsUsed =
      q.includes('مستعمل') || qRaw.includes('used') || q.includes('كسر زيرو');
    const targetRoute = wantsUsed
      ? '/app/market?category=injection_machines&condition=used'
      : '/app/market?category=injection_machines';

    return {
      replyAr: wantsUsed
        ? 'جهزت لك نتائج ماكينات الحقن المستعملة المضمونة في السوق الصناعي مع تطبيق فلتر (ماكينات حقن + مستعمل):'
        : 'إليك أحدث عروض ماكينات الحقن (الجديدة والمستعملة المضمونة) المتوفرة حالياً في السوق الصناعي:',
      replyEn: wantsUsed
        ? 'Here are the verified Used Injection Molding Machines in the Marketplace with the Used filter applied:'
        : 'Here are the latest Injection Molding Machines (new & verified used) available in the Marketplace:',
      followUpQuestionsAr: [
        'ماكينات حقن مستعملة بحالة ممتازة',
        'ماكينات حقن جديدة بالضمان',
        'تجار الماكينات والمعدات المستعملة',
      ],
      matchedItems: [
        {
          id: 'mkt-used-inj-1',
          titleAr: 'ماكينة حقن بلاستيك Haitian MA-2500 مستعملة بحالة ممتازة (250 طن)',
          titleEn: 'Used Haitian MA-2500 Injection Molding Machine (250 Ton)',
          subtitleAr: 'العاشر من رمضان، مصر · فحص هيدروليك وكنترول كامل · سيرفو موفر للطاقة',
          subtitleEn: '10th of Ramadan, Egypt · Full Servo Hydraulic Inspection',
          badgeAr: '18,500 USD · مستعمل ممتاز',
          badgeEn: '18,500 USD · Used Excellent',
          route: targetRoute,
        },
        {
          id: 'mkt-used-inj-2',
          titleAr: 'ماكينة حقن أوروبية Engel Victory 160 طن بدون أعمدة (Tie-Barless)',
          titleEn: 'Used Engel Victory 160T Tie-Barless Injection Machine',
          subtitleAr: 'برج العرب، الإسكندرية · حالة فنية ممتازة وجاهزة للتجربة',
          subtitleEn: 'Borg El Arab, Alexandria · Ready for live testing',
          badgeAr: '22,000 USD · مستعمل',
          badgeEn: '22,000 USD · Used',
          route: targetRoute,
        },
      ],
      recommendation: {
        categoryTitleAr: wantsUsed
          ? 'السوق الصناعي — ماكينات حقن مستعملة'
          : 'السوق الصناعي — ماكينات الحقن',
        categoryTitleEn: wantsUsed
          ? 'Marketplace — Used Injection Molding Machines'
          : 'Marketplace — Injection Molding Machines',
        descriptionAr: wantsUsed
          ? 'تصفح الماكينات المستعملة المفحوصة فنياً وتواصل مباشرة مع البائع أو المعرض.'
          : 'قارن بين ماكينات الحقن الجديدة والمستعملة مع الفحص الفني الكامل وبيانات البائع.',
        descriptionEn: wantsUsed
          ? 'Browse inspected used injection machines and contact the seller directly.'
          : 'Compare new and used injection molding machines with full specs.',
        buttonLabelAr: wantsUsed
          ? 'عرض ماكينات الحقن المستعملة'
          : 'افتح قسم ماكينات الحقن',
        buttonLabelEn: wantsUsed
          ? 'View Used Injection Machines'
          : 'Open Injection Machines',
        targetRoute,
      },
    };
  }

  // 4. Raw Materials & Masterbatch Suppliers ("عايز مورد خامة PP")
  if (
    q.includes('خام') ||
    q.includes('مورد') ||
    q.includes('سابك') ||
    q.includes('بوليمر') ||
    qRaw.includes('pp') ||
    qRaw.includes('hdpe') ||
    qRaw.includes('ldpe') ||
    qRaw.includes('pet') ||
    qRaw.includes('pvc') ||
    qRaw.includes('abs') ||
    q.includes('ماسترباتش') ||
    qRaw.includes('raw')
  ) {
    const detectedPolymer = qRaw.includes('pp')
      ? 'PP'
      : qRaw.includes('hdpe') || qRaw.includes('pe')
      ? 'PE'
      : qRaw.includes('pet')
      ? 'PET'
      : qRaw.includes('pvc')
      ? 'PVC'
      : qRaw.includes('abs')
      ? 'ABS'
      : '';
    const targetRoute = detectedPolymer
      ? `/app/suppliers?category=raw_materials&q=${encodeURIComponent(detectedPolymer)}`
      : '/app/suppliers?category=raw_materials';

    return {
      replyAr: detectedPolymer
        ? `تم تحديد موردي خامة ${detectedPolymer} المعتمدين في دليل الموردين والسوق الصناعي مع إمكانية طلب عرض سعر وعينات فورية:`
        : 'يمكنك الوصول فوراً إلى موردي الخامات الأساسية (PP, PE, PET, PVC, ABS) والماسترباتش أو إرسال طلب عرض سعر (RFQ) مباشر للموردين:',
      replyEn: detectedPolymer
        ? `Identified verified ${detectedPolymer} resin suppliers in the Suppliers Directory with instant RFQ and sample requests:`
        : 'Access verified polymer raw material & masterbatch suppliers or submit a direct RFQ:',
      followUpQuestionsAr: [
        'موردي خامة PP وسابك',
        'موردي الماسترباتش والألوان',
        'إرسال طلب عرض سعر خامات (RFQ)',
      ],
      matchedItems: [
        {
          id: 'sup-pp-1',
          titleAr: 'الشركة العربية لتوريد البوليمرات وخامات PP / PE (وكيل معتمد)',
          titleEn: 'Arabian Polymer Supply Co. — PP & PE Resins',
          subtitleAr: 'خامات PP حَقن وسحب ورافيا (SABIC / Borouge) مع شهادة التحليل COA',
          subtitleEn: 'PP Injection, Raffia & Film grades with official COA & TDS',
          badgeAr: 'خامات PP / PE متوفرة',
          badgeEn: 'PP / PE In Stock',
          route: targetRoute,
        },
        {
          id: 'mkt-pp-2',
          titleAr: 'خامات بولي بروبيلين (PP Homo & Copolymer) — توريد بالطن',
          titleEn: 'Polypropylene (PP Homo & Copolymer) — Bulk & Ton Supply',
          subtitleAr: 'العاشر من رمضان والرياض · متاح توريد محلي ودولي وعينات فنية',
          subtitleEn: '10th of Ramadan & Riyadh · Local/International supply & samples',
          badgeAr: '1,180 USD / طن',
          badgeEn: '1,180 USD / Ton',
          route: '/app/market?category=raw_materials&q=PP',
        },
      ],
      recommendation: {
        categoryTitleAr: detectedPolymer
          ? `دليل موردي الخامات — فلتر خامة ${detectedPolymer}`
          : 'الخامات الأساسية ودليل الموردين',
        categoryTitleEn: detectedPolymer
          ? `Raw Material Suppliers — ${detectedPolymer} Filter`
          : 'Raw Materials & Suppliers Directory',
        descriptionAr:
          'تصفح موردي الخامات المعتمدين واطلب عرض سعر رسمي أو داتا شيت وعينات.',
        descriptionEn:
          'Browse verified polymer suppliers and request an official quote, TDS, or samples.',
        buttonLabelAr: detectedPolymer
          ? `عرض موردي خامة ${detectedPolymer}`
          : 'افتح دليل موردي الخامات',
        buttonLabelEn: detectedPolymer
          ? `View ${detectedPolymer} Suppliers`
          : 'Open Raw Material Suppliers',
        targetRoute,
      },
    };
  }

  // 5. Chillers / Compressors / Dryers
  if (q.includes('شيلر') || q.includes('تبريد') || q.includes('كمبروس') || q.includes('مجفف') || q.includes('هوبر')) {
    return {
      replyAr:
        'قسم المعدات المساعدة يضم الشيلرات، الكمبروسرات، والمجففات الصناعية (الجديدة والمستعملة). إليك العروض المطابقة:',
      replyEn:
        'Our Auxiliary Equipment section covers chillers, compressors, and hopper dryers (new & used):',
      matchedItems: [
        {
          id: 'mkt-chiller-1',
          titleAr: 'شيلر تبريد مياه صناعي 20 طن تبريد لقوالب الحقن والنفخ',
          titleEn: '20-Ton Industrial Water Chiller for Injection & Blow Molds',
          subtitleAr: 'العاشر من رمضان · جاهز للتسليم الفوري مع الضمان',
          subtitleEn: '10th of Ramadan · Ready for immediate delivery with warranty',
          badgeAr: '4,200 USD',
          badgeEn: '4,200 USD',
          route: '/app/market?category=chillers',
        },
      ],
      recommendation: {
        categoryTitleAr: 'المعدات المساعدة — الشيلرات والمجففات والكمبروسرات',
        categoryTitleEn: 'Auxiliary — Chillers, Dryers & Compressors',
        descriptionAr:
          'وحدات تبريد مياه القوالب، ضواغط الهواء الحلزونية، ومجففات الخامات.',
        descriptionEn: 'Mold water chillers, screw compressors, and resin dryers.',
        buttonLabelAr: 'افتح قسم المعدات المساعدة',
        buttonLabelEn: 'Open Auxiliary Equipment',
        targetRoute: '/app/market?category=chillers',
      },
    };
  }

  // 6. Faults / الأعطال والصيانة
  if (q.includes('عطل') || q.includes('صيان') || q.includes('مشكله') || q.includes('عيوب') || qRaw.includes('fault')) {
    return {
      replyAr:
        'في مجتمع بلاستيكو للأعطال والصيانة يمكنك البحث في الحلول الفنية المجربة حسب نوع الماكينة والخامة أو طرح سؤالك على المهندسين والخبراء:',
      replyEn:
        'In the PLASTICO Technical Support Community you can search verified solutions by machine and polymer or post your issue:',
      recommendation: {
        categoryTitleAr: 'المجتمع الصناعي — الأعطال والصيانة',
        categoryTitleEn: 'Industrial Community — Faults & Maintenance',
        descriptionAr:
          'تشخيص أعطال الحقن والنفخ والسحب والهيدروليك والكنترول مع حلول معتمدة.',
        descriptionEn: 'Diagnose injection, blow, extrusion, hydraulic, and PLC issues.',
        buttonLabelAr: 'افتح قسم الأعطال والصيانة',
        buttonLabelEn: 'Open Faults & Maintenance',
        targetRoute: '/app/faults',
      },
    };
  }

  // 7. Academy / كورسات / تدريب
  if (q.includes('كورس') || q.includes('اكاديمي') || q.includes('تعلم') || q.includes('تدريب') || q.includes('شهاد')) {
    return {
      replyAr:
        'أكاديمية بلاستيكو تقدم مسارات تدريبية متخصصة في تشغيل ماكينات الحقن، تشخيص العيوب، القوالب، وعلم البوليمرات مع اختبارات وشهادات إتمام موثقة:',
      replyEn:
        'PLASTICO Academy offers specialized tracks in injection molding, defect troubleshooting, molds, and polymers with verified certificates:',
      recommendation: {
        categoryTitleAr: 'أكاديمية بلاستيكو — التدريب والشهادات',
        categoryTitleEn: 'PLASTICO Academy — Training & Certificates',
        descriptionAr:
          'ابدأ التعلم مجاناً وتابع تقدمك في الدروس للحصول على شهادة إتمام.',
        descriptionEn: 'Start learning, track your lesson progress, and earn your certificate.',
        buttonLabelAr: 'افتح أكاديمية بلاستيكو',
        buttonLabelEn: 'Open PLASTICO Academy',
        targetRoute: '/app/training',
      },
    };
  }

  // 8. Jobs / وظائف
  if (q.includes('وظيف') || q.includes('وظايف') || q.includes('عمل') || q.includes('شغل') || q.includes('توظيف') || q.includes('مهندس') || q.includes('فني')) {
    return {
      replyAr:
        'بوابة وظائف بلاستيكو تربط المهندسين، الفنيين، مشغلي الماكينات، ومراقبي الجودة بفرص العمل المباشرة في المصانع:',
      replyEn:
        'PLASTICO Jobs connects engineers, technicians, machine operators, and QC inspectors with direct factory openings:',
      recommendation: {
        categoryTitleAr: 'وظائف القطاع الصناعي',
        categoryTitleEn: 'Industrial Jobs Portal',
        descriptionAr:
          'تصفح الوظائف المتاحة للفنيين والمهندسين والعمال أو أنشئ ملفك المهني الكامل.',
        descriptionEn: 'Browse openings for technicians, engineers, and operators.',
        buttonLabelAr: 'افتح قسم الوظائف',
        buttonLabelEn: 'Open Jobs Section',
        targetRoute: '/app/jobs',
      },
    };
  }

  // 9. Exhibitions / معارض
  if (q.includes('معرض') || q.includes('معارض') || q.includes('مصنع') || q.includes('مصانع') || qRaw.includes('expo')) {
    return {
      replyAr:
        'المعارض الافتراضية للمصانع تتيح لك زيارة أجنحة المصانع، استعراض خطوط الإنتاج والمنتجات، والتواصل المباشر مع إدارات التشغيل:',
      replyEn:
        'Virtual Exhibitions let you visit factory booths, inspect production lines, and contact factory management directly:',
      recommendation: {
        categoryTitleAr: 'المعارض الافتراضية للمصانع',
        categoryTitleEn: 'Virtual Factory Exhibitions',
        descriptionAr:
          'تصفح أجنحة المصانع المشاركة حسب الدولة والتخصص الصناعي.',
        descriptionEn: 'Explore participating factory booths by country and specialty.',
        buttonLabelAr: 'افتح المعارض الافتراضية',
        buttonLabelEn: 'Open Virtual Exhibitions',
        targetRoute: '/app/expo',
      },
    };
  }

  return {
    replyAr:
      'مرحباً بك في مساعد بلاستيكو الذكي! أخبرني ماذا تبحث عنه اليوم (مثال: "عايز سخانات صناعية"، "عايز ماكينة حقن مستعملة"، "عايز مورد خامة PP"، أو "عايز مصنع يصنع لي منتج") وسأنفذ البحث وأوجهك للنتائج مباشرة.',
    replyEn:
      'Welcome to the PLASTICO Smart Assistant! Tell me what you need (e.g., "industrial heaters", "used injection machine", "PP resin supplier", or "factory to manufacture my product") and I will find matching results directly.',
    followUpQuestionsAr: [
      'عايز سخانات صناعية',
      'عايز ماكينة حقن مستعملة',
      'عايز مورد خامة PP',
      'عايز مصنع يصنع لي منتج',
    ],
    recommendation: {
      categoryTitleAr: 'السوق الصناعي المتكامل',
      categoryTitleEn: 'Integrated Industrial Marketplace',
      descriptionAr: 'تصفح الخامات، الماكينات الجديدة والمستعملة، والمعدات المساعدة.',
      descriptionEn: 'Explore raw materials, new & used machinery, and auxiliary equipment.',
      buttonLabelAr: 'استكشف السوق الصناعي',
      buttonLabelEn: 'Explore Industrial Market',
      targetRoute: '/app/market',
    },
  };
}

