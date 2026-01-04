import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useContestSynthesis } from '@/hooks/useContestEvaluations';
import { useContestShortlist } from '@/hooks/useContestShortlist';
import { Trophy, Users, Filter, ArrowUpDown, ExternalLink, XCircle, Search, Sparkles, Printer, Mail, AlertTriangle, Check, Crown, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Country flags mapping
const getCountryFlag = (nationality: string | null): string => {
  if (!nationality) return '🌍';
  const flags: Record<string, string> = {
    'France': '🇫🇷', 'Italie': '🇮🇹', 'Allemagne': '🇩🇪', 'Espagne': '🇪🇸',
    'États-Unis': '🇺🇸', 'Royaume-Uni': '🇬🇧', 'Japon': '🇯🇵', 'Corée du Sud': '🇰🇷',
    'Chine': '🇨🇳', 'Russie': '🇷🇺', 'Brésil': '🇧🇷', 'Argentine': '🇦🇷',
    'Canada': '🇨🇦', 'Australie': '🇦🇺', 'Belgique': '🇧🇪', 'Suisse': '🇨🇭',
    'Autriche': '🇦🇹', 'Pays-Bas': '🇳🇱', 'Portugal': '🇵🇹', 'Pologne': '🇵🇱',
  };
  return flags[nationality] || '🌍';
};

const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getScoreClass = (score: number): string => {
  if (score >= 8) return 'text-green-600 font-bold';
  if (score >= 6) return 'text-foreground';
  if (score >= 4) return 'text-yellow-600';
  return 'text-red-500';
};

type SortKey = 'name' | 'average' | 'age' | 'nationality' | 'voice_type';
type SortDir = 'asc' | 'desc';

const ContestSynthesis = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [nationalityFilter, setNationalityFilter] = useState<string>('all');
  const [voiceTypeFilter, setVoiceTypeFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('average');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [activeTab, setActiveTab] = useState('synthesis');
  const [showTieAlert, setShowTieAlert] = useState(false);
  const [tieInfo, setTieInfo] = useState<{ candidates: any[]; cutoffScore: number } | null>(null);
  const [showEmailConfirm, setShowEmailConfirm] = useState<'shortlisted' | 'rejected' | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest-detail', contestId],
    queryFn: async () => {
      if (!contestId) return null;
      const { data, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('id', contestId)
        .eq('event_type', 'concours')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!contestId
  });

  const { synthesis, isLoading: synthesisLoading } = useContestSynthesis(contestId);
  const { analyzeTop24, updateStatuses, sendEmails, toggleShortlistStatus } = useContestShortlist(contestId);

  // Get shortlisted and rejected from database status
  const { shortlisted, rejected, pending } = useMemo(() => {
    const shortlisted: typeof synthesis = [];
    const rejected: typeof synthesis = [];
    const pending: typeof synthesis = [];
    
    synthesis.forEach(item => {
      // Check contest_status from evaluations (we need to fetch this)
      // For now, use isRejected flag and we'll add status later
      if (item.isRejected) {
        rejected.push(item);
      } else {
        pending.push(item);
      }
    });
    
    return { shortlisted, rejected, pending };
  }, [synthesis]);

  // Extract unique nationalities and voice types
  const { nationalities, voiceTypes } = useMemo(() => {
    const nats = new Set<string>();
    const voices = new Set<string>();
    synthesis.forEach(item => {
      if (item.artist?.nationality) nats.add(item.artist.nationality);
      if (item.artist?.voice_type) voices.add(item.artist.voice_type);
    });
    return { nationalities: Array.from(nats).sort(), voiceTypes: Array.from(voices).sort() };
  }, [synthesis]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...synthesis];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => item.artist?.stage_name?.toLowerCase().includes(term));
    }
    if (nationalityFilter !== 'all') {
      result = result.filter(item => item.artist?.nationality === nationalityFilter);
    }
    if (voiceTypeFilter !== 'all') {
      result = result.filter(item => item.artist?.voice_type === voiceTypeFilter);
    }
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case 'name': comparison = (a.artist?.stage_name || '').localeCompare(b.artist?.stage_name || ''); break;
        case 'average': comparison = (a.averageScores.overall || 0) - (b.averageScores.overall || 0); break;
        case 'age': comparison = (calculateAge(a.artist?.birth_date) || 0) - (calculateAge(b.artist?.birth_date) || 0); break;
        case 'nationality': comparison = (a.artist?.nationality || '').localeCompare(b.artist?.nationality || ''); break;
        case 'voice_type': comparison = (a.artist?.voice_type || '').localeCompare(b.artist?.voice_type || ''); break;
      }
      return sortDir === 'desc' ? -comparison : comparison;
    });
    return result;
  }, [synthesis, searchTerm, nationalityFilter, voiceTypeFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  // Generate Top 24 shortlist
  const handleGenerateTop24 = () => {
    const { top24, rejected, tieBreak } = analyzeTop24(synthesis as any);
    
    if (tieBreak.hasTie) {
      setTieInfo({
        candidates: tieBreak.tiedCandidates,
        cutoffScore: tieBreak.cutoffScore
      });
      setShowTieAlert(true);
      return;
    }

    const shortlistedIds = top24.map(c => c.artist?.id).filter(Boolean) as string[];
    const rejectedIds = rejected.map(c => c.artist?.id).filter(Boolean) as string[];
    
    updateStatuses.mutate({ shortlistedIds, rejectedIds }, {
      onSuccess: () => setActiveTab('shortlist')
    });
  };

  // Handle email sending
  const handleSendEmails = (type: 'shortlisted' | 'rejected') => {
    const candidates = type === 'shortlisted' 
      ? filteredData.filter(c => !c.isRejected).slice(0, 24)
      : filteredData.filter(c => c.isRejected || filteredData.indexOf(c) >= 24);
    
    const artistIds = candidates.map(c => c.artist?.id).filter(Boolean) as string[];
    
    sendEmails.mutate({
      contestName: contest?.title || 'Concours',
      recipientType: type,
      artistIds
    });
    setShowEmailConfirm(null);
  };

  // Print function
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Top 24 Demi-Finalistes - ${contest?.title}</title>
        <style>
          body { font-family: Georgia, serif; padding: 40px; color: #333; }
          h1 { text-align: center; font-size: 24px; margin-bottom: 10px; }
          h2 { text-align: center; font-size: 16px; color: #666; margin-bottom: 40px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: bold; }
          .rank { width: 40px; text-align: center; }
          .score { font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <h1>🏆 LES 24 DEMI-FINALISTES</h1>
        <h2>${contest?.title || 'Sumi Jo International Singing Competition 2026'}</h2>
        ${printContent.innerHTML}
        <div class="footer">
          <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} - Lyrisphere</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const isLoading = contestLoading || synthesisLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </Layout>
    );
  }

  if (!contest) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Concours non trouvé</h1>
          <Button asChild><Link to="/castings">Retour</Link></Button>
        </div>
      </Layout>
    );
  }

  // Get top 24 for shortlist view
  const top24Candidates = [...synthesis]
    .filter(s => !s.isRejected && s.averageScores.overall > 0)
    .sort((a, b) => b.averageScores.overall - a.averageScores.overall)
    .slice(0, 24);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Synthèse du Concours</h1>
          </div>
          <h2 className="text-xl text-muted-foreground">{contest.title}</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{synthesis.length}</p>
                  <p className="text-sm text-muted-foreground">Candidats évalués</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{synthesis.filter(s => s.averageScores.overall >= 8).length}</p>
                  <p className="text-sm text-muted-foreground">Excellents (≥8/10)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Crown className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{Math.min(24, synthesis.filter(s => !s.isRejected).length)}</p>
                  <p className="text-sm text-muted-foreground">Places Top 24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{synthesis.filter(s => s.isRejected).length}</p>
                  <p className="text-sm text-muted-foreground">Non sélectionnés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="synthesis" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Synthèse complète
            </TabsTrigger>
            <TabsTrigger value="shortlist" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Les 24 Demi-Finalistes
            </TabsTrigger>
          </TabsList>

          {/* Synthesis Tab */}
          <TabsContent value="synthesis" className="space-y-6">
            {/* Generate Shortlist Button */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Génération automatique du Top 24
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sélectionne automatiquement les 24 candidats avec les meilleures moyennes.
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateTop24}
                    disabled={updateStatuses.isPending || synthesis.length < 24}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Générer la Shortlist Top 24
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
                    <SelectTrigger><SelectValue placeholder="Nationalité" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les nationalités</SelectItem>
                      {nationalities.map(nat => (
                        <SelectItem key={nat} value={nat}>{getCountryFlag(nat)} {nat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={voiceTypeFilter} onValueChange={setVoiceTypeFilter}>
                    <SelectTrigger><SelectValue placeholder="Tessiture" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les tessitures</SelectItem>
                      {voiceTypes.map(vt => (
                        <SelectItem key={vt} value={vt}>{vt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Full Results Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort('name')} className="flex items-center gap-1 -ml-4">
                            Candidat <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort('age')} className="flex items-center gap-1 -ml-4">
                            Âge <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort('nationality')} className="flex items-center gap-1 -ml-4">
                            Nationalité <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" size="sm" onClick={() => handleSort('voice_type')} className="flex items-center gap-1 -ml-4">
                            Tessiture <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-center">Voix</TableHead>
                        <TableHead className="text-center">Tech.</TableHead>
                        <TableHead className="text-center">Scène</TableHead>
                        <TableHead className="text-center">Lang.</TableHead>
                        <TableHead className="text-center">Just.</TableHead>
                        <TableHead className="text-center">
                          <Button variant="ghost" size="sm" onClick={() => handleSort('average')} className="flex items-center gap-1">
                            Moyenne <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Jurys</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                            Aucun candidat évalué
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredData.map((item, index) => {
                          const age = calculateAge(item.artist?.birth_date);
                          const isTop24 = index < 24 && !item.isRejected;
                          
                          return (
                            <TableRow 
                              key={item.artist?.id} 
                              className={cn(
                                item.isRejected && "bg-destructive/5 opacity-60",
                                isTop24 && "bg-amber-50 dark:bg-amber-950/20"
                              )}
                            >
                              <TableCell className="font-medium text-muted-foreground">
                                {isTop24 && <Crown className="w-3 h-3 text-amber-500 inline mr-1" />}
                                {index + 1}
                              </TableCell>
                              <TableCell>
                                <Link to={`/artiste/${item.artist?.id}`} className="flex items-center gap-3 hover:underline">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={item.artist?.profile_image_url || ''} />
                                    <AvatarFallback>{item.artist?.stage_name?.charAt(0) || '?'}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{item.artist?.stage_name}</span>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                </Link>
                              </TableCell>
                              <TableCell>{age ? `${age} ans` : '-'}</TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1">
                                  {getCountryFlag(item.artist?.nationality)}
                                  {item.artist?.nationality || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {item.artist?.voice_type && <Badge variant="secondary">{item.artist.voice_type}</Badge>}
                              </TableCell>
                              <TableCell className={cn("text-center", getScoreClass(item.averageScores.vocal_quality))}>
                                {item.averageScores.vocal_quality > 0 ? item.averageScores.vocal_quality.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell className={cn("text-center", getScoreClass(item.averageScores.vocal_technique))}>
                                {item.averageScores.vocal_technique > 0 ? item.averageScores.vocal_technique.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell className={cn("text-center", getScoreClass(item.averageScores.stage_presence))}>
                                {item.averageScores.stage_presence > 0 ? item.averageScores.stage_presence.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell className={cn("text-center", getScoreClass(item.averageScores.language_mastery))}>
                                {item.averageScores.language_mastery > 0 ? item.averageScores.language_mastery.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell className={cn("text-center", getScoreClass(item.averageScores.pitch_accuracy))}>
                                {item.averageScores.pitch_accuracy > 0 ? item.averageScores.pitch_accuracy.toFixed(1) : '-'}
                              </TableCell>
                              <TableCell className="text-center">
                                {item.isRejected ? (
                                  <Badge variant="destructive" className="text-xs">
                                    <XCircle className="w-3 h-3 mr-1" /> Rejeté
                                  </Badge>
                                ) : (
                                  <span className={cn("text-lg font-bold", getScoreClass(item.averageScores.overall))}>
                                    {item.averageScores.overall > 0 ? item.averageScores.overall.toFixed(1) : '-'}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{item.juryCount}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortlist Tab */}
          <TabsContent value="shortlist" className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  Les 24 Demi-Finalistes
                </CardTitle>
                <CardDescription>
                  Liste officielle des candidats sélectionnés pour les demi-finales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimer la liste
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => setShowEmailConfirm('shortlisted')}
                    disabled={sendEmails.isPending}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Mail className="w-4 h-4" />
                    Envoyer les félicitations
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEmailConfirm('rejected')}
                    disabled={sendEmails.isPending}
                    className="flex items-center gap-2"
                  >
                    <UserMinus className="w-4 h-4" />
                    Envoyer les emails de refus
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Shortlist Table (for printing) */}
            <div ref={printRef}>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-50 dark:bg-amber-950/30">
                        <TableHead className="w-[60px] text-center">#</TableHead>
                        <TableHead>Candidat</TableHead>
                        <TableHead>Âge</TableHead>
                        <TableHead>Nationalité</TableHead>
                        <TableHead>Tessiture</TableHead>
                        <TableHead className="text-center">Moyenne</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {top24Candidates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Crown className="w-8 h-8 text-muted-foreground/50" />
                              <p>Aucun demi-finaliste sélectionné</p>
                              <p className="text-sm">Utilisez le bouton "Générer la Shortlist Top 24" dans l'onglet Synthèse</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        top24Candidates.map((item, index) => {
                          const age = calculateAge(item.artist?.birth_date);
                          return (
                            <TableRow key={item.artist?.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/10">
                              <TableCell className="text-center font-bold text-amber-600">{index + 1}</TableCell>
                              <TableCell>
                                <Link to={`/artiste/${item.artist?.id}`} className="flex items-center gap-3 hover:underline">
                                  <Avatar className="w-10 h-10 border-2 border-amber-200">
                                    <AvatarImage src={item.artist?.profile_image_url || ''} />
                                    <AvatarFallback className="bg-amber-100 text-amber-800">
                                      {item.artist?.stage_name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-semibold">{item.artist?.stage_name}</span>
                                </Link>
                              </TableCell>
                              <TableCell>{age ? `${age} ans` : '-'}</TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1">
                                  {getCountryFlag(item.artist?.nationality)}
                                  {item.artist?.nationality || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                {item.artist?.voice_type && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                    {item.artist.voice_type}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-xl font-bold text-green-600">
                                  {item.averageScores.overall.toFixed(1)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tie Alert Dialog */}
        <AlertDialog open={showTieAlert} onOpenChange={setShowTieAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Égalité détectée
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    Plusieurs candidats ont la même moyenne ({tieInfo?.cutoffScore.toFixed(1)}/10) à la limite de la 24ème place.
                    Veuillez départager manuellement les candidats suivants :
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {tieInfo?.candidates.map(c => (
                      <li key={c.artist?.id}>
                        <strong>{c.artist?.stage_name}</strong> - {c.averageScores.overall.toFixed(1)}/10
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Compris</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Email Confirmation Dialog */}
        <AlertDialog open={!!showEmailConfirm} onOpenChange={() => setShowEmailConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Confirmer l'envoi des emails
              </AlertDialogTitle>
              <AlertDialogDescription>
                {showEmailConfirm === 'shortlisted' ? (
                  <>Vous êtes sur le point d'envoyer un email de félicitations aux 24 demi-finalistes sélectionnés.</>
                ) : (
                  <>Vous êtes sur le point d'envoyer un email aux candidats non retenus.</>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => showEmailConfirm && handleSendEmails(showEmailConfirm)}
                className={showEmailConfirm === 'shortlisted' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Check className="w-4 h-4 mr-2" />
                Confirmer l'envoi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ContestSynthesis;
