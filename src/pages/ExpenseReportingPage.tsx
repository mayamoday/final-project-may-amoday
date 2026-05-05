import { useState, type FormEvent } from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

const categories = [
  { value: 'transport', label: 'תחבורה', icon: 'directions_bus' },
  { value: 'food', label: 'מזון וכיבוד', icon: 'restaurant' },
  { value: 'activity', label: 'פעילות', icon: 'sports_soccer' },
  { value: 'equipment', label: 'ציוד ואספקה', icon: 'inventory_2' },
];

const recentExpenses = [
  { title: 'קניית מים לטיול', amount: '45.00', date: '12/07/2024', status: 'approved', category: 'transport' },
  { title: 'מונית למחנה', amount: '22.50', date: '11/07/2024', status: 'pending', category: 'transport' },
  { title: 'ארוחת ערב קבוצתית', amount: '180.00', date: '10/07/2024', status: 'approved', category: 'food' },
];

export default function ExpenseReportingPage() {
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

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
            <div className="p-6 space-y-5">

              {/* Amount + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">סכום ההוצאה ($)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="input-field pl-10 text-xl font-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תאריך ההוצאה</label>
                  <input
                    required
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="input-field font-bold"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">קטגוריה</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedCategory === cat.value
                          ? 'border-summer-sky bg-sky-50 text-summer-sky'
                          : 'border-slate-100 text-slate-500 hover:border-summer-sky/50 hover:text-summer-sky'
                      }`}
                    >
                      <Icon name={cat.icon} fill={selectedCategory === cat.value} className="text-2xl" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">תיאור ההוצאה</label>
                <textarea
                  rows={3}
                  placeholder="פרטו כאן את סיבת ההוצאה ומי נהנה ממנה..."
                  className="input-field resize-none"
                />
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">צילום קבלה</label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); }}
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
              </div>
            </div>

            {/* Form Footer */}
            <div className="bg-slate-50/70 px-6 py-4 flex items-center justify-between gap-4 border-t border-slate-100">
              <Button variant="ghost" type="button" onClick={() => window.history.back()}>
                ביטול וחזרה
              </Button>
              <Button type="submit">
                אישור ושליחת דיווח
                <Icon name="send" className="text-xl" />
              </Button>
            </div>
          </form>
        </div>

        {/* ── Side Panel ── */}
        <div className="space-y-4">
          {/* Budget remaining */}
          <Card className="p-5 text-right">
            <p className="text-xs text-sunset-orange font-bold uppercase tracking-wider mb-1">יתרה בקופה</p>
            <p className="text-4xl font-black text-deep-slate">$1,240</p>
            <p className="text-xs text-slate-400 mt-1">מתוך תקציב $15,000</p>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
              <div className="bg-vibrant-pink h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-[10px] text-vibrant-pink font-bold mt-2">85% נוצל</p>
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
        <div className="space-y-3">
          {recentExpenses.map((item, i) => (
            <Card key={i} className="p-4 flex items-center justify-between hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <Badge variant={item.status === 'approved' ? 'success' : 'warning'}>
                  {item.status === 'approved' ? 'אושר' : 'ממתין'}
                </Badge>
                <p className="text-xs text-slate-400">{item.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-deep-slate text-sm">{item.title}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <Icon name="receipt_long" className="text-xl" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
