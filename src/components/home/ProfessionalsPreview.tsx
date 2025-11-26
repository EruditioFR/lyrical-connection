import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, ArrowRight, MapPin, User, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardProfessional } from '@/hooks/useDashboardData';

interface ProfessionalsPreviewProps {
  professionals: DashboardProfessional[];
  isLoading: boolean;
}

const ProfessionalsPreview: React.FC<ProfessionalsPreviewProps> = ({ professionals, isLoading }) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfessionalClick = (professionalId: string) => {
    navigate(`/professionnels/${professionalId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Les professionnels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Les professionnels
          </CardTitle>
          <Link to="/professionnels">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {professionals.length === 0 ? (
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun professionnel disponible pour le moment
            </p>
            <Link to="/professionnels">
              <Button variant="outline" size="sm">
                Explorer les professionnels
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {professionals.map((professional) => (
              <div 
                key={professional.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleProfessionalClick(professional.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={professional.profile_image_url || ''} />
                  <AvatarFallback>
                    {getInitials(professional.company_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate mb-1">
                    {professional.company_name}
                  </p>
                  
                  <p className="text-xs text-white font-medium mb-1">
                    {professional.professional_role}
                  </p>
                  
                  {professional.location && (
                    <div className="flex items-center text-xs text-white">
                      <MapPin className="h-3 w-3 mr-1" />
                      {professional.location}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfessionalClick(professional.id);
                  }}
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <Link to="/professionnels" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Explorer tous les professionnels
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalsPreview;