import { useState } from "react";
import {
  Search,
  Calendar,
  Building,
  BookOpen,
  MoreVertical,
  Bell,
} from "lucide-react";
function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const metrics = [
    { label: "Upcoming Events", value: "28", icon: Calendar },
    { label: "Events Today", value: "5", icon: Calendar },
    { label: "Total Bookings", value: "156", icon: BookOpen },
    { label: "Available Venues", value: "8/12", icon: Building },
  ];

  const venues = [
    {
      name: "Grand Ballroom",
      capacity: "500 people",
      status: "Available",
    },
    {
      name: "Exhibition Hall",
      capacity: "1000 people",
      status: "Booked",
    },
    {
      name: "Conference Room A",
      capacity: "100 people",
      status: "Maintenance",
    },
  ];

  const recentBookings = [
    {
      icon: "💻",
      name: "Tech Summit 2025",
      organizer: {
        name: "Robert Fox",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      venue: "Grand Ballroom",
      date: "Mar 20, 2025",
    },
    {
      icon: "🎵",
      name: "Spring Music Festival",
      organizer: {
        name: "Jenny Wilson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      venue: "Exhibition Hall",
      date: "Apr 5, 2025",
    },
    {
      icon: "💒",
      name: "Johnson Wedding",
      organizer: {
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      venue: "Grand Ballroom",
      date: "Mar 18, 2025",
    },
  ];

  const notifications = [
    {
      type: "info",
      message: "New booking request for Tech Summit 2025",
      time: "5 minutes ago",
    },
    {
      type: "success",
      message: "Spring Music Festival booking confirmed",
      time: "2 hours ago",
    },
    {
      type: "warning",
      message: "Maintenance scheduled for Conference Room A",
      time: "5 hours ago",
    },
  ];

  return (
    <div className="dashboard">
      <header className="header">
        <div className="welcome">
          <h1>Welcome back, John!</h1>
          <span className="date">March 15, 2025 | 09:41 AM</span>
        </div>

        <div className="header-right">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="notifications-dropdown">
            <span>Notifications</span>
            <button className="clear-all">Clear All</button>
          </div>
        </div>
      </header>

      <div className="metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="metric-card">
            <metric.icon className="metric-icon" />
            <div className="metric-content">
              <h3>{metric.value}</h3>
              <p>{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="main-content">
          <div className="section-header">
            <h2>Event Grounds</h2>
            <button className="view-all">View All</button>
          </div>

          <div className="venues-list">
            {venues.map((venue) => (
              <div key={venue.name} className="venue-card">
                <div className="venue-icon">
                  <Building className="building-icon" />
                </div>
                <div className="venue-info">
                  <h3>{venue.name}</h3>
                  <p>Capacity: {venue.capacity}</p>
                </div>
                <div className={`venue-status ${venue.status.toLowerCase()}`}>
                  {venue.status}
                </div>
                <button className="more-actions">
                  <MoreVertical size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="section-header">
            <h2>Recent Bookings</h2>
          </div>

          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Organizer</th>
                  <th>Venue</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.name}>
                    <td>
                      <div className="event-name">
                        <span className="event-icon">{booking.icon}</span>
                        {booking.name}
                      </div>
                    </td>
                    <td>
                      <div className="organizer">
                        <img
                          src={booking.organizer.avatar || "/placeholder.svg"}
                          alt=""
                          className="avatar"
                        />
                        {booking.organizer.name}
                      </div>
                    </td>
                    <td>{booking.venue}</td>
                    <td>{booking.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="notifications-panel">
          <div className="notifications-list">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`notification-item ${notification.type}`}
              >
                <div className="notification-icon">
                  {notification.type === "info" && <Bell size={16} />}
                  {notification.type === "success" && (
                    <span className="check">✓</span>
                  )}
                  {notification.type === "warning" && (
                    <span className="warning">!</span>
                  )}
                </div>
                <div className="notification-content">
                  <p>{notification.message}</p>
                  <span>{notification.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .dashboard {
          padding: 24px;
          background-color: #f8fafc;
          min-height: 100vh;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .welcome h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .date {
          font-size: 14px;
          color: #64748b;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          width: 16px;
          height: 16px;
        }

        .search-container input {
          padding: 8px 12px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          width: 240px;
        }

        .notifications-dropdown {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .clear-all {
          color: #2563eb;
          background: none;
          border: none;
          font-size: 14px;
          cursor: pointer;
        }

        .metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metric-icon {
          width: 24px;
          height: 24px;
          color: #2563eb;
        }

        .metric-content h3 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .metric-content p {
          margin: 4px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .view-all {
          color: #2563eb;
          background: none;
          border: none;
          font-size: 14px;
          cursor: pointer;
        }

        .venues-list {
          display: grid;
          gap: 16px;
          margin-bottom: 32px;
        }

        .venue-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .venue-icon {
          width: 40px;
          height: 40px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .building-icon {
          color: #2563eb;
          width: 20px;
          height: 20px;
        }

        .venue-info h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #1e293b;
        }

        .venue-info p {
          margin: 4px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .venue-status {
          margin-left: auto;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .venue-status.available {
          background: #dcfce7;
          color: #166534;
        }

        .venue-status.booked {
          background: #fee2e2;
          color: #991b1b;
        }

        .venue-status.maintenance {
          background: #fef9c3;
          color: #854d0e;
        }

        .more-actions {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
        }

        .bookings-table {
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 16px;
          font-size: 14px;
          color: #1e293b;
        }

        .event-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .event-icon {
          font-size: 20px;
        }

        .organizer {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 12px;
        }

        .notifications-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .notification-icon {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-item.info .notification-icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .notification-item.success .notification-icon {
          background: #dcfce7;
          color: #166534;
        }

        .notification-item.warning .notification-icon {
          background: #fef9c3;
          color: #854d0e;
        }

        .notification-content p {
          margin: 0;
          font-size: 14px;
          color: #1e293b;
        }

        .notification-content span {
          font-size: 12px;
          color: #64748b;
          display: block;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
