import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useContestSynthesis } from '@/hooks/useContestEvaluations';
import { Trophy, Users, Filter, ArrowUpDown, ExternalLink, XCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Country flags mapping (basic)
const getCountryFlag = (nationality: string | null): string => {
  if (!nationality) return '🌍';
  const flags: Record<string, string> = {
    'France': '🇫🇷',
    'Italie': '🇮🇹',
    'Allemagne': '🇩🇪',
    'Espagne': '🇪🇸',
    'États-Unis': '🇺🇸',
    'Royaume-Uni': '🇬🇧',
    'Japon': '🇯🇵',
    'Corée du Sud': '🇰🇷',
    'Chine': '🇨🇳',
    'Russie': '🇷🇺',
    'Brésil': '🇧🇷',
    'Argentine': '🇦🇷',
    'Canada': '🇨🇦',
    'Australie': '🇦🇺',
    'Belgique': '🇧🇪',
    'Suisse': '🇨🇭',
    'Autriche': '🇦🇹',
    'Pays-Bas': '🇳🇱',
    'Portugal': '🇵🇹',
    'Pologne': '🇵🇱',
  };
  return flags[nationality] || '🌍';
};

const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
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

  // Fetch contest info
  const { data: contest, isLoading: contestLoading } = useQuery({
    queryKey: ['contest-detail', contestId],
    queryFn: async () => {
      if (!contestId) return null;
      const { data, error } = await supabase
        .from('castings')
        .select('*')
        .eq('id', contestId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!contestId
  });

  const { synthesis, isLoading: synthesisLoading } = useContestSynthesis(contestId);

  // Extract unique nationalities and voice types for filters
  const { nationalities, voiceTypes } = useMemo(() => {
    const nats = new Set<string>();
    const voices = new Set<string>();
    
    synthesis.forEach(item => {
      if (item.artist?.nationality) nats.add(item.artist.nationality);
      if (item.artist?.voice_type) voices.add(item.artist.voice_type);
    });

    return {
      nationalities: Array.from(nats).sort(),
      voiceTypes: Array.from(voices).sort()
    };
  }, [synthesis]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...synthesis];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.artist?.stage_name?.toLowerCase().includes(term)
      );
    }

    // Nationality filter
    if (nationalityFilter !== 'all') {
      result = result.filter(item => item.artist?.nationality === nationalityFilter);
    }

    // Voice type filter
    if (voiceTypeFilter !== 'all') {
      result = result.filter(item => item.artist?.voice_type === voiceTypeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortKey) {
        case 'name':
          comparison = (a.artist?.stage_name || '').localeCompare(b.artist?.stage_name || '');
          break;
        case 'average':
          comparison = (a.averageScores.overall || 0) - (b.averageScores.overall || 0);
          break;
        case 'age':
          const ageA = calculateAge(a.artist?.birth_date) || 0;
          const ageB = calculateAge(b.artist?.birth_date) || 0;
          comparison = ageA - ageB;
          break;
        case 'nationality':
          comparison = (a.artist?.nationality || '').localeCompare(b.artist?.nationality || '');
          break;
        case 'voice_type':
          comparison = (a.artist?.voice_type || '').localeCompare(b.artist?.voice_type || '');
          break;
      }

      return sortDir === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [synthesis, searchTerm, nationalityFilter, voiceTypeFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
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
          <Button asChild>
            <Link to="/castings">Retour aux castings</Link>
          </Button>
        </div>
      </Layout>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <p className="text-2xl font-bold">
                    {synthesis.filter(s => s.averageScores.overall >= 8).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Excellents (≥8/10)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">
                    {synthesis.filter(s => s.isRejected).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Non sélectionnés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
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
                <SelectTrigger>
                  <SelectValue placeholder="Nationalité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les nationalités</SelectItem>
                  {nationalities.map(nat => (
                    <SelectItem key={nat} value={nat}>
                      {getCountryFlag(nat)} {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={voiceTypeFilter} onValueChange={setVoiceTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tessiture" />
                </SelectTrigger>
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

        {/* Results Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 -ml-4"
                      >
                        Candidat
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('age')}
                        className="flex items-center gap-1 -ml-4"
                      >
                        Âge
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('nationality')}
                        className="flex items-center gap-1 -ml-4"
                      >
                        Nationalité
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Langues</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('voice_type')}
                        className="flex items-center gap-1 -ml-4"
                      >
                        Tessiture
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center">Voix</TableHead>
                    <TableHead className="text-center">Tech.</TableHead>
                    <TableHead className="text-center">Scène</TableHead>
                    <TableHead className="text-center">Langues</TableHead>
                    <TableHead className="text-center">Just.</TableHead>
                    <TableHead className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSort('average')}
                        className="flex items-center gap-1"
                      >
                        Moyenne
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Jurys</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={13} className="text-center py-8 text-muted-foreground">
                        Aucun candidat évalué
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, index) => {
                      const age = calculateAge(item.artist?.birth_date);
                      
                      return (
                        <TableRow 
                          key={item.artist?.id} 
                          className={cn(
                            item.isRejected && "bg-destructive/5 opacity-60"
                          )}
                        >
                          <TableCell className="font-medium text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <Link 
                              to={`/artiste/${item.artist?.id}`}
                              className="flex items-center gap-3 hover:underline"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={item.artist?.profile_image_url || ''} />
                                <AvatarFallback>
                                  {item.artist?.stage_name?.charAt(0) || '?'}
                                </AvatarFallback>
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
                            {item.artist?.spoken_languages?.join(', ') || '-'}
                          </TableCell>
                          <TableCell>
                            {item.artist?.voice_type && (
                              <Badge variant="secondary">{item.artist.voice_type}</Badge>
                            )}
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
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejeté
                              </Badge>
                            ) : (
                              <span className={cn(
                                "text-lg font-bold",
                                getScoreClass(item.averageScores.overall)
                              )}>
                                {item.averageScores.overall > 0 
                                  ? item.averageScores.overall.toFixed(1)
                                  : '-'
                                }
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.juryCount}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContestSynthesis;
