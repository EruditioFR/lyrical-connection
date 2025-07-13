
import React from 'react';
import { Building, MapPin, Mail, Phone, Globe } from 'lucide-react';

interface EventOrganizerProps {
  professionalProfile: any;
}

const EventOrganizer: React.FC<EventOrganizerProps> = ({ professionalProfile }) => {
  if (!professionalProfile) return null;

  return (
    <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h2 className="text-2xl font-serif font-semibold mb-4 flex items-center gap-2">
        <Building className="h-5 w-5" />
        Organisateur
      </h2>
      <div className="space-y-3">
        <h3 className="text-lg font-medium">
          {professionalProfile.company_name}
        </h3>
        {professionalProfile.bio && (
          <p className="text-muted-foreground">
            {professionalProfile.bio}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {professionalProfile.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {professionalProfile.location}
            </div>
          )}
          {professionalProfile.contact_email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {professionalProfile.contact_email}
            </div>
          )}
          {professionalProfile.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {professionalProfile.phone}
            </div>
          )}
          {professionalProfile.website && (
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <a 
                href={professionalProfile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Site web
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EventOrganizer;
