import { useState } from 'react';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
        checked ? 'bg-vibrant-pink' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
          checked ? 'right-1' : 'right-7'
        }`}
      />
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 bg-slate-50/40 text-right">
        <Icon name={icon} fill className="text-xl text-summer-sky" />
        <h2 className="font-bold text-deep-slate">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </Card>
  );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────

function SettingRow({
  label, description, children,
}: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>{children}</div>
      <div className="text-right">
        <p className="text-sm font-bold text-deep-slate">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [saved, setSaved]               = useState(false);

  // Profile state
  const [name, setName]                 = useState('מאי עמודי');
  const [role, setRole]                 = useState('ראש משלחת');
  const [email, setEmail]               = useState('may.amudi@camp.org.il');
  const [phone, setPhone]               = useState('054-1234567');

  // Notifications
  const [pushNotif, setPushNotif]       = useState(true);
  const [emailNotif, setEmailNotif]     = useState(true);
  const [waNotif, setWaNotif]           = useState(false);
  const [incidentAlert, setIncidentAlert] = useState(true);
  const [parentMsg, setParentMsg]       = useState(true);
  const [dailySummary, setDailySummary] = useState(false);

  // Preferences
  const [language, setLanguage]         = useState('he');
  const [compactView, setCompactView]   = useState(false);
  const [showAvatars, setShowAvatars]   = useState(true);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6" dir="rtl">
      <PageHeader
        title="הגדרות חשבון"
        subtitle="נהל את הפרופיל, ההתראות וההעדפות שלך"
        icon="settings"
        iconColor="text-slate-500"
      />

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-right">
          <Icon name="check_circle" fill className="text-xl text-emerald-500 shrink-0" />
          <p className="text-sm font-bold text-emerald-700">ההגדרות נשמרו בהצלחה!</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Profile Section ── */}
        <Section title="פרופיל אישי" icon="person">
          {/* Avatar area */}
          <div className="flex items-center gap-5 pb-4 border-b border-slate-50 text-right">
            <div className="relative">
              <Avatar
                src="https://ui-avatars.com/api/?name=Mai+Amudi&background=7dd3fc&color=fff&size=128"
                size="xl"
                className="border-4 border-white shadow-soft"
              />
              <button
                type="button"
                className="absolute bottom-1 left-1 w-8 h-8 bg-vibrant-pink rounded-full flex items-center justify-center text-white shadow-md hover:brightness-110 transition-all"
              >
                <Icon name="photo_camera" fill className="text-sm" />
              </button>
            </div>
            <div>
              <p className="text-xl font-black text-deep-slate">{name}</p>
              <Badge variant="info" className="mt-1">{role}</Badge>
              <p className="text-xs text-slate-400 mt-2">קיץ 2024 • משלחת ישראל</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'שם מלא', value: name,  onChange: setName,  type: 'text'  },
              { label: 'תפקיד',  value: role,  onChange: setRole,  type: 'text'  },
              { label: 'אימייל', value: email, onChange: setEmail, type: 'email' },
              { label: 'טלפון',  value: phone, onChange: setPhone, type: 'tel'   },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 text-right">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-summer-sky/30 outline-none text-right"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Notifications Section ── */}
        <Section title="ניהול התראות" icon="notifications">
          <SettingRow label="התראות Push" description="קבל התראות ישירות לטלפון">
            <Toggle checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />
          </SettingRow>
          <SettingRow label="עדכונים לאימייל" description="קבל דוחות ועדכונים לתיבת הדואר">
            <Toggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
          </SettingRow>
          <SettingRow label="התראות WhatsApp" description="שלח עדכונים חשובים לקבוצת הוואטסאפ">
            <Toggle checked={waNotif} onChange={() => setWaNotif(!waNotif)} />
          </SettingRow>

          <div className="border-t border-slate-50 pt-4 space-y-4">
            <p className="text-xs font-bold text-slate-400 text-right uppercase tracking-wider">סוגי התראות</p>
            <SettingRow label="התראות אירועי בטיחות" description="קבל התראה מיידית על כל אירוע חריג">
              <Toggle checked={incidentAlert} onChange={() => setIncidentAlert(!incidentAlert)} />
            </SettingRow>
            <SettingRow label="הודעות מהורים" description="קבל עדכון כשהורה שולח הודעה חדשה">
              <Toggle checked={parentMsg} onChange={() => setParentMsg(!parentMsg)} />
            </SettingRow>
            <SettingRow label="סיכום יומי" description="קבל סיכום כל לילה בשעה 21:00">
              <Toggle checked={dailySummary} onChange={() => setDailySummary(!dailySummary)} />
            </SettingRow>
          </div>
        </Section>

        {/* ── Display Preferences ── */}
        <Section title="העדפות תצוגה" icon="tune">
          <SettingRow label="שפת ממשק" description="שפת הממשק הנוכחית">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-summer-sky/30 outline-none text-right"
            >
              <option value="he">עברית</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </SettingRow>
          <SettingRow label="תצוגה דחוסה" description="הצג יותר תוכן עם ריווח קטן יותר">
            <Toggle checked={compactView} onChange={() => setCompactView(!compactView)} />
          </SettingRow>
          <SettingRow label="הצג תמונות פרופיל" description="הצג תמונות ואווטארים ברשימות">
            <Toggle checked={showAvatars} onChange={() => setShowAvatars(!showAvatars)} />
          </SettingRow>
        </Section>

        {/* ── Security Section ── */}
        <Section title="אבטחה וסיסמה" icon="lock">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'סיסמה נוכחית', placeholder: '••••••••' },
              { label: 'סיסמה חדשה',   placeholder: 'הכנס סיסמה חדשה...' },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 text-right">{field.label}</label>
                <input
                  type="password"
                  placeholder={field.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-right">
            <Icon name="info" fill className="text-amber-500 text-lg shrink-0" />
            <p className="text-xs text-amber-700">
              הסיסמה צריכה להכיל לפחות 8 תווים, אות גדולה ומספר אחד.
            </p>
          </div>
        </Section>

        {/* ── Save / Danger Zone ── */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" type="button" className="text-red-400 border-red-100 hover:bg-red-50">
            <Icon name="person_remove" className="text-lg text-red-400" />
            מחיקת חשבון
          </Button>
          <Button variant="secondary" type="submit">
            <Icon name="save" className="text-lg" />
            שמור שינויים
          </Button>
        </div>
      </form>
    </div>
  );
}
