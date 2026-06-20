import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Icon from './Icon';
import { documentCategories } from '../lib/documentCategories';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** ASCII-only name for Supabase Storage (rejects Hebrew, spaces, etc.). */
function safeStorageFileName(file: File): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  const ext = match ? `.${match[1].toLowerCase()}` : '';
  return `${Date.now()}${ext || '.bin'}`;
}

function inferDocType(file: File): string {
  const ext = (/\.([a-zA-Z0-9]+)$/.exec(file.name)?.[1] ?? '').toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'word';
  return ext || 'file';
}

export default function UploadDocumentModal({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const [title, setTitle]       = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setTitle('');
    setCategory('');
    setFile(null);
    setError(null);
    onClose();
  };

  const handleUpload = async () => {
    if (!user) return;
    if (!title.trim()) { setError('יש להזין כותרת למסמך'); return; }
    if (!category)     { setError('יש לבחור קטגוריה'); return; }
    if (!file)          { setError('יש לבחור קובץ להעלאה'); return; }

    setLoading(true);
    setError(null);

    const filePath = `${user.id}/${safeStorageFileName(file)}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      setError('שגיאה בהעלאת הקובץ: ' + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(uploadData.path);

    const { error: insertError } = await supabase.from('document').insert({
      title:     title.trim(),
      category,
      type:      inferDocType(file),
      file_url:  urlData.publicUrl,
      file_name: file.name,
      author_id: user.id,
    });

    setLoading(false);

    if (insertError) {
      setError('שגיאה בשמירת המסמך: ' + insertError.message);
      return;
    }

    onSuccess?.();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
          <h2 className="font-black text-deep-slate text-base">העלאת קובץ מהמחשב</h2>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
              <Icon name="error" className="text-red-500 text-lg shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">כותרת המסמך</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="לדוגמה: מדריך בטיחות שטח"
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

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">קובץ (PDF / DOCX)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-summer-sky hover:text-summer-sky transition-colors text-sm font-medium"
            >
              <Icon name="attach_file" className="text-xl" />
              {file ? file.name : 'בחר קובץ להעלאה'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-vibrant-pink text-white font-black text-sm shadow-lg shadow-pink-200/50 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="refresh" className="text-lg animate-spin" />
                מעלה...
              </>
            ) : (
              <>
                <Icon name="upload_file" className="text-lg" />
                העלאה
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
