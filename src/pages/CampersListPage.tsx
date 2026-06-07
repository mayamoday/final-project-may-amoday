import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { getCampers } from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CamperRow {
  id: string;
  full_name: string;
  parent_name: string | null;
  birth_date: string | null;
  shirt_size: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  critical_medical_info: string | null;
  profile_image_url: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GRADIENTS = [
  'from-summer-sky to-vibrant-pink',
  'from-vibrant-pink to-sunset-orange',
  'from-sunshine-yellow to-sunset-orange',
  'from-summer-sky to-sunshine-yellow',
  'from-vibrant-pink to-summer-sky',
  'from-sunset-orange to-vibrant-pink',
  'from-summer-sky to-sunset-orange',
  'from-vibrant-pink to-sunshine-yellow',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0);
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
}

function computeAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate}T12:00:00`);
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampersListPage() {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [campers, setCampers]   = useState<CamperRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [search, setSearch]     = useState('');

  // Camper/parent users see only their own profile
  useEffect(() => {
    if (userRole === 'camper' && user?.id) {
      navigate(`/camper/${user.id}`, { replace: true });
    }
  }, [userRole, user, navigate]);

  // Staff: fetch all campers
  useEffect(() => {
    if (userRole !== 'staff') return;
    (async () => {
      setLoading(true);
      const { data, error } = await getCampers();
      if (error) setFetchErr(error);
      else setCampers((data ?? []) as CamperRow[]);
      setLoading(false);
    })();
  }, [userRole]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return campers;
    return campers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        (c.parent_name ?? '').toLowerCase().includes(q),
    );
  }, [campers, search]);

  const withMedical = campers.filter((c) => c.critical_medical_info).length;

  // ── Loading / redirect states ──
  if (!userRole || userRole === 'camper') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
          <p className="text-sm font-bold">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12" dir="rtl">
      <PageHeader
        title="רשימת חניכים"
        subtitle="ניהול וצפייה בחניכים"
        icon="group"
        iconColor="text-summer-sky"
        actions={
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white rounded-xl px-4 py-2.5 border border-slate-100 shadow-sm">
            <Icon name="calendar_today" className="text-sm text-summer-sky" />
            <span>קיץ 2024</span>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
            <Icon name="group" fill className="text-summer-sky text-xl" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-deep-slate leading-none">{campers.length}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">סך חניכים</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Icon name="warning" fill className="text-red-500 text-xl" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-deep-slate leading-none">{withMedical}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">מידע רפואי קריטי</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Icon name="check_circle" fill className="text-emerald-600 text-xl" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-deep-slate leading-none">
              {campers.length - withMedical}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">ללא הגבלות</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Icon
            name="search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם חניך או שם הורה..."
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pr-10 pl-4 text-sm text-right focus:ring-2 focus:ring-summer-sky/30 outline-none transition-all"
          />
        </div>
      </Card>

      {/* Results hint */}
      {search.trim() && (
        <p className="text-sm text-slate-500 mb-4 text-right">
          מציג <span className="font-bold text-deep-slate">{filtered.length}</span> מתוך {campers.length} חניכים
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
            <p className="text-sm font-bold">טוען חניכים...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && fetchErr && (
        <div className="text-center py-16 text-red-400">
          <Icon name="error" className="text-5xl block mx-auto mb-3" />
          <p className="font-bold">שגיאה בטעינת הנתונים</p>
          <p className="text-sm mt-1 text-slate-400">{fetchErr}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchErr && filtered.length === 0 && (
        <div className="text-center py-24 text-slate-400">
          <Icon name="search_off" className="text-6xl mb-4 block mx-auto" />
          <p className="font-bold text-base">לא נמצאו חניכים</p>
          <p className="text-sm mt-1">נסה לשנות את פרמטרי החיפוש</p>
        </div>
      )}

      {/* Camper Grid */}
      {!loading && !fetchErr && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((camper, idx) => {
            const age       = computeAge(camper.birth_date);
            const initials  = getInitials(camper.full_name);
            const gradient  = GRADIENTS[idx % GRADIENTS.length];
            const hasMedical = Boolean(camper.critical_medical_info);

            return (
              <Card
                key={camper.id}
                className="p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                onClick={() => navigate(`/camper/${camper.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar
                      src={camper.profile_image_url ?? undefined}
                      initials={initials}
                      gradient={gradient}
                      size="lg"
                      className="border-2 border-white shadow-sm"
                    />
                    {hasMedical && (
                      <span
                        title="מידע רפואי קריטי"
                        className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-white flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-white text-[9px] font-black leading-none">priority_high</span>
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-right">
                    <h3 className="font-bold text-deep-slate truncate text-sm group-hover:text-summer-sky transition-colors mb-0.5">
                      {camper.full_name}
                    </h3>
                    {camper.parent_name && (
                      <p className="text-xs text-slate-400 truncate">
                        הורה: {camper.parent_name}
                      </p>
                    )}
                    <div className="flex items-center justify-end gap-2 mt-1.5 flex-wrap">
                      {age !== null && (
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          גיל {age}
                        </span>
                      )}
                      {camper.shirt_size && (
                        <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                          {camper.shirt_size}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                  <Icon
                    name="chevron_left"
                    className="text-slate-300 group-hover:text-summer-sky transition-colors text-xl"
                  />
                  {hasMedical ? (
                    <span className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                      <Icon name="warning" fill className="text-sm" />
                      מידע רפואי קריטי
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300 font-medium">צפה בפרופיל</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
