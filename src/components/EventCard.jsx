import { formatDate } from "../utils/dateUtils";

const EventCard = ({ event, isExpanded, onToggleDetails }) => {
  const { bookingId, status } = event;
  const { response, organizer } = bookingId;
  const { venueRequest } = response;
  const { eventName, eventDescription, eventDates, venue } = venueRequest;

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "status-upcoming";
      case "ongoing":
        return "status-ongoing";
      case "completed":
        return "status-completed";
      default:
        return "";
    }
  };

  const formatEventDates = (dates) => {
    if (dates.length === 1) {
      return formatDate(new Date(dates[0]));
    }

    return `${formatDate(new Date(dates[0]))} - ${formatDate(
      new Date(dates[dates.length - 1])
    )}`;
  };

  return (
    <div className={`event-card ${getStatusClass(status)}`}>
      <div className="event-card-header">
        <div className="event-status">{status}</div>
        <h3 className="event-name">{eventName}</h3>
      </div>

      <div className="event-card-content">
        <div className="event-info">
          <p className="event-dates">{formatEventDates(eventDates)}</p>
          <p className="event-venue">{venue.name}</p>
          <p className="event-organizer">{organizer.organizationName}</p>
        </div>

        <button className="details-toggle" onClick={onToggleDetails}>
          {isExpanded ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {isExpanded && (
        <div className="event-details">
          <div className="details-section">
            <h4>Event Details</h4>
            <p>{eventDescription}</p>
            <p>
              <strong>Expected Attendance:</strong>{" "}
              {venueRequest.expectedAttendance}
            </p>
            <p>
              <strong>Additional Requests:</strong>{" "}
              {venueRequest.additionalRequests || "None"}
            </p>
          </div>

          <div className="details-section">
            <h4>Venue Information</h4>
            <p>
              <strong>Name:</strong> {venue.name}
            </p>
            <p>
              <strong>Location:</strong> {venue.location}
            </p>
            <p>
              <strong>Capacity:</strong> {venue.capacity}
            </p>
            <div className="venue-images">
              {venue.images.map((image, index) => (
                <img
                  key={index}
                  src={image || "/placeholder.svg"}
                  alt={`${venue.name} - ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="details-section">
            <h4>Organizer</h4>
            <p>
              <strong>Organization:</strong> {organizer.organizationName}
            </p>
            <p>
              <strong>Contact:</strong> {organizer.firstName}{" "}
              {organizer.lastName}
            </p>
            <p>
              <strong>Email:</strong> {organizer.email}
            </p>
            <p>
              <strong>Phone:</strong> {organizer.phone}
            </p>
          </div>

          <div className="details-section">
            <h4>Payment Information</h4>
            <p>
              <strong>Total Amount:</strong> KSH {bookingId.totalAmount}
            </p>
            <p>
              <strong>Amount Paid:</strong> KSH {bookingId.amountPaid}
            </p>
            <p>
              <strong>Status:</strong> {bookingId.status}
            </p>
          </div>
        </div>
      )}
      <style jsx>{`
        .event-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-top: 4px solid #94a3b8;
        }

        .event-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .event-card.status-upcoming {
          border-top-color: #3b82f6;
        }

        .event-card.status-ongoing {
          border-top-color: #10b981;
        }

        .event-card.status-completed {
          border-top-color: #6366f1;
        }

        .event-card-header {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e2e8f0;
        }

        .event-status {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          text-transform: uppercase;
          background-color: #f1f5f9;
          color: #64748b;
        }

        .status-upcoming .event-status {
          background-color: #eff6ff;
          color: #3b82f6;
        }

        .status-ongoing .event-status {
          background-color: #ecfdf5;
          color: #10b981;
        }

        .status-completed .event-status {
          background-color: #eef2ff;
          color: #6366f1;
        }

        .event-name {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e293b;
        }

        .event-card-content {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .event-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-dates {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .event-venue {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
          color: #334155;
        }

        .event-organizer {
          margin: 0;
          font-size: 0.85rem;
          color: #64748b;
        }

        .details-toggle {
          background-color: transparent;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .details-toggle:hover {
          background-color: #f8fafc;
          color: #334155;
        }

        .event-details {
          padding: 0 1.5rem 1.5rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 1rem;
          padding-top: 1rem;
        }

        .details-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .details-section h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
        }

        .details-section p {
          margin: 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .venue-images {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .venue-images img {
          width: 100px;
          height: 70px;
          object-fit: cover;
          border-radius: 4px;
        }

        @media (max-width: 640px) {
          .event-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EventCard;
