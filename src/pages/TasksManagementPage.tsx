import { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'גבוהה' | 'בינונית' | 'נמוכה';
type Status   = 'לביצוע' | 'בתהליך' | 'הושלם';
type Filter   = 'הכל' | Status | 'גבוהה';

interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  assignee: string;
  assigneeInitials: string;
  assigneeGradient: string;
  dueDate: string;
  category: string;
  categoryIcon: string;
}

interface StaffOption {
  id: string;
  full_name: string;
}

interface NewTaskForm {
  title: string;
  description: string;
  due_date: string;
  priority: Priority;
  category: string;
  assignee_id: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  'from-summer-sky to-blue-400',
  'from-vibrant-pink to-pink-500',
  'from-sunset-orange to-amber-400',
  'from-emerald-400 to-teal-500',
  'from-purple-400 to-indigo-500',
  'from-red-400 to-red-600',
];

function stableGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('');
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const CATEGORY_ICONS: Record<string, string> = {
  'בטיחות':   'health_and_safety',
  'לוגיסטיקה': 'checklist',
  'אמנות':    'palette',
  'ספורט':    'sports_soccer',
  'תקשורת':   'mail',
  'תקציב':    'payments',
  'ניקיון':   'cleaning_services',
};

// ─── Config maps ──────────────────────────────────────────────────────────────

const priorityBadge: Record<Priority, 'danger' | 'warning' | 'neutral'> = {
  גבוהה: 'danger', בינונית: 'warning', נמוכה: 'neutral',
};

