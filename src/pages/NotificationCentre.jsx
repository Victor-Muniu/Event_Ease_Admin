import { useState, useEffect } from "react"
import { Search, Calendar, Bell, ChevronDown, MapPin, Users, Eye } from "lucide-react"

export default function NotificationCenter() {
  const [requests, setRequests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [organizerFilter, setOrganizerFilter] = useState("All Organizers")

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost:3002/event-requests")
        const data = await response.json()
        setRequests(data)
      } catch (error) {
        console.error("Error fetching requests:", error)
      }
    }

    fetchRequests()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
  

  return (
    <div className="container">
      <header className="header">
        <h1>Event Ground Booking Requests</h1>
        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">2</span>
          </button>
          <div className="profile-pic">
            <img src="/placeholder.svg?height=40&width=40" alt="Profile" />
          </div>
        </div>
      </header>

      <div className="filters">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search grounds or organizers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <ChevronDown className="dropdown-icon" />
        </div>

        <div className="date-picker">
          <input type="date" placeholder="dd/mm/yyyy" />
          <Calendar className="calendar-icon" />
        </div>

        <div className="filter-dropdown">
          <select value={organizerFilter} onChange={(e) => setOrganizerFilter(e.target.value)}>
            <option>All Organizers</option>
            {[...new Set(requests.map((r) => `${r.organizer.firstName} ${r.organizer.lastName}`))].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <ChevronDown className="dropdown-icon" />
        </div>
      </div>

      <div className="venues-grid">
        {requests.map((request) => (
          <div key={request._id} className="venue-card">
            <div className="venue-header">
              <h2>{request.eventGround.name}</h2>
              <span className={`status-badge ${request.status.toLowerCase()}`}>{request.status}</span>
            </div>

            <div className="venue-location">
              <MapPin size={16} />
              <span></span>
            </div>

            <div className="event-details">
              <h3>{request.additionalNotes.split("for")[1] || "Event"}</h3>
              <p className="organizer">
                {request.organizer.firstName} {request.organizer.lastName}
              </p>

              <div className="event-meta">
                <div className="date">
                  <Calendar size={16} />
                  <span>{request.eventDates.map((date) => formatDate(date)).join(" - ")}</span>
                </div>
                <div className="attendees">
                  <Users size={16} />
                  <span>{request.expectedAttendees} attendees</span>
                </div>
              </div>

              <div className="action-buttons">
                {request.status === "Pending" && (
                  <>
                    <button className="btn approve">Approve</button>
                    <button className="btn reject">Reject</button>
                  </>
                )}
                <button className="btn view">
                  <Eye size={16} />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-pic {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }

        .profile-pic img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-container {
          flex: 1;
          min-width: 200px;
          position: relative;
        }

        .search-container input {
          width: 100%;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          outline: none;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .filter-dropdown {
          position: relative;
          min-width: 150px;
        }

        .filter-dropdown select {
          width: 100%;
          padding: 0.5rem 2rem 0.5rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          appearance: none;
          background: white;
          cursor: pointer;
        }

        .dropdown-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }

        .date-picker {
          position: relative;
          min-width: 150px;
        }

        .date-picker input {
          width: 100%;
          padding: 0.5rem 2rem 0.5rem 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }

        .calendar-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          pointer-events: none;
        }

        .venues-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .venue-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .venue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .venue-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.pending {
          background-color: #fff3dc;
          color: #b25e09;
        }

        .status-badge.approved {
          background-color: #dcfce7;
          color: #166534;
        }

        .status-badge.rejected {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .venue-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .event-details {
          border-top: 1px solid #e0e0e0;
          padding-top: 1rem;
        }

        .event-details h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .organizer {
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .date, .attendees {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.875rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .btn.approve {
          background-color: #dcfce7;
          color: #166534;
        }

        .btn.reject {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .btn.view {
          background-color: #f3f4f6;
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .filters {
            flex-direction: column;
          }

          .search-container,
          .filter-dropdown,
          .date-picker {
            width: 100%;
          }

          .venues-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
