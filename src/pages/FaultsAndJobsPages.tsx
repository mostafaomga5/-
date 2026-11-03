import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  Plus,
  Bookmark,
  SlidersHorizontal,
  X,
  Send,
  Wrench,
  Briefcase,
  Search,
  MapPin,
  ShieldCheck,
  Heart,
  UserPlus,
  UserCheck,
  Maximize2,
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';
import { IMAGE_MANIFEST } from '../data/imageManifest';
import { validateIndustrialAttachment } from '../lib/domainRules';

/* ============================================================================
   Industrial Community & Technical Troubleshooting (/app/faults & /app/faults/:id)
   ============================================================================ */
export const FaultsListPage: React.FC = () => {
  const {
    t,
    faults,
    createFault,
    addFaultSolution,
    upvoteFaultSolution,
    acceptFaultSolution,
    savedIds,
    toggleSavedItem,
    isLiked,
    getLikeCount,
    toggleLike,
    isFollowing,
    toggleFollow,
    startOrOpenConversation,
    openLightbox,
    guardVisitorAction,
  } = usePlastico();
  const navigate = useNavigate();
  const [machineFilter, setMachineFilter] = useState('all');
  const [statusTab, setStatusTab] = useState<'latest' | 'most_active' | 'solved' | 'needs_expert'>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyFaultId, setReplyFaultId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New Fault Form State
  const [titleAr, setTitleAr] = useState('');
  const [machineType, setMachineType] = useState('ماكينة حقن');
  const [machineBrandModel, setMachineBrandModel] = useState('Haitian MA-2500');
  const [polymerMaterial, setPolymerMaterial] = useState('PP / HDPE');
  const [operatingConditions, setOperatingConditions] = useState('');
  const [previousAttempts, setPreviousAttempts] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    sizeBytes: number;
    category: 'image' | 'video' | 'document';
    previewUrl?: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentError(null);
    const category = file.type.startsWith('video/') ? 'video' : 'image';
    const check = validateIndustrialAttachment({
      name: file.name,
      sizeBytes: file.size,
      category,
    });
    if (!check.valid) {
      setAttachmentError(check.errorAr || 'ملف غير مدعوم.');
      setAttachedFile(null);
      setUploadProgress(0);
      return;
    }
    setUploadProgress(25);
    if (category === 'image') {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 960;
          let { width, height } = img;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height >= width && height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = ctx
            ? canvas.toDataURL('image/jpeg', 0.82)
            : String(reader.result);
          setUploadProgress(100);
          setAttachedFile({
            name: file.name,
            sizeBytes: file.size,
            category,
            previewUrl: dataUrl,
          });
        };
        img.onerror = () => {
          setUploadProgress(100);
          setAttachedFile({
            name: file.name,
            sizeBytes: file.size,
            category,
            previewUrl: String(reader.result),
          });
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setTimeout(() => {
        setUploadProgress(100);
        setAttachedFile({
          name: file.name,
          sizeBytes: file.size,
          category,
        });
      }, 200);
    }
  };

  const filteredFaults = faults
    .filter((f) => {
      if (machineFilter === 'injection' && !f.machineType.includes('حقن')) return false;
      if (machineFilter === 'blow' && !f.machineType.includes('نفخ')) return false;
      if (
        machineFilter === 'extrusion' &&
        !f.machineType.includes('سحب') &&
        !f.machineType.includes('فيلم')
      )
        return false;
      if (
        machineFilter === 'molds' &&
        !f.machineType.includes('قالب') &&
        !f.machineType.includes('اسطمب')
      )
        return false;
      if (statusTab === 'solved') {
        const solved = f.status === 'solved' || f.solutions.some((s) => s.isAccepted);
        if (!solved) return false;
      }
      if (statusTab === 'needs_expert') {
        const solved = f.status === 'solved' || f.solutions.some((s) => s.isAccepted);
        if (solved) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          f.titleAr.toLowerCase().includes(q) ||
          f.descriptionAr.toLowerCase().includes(q) ||
          f.machineType.toLowerCase().includes(q) ||
          f.polymerMaterial.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular' || statusTab === 'most_active') {
        return b.solutions.length - a.solutions.length;
      }
      return 0;
    });

  const handleCreateFault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !descriptionAr.trim()) return;
    const enrichedDesc = [
      descriptionAr.trim(),
      machineBrandModel.trim() ? `الماركة والموديل: ${machineBrandModel.trim()}` : '',
      operatingConditions.trim() ? `ظروف التشغيل: ${operatingConditions.trim()}` : '',
      previousAttempts.trim() ? `المحاولات السابقة للإصلاح: ${previousAttempts.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' — ');

    createFault({
      titleAr,
      titleEn: titleAr,
      machineType: machineBrandModel.trim()
        ? `${machineType} (${machineBrandModel.trim()})`
        : machineType,
      polymerMaterial,
      descriptionAr: enrichedDesc,
      descriptionEn: enrichedDesc,
      symptoms: ['تشخيص فني صناعي', machineType, polymerMaterial],
      image: attachedFile?.previewUrl,
      images: attachedFile?.previewUrl ? [attachedFile.previewUrl] : undefined,
    });
    setTitleAr('');
    setDescriptionAr('');
    setOperatingConditions('');
    setPreviousAttempts('');
    setAttachedFile(null);
    setUploadProgress(0);
    setShowNewModal(false);
  };

  const handleAddSolution = (faultId: string) => {
    if (!replyText.trim()) return;
    addFaultSolution(faultId, replyText, 'خطوات فحص ومعالجة مقترحة من المجتمع الصناعي.');
    setReplyText('');
    setReplyFaultId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1769E8]/20 border border-[#27BED6]/30 text-[#27BED6] text-xs font-bold">
            <Wrench className="w-3.5 h-3.5" />
            <span>
              {t(
                'المجتمع الصناعي وحلول الأعطال',
                'Industrial Community & Troubleshooting'
              )}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            {t(
              'شارك أعطال الماكينات والقوالب والخامات واحصل على حلول الخبراء',
              'Share Machine, Mold & Material Issues for Expert Solutions'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {t(
              'نظم استفسارك حسب نوع الماكينة، الخامة البوليمرية، والتخصص الهندسي، وحدد أفضل إجابة لتوثيق المعرفة الفنية.',
              'Organize questions by machine type, polymer material, and specialty, and mark verified solutions.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!guardVisitorAction('نشر عطل أو سؤال فني')) return;
            setShowNewModal(true);
          }}
          className="px-5 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#e8791d] text-white text-xs sm:text-sm font-black shrink-0 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('نشر عطل أو سؤال فني', 'Post Technical Issue')}</span>
        </button>
      </div>

      {/* Search & Machine Category Filter Pills */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#718096] absolute top-1/2 -translate-y-1/2 start-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'ابحث بنوع الماكينة، الخامة (PP, HDPE, PET)، أو وصف العطل...',
                'Search by machine, material, or symptom...'
              )}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm text-[#13243B] focus:outline-none focus:border-[#1769E8]"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#F4F7FC] p-1 rounded-xl border border-[#DFE7F1] shrink-0">
            <button
              type="button"
              onClick={() => setSortBy('latest')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                sortBy === 'latest' ? 'bg-[#071A33] text-white' : 'text-[#718096]'
              }`}
            >
              {t('الأحدث', 'Latest')}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('popular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer ${
                sortBy === 'popular' ? 'bg-[#071A33] text-white' : 'text-[#718096]'
              }`}
            >
              {t('الأكثر حلولاً', 'Most Answered')}
            </button>
          </div>
        </div>

        {/* 4 Required Fault Community Tabs (Section 7) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#DFE7F1]">
          {[
            { id: 'latest', labelAr: 'أحدث الأعطال', labelEn: 'Latest Faults' },
            { id: 'most_active', labelAr: 'الأعطال الأكثر تفاعلًا', labelEn: 'Most Active' },
            { id: 'solved', labelAr: 'أعطال تم حلها ✓', labelEn: 'Solved Faults' },
            { id: 'needs_expert', labelAr: 'أسئلة تحتاج إلى خبرة', labelEn: 'Needs Expert' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusTab(st.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors cursor-pointer ${
                statusTab === st.id
                  ? 'bg-[#071A33] text-white'
                  : 'bg-[#F4F7FC] text-[#4A5568] hover:text-[#071A33]'
              }`}
            >
              {t(st.labelAr, st.labelEn)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', labelAr: 'كل العمليات والماكينات', labelEn: 'All Processes' },
            { id: 'injection', labelAr: 'ماكينات الحقن (Injection)', labelEn: 'Injection Molding' },
            { id: 'blow', labelAr: 'ماكينات النفخ (Blow)', labelEn: 'Blow Molding' },
            { id: 'extrusion', labelAr: 'خطوط السحب والفيلم (Extrusion & Film)', labelEn: 'Extrusion & Film' },
            { id: 'molds', labelAr: 'الاسطمبات والقوالب (Molds)', labelEn: 'Molds & Tooling' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMachineFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                machineFilter === tab.id
                  ? 'bg-[#1769E8] text-white shadow-xs'
                  : 'bg-[#F4F7FC] text-[#13243B] border border-[#DFE7F1] hover:border-[#1769E8]'
              }`}
            >
              {t(tab.labelAr, tab.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Fault Discussion Cards */}
      <div className="space-y-4">
        {filteredFaults.map((fault) => {
          const topSolution =
            fault.solutions.find((s) => s.isAccepted) || fault.solutions[0];
          const isSolved =
            fault.status === 'solved' || fault.solutions.some((s) => s.isAccepted);
          const authorKey = fault.publisherId || `author-${fault.id}`;
          const authorAvatar =
            fault.publisherAvatar || IMAGE_MANIFEST.profiles.engineer;
          const followingAuthor = isFollowing(authorKey);
          const liked = isLiked('fault', fault.id);
          const likeCount = getLikeCount('fault', fault.id, fault.likesCount || 14);
          const isSaved = savedIds.includes(fault.id);

          return (
            <div
              key={fault.id}
              className="bg-white rounded-3xl border border-[#DFE7F1] p-5 sm:p-6 space-y-4 shadow-xs"
            >
              {/* Author & Machine/Material Tags */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/app/profile/${encodeURIComponent(authorKey)}`}
                    className="shrink-0"
                  >
                    <img
                      src={authorAvatar}
                      alt={fault.authorName}
                      className="w-11 h-11 rounded-full object-cover border border-[#DFE7F1] hover:border-[#1769E8] transition-colors"
                    />
                  </Link>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/app/profile/${encodeURIComponent(authorKey)}`}
                        className="text-sm font-black text-[#13243B] hover:text-[#1769E8] transition-colors"
                      >
                        {fault.authorName}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          void toggleFollow({
                            targetId: authorKey,
                            targetType: 'engineer',
                            targetNameAr: fault.authorName,
                            targetRoleAr: fault.publisherRoleAr,
                            targetAvatar: authorAvatar,
                          })
                        }
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${
                          followingAuthor
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-[#F4F7FC] text-[#1769E8]'
                        }`}
                      >
                        {followingAuthor ? t('✓ متابَع', '✓ Following') : t('+ متابعة', '+ Follow')}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const cid = await startOrOpenConversation({
                            targetKey: authorKey,
                            targetNameAr: fault.authorName,
                            targetRoleAr: fault.publisherRoleAr,
                            targetAvatar: authorAvatar,
                            contextType: 'fault',
                            contextId: fault.id,
                            contextTitleAr: fault.titleAr,
                          });
                          if (cid) navigate(`/app/messages?convId=${cid}`);
                        }}
                        className="p-1.5 rounded-lg bg-[#F4F7FC] hover:bg-blue-50 text-[#1769E8] cursor-pointer"
                        title={t('مراسلة المهندس', 'Message Author')}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-[#718096] font-medium">
                      {fault.authorRoleLabel} · {fault.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-[#1769E8] border border-blue-200 text-xs font-extrabold">
                    {fault.machineType}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 text-[#13243B] text-xs font-extrabold">
                    {fault.polymerMaterial}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold ${
                      isSolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isSolved
                      ? t('تم الحل ✓', 'Solved ✓')
                      : t('قيد النقاش', 'Open Discussion')}
                  </span>
                </div>
              </div>

              {/* Fault Title, Description & Zoomable Photo */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-8 space-y-2">
                  <Link
                    to={`/app/faults/${fault.id}`}
                    className="block text-base sm:text-lg font-black text-[#13243B] hover:text-[#1769E8] transition-colors"
                  >
                    {t(fault.titleAr, fault.titleEn)}
                  </Link>
                  <p className="text-xs sm:text-sm text-[#718096] leading-relaxed">
                    {t(fault.descriptionAr, fault.descriptionEn)}
                  </p>
                </div>

                {fault.image && (
                  <div
                    onClick={() =>
                      openLightbox(
                        fault.images && fault.images.length > 0
                          ? fault.images
                          : [fault.image],
                        0,
                        fault.titleAr
                      )
                    }
                    className="md:col-span-4 relative rounded-2xl overflow-hidden border border-[#DFE7F1] cursor-zoom-in group"
                  >
                    <IndustrialImage
                      src={fault.image}
                      alt={fault.titleAr}
                      aspectClass="aspect-[16/10]"
                    />
                    <span className="absolute bottom-2 end-2 px-2 py-1 rounded-lg bg-[#071A33]/85 text-white text-[10px] font-extrabold flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      <span>{t('تكبير', 'Zoom')}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Stats & Interactive Actions Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 border-y border-[#DFE7F1] text-xs font-bold text-[#718096]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void toggleLike('fault', fault.id)}
                    className={`px-3 py-1.5 rounded-xl font-extrabold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      liked
                        ? 'bg-blue-50 text-[#1769E8] border-blue-200'
                        : 'bg-[#F4F7FC] text-[#13243B] border-[#DFE7F1]'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${liked ? 'fill-[#1769E8]' : ''}`}
                    />
                    <span>{t('أعجبني', 'Like')}</span>
                    <span className="font-mono-num">({likeCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSavedItem(fault.id, {
                        itemType: 'fault',
                        titleAr: fault.titleAr,
                        route: `/app/faults/${fault.id}`,
                      })
                    }
                    className={`px-3 py-1.5 rounded-xl font-extrabold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-[#F4F7FC] text-[#13243B] border-[#DFE7F1]'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isSaved ? 'fill-rose-600 text-rose-600' : ''
                      }`}
                    />
                    <span>{isSaved ? t('محفوظ', 'Saved') : t('حفظ', 'Save')}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-[#13243B]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {fault.solutions.length} {t('حل فني مقترح', 'Proposed Solutions')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setReplyFaultId(replyFaultId === fault.id ? null : fault.id)
                  }
                  className="flex items-center gap-1.5 text-[#1769E8] hover:underline font-extrabold cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t('إضافة حل أو رد فني', 'Add Technical Solution')}</span>
                </button>
              </div>

              {/* Best Solution Section */}
              {topSolution && (
                <div className="rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Link
                        to={`/app/profile/${encodeURIComponent(`sol-${topSolution.id}`)}`}
                        className="shrink-0"
                      >
                        <img
                          src={IMAGE_MANIFEST.profiles.technician}
                          alt={topSolution.authorName}
                          className="w-9 h-9 rounded-full object-cover border border-emerald-200 hover:border-[#1769E8] transition-colors"
                        />
                      </Link>
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/app/profile/${encodeURIComponent(`sol-${topSolution.id}`)}`}
                            className="text-xs sm:text-sm font-black text-[#13243B] hover:text-[#1769E8] transition-colors"
                          >
                            {topSolution.authorName}
                          </Link>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                            {topSolution.authorRoleAr}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#718096]">
                          {topSolution.createdAt}
                        </div>
                      </div>
                    </div>

                    {topSolution.isAccepted ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                        {t('حل معتمد من صاحب المشكلة ✓', 'Approved Solution ✓')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1769E8] border border-blue-200 text-[11px] font-extrabold">
                        {t('حل مقترح من متخصص', 'Proposed Solution')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#13243B] leading-relaxed">
                    {topSolution.content}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => acceptFaultSolution(fault.id, topSolution.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${
                        topSolution.isAccepted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-[#DFE7F1] text-[#13243B] hover:border-[#1769E8]'
                      }`}
                    >
                      {topSolution.isAccepted
                        ? t('✓ تم اعتماده كحل نهائي مجرب', '✓ Approved as Verified Solution')
                        : t('اعتماد هذا الرد كحل معتمد ✓', 'Approve as Verified Solution ✓')}
                    </button>

                    <button
                      type="button"
                      onClick={() => upvoteFaultSolution(fault.id, topSolution.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DFE7F1] text-xs font-extrabold text-[#13243B] hover:border-[#1769E8] cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-[#1769E8]" />
                      <span>{t('مفيد', 'Helpful')}</span>
                      <span className="font-mono-num">
                        ({topSolution.helpfulVotes})
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Add Answer Box */}
              {replyFaultId === fault.id && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t(
                      'اكتب التشخيص والحل الفني المجرب...',
                      'Write your technical diagnosis and solution...'
                    )}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm text-[#13243B] focus:outline-none focus:border-[#1769E8]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSolution(fault.id)}
                    className="px-4 py-2.5 rounded-xl bg-[#1769E8] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('نشر الحل', 'Post')}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for Publishing New Fault */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#DFE7F1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#13243B]">
                {t('نشر عطل أو استفسار فني جديد', 'Post New Technical Issue')}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#718096]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFault} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                  {t('عنوان العطل أو السؤال الفني', 'Issue Title')}
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={t(
                    'مثال: تذبذب ضغط الحقن في ماكينة Haitian 250T',
                    'e.g., Injection pressure fluctuation on 250T machine'
                  )}
                  className="w-full px-4 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-sm text-[#13243B]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                    {t('نوع الماكينة أو القالب', 'Machine / Mold Type')}
                  </label>
                  <select
                    value={machineType}
                    onChange={(e) => setMachineType(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                  >
                    <option value="ماكينة حقن">ماكينة حقن (Injection)</option>
                    <option value="ماكينة نفخ">ماكينة نفخ (Blow Molding)</option>
                    <option value="خط سحب وبثق">خط سحب وبثق (Extrusion)</option>
                    <option value="خط فيلم">خط فيلم (Film Line)</option>
                    <option value="اسطمبات وقوالب">اسطمبات وقوالب (Molds)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                    {t('الخامة البوليمرية', 'Polymer Material')}
                  </label>
                  <input
                    type="text"
                    value={polymerMaterial}
                    onChange={(e) => setPolymerMaterial(e.target.value)}
                    placeholder={t('مثال: PP / HDPE / PET', 'e.g. PP / HDPE')}
                    className="w-full px-3.5 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                    {t('ماركة وموديل الماكينة', 'Machine Brand & Model')}
                  </label>
                  <input
                    type="text"
                    value={machineBrandModel}
                    onChange={(e) => setMachineBrandModel(e.target.value)}
                    placeholder={t('مثال: Haitian MA-2500 / KraussMaffei', 'e.g. Haitian MA-2500')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                    {t('ظروف التشغيل (الحرارة / الضغط)', 'Operating Conditions')}
                  </label>
                  <input
                    type="text"
                    value={operatingConditions}
                    onChange={(e) => setOperatingConditions(e.target.value)}
                    placeholder={t('مثال: حرارة البرميل 220°C، ضغط 85 بار', 'e.g. Barrel 220°C, 85 bar')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                  {t('المحاولات السابقة للإصلاح (اختياري)', 'Previous Troubleshooting Attempts')}
                </label>
                <input
                  type="text"
                  value={previousAttempts}
                  onChange={(e) => setPreviousAttempts(e.target.value)}
                  placeholder={t('مثال: تم تنظيف فتحات التهوية وتجفيف الخامة لمدة ساعتين...', 'e.g. Cleaned mold vents and dried resin...')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs text-[#13243B]"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                  {t(
                    'تفاصيل الأعراض والمشكلة الفنية',
                    'Detailed Symptoms & Checks'
                  )}
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder={t(
                    'اشرح تفاصيل المشكلة وما قمت بفحصه في الحرارة والضغط والدورة...',
                    'Describe symptoms and checks performed...'
                  )}
                  className="w-full p-4 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs text-[#13243B]"
                />
              </div>
              {/* Media Attachment Upload with Progress Bar & Preview */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FC] border border-[#DFE7F1] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-[#13243B]">
                    {t(
                      'إرفاق صورة العطل أو فيديو قصير للماكينة (اختياري)',
                      'Attach Defect Image or Machine Video (Optional)'
                    )}
                  </label>
                  <span className="text-[11px] font-bold text-[#718096]">
                    JPG, PNG, WEBP (10MB) / MP4, MOV (50MB)
                  </span>
                </div>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.webm"
                  onChange={handleAttachmentChange}
                  data-testid="fault-media-input"
                  className="block w-full text-xs text-[#4A5B73] file:me-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-[#1769E8]/10 file:text-[#1769E8] hover:file:bg-[#1769E8]/20 cursor-pointer"
                />
                {attachmentError && (
                  <p className="text-xs font-extrabold text-rose-600">
                    {attachmentError}
                  </p>
                )}
                {uploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-extrabold text-[#1769E8]">
                      <span>
                        {uploadProgress < 100
                          ? t('جاري رفع وفحص الملف...', 'Uploading & validating...')
                          : t('اكتمل رفع المرفق بنجاح', 'Attachment ready')}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#DFE7F1] overflow-hidden">
                      <div
                        className="h-full bg-[#1769E8] transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {attachedFile && (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-[#DFE7F1]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {attachedFile.previewUrl && (
                        <img
                          src={attachedFile.previewUrl}
                          alt={attachedFile.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#DFE7F1] shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#071A33] truncate">
                          {attachedFile.name}
                        </p>
                        <p className="text-[11px] text-[#718096]">
                          {(attachedFile.sizeBytes / 1024).toFixed(1)} KB •{' '}
                          {attachedFile.category === 'video'
                            ? t('فيديو عطل', 'Defect Video')
                            : t('صورة عطل', 'Defect Image')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachedFile(null);
                        setUploadProgress(0);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-extrabold shrink-0 cursor-pointer"
                    >
                      {t('حذف المرفق', 'Remove')}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1769E8] hover:bg-[#1256c4] text-white font-black text-sm cursor-pointer"
              >
                {t('نشر العطل الآن', 'Publish Issue Now')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const FaultDetailPage: React.FC = () => {
  return <FaultsListPage />;
};

/* ============================================================================
   Industrial Jobs & Recruitment Platform (/app/jobs & /app/jobs/:id)
   Includes all 10 industrial roles across the plastics sector
   ============================================================================ */
const INDUSTRIAL_JOB_ROLE_FILTERS = [
  { id: 'all', labelAr: 'جميع الوظائف', labelEn: 'All Roles' },
  { id: 'engineers', labelAr: 'مهندسون', labelEn: 'Engineers' },
  { id: 'technicians', labelAr: 'فنيون', labelEn: 'Technicians' },
  { id: 'operators', labelAr: 'مشغلو ماكينات', labelEn: 'Machine Operators' },
  {
    id: 'production_workers',
    labelAr: 'عمال إنتاج',
    labelEn: 'Production Workers',
  },
  { id: 'assistants', labelAr: 'مساعدون', labelEn: 'Assistants' },
  {
    id: 'packing_sorting',
    labelAr: 'عمال تعبئة وفرز',
    labelEn: 'Packing & Sorting',
  },
  {
    id: 'quality_inspectors',
    labelAr: 'مراقبو جودة',
    labelEn: 'Quality Inspectors',
  },
  {
    id: 'maintenance_workers',
    labelAr: 'فنيو صيانة',
    labelEn: 'Maintenance Workers',
  },
  { id: 'supervisors', labelAr: 'مشرفو إنتاج', labelEn: 'Production Supervisors' },
  { id: 'managers', labelAr: 'مديرو مصانع وتشغيل', labelEn: 'Managers' },
];

export const JobsListPage: React.FC = () => {
  const {
    t,
    jobs,
    applyForJob,
    createJob,
    savedIds,
    toggleSavedItem,
    startOrOpenConversation,
    guardVisitorAction,
  } = usePlastico();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'find_job' | 'find_talent'>('find_job');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('المنطقة الصناعية - العاشر من رمضان');
  const [newSalary, setNewSalary] = useState('حسب الخبرة');
  const [newCategory, setNewCategory] = useState('engineers');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;
    const roleObj = INDUSTRIAL_JOB_ROLE_FILTERS.find((r) => r.id === newCategory);
    createJob({
      titleAr: newTitle,
      titleEn: newTitle,
      companyName: newCompany,
      city: newCity,
      country: 'مصر',
      jobTypeAr: 'دوام كامل',
      experienceRange: 'خبرة 2 - 5 سنوات',
      salaryRange: newSalary,
      specialtyAr: roleObj ? roleObj.labelAr : 'تشغيل وصيانة بلاستيك',
      requirements: [
        'خبرة عملية في مصانع البلاستيك',
        'الالتزام بمعايير السلامة والجودة',
      ],
    });
    setNewTitle('');
    setNewCompany('');
    setShowPostModal(false);
  };

  const sectorJobs = [
    {
      id: jobs[0]?.id || 'job-1',
      companyAr: 'مجموعة الدلتا للصناعات البلاستيكية',
      companyEn: 'Delta Plastics Group',
      titleAr: 'مهندس إنتاج وتشغيل حقن بلاستيك',
      titleEn: 'Injection Molding Production Engineer',
      locationAr: 'العاشر من رمضان - مصر',
      locationEn: '10th of Ramadan City - Egypt',
      salary: 'تحدد حسب الخبرة',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 3 - 5 سنوات',
      timeAr: 'إعلان توظيف نشط',
      category: 'engineers',
      applied: jobs[0]?.applied,
    },
    {
      id: jobs[1]?.id || 'job-2',
      companyAr: 'مصنع النيل للعبوات والتغليف',
      companyEn: 'Nile Packaging Factory',
      titleAr: 'فني ضبط وتشغيل ماكينات حقن ونفخ',
      titleEn: 'Injection & Blow Molding Setup Technician',
      locationAr: 'السادس من أكتوبر - مصر',
      locationEn: '6th of October City - Egypt',
      salary: 'راتب مجزٍ + حوافز إنتاج',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 2 - 4 سنوات',
      timeAr: 'إعلان توظيف نشط',
      category: 'technicians',
      applied: jobs[1]?.applied,
    },
    {
      id: jobs[2]?.id || 'job-3',
      companyAr: 'الشركة العربية لسحب المواسير والفيلم',
      companyEn: 'Arabian Pipe & Film Extrusion Co.',
      titleAr: 'مشغل خط سحب وبثق (Extrusion Operator)',
      titleEn: 'Extrusion Line Machine Operator',
      locationAr: 'برج العرب الصناعية - الإسكندرية',
      locationEn: 'Borg El Arab Industrial Zone',
      salary: 'راتب أساسي + بدل وردية',
      typeAr: 'نظام ورديات',
      expAr: 'خبرة 1 - 3 سنوات',
      timeAr: 'إعلان توظيف نشط',
      category: 'operators',
      applied: jobs[2]?.applied,
    },
    {
      id: 'job-sector-4',
      companyAr: 'مصنع الشرق الأوسط للبلاستيك الهندسي',
      companyEn: 'Middle East Engineering Plastics',
      titleAr: 'مراقب جودة منتجات بلاستيكية (Quality Inspector)',
      titleEn: 'Plastics Quality Control Inspector',
      locationAr: 'العبور الصناعية - مصر',
      locationEn: 'Obour Industrial City',
      salary: 'حسب الكفاءة',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 2 سنة في فحص الأبعاد والوزن',
      timeAr: 'إعلان توظيف نشط',
      category: 'quality_inspectors',
      applied: false,
    },
    {
      id: 'job-sector-5',
      companyAr: 'مصنع الأهرام للتعبئة والتغليف',
      companyEn: 'Al-Ahram Packaging Factory',
      titleAr: 'فني صيانة هيدروليك وكهرباء ماكينات بلاستيك',
      titleEn: 'Hydraulic & Electrical Maintenance Technician',
      locationAr: 'العاشر من رمضان - مصر',
      locationEn: '10th of Ramadan City',
      salary: 'راتب متميز + تأمينات',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 3 سنوات في صيانة خطوط الحقن',
      timeAr: 'إعلان توظيف نشط',
      category: 'maintenance_workers',
      applied: false,
    },
    {
      id: 'job-sector-6',
      companyAr: 'مجموعة الخليج للصناعات التحويلية',
      companyEn: 'Gulf Converting Industries',
      titleAr: 'مشرف وردية إنتاج (Production Supervisor)',
      titleEn: 'Plastics Shift Production Supervisor',
      locationAr: 'الرياض - المدينة الصناعية الثانية',
      locationEn: 'Riyadh 2nd Industrial City',
      salary: 'حسب الخبرة والمقابلة',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 5 سنوات في قيادة فرق التشغيل',
      timeAr: 'إعلان توظيف نشط',
      category: 'supervisors',
      applied: false,
    },
    {
      id: 'job-sector-7',
      companyAr: 'شركة الرواد لصناعة العبوات الدوائية',
      companyEn: 'Al-Rowad Pharma Packaging',
      titleAr: 'عمال إنتاج وتعبئة وفرز عبوات',
      titleEn: 'Production, Packing & Sorting Workers',
      locationAr: 'مدينة بدر الصناعية',
      locationEn: 'Badr Industrial City',
      salary: 'راتب شهري + مواصلات مؤمنة',
      typeAr: 'دوام كامل',
      expAr: 'متاح لحديثي الخبرة والمساعدين',
      timeAr: 'إعلان توظيف نشط',
      category: 'packing_sorting',
      applied: false,
    },
    {
      id: 'job-sector-8',
      companyAr: 'مصنع الوطنية للبوليمرات والماسترباتش',
      companyEn: 'National Polymers & Masterbatch',
      titleAr: 'مدير مصنع وتشغيل صناعي (Plant Manager)',
      titleEn: 'Plastics Plant & Operations Manager',
      locationAr: 'جدة - المدينة الصناعية',
      locationEn: 'Jeddah Industrial City',
      salary: 'حزمة تنفيذية كاملة',
      typeAr: 'دوام كامل',
      expAr: 'خبرة +8 سنوات في إدارة مصانع البلاستيك',
      timeAr: 'إعلان توظيف نشط',
      category: 'managers',
      applied: false,
    },
    ...jobs.slice(3).map((j) => ({
      id: j.id,
      companyAr: j.companyName,
      companyEn: j.companyName,
      titleAr: j.titleAr,
      titleEn: j.titleEn,
      locationAr: j.city,
      locationEn: j.city,
      salary: j.salaryRange,
      typeAr: j.jobTypeAr,
      expAr: j.experienceRange,
      timeAr: j.postedAt,
      category: 'engineers',
      applied: j.applied,
    })),
  ].filter((j) => {
    if (roleFilter !== 'all') {
      if (roleFilter === 'production_workers' || roleFilter === 'assistants') {
        if (j.category !== 'packing_sorting' && j.category !== roleFilter)
          return false;
      } else if (j.category !== roleFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        j.titleAr.toLowerCase().includes(q) ||
        j.companyAr.toLowerCase().includes(q) ||
        j.locationAr.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#071A33] text-white rounded-3xl p-6 sm:p-8 border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1769E8]/20 border border-[#27BED6]/30 text-[#27BED6] text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>
              {t('الوظائف والتوظيف الصناعي', 'Industrial Jobs & Recruitment')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            {t(
              'فرص العمل والكفاءات الفنية في قطاع صناعة البلاستيك',
              'Career Opportunities & Technical Talent in the Plastics Sector'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {t(
              'مهندسون، فنيون، مشغلو ماكينات، عمال إنتاج، مساعدون، عمال تعبئة وفرز، مراقبو جودة، صيانة، مشرفون، ومديرو مصانع.',
              'Engineers, technicians, machine operators, production workers, assistants, packing/sorting, quality inspectors, maintenance, supervisors, and managers.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/app/jobs/applications"
            data-testid="jobs-applications-link"
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#27BED6]" />
            <span>
              {t('طلباتي الوظيفية وإدارة المتقدمين', 'My Applications & Applicants')}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => {
              if (!guardVisitorAction('نشر إعلان وظيفة')) return;
              setShowPostModal(true);
            }}
            className="px-5 py-3 rounded-xl bg-[#FF8A2A] hover:bg-[#e8791d] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('نشر وظيفة صناعية', 'Post Industrial Job')}</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher & Search */}
      <div className="bg-white rounded-2xl border border-[#DFE7F1] p-4 space-y-4">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1]">
          <button
            type="button"
            onClick={() => setMode('find_job')}
            className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'find_job'
                ? 'bg-[#1769E8] text-white shadow-xs'
                : 'text-[#13243B] hover:text-[#1769E8]'
            }`}
          >
            {t('أبحث عن وظيفة في المصانع', 'Looking for a Factory Job')}
          </button>
          <button
            type="button"
            onClick={() => setMode('find_talent')}
            className={`py-2.5 px-4 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
              mode === 'find_talent'
                ? 'bg-[#1769E8] text-white shadow-xs'
                : 'text-[#13243B] hover:text-[#1769E8]'
            }`}
          >
            {t('أبحث عن كفاءات ومهندسين وفنيين', 'Hiring Engineers & Technicians')}
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-[#718096] absolute top-1/2 -translate-y-1/2 start-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'ابحث بالمسمى الوظيفي، التخصص، أو المدينة الصناعية...',
              'Search by job title, specialty, or industrial city...'
            )}
            className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs sm:text-sm text-[#13243B] focus:outline-none focus:border-[#1769E8]"
          />
        </div>

        {/* All 10 Plastics Sector Role Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="w-4 h-4 text-[#1769E8] shrink-0 me-1" />
          {INDUSTRIAL_JOB_ROLE_FILTERS.map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setRoleFilter(pill.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                roleFilter === pill.id
                  ? 'bg-[#071A33] text-white'
                  : 'bg-[#F4F7FC] text-[#13243B] border border-[#DFE7F1] hover:border-[#1769E8]'
              }`}
            >
              {t(pill.labelAr, pill.labelEn)}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sectorJobs.map((job) => {
          const isSaved = savedIds.includes(job.id);
          return (
            <div
              key={job.id}
              className="bg-white rounded-3xl border border-[#DFE7F1] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1769E8]/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <Link
                    to={`/app/profile/job-co-${encodeURIComponent(job.id)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1769E8] hover:underline"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t(job.companyAr, job.companyEn)}</span>
                  </Link>
                  <Link
                    to={`/app/jobs/${job.id}`}
                    className="block text-base sm:text-lg font-black text-[#13243B] hover:text-[#1769E8]"
                  >
                    {t(job.titleAr, job.titleEn)}
                  </Link>
                  <div className="flex items-center gap-1.5 text-xs text-[#718096] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#718096]" />
                    <span>{t(job.locationAr, job.locationEn)}</span>
                  </div>
                  <div className="text-xs font-extrabold text-emerald-700 pt-1">
                    {job.salary}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleSavedItem(job.id, {
                      itemType: 'job',
                      titleAr: job.titleAr,
                      route: `/app/jobs`,
                    })
                  }
                  aria-label={t('حفظ الوظيفة', 'Save job')}
                  className="p-2 rounded-xl text-[#718096] hover:text-rose-600 hover:bg-[#F4F7FC] cursor-pointer"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isSaved ? 'fill-rose-600 text-rose-600' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#DFE7F1]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] text-[#13243B] text-[11px] font-bold">
                    {job.typeAr}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F4F7FC] text-[#13243B] text-[11px] font-bold">
                    {job.expAr}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const cid = await startOrOpenConversation({
                        targetKey: `job-co-${job.id}`,
                        targetNameAr: job.companyAr,
                        targetRoleAr: 'إدارة الموارد البشرية والتشغيل',
                        targetAvatar: IMAGE_MANIFEST.profiles.factoryOwner,
                        contextType: 'job',
                        contextId: job.id,
                        contextTitleAr: job.titleAr,
                      });
                      if (cid) navigate(`/app/messages?convId=${cid}`);
                    }}
                    className="p-2 rounded-xl bg-[#F4F7FC] hover:bg-blue-50 text-[#1769E8] border border-[#DFE7F1] cursor-pointer"
                    title={t('مراسلة المصنع', 'Message Factory')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyForJob(job.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      job.applied
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-[#1769E8] hover:bg-[#1256c4] text-white shadow-xs'
                    }`}
                  >
                    {job.applied
                      ? t('تم التقديم ✓', 'Applied ✓')
                      : t('تقدم الآن', 'Apply Now')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Posting a New Job */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071A33]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#DFE7F1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#13243B]">
                {t('نشر وظيفة صناعية جديدة', 'Post New Industrial Job')}
              </h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#718096]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#13243B] mb-1">
                  {t('الفئة الوظيفية', 'Role Category')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                >
                  {INDUSTRIAL_JOB_ROLE_FILTERS.filter((r) => r.id !== 'all').map(
                    (r) => (
                      <option key={r.id} value={r.id}>
                        {r.labelAr} ({r.labelEn})
                      </option>
                    )
                  )}
                </select>
              </div>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t(
                  'المسمى الوظيفي (مثال: مهندس صيانة هيدروليك)',
                  'Job Title'
                )}
                className="w-full px-4 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-sm text-[#13243B]"
              />
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder={t('اسم المصنع أو الشركة', 'Factory or Company Name')}
                className="w-full px-4 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-sm text-[#13243B]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder={t('المنطقة الصناعية', 'Location')}
                  className="px-3.5 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                />
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder={t('الراتب أو الحوافز', 'Salary / Package')}
                  className="px-3.5 py-3 rounded-xl bg-[#F4F7FC] border border-[#DFE7F1] text-xs font-bold text-[#13243B]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#1769E8] text-white font-black text-sm cursor-pointer"
              >
                {t('نشر الوظيفة الآن', 'Publish Job Now')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const JobDetailPage: React.FC = () => {
  return <JobsListPage />;
};
