import { useState } from 'react';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';

interface Post {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  time: string;
  location: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  isAnnouncement?: boolean;
}

const posts: Post[] = [
  {
    id: 1,
    author: 'מיכל לוי',
    initials: 'מל',
    avatarColor: 'from-summer-sky to-blue-400',
    time: 'לפני 20 דקות',
    location: 'מחנה דרום',
    content: 'הבוקר התחלנו את פעילות הניווט ביער. החניכים הפגינו יכולות מדהימות ושיתוף פעולה יוצא דופן! 🌲',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=900',
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    author: 'דניאל כהן',
    initials: 'דכ',
    avatarColor: 'from-vibrant-pink to-pink-500',
    time: 'לפני שעתיים',
    location: 'מפקדת המשלחת',
    content: 'נא לשים לב לשינוי בשעות ארוחת הערב בגלל מזג האוויר. ניפגש בחדר האוכל המרכזי בשעה 19:30 בדיוק.',
    likes: 12,
    comments: 3,
    isAnnouncement: true,
  },
  {
    id: 3,
    author: 'שירה אברהם',
    initials: 'שא',
    avatarColor: 'from-sunset-orange to-amber-400',
    time: 'לפני 4 שעות',
    location: 'אזור הבריכה',
    content: 'שיעור שחייה מוצלח להפליא! כל החניכים השלימו את מבחן הרישוי לבריכה העמוקה 🏊‍♂️',
    image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&q=80&w=900',
    likes: 31,
    comments: 8,
  },
];

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

function FeedCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden text-right">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <Icon name="more_horiz" />
        </button>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h4 className="font-bold text-deep-slate text-sm">{post.author}</h4>
            <p className="text-xs text-slate-400">{post.time} • {post.location}</p>
          </div>
          <Avatar initials={post.initials} gradient={post.avatarColor} size="lg" />
        </div>
      </div>

      {/* Announcement badge */}
      {post.isAnnouncement && (
        <div className="px-4 pb-1">
          <Badge variant="announcement">
            <Icon name="campaign" fill className="text-sm" />
            עדכון רשמי מהמפקדה
          </Badge>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-on-surface text-sm leading-relaxed">{post.content}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
          <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
          <button className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-summer-sky shadow-sm hover:scale-110 transition-transform">
            <Icon name="bookmark_add" fill className="text-lg" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-50">
        <button className="text-slate-400 hover:text-summer-sky transition-colors">
          <Icon name="share" className="text-xl" />
        </button>
        <div className="flex gap-5">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 transition-colors ${liked ? 'text-vibrant-pink' : 'text-slate-400 hover:text-vibrant-pink'}`}
          >
            <Icon name="favorite" fill={liked} className="text-xl" />
            <span className="text-xs font-bold">{liked ? post.likes + 1 : post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-summer-sky transition-colors">
            <Icon name="chat_bubble" className="text-xl" />
            <span className="text-xs font-bold">{post.comments}</span>
          </button>
        </div>
      </div>

      {/* Comment Box */}
      <div className="px-4 pb-4 flex gap-2 items-center">
        <Button className="text-xs py-2 px-4">שלח</Button>
        <input
          type="text"
          placeholder="הוסיפו תגובה..."
          className="flex-1 bg-slate-50 border-none rounded-full py-2 px-4 text-sm text-right placeholder:text-slate-400 focus:ring-2 focus:ring-summer-sky/30 outline-none"
        />
        <Avatar initials="מ" gradient="from-summer-sky to-blue-400" size="sm" />
      </div>
    </article>
  );
}

export default function FeedPage() {
  return (
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
          <Button>העלאת עדכון</Button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-deep-slate">שתפו עדכון חדש</p>
              <p className="text-sm text-slate-400">תמונות, סרטונים או הודעות טקסט</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-vibrant-pink group-hover:scale-110 transition-transform">
              <Icon name="add_a_photo" fill className="text-2xl" />
            </div>
          </div>
        </Card>

        {/* Posts */}
        <div className="space-y-5">
          {posts.map(post => <FeedCard key={post.id} post={post} />)}
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
  );
}
