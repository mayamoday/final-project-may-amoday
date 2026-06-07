import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Icon({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

type Role = 'staff' | 'camper';

const roles: { value: Role; label: string; description: string; icon: string }[] = [
  { value: 'staff',  label: 'סגל מחנה', description: 'מדריכים, ראשי משלחת וצוות', icon: 'badge'      },
  { value: 'camper', label: 'חניך',      description: 'ילד/ה הרשום/ה במחנה',        icon: 'child_care' },
];

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl py-3 pr-10 pl-4 text-sm focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all text-right placeholder:text-slate-400';

const textareaClass =
  'w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all text-right placeholder:text-slate-400 resize-none';

export default function SignUpPage() {
  // Account fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [role, setRole]         = useState<Role>('staff');
  const [showPwd, setShowPwd]   = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  // Camper-specific fields
  const [profilePicFile, setProfilePicFile]     = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [birthDate, setBirthDate]               = useState('');
  const [shirtSize, setShirtSize]               = useState('');
  const [parentName, setParentName]             = useState('');
  const [parentPhone, setParentPhone]           = useState('');
  const [parentEmail, setParentEmail]           = useState('');
  const [criticalMedical, setCriticalMedical]   = useState('');
  const [dietaryReq, setDietaryReq]             = useState('');
  const [medications, setMedications]           = useState('');

  const { signUp } = useAuth();
  const navigate   = useNavigate();

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setProfilePicFile(file);
    setProfilePicPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (role === 'camper') {
      if (!parentName.trim())  { setError('נא למלא את שם ההורה.'); return; }
      if (!birthDate)          { setError('נא למלא את תאריך הלידה.'); return; }
      if (!shirtSize)          { setError('נא לבחור מידת חולצה.'); return; }
      if (!parentPhone.trim()) { setError('נא למלא את מספר הטלפון של ההורה.'); return; }
    }
    if (password !== confirm)  { setError('הסיסמאות אינן תואמות. אנא נסה שוב.'); return; }
    if (password.length < 6)   { setError('הסיסמה חייבת להכיל לפחות 6 תווים.'); return; }

    setLoading(true);
    const { error } = await signUp(
      email,
      password,
      fullName,
      role,
      role === 'camper'
        ? { parentName, birthDate, shirtSize, parentPhone, parentEmail, criticalMedical, dietaryReq, medications, profilePicFile }
        : undefined,
    );
    setLoading(false);

    if (error) setError(error);
    else navigate('/dashboard');
  };

  return (
    <div
      className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-summer-sky/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-vibrant-pink/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-summer-sky to-vibrant-pink mx-auto mb-4 flex items-center justify-center text-white shadow-lg">
            <Icon name="forest" className="text-3xl" />
          </div>
          <h1 className="text-h1-display text-deep-slate font-black tracking-tight">My Camp</h1>
          <p className="text-slate-500 text-sm mt-1">יצירת חשבון חדש במערכת</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100 p-8 space-y-5">

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
              <Icon name="error" className="text-red-500 text-lg shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">סוג משתמש</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      role === r.value
                        ? 'border-vibrant-pink bg-pink-50 text-vibrant-pink'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <Icon name={r.icon} className={`text-2xl ${role === r.value ? 'text-vibrant-pink' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{r.label}</span>
                    <span className="text-[10px] leading-tight text-slate-400">{r.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">שם מלא</label>
              <div className="relative">
                <Icon name="person" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className={inputClass.replace('bg-white', 'bg-slate-50')}
                />
              </div>
            </div>

            {/* ─── Camper-only section ─── */}
            {role === 'camper' && (
              <div className="space-y-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">

                {/* ── Camper details ── */}
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">פרטי החניך/ה</p>

                {/* Profile Picture */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 text-right">תמונת פרופיל</label>
                  <div className="flex items-center gap-4 flex-row-reverse">
                    <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {profilePicPreview
                        ? <img src={profilePicPreview} alt="תצוגה מקדימה" className="w-full h-full object-cover" />
                        : <Icon name="person" className="text-3xl text-slate-400" />
                      }
                    </div>
                    <label className="flex-1 cursor-pointer bg-white border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:border-summer-sky hover:bg-sky-50/50 transition-all">
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                      <Icon name="upload" className="text-xl text-slate-400 block mx-auto mb-1" />
                      <span className="text-xs text-slate-400">
                        {profilePicFile ? profilePicFile.name : 'לחץ להעלאת תמונה'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Birth Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 text-right">תאריך לידה</label>
                  <div className="relative">
                    <Icon name="cake" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Shirt Size */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 text-right">מידת חולצה</label>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setShirtSize(size)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                          shirtSize === size
                            ? 'border-summer-sky bg-sky-50 text-summer-sky'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Parent info ── */}
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">פרטי ההורה</p>

                  {/* Parent Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">שם ההורה</label>
                    <div className="relative">
                      <Icon name="family_restroom" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                      <input
                        type="text"
                        required
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="שם האם / האב"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Parent Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">טלפון</label>
                    <div className="relative">
                      <Icon name="phone" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="05X-XXXXXXX"
                        className={`${inputClass} placeholder:text-left`}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Parent Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">אימייל הורה</label>
                    <div className="relative">
                      <Icon name="alternate_email" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                      <input
                        type="email"
                        value={parentEmail}
                        onChange={(e) => setParentEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className={`${inputClass} placeholder:text-left`}
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Medical info ── */}
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">מידע רפואי</p>

                  {/* Critical Medical */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">מידע קריטי - אלרגיות</label>
                    <textarea
                      value={criticalMedical}
                      onChange={(e) => setCriticalMedical(e.target.value)}
                      placeholder="לדוגמה: אלרגיה חריפה לבוטנים, אפיפן בתיק..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>

                  {/* Dietary Requirements */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">הערות תזונה</label>
                    <textarea
                      value={dietaryReq}
                      onChange={(e) => setDietaryReq(e.target.value)}
                      placeholder="לדוגמה: צמחוני, ללא גלוטן..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>

                  {/* Medications */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 text-right">תרופות קבועות</label>
                    <textarea
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      placeholder="לדוגמה: ריטלין 10mg כל בוקר..."
                      rows={2}
                      className={textareaClass}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">כתובת אימייל</label>
              <div className="relative">
                <Icon name="mail" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`${inputClass.replace('bg-white', 'bg-slate-50')} placeholder:text-left`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">סיסמה</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Icon name={showPwd ? 'visibility_off' : 'visibility'} className="text-xl" />
                </button>
                <Icon name="lock" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="לפחות 6 תווים"
                  className={`${inputClass.replace('bg-white', 'bg-slate-50')} pl-10`}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 text-right">אישור סיסמה</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowConf(!showConf)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Icon name={showConf ? 'visibility_off' : 'visibility'} className="text-xl" />
                </button>
                <Icon name="lock_clock" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type={showConf ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="הזן שוב את הסיסמה"
                  className={`w-full bg-slate-50 border rounded-xl py-3 pr-10 pl-10 text-sm focus:ring-2 outline-none transition-all text-right placeholder:text-slate-400 ${
                    confirm && password !== confirm
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-slate-200 focus:ring-summer-sky/30 focus:border-summer-sky'
                  }`}
                  dir="ltr"
                />
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 text-right">הסיסמאות אינן תואמות</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vibrant-pink text-white font-black py-3.5 rounded-2xl shadow-lg shadow-pink-200/50 hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <>
                  <Icon name="refresh" className="text-xl animate-spin" />
                  יוצר חשבון...
                </>
              ) : (
                <>
                  יצירת חשבון
                  <Icon name="person_add" className="text-xl" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-300">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs">או</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500">
            כבר יש לך חשבון?{' '}
            <Link to="/login" className="text-vibrant-pink font-bold hover:underline">
              כניסה למערכת
            </Link>
          </p>
        </div>

        {/* Back to landing */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
          >
            <Icon name="arrow_forward" className="text-sm" />
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
