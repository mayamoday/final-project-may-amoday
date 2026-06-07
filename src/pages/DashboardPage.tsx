import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';

const quickActions = [
  { icon: 'account_balance_wallet', label: 'דו"ח תקציב', sub: 'צפייה ועדכון הוצאות', color: 'bg-pink-100', textColor: 'text-vibrant-pink', borderHover: 'hover:border-vibrant-pink/30', path: '/expenses' },
  { icon: 'emergency', label: 'דיווח אירוע', sub: 'דיווח בטיחותי מיידי', color: 'bg-sky-100', textColor: 'text-summer-sky', borderHover: 'hover:border-summer-sky/30', path: '/incidents' },
  { icon: 'database', label: 'מאגר פעילויות', sub: 'חיפוש והפעלת תכנים', color: 'bg-orange-100', textColor: 'text-sunset-orange', borderHover: 'hover:border-sunset-orange/30', path: '#' },
  { icon: 'upload', label: 'העלאת פוסט', sub: 'עדכון הורים ברשתות', color: 'bg-yellow-100', textColor: 'text-sunshine-yellow', borderHover: 'hover:border-sunshine-yellow/30', path: '/feed' },
];

const campers = [
  { id: 1, name: 'מאיה לוי', group: "שבט ג' - אוהל 4", allergy: 'אלרגיה לבוטנים', docStatus: 'מאושר', docOk: true },
  { id: 2, name: 'נועם כהן', group: "שבט ג' - אוהל 2", allergy: null, docStatus: 'חסרה הצהרת בריאות', docOk: false },
  { id: 3, name: 'עידן מזרחי', group: "שבט ד' - אוהל 1", allergy: 'אלרגיה ללקטוז', docStatus: 'מאושר', docOk: true },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!user) return;

    async function resolveDisplayName() {
      // Check staff table first
      const { data: staffRow } = await supabase
        .from('staff')
        .select('full_name')
        .eq('id', user!.id)
        .maybeSingle();

      if (staffRow?.full_name) {
        setDisplayName(staffRow.full_name);
        return;
      }

      // Fall back to camper table — show parent_name
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

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">

      {/* ── Welcome Header ── */}
      <PageHeader
        title={`שלום, ${displayName || '...'} 👋`}
        subtitle="הנה מה שקורה היום בקייטנה"
        actions={
          <Card className="px-4 py-2.5 flex items-center gap-2">
            <Icon name="calendar_today" className="text-vibrant-pink text-xl" fill />
            <span className="font-bold text-slate-700 text-sm">14 ביולי, 2024</span>
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
            <div className="flex items-baseline gap-2 mb-2 justify-end">
              <span className="text-xs text-slate-400">מתוך $15,000</span>
              <span className="text-4xl font-black text-deep-slate">85%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-vibrant-pink h-full rounded-full transition-all duration-700" style={{ width: '85%' }} />
            </div>
          </div>
          <p className="text-xs text-vibrant-pink font-bold mt-4 text-right">⚠ חריגה קלה בסעיף מזון</p>
        </Card>

        {/* 3 stat cards */}
        <div className="md:col-span-8 grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-2">משימות פתוחות</p>
            <p className="text-4xl font-black text-deep-slate">12</p>
            <Badge variant="danger" className="mt-2">4 בעדיפות גבוהה</Badge>
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-2">פניות הורים</p>
            <p className="text-4xl font-black text-deep-slate">4</p>
            <Badge variant="info" className="mt-2">ממתין למענה</Badge>
          </div>
          <div className="stat-card">
            <p className="text-slate-500 text-xs mb-2">אירועי בטיחות</p>
            <p className="text-4xl font-black text-deep-slate">0</p>
            <Badge variant="success" className="mt-2">הכל תקין ✓</Badge>
          </div>
        </div>
      </div>

      {/* ── Camper Status Table ── */}
      <Card className="overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <button
            onClick={() => navigate('/camper/1')}
            className="text-summer-sky text-sm font-bold flex items-center gap-1 hover:underline"
          >
            צפייה בכל הרשימה
            <Icon name="chevron_left" className="text-sm" />
          </button>
          <h2 className="text-h2-section text-deep-slate font-bold">סטטוס חיוני — חניכים</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="text-slate-400 text-xs border-b border-slate-50">
                <th className="px-8 py-4 font-bold">שם החניך</th>
                <th className="px-8 py-4 font-bold">מידע קריטי</th>
                <th className="px-8 py-4 font-bold">סטטוס מסמכים</th>
                <th className="px-8 py-4 font-bold">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campers.map((camper) => (
                <tr key={camper.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={camper.name[0]} size="lg" />
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{camper.name}</p>
                        <p className="text-xs text-slate-400">{camper.group}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {camper.allergy ? (
                      <Badge variant="danger">{camper.allergy}</Badge>
                    ) : (
                      <span className="text-xs text-slate-400">אין מידע רפואי חריג</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-sm text-slate-600">{camper.docStatus}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${camper.docOk ? 'bg-green-500' : 'bg-orange-400'}`} />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/camper/${camper.id}`)}
                        className="p-2 text-slate-300 hover:text-summer-sky hover:bg-sky-50 rounded-lg transition-all"
                      >
                        <Icon name="visibility" className="text-lg" />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-vibrant-pink hover:bg-pink-50 rounded-lg transition-all">
                        <Icon name="call" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Bottom Row: Incident + Schedule ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-vibrant-pink to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-pink-200/40">
          <h3 className="text-h2-section font-bold mb-2 text-white">דיווח אירוע חריג</h3>
          <p className="text-white/80 text-sm mb-6">דווח על אירוע בטיחות או רפואי בזמן אמת למפקדה</p>
          <button
            onClick={() => navigate('/incidents')}
            className="w-full bg-white text-vibrant-pink font-black py-3.5 rounded-xl shadow-lg hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Icon name="emergency_home" fill className="text-xl" />
            <span>פתח דיווח חירום</span>
          </button>
        </div>

        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-deep-slate mb-5 text-right">לו"ז יומי — 14 יולי</h3>
          <div className="space-y-4">
            {[
              { time: '16:00', title: 'סדנת יצירה', sub: 'חטיבה תחתונה', active: true },
              { time: '17:30', title: 'זמן חופשי', sub: 'בריכה/מגרשים', active: false },
              { time: '19:30', title: 'ארוחת ערב', sub: 'חדר אוכל מרכזי', active: false },
              { time: '21:00', title: 'פעילות ערב', sub: 'כיכר המרכזית', active: false },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className={`font-bold text-xs pt-1 w-12 text-left ${item.active ? 'text-summer-sky' : 'text-slate-400'}`}>{item.time}</span>
                <div className={`pr-4 border-r-2 flex-1 text-right ${item.active ? 'border-summer-sky' : 'border-slate-100'}`}>
                  <p className={`font-bold text-sm ${item.active ? 'text-deep-slate' : 'text-slate-500'}`}>{item.title}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
