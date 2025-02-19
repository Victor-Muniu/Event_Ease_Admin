import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  Building,
} from "lucide-react";

export default function EventDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:3002/events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const totalVenues = new Set(events.map((event) => event.venue.name)).size;
  const totalAttendance = events.reduce(
    (sum, event) => sum + event.ticketsAvailable,
    0
  );

  return (
    <div className="dashboard">
      <div className="search-bar">
        <Search className="search-icon" />
        <input type="text" placeholder="Search events..." />
      </div>

      <div className="metrics">
        <div className="metric-card">
          <div className="metric-content">
            <h3>{events.length}</h3>
            <p>Active Events</p>
          </div>
          <Calendar className="metric-icon" />
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <h3>{totalVenues}</h3>
            <p>Total Venues</p>
          </div>
          <Building className="metric-icon" />
        </div>

        <div className="metric-card">
          <div className="metric-content">
            <h3>{totalAttendance.toLocaleString()}</h3>
            <p>Total Attendance</p>
          </div>
          <Users className="metric-icon" />
        </div>
      </div>

      <div className="filters">
        <select defaultValue="all-venues">
          <option value="all-venues">All Venues</option>
        </select>

        <select defaultValue="all-status">
          <option value="all-status">All Status</option>
        </select>

        <input type="date" />
      </div>

      <div className="events-grid">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          events.map((event) => (
            <div key={event._id} className="event-card">
              <div className={`status-badge ${event.status.toLowerCase()}`}>
                {event.status}
              </div>

              <h3>{event.name}</h3>

              <div className="event-detail">
                <Calendar className="icon" />
                <span>{new Date(event.startDate).toLocaleDateString()}</span>
              </div>

              <div className="event-detail">
                <MapPin className="icon" />
                <span>{event.venue.name}</span>
              </div>

              <div className="event-detail">
                <Users className="icon" />
                <span>{event.ticketsAvailable} Attendees</span>
              </div>

              <div className="organizer">
                <div className="organizer-info">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${event.eventOrganizer.email}`}
                    alt="Organizer"
                    className="avatar"
                  />
                  <div>
                    <p>Organizer</p>
                    <p className="email">{event.eventOrganizer.email}</p>
                  </div>
                </div>
                <ArrowRight className="arrow-icon" />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="notifications">
        <div className="notifications-header">
          <h2>Notifications</h2>
          <button className="mark-all">Mark all as read</button>
        </div>

        <div className="notification-list">
          <div className="notification-item new">
            <div className="notification-dot"></div>
            <div className="notification-content">
              <p>New registration for {events[0]?.name}</p>
              <span>5 minutes ago</span>
            </div>
          </div>

          <div className="notification-item success">
            <div className="notification-dot"></div>
            <div className="notification-content">
              <p>Event setup completed</p>
              <span>1 hour ago</span>
            </div>
          </div>

          <div className="notification-item warning">
            <div className="notification-dot"></div>
            <div className="notification-content">
              <p>Capacity alert for event</p>
              <span>2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .dashboard {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .search-bar {
          grid-column: 1 / -1;
          position: relative;
        }

        .search-bar input {
          width: 100%;
          padding: 12px 40px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          width: 20px;
          height: 20px;
        }

        .metrics {
          grid-column: 1 / 2;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .metric-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .metric-content h3 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .metric-content p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .metric-icon {
          width: 24px;
          height: 24px;
          color: #6366f1;
        }

        .filters {
          grid-column: 1 / 2;
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .filters select,
        .filters input {
          padding: 8px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          color: #1e293b;
        }

        .events-grid {
          grid-column: 1 / 2;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .event-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .status-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.approved {
          background: #dcfce7;
          color: #166534;
        }

        .event-card h3 {
          margin: 0 0 16px;
          font-size: 18px;
          color: #1e293b;
        }

        .event-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: #64748b;
          font-size: 14px;
        }

        .icon {
          width: 16px;
          height: 16px;
          color: #6366f1;
        }

        .organizer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .organizer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background: #f1f5f9;
        }

        .organizer-info p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
        }

        .email {
          color: #1e293b;
          font-weight: 500;
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          color: #6366f1;
        }

        .notifications {
          grid-column: 2 / 3;
          grid-row: 2 / span 3;
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .notifications-header h2 {
          margin: 0;
          font-size: 16px;
          color: #1e293b;
        }

        .mark-all {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 14px;
          cursor: pointer;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .notification-dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          margin-top: 6px;
        }

        .notification-item.new .notification-dot {
          background: #6366f1;
        }

        .notification-item.success .notification-dot {
          background: #22c55e;
        }

        .notification-item.warning .notification-dot {
          background: #eab308;
        }

        .notification-content p {
          margin: 0;
          font-size: 14px;
          color: #1e293b;
        }

        .notification-content span {
          font-size: 12px;
          color: #64748b;
        }

        .loading {
          grid-column: 1 / -1;
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
}
