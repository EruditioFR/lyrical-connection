
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    console.log('=== RAFRAÎCHISSEMENT DE SESSION ===');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Erreur lors du rafraîchissement:', error);
        // Forcer une déconnexion si le rafraîchissement échoue
        await supabase.auth.signOut();
      } else {
        console.log('Session rafraîchie avec succès:', data.session?.user?.id);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }
    } catch (error) {
      console.error('Erreur de rafraîchissement:', error);
      await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    console.log('=== INITIALISATION AUTH ===');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session user ID:', session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token rafraîchi automatiquement');
        }

        if (session) {
          // Vérifier que la session est valide en testant une requête
          try {
            const { data: testData, error: testError } = await supabase.auth.getUser();
            if (testError) {
              console.error('Session invalide, reconnexion nécessaire:', testError);
              await supabase.auth.signOut();
              return;
            }
            console.log('Session validée pour user:', testData.user?.id);
          } catch (error) {
            console.error('Erreur de validation de session:', error);
            await supabase.auth.signOut();
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session and validate it
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Erreur lors de la récupération de session:', error);
        setLoading(false);
        return;
      }

      if (session) {
        // Test the session validity
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('Session initiale invalide:', userError);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          } else {
            console.log('Session initiale valide pour user:', userData.user?.id);
            setSession(session);
            setUser(session.user);
          }
        } catch (error) {
          console.error('Erreur de validation de session initiale:', error);
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('=== DÉCONNEXION ===');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};
