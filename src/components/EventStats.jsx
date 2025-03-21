import React from "react";

const EventStats = ({ events }) => {
  const upcomingEvents = events.filter(
    (event) => event.status.toLowerCase() === "upcoming"
  );
  const ongoingEvents = events.filter(
    (event) => event.status.toLowerCase() === "ongoing"
  );
  const completedEvents = events.filter(
    (event) => event.status.toLowerCase() === "completed"
  );

  const totalRevenue = events.reduce(
    (total, event) => total + event.bookingId.amountPaid,
    0
  );

  const uniqueVenues = new Set(
    events.map((event) => event.bookingId.response.venueRequest.venue._id)
  );
  const uniqueOrganizers = new Set(
    events.map((event) => event.bookingId.organizer._id)
  );

  return (
    <div className="event-stats">
      <h3>Event Statistics</h3>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total Events</div>
        </div>

        <div className="stat-card upcoming">
          <div className="stat-value">{upcomingEvents.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>

        <div className="stat-card ongoing">
          <div className="stat-value">{ongoingEvents.length}</div>
          <div className="stat-label">Ongoing</div>
        </div>

        <div className="stat-card completed">
          <div className="stat-value">{completedEvents.length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="additional-stats">
        <div className="stat-item">
          <span className="stat-label">Total Revenue:</span>
          <span className="stat-value">${totalRevenue.toFixed(2)}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Unique Venues:</span>
          <span className="stat-value">{uniqueVenues.size}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Unique Organizers:</span>
          <span className="stat-value">{uniqueOrganizers.size}</span>
        </div>
      </div>
      <style jsx>{`
        .event-stats {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .event-stats h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-card {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-bottom: 3px solid #94a3b8;
        }

        .stat-card.total {
          border-bottom-color: #64748b;
        }

        .stat-card.upcoming {
          border-bottom-color: #3b82f6;
        }

        .stat-card.ongoing {
          border-bottom-color: #10b981;
        }

        .stat-card.completed {
          border-bottom-color: #6366f1;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #334155;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .additional-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background-color: #f8fafc;
          border-radius: 6px;
        }

        .stat-item .stat-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #334155;
          margin: 0;
        }

        .stat-item .stat-value {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default EventStats;
