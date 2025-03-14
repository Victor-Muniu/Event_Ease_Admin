import { X, Calendar, Users, MapPin } from "lucide-react"

export default function RequestDetailsCard({ request, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="overlay">
      <div className="card">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>{request.eventGround.name}</h2>
        <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>

        <div className="details">
          <p>
            <strong>Organizer:</strong> {request.organizer.firstName} {request.organizer.lastName}
          </p>
          <p>
            <strong>Email:</strong> {request.organizer.email}
          </p>
          <p className="location">
            <MapPin size={16} />
            {request.eventGround.location.coordinates.join(", ")}
          </p>
          <p className="date">
            <Calendar size={16} />
            {request.eventDates.map(formatDate).join(" - ")}
          </p>
          <p className="attendees">
            <Users size={16} />
            {request.expectedAttendees} attendees
          </p>
          <p>
            <strong>Additional Notes:</strong> {request.additionalNotes}
          </p>
          <p>
            <strong>Submission Date:</strong> {formatDate(request.requestSubmissionDate)}
          </p>
        </div>
      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .card {
          background-color: white;
          border-radius: 0.75rem;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .status-badge.pending {
          background-color: #fff7ed;
          color: #9a3412;
        }

        .status-badge.approved {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-badge.rejected {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .details p {
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #374151;
        }

        .details .location,
        .details .date,
        .details .attendees {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  )
}

