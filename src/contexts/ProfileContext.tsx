import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ProfileContextType {
  fullName: string;
  avatarUrl: string | null;
  loading: boolean;
  /** Re-fetches the profile from the database (staff or camper, depending on role). */
  refreshProfile: () => Promise<void>;
  /** Optimistic local patch — lets pages like SettingsPage push a just-saved
   *  value (e.g. a freshly uploaded avatar) into the shared context instantly,
   *  without waiting on a refetch round-trip. */
  setProfile: (updates: { fullName?: string; avatarUrl?: string | null }) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, userRole } = useAuth();
  const [fullName, setFullName]   = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user || !userRole) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const table        = userRole === 'staff' ? 'staff' : 'camper';
    const avatarColumn = userRole === 'staff' ? 'avatar_url' : 'profile_image_url';

    const { data, error } = await supabase
      .from(table)
      .select(`full_name, ${avatarColumn}`)
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('[ProfileContext] fetch profile failed:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setFullName((data as Record<string, unknown>).full_name as string ?? '');
      setAvatarUrl(((data as Record<string, unknown>)[avatarColumn] as string | null) ?? null);
    }
    setLoading(false);
  // Depend on the stable id/role, not the `user` object reference — AuthContext
  // hands back a new object on every token-refresh event even when unchanged.
  }, [user?.id, userRole]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const setProfile = (updates: { fullName?: string; avatarUrl?: string | null }) => {
    if (updates.fullName !== undefined) setFullName(updates.fullName);
    if (updates.avatarUrl !== undefined) setAvatarUrl(updates.avatarUrl);
  };

  return (
    <ProfileContext.Provider value={{ fullName, avatarUrl, loading, refreshProfile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
