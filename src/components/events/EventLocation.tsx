
import React from 'react';
import EventMap from '@/components/events/EventMap';

interface EventLocationProps {
  event: any;
}

const EventLocation: React.FC<EventLocationProps> = ({ event }) => {
  if (!event.location && !event.venue && !event.address) return null;

  return (
    <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h2 className="text-2xl font-serif font-semibold mb-4">Lieu</h2>
      {event.venue && <p className="font-medium mb-2">{event.venue}</p>}
      {event.location && <p className="text-white mb-4">{event.location}</p>}
      {event.address && <p className="text-white mb-4">{event.address}</p>}
      
      {event.latitude && event.longitude && (
        <div className="mt-4">
          <EventMap
            latitude={event.latitude}
            longitude={event.longitude}
            address={event.address}
            venue={event.venue}
          />
        </div>
      )}
    </section>
  );
};

export default EventLocation;
