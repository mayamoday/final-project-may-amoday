import { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CamperSignUpData {
  parentName?: string;
  birthDate?: string;
  shirtSize?: string;
  parentPhone?: string;
  parentEmail?: string;
  criticalMedical?: string;
  dietaryReq?: string;
  medications?: string;
  profilePicFile?: File | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: 'staff' | 'camper' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'staff' | 'camper',
    camperData?: CamperSignUpData,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'staff' | 'camper' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Derive role whenever user changes
  useEffect(() => {
    if (!user) {
      setUserRole(null);
      return;
    }

    // user_metadata.role is set during signUp — use it as the fast path
    const meta = user.user_metadata?.role as string | undefined;
    if (meta === 'staff' || meta === 'camper') {
      setUserRole(meta);
      return;
    }

    // Fallback: check the staff table (handles accounts created before metadata was added)
    supabase
      .from('staff')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setUserRole(data ? 'staff' : 'camper'));
  }, [user]);

  // ── Sign In ──
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'האימייל או הסיסמה שגויים. נסה שוב.' };
    return { error: null };
  };

  // ── Sign Up ──
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'staff' | 'camper',
    camperData?: CamperSignUpData,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (error) return { error: error.message };

    if (data.user) {
      if (role === 'staff') {
        const { error: staffError } = await supabase.from('staff').insert({
          id: data.user.id,
          full_name: fullName,
          email,
        });
        if (staffError) {
          console.error('[signUp] staff insert failed:', staffError);
          return { error: `שגיאה בשמירת פרטי הסגל: ${staffError.message}` };
        }
      } else {
        // Upload profile picture before inserting row
        let profileImageUrl: string | null = null;
        if (camperData?.profilePicFile) {
          const file = camperData.profilePicFile;
          const ext = file.name.split('.').pop() ?? 'jpg';
          const safeFileName = `${data.user.id}_${Date.now()}.${ext}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('camper_profiles')
            .upload(safeFileName, file);
          if (uploadError) {
            console.error('[signUp] profile picture upload failed:', uploadError);
          } else if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('camper_profiles')
              .getPublicUrl(uploadData.path);
            profileImageUrl = publicUrl;
          }
        }

        console.log('[signUp] attempting campers insert for user:', data.user.id);
        const { error: camperError } = await supabase.from('camper').insert({
          id: data.user.id,
          full_name: fullName,
          parent_name: camperData?.parentName ?? null,
          birth_date: camperData?.birthDate ?? null,
          shirt_size: camperData?.shirtSize ?? null,
          parent_phone: camperData?.parentPhone ?? null,
          parent_email: camperData?.parentEmail ?? null,
          critical_medical_info: camperData?.criticalMedical ?? null,
          dietary_requirements: camperData?.dietaryReq ?? null,
          medications: camperData?.medications ?? null,
          profile_image_url: profileImageUrl,
        });
        if (camperError) {
          console.error('[signUp] campers insert failed:', camperError);
          return { error: `שגיאה בשמירת פרטי החניך: ${camperError.message}` };
        }
        console.log('[signUp] campers insert succeeded');
      }
    }

    return { error: null };
  };

  // ── Sign Out ──
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be called inside <AuthProvider>');
  return ctx;
}
