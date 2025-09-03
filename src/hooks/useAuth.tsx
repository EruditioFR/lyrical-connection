
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasActiveSubscription: boolean;
  subscriptionLoading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  hasActiveSubscription: false,
  subscriptionLoading: true,
  signOut: async () => {},
  refreshSession: async () => {},
  checkSubscription: async () => {},
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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  useEffect(() => {
    console.log('=== INITIALISATION AUTH ===');
    
    // Configuration du listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session user ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Gestion de la redirection après confirmation d'email
        if (event === 'SIGNED_IN' && session?.user) {
          const userType = session.user.user_metadata?.user_type;
          const isEmailConfirmation = session.user.email_confirmed_at && !session.user.last_sign_in_at;
          
          // Si c'est une première connexion après confirmation d'email, rediriger vers pricing
          if (isEmailConfirmation || (userType && window.location.pathname === '/')) {
            setTimeout(() => {
              window.location.href = `/pricing?source=signup&type=${userType}`;
            }, 500);
          }
        }
        
        // Vérifier l'abonnement quand l'utilisateur se connecte
        if (session?.user) {
          setTimeout(() => {
            checkSubscription();
          }, 100);
        } else {
          setHasActiveSubscription(false);
          setSubscriptionLoading(false);
        }
      }
    );

    // Récupération de la session initiale
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erreur lors de la récupération de session:', error);
      } else {
        console.log('Session initiale récupérée:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Vérifier l'abonnement pour la session initiale
        if (session?.user) {
          setTimeout(() => {
            checkSubscription();
          }, 100);
        } else {
          setHasActiveSubscription(false);
          setSubscriptionLoading(false);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier l'abonnement quand l'utilisateur change
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user?.id]);

  const signOut = async () => {
    console.log('=== DÉCONNEXION ===');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setHasActiveSubscription(false);
    setSubscriptionLoading(false);
  };

  const checkSubscription = async () => {
    if (!user?.id) {
      setHasActiveSubscription(false);
      setSubscriptionLoading(false);
      return;
    }

    setSubscriptionLoading(true);
    try {
      console.log('=== VÉRIFICATION ABONNEMENT ===');
      const { data: subscriptionData, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur vérification abonnement:', error);
        setHasActiveSubscription(false);
        return;
      }

      const hasActive = !!subscriptionData;
      console.log('Abonnement actif:', hasActive);
      setHasActiveSubscription(hasActive);
    } catch (error) {
      console.error('Erreur lors de la vérification d\'abonnement:', error);
      setHasActiveSubscription(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const refreshSession = async () => {
    console.log('=== RAFRAÎCHISSEMENT SESSION ===');
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Erreur lors du rafraîchissement:', error);
        throw error;
      }
      console.log('Session rafraîchie avec succès:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Impossible de rafraîchir la session:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      hasActiveSubscription, 
      subscriptionLoading, 
      signOut, 
      refreshSession, 
      checkSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
