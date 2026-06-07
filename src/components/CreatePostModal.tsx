import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';
import Icon from './Icon';

interface Camper {
  id: string;
  full_name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  authorName: string;
  onSuccess?: () => void;
}

/** ASCII-only name for Supabase Storage (rejects Hebrew, spaces, etc.). */
function safeStorageFileName(file: File): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(file.name);
  const ext = match ? `.${match[1].toLowerCase()}` : '';
  return `${Date.now()}${ext || '.bin'}`;
}

export default function CreatePostModal({ isOpen, onClose, authorName, onSuccess }: Props) {
  const { user } = useAuth();
  const [content, setContent]             = useState('');
  const [campers, setCampers]             = useState<Camper[]>([]);
  const [tagged, setTagged]               = useState<Camper[]>([]);
  const [showCamperList, setShowCamperList] = useState(false);
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch camper list whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    async function fetchCampers() {
      const { data, error: fetchError } = await supabase
        .from('camper')
        .select('id, full_name')
        .order('full_name');
      if (fetchError) {
        console.error('[CreatePostModal] fetch campers failed:', fetchError);
        return;
      }
      setCampers(data ?? []);
    }
    fetchCampers();
  }, [isOpen]);

  const toggleCamper = (camper: Camper) => {
    setTagged(prev =>
      prev.some(c => c.id === camper.id)
        ? prev.filter(c => c.id !== camper.id)
        : [...prev, camper],
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setContent('');
    setTagged([]);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setShowCamperList(false);
    onClose();
  };

  const handlePublish = async () => {
    if (!user || !content.trim()) return;
    setLoading(true);
    setError(null);

    // 1. Upload image to posts_images bucket (if selected)
    let imageUrl: string | null = null;
    if (imageFile) {
      const filePath = `${user.id}/${safeStorageFileName(imageFile)}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts_images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('[createPost] image upload failed:', uploadError);
        setError('שגיאה בהעלאת התמונה. נסה שוב.');
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('posts_images')
        .getPublicUrl(uploadData.path);
      imageUrl = urlData.publicUrl;
    }

    // 2. Build combined content string
    const taggedNames = tagged.map(c => c.full_name).join(', ');
    const combinedContent = tagged.length > 0
      ? `${content.trim()}\n\nמתויגים: ${taggedNames}`
      : content.trim();

    // 3. Insert into post table
    const { error: insertError } = await supabase.from('post').insert({
      content:   combinedContent,
      image_url: imageUrl,
      user_id:   user.id,
    });

    if (insertError) {
      console.error('[createPost] post insert failed:', insertError);
      setError(`שגיאה בפרסום: ${insertError.message}`);
      setLoading(false);
      return;
    }

    // 4. Success — notify parent, reset state, and close
    onSuccess?.();
    handleClose();
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
          <h2 className="font-black text-deep-slate text-base">יצירת פוסט חדש</h2>
        </div>

        {/* Scrollable body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Author row */}
          <div className="flex items-center gap-3">
            <Avatar
              initials={authorName ? authorName.charAt(0) : '?'}
              gradient="from-summer-sky to-vibrant-pink"
              size="lg"
            />
            <div className="text-right">
              <p className="font-bold text-deep-slate text-sm">{authorName || '...'}</p>
              <p className="text-xs text-slate-400">פוסט ציבורי</p>
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
              <Icon name="error" className="text-red-500 text-lg shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="מה קורה במחנה היום?"
            rows={4}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-right resize-none focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition-all placeholder:text-slate-400"
          />

          {/* Tag campers */}
          <div>
            <button
              type="button"
              onClick={() => setShowCamperList(p => !p)}
              className="flex items-center gap-1.5 text-sm font-bold text-summer-sky hover:text-sky-600 transition-colors"
            >
              <Icon name={showCamperList ? 'expand_less' : 'expand_more'} className="text-lg" />
              תיוג חניכים
              {tagged.length > 0 && (
                <span className="bg-summer-sky text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {tagged.length}
                </span>
              )}
            </button>

            {showCamperList && (
              <div className="mt-2 max-h-36 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                {campers.length === 0 ? (
                  <p className="text-xs text-slate-400 p-3 text-center">אין חניכים להצגה</p>
                ) : (
                  campers.map(camper => {
                    const isTagged = tagged.some(c => c.id === camper.id);
                    return (
                      <button
                        key={camper.id}
                        type="button"
                        onClick={() => toggleCamper(camper)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                            isTagged ? 'bg-summer-sky border-summer-sky' : 'border-slate-300'
                          }`}
                        >
                          {isTagged && <Icon name="check" className="text-white" style={{ fontSize: '12px' }} />}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{camper.full_name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {tagged.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagged.map(c => (
                  <span
                    key={c.id}
                    className="flex items-center gap-1 bg-sky-100 text-sky-700 text-xs font-bold px-2 py-1 rounded-full"
                  >
                    {c.full_name}
                    <button
                      onClick={() => toggleCamper(c)}
                      className="hover:text-sky-900 transition-colors"
                    >
                      <Icon name="close" className="text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="תצוגה מקדימה" className="w-full h-44 object-cover" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 left-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-summer-sky hover:text-summer-sky transition-colors"
              >
                <Icon name="add_a_photo" className="text-xl" />
                <span className="text-sm font-medium">הוסף תמונה</span>
              </button>
            )}
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
            onClick={handlePublish}
            disabled={!content.trim() || loading}
            className="flex-1 py-3 rounded-xl bg-vibrant-pink text-white font-black text-sm shadow-lg shadow-pink-200/50 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon name="refresh" className="text-lg animate-spin" />
                מפרסם...
              </>
            ) : (
              <>
                <Icon name="send" className="text-lg" />
                פרסום
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
