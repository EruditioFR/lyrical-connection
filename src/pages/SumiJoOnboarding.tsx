import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePromoCodes } from '@/hooks/usePromoCodes';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  CheckCircle2, 
  Music, 
  Eye, 
  MessageSquare, 
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';

const SumiJoOnboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { redeemCode, isRedeeming } = usePromoCodes();
  
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<{
    subscription?: { months: number; valid_until: string };
    badges?: string[];
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim()) {
      setError('Veuillez entrer votre code promo');
      return;
    }

    const response = await redeemCode(code);
    
    if (response.success) {
      setSuccess(true);
      setResult({
        subscription: response.subscription,
        badges: response.badges
      });
    } else {
      setError(response.error || 'Code invalide');
    }
  };

  const premiumFeatures = [
    { icon: Eye, text: 'Visibilité maximale auprès des professionnels' },
    { icon: Music, text: 'Profil artiste complet avec médias illimités' },
    { icon: MessageSquare, text: 'Messagerie directe avec les recruteurs' },
    { icon: Calendar, text: 'Accès aux castings exclusifs' },
  ];

  // If not authenticated, show login prompt
  if (!authLoading && !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-lg mx-auto text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-6">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Concours Sumi Jo 2026</h1>
                <p className="text-muted-foreground">
                  Connectez-vous ou créez un compte pour activer votre code promo
                </p>
              </div>
              <Button 
                onClick={() => navigate('/auth', { state: { returnTo: '/sumi-jo' } })}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                Se connecter / S'inscrire
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Success state
  if (success && result) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-lg mx-auto">
              <Card className="border-amber-200 dark:border-amber-800 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center text-white">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold">Félicitations !</h1>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto text-amber-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                      Bienvenue au Concours Sumi Jo 2026
                    </h2>
                    <p className="text-muted-foreground">
                      Votre abonnement Premium de {result.subscription?.months} mois est maintenant actif !
                    </p>
                  </div>

                  {result.badges && result.badges.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-2">Badge obtenu</p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50">
                        <span>🌟</span>
                        <span className="font-medium text-amber-700 dark:text-amber-300">
                          {result.badges[0]}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    <p>
                      Valide jusqu'au{' '}
                      {result.subscription?.valid_until && 
                        new Date(result.subscription.valid_until).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      }
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                      Accéder à mon tableau de bord
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/profile')}
                      className="w-full"
                    >
                      Compléter mon profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Main form
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-amber-950">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-6 shadow-lg shadow-amber-500/30">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Concours International Sumi Jo 2026
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Activez votre accès Premium offert et rejoignez les candidats du concours
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Form Card */}
              <Card className="border-amber-200 dark:border-amber-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Activez votre code
                  </CardTitle>
                  <CardDescription>
                    Entrez le code promo reçu par email pour activer votre abonnement Premium gratuit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Code promo</Label>
                      <Input
                        id="code"
                        type="text"
                        placeholder="Ex: SUMIJO2026"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="text-center text-lg font-mono tracking-wider uppercase"
                        disabled={isRedeeming}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      disabled={isRedeeming}
                    >
                      {isRedeeming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Activation en cours...
                        </>
                      ) : (
                        <>
                          Activer mon accès Premium
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Benefits Card */}
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    6 mois Premium offerts
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    Profitez de tous les avantages Premium
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {premiumFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm mt-1.5">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2 py-1 rounded-full bg-white/20 text-xs">
                        🌟 Badge exclusif
                      </span>
                      <span className="text-white/80">Candidat Sumi Jo 2026</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SumiJoOnboarding;
