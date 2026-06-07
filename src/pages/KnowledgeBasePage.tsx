import { useState } from 'react';
import Icon from '../components/Icon';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'הכל' | 'חינוך' | 'בטיחות' | 'ספורט' | 'אמנות' | 'נהלים';

interface Document {
  id: number;
  title: string;
  description: string;
  category: Exclude<Category, 'הכל'>;
  icon: string;
  iconBg: string;
  iconColor: string;
  fileType: 'PDF' | 'DOCX' | 'PPTX' | 'XLSX';
  author: string;
  date: string;
  pages: number;
  pinned?: boolean;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const documents: Document[] = [
  {
    id: 1,
    title: 'מדריך בטיחות שטח — קיץ 2024',
    description: 'נוהל בטיחות מלא לפעילויות שטח כולל הנחיות לחירום, רשימת ציוד ושרשרת פיקוד.',
    category: 'בטיחות',
    icon: 'health_and_safety',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    fileType: 'PDF',
    author: 'דניאל כהן',
    date: '01/06/2024',
    pages: 24,
    pinned: true,
  },
  {
    id: 2,
    title: 'תוכנית הכנה לפעילות ניווט',
    description: 'מדריך מפורט לפעילות ניווט ביער — תוכנית שיעור, ציוד נדרש, ומפות שטח.',
    category: 'חינוך',
    icon: 'explore',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    fileType: 'DOCX',
    author: 'מיכל לוי',
    date: '10/06/2024',
    pages: 12,
  },
  {
    id: 3,
    title: 'נוהל קבלת חניכים ורישום',
    description: 'תהליך הצ׳ק-אין המלא לתחילת העונה: בדיקת מסמכים, תג שם, ואישורים רפואיים.',
    category: 'נהלים',
    icon: 'how_to_reg',
    iconBg: 'bg-sky-100',
    iconColor: 'text-summer-sky',
    fileType: 'PDF',
    author: 'מאי עמודי',
    date: '20/05/2024',
    pages: 8,
    pinned: true,
  },
  {
    id: 4,
    title: 'תוכנית סדנת ציור וקרמיקה',
    description: 'מדריך פעילות אמנות ויצירה לגילאי 10-14: חומרים, שלבים ודוגמאות לתוצרים.',
    category: 'אמנות',
    icon: 'palette',
    iconBg: 'bg-pink-100',
    iconColor: 'text-vibrant-pink',
    fileType: 'PPTX',
    author: 'שירה אברהם',
    date: '05/07/2024',
    pages: 18,
  },
  {
    id: 5,
    title: 'ליגת כדורגל — חוקים ולוח משחקים',
    description: 'חוקי המשחק, לוח הגמר, תוצאות הליגה הפנימית ושיוך קבוצות לאזורי מגרש.',
    category: 'ספורט',
    icon: 'sports_soccer',
    iconBg: 'bg-orange-100',
    iconColor: 'text-sunset-orange',
    fileType: 'XLSX',
    author: 'עמית רוזן',
    date: '08/07/2024',
    pages: 4,
  },
  {
    id: 6,
    title: 'נוהל תגובה לאירוע חירום רפואי',
    description: 'שלבי התגובה הראשוניים לאירוע חרום: מי מתקשר, מי נשאר עם הנפגע, ומה מדווחים.',
    category: 'בטיחות',
    icon: 'local_hospital',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    fileType: 'PDF',
    author: 'דניאל כהן',
    date: '01/06/2024',
    pages: 6,
  },
  {
    id: 7,
    title: 'מדריך פעילות כיפורים ומחנאות',
    description: 'כל מה שצריך לדעת על הכנת שטח לינה: קשירת אוהלים, בישול שטח, ופינוי שטח.',
    category: 'חינוך',
    icon: 'camping',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    fileType: 'PDF',
    author: 'נועם לוי',
    date: '12/06/2024',
    pages: 30,
  },
  {
    id: 8,
    title: 'תקנון משמעת ושמירה על נורמות',
    description: 'כללי ההתנהגות המצופים מחניכים וסגל — טיפול בהפרות, ועדת משמעת, וערעורים.',
    category: 'נהלים',
    icon: 'gavel',
    iconBg: 'bg-sky-100',
    iconColor: 'text-summer-sky',
    fileType: 'PDF',
    author: 'מאי עמודי',
    date: '15/05/2024',
    pages: 14,
  },
];

const categories: Category[] = ['הכל', 'חינוך', 'בטיחות', 'ספורט', 'אמנות', 'נהלים'];

const fileTypeColors: Record<Document['fileType'], string> = {
  PDF:  'bg-red-50 text-red-500',
  DOCX: 'bg-sky-50 text-sky-600',
  PPTX: 'bg-orange-50 text-orange-500',
  XLSX: 'bg-emerald-50 text-emerald-600',
};

// ─── Document Card ─────────────────────────────────────────────────────────────

function DocCard({ doc }: { doc: Document }) {
  return (
    <Card className="p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-right group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          {doc.pinned && (
            <span title="מוצמד">
              <Icon name="push_pin" fill className="text-base text-vibrant-pink" />
            </span>
          )}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${fileTypeColors[doc.fileType]}`}>
            {doc.fileType}
          </span>
        </div>
        <div className={`w-11 h-11 ${doc.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon name={doc.icon} fill className={`text-2xl ${doc.iconColor}`} />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-deep-slate text-sm leading-snug mb-1">{doc.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{doc.description}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-summer-sky hover:bg-sky-50 transition-all">
            <Icon name="download" className="text-lg" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-vibrant-pink hover:bg-pink-50 transition-all">
            <Icon name="share" className="text-lg" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-right">
          <p className="text-[10px] text-slate-400">{doc.date} • {doc.pages} עמ׳</p>
          <p className="text-xs text-slate-500 font-medium">{doc.author}</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('הכל');
  const [search, setSearch] = useState('');

  const filtered = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'הכל' || doc.category === activeCategory;
    const matchesSearch =
      search === '' ||
      doc.title.includes(search) ||
      doc.description.includes(search) ||
      doc.author.includes(search);
    return matchesCategory && matchesSearch;
  });

  const pinnedCount = documents.filter((d) => d.pinned).length;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6" dir="rtl">
      <PageHeader
        title="מאגר ידע ופעילויות"
        subtitle="כל המדריכים, הנהלים ומסמכי הקייטנה במקום אחד"
        actions={
          <Button variant="primary" className="text-sm">
            <Icon name="upload_file" className="text-lg" />
            העלאת מסמך חדש
          </Button>
        }
      />

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'מסמכים בסך הכל', value: documents.length, icon: 'folder_open', color: 'text-summer-sky', bg: 'bg-sky-50' },
          { label: 'מוצמדים', value: pinnedCount, icon: 'push_pin', color: 'text-vibrant-pink', bg: 'bg-pink-50' },
          { label: 'הועלו השבוע', value: 3, icon: 'schedule', color: 'text-sunset-orange', bg: 'bg-orange-50' },
          { label: 'קטגוריות', value: categories.length - 1, icon: 'category', color: 'text-emerald-500', bg: 'bg-emerald-50' },
        ].map((s) => (
          <Card key={s.label} className="p-4 flex items-center gap-3 text-right">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon name={s.icon} fill className={`text-xl ${s.color}`} />
            </div>
            <div>
              <p className="text-xl font-black text-deep-slate leading-none">{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, תיאור או מחבר..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none text-right placeholder:text-slate-400 shadow-soft"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-vibrant-pink text-white shadow-lg shadow-pink-200/40'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-vibrant-pink/40 hover:text-vibrant-pink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="text-xs text-slate-400 text-right">
        מציג <span className="font-bold text-deep-slate">{filtered.length}</span> מסמכים
        {activeCategory !== 'הכל' && <> בקטגוריית <span className="font-bold text-vibrant-pink">{activeCategory}</span></>}
      </p>

      {/* ── Document Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center">
          <Icon name="search_off" className="text-5xl text-slate-300 mx-auto block mb-3" />
          <p className="font-bold text-slate-500">לא נמצאו מסמכים עבור החיפוש שלך</p>
          <p className="text-xs text-slate-400 mt-1">נסה מילות חיפוש שונות או בחר קטגוריה אחרת</p>
        </Card>
      )}
    </div>
  );
}
