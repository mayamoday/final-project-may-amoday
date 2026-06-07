import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { getCamper, updateCamper } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CamperData {
  id: string;
  full_name: string;
  parent_name: string | null;
  birth_date: string | null;
  shirt_size: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  critical_medical_info: string | null;
  dietary_requirements: string | null;
  medications: string | null;
  profile_image_url: string | null;
}

interface EditForm {
  full_name: string;
  parent_name: string;
  birth_date: string;
  shirt_size: string;
  parent_phone: string;
  parent_email: string;
  critical_medical_info: string;
  dietary_requirements: string;
  medications: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBirthDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(`${dateStr}T12:00:00`);
  const age  = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000));
  const formatted = date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${formatted} (בן/ת ${age})`;
}

function placeholderAvatar(name: string) {
  return `https://ui-avatars.com/api/?background=e0f2fe&color=0369a1&size=256&name=${encodeURIComponent(name)}`;
}

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const fieldClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all text-right placeholder:text-slate-400';

const textareaClass =
  'w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all text-right placeholder:text-slate-400 resize-none';

// ─── Component ────────────────────────────────────────────────────────────────

export default function CamperProfilePage() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const { userRole } = useAuth();

  const [activeTab, setActiveTab]     = useState('personal');
  const [camper, setCamper]           = useState<CamperData | null>(null);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState<EditForm>({
    full_name: '', parent_name: '', birth_date: '', shirt_size: '',
    parent_phone: '', parent_email: '', critical_medical_info: '',
    dietary_requirements: '', medications: '',
  });

  const fetchCamperData = useCallback(async () => {
    if (!id) return;
    setLoadingData(true);
    const { data, error } = await getCamper(id);
    if (error) setFetchError(error);
    else setCamper(data as CamperData);
    setLoadingData(false);
  }, [id]);

  useEffect(() => { fetchCamperData(); }, [fetchCamperData]);

  const openEdit = () => {
    if (!camper) return;
    setEditForm({
      full_name:              camper.full_name ?? '',
      parent_name:            camper.parent_name ?? '',
      birth_date:             camper.birth_date ?? '',
      shirt_size:             camper.shirt_size ?? '',
      parent_phone:           camper.parent_phone ?? '',
      parent_email:           camper.parent_email ?? '',
      critical_medical_info:  camper.critical_medical_info ?? '',
      dietary_requirements:   camper.dietary_requirements ?? '',
      medications:            camper.medications ?? '',
    });
    setSaveError(null);
    setIsEditOpen(true);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    const updates = {
      full_name:              editForm.full_name              || null,
      parent_name:            editForm.parent_name            || null,
      birth_date:             editForm.birth_date             || null,
      shirt_size:             editForm.shirt_size             || null,
      parent_phone:           editForm.parent_phone           || null,
      parent_email:           editForm.parent_email           || null,
      critical_medical_info:  editForm.critical_medical_info  || null,
      dietary_requirements:   editForm.dietary_requirements   || null,
      medications:            editForm.medications            || null,
    };
    const { error } = await updateCamper(id, updates);
    setSaving(false);
    if (error) {
      setSaveError(error);
    } else {
      setCamper((prev) => prev ? { ...prev, ...updates } : prev);
      setIsEditOpen(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'פרטים אישיים',  icon: 'person'            },
    { id: 'medical',  label: 'מידע רפואי',     icon: 'health_and_safety' },
    { id: 'docs',     label: 'מסמכים',          icon: 'description'       },
  ];

  // ── Loading ──
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
          <p className="text-sm font-bold">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (fetchError || !camper) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">
          <span className="material-symbols-outlined text-4xl block mb-2">error</span>
          <p className="font-bold">שגיאה בטעינת הפרופיל</p>
          <p className="text-sm text-slate-400 mt-1">{fetchError}</p>
        </div>
      </div>
    );
  }

  const avatarUrl = camper.profile_image_url ?? placeholderAvatar(camper.full_name);

  return (
    <div className="max-w-4xl mx-auto pb-12" dir="rtl">
      {/* Back button — staff only (camper landed directly here) */}
      {userRole === 'staff' && (
        <button
          onClick={() => navigate('/campers')}
          className="flex items-center gap-1.5 mb-6 text-sm font-bold text-slate-500 hover:text-summer-sky transition-colors group"
        >
          <Icon name="chevron_right" className="text-xl text-slate-400 group-hover:text-summer-sky transition-colors" />
          <span>חזרה לרשימת חניכים</span>
        </button>
      )}

      {/* Profile Header */}
      <Card variant="glass" className="rounded-lg p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-summer-sky to-vibrant-pink opacity-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-32 h-32 rounded-lg border-4 border-white shadow-soft overflow-hidden -mt-12 bg-white">
            <img
              src={avatarUrl}
              alt={camper.full_name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = placeholderAvatar(camper.full_name); }}
            />
          </div>

          <div className="text-center md:text-right flex-1">
            <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3 mb-2">
              <h1 className="text-h1-display text-deep-slate">{camper.full_name}</h1>
              <Badge variant="success" className="uppercase tracking-wider">רשום/ה</Badge>
            </div>
            <p className="text-body-medium text-slate-500 font-medium">חניך</p>
          </div>

          <div className="flex gap-3">
            {camper.parent_phone && (
              <a
                href={`tel:${camper.parent_phone}`}
                className="p-4 rounded-md bg-slate-100 text-slate-500 hover:bg-summer-sky hover:text-white transition-all shadow-sm"
              >
                <Icon name="call" className="text-2xl" />
              </a>
            )}
            <button className="p-4 rounded-md bg-slate-100 text-slate-500 hover:bg-summer-sky hover:text-white transition-all shadow-sm">
              <Icon name="chat" className="text-2xl" />
            </button>
            {/* Edit button — staff only */}
            {userRole === 'staff' && (
              <Button onClick={openEdit}>
                <Icon name="edit" className="text-lg" />
                עריכת פרופיל
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-container-low rounded-md mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-md font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-deep-slate shadow-soft'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon name={tab.icon} className="text-xl" fill={activeTab === tab.id} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">

        {/* ── פרטים אישיים ── */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="glass" className="p-6 rounded-lg">
              <h3 className="text-h2-section mb-4 text-deep-slate">פרטי קשר הורים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">שם ההורה:</span>
                  <span className="font-bold">{camper.parent_name ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">טלפון:</span>
                  <span className="font-bold" dir="ltr">{camper.parent_phone ?? '—'}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">אימייל:</span>
                  <span className="font-bold" dir="ltr">{camper.parent_email ?? '—'}</span>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6 rounded-lg">
              <h3 className="text-h2-section mb-4 text-deep-slate">פרטים לוגיסטיים</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">תאריך לידה:</span>
                  <span className="font-bold">{formatBirthDate(camper.birth_date)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <span className="text-caption-bold text-slate-400">מידת חולצה:</span>
                  <span className="font-bold">{camper.shirt_size ?? '—'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── מידע רפואי ── */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            {camper.critical_medical_info ? (
              <div className="bg-red-50 border-2 border-red-100 p-6 rounded-lg flex items-start gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-md shrink-0">
                  <Icon name="warning" fill className="text-2xl" />
                </div>
                <div className="text-right">
                  <h3 className="text-h2-section text-red-700 mb-1">מידע קריטי - אלרגיות</h3>
                  <p className="text-red-600 font-bold text-xl">{camper.critical_medical_info}</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-100 p-6 rounded-lg flex items-start gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-md shrink-0">
                  <Icon name="check_circle" fill className="text-2xl" />
                </div>
                <div className="text-right">
                  <h3 className="text-h2-section text-green-700 mb-1">מידע קריטי - אלרגיות</h3>
                  <p className="text-green-600 font-bold">אין מידע קריטי רשום</p>
                </div>
              </div>
            )}

            <Card variant="glass" className="p-6 rounded-lg">
              <h3 className="text-h2-section mb-4 text-deep-slate">הערות רפואיות ודיאטה</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-slate-50">
                  <p className="text-caption-bold text-slate-400 mb-1">דיאטה מיוחדת:</p>
                  <p className="font-bold">{camper.dietary_requirements ?? '—'}</p>
                </div>
                <div className="p-4 rounded-md bg-slate-50">
                  <p className="text-caption-bold text-slate-400 mb-1">תרופות קבועות:</p>
                  <p className="font-bold">{camper.medications ?? '—'}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ── מסמכים ── */}
        {activeTab === 'docs' && (
          <Card variant="glass" className="p-6 rounded-lg">
            <h3 className="text-h2-section mb-4 text-deep-slate">מסמכים שהועלו</h3>
            <div className="space-y-3">
              {[
                { name: 'אישור רפואי חתום.pdf', size: '1.2 MB', date: '01/05/2024' },
                { name: 'צילום דרכון.jpg',       size: '2.4 MB', date: '28/04/2024' },
                { name: 'פוליסת ביטוח.pdf',       size: '0.8 MB', date: '15/04/2024' },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-md text-slate-400 group-hover:text-summer-sky transition-colors">
                      <Icon name="description" className="text-xl" />
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{doc.name}</p>
                      <p className="text-caption-bold text-slate-400">{doc.size} • הועלה ב-{doc.date}</p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-summer-sky">
                    <Icon name="download" className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          Edit Profile Modal (staff only)
          ═══════════════════════════════════════════════ */}
      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          dir="rtl"
          onClick={(e) => { if (e.target === e.currentTarget) setIsEditOpen(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <Icon name="close" className="text-xl" />
              </button>
              <div className="text-right">
                <h2 className="font-black text-deep-slate text-lg">עריכת פרופיל חניך</h2>
                <p className="text-xs text-slate-400">{camper.full_name}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">

              {saveError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                  <Icon name="error" className="text-red-500 text-lg shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

              {/* ── פרטי החניך ── */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right mb-3">פרטי החניך/ה</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">שם מלא</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">תאריך לידה</label>
                    <input
                      type="date"
                      value={editForm.birth_date}
                      onChange={(e) => setEditForm((f) => ({ ...f, birth_date: e.target.value }))}
                      className={`${fieldClass} text-left`}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">מידת חולצה</label>
                    <div className="flex gap-2 flex-wrap justify-end">
                      {SHIRT_SIZES.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setEditForm((f) => ({ ...f, shirt_size: size }))}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                            editForm.shirt_size === size
                              ? 'border-summer-sky bg-sky-50 text-summer-sky'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── פרטי הורה ── */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right mb-3">פרטי ההורה</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">שם ההורה</label>
                    <input
                      type="text"
                      value={editForm.parent_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, parent_name: e.target.value }))}
                      className={fieldClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">טלפון</label>
                    <input
                      type="tel"
                      value={editForm.parent_phone}
                      onChange={(e) => setEditForm((f) => ({ ...f, parent_phone: e.target.value }))}
                      className={`${fieldClass} text-left placeholder:text-right`}
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">אימייל הורה</label>
                    <input
                      type="email"
                      value={editForm.parent_email}
                      onChange={(e) => setEditForm((f) => ({ ...f, parent_email: e.target.value }))}
                      className={`${fieldClass} text-left`}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* ── מידע רפואי ── */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right mb-3">מידע רפואי</p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-red-500 text-right flex items-center justify-end gap-1">
                      <Icon name="warning" fill className="text-sm" />
                      מידע קריטי - אלרגיות
                    </label>
                    <textarea
                      value={editForm.critical_medical_info}
                      onChange={(e) => setEditForm((f) => ({ ...f, critical_medical_info: e.target.value }))}
                      placeholder="אלרגיות, מצבים קריטיים..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">הערות תזונה</label>
                    <textarea
                      value={editForm.dietary_requirements}
                      onChange={(e) => setEditForm((f) => ({ ...f, dietary_requirements: e.target.value }))}
                      placeholder="צמחוני, ללא גלוטן..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">תרופות קבועות</label>
                    <textarea
                      value={editForm.medications}
                      onChange={(e) => setEditForm((f) => ({ ...f, medications: e.target.value }))}
                      placeholder="שם תרופה, מינון, תדירות..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                ביטול
              </button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Icon name="refresh" className="text-lg animate-spin" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="text-lg" />
                    שמירת שינויים
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
