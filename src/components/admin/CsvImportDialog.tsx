import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

const CsvImportDialog = ({ open, onOpenChange, onImportSuccess }: CsvImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Erreur de fichier",
        description: "Veuillez sélectionner un fichier CSV valide.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setProgress(0);

    try {
      // Read file as text
      const text = await file.text();
      
      // Call the import edge function
      const { data, error } = await supabase.functions.invoke('import-csv-lyrics', {
        body: { csvData: text },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Import réussi",
        description: `${data.imported} œuvres importées avec succès.`,
      });

      onImportSuccess?.();
      onOpenChange(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'import.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import CSV - Base de données lyriques</DialogTitle>
          <DialogDescription>
            Importez vos œuvres lyriques depuis un fichier CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Format CSV attendu : titre,compositeur,catégorie,genre,période,description,librettiste,synopsis
            </AlertDescription>
          </Alert>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="csvFile">Fichier CSV</Label>
            <div className="flex items-center gap-2">
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileSelect}
                disabled={isImporting}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          )}

          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Import en cours...</span>
                <span className="text-sm">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isImporting}
          >
            {isImporting ? "Import en cours..." : "Importer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CsvImportDialog;