import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gavel } from 'lucide-react';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { useMyJuries } from '@/hooks/useCastingJury';

/** Castings où le professionnel est invité comme juré (masqué s'il n'y en a aucun) */
const MyJuriesCard = () => {
  const { profile } = useProfessionalProfile();
  const juries = useMyJuries(profile?.id);
  if (juries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl"><Gavel className="h-5 w-5" /> Mes jurys</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {juries.map(j => (
            <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span>
                {j.castings!.title}
                {j.castings!.audition_date && (
                  <span className="text-muted-foreground"> · auditions le {new Date(j.castings!.audition_date).toLocaleDateString('fr-FR')}</span>
                )}
              </span>
              <Button asChild size="sm">
                <Link to={`/professional/castings/${j.castings!.id}/seance`}>Noter les candidats</Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default MyJuriesCard;
