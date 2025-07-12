
import React from 'react';
import { Music } from 'lucide-react';
import RepertoireItem from './RepertoireItem';

interface RepertoireListProps {
  repertoire: any[];
  onUpdate: (id: string, data: {
    performance_year: number | null;
    venue: string | null;
    notes: string | null;
  }) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

const RepertoireList: React.FC<RepertoireListProps> = ({ repertoire, onUpdate, onDelete, isUpdating }) => {
  if (repertoire.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Aucun air dans votre répertoire</p>
        <p className="text-sm">Ajoutez votre premier air pour commencer</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {repertoire.map((item) => (
        <RepertoireItem
          key={item.id}
          item={item}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
};

export default RepertoireList;
