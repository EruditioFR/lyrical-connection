
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';

interface EventRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    participation_rules?: string;
    code_of_conduct?: string;
    cancellation_policy?: string;
    liability_waiver?: string;
  };
}

const EventRulesModal: React.FC<EventRulesModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  const hasRules = event.participation_rules || event.code_of_conduct || 
                   event.cancellation_policy || event.liability_waiver;

  if (!hasRules) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Règlement - {event.title}
          </DialogTitle>
          <DialogDescription>
            Veuillez lire attentivement les conditions et règles de participation
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {event.participation_rules && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Conditions de participation</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {event.participation_rules}
                </p>
              </div>
            )}

            {event.code_of_conduct && (
              <>
                {event.participation_rules && <Separator />}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Code de conduite</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.code_of_conduct}
                  </p>
                </div>
              </>
            )}

            {event.cancellation_policy && (
              <>
                {(event.participation_rules || event.code_of_conduct) && <Separator />}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Politique d'annulation</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.cancellation_policy}
                  </p>
                </div>
              </>
            )}

            {event.liability_waiver && (
              <>
                {(event.participation_rules || event.code_of_conduct || event.cancellation_policy) && <Separator />}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Décharge de responsabilité</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.liability_waiver}
                  </p>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EventRulesModal;
