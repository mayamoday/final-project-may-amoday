import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

type IncidentType = 'רפואי' | 'בטיחות' | 'התנהגות' | 'אחר';
type Severity     = 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי';

interface Camper {
  id: string;
  full_name: string;
}

interface RecentEvent {
  id: string;
  event_type: string;
  severity: string;
  event_date: string;
  description: string | null;
  camper: { full_name: string }[] | null;
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const incidentTypes: { value: IncidentType; icon: string; bg: string; text: string }[] = [
  { value: 'רפואי',    icon: 'local_hospital', bg: 'bg-red-100',    text: 'text-red-500'       },
  { value: 'בטיחות',  icon: 'warning',         bg: 'bg-orange-100', text: 'text-sunset-orange' },
  { value: 'התנהגות', icon: 'psychology',      bg: 'bg-sky-100',    text: 'text-summer-sky'    },
  { value: 'אחר',     icon: 'help_outline',    bg: 'bg-slate-100',  text: 'text-slate-500'     },
];

const severities: { value: Severity; active: string; inactive: string }[] = [
  { value: 'נמוך',   active: 'bg-emerald-500 text-white',   inactive: 'bg-emerald-50 text-emerald-600 border border-emerald-200'  },
  { value: 'בינוני', active: 'bg-amber-400 text-white',     inactive: 'bg-amber-50 text-amber-600 border border-amber-200'       },
  { value: 'גבוה',  active: 'bg-sunset-orange text-white', inactive: 'bg-orange-50 text-orange-500 border border-orange-200'    },
  { value: 'קריטי', active: 'bg-error text-white',         inactive: 'bg-red-50 text-red-600 border border-red-200'             },
];

const severityBadge: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  נמוך: 'success', בינוני: 'warning', גבוה: 'danger', קריטי: 'danger',
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IncidentReportPage() {
  const { user } = useAuth();

  // Form state
  const [incidentType, setIncidentType]     = useState<IncidentType | null>(null);
  const [severity, setSeverity]             = useState<Severity | null>(null);
  const [eventDate, setEventDate]           = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime]           = useState(new Date().toTimeString().slice(0, 5));
  const [location, setLocation]             = useState('');
  const [selectedCamper, setSelectedCamper] = useState('');
  const [witnesses, setWitnesses]           = useState<string[]>([]);
  const [showWitnessList, setShowWitnessList] = useState(false);
  const [description, setDescription]      = useState('');
  const [actionsTaken, setActionsTaken]     = useState('');
  const [followUp, setFollowUp]             = useState(false);

