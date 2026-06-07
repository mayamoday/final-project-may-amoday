import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import Avatar from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('...');

  // Fetch display name from the correct table once role is known
  useEffect(() => {
    if (!user || !userRole) return;
    const table = userRole === 'staff' ? 'staff' : 'camper';
    supabase
      .from(table)
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setDisplayName(data.full_name);
      });
  }, [user, userRole]);

  const roleLabel = userRole === 'staff' ? 'סגל מחנה' : userRole === 'camper' ? 'הורה / חניך' : '';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=7dd3fc&color=fff&size=64`;

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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">קיץ 2024</p>
        </div>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        <Avatar src={avatarUrl} size="md" className="border-2 border-summer-sky" />
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

      {/* Quick Action — staff only */}
      {userRole === 'staff' && (
        <div className="px-4 pb-2">
          <button className="w-full bg-summer-sky text-white font-bold py-3 rounded-2xl shadow-lg shadow-sky-200/50 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
            <Icon name="add" className="text-lg" />
            <span>פעולה מהירה</span>
          </button>
        </div>
      )}

      {/* Bottom links */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors text-sm">
          <Icon name="help" className="text-lg" />
          <span>עזרה ותמיכה</span>
        </a>
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
  const topAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email ?? 'U')}&background=7dd3fc&color=fff&size=64`;
  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-8 py-3 flex justify-between items-center">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative group">
          <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-summer-sky transition-colors" />
          <input
            type="text"
            placeholder="חיפוש חניכים, משימות..."
            className="w-full bg-slate-50 border-none rounded-full py-2.5 pr-10 pl-4 text-sm focus:ring-2 focus:ring-summer-sky/30 outline-none transition-all text-right placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2.5 rounded-full hover:bg-sky-50 text-slate-400 hover:text-summer-sky transition-all active:scale-95">
          <Icon name="help" className="text-xl" />
        </button>
        <button className="p-2.5 rounded-full hover:bg-sky-50 text-slate-400 hover:text-summer-sky transition-all active:scale-95">
          <Icon name="chat" className="text-xl" />
        </button>
        <button className="p-2.5 rounded-full hover:bg-pink-50 text-slate-400 hover:text-vibrant-pink transition-all active:scale-95 relative">
          <Icon name="notifications" className="text-xl" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-vibrant-pink rounded-full border-2 border-white animate-pulse" />
        </button>

        <div className="ml-1 cursor-pointer hover:scale-105 transition-transform rounded-xl overflow-hidden border-2 border-summer-sky/30 shadow-sm">
          <Avatar src={topAvatarUrl} size="md" className="rounded-xl" />
        </div>
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
