
import React from 'react';

interface EventContentSectionProps {
  title: string;
  content: string;
}

const EventContentSection: React.FC<EventContentSectionProps> = ({ title, content }) => {
  return (
    <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h2 className="text-2xl font-serif font-semibold mb-4">{title}</h2>
      <div className="text-white whitespace-pre-line">
        {content}
      </div>
    </section>
  );
};

export default EventContentSection;
