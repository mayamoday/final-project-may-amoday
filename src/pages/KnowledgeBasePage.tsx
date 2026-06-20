import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Icon from '../components/Icon';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import UploadDocumentModal from '../components/UploadDocumentModal';
import { documentCategories } from '../lib/documentCategories';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'הכל' | typeof documentCategories[number];

interface DocumentRecord {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  file_url: string | null;
  content: string | null;
  author_id: string;
  created_at: string;
  staff: { full_name: string } | { full_name: string }[] | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const categories: Category[] = ['הכל', ...documentCategories];

const categoryMeta: Record<string, { icon: string; bg: string; color: string }> = {
  'חינוך':  { icon: 'school',             bg: 'bg-green-100',  color: 'text-green-600'    },
  'בטיחות': { icon: 'health_and_safety',  bg: 'bg-red-100',    color: 'text-red-500'      },
  'ספורט':  { icon: 'sports_soccer',      bg: 'bg-orange-100', color: 'text-sunset-orange' },
  'אמנות':  { icon: 'palette',            bg: 'bg-pink-100',   color: 'text-vibrant-pink'  },
  'נהלים':  { icon: 'gavel',              bg: 'bg-sky-100',    color: 'text-summer-sky'    },
};
const defaultCategoryMeta = { icon: 'description', bg: 'bg-slate-100', color: 'text-slate-400' };

function typeBadge(type: string): { label: string; className: string } {
  if (type === 'pdf')      return { label: 'PDF',         className: 'bg-red-50 text-red-500' };
  if (type === 'word')     return { label: 'DOCX',        className: 'bg-sky-50 text-sky-600' };
  if (type === 'internal') return { label: 'מסמך פנימי',  className: 'bg-emerald-50 text-emerald-600' };
  return { label: type.toUpperCase(), className: 'bg-slate-50 text-slate-500' };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('he-IL');
}

function authorName(doc: DocumentRecord): string {
  const staffData = doc?.staff as any;
  return staffData?.full_name || staffData?.[0]?.full_name || 'לא ידוע';
}

// ─── Upload Menu ───────────────────────────────────────────────────────────────

function UploadMenuButton({ onUploadFile, onCreateDocument }: { onUploadFile: () => void; onCreateDocument: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref} dir="rtl">
      <Button variant="primary" type="button" className="text-sm" onClick={() => setOpen(p => !p)}>
        <Icon name="upload_file" className="text-lg" />
        העלאת מסמך חדש
        <Icon name={open ? 'expand_less' : 'expand_more'} className="text-lg" />
      </Button>

      {open && (
        <div className="absolute end-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-20 text-right">
          <button
            type="button"
            onClick={() => { setOpen(false); onUploadFile(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-sm font-bold text-deep-slate"
          >
            <Icon name="upload_file" className="text-lg text-summer-sky" />
            העלאת קובץ מהמחשב
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onCreateDocument(); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-sm font-bold text-deep-slate border-t border-slate-50"
          >
            <Icon name="edit_note" className="text-lg text-vibrant-pink" />
            יצירת מסמך חדש במערכת
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Document Viewer (internal documents) ───────────────────────────────────────

function DocumentViewerModal({ doc, onClose }: { doc: DocumentRecord | null; onClose: () => void }) {
  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
          <h2 className="font-black text-deep-slate text-base">{doc.title}</h2>
        </div>
        <div className="rtl-quill overflow-y-auto">
          <div
            className="ql-editor"
            dangerouslySetInnerHTML={{ __html: doc.content || '<p>אין תוכן להצגה</p>' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Document Card ─────────────────────────────────────────────────────────────

function DocCard({ doc, onView }: { doc: DocumentRecord; onView: (doc: DocumentRecord) => void }) {
  const meta = categoryMeta[doc.category] ?? defaultCategoryMeta;
  const badge = typeBadge(doc.type);
  const isInternal = doc.type === 'internal';

  return (
    <Card className="p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-right group">
      <div className="flex items-start justify-between gap-3">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${badge.className}`}>
          {badge.label}
        </span>
        <div className={`w-11 h-11 ${meta.bg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon name={meta.icon} fill className={`text-2xl ${meta.color}`} />
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-deep-slate text-sm leading-snug mb-1">{doc.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{doc.description || 'אין תיאור'}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex gap-2">
          {isInternal ? (
            <button
              type="button"
              onClick={() => onView(doc)}
              title="קריאת המסמך"
              className="p-1.5 rounded-lg text-slate-400 hover:text-summer-sky hover:bg-sky-50 transition-all"
            >
              <Icon name="visibility" className="text-lg" />
            </button>
          ) : (
            <a
              href={doc.file_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              title="הורדת הקובץ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-summer-sky hover:bg-sky-50 transition-all"
            >
              <Icon name="download" className="text-lg" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 text-right">
          <p className="text-[10px] text-slate-400">{formatDate(doc.created_at)}</p>
          <p className="text-xs text-slate-500 font-medium">{authorName(doc)}</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading]     = useState(true);

  const [activeCategory, setActiveCategory] = useState<Category>('הכל');
  const [search, setSearch] = useState('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('document')
        .select('id, title, description, category, type, file_url, content, author_id, created_at, staff!document_author_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (error) console.error('Supabase fetch error:', error);
      setDocuments(((data || []) as unknown as DocumentRecord[]).filter(Boolean));
    } catch (err) {
      console.error('Supabase fetch error:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = documents.filter((doc) => {
    const matchesCategory = activeCategory === 'הכל' || doc.category === activeCategory;
    const matchesSearch =
      search === '' ||
      doc.title.includes(search) ||
      (doc.description ?? '').includes(search) ||
      authorName(doc).includes(search);
    return matchesCategory && matchesSearch;
  });

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const uploadedThisWeek = documents.filter((d) => new Date(d.created_at).getTime() >= weekAgo).length;
  const internalCount = documents.filter((d) => d.type === 'internal').length;

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6" dir="rtl">
      <PageHeader
        title="מאגר ידע ופעילויות"
        subtitle="כל המדריכים, הנהלים ומסמכי הקייטנה במקום אחד"
        actions={
          <UploadMenuButton
            onUploadFile={() => setUploadOpen(true)}
            onCreateDocument={() => navigate('/create-document')}
          />
        }
      />

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'מסמכים בסך הכל', value: documents.length,            icon: 'folder_open', color: 'text-summer-sky',  bg: 'bg-sky-50'    },
          { label: 'מסמכים פנימיים', value: internalCount,                icon: 'edit_note',   color: 'text-vibrant-pink', bg: 'bg-pink-50'   },
          { label: 'הועלו השבוע',    value: uploadedThisWeek,             icon: 'schedule',    color: 'text-sunset-orange', bg: 'bg-orange-50' },
          { label: 'קטגוריות',       value: documentCategories.length,    icon: 'category',    color: 'text-emerald-500', bg: 'bg-emerald-50' },
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
      {loading ? (
        <Card className="p-16 text-center text-slate-400 text-sm">טוען מסמכים...</Card>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} onView={setViewingDoc} />
          ))}
        </div>
      ) : (
        <Card className="p-16 text-center">
          <Icon name="search_off" className="text-5xl text-slate-300 mx-auto block mb-3" />
          <p className="font-bold text-slate-500">לא נמצאו מסמכים עבור החיפוש שלך</p>
          <p className="text-xs text-slate-400 mt-1">נסה מילות חיפוש שונות או בחר קטגוריה אחרת</p>
        </Card>
      )}

      <UploadDocumentModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={fetchDocuments}
      />

      <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
    </div>
  );
}
