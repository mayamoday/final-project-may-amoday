import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import CreatePostModal from '../components/CreatePostModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PostLike {
  staffId: string;
  fullName: string;
}

interface PostComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface FeedPost {
  id: string;
  authorName: string;
  authorInitials: string;
  avatarGradient: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  likes: PostLike[];
  comments: PostComment[];
}

const AVATAR_GRADIENTS = [
  'from-summer-sky to-blue-400',
  'from-vibrant-pink to-pink-500',
  'from-sunset-orange to-amber-400',
  'from-emerald-400 to-teal-500',
  'from-purple-400 to-indigo-500',
];

function stableGradient(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
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

/** staff(full_name) embeds may come back as a single joined object or an array — guard both shapes. */
function staffFullName(staffField: unknown): string | null {
  const s = staffField as { full_name?: string } | { full_name?: string }[] | null | undefined;
  if (Array.isArray(s)) return s[0]?.full_name ?? null;
  return s?.full_name ?? null;
}

function likesSummary(likes: PostLike[]): string {
  const names = likes.map(l => l.fullName);
  if (names.length === 0) return '';
  if (names.length === 1) return `${names[0]} אהב/ה את זה`;
  if (names.length === 2) return `${names[0]} ו-${names[1]} אהבו את זה`;
  return `${names[0]}, ${names[1]} ו-${names.length - 2} נוספים אהבו את זה`;
}

interface SidebarTask {
  id: string;
  title: string;
  status: string;
}

function taskStatusMeta(status: string): { label: string; variant: 'info' | 'warning'; icon: string } {
  if (status === 'בתהליך') return { label: 'בתהליך', variant: 'info', icon: 'autorenew' };
  return { label: 'לביצוע', variant: 'warning', icon: 'schedule' };
}

interface FeedCardProps {
  post: FeedPost;
  currentUserId: string | undefined;
  currentUserName: string;
  onToggleLike: (post: FeedPost) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
}

function FeedCard({ post, currentUserId, currentUserName, onToggleLike, onAddComment }: FeedCardProps) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  const isLiked = !!currentUserId && post.likes.some(l => l.staffId === currentUserId);
  const summary = likesSummary(post.likes);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    await onAddComment(post.id, trimmed);
    setCommentText('');
    setSubmitting(false);
  };

  return (
    <article className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden text-right" dir="rtl">
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
      <div className="px-4 py-3 border-t border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <button
              onClick={() => onToggleLike(post)}
              className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-vibrant-pink' : 'text-slate-400 hover:text-vibrant-pink'}`}
            >
              <Icon name="favorite" fill={isLiked} className="text-xl" />
            </button>
            <button className="flex items-center gap-1.5 text-slate-400 hover:text-summer-sky transition-colors">
              <Icon name="chat_bubble" className="text-xl" />
            </button>
          </div>
          <button className="text-slate-400 hover:text-summer-sky transition-colors">
            <Icon name="share" className="text-xl" />
          </button>
        </div>
        {summary && (
          <p className="text-xs text-slate-500 mt-2 text-right">{summary}</p>
        )}
      </div>

      {/* Comments list */}
      {post.comments.length > 0 && (
        <div className="px-4 pb-3 space-y-3 border-t border-slate-50 pt-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2 items-start text-right">
              <Avatar initials={getInitials(c.authorName)} gradient={stableGradient(c.authorName)} size="sm" />
              <div className="flex-1 bg-slate-50 rounded-2xl px-3 py-2 min-w-0">
                <p className="text-xs font-bold text-deep-slate">{c.authorName}</p>
                <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-line">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Box: avatar on right, input in middle, send button on far left */}
      <form onSubmit={handleSubmitComment} className="px-4 pb-4 flex gap-2 items-center" dir="rtl">
        <Avatar initials={getInitials(currentUserName || '?')} gradient="from-summer-sky to-blue-400" size="sm" />
        <input
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="הוסיפו תגובה..."
          className="flex-1 bg-slate-50 border-none rounded-full py-2 px-4 text-sm text-right placeholder:text-slate-400 focus:ring-2 focus:ring-summer-sky/30 outline-none"
        />
        <Button type="submit" disabled={submitting || !commentText.trim()} className="text-xs py-2 px-4 shrink-0">
          {submitting ? <Icon name="refresh" className="text-sm animate-spin" /> : 'שלח'}
        </Button>
      </form>
    </article>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorName, setAuthorName]   = useState('');
  const [posts, setPosts]             = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [openTasks, setOpenTasks]           = useState<SidebarTask[]>([]);
  const [openTasksCount, setOpenTasksCount] = useState(0);

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

  async function fetchPosts(opts: { silent?: boolean } = {}) {
    if (!opts.silent) setLoadingPosts(true);

    const { data, error } = await supabase
      .from('post')
      .select('*, staff(full_name), post_likes(staff_id, staff(full_name)), post_comments(id, content, created_at, staff(full_name))')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error(error);
      setPosts([]);
      if (!opts.silent) setLoadingPosts(false);
      return;
    }

    setPosts(data.map((p: any) => {
      const name = staffFullName(p.staff) ?? 'משתמש לא ידוע';

      const likes: PostLike[] = (p.post_likes ?? []).map((l: any) => ({
        staffId: l.staff_id,
        fullName: staffFullName(l.staff) ?? 'לא ידוע',
      }));

      const comments: PostComment[] = (p.post_comments ?? [])
        .map((c: any) => ({
          id: c.id,
          authorName: staffFullName(c.staff) ?? 'לא ידוע',
          content: c.content,
          createdAt: c.created_at,
        }))
        .sort((a: PostComment, b: PostComment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return {
        id: p.id,
        authorName: name,
        authorInitials: getInitials(name),
        avatarGradient: stableGradient(p.user_id),
        content: p.content,
        imageUrl: p.image_url,
        createdAt: p.created_at,
        likes,
        comments,
      };
    }));

    if (!opts.silent) setLoadingPosts(false);
  }

  async function handleToggleLike(post: FeedPost) {
    if (!user) return;
    const alreadyLiked = post.likes.some(l => l.staffId === user.id);

    const { error } = alreadyLiked
      ? await supabase.from('post_likes').delete().eq('post_id', post.id).eq('staff_id', user.id)
      : await supabase.from('post_likes').insert({ post_id: post.id, staff_id: user.id });

    if (error) { console.error('[handleToggleLike]', error); return; }
    await fetchPosts({ silent: true });
  }

  async function handleAddComment(postId: string, content: string) {
    if (!user) return;
    const { error } = await supabase.from('post_comments').insert({ post_id: postId, staff_id: user.id, content });
    if (error) { console.error('[handleAddComment]', error); return; }
    await fetchPosts({ silent: true });
  }

  async function fetchOpenTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, status')
      .neq('status', 'הושלם')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setOpenTasks([]);
      setOpenTasksCount(0);
      return;
    }

    setOpenTasksCount(data?.length ?? 0);
    setOpenTasks((data ?? []).slice(0, 4));
  }

  useEffect(() => {
    fetchPosts();
    fetchOpenTasks();
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
            posts.map(post => (
              <FeedCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                currentUserName={authorName}
                onToggleLike={handleToggleLike}
                onAddComment={handleAddComment}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Widget Panel ── */}
      <aside className="w-72 shrink-0 space-y-4 pb-12">

        {/* Tasks Widget */}
        <Card className="p-5 text-right">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="info">{openTasksCount} משימות</Badge>
            <h3 className="font-bold text-deep-slate text-sm">משימות פתוחות</h3>
          </div>
          <div className="space-y-3">
            {openTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">אין משימות פתוחות 🎉</p>
            ) : (
              openTasks.map((task) => {
                const meta = taskStatusMeta(task.status);
                return (
                  <div key={task.id} className="flex items-center justify-between gap-2">
                    <Badge variant={meta.variant} className="shrink-0">{meta.label}</Badge>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{task.title}</p>
                      <Icon name={meta.icon} className="text-base text-slate-400 shrink-0" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="w-full mt-5 text-summer-sky text-xs font-bold hover:underline text-right"
          >
            לכל המשימות ›
          </button>
        </Card>

        {/* Emergency Button */}
        <button
          onClick={() => navigate('/incidents')}
          className="w-full bg-error text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-red-200/50 hover:brightness-95 active:scale-95 transition-all"
        >
          <Icon name="emergency_home" fill className="text-2xl" />
          דיווח אירוע חריג
        </button>
      </aside>
    </div>

    <CreatePostModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      authorName={authorName}
      onSuccess={() => fetchPosts()}
    />
    </>
  );
}