  // Data
  const [campers, setCampers]         = useState<Camper[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  // UI state
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from('camper')
      .select('id, full_name')
      .order('full_name')
      .then(({ data }) => setCampers(data ?? []));

    fetchRecentEvents();
  }, []);

  async function fetchRecentEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, event_type, severity, event_date, description, camper(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);
    setRecentEvents((data ?? []) as unknown as RecentEvent[]);
  }

  const toggleWitness = (id: string) => {
    setWitnesses(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setIncidentType(null);
    setSeverity(null);
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime(new Date().toTimeString().slice(0, 5));
    setLocation('');
    setSelectedCamper('');
    setWitnesses([]);
    setDescription('');
    setActionsTaken('');
    setFollowUp(false);
    setError(null);
    setShowWitnessList(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!incidentType || !severity) {
      setError('יש לבחור סוג אירוע וחומרה');
      return;
    }

    setLoading(true);
    setError(null);

    const witnessNames = witnesses
      .map(id => campers.find(c => c.id === id)?.full_name ?? '')
      .filter(Boolean)
      .join(', ');

    const { error: insertError } = await supabase.from('events').insert({
      event_type:          incidentType,
      severity,
      event_date:          eventDate,
      event_time:          eventTime,
      location,
      camper_id:           selectedCamper || null,
      witnesses:           witnessNames,
      description,
      actions_taken:       actionsTaken,
      requires_follow_up:  followUp,
      reporter_id:         user.id,
    });

    setLoading(false);

    if (insertError) {
      setError(`שגיאה בשליחת הדיווח: ${insertError.message}`);
      return;
    }

    setSubmitted(true);
    resetForm();
    await fetchRecentEvents();
    setTimeout(() => setSubmitted(false), 4000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Card className="p-16">
          <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Icon name="check_circle" fill className="text-5xl" />
          </div>
          <h2 className="text-h2-section text-deep-slate font-bold mb-2">הדיווח נשלח בהצלחה!</h2>
          <p className="text-body-medium text-slate-500 mb-8">
            הדיווח הועבר למפקדה ולנציג הבטיחות.
          </p>
          <Button variant="ghost" onClick={() => setSubmitted(false)}>
            <Icon name="add" className="text-lg" />
            דיווח אירוע חדש
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12" dir="rtl">

      {/* ── Critical Banner ── */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 mb-6 text-right">
        <div className="bg-error text-white p-2.5 rounded-xl shrink-0">
          <Icon name="emergency_home" fill className="text-xl" />
        </div>
        <div>
          <p className="font-bold text-red-700 text-sm">טופס דיווח אירוע חריג</p>
          <p className="text-xs text-red-500">מלא בצורה מדויקת — כל הפרטים נשמרים ומועברים לגורמי הבטיחות המוסמכים.</p>
        </div>
        <Badge variant="danger" className="mr-auto shrink-0">חובה</Badge>
      </div>

      <PageHeader
        title="דיווח על אירוע חריג"
        subtitle="תעד את פרטי האירוע בזמן אמת למניעת סיכונים עתידיים"
        icon="report_problem"
        iconColor="text-sunset-orange"
      />

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Incident Type ── */}
        <Card className="p-6">
          <h2 className="text-h2-section text-deep-slate font-bold mb-4 text-right">סוג האירוע</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {incidentTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setIncidentType(t.value)}
                className={`flex flex-col items-center gap-2.5 py-5 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 ${
                  incidentType === t.value
                    ? 'border-sunset-orange bg-orange-50 text-sunset-orange shadow-md'
                    : 'border-slate-100 text-slate-500 hover:border-sunset-orange/40'
                }`}
              >
                <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center`}>
                  <Icon name={t.icon} fill className={`text-2xl ${t.text}`} />
                </div>
                {t.value}
              </button>
            ))}
          </div>
        </Card>

        {/* ── Severity ── */}
        <Card className="p-6">
          <h2 className="text-h2-section text-deep-slate font-bold mb-4 text-right">חומרת האירוע</h2>
          <div className="flex gap-3 flex-wrap">
            {severities.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSeverity(s.value)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  severity === s.value ? s.active : s.inactive
                }`}
              >
                {s.value}
              </button>
            ))}
          </div>
        </Card>

        {/* ── Details Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Date + Time + Location */}
          <Card className="p-6 space-y-4">
            <h2 className="text-h2-section text-deep-slate font-bold text-right">מועד האירוע</h2>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 text-right">תאריך</label>
              <input
                required
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-summer-sky/30 outline-none text-right"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 text-right">שעה</label>
              <input
                required
                type="time"
                value={eventTime}
                onChange={e => setEventTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-summer-sky/30 outline-none text-right"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 text-right">מיקום האירוע</label>
              <input
                required
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="לדוגמה: מגרש הכדורסל, שביל 3..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400"
              />
            </div>
          </Card>

          {/* Camper + Witnesses + Reporter */}
          <Card className="p-6 space-y-4">
            <h2 className="text-h2-section text-deep-slate font-bold text-right">מעורבים באירוע</h2>

            {/* Involved camper */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 text-right">חניך מעורב</label>
              <select
                value={selectedCamper}
                onChange={(e) => setSelectedCamper(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right appearance-none"
              >
                <option value="">בחר חניך...</option>
                {campers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>

            {/* Witnesses multi-select */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 text-right">עדים לאירוע</label>
              <button
                type="button"
                onClick={() => setShowWitnessList(p => !p)}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm text-right hover:border-summer-sky transition-colors"
              >
                <Icon name={showWitnessList ? 'expand_less' : 'expand_more'} className="text-slate-400 text-lg" />
                <span className={witnesses.length > 0 ? 'text-deep-slate font-medium' : 'text-slate-400'}>
                  {witnesses.length > 0 ? `${witnesses.length} עדים נבחרו` : 'בחר עדים...'}
                </span>
              </button>

              {showWitnessList && (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-36 overflow-y-auto">
                  {campers.length === 0 ? (
                    <p className="text-xs text-slate-400 p-3 text-center">אין חניכים</p>
                  ) : (
                    campers.map(c => {
                      const isSelected = witnesses.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleWitness(c.id)}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? 'bg-summer-sky border-summer-sky' : 'border-slate-300'
                          }`}>
                            {isSelected && <Icon name="check" className="text-white text-[12px]" />}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{c.full_name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {witnesses.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {witnesses.map(id => {
                    const c = campers.find(x => x.id === id);
                    return c ? (
                      <span key={id} className="flex items-center gap-1 bg-sky-100 text-sky-700 text-xs font-bold px-2 py-1 rounded-full">
                        {c.full_name}
                        <button type="button" onClick={() => toggleWitness(id)} className="hover:text-sky-900 transition-colors">
                          <Icon name="close" className="text-[10px]" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Reporter (read-only) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 text-right">מדווח ע"י</label>
              <input
                type="text"
                value={user?.email ?? ''}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-summer-sky/30 outline-none text-right"
                readOnly
              />
            </div>
          </Card>
        </div>

        {/* ── Description ── */}
        <Card className="p-6 space-y-5">
          <h2 className="text-h2-section text-deep-slate font-bold text-right">תיאור מפורט</h2>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 text-right">תיאור האירוע</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="תאר בפירוט את מה שקרה: מה קדם לאירוע, מה בדיוק קרה, ומה מצבו של הנפגע..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400 resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 text-right">פעולות שננקטו בשטח</label>
            <textarea
              rows={3}
              value={actionsTaken}
              onChange={e => setActionsTaken(e.target.value)}
              placeholder="פרט את הטיפול הראשוני שניתן: מי טיפל, מה ניתן, האם הוזמנה עזרה חיצונית..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Follow-up toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setFollowUp(!followUp)}
              className={`relative w-12 h-6 rounded-full transition-colors ${followUp ? 'bg-vibrant-pink' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${followUp ? 'right-1' : 'right-7'}`} />
            </button>
            <div className="text-right">
              <p className="text-sm font-bold text-deep-slate">נדרש מעקב</p>
              <p className="text-xs text-slate-400">האירוע מצריך התייחסות נוספת מהמפקדה</p>
            </div>
          </div>
        </Card>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
            <Icon name="error" className="text-red-500 text-lg shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" type="button" onClick={() => window.history.back()}>
            ביטול וחזרה
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="bg-error shadow-red-200/40 text-base px-8"
          >
            {loading ? (
              <>
                <Icon name="refresh" className="text-xl animate-spin" />
                שולח...
              </>
            ) : (
              <>
                <Icon name="send" className="text-xl" />
                שליחת דיווח למפקדה
              </>
            )}
          </Button>
        </div>
      </form>

      {/* ── Recent Incidents ── */}
      <div className="mt-10">
        <h3 className="text-h2-section text-deep-slate font-bold mb-5 text-right">דיווחים אחרונים</h3>
        <div className="space-y-3">
          {recentEvents.length === 0 ? (
            <Card className="p-6 text-center text-slate-400 text-sm">אין דיווחים עדיין</Card>
          ) : (
            recentEvents.map((ev) => (
              <Card key={ev.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all">
                {/* Right side: icon + main text */}
                <div className="flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Icon name="emergency" fill className="text-xl text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-deep-slate text-sm line-clamp-1 max-w-[200px]">
                      {ev.description?.slice(0, 40) || '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {ev.camper?.[0]?.full_name ?? 'לא צוין'} • {ev.event_type}
                    </p>
                  </div>
                </div>
                {/* Left side: severity badge + date */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400">{formatDate(ev.event_date)}</span>
                  <Badge variant={severityBadge[ev.severity] ?? 'info'}>{ev.severity}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
