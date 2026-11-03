import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Eye,
  LogOut,
  ClipboardList,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  getIdTokenInMemory,
  logoutGoogle,
  FirebaseUser,
} from '../firebase';
import { Sticker3D } from './Sticker3D';
import { usePlastico } from '../context/PlasticoContext';

interface DriveFormItem {
  id: string;
  name: string;
  webViewLink?: string;
  modifiedTime?: string;
}

interface FormDetails {
  formId: string;
  info?: {
    title?: string;
    documentTitle?: string;
    description?: string;
  };
  responderUri?: string;
  items?: {
    itemId?: string;
    title?: string;
    description?: string;
  }[];
}

interface SavedFormLink {
  id: number;
  formId: string;
  title: string;
  responderUri: string;
  purposeAr: string;
}

export const GoogleFormsIntegrationPanel: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  const { t, showToast } = usePlastico();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [driveForms, setDriveForms] = useState<DriveFormItem[]>([]);
  const [savedSqlForms, setSavedSqlForms] = useState<SavedFormLink[]>([]);
  const [selectedForm, setSelectedForm] = useState<FormDetails | null>(null);
  const [responsesCount, setResponsesCount] = useState<number>(0);
  const [customFormId, setCustomFormId] = useState<string>('');
  const [newFormTitle, setNewFormTitle] = useState<string>(
    'نموذج استبيان مواصفات طلب تصنيع وفحص جودة (PLASTICO RFQ)'
  );
  const [newFormPurpose, setNewFormPurpose] = useState<string>(
    'استلام مواصفات الخامة والكمية وفحص القالب من العملاء'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Explicit confirmation dialog state for mutating/destructive operations
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'create_form' | 'delete_link';
    title: string;
    description: string;
    targetId?: number;
  } | null>(null);

  const loadWorkspaceAndSqlForms = useCallback(async (accessToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. List Google Forms from Google Drive API
      const driveRes = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.form'%20and%20trashed=false&pageSize=10&fields=files(id,name,webViewLink,modifiedTime)",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (driveRes.ok) {
        const driveData = await driveRes.json();
        setDriveForms(driveData.files || []);
      }

      // 2. Sync with Cloud SQL backend if ID token is available
      const idToken = await getIdTokenInMemory();
      if (idToken) {
        await fetch('/api/me', {
          headers: { Authorization: `Bearer ${idToken}` },
        }).catch(() => null);

        const sqlRes = await fetch('/api/forms-links', {
          headers: { Authorization: `Bearer ${idToken}` },
        }).catch(() => null);

        if (sqlRes && sqlRes.ok) {
          const sqlData = await sqlRes.json();
          setSavedSqlForms(sqlData.forms || []);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر تحميل نماذج Google Forms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = initAuth(
      (firebaseUser, accessToken) => {
        setUser(firebaseUser);
        if (accessToken) {
          setToken(accessToken);
          setNeedsAuth(false);
          void loadWorkspaceAndSqlForms(accessToken);
        } else {
          setNeedsAuth(true);
        }
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsub();
  }, [loadWorkspaceAndSqlForms]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        showToast(
          'تم ربط حساب Google Forms وقاعدة البيانات السحابية بنجاح!',
          'Connected to Google Forms & Cloud Database!'
        );
        await loadWorkspaceAndSqlForms(result.accessToken);
      }
    } catch (err: any) {
      setErrorMsg(
        t(
          'تعذر تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.',
          'Google Sign-In failed. Please try again.'
        )
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInspectForm = async (formIdInput: string) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }
    const trimmed = formIdInput.trim();
    if (!trimmed) return;
    const safeFormId = encodeURIComponent(trimmed);
    setLoading(true);
    setErrorMsg(null);
    try {
      const formRes = await fetch(
        `https://forms.googleapis.com/v1/forms/${safeFormId}`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );
      if (!formRes.ok) {
        throw new Error('لم يتم العثور على النموذج أو لا تملك صلاحية الوصول إليه.');
      }
      const formData: FormDetails = await formRes.json();
      setSelectedForm(formData);

      const respRes = await fetch(
        `https://forms.googleapis.com/v1/forms/${safeFormId}/responses`,
        {
          headers: { Authorization: `Bearer ${activeToken}` },
        }
      );
      if (respRes.ok) {
        const respData = await respRes.json();
        setResponsesCount((respData.responses || []).length);
      } else {
        setResponsesCount(0);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'حدث خطأ أثناء قراءة بيانات النموذج');
    } finally {
      setLoading(false);
    }
  };

  const executeConfirmedCreateForm = async () => {
    setConfirmDialog(null);
    const activeToken = token || (await getAccessToken());
    if (!activeToken) {
      setNeedsAuth(true);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Create the Google Form
      const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          info: {
            title: newFormTitle.trim() || 'نموذج طلب تصنيع بلاستيكو (PLASTICO RFQ)',
            documentTitle: newFormTitle.trim() || 'PLASTICO Industrial RFQ Form',
          },
        }),
      });
      if (!createRes.ok) {
        throw new Error('تعذر إنشاء النموذج في Google Forms.');
      }
      const createdForm: FormDetails = await createRes.json();
      const safeFormId = encodeURIComponent(createdForm.formId);

      // 2. Add industrial plastic manufacturing questions via batchUpdate
      await fetch(
        `https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                updateFormInfo: {
                  info: {
                    description:
                      'نموذج رسمي مُنشأ عبر منصة PLASTICO لاستقبال مواصفات التصنيع وفحص جودة المنتجات البلاستيكية.',
                  },
                  updateMask: 'description',
                },
              },
              {
                createItem: {
                  item: {
                    title: 'نوع عملية التصنيع والخامة المطلوبة (PP / HDPE / PET / ABS)',
                    questionItem: {
                      question: {
                        required: true,
                        textQuestion: { paragraph: false },
                      },
                    },
                  },
                  location: { index: 0 },
                },
              },
              {
                createItem: {
                  item: {
                    title: 'الكمية المطلوبة للإنتاج والوزن التقريبي للقطعة (جرام)',
                    questionItem: {
                      question: {
                        required: true,
                        textQuestion: { paragraph: false },
                      },
                    },
                  },
                  location: { index: 1 },
                },
              },
            ],
          }),
        }
      );

      // 3. Save link in Cloud SQL if authenticated
      const idToken = await getIdTokenInMemory();
      if (idToken) {
        await fetch('/api/forms-links', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId: createdForm.formId,
            title: newFormTitle.trim(),
            responderUri:
              createdForm.responderUri ||
              `https://docs.google.com/forms/d/${createdForm.formId}/ edit`,
            purposeAr: newFormPurpose.trim(),
          }),
        }).catch(() => null);
      }

      showToast(
        'تم إنشاء نموذج Google Forms الصناعي وحفظه بنجاح!',
        'Created industrial Google Form successfully!'
      );
      await handleInspectForm(createdForm.formId);
      await loadWorkspaceAndSqlForms(activeToken);
    } catch (err: any) {
      setErrorMsg(err?.message || 'تعذر إنشاء النموذج');
    } finally {
      setLoading(false);
    }
  };

  const executeConfirmedDeleteLink = async (recordId: number) => {
    setConfirmDialog(null);
    const idToken = await getIdTokenInMemory();
    if (!idToken) return;
    try {
      const res = await fetch(`/api/forms-links/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        setSavedSqlForms((prev) => prev.filter((item) => item.id !== recordId));
        showToast('تم حذف رابط النموذج من السجل', 'Removed form link from list');
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="card-3d p-5 sm:p-6 bg-white relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-center shrink-0">
            <Sticker3D id="rfq" size="sm" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#1D6BF3] text-[11px] font-bold mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Forms & Drive Integration</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#0B2A5B]">
              {t(
                'نماذج Google Forms الصناعية لطلبات التصنيع والاستبيانات',
                'Industrial Google Forms for RFQs & Quality Surveys'
              )}
            </h3>
            <p className="text-xs text-[#475569]">
              {t(
                'أنشئ واربط نماذج Google Forms مباشرة لاستقبال مواصفات التصنيع وفحص جودة القوالب والردود من العملاء.',
                'Create and connect Google Forms directly to collect RFQ specs, mold inspections, and client responses.'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {needsAuth ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#1f1f1f] text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <div className="gsi-material-button-icon w-4 h-4 shrink-0">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
              </div>
              <span className="gsi-material-button-contents">
                {isLoggingIn
                  ? t('جاري الاتصال...', 'Signing in...')
                  : t('Sign in with Google', 'Sign in with Google')}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {user?.email || t('متصل بحساب Google', 'Google Connected')}
              </span>
              <button
                type="button"
                onClick={() => token && loadWorkspaceAndSqlForms(token)}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                title={t('تحديث النماذج', 'Refresh Forms')}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logoutGoogle();
                  setNeedsAuth(true);
                  setToken(null);
                }}
                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50"
                title={t('تسجيل الخروج من Google', 'Sign out from Google')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!needsAuth && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Create or Load a Google Form */}
          <div className="space-y-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-sm font-extrabold text-[#0B2A5B] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#1D6BF3]" />
              {t(
                'إنشاء نموذج Google Form صناعي جديد',
                'Create New Industrial Google Form'
              )}
            </h4>
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-[#0B2A5B] mb-1">
                  {t('عنوان النموذج في Google Forms', 'Form Title')}
                </label>
                <input
                  type="text"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs input-3d"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0B2A5B] mb-1">
                  {t('الغرض الصناعي (يُحفظ في سجل المصنع)', 'Industrial Purpose')}
                </label>
                <input
                  type="text"
                  value={newFormPurpose}
                  onChange={(e) => setNewFormPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs input-3d"
                />
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    type: 'create_form',
                    title: t(
                      'تأكيد إنشاء نموذج جديد في Google Forms',
                      'Confirm Creating New Google Form'
                    ),
                    description: t(
                      `هل أنت متأكد من إنشاء النموذج "${newFormTitle}" وإضافة أسئلة مواصفات التصنيع داخل حسابك في Google Forms؟`,
                      `Are you sure you want to create "${newFormTitle}" in your Google Forms account?`
                    ),
                  })
                }
                className="w-full py-2.5 px-4 rounded-xl btn-3d-blue text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {t(
                  'إنشاء النموذج في Google Forms الآن',
                  'Create Form in Google Forms'
                )}
              </button>
            </div>

            {!compact && (
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-[#0B2A5B]">
                  {t('أو استعراض نموذج موجود بواسطة Form ID', 'Or Load Existing Form by ID')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFormId}
                    onChange={(e) => setCustomFormId(e.target.value)}
                    placeholder="e.g. 1FAIpQLSe..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs input-3d"
                  />
                  <button
                    type="button"
                    onClick={() => handleInspectForm(customFormId)}
                    className="px-3.5 py-2 rounded-xl bg-[#0B2A5B] text-white text-xs font-bold hover:bg-[#1D6BF3] transition-colors"
                  >
                    {t('فحص النموذج', 'Load Form')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Existing Drive Forms & Selected Form Details */}
          <div className="space-y-4">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
              <h4 className="text-sm font-extrabold text-[#0B2A5B] mb-2.5 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#10B981]" />
                {t(
                  'نماذج Google Forms المرتبطة بحسابك',
                  'Your Connected Google Forms'
                )}
              </h4>
              {driveForms.length === 0 && savedSqlForms.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">
                  {t(
                    'لا توجد نماذج محفوظة بعد. يمكنك إنشاء نموذج طلب تصنيع جديد بضغطة واحدة.',
                    'No forms found yet. Create an industrial RFQ Google Form in one click.'
                  )}
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {driveForms.map((df) => (
                    <div
                      key={df.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#0B2A5B] truncate">{df.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          ID: {df.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleInspectForm(df.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#1D6BF3] font-bold hover:bg-blue-100 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {t('الردود والأسئلة', 'Inspect')}
                        </button>
                        {df.webViewLink && (
                          <a
                            href={df.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {savedSqlForms.map((sf) => (
                    <div
                      key={`sql-${sf.id}`}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-[#0B2A5B] truncate">{sf.title}</p>
                        <p className="text-[11px] text-emerald-700 truncate">
                          {sf.purposeAr}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleInspectForm(sf.formId)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 font-bold"
                        >
                          {t('عرض', 'View')}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: 'delete_link',
                              targetId: sf.id,
                              title: t('تأكيد حذف رابط النموذج', 'Confirm Removing Form Link'),
                              description: t(
                                `هل تريد إزالة النموذج "${sf.title}" من قائمة النماذج الصناعية المرتبطة؟`,
                                `Are you sure you want to remove "${sf.title}" from linked forms?`
                              ),
                            })
                          }
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedForm && (
              <div className="p-4 rounded-2xl bg-[#071936] text-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-emerald-400">
                    {selectedForm.info?.title || 'Google Form'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-bold">
                    {responsesCount} {t('رد مستلم', 'Responses')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {t('عدد الأسئلة المسجلة:', 'Questions count:')}{' '}
                  {(selectedForm.items || []).length}
                </p>
                {selectedForm.responderUri && (
                  <a
                    href={selectedForm.responderUri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('فتح رابط تعبئة النموذج للعملاء', 'Open Responder Link')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Mutating/Destructive Workspace Actions */}
      {confirmDialog?.open && (
        <div className="fixed inset-0 z-50 bg-[#071936]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-3d max-w-md w-full bg-white p-6 space-y-4">
            <h4 className="text-base font-extrabold text-[#0B2A5B]">
              {confirmDialog.title}
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.type === 'create_form') {
                    void executeConfirmedCreateForm();
                  } else if (
                    confirmDialog.type === 'delete_link' &&
                    typeof confirmDialog.targetId === 'number'
                  ) {
                    void executeConfirmedDeleteLink(confirmDialog.targetId);
                  }
                }}
                className="px-4 py-2 rounded-xl btn-3d-primary text-xs font-bold"
              >
                {t('تأكيد التنفيذ', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
