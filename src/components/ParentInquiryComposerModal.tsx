import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './Icon';
import Avatar from './Avatar';

export interface ParentInquiry {
  id: string;
  parent_name: string;
  subject: string;
  status: string;
  created_at: string;
  camper_id: string | null;
}

interface Camper {
  id: string;
  full_name: string;
  parent_email: string | null;
}

interface Props {
  isOpen: boolean;
  inquiry: ParentInquiry | null;
  onClose: () => void;
}

export default function ParentInquiryComposerModal({ isOpen, inquiry, onClose }: Props) {
  const [campers, setCampers]             = useState<Camper[]>([]);
  const [selectedCamperId, setSelectedCamperId] = useState<string | null>(null);
  const [toEmail, setToEmail]             = useState('');
  const [message, setMessage]             = useState('');
  const [error, setError]                 = useState<string | null>(null);
  const [sent, setSent]                   = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCampers() {
      const { data, error: fetchError } = await supabase
        .from('camper')
        .select('id, full_name, parent_email')
        .order('full_name');
      if (fetchError) {
        console.error('[ParentInquiryComposerModal] fetch campers failed:', fetchError);
        return;
      }
      setCampers(data ?? []);
    }
    fetchCampers();
  }, [isOpen]);

  // Pre-select the camper tied to the clicked inquiry (if any) and pre-fill a draft message
  useEffect(() => {
    if (!isOpen || !inquiry) return;
    setSelectedCamperId(inquiry.camper_id ?? null);
    setMessage(`שלום ${inquiry.parent_name},\n\nבנוגע לפנייתך בנושא "${inquiry.subject}":\n\n`);
  }, [isOpen, inquiry]);

  // Once campers load, fill the "To" field from the pre-selected camper's parent_email
  useEffect(() => {
    if (!selectedCamperId) return;
    const camper = campers.find(c => c.id === selectedCamperId);
    if (camper) setToEmail(camper.parent_email ?? '');
  }, [selectedCamperId, campers]);

  const resetAndClose = () => {
    setCampers([]);
    setSelectedCamperId(null);
    setToEmail('');
    setMessage('');
    setError(null);
    setSent(false);
    onClose();
  };

  const handleSelectCamper = (camper: Camper) => {
    setSelectedCamperId(camper.id);
    setToEmail(camper.parent_email ?? '');
  };

  const handleSendEmail = () => {
    if (!toEmail.trim()) { setError('יש לבחור חניך או להזין כתובת מייל'); return; }
    if (!message.trim()) { setError('יש להזין תוכן הודעה'); return; }

    setError(null);

    // TODO: integrate a real email-sending API. For now we just log the payload.
    console.log('[ParentInquiryComposerModal] send email', { to: toEmail, subject: inquiry?.subject, message });

    setSent(true);
    setTimeout(resetAndClose, 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
          <div className="text-right">
            <h2 className="font-black text-deep-slate text-base">מענה לפנייה</h2>
            {inquiry && <p className="text-xs text-slate-400 mt-0.5">{inquiry.parent_name} · {inquiry.subject}</p>}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">

          {/* Camper sidebar */}
          <div className="w-56 border-l border-slate-100 overflow-y-auto p-2 shrink-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-2 text-right">בחירת חניך/ה</p>
            {campers.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 text-center">טוען חניכים...</p>
            ) : (
              <div className="space-y-1">
                {campers.map((camper) => {
                  const isSelected = camper.id === selectedCamperId;
                  return (
                    <button
                      key={camper.id}
                      type="button"
                      onClick={() => handleSelectCamper(camper)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-right transition-colors ${
                        isSelected ? 'bg-sky-50 text-summer-sky' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Avatar initials={camper.full_name?.charAt(0) ?? '?'} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{camper.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{camper.parent_email || 'אין מייל הורה'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto">
            {sent ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                  <Icon name="check_circle" fill className="text-3xl" />
                </div>
                <p className="font-bold text-deep-slate">ההודעה נשלחה בהצלחה!</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-right">
                    <Icon name="error" className="text-red-500 text-lg shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">אל: (אימייל)</label>
                  <input
                    type="email"
                    value={toEmail}
                    onChange={e => setToEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="input-field text-right"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-right">תוכן ההודעה</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="כתבו כאן את תגובתכם להורה..."
                    className="input-field flex-1 min-h-[160px] resize-none text-right placeholder:text-slate-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
            <button
              onClick={resetAndClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-sm hover:bg-slate-50 transition-colors"
            >
              ביטול
            </button>
            <button
              onClick={handleSendEmail}
              className="flex-1 py-3 rounded-xl bg-vibrant-pink text-white font-black text-sm shadow-lg shadow-pink-200/50 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="send" className="text-lg" />
              שליחת מייל
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
