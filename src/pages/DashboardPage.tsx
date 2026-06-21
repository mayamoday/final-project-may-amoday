import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { TOTAL_BUDGET } from '../lib/budget';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import ParentInquiryComposerModal, { type ParentInquiry } from '../components/ParentInquiryComposerModal';

// ─── Config ───────────────────────────────────────────────────────────────────

const quickActions = [
  { icon: 'account_balance_wallet', label: 'דו"ח תקציב', sub: 'צפייה ועדכון הוצאות', color: 'bg-pink-100', textColor: 'text-vibrant-pink', borderHover: 'hover:border-vibrant-pink/30', path: '/expenses' },
  { icon: 'emergency', label: 'דיווח אירוע', sub: 'דיווח בטיחותי מיידי', color: 'bg-sky-100', textColor: 'text-summer-sky', borderHover: 'hover:border-summer-sky/30', path: '/incidents' },
  { icon: 'database', label: 'מאגר פעילויות', sub: 'חיפוש והפעלת תכנים', color: 'bg-orange-100', textColor: 'text-sunset-orange', borderHover: 'hover:border-sunset-orange/30', path: '/knowledge' },
  { icon: 'upload', label: 'העלאת פוסט', sub: 'עדכון הורים ברשתות', color: 'bg-yellow-100', textColor: 'text-sunshine-yellow', borderHover: 'hover:border-sunshine-yellow/30', path: '/feed' },
];

const statusBadge: Record<string, 'warning' | 'success'> = {
  'ממתין למענה': 'warning',
  'טופל':        'success',
};

function safeAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('he-IL');
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [displayName, setDisplayName] = useState('');

  // Stats
  const [totalSpent, setTotalSpent]             = useState(0);
  const [openTasksCount, setOpenTasksCount]     = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [incidentCount, setIncidentCount]       = useState(0);
  const [severeIncidentCount, setSevereIncidentCount] = useState(0);

  // Parent inquiries
  const [inquiries, setInquiries]   = useState<ParentInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [activeInquiry, setActiveInquiry] = useState<ParentInquiry | null>(null);
  const [composerOpen, setComposerOpen]   = useState(false);

  useEffect(() => {
    if (!user) return;

    async function resolveDisplayName() {
      const { data: staffRow } = await supabase
        .from('staff')
        .select('full_name')
        .eq('id', user!.id)
        .maybeSingle();

      if (staffRow?.full_name) {
        setDisplayName(staffRow.full_name);
        return;
      }

      const { data: camperRow } = await supabase
        .from('camper')
        .select('parent_name')
        .eq('id', user!.id)
        .maybeSingle();

      if (camperRow?.parent_name) {
        setDisplayName(camperRow.parent_name);
      }
    }

    resolveDisplayName();
  }, [user]);

  useEffect(() => {
    fetchStats();
    fetchInquiries();
  }, []);

  async function fetchStats() {
    const [expenseRes, tasksRes, eventsRes] = await Promise.all([
      supabase.from('expense').select('amount'),
      supabase.from('tasks').select('status, priority'),
      supabase.from('events').select('severity'),
    ]);

    if (expenseRes.error) console.error(expenseRes.error);
    setTotalSpent((expenseRes.data ?? []).reduce((sum, e) => sum + safeAmount(e.amount), 0));

    if (tasksRes.error) console.error(tasksRes.error);
    const openTasks = (tasksRes.data ?? []).filter(t => t.status !== 'הושלם');
    setOpenTasksCount(openTasks.length);
    setHighPriorityCount(openTasks.filter(t => t.priority === 'גבוהה').length);

    if (eventsRes.error) console.error(eventsRes.error);
    const events = eventsRes.data ?? [];
    setIncidentCount(events.length);
    setSevereIncidentCount(events.filter(e => e.severity === 'גבוה' || e.severity === 'קריטי').length);
  }

  async function fetchInquiries() {
    setLoadingInquiries(true);
    const { data, error } = await supabase
      .from('parent_inquiries')
      .select('id, parent_name, subject, status, created_at, camper_id')
      .order('created_at', { ascending: false })
      .limit(8);

    if (error) console.error(error);
    setInquiries((data ?? []) as ParentInquiry[]);
    setLoadingInquiries(false);
  }

  const pendingInquiries = inquiries.filter(i => i.status === 'ממתין למענה').length;
  const usedPct = TOTAL_BUDGET > 0 ? Math.min(100, Math.round((totalSpent / TOTAL_BUDGET) * 100)) : 0;
  const isOverBudget = totalSpent > TOTAL_BUDGET;

  const openInquiry = (inquiry: ParentInquiry) => {
    setActiveInquiry(inquiry);
    setComposerOpen(true);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto" dir="rtl">

      {/* ── Welcome Header ── */}
      <PageHeader
        title={`שלום, ${displayName || '...'} 👋`}
        subtitle="הנה מה שקורה היום במחנה"
        actions={
          <Card className="px-4 py-2.5 flex items-center gap-2">
            <Icon name="calendar_today" className="text-vibrant-pink text-xl" fill />
            <span className="font-bold text-slate-700 text-sm">{new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </Card>
        }
      />

      {/* ── Quick Actions Bento ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`group bg-white p-6 rounded-2xl shadow-soft border border-slate-100 ${action.borderHover} hover:shadow-xl transition-all duration-300 text-right active:scale-95`}
          >
            <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon name={action.icon} fill className={`text-2xl ${action.textColor}`} />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{action.label}</h3>
            <p className="text-xs text-slate-500 mt-1">{action.sub}</p>
          </button>
        ))}
      </div>

      {/* ── Stats Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Budget */}
        <Card className="md:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <Icon name="trending_up" className="text-slate-400 text-xl" />
              <h3 className="font-bold text-slate-800 text-sm">ניצול תקציב</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-2 justify-start">
              <span className="text-4xl font-black text-deep-slate">{usedPct}%</span>
              <span className="text-xs text-slate-400">מתוך ₪{TOTAL_BUDGET.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ml-auto transition-all duration-700 ${isOverBudget ? 'bg-error' : 'bg-vibrant-pink'}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
          {isOverBudget && (
            <p className="text-xs text-error font-bold mt-4 text-right">⚠ חריגה מהתקציב</p>
          )}
        </Card>

        {/* 3 stat cards */}
        <div className="md:col-span-8 grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-2">משימות פתוחות</p>
            <p className="text-4xl font-black text-deep-slate">{openTasksCount}</p>
            {highPriorityCount > 0
              ? <Badge variant="danger" className="mt-2">{highPriorityCount} בעדיפות גבוהה</Badge>
              : <Badge variant="success" className="mt-2">הכל תקין ✓</Badge>}
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-2">פניות הורים</p>
            <p className="text-4xl font-black text-deep-slate">{inquiries.length}</p>
            {pendingInquiries > 0
              ? <Badge variant="info" className="mt-2">{pendingInquiries} ממתינות למענה</Badge>
              : <Badge variant="success" className="mt-2">הכל טופל ✓</Badge>}
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-2">דיווחי אירועים</p>
            <p className="text-4xl font-black text-deep-slate">{incidentCount}</p>
            {severeIncidentCount > 0
              ? <Badge variant="danger" className="mt-2">{severeIncidentCount} בחומרה גבוהה</Badge>
              : <Badge variant="success" className="mt-2">הכל תקין ✓</Badge>}
          </div>
        </div>
      </div>

      {/* ── Parent Inquiries Section ── */}
      <Card className="overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between flex-row-reverse items-center bg-slate-50/30" dir="rtl">
          <span className="text-xs text-slate-400">{inquiries.length} פניות אחרונות</span>
          <h2 className="text-h2-section text-deep-slate font-bold">מעקב פניות הורים</h2>
        </div>

        {loadingInquiries ? (
          <p className="text-right px-8 text-slate-400 text-sm py-10">טוען פניות...</p>
        ) : inquiries.length === 0 ? (
          <p className="text-right px-8 text-slate-400 text-sm py-10">אין פניות הורים כרגע</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-50">
                  <th className="px-8 py-4 font-bold text-right">שם ההורה</th>
                  <th className="px-8 py-4 font-bold text-right">נושא</th>
                  <th className="px-8 py-4 font-bold text-right">תאריך</th>
                  <th className="px-8 py-4 font-bold text-right">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inquiries.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => openInquiry(inquiry)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-5 font-bold text-slate-800 text-sm">{inquiry.parent_name}</td>
                    <td className="px-8 py-5 text-sm text-slate-600">{inquiry.subject}</td>
                    <td className="px-8 py-5 text-sm text-slate-400 whitespace-nowrap">{formatDate(inquiry.created_at)}</td>
                    <td className="px-8 py-5">
                      <Badge variant={statusBadge[inquiry.status] ?? 'neutral'}>{inquiry.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ParentInquiryComposerModal
        isOpen={composerOpen}
        inquiry={activeInquiry}
        onClose={() => setComposerOpen(false)}
      />
    </div>
  );
}
