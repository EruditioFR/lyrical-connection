import React from 'react';

interface EvaluationChartProps {
  evaluation: {
    vocal_quality?: number | null;
    vocal_technique?: number | null;
    stage_presence?: number | null;
    language_mastery?: number | null;
    pitch_accuracy?: number | null;
  };
  size?: number;
}

const EvaluationChart: React.FC<EvaluationChartProps> = ({ 
  evaluation, 
  size = 120 
}) => {
  const criteria = [
    { key: 'vocal_quality', label: 'Voix', value: evaluation.vocal_quality || null },
    { key: 'vocal_technique', label: 'Technique', value: evaluation.vocal_technique || null },
    { key: 'stage_presence', label: 'Présence', value: evaluation.stage_presence || null },
    { key: 'language_mastery', label: 'Langues', value: evaluation.language_mastery || null },
    { key: 'pitch_accuracy', label: 'Justesse', value: evaluation.pitch_accuracy || null }
  ];

  const center = size / 2;
  const maxRadius = (size / 2) - 20;
  
  // Créer les points du polygone pour les valeurs max (10)
  const angleStep = (2 * Math.PI) / criteria.length;
  const maxPoints = criteria.map((_, index) => {
    const angle = (index * angleStep) - (Math.PI / 2); // -90° pour commencer en haut
    return {
      x: center + maxRadius * Math.cos(angle),
      y: center + maxRadius * Math.sin(angle)
    };
  });

  // Créer les points du polygone pour les valeurs actuelles
  const dataPoints = criteria.map((criterion, index) => {
    const value = criterion.value || 0;
    const radius = (value / 10) * maxRadius;
    const angle = (index * angleStep) - (Math.PI / 2);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      value: criterion.value
    };
  });

  const createPolygonPoints = (points: Array<{x: number, y: number}>) => {
    return points.map(p => `${p.x},${p.y}`).join(' ');
  };

  // Créer les lignes de grille (cercles concentriques)
  const gridLevels = [2, 4, 6, 8, 10];

  return (
    <div className="flex flex-col items-center space-y-2">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grille concentrique */}
        {gridLevels.map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * maxRadius}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        
        {/* Axes */}
        {maxPoints.map((point, index) => (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="0.5"
            opacity="0.3"
          />
        ))}
        
        {/* Polygone de fond (contour max) */}
        <polygon
          points={createPolygonPoints(maxPoints)}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.2"
        />
        
        {/* Polygone des données */}
        <polygon
          points={createPolygonPoints(dataPoints)}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          fillOpacity="0.15"
        />
        
        {/* Points des données */}
        {dataPoints.map((point, index) => (
          point.value !== null && (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="2"
            />
          )
        ))}
      </svg>
      
      {/* Légende */}
      <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground text-center max-w-[140px]">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="flex flex-col">
            <span className="font-medium">{criterion.label}</span>
            <span className={criterion.value ? "text-primary" : "text-muted-foreground/60"}>
              {criterion.value ? `${criterion.value}/10` : '-'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationChart;