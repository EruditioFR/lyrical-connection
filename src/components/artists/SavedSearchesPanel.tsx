
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSavedSearches, useDeleteSavedSearch } from '@/hooks/useSavedSearches';
import { Loader2, Trash2, Search } from 'lucide-react';
import type { SearchCriteria } from '@/types/search';

interface SavedSearchesPanelProps {
  onLoadSearch: (criteria: SearchCriteria) => void;
}

const SavedSearchesPanel: React.FC<SavedSearchesPanelProps> = ({ onLoadSearch }) => {
  const { searches, isLoading } = useSavedSearches();
  const deleteSearchMutation = useDeleteSavedSearch();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherches sauvegardées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Recherches sauvegardées
        </CardTitle>
      </CardHeader>
      <CardContent>
        {searches.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Aucune recherche sauvegardée
          </p>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => {
              const criteria = search.search_criteria as SearchCriteria;
              
              return (
                <div
                  key={search.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{search.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSearchMutation.mutate(search.id)}
                      disabled={deleteSearchMutation.isPending}
                      className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {criteria.searchTerm && (
                      <Badge variant="secondary" className="text-xs">
                        "{criteria.searchTerm}"
                      </Badge>
                    )}
                    {criteria.voiceType && (
                      <Badge variant="secondary" className="text-xs">
                        {criteria.voiceType}
                      </Badge>
                    )}
                    {criteria.location && (
                      <Badge variant="secondary" className="text-xs">
                        {criteria.location}
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadSearch(criteria)}
                    className="w-full text-xs"
                  >
                    Charger cette recherche
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedSearchesPanel;
