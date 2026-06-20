import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Avatar from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { supabase } from '../lib/supabase';

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('');
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

interface CamperResult {
  id: string;
  full_name: string;
}

interface TaskResult {
  id: string;
  title: string;
}

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavItem {
  icon: string;
  label: string;
  path: string;
  roles: Array<'staff' | 'camper'>;
}

function buildNavItems(userId: string | undefined): NavItem[] {
  return [
    { icon: 'home',           label: 'דף הבית',      path: '/feed',                      roles: ['staff', 'camper'] },
    { icon: 'dashboard',      label: 'דאשבורד סגל',  path: '/dashboard',                  roles: ['staff']           },
    { icon: 'payments',       label: 'ניהול תקציב',  path: '/expenses',                   roles: ['staff']           },
    { icon: 'group',          label: 'חניכים',        path: '/campers',                    roles: ['staff']           },
    { icon: 'person',         label: 'הפרופיל שלי',  path: `/camper/${userId ?? ''}`,     roles: ['camper']          },
    { icon: 'menu_book',      label: 'מאגר ידע',      path: '/knowledge',                  roles: ['staff']           },
    { icon: 'checklist',      label: 'משימות',         path: '/tasks',                      roles: ['staff']           },
    { icon: 'report_problem', label: 'דיווח אירוע',   path: '/incidents',                  roles: ['staff']           },
    { icon: 'settings',       label: 'הגדרות',         path: '/settings',                   roles: ['staff', 'camper'] },
  ];
}

// ─── SideNav ──────────────────────────────────────────────────────────────────

export function SideNav() {
  const { signOut, user, userRole } = useAuth();
  const { fullName, avatarUrl } = useProfile();
  const navigate = useNavigate();
  const displayName = fullName || '...';

  const roleLabel = userRole === 'staff' ? 'סגל מחנה' : userRole === 'camper' ? 'הורה / חניך' : '';

  const navItems = buildNavItems(user?.id).filter(
    (item) => !userRole || item.roles.includes(userRole),
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className="fixed top-0 right-0 h-screen w-64 bg-white border-l border-slate-100 flex flex-col z-50 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-summer-sky to-vibrant-pink flex items-center justify-center text-white shadow-sm">
          <Icon name="forest" fill className="text-xl" />
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black text-sky-500 tracking-tight leading-none">My Camp</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">16.7-11.8.2026</p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        <Avatar src={avatarUrl ?? undefined} initials={getInitials(displayName)} size="md" className="border-2 border-summer-sky" />
        <div className="text-right flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
          <p className="text-[10px] text-slate-500">{roleLabel}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group ${
                isActive
                  ? 'bg-pink-50 text-vibrant-pink font-bold border-r-4 border-vibrant-pink'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:translate-x-[-4px]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  name={item.icon}
                  fill={isActive}
                  className={`text-xl ${isActive ? 'text-vibrant-pink' : 'text-slate-400 group-hover:text-slate-600'}`}
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-50 rounded-xl transition-colors text-sm"
        >
          <Icon name="logout" className="text-lg" />
          <span>התנתקות</span>
        </button>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export function TopBar() {
  const { user } = useAuth();
  const { fullName, avatarUrl } = useProfile();
  const navigate = useNavigate();
  const topInitials = fullName ? getInitials(fullName) : (user?.email?.charAt(0).toUpperCase() ?? 'U');

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching]     = useState(false);
  const [camperResults, setCamperResults] = useState<CamperResult[]>([]);
  const [taskResults, setTaskResults]     = useState<TaskResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Close the dropdown when clicking outside the search box
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      setCamperResults([]);
      setTaskResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);

    Promise.all([
      supabase.from('camper').select('id, full_name').ilike('full_name', `%${trimmed}%`).limit(5),
      supabase.from('tasks').select('id, title').ilike('title', `%${trimmed}%`).limit(5),
    ]).then(([campersRes, tasksRes]) => {
      if (!active) return;
      if (campersRes.error) console.error('[TopBar search] campers failed:', campersRes.error);
      if (tasksRes.error) console.error('[TopBar search] tasks failed:', tasksRes.error);
      setCamperResults(campersRes.data ?? []);
      setTaskResults(tasksRes.data ?? []);
      setSearching(false);
    });

    return () => { active = false; };
  }, [debouncedQuery]);

  const clearSearch = () => {
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const goToCamper = (id: string) => {
    navigate(`/camper/${id}`);
    clearSearch();
  };

  const goToTasks = () => {
    navigate('/tasks');
    clearSearch();
  };

  const showDropdown = dropdownOpen && searchQuery.trim().length > 0;
  const hasResults = camperResults.length > 0 || taskResults.length > 0;

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-8 py-3 flex justify-between items-center">
      {/* Search */}
      <div className="flex-1 max-w-sm relative" ref={searchRef} dir="rtl">
        <div className="relative group">
          <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-summer-sky transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            placeholder="חיפוש חניכים, משימות..."
            className="w-full bg-slate-50 border-none rounded-full py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none transition-all text-right placeholder:text-slate-400"
          />
        </div>

        {showDropdown && (
          <div className="absolute top-full inset-x-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 text-right max-h-96 overflow-y-auto">
            {searching ? (
              <p className="px-4 py-4 text-xs text-slate-400 text-center">מחפש...</p>
            ) : !hasResults ? (
              <p className="px-4 py-4 text-xs text-slate-400 text-center">לא נמצאו תוצאות</p>
            ) : (
              <>
                {camperResults.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">חניכים</p>
                    {camperResults.map((camper) => (
                      <button
                        key={camper.id}
                        type="button"
                        onClick={() => goToCamper(camper.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                      >
                        <Icon name="person" className="text-base text-summer-sky" />
                        {camper.full_name}
                      </button>
                    ))}
                  </div>
                )}
                {taskResults.length > 0 && (
                  <div className={camperResults.length > 0 ? 'border-t border-slate-50' : ''}>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">משימות</p>
                    {taskResults.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={goToTasks}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                      >
                        <Icon name="checklist" className="text-base text-vibrant-pink" />
                        {task.title}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div className="cursor-pointer hover:scale-105 transition-transform rounded-xl overflow-hidden border-2 border-summer-sky/30 shadow-sm">
        <Avatar src={avatarUrl ?? undefined} initials={topInitials} size="md" className="rounded-xl" />
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <SideNav />
      <div className="mr-64 min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
