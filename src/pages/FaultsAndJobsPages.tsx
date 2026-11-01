import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Eye,
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
} from 'lucide-react';
import { usePlastico } from '../context/PlasticoContext';
import { IndustrialImage } from '../components/IndustrialImage';

/* ============================================================================
   Screen 08: Industrial Faults Platform (/app/faults & /app/faults/:id)
   Matches Image 5 (Screen 01) & Image 6 (Screen 8)
   ============================================================================ */
export const FaultsListPage: React.FC = () => {
  const { t, faults, createFault, addFaultSolution, upvoteFaultSolution, acceptFaultSolution } =
    usePlastico();
  const [machineFilter, setMachineFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [showNewModal, setShowNewModal] = useState(false);
  const [replyFaultId, setReplyFaultId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New Fault Form State
  const [titleAr, setTitleAr] = useState('');
  const [machineType, setMachineType] = useState('ماكينة حقن');
  const [polymerMaterial, setPolymerMaterial] = useState('PP / HDPE');
  const [descriptionAr, setDescriptionAr] = useState('');

  const filteredFaults = faults.filter((f) => {
    if (machineFilter === 'all') return true;
    if (machineFilter === 'injection') return f.machineType.includes('حقن');
    if (machineFilter === 'blow') return f.machineType.includes('نفخ');
    return !f.machineType.includes('حقن') && !f.machineType.includes('نفخ');
  });

  const handleCreateFault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() || !descriptionAr.trim()) return;
    createFault({
      titleAr,
      titleEn: titleAr,
      machineType,
      polymerMaterial,
      descriptionAr,
      descriptionEn: descriptionAr,
      symptoms: ['فصل مفاجئ أثناء التشغيل', 'تذبذب ضغط الهيدروليك'],
    });
    setTitleAr('');
    setDescriptionAr('');
    setShowNewModal(false);
  };

  const handleAddSolution = (faultId: string) => {
    if (!replyText.trim()) return;
    addFaultSolution(faultId, replyText, 'تنظيف الفلتر وفحص حساس الضغط واختبار صمام التوجيه.');
    setReplyText('');
    setReplyFaultId(null);
  };

  return (
    <div className="space-y-4">
      {/* Machine Category Filter Pills matching Image 5 Screen 01 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', labelAr: 'كل الأعطال', labelEn: 'All Faults' },
          { id: 'injection', labelAr: 'ماكينات حقن', labelEn: 'Injection Machines' },
          { id: 'blow', labelAr: 'ماكينات نفخ', labelEn: 'Blow Molding' },
          { id: 'other', labelAr: 'ماكينات أخرى', labelEn: 'Other Machines' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMachineFilter(tab.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all ${
              machineFilter === tab.id
                ? 'bg-[#0B5ED7] text-white shadow-xs'
                : 'bg-white text-[#0B2A5B] border border-slate-200/80 hover:bg-blue-50'
            }`}
          >
            {t(tab.labelAr, tab.labelEn)}
          </button>
        ))}

        <div className="ms-auto flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
              sortBy === 'latest' ? 'bg-[#0B2A5B] text-white' : 'text-slate-500'
            }`}
          >
            {t('الأحدث', 'Latest')}
          </button>
          <button
            type="button"
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${
              sortBy === 'popular' ? 'bg-[#0B2A5B] text-white' : 'text-slate-500'
            }`}
          >
            {t('الأكثر تفاعلاً', 'Most Active')}
          </button>
        </div>
      </div>

      {/* Featured Fault Card matching Image 5 Screen 01 + Dynamic Faults */}
      <div className="space-y-5">
        {filteredFaults.map((fault, index) => {
          const topSolution =
            fault.solutions.find((s) => s.isAccepted) || fault.solutions[0];

          return (
            <div
              key={fault.id}
              className="bg-white rounded-3xl border border-slate-200/85 p-4 sm:p-6 shadow-2xs space-y-4"
            >
              {/* Author & Machine Badge Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/plastico/team/engineer-avatar.svg"
                    alt={fault.authorName}
                    className="w-11 h-11 rounded-full object-cover border border-blue-100"
                  />
                  <div>
                    <div className="text-sm font-extrabold text-[#0B2A5B]">
                      {index === 0 ? t('أحمد محمد', 'Ahmed Mohamed') : fault.authorName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {index === 0
                        ? t('صاحب مصنع - القاهرة · منذ 2 ساعة', 'Factory Owner - Cairo · 2h ago')
                        : `${fault.authorRoleLabel} · ${fault.createdAt}`}
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-[#E8F2FF] text-[#1D6BF3] text-xs font-extrabold shrink-0">
                  {index === 0 ? t('ماكينة حقن', 'Injection Machine') : fault.machineType}
                </span>
              </div>

              {/* Fault Title & Description */}
              <div className="space-y-1.5">
                <Link
                  to={`/app/faults/${fault.id}`}
                  className="block text-base sm:text-lg font-extrabold text-[#0B2A5B] hover:text-[#1D6BF3] transition-colors"
                >
                  {index === 0
                    ? t(
                        'الماكينة بتفصل فجأة أثناء التشغيل',
                        'Machine shuts down suddenly during operation'
                      )
                    : t(fault.titleAr, fault.titleEn)}
                </Link>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {index === 0
                    ? t(
                        'ماكينة Haitian بتفصل فجأة بعد حوالي 30 دقيقة تشغيل. جربت أفحص الضغط والحرارة، لكن المشكلة مازالت موجودة.',
                        'Haitian injection machine shuts down after 30 minutes of operation. Checked pressure and temperature but the issue persists.'
                      )
                    : t(fault.descriptionAr, fault.descriptionEn)}
                </p>
              </div>

              {/* 3-Photo Strip with +3 Overlay matching Image 5 Screen 01 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3]">
                  <img
                    src="/images/plastico/marketplace/used-injection-machine.svg"
                    alt="Machine"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3]">
                  <img
                    src="/images/plastico/manufacturing/thermoforming-packaging.svg"
                    alt="Hydraulic Gauge"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Link
                  to={`/app/faults/${fault.id}`}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] block"
                >
                  <img
                    src="/images/plastico/marketplace/plastic-shredder-unit.svg"
                    alt="More photos"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#0B2A5B]/65 flex items-center justify-center text-white text-xl font-extrabold font-mono-num">
                    +3
                  </div>
                </Link>
              </div>

              {/* Stats Row: Views, Solutions, Comments */}
              <div className="flex items-center justify-between py-2.5 border-y border-slate-100 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>{t('مشاهدة 1.2K', '1.2K Views')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#0B2A5B]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  <span>
                    {fault.solutions.length + 3} {t('حل', 'Solutions')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setReplyFaultId(replyFaultId === fault.id ? null : fault.id)
                  }
                  className="flex items-center gap-1.5 hover:text-[#1D6BF3]"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>24 {t('تعليق', 'Comments')}</span>
                </button>
              </div>

              {/* Best Solutions Section (أفضل الحلول) matching Image 5 Screen 01 */}
              {topSolution && (
                <div className="space-y-3 pt-1">
                  <h3 className="text-sm font-extrabold text-[#0B2A5B]">
                    {t('أفضل الحلول', 'Best Solutions')}
                  </h3>

                  <div className="rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src="/images/plastico/team/engineer-avatar.svg"
                          alt={topSolution.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-emerald-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-[#0B2A5B]">
                              {index === 0 ? t('محمود علي', 'Mahmoud Ali') : topSolution.authorName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669] text-[10px] font-extrabold">
                              {t('خبير', 'Expert')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {t('مهندس ميكانيكا · منذ 1 ساعة', 'Mechanical Engineer · 1h ago')}
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#059669] text-[11px] font-extrabold">
                        {t('الحل الأفضل', 'Best Solution')}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-[#0B2A5B] leading-relaxed">
                      {index === 0
                        ? t(
                            'غالباً المشكلة من حساس الضغط أو انسداد مبرد الزيت. جرب تنظف الفلتر وتتحقق من توصيلات الحساس.',
                            'Likely caused by the pressure sensor or oil cooler blockage. Clean the filter and inspect sensor wiring.'
                          )
                        : topSolution.content}
                    </p>

                    {/* 4 Small Solution Thumbnails */}
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        '/images/plastico/manufacturing/thermoforming-packaging.svg',
                        '/images/plastico/marketplace/plastic-shredder-unit.svg',
                        '/images/plastico/marketplace/injection-mold-steel.svg',
                        '/images/plastico/marketplace/used-injection-machine.svg',
                      ].map((thumb, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl overflow-hidden border border-slate-200 aspect-[4/3]"
                        >
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    {/* Solution Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => acceptFaultSolution(fault.id, topSolution.id)}
                        className="px-4 py-1.5 rounded-full bg-[#0B5ED7] hover:bg-[#094bb0] text-white text-xs font-extrabold shadow-2xs"
                      >
                        {t('تم اختيار الحل', 'Selected Solution')}
                      </button>

                      <div className="flex items-center gap-4 text-xs font-extrabold text-slate-600">
                        <button
                          type="button"
                          onClick={() =>
                            setReplyFaultId(replyFaultId === fault.id ? null : fault.id)
                          }
                          className="flex items-center gap-1 hover:text-[#1D6BF3]"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{t('رد', 'Reply')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => upvoteFaultSolution(fault.id, topSolution.id)}
                          className="flex items-center gap-1 text-[#0B2A5B] hover:text-[#1D6BF3]"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-mono-num">{topSolution.helpfulVotes + 14}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Add Answer Box */}
              {replyFaultId === fault.id ? (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t(
                      'اكتب التشخيص والحل الفني المجرب (+20 نقطة سمعة)...',
                      'Write your technical solution (+20 pts)...'
                    )}
                    className="flex-1 px-4 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-[#0B2A5B] focus:outline-none focus:border-[#1D6BF3]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSolution(fault.id)}
                    className="px-4 py-2.5 rounded-full bg-[#0B2A5B] text-white text-xs font-extrabold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('نشر الحل', 'Post')}</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setReplyFaultId(fault.id)}
                  className="w-full py-2.5 rounded-2xl bg-[#EEF2F8] hover:bg-blue-50 text-[#0B2A5B] text-xs font-extrabold transition-colors"
                >
                  {t('أضف إجابتك أو حلك الفني', 'Add Your Technical Solution')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Prominent Bottom Blue CTA Button: + نشر عطل جديد matching Image 5 Screen 01 */}
      <div className="sticky bottom-20 lg:bottom-4 pt-2">
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#0B5ED7] hover:bg-[#094bb0] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{t('نشر عطل جديد', 'Post New Machine Fault')}</span>
        </button>
      </div>

      {/* Modal for Publishing New Fault */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2A5B]/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#0B2A5B]">
                {t('نشر عطل صناعي جديد (+5 نقاط)', 'Post New Industrial Fault (+5 pts)')}
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFault} className="space-y-3.5">
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={t(
                  'عنوان العطل (مثال: الماكينة بتفصل فجأة أثناء التشغيل)',
                  'Fault title'
                )}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-[#0B2A5B]"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={machineType}
                  onChange={(e) => setMachineType(e.target.value)}
                  className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
                >
                  <option value="ماكينة حقن">ماكينة حقن</option>
                  <option value="ماكينة نفخ">ماكينة نفخ</option>
                  <option value="خط سحب وبثق">خط سحب وبثق</option>
                </select>
                <input
                  type="text"
                  value={polymerMaterial}
                  onChange={(e) => setPolymerMaterial(e.target.value)}
                  placeholder={t('الخامة (PP / HDPE)', 'Resin')}
                  className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
                />
              </div>
              <textarea
                rows={3}
                required
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder={t(
                  'اشرح تفاصيل المشكلة وما قمت بفحصه في الضغط والحرارة...',
                  'Describe symptoms and checks performed...'
                )}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#0B2A5B]"
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0B5ED7] text-white font-extrabold text-sm"
              >
                {t('نشر العطل الآن', 'Publish Fault Now')}
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
   Screen 09: Industrial Jobs Platform (/app/jobs & /app/jobs/:id)
   Matches Image 5 (Screen 02) & Image 6 (Screen 9)
   ============================================================================ */
export const JobsListPage: React.FC = () => {
  const { t, jobs, applyForJob, createJob, showToast } = usePlastico();
  const [mode, setMode] = useState<'find_job' | 'find_talent'>('find_job');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newCity, setNewCity] = useState('المنطقة الصناعية - 6 أكتوبر');
  const [newSalary, setNewSalary] = useState('$800 - $1,200');

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;
    createJob({
      titleAr: newTitle,
      titleEn: newTitle,
      companyName: newCompany,
      city: newCity,
      country: 'مصر',
      jobTypeAr: 'دوام كامل',
      experienceRange: 'خبرة 2 - 5 سنوات',
      salaryRange: newSalary,
      specialtyAr: 'صيانة وتشغيل ماكينات',
      requirements: ['خبرة عملية في مصانع البلاستيك', 'الالتزام بمعايير السلامة والجودة'],
    });
    setNewTitle('');
    setNewCompany('');
    setShowPostModal(false);
  };

  // Combine mockup signature cards with state jobs
  const displayJobs = [
    {
      id: jobs[0]?.id || 'job-1',
      companyAr: 'شركة النور للبلاستيك',
      companyEn: 'Al Noor Plastic',
      logoBadge: 'AL NOOR\nPLASTIC',
      logoColor: 'text-[#059669] bg-emerald-50 border-emerald-200',
      titleAr: 'مهندس صيانة ميكانيكا',
      titleEn: 'Mechanical Maintenance Engineer',
      locationAr: 'المنطقة الصناعية - 6 أكتوبر',
      locationEn: '6th of October Industrial Zone',
      salary: '$800 - $1,200',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 2 - 5 سنوات',
      timeAr: 'منذ 2 ساعة',
      category: 'engineer',
      applied: jobs[0]?.applied,
    },
    {
      id: jobs[1]?.id || 'job-2',
      companyAr: 'Delta Plastic',
      companyEn: 'Delta Plastic',
      logoBadge: 'DELTA\nPLASTIC',
      logoColor: 'text-[#1D6BF3] bg-blue-50 border-blue-200',
      titleAr: 'فني تشغيل ماكينات حقن',
      titleEn: 'Injection Molding Machine Operator',
      locationAr: 'العاشر من رمضان',
      locationEn: '10th of Ramadan City',
      salary: '$500 - $700',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 1 - 3 سنوات',
      timeAr: 'منذ 5 ساعات',
      category: 'technician',
      applied: jobs[1]?.applied,
    },
    {
      id: jobs[2]?.id || 'job-3',
      companyAr: 'Egypt Pack',
      companyEn: 'Egypt Pack',
      logoBadge: 'EGYPT\nPACK',
      logoColor: 'text-[#DC2626] bg-red-50 border-red-200',
      titleAr: 'فني صيانة كهرباء',
      titleEn: 'Electrical Maintenance Technician',
      locationAr: 'المنطقة الصناعية - العبور',
      locationEn: 'Obour Industrial City',
      salary: '$600 - $900',
      typeAr: 'دوام كامل',
      expAr: 'خبرة 2 - 4 سنوات',
      timeAr: 'منذ 1 يوم',
      category: 'maintenance',
      applied: jobs[2]?.applied,
    },
    ...jobs.slice(3).map((j) => ({
      id: j.id,
      companyAr: j.companyName,
      companyEn: j.companyName,
      logoBadge: 'PLASTICO\nFACTORY',
      logoColor: 'text-[#0B2A5B] bg-slate-100 border-slate-200',
      titleAr: j.titleAr,
      titleEn: j.titleEn,
      locationAr: j.city,
      locationEn: j.city,
      salary: j.salaryRange,
      typeAr: j.jobTypeAr,
      expAr: j.experienceRange,
      timeAr: j.postedAt,
      category: 'engineer',
      applied: j.applied,
    })),
  ].filter((j) => (roleFilter === 'all' ? true : j.category === roleFilter));

  return (
    <div className="space-y-4">
      {/* Top Segmented Toggle: أبحث عن وظيفة | أبحث عن موظف matching Image 5 Screen 02 */}
      <div className="grid grid-cols-2 p-1.5 rounded-full bg-[#E8EEF6] border border-slate-200/80">
        <button
          type="button"
          onClick={() => setMode('find_job')}
          className={`py-2.5 px-4 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
            mode === 'find_job'
              ? 'bg-[#0B5ED7] text-white shadow-xs'
              : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
          }`}
        >
          {t('أبحث عن وظيفة', 'Looking for a Job')}
        </button>
        <button
          type="button"
          onClick={() => setMode('find_talent')}
          className={`py-2.5 px-4 rounded-full text-xs sm:text-sm font-extrabold transition-all ${
            mode === 'find_talent'
              ? 'bg-[#0B5ED7] text-white shadow-xs'
              : 'text-[#0B2A5B] hover:text-[#1D6BF3]'
          }`}
        >
          {t('أبحث عن موظف', 'Looking to Hire')}
        </button>
      </div>

      {/* Filter Pills Row matching Image 5 Screen 02 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setRoleFilter('all')}
          className="p-2.5 rounded-full bg-[#0B5ED7] text-white shrink-0 shadow-2xs"
          aria-label={t('تصفية', 'Filter')}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {[
          { id: 'all', labelAr: 'الكل', labelEn: 'All' },
          { id: 'engineer', labelAr: 'مهندس', labelEn: 'Engineer' },
          { id: 'technician', labelAr: 'فني', labelEn: 'Technician' },
          { id: 'maintenance', labelAr: 'فني صيانة', labelEn: 'Maintenance Tech' },
          { id: 'admin', labelAr: 'إداري', labelEn: 'Admin' },
        ].map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setRoleFilter(pill.id)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${
              roleFilter === pill.id
                ? 'bg-[#DCEBFF] text-[#0B5ED7] border border-blue-200'
                : 'bg-white text-[#0B2A5B] border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {t(pill.labelAr, pill.labelEn)}
          </button>
        ))}
      </div>

      {/* Job Cards List matching Image 5 Screen 02 & Image 6 Screen 9 */}
      <div className="space-y-3.5">
        {displayJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-3xl border border-slate-200/85 p-4 sm:p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Right side in RTL: Circular Company Logo + Details */}
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-14 h-14 rounded-full border flex items-center justify-center text-center text-[10px] font-extrabold leading-tight whitespace-pre-line shrink-0 ${job.logoColor}`}
                >
                  {job.logoBadge}
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-extrabold text-[#1D6BF3]">
                    {t(job.companyAr, job.companyEn)}
                  </div>
                  <Link
                    to={`/app/jobs/${job.id}`}
                    className="block text-base sm:text-lg font-extrabold text-[#0B2A5B] hover:text-[#1D6BF3]"
                  >
                    {t(job.titleAr, job.titleEn)}
                  </Link>
                  <div className="text-xs text-slate-500 font-medium">
                    {t(job.locationAr, job.locationEn)}
                  </div>
                  <div
                    dir="ltr"
                    className="text-xs sm:text-sm font-extrabold text-[#16A34A] font-mono-num pt-0.5 inline-block"
                  >
                    {job.salary}
                  </div>
                </div>
              </div>

              {/* Left side in RTL: Bookmark Icon */}
              <button
                type="button"
                onClick={() =>
                  showToast('تم حفظ الوظيفة في قائمة المحفوظات', 'Job saved to bookmarks')
                }
                aria-label={t('حفظ الوظيفة', 'Save job')}
                className="p-2 rounded-full text-slate-400 hover:text-[#0B2A5B] hover:bg-slate-100"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Row: Tags + Apply Now Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-[#0B2A5B] text-[11px] font-bold">
                  {job.typeAr}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-[#0B2A5B] text-[11px] font-bold">
                  {job.expAr}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{job.timeAr}</span>
              </div>

              <button
                type="button"
                onClick={() => applyForJob(job.id)}
                className={`px-5 py-2 rounded-full text-xs font-extrabold transition-all ${
                  job.applied
                    ? 'bg-emerald-100 text-[#059669]'
                    : 'bg-[#0B2A5B] hover:bg-[#1D6BF3] text-white shadow-xs'
                }`}
              >
                {job.applied ? t('تم التقديم ✓', 'Applied ✓') : t('تقدم الآن', 'Apply Now')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Dual Action Buttons matching Image 5 Screen 02 */}
      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          onClick={() => setRoleFilter('all')}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0B5ED7] hover:bg-[#094bb0] text-white font-extrabold text-sm shadow-md transition-all"
        >
          {t('عرض جميع الوظائف', 'View All Jobs')}
        </button>

        <button
          type="button"
          onClick={() => setShowPostModal(true)}
          className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-blue-50 text-[#0B5ED7] border-2 border-[#0B5ED7]/30 font-extrabold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t('نشر وظيفة جديدة', 'Post a New Job')}</span>
        </button>
      </div>

      {/* Modal for Posting a New Job */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B2A5B]/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#0B2A5B]">
                {t('نشر وظيفة صناعية جديدة', 'Post New Industrial Job')}
              </h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="space-y-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('المسمى الوظيفي (مثال: مهندس صيانة هيدروليك)', 'Job Title')}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-[#0B2A5B]"
              />
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder={t('اسم المصنع أو الشركة', 'Factory or Company Name')}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-[#0B2A5B]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder={t('المنطقة الصناعية', 'Location')}
                  className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
                />
                <input
                  type="text"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="$800 - $1,200"
                  className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-[#0B2A5B]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#0B5ED7] text-white font-extrabold text-sm"
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
