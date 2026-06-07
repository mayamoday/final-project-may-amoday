import { supabase } from './supabase';

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

export async function updateProfile(updates: Record<string, unknown>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);
  return { error: error?.message ?? null };
}

// ─── Feed / Posts ─────────────────────────────────────────────────────────────

export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(full_name, role)')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function createPost(content: string, imageUrl?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase
    .from('posts')
    .insert([{ content, image_url: imageUrl ?? null, user_id: user.id }])
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Campers ──────────────────────────────────────────────────────────────────

export async function getCampers() {
  const { data, error } = await supabase
    .from('camper')
    .select('*')
    .order('full_name', { ascending: true });
  return { data, error: error?.message ?? null };
}

export async function getCamper(id: string) {
  const { data, error } = await supabase
    .from('camper')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateCamper(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('camper').update(updates).eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenses() {
  const { data, error } = await supabase
    .from('expenses')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function createExpense(expense: {
  amount: number;
  category: string;
  description: string;
  receipt_url?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase
    .from('expenses')
    .insert([{ ...expense, user_id: user.id }])
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function createTask(task: {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  assignee_id?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: user.id, status: 'todo' }])
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateTask(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  return { error: error?.message ?? null };
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Incidents ────────────────────────────────────────────────────────────────

export async function getIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*, profiles(full_name), campers(full_name)')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function createIncident(incident: {
  type: string;
  severity: string;
  description: string;
  location?: string;
  camper_id?: string;
  witnesses?: string;
  follow_up_required?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase
    .from('incidents')
    .insert([{ ...incident, reporter_id: user.id }])
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function updateIncident(id: string, updates: Record<string, unknown>) {
  const { error } = await supabase.from('incidents').update(updates).eq('id', id);
  return { error: error?.message ?? null };
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export async function getDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });
  return { data, error: error?.message ?? null };
}

export async function createDocument(doc: {
  title: string;
  category: string;
  description?: string;
  file_url?: string;
  is_pinned?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };
  const { data, error } = await supabase
    .from('documents')
    .insert([{ ...doc, user_id: user.id }])
    .select()
    .single();
  return { data, error: error?.message ?? null };
}

export async function deleteDocument(id: string) {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  return { error: error?.message ?? null };
}
