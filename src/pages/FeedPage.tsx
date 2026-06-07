import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import CreatePostModal from '../components/CreatePostModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FeedPost {
  id: string;
  authorName: string;
  authorInitials: string;
  avatarGradient: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

const AVATAR_GRADIENTS = [
  'from-summer-sky to-blue-400',
  'from-vibrant-pink to-pink-500',
  'from-sunset-orange to-amber-400',
  'from-emerald-400 to-teal-500',
  'from-purple-400 to-indigo-500',
];

function stableGradient(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('');
}

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return `לפני ${m} דקות`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} שעות`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

const tasks = [
  { label: "צ'ק-אין חניכים", progress: 85, color: 'bg-summer-sky' },
  { label: 'איסוף ציוד ערב', progress: 30, color: 'bg-sunset-orange' },
  { label: 'דיווח נוכחות סגל', progress: 100, color: 'bg-emerald-500' },
];

const schedule = [
  { time: '16:00', title: 'סדנת יצירה', sub: 'חטיבה תחתונה', active: true },
  { time: '17:30', title: 'זמן חופשי', sub: 'בריכה/מגרשים', active: false },
  { time: '19:30', title: 'ארוחת ערב', sub: 'חדר אוכל מרכזי', active: false },
];

function FeedCard({ post }: { post: FeedPost }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden text-right">
      {/* Header: avatar rightmost, name/time to its left, more-button on far left */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar initials={post.authorInitials} gradient={post.avatarGradient} size="lg" />
          <div className="text-right">
            <h4 className="font-bold text-deep-slate text-sm">{post.authorName}</h4>
            <p className="text-xs text-slate-400">{formatRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <Icon name="more_horiz" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 text-right">
        <p className="text-on-surface text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
          <img src={post.imageUrl} alt="תוכן הפוסט" className="w-full h-full object-cover" />
          <button className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-summer-sky shadow-sm hover:scale-110 transition-transform">
            <Icon name="bookmark_add" fill className="text-lg" />
          </button>
        </div>
      )}

      {/* Actions: like+comment on right (start), share on far left (end) */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-50">
        <div className="flex gap-5">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-vibrant-pink' : 'text-slate-400 hover:text-vibrant-pink'}`}
          >
            <Icon name="favorite" fill={liked} className="text-xl" />
          </button>
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-summer-sky transition-colors">
            <Icon name="chat_bubble" className="text-xl" />
          </button>
        </div>
        <button className="text-slate-400 hover:text-summer-sky transition-colors">
          <Icon name="share" className="text-xl" />
        </button>
      </div>

      {/* Comment Box: avatar on right, input in middle, send button on far left */}
      <div className="px-4 pb-4 flex gap-2 items-center">
        <Avatar initials="מ" gradient="from-summer-sky to-blue-400" size="sm" />
        <input
          type="text"
          placeholder="הוסיפו תגובה..."
          className="flex-1 bg-slate-50 border-none rounded-full py-2 px-4 text-sm text-right placeholder:text-slate-400 focus:ring-2 focus:ring-summer-sky/30 outline-none"
        />
        <Button className="text-xs py-2 px-4 shrink-0">שלח</Button>
      </div>
    </article>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName]   = useState('');
  const [posts, setPosts]             = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function fetchAuthor() {
      const { data: staffRow } = await supabase
        .from('staff')
        .select('full_name')
        .eq('id', user!.id)
        .maybeSingle();
      if (staffRow?.full_name) { setAuthorName(staffRow.full_name); return; }

      const { data: camperRow } = await supabase
        .from('camper')
        .select('full_name')
        .eq('id', user!.id)
        .maybeSingle();
      if (camperRow?.full_name) setAuthorName(camperRow.full_name);
    }
    fetchAuthor();
  }, [user]);

  async function fetchPosts() {
    setLoadingPosts(true);

    const { data: rawPosts, error } = await supabase
      .from('post')
      .select('id, content, image_url, user_id, created_at')
      .order('created_at', { ascending: false });

    if (error || !rawPosts?.length) {
      setPosts([]);
      setLoadingPosts(false);
      return;
    }

    const userIds = [...new Set(rawPosts.map(p => p.user_id))];
    const [{ data: staffRows }, { data: camperRows }] = await Promise.all([
      supabase.from('staff').select('id, full_name').in('id', userIds),
      supabase.from('camper').select('id, full_name').in('id', userIds),
    ]);

    const authorMap = new Map<string, string>();
    staffRows?.forEach(s => authorMap.set(s.id, s.full_name));
    camperRows?.forEach(c => { if (!authorMap.has(c.id)) authorMap.set(c.id, c.full_name); });

    setPosts(rawPosts.map(p => {
      const name = authorMap.get(p.user_id) ?? 'משתמש לא ידוע';
      return {
        id: p.id,
        authorName: name,
        authorInitials: getInitials(name),
        avatarGradient: stableGradient(p.user_id),
        content: p.content,
        imageUrl: p.image_url,
        createdAt: p.created_at,
      };
    }));

    setLoadingPosts(false);
  }

  useEffect(() => {
    fetchPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    <div className="flex gap-6" dir="rtl">

      {/* ── Main Feed ── */}
      <div className="flex-1 min-w-0 space-y-5 pb-12">
        {/* Header */}
        <div className="flex justify-between items-end mb-2">
          <div className="text-right">
            <h1 className="text-h1-display text-deep-slate font-black">עדכונים יומיים מהמשלחת</h1>
            <p className="text-slate-500 text-base mt-1">צפו בנעשה בשטח ושתפו רגעים חדשים</p>
          </div>
        </div>

        {/* Upload prompt */}
        <Card className="p-5 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-vibrant-pink group-hover:scale-110 transition-transform shrink-0">
              <Icon name="add_a_photo" fill className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="font-bold text-deep-slate">שתפו עדכון חדש</p>
              <p className="text-sm text-slate-400">תמונות, סרטונים או הודעות טקסט</p>
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>העלאת עדכון</Button>
        </Card>

        {/* Posts */}
        <div className="space-y-5">
          {loadingPosts ? (
            <div className="flex justify-center py-12">
              <Icon name="refresh" className="text-3xl text-slate-300 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Icon name="feed" className="text-5xl mb-3 block mx-auto" />
              <p className="font-bold">אין פוסטים עדיין</p>
              <p className="text-sm mt-1">היו הראשונים לשתף עדכון מהמחנה!</p>
            </div>
          ) : (
            posts.map(post => <FeedCard key={post.id} post={post} />)
          )}
        </div>
      </div>

      {/* ── Right Widget Panel ── */}
      <aside className="w-72 shrink-0 space-y-4 pb-12">

        {/* Tasks Widget */}
        <Card className="p-5 text-right">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="info">8 משימות</Badge>
            <h3 className="font-bold text-deep-slate text-sm">משימות פתוחות</h3>
          </div>
          <div className="space-y-4">
            {tasks.map((task, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>{task.progress}%</span>
                  <span>{task.label}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`${task.color} h-full rounded-full transition-all duration-700`} style={{ width: `${task.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 text-summer-sky text-xs font-bold hover:underline text-right">
            לכל המשימות ›
          </button>
        </Card>

        {/* Schedule Widget */}
        <Card className="p-5 text-right">
          <h3 className="font-bold text-deep-slate text-sm mb-4">לו"ז יומי — 14 יולי</h3>
          <div className="space-y-4">
            {schedule.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className={`font-bold text-xs pt-0.5 w-12 text-left shrink-0 ${item.active ? 'text-summer-sky' : 'text-slate-400'}`}>{item.time}</span>
                <div className={`border-r-2 pr-3 flex-1 ${item.active ? 'border-summer-sky' : 'border-slate-100'}`}>
                  <p className={`text-xs font-bold ${item.active ? 'text-deep-slate' : 'text-slate-500'}`}>{item.title}</p>
                  <p className="text-[10px] text-slate-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Button */}
        <button className="w-full bg-error text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-red-200/50 hover:brightness-95 active:scale-95 transition-all">
          <Icon name="emergency_home" fill className="text-2xl" />
          דיווח אירוע חריג
        </button>

        {/* Weather Card */}
        <div className="bg-gradient-to-br from-summer-sky/20 to-blue-100 rounded-2xl p-5 border border-sky-100 text-right">
          <div className="flex justify-between items-start mb-3">
            <span className="text-3xl">☀️</span>
            <div>
              <p className="text-xs text-sky-700 font-bold">מזג אוויר היום</p>
              <p className="text-xs text-sky-600">מחנה שטח B, ישראל</p>
            </div>
          </div>
          <p className="text-3xl font-black text-sky-700">28°</p>
          <p className="text-xs text-sky-600 mt-1">שמש עם עננות קלה, לחות 55%</p>
        </div>
      </aside>
    </div>

    <CreatePostModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      authorName={authorName}
      onSuccess={fetchPosts}
    />
    </>
  );
}
