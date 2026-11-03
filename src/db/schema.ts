import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').default(''),
  accountType: text('account_type').default('engineer'),
  city: text('city').default('العاشر من رمضان'),
  passwordHash: text('password_hash'),
  passwordSalt: text('password_salt'),
  country: text('country').default('مصر'),
  specialty: text('specialty').default(''),
  bio: text('bio').default(''),
  phone: text('phone').default(''),
  companyName: text('company_name').default(''),
  verified: boolean('verified').default(false),
  profileCompleted: boolean('profile_completed').default(false),
  skillsJson: text('skills_json').default('[]'),
  experienceYears: integer('experience_years').default(0),
  education: text('education').default(''),
  workPreferences: text('work_preferences').default(''),
  avatarUrl: text('avatar_url').default(''),
  jobTitle: text('job_title').default(''),
  machinesJson: text('machines_json').default('[]'),
  experiencesJson: text('experiences_json').default('[]'),
  certificatesJson: text('certificates_json').default('[]'),
  contactPrefsJson: text('contact_prefs_json').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const authSessions = pgTable('auth_sessions', {
  id: serial('id').primaryKey(),
  tokenHash: text('token_hash').notNull().unique(),
  csrfToken: text('csrf_token').notNull(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  rememberMe: boolean('remember_me').default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rfqRecords = pgTable('rfq_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  referenceCode: text('reference_code').notNull(),
  titleAr: text('title_ar').notNull(),
  processId: text('process_id').notNull(),
  material: text('material').notNull(),
  quantity: integer('quantity').notNull(),
  city: text('city').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const googleFormsLinks = pgTable('google_forms_links', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  formId: text('form_id').notNull(),
  title: text('title').notNull(),
  responderUri: text('responder_uri').notNull(),
  purposeAr: text('purpose_ar').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const marketplaceListings = pgTable('marketplace_listings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').default(''),
  category: text('category').notNull(),
  isUsed: boolean('is_used').default(false),
  conditionCode: text('condition_code').default('new'),
  manufacturer: text('manufacturer').default(''),
  model: text('model').default(''),
  year: integer('year').default(2025),
  price: integer('price').notNull(),
  currency: text('currency').default('USD'),
  city: text('city').default('العاشر من رمضان'),
  country: text('country').default('مصر'),
  descriptionAr: text('description_ar').default(''),
  specsJson: text('specs_json').default('{}'),
  image: text('image').default('/assets/aistudio/Meta_AI_876711241_1165794242468368_1352144977164666078_n_20261101_133109.webp_7686cffc.jpg'),
  imagesJson: text('images_json').default('[]'),
  sellerNameAr: text('seller_name_ar').default(''),
  sellerPhone: text('seller_phone').default(''),
  isSample: boolean('is_sample').default(false),
  reportedCount: integer('reported_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const suppliersDirectory = pgTable('suppliers_directory', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  companyNameAr: text('company_name_ar').notNull(),
  companyNameEn: text('company_name_en').default(''),
  logo: text('logo').default('/assets/aistudio/Meta_AI_884732422_976269862224828_8616113646332940793_n_20261101_134540.webp_6dac747d.jpg'),
  country: text('country').default('مصر'),
  city: text('city').default('العاشر من رمضان'),
  supplierType: text('supplier_type').default('raw_materials'),
  categoriesJson: text('categories_json').default('[]'),
  productsServicesAr: text('products_services_ar').default(''),
  brandsSupplied: text('brands_supplied').default(''),
  contactPhone: text('contact_phone').default(''),
  contactEmail: text('contact_email').default(''),
  descriptionAr: text('description_ar').default(''),
  isVerified: boolean('is_verified').default(false),
  isSample: boolean('is_sample').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const supplierRfqs = pgTable('supplier_rfqs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  supplierId: text('supplier_id').notNull(),
  supplierNameAr: text('supplier_name_ar').default(''),
  category: text('category').notNull(),
  productName: text('product_name').notNull(),
  material: text('material').default(''),
  quantity: integer('quantity').notNull(),
  unit: text('unit').default('طن'),
  city: text('city').default('العاشر من رمضان'),
  details: text('details').default(''),
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  status: text('status').default('pending_quote'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const academyProgress = pgTable('academy_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  courseId: text('course_id').notNull(),
  completedLessonsJson: text('completed_lessons_json').default('[]'),
  quizScore: integer('quiz_score').default(0),
  certificateCode: text('certificate_code').default(''),
  issuedAt: timestamp('issued_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const savedItems = pgTable('saved_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  itemType: text('item_type').notNull(),
  itemId: text('item_id').notNull(),
  titleAr: text('title_ar').notNull(),
  route: text('route').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userFollows = pgTable('user_follows', {
  id: serial('id').primaryKey(),
  followerId: integer('follower_id')
    .references(() => users.id)
    .notNull(),
  targetId: text('target_id').notNull(),
  targetType: text('target_type').default('user').notNull(),
  targetNameAr: text('target_name_ar').default(''),
  targetRoleAr: text('target_role_ar').default(''),
  targetAvatar: text('target_avatar').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const itemLikes = pgTable('item_likes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  itemType: text('item_type').notNull(),
  itemId: text('item_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  participantOneId: integer('participant_one_id')
    .references(() => users.id)
    .notNull(),
  participantTwoId: integer('participant_two_id'),
  targetKey: text('target_key').notNull(),
  targetNameAr: text('target_name_ar').notNull(),
  targetRoleAr: text('target_role_ar').default(''),
  targetAvatar: text('target_avatar').default(''),
  contextType: text('context_type').default('general'),
  contextId: text('context_id').default(''),
  contextTitleAr: text('context_title_ar').default(''),
  lastMessageText: text('last_message_text').default(''),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id')
    .references(() => conversations.id)
    .notNull(),
  senderId: integer('sender_id')
    .references(() => users.id)
    .notNull(),
  senderName: text('sender_name').default(''),
  content: text('content').notNull(),
  attachmentUrl: text('attachment_url').default(''),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const verificationRequests = pgTable('verification_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  companyName: text('company_name').default(''),
  role: text('role').default('factory'),
  documentType: text('document_type').default('سجل تجاري وبطاقة ضريبية'),
  documentUrl: text('document_url').default(''),
  notes: text('notes').default(''),
  status: text('status').default('pending'),
  rejectionReason: text('rejection_reason').default(''),
  reviewedBy: integer('reviewed_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const jobApplications = pgTable('job_applications', {
  id: serial('id').primaryKey(),
  jobId: text('job_id').notNull(),
  jobTitleAr: text('job_title_ar').notNull(),
  companyNameAr: text('company_name_ar').notNull(),
  applicantUserId: integer('applicant_user_id').notNull(),
  applicantName: text('applicant_name').notNull(),
  applicantRole: text('applicant_role').default('technician'),
  applicantPhone: text('applicant_phone').default(''),
  applicantEmail: text('applicant_email').default(''),
  cvFileName: text('cv_file_name').default(''),
  cvUrl: text('cv_url').default(''),
  coverNote: text('cover_note').default(''),
  status: text('status').default('received'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const platformReports = pgTable('platform_reports', {
  id: serial('id').primaryKey(),
  reporterUserId: integer('reporter_user_id'),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  targetTitleAr: text('target_title_ar').default(''),
  reason: text('reason').notNull(),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const systemAnnouncements = pgTable('system_announcements', {
  id: serial('id').primaryKey(),
  adminUserId: integer('admin_user_id'),
  titleAr: text('title_ar').notNull(),
  bodyAr: text('body_ar').notNull(),
  targetRole: text('target_role').default('all'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const itemComments = pgTable('item_comments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').default('engineer'),
  authorAvatar: text('author_avatar').default(''),
  itemType: text('item_type').notNull(),
  itemId: text('item_id').notNull(),
  parentId: integer('parent_id'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userNotifications = pgTable('user_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  type: text('type').default('general').notNull(),
  titleAr: text('title_ar').notNull(),
  titleEn: text('title_en').default(''),
  bodyAr: text('body_ar').notNull(),
  bodyEn: text('body_en').default(''),
  link: text('link').default('/app/notifications').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userBlocks = pgTable('user_blocks', {
  id: serial('id').primaryKey(),
  blockerUserId: integer('blocker_user_id')
    .references(() => users.id)
    .notNull(),
  blockedTargetId: text('blocked_target_id').notNull(),
  blockedNameAr: text('blocked_name_ar').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  rfqs: many(rfqRecords),
  forms: many(googleFormsLinks),
  sessions: many(authSessions),
  listings: many(marketplaceListings),
  academy: many(academyProgress),
  saved: many(savedItems),
  follows: many(userFollows),
  likes: many(itemLikes),
}));

export const rfqRecordsRelations = relations(rfqRecords, ({ one }) => ({
  author: one(users, {
    fields: [rfqRecords.userId],
    references: [users.id],
  }),
}));

export const googleFormsLinksRelations = relations(googleFormsLinks, ({ one }) => ({
  author: one(users, {
    fields: [googleFormsLinks.userId],
    references: [users.id],
  }),
}));


