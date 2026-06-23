import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { useUIPreferences } from '../contexts/UIPreferencesContext';
import { useProfile } from '../contexts/ProfileContext';
import { supabase } from '../lib/supabase';

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
  const { user } = useAuth();
  const { language, setLanguage, compactView, setCompactView, showAvatars, setShowAvatars } = useUIPreferences();
  const { setProfile: setGlobalProfile } = useProfile();
  const [status, setStatus]             = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile state
  const [name, setName]                 = useState('');
  const [role, setRole]                 = useState('');
  const [email, setEmail]               = useState('');
  const [phone, setPhone]               = useState('');
  const [avatarUrl, setAvatarUrl]       = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [newPassword, setNewPassword]   = useState('');

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('full_name, role, email, phone, avatar_url')
          .eq('id', user!.id)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[SettingsPage] fetch profile failed:', error);
          return;
        }
        if (data) {
          setName(data.full_name ?? '');
          setRole(data.role ?? '');
          setEmail(data.email ?? '');
          setPhone(data.phone ?? '');
          setAvatarUrl(data.avatar_url ?? null);
        }
      } catch (err) {
        console.error('[SettingsPage] fetch profile threw:', err);
      }
    }

    fetchProfile();
  // AuthContext hands back a new `user` object reference on every token-refresh
  // event even when the id is unchanged — depend on the stable id, not the object,
  // or a background refresh while editing would silently overwrite in-progress changes.
  }, [user?.id]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    alert('מתחיל לשמור...');
    e.preventDefault();
    if (!user) return;

    setStatus('idle');
    setErrorMessage('');

    try {
      const { error } = await supabase
        .from('staff')
        .update({ full_name: name, role: role, email: email, phone: phone })
        .eq('id', user.id);

      if (error) {
        alert('שגיאה מהמחסן: ' + error.message);
        console.error('[SettingsPage] save profile failed:', error);
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      if (newPassword) {
        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });

        if (authError) {
          alert('שגיאה בעדכון הסיסמה: ' + authError.message);
          console.error('[SettingsPage] password update failed:', authError);
          setStatus('error');
          setErrorMessage(authError.message);
          return;
        }

        setNewPassword('');
      }

      alert('הפרטים נשמרו בהצלחה במחסן!');
      setGlobalProfile({ fullName: name });
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('[SettingsPage] save profile threw:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'אירעה שגיאה לא צפויה');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user) return;

    setAvatarUploading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const ext = /\.([a-zA-Z0-9]+)$/.exec(file.name)?.[1]?.toLowerCase() ?? 'jpg';
      const filePath = `${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) {
        console.error('[SettingsPage] avatar upload failed:', uploadError);
        setStatus('error');
        setErrorMessage(uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('staff')
        .update({ avatar_url: newUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('[SettingsPage] avatar_url update failed:', updateError);
        setStatus('error');
        setErrorMessage(updateError.message);
        return;
      }

      setAvatarUrl(newUrl);
      setGlobalProfile({ avatarUrl: newUrl });
    } catch (err) {
      console.error('[SettingsPage] avatar update threw:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'אירעה שגיאה לא צפויה');
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6" dir="rtl">
      <PageHeader
        title="הגדרות חשבון"
        subtitle="נהל את הפרופיל וההעדפות שלך"
        icon="settings"
        iconColor="text-slate-500"
      />

      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-right">
          <Icon name="check_circle" fill className="text-xl text-emerald-500 shrink-0" />
          <p className="text-sm font-bold text-emerald-700">ההגדרות נשמרו בהצלחה!</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-right">
          <Icon name="error" fill className="text-xl text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-600">שגיאה בשמירת הנתונים: {errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">

        {/* ── Profile Section ── */}
        <Section title="פרופיל אישי" icon="person">
          {/* Avatar area */}
          <div className="flex items-center gap-5 pb-4 border-b border-slate-50 text-right">
            <div className="relative">
              <Avatar
                src={avatarUrl ?? undefined}
                initials={name ? name.charAt(0) : '?'}
                size="xl"
                className="border-4 border-white shadow-soft"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-1 left-1 w-8 h-8 bg-vibrant-pink rounded-full flex items-center justify-center text-white shadow-md hover:brightness-110 transition-all disabled:opacity-60"
              >
                {avatarUploading ? (
                  <Icon name="refresh" className="text-sm animate-spin" />
                ) : (
                  <Icon name="photo_camera" fill className="text-sm" />
                )}
              </button>
            </div>
            <div>
              <p className="text-xl font-black text-deep-slate">{name}</p>
              <Badge variant="info" className="mt-1">{role}</Badge>
              <p className="text-xs text-slate-400 mt-2">משלחת למחנה קיץ EKC</p>
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

        {/* ── Display Preferences ── */}
        <Section title="העדפות תצוגה" icon="tune">
          <SettingRow label="שפת ממשק" description="שפת הממשק הנוכחית">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'he' | 'en' | 'ar')}
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
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">סיסמה נוכחית</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">סיסמה חדשה</label>
              <input
                type="password"
                placeholder="הכנס סיסמה חדשה..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400"
              />
            </div>
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
