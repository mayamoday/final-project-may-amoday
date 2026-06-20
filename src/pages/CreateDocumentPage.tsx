import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { documentCategories } from '../lib/documentCategories';

const quillModules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
  ],
};

const quillFormats = ['bold', 'italic', 'underline', 'list'];

function isContentEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
}

export default function CreateDocumentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim())          { setError('יש להזין כותרת למסמך'); return; }
    if (!category)              { setError('יש לבחור קטגוריה'); return; }
    if (isContentEmpty(content)) { setError('יש להזין תוכן למסמך'); return; }

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('document').insert({
      title:     title.trim(),
      category,
      type:      'internal',
      content,
      file_name: `${title.trim()}.html`,
      author_id: user.id,
    });

    setLoading(false);

    if (insertError) {
      setError('שגיאה בשמירת המסמך: ' + insertError.message);
      return;
    }

    navigate('/knowledge');
  };

  return (
    <div className="max-w-3xl mx-auto pb-12" dir="rtl">
      <PageHeader
        title="יצירת מסמך חדש"
        subtitle="כתבו מסמך עשיר בעיצוב ישירות במערכת — הוא יתווסף למאגר הידע"
        icon="edit_note"
        iconColor="text-vibrant-pink"
        actions={
          <Button variant="ghost" type="button" className="text-sm" onClick={() => navigate('/knowledge')}>
            <Icon name="arrow_forward" className="text-lg" />
            חזרה למאגר הידע
          </Button>
        }
      />

      <Card className="p-6 space-y-5 text-right">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
            <Icon name="error" className="text-red-500 text-lg shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">כותרת המסמך</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="לדוגמה: נוהל קבלת חניכים"
              className="input-field text-right"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">סיווג קטגוריה</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field text-right"
            >
              <option value="" disabled>בחר קטגוריה...</option>
              {documentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">תוכן המסמך</label>
          <div className="rtl-quill rounded-xl overflow-hidden border border-slate-200">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder="התחילו לכתוב את תוכן המסמך כאן..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Icon name="refresh" className="text-xl animate-spin" />
                שומר...
              </>
            ) : (
              <>
                שמירת מסמך
                <Icon name="save" className="text-xl" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