const columns: { status: Status; label: string; color: string; bg: string; dot: string }[] = [
  { status: 'לביצוע', label: 'לביצוע', color: 'text-slate-600',   bg: 'bg-slate-50',   dot: 'bg-slate-400'   },
  { status: 'בתהליך', label: 'בתהליך', color: 'text-summer-sky',  bg: 'bg-sky-50',     dot: 'bg-summer-sky'  },
  { status: 'הושלם',  label: 'הושלם',  color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
];

const filters: Filter[] = ['הכל', 'לביצוע', 'בתהליך', 'הושלם', 'גבוהה'];

// ─── Task Card ─────────────────────────────────────────────────────────────────

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const done = task.status === 'הושלם';

  return (
    <Card className={`p-4 text-right hover:shadow-md transition-all duration-200 ${done ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
            done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400'
          }`}
        >
          {done && <Icon name="check" className="text-white text-xs" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm leading-snug ${done ? 'line-through text-slate-400' : 'text-deep-slate'}`}>
            {task.title}
          </p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{task.description}</p>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Icon name="schedule" className="text-xs text-slate-400" />
              <span className="text-[10px] text-slate-400">{task.dueDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={priorityBadge[task.priority]}>{task.priority}</Badge>
              <Avatar initials={task.assigneeInitials} gradient={task.assigneeGradient} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── New Task Modal ────────────────────────────────────────────────────────────

const EMPTY_FORM: NewTaskForm = {
  title: '', description: '', due_date: '', priority: 'בינונית', category: '', assignee_id: '',
};

function NewTaskModal({
  isOpen,
  onClose,
  staffOptions,
  onCreated,
  currentUserId,
}: {
  isOpen: boolean;
  onClose: () => void;
  staffOptions: StaffOption[];
  onCreated: () => void;
  currentUserId: string;
}) {
  const [form, setForm] = useState<NewTaskForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function patch<K extends keyof NewTaskForm>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('tasks').insert({
      title:       form.title.trim(),
      description: form.description.trim() || null,
      due_date:    form.due_date || null,
      priority:    form.priority,
      category:    form.category.trim() || null,
      assignee_id: form.assignee_id || null,
      status:      'לביצוע',
      user_id:     currentUserId,
    });

    setSubmitting(false);
    if (error) { console.error(error); return; }

    setForm(EMPTY_FORM);
    onCreated();
    onClose();
  }

  if (!isOpen) return null;

  const inputCls =
    'w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-right bg-white ' +
    'focus:ring-2 focus:ring-summer-sky/30 focus:border-summer-sky outline-none transition ' +
    'placeholder:text-slate-400';
  const labelCls = 'block text-xs font-bold text-slate-600 mb-1 text-right';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Icon name="close" />
          </button>
          <div className="flex items-center gap-2">
            <Icon name="add_task" className="text-summer-sky" />
            <h2 className="font-black text-deep-slate text-lg">משימה חדשה</h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Title */}
          <div>
            <label className={labelCls}>כותרת *</label>
            <input
              className={inputCls}
              placeholder="כותרת המשימה"
              value={form.title}
              onChange={patch('title')}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>תיאור</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="תיאור קצר של המשימה"
              value={form.description}
              onChange={patch('description')}
            />
          </div>

          {/* Due date + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>תאריך יעד</label>
              <input
                type="date"
                className={inputCls}
                value={form.due_date}
                onChange={patch('due_date')}
              />
            </div>
            <div>
              <label className={labelCls}>עדיפות</label>
              <select className={inputCls} value={form.priority} onChange={patch('priority')}>
                <option value="גבוהה">גבוהה</option>
                <option value="בינונית">בינונית</option>
                <option value="נמוכה">נמוכה</option>
              </select>
            </div>
          </div>

          {/* Category + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>קטגוריה</label>
              <input
                className={inputCls}
                placeholder="למשל: בטיחות, ספורט"
                value={form.category}
                onChange={patch('category')}
              />
            </div>
            <div>
              <label className={labelCls}>איש צוות</label>
              <select className={inputCls} value={form.assignee_id} onChange={patch('assignee_id')}>
                <option value="">בחר איש צוות</option>
                {staffOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
            >
              ביטול
            </button>
            <Button type="submit" className="flex-1 py-2.5 justify-center text-sm" disabled={submitting}>
              {submitting ? 'שומר...' : 'יצירת משימה'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TasksManagementPage() {
  const { user } = useAuth();
  const [taskList, setTaskList]       = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>('הכל');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);

  // ── Fetch all tasks, joining staff for assignee name ──────────────────────
  async function fetchTasks() {
    setLoadingTasks(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description, status, priority, due_date, category, assignee_id, staff!assignee_id(full_name)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error(error);
      setTaskList([]);
      setLoadingTasks(false);
      return;
    }

    setTaskList(
      data.map(t => {
        const staffRows = t.staff as unknown as { full_name: string }[] | null;
        const name      = staffRows?.[0]?.full_name ?? 'לא מוקצה';
        return {
          id:               String(t.id),
          title:            t.title ?? '',
          description:      t.description ?? '',
          status:           (t.status as Status) ?? 'לביצוע',
          priority:         (t.priority as Priority) ?? 'נמוכה',
          assignee:         name,
          assigneeInitials: getInitials(name),
          assigneeGradient: stableGradient(t.assignee_id ?? t.id),
          dueDate:          formatDate(t.due_date),
          category:         t.category ?? '',
          categoryIcon:     CATEGORY_ICONS[t.category ?? ''] ?? 'task',
        };
      })
    );
    setLoadingTasks(false);
  }

  // ── Fetch staff list for modal dropdown ───────────────────────────────────
  async function fetchStaff() {
    const { data } = await supabase.from('staff').select('id, full_name').order('full_name');
    setStaffOptions(data ?? []);
  }

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle task status — optimistic update + DB write ─────────────────────
  const toggleTask = async (id: string) => {
    const task = taskList.find(t => t.id === id);
    if (!task) return;
    const newStatus: Status = task.status === 'הושלם' ? 'לביצוע' : 'הושלם';

    setTaskList(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error(error);
      // Roll back on failure
      setTaskList(prev => prev.map(t => t.id === id ? { ...t, status: task.status } : t));
    }
  };

  const filtered = taskList.filter(t => {
    if (activeFilter === 'הכל')   return true;
    if (activeFilter === 'גבוהה') return t.priority === 'גבוהה';
    return t.status === activeFilter;
  });

  const completedCount = taskList.filter(t => t.status === 'הושלם').length;
  const completionPct  = taskList.length ? Math.round((completedCount / taskList.length) * 100) : 0;

  return (
    <>
      <div className="max-w-7xl mx-auto pb-12 space-y-6" dir="rtl">
        <PageHeader
          title="ניהול משימות וסגל"
          subtitle="עקוב אחר כל המשימות הפתוחות, הצוות המוקצה ותאריכי היעד"
          actions={
            <Button variant="primary" className="text-sm" onClick={() => setIsModalOpen(true)}>
              <Icon name="add_task" className="text-lg" />
              משימה חדשה
            </Button>
          }
        />

        {/* ── Progress Overview ── */}
        <Card className="p-6 text-right">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-4">
            <div className="flex gap-6">
              {columns.map(col => {
                const count = taskList.filter(t => t.status === col.status).length;
                return (
                  <div key={col.status} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span className="text-xs text-slate-500">{col.label}</span>
                    <span className="text-xs font-black text-deep-slate">{count}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">השלמה כוללת</p>
              <p className="text-2xl font-black text-deep-slate">{completionPct}%</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-summer-sky to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </Card>

        {/* ── Filters ── */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeFilter === f
                  ? 'bg-summer-sky text-white shadow-lg shadow-sky-200/40'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-summer-sky/40'
              }`}
            >
              {f}
              <span className={`mr-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                activeFilter === f ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {f === 'הכל'    ? taskList.length
                 : f === 'גבוהה' ? taskList.filter(t => t.priority === 'גבוהה').length
                 : taskList.filter(t => t.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Kanban Columns ── */}
        {loadingTasks ? (
          <div className="flex justify-center py-20">
            <Icon name="refresh" className="text-4xl text-slate-300 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {columns.map(col => {
              const colTasks = (activeFilter === 'הכל' || activeFilter === 'גבוהה' ? filtered : taskList)
                .filter(t => t.status === col.status)
                .filter(t => activeFilter !== 'גבוהה' || t.priority === 'גבוהה');

              return (
                <div key={col.status}>
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-3 ${col.bg}`}>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-white ${col.color}`}>
                      {colTasks.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm ${col.color}`}>{col.label}</h3>
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    </div>
                  </div>

                  {/* Task cards */}
                  <div className="space-y-3">
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        <Icon name="check_circle" className="text-3xl text-slate-200 block mx-auto mb-2" />
                        אין משימות כאן
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffOptions={staffOptions}
        onCreated={fetchTasks}
        currentUserId={user?.id ?? ''}
      />
    </>
  );
}
