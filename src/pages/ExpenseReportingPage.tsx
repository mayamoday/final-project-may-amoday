import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Expense {
  id: string;
  amount: number;
  date: string;
  category: string | null;
  description: string | null;
  status: string;
  created_at: string;
  reporter_id: string;
  receipt_url: string | null;
  staff: { full_name: string } | { full_name: string }[] | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const categories = [
  { value: 'transport', label: 'תחבורה',     icon: 'directions_bus' },
  { value: 'food',      label: 'מזון וכיבוד', icon: 'restaurant'     },
  { value: 'activity',  label: 'פעילות',       icon: 'sports_soccer'  },
  { value: 'equipment', label: 'ציוד ואספקה', icon: 'inventory_2'    },
];

function safeFileName(file: File): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  const ext = match ? `.${match[1].toLowerCase()}` : '';
  return `${Date.now()}${ext || '.bin'}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function statusLabel(status: string): string {
  if (status === 'approved') return 'אושר';
  if (status === 'rejected') return 'נדחה';
  return 'ממתין';
}

function statusVariant(status: string): 'success' | 'danger' | 'warning' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

function reporterName(item: Expense): string {
  // staff may come back as a single joined object or (depending on the relationship
  // PostgREST infers) as an array — guard against both shapes, plus null/undefined.
  const staffData = item?.staff as any;
  return staffData?.full_name || staffData?.[0]?.full_name || 'לא ידוע';
}

function safeAmount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExpenseReportingPage() {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  // Budget
  const totalBudget = 2000;
  const [totalSpent, setTotalSpent]       = useState(0);

  // Form
  const [amount, setAmount]           = useState('');
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory]       = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [editingExpenseId, setEditingExpenseId]     = useState<string | null>(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(null);

  // UI
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const balance      = safeAmount(totalBudget) - safeAmount(totalSpent);
  const isOverBudget = balance < 0;
  const usedPctRaw    = totalBudget > 0 ? (safeAmount(totalSpent) / totalBudget) * 100 : 0;
  const usedPct       = safeAmount(Math.round(usedPctRaw));
  const usedBarWidth  = Math.min(100, Math.max(0, usedPct));

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const { data, error } = await supabase
        .from('expense')
        .select('id, amount, date, category, description, status, created_at, reporter_id, receipt_url, staff!expense_reporter_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (error) console.error('Supabase fetch error:', error);

      const all = ((data || []) as unknown as Expense[]).filter(Boolean);
      setRecentExpenses(all.slice(0, 5));
      setTotalSpent(all.reduce((sum, e) => sum + safeAmount(e?.amount), 0));
    } catch (err) {
      console.error('Supabase fetch error:', err);
      // Keep whatever was already on screen rather than blanking the page out.
      setRecentExpenses([]);
    }
  }

  const handleFileChange = (file: File) => {
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const resetForm = () => {
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('');
    setDescription('');
    setReceiptFile(null);
    setReceiptPreview(null);
    setExistingReceiptUrl(null);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingExpenseId(null);
    resetForm();
  };

  const handleEditClick = (item: Expense) => {
    setEditingExpenseId(item.id);
    setAmount(String(item.amount));
    setDate(item.date);
    setCategory(item.category ?? '');
    setDescription(item.description ?? '');
    setExistingReceiptUrl(item.receipt_url ?? null);
    setReceiptFile(null);
    setReceiptPreview(item.receipt_url ?? null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הדיווח?')) return;
    const { error: deleteError } = await supabase.from('expense').delete().eq('id', id);
    if (deleteError) {
      setError('שגיאה במחיקת הדיווח: ' + deleteError.message);
      return;
    }
    if (editingExpenseId === id) cancelEdit();
    await fetchExpenses();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    if (!category) { setError('יש לבחור קטגוריה'); return; }

    const newAmount = safeAmount(parseFloat(amount));
    if (newAmount <= 0) { setError('יש להזין סכום הוצאה תקין'); return; }

    const originalAmount = editingExpenseId
      ? safeAmount(recentExpenses.find(x => x.id === editingExpenseId)?.amount)
      : 0;
    if (safeAmount(totalSpent) - originalAmount + newAmount > safeAmount(totalBudget)) {
      setError('הסכום המבוקש חורג מהיתרה בקופה ולא ניתן לדיווח');
      return;
    }

    setLoading(true);
    setError(null);

    let receipt_url: string | null = existingReceiptUrl;

    if (receiptFile) {
      const filePath = `${user.id}/${safeFileName(receiptFile)}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, receiptFile);

      if (uploadError) {
        setError('שגיאה בהעלאת הקבלה: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
      receipt_url = urlData.publicUrl;
    }

    const { error: saveError } = editingExpenseId
      ? await supabase.from('expense').update({
          amount: newAmount,
          date,
          category,
          description,
          receipt_url,
        }).eq('id', editingExpenseId)
      : await supabase.from('expense').insert({
          amount:      newAmount,
          date,
          category,
          description,
          receipt_url,
          reporter_id: user.id,
        });

    setLoading(false);

    if (saveError) {
      setError('שגיאה בשמירת הדיווח: ' + saveError.message);
      return;
    }

    setSubmitted(true);
    setEditingExpenseId(null);
    resetForm();
    await fetchExpenses();
    setTimeout(() => setSubmitted(false), 3500);
  };

  // ── Success screen ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Card className="p-16">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-emerald-100">
            <Icon name="check_circle" fill className="text-5xl" />
          </div>
          <h2 className="text-h2-section text-deep-slate font-bold mb-2">הדיווח נשלח בהצלחה!</h2>
          <p className="text-body-medium text-slate-500 mb-8">ההוצאה עודכנה במערכת ותועבר לאישור המפקדה.</p>
          <Button variant="secondary" className="mx-auto" onClick={() => setSubmitted(false)}>
            <Icon name="add" className="text-xl" />
            דיווח הוצאה נוספת
          </Button>
        </Card>
      </div>
    );
  }

  // ── Main page ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto pb-12" dir="rtl">
      <PageHeader
        title="דיווח על הוצאה חדשה"
        subtitle="אנא מלא את פרטי ההוצאה וצרף קבלה לאישור המערכת."
        icon="receipt_long"
        iconColor="text-summer-sky"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Form ── */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
            {editingExpenseId && (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
                <span className="text-sm font-bold text-amber-700 flex items-center gap-2">
                  <Icon name="edit" className="text-base" />
                  עריכת דיווח קיים
                </span>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-amber-600 hover:text-amber-800 text-xs font-bold underline"
                >
                  ביטול עריכה
                </button>
              </div>
            )}
            <div className="p-6 space-y-5">

              {/* Amount + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">סכום ההוצאה (₪)</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₪</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="input-field pr-10 text-xl font-black text-right"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">תאריך ההוצאה</label>
                  <input
                    required
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input-field font-bold text-right"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">קטגוריה</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition-all active:scale-95 ${
                        category === cat.value
                          ? 'border-summer-sky bg-sky-50 text-summer-sky'
                          : 'border-slate-100 text-slate-500 hover:border-summer-sky/50 hover:text-summer-sky'
                      }`}
                    >
                      <Icon name={cat.icon} fill={category === cat.value} className="text-2xl" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">תיאור ההוצאה</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="פרטו כאן את סיבת ההוצאה ומי נהנה ממנה..."
                  className="input-field resize-none text-right placeholder:text-slate-400"
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">צילום קבלה</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
                />
                {receiptPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200">
                    <img src={receiptPreview} alt="קבלה" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setReceiptFile(null); setReceiptPreview(null); setExistingReceiptUrl(null); }}
                      className="absolute top-2 left-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <Icon name="close" className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      dragging ? 'border-summer-sky bg-sky-50' : 'border-slate-200 bg-slate-50/50 hover:border-summer-sky/50 hover:bg-slate-50'
                    } group`}
                  >
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-summer-sky mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="cloud_upload" fill className="text-4xl" />
                    </div>
                    <p className="font-bold text-deep-slate text-sm">לחצו להעלאה או גרירת קובץ לכאן</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG או PDF עד 5MB</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
                  <Icon name="error" className="text-red-500 text-lg shrink-0" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="bg-slate-50/70 px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-100">
              <Button
                variant="ghost"
                type="button"
                onClick={editingExpenseId ? cancelEdit : () => window.history.back()}
              >
                {editingExpenseId ? 'ביטול עריכה' : 'ביטול וחזרה'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="refresh" className="text-xl animate-spin" />
                    שולח...
                  </>
                ) : editingExpenseId ? (
                  <>
                    עדכון דיווח
                    <Icon name="save" className="text-xl" />
                  </>
                ) : (
                  <>
                    אישור ושליחת דיווח
                    <Icon name="send" className="text-xl" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Side Panel ── */}
        <div className="space-y-4">

          {/* Budget Card */}
          <Card className="p-5 text-right">
            <p className="text-xs text-sunset-orange font-bold uppercase tracking-wider mb-1">יתרה בקופה</p>
            <p className={`text-4xl font-black ${isOverBudget ? 'text-red-600' : 'text-deep-slate'}`}>
              {isOverBudget ? '-' : ''}₪{Math.abs(balance).toLocaleString()}
            </p>
            {isOverBudget && (
              <p className="text-xs font-bold text-red-500 mt-1">
                חרגת מהתקציב ב-₪{Math.abs(balance).toLocaleString()}
              </p>
            )}

            {/* Total budget row */}
            <div className="flex items-center justify-end mt-1">
              <p className="text-xs text-slate-400">מתוך תקציב ₪{totalBudget.toLocaleString()}</p>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverBudget || usedPct >= 90 ? 'bg-error' : usedPct >= 70 ? 'bg-vibrant-pink' : 'bg-summer-sky'
                }`}
                style={{ width: `${usedBarWidth}%` }}
              />
            </div>
            <p className={`text-[10px] font-bold mt-2 ${isOverBudget || usedPct >= 90 ? 'text-error' : 'text-vibrant-pink'}`}>
              {usedPct}% נוצל
            </p>
          </Card>

          {/* Tip */}
          <div className="bg-summer-sky/10 rounded-2xl p-4 flex gap-3 items-start border border-sky-100 text-right">
            <div className="bg-summer-sky text-white p-2.5 rounded-xl shrink-0">
              <Icon name="lightbulb" fill className="text-lg" />
            </div>
            <div>
              <h4 className="font-bold text-on-primary-container text-sm">טיפ למדווח</h4>
              <p className="text-xs text-on-primary-container/80 mt-1 leading-relaxed">
                ודא שהסכום בקבלה תואם במדויק לסכום שהזנת למניעת עיכובים באישור.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Expenses ── */}
      <div className="mt-8">
        <h3 className="text-h2-section text-deep-slate font-bold mb-5 text-right">דיווחים אחרונים</h3>
        {recentExpenses.length === 0 ? (
          <Card className="p-6 text-center text-slate-400 text-sm">אין דיווחים עדיין</Card>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden overflow-x-auto">
            <table className="w-full text-right" dir="rtl">
              <thead className="bg-slate-50/70 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">תאריך</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">קטגוריה</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">תיאור</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">מדווח</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">סטטוס</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">סכום</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExpenses.map((item) => {
                  const cat = categories.find(c => c.value === item.category);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500 text-right whitespace-nowrap">{formatDate(item.date)}</td>
                      <td className="px-4 py-3 text-sm text-deep-slate text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-2">
                          <Icon name={cat?.icon ?? 'receipt_long'} className="text-base text-slate-400" />
                          {cat?.label ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-deep-slate text-right">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 text-right whitespace-nowrap">{reporterName(item)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-deep-slate text-right whitespace-nowrap">
                        ₪{safeAmount(item?.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            aria-label="עריכת דיווח"
                            title="עריכה"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-summer-sky hover:bg-sky-50 transition-colors"
                          >
                            <Icon name="edit" className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            aria-label="מחיקת דיווח"
                            title="מחיקה"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Icon name="delete" className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50/70 border-t border-slate-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-bold text-deep-slate text-right">סך הכל</td>
                  <td className="px-4 py-3 text-sm font-black text-deep-slate text-right whitespace-nowrap">
                    ₪{recentExpenses.reduce((sum, e) => sum + safeAmount(e?.amount), 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
