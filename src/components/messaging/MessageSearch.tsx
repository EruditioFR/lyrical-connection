import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, X, Filter, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvancedFilters, MessageFilters } from "./AdvancedFilters";

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onFilter: () => void;
  filters?: MessageFilters;
  onFiltersChange?: (filters: MessageFilters) => void;
  senders?: string[];
  onKeyboardShortcuts?: () => void;
}

export const MessageSearch = ({ 
  onSearch, 
  onFilter, 
  filters,
  onFiltersChange,
  senders = [],
  onKeyboardShortcuts
}: MessageSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  const activeFiltersCount = filters ? 
    Object.values(filters).filter(v => v !== undefined && v !== 'date' && v !== 'desc').length : 0;

  return (
    <div className="flex items-center gap-2 p-4 border-b border-border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans les messages... (Appuyez sur / pour rechercher)"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              clearSearch();
            }
          }}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="w-4 h-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          {filters && onFiltersChange && (
            <AdvancedFilters
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClose={() => setShowAdvancedFilters(false)}
              senders={senders}
            />
          )}
        </PopoverContent>
      </Popover>

      {onKeyboardShortcuts && (
        <Button variant="outline" size="sm" onClick={onKeyboardShortcuts} title="Raccourcis clavier">
          <Keyboard className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};