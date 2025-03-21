import { useState } from "react";
import EventCard from "./EventCard";

const EventList = ({ events }) => {
  const [expandedEventId, setExpandedEventId] = useState(null);

  const toggleEventDetails = (eventId) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
    }
  };

  if (events.length === 0) {
    return (
      <div className="no-events">
        <h3>No events found</h3>
        <p>Try adjusting your filters to see more events.</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      <h2>Events ({events.length})</h2>
      <div className="event-grid">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            isExpanded={expandedEventId === event._id}
            onToggleDetails={() => toggleEventDetails(event._id)}
          />
        ))}
      </div>
      <style jsx>{`
        .event-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .event-list h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .event-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .no-events {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px dashed #cbd5e1;
        }

        .no-events h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          color: #64748b;
        }

        .no-events p {
          margin: 0;
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .event-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EventList;
