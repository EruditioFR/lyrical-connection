import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export interface MessageFilters {
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachments?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  sender?: string;
  sortBy: 'date' | 'sender' | 'subject';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  filters: MessageFilters;
  onFiltersChange: (filters: MessageFilters) => void;
  onClose: () => void;
  senders: string[];
}

export const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onClose,
  senders 
}: AdvancedFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<MessageFilters>(filters);

  const updateFilter = (key: keyof MessageFilters, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const resetFilters = () => {
    const resetFilters: MessageFilters = {
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <Card className="w-80">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Filtres avancés</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* État du message */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">État du message</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="read"
              checked={localFilters.isRead === true}
              onCheckedChange={(checked) => 
                updateFilter('isRead', checked ? true : undefined)
              }
            />
            <Label htmlFor="read" className="text-sm">Messages lus uniquement</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="unread"
              checked={localFilters.isRead === false}
              onCheckedChange={(checked) => 
                updateFilter('isRead', checked ? false : undefined)
              }
            />
            <Label htmlFor="unread" className="text-sm">Messages non lus uniquement</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="starred"
              checked={localFilters.isStarred === true}
              onCheckedChange={(checked) => 
                updateFilter('isStarred', checked ? true : undefined)
              }
            />
            <Label htmlFor="starred" className="text-sm">Messages étoilés</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachments"
              checked={localFilters.hasAttachments === true}
              onCheckedChange={(checked) => 
                updateFilter('hasAttachments', checked ? true : undefined)
              }
            />
            <Label htmlFor="attachments" className="text-sm">Avec pièces jointes</Label>
          </div>
        </div>

        {/* Période */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Période</Label>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateRange?.from ? (
                  localFilters.dateRange.to ? (
                    <>
                      {format(localFilters.dateRange.from, "dd MMM yyyy", { locale: fr })} -{" "}
                      {format(localFilters.dateRange.to, "dd MMM yyyy", { locale: fr })}
                    </>
                  ) : (
                    format(localFilters.dateRange.from, "dd MMM yyyy", { locale: fr })
                  )
                ) : (
                  "Sélectionner une période"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={localFilters.dateRange?.from}
                selected={localFilters.dateRange}
                onSelect={(range) => updateFilter('dateRange', range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expéditeur */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Expéditeur</Label>
          <Select 
            value={localFilters.sender || ""} 
            onValueChange={(value) => updateFilter('sender', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les expéditeurs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les expéditeurs</SelectItem>
              {senders.map((sender) => (
                <SelectItem key={sender} value={sender}>{sender}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tri */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tri</Label>
          
          <Select 
            value={localFilters.sortBy} 
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="sender">Expéditeur</SelectItem>
              <SelectItem value="subject">Objet</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={localFilters.sortOrder} 
            onValueChange={(value) => updateFilter('sortOrder', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Plus récent en premier</SelectItem>
              <SelectItem value="asc">Plus ancien en premier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={resetFilters} variant="outline" size="sm">
            Réinitialiser
          </Button>
          <Button onClick={applyFilters} size="sm" className="flex-1">
            Appliquer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};