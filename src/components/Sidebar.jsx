import { useState } from "react"
import { Home, Calendar, BookOpen, Settings, ChevronDown, ChevronRight, Box,  ChartNoAxesCombined, ChartCandlestick , Users} from "lucide-react"

export default function Sidebar() {
  const [isEventsOpen, setIsEventsOpen] = useState(false)

  return (
    <div className="sidebar">
      {/* App Header */}
      <div className="app-header">
        <div className="app-logo">
          <Box size={24} className="logo-icon" />
          <div className="app-info">
            <h1>EventEase</h1>
            <p>Manage your workspace</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-menu">
        <a href="/dashboard" className="nav-item active">
          <Home size={20} />
          <span>Dashboard</span>
        </a>

       
        <div className="nav-group">
          <button className="nav-item with-submenu" onClick={() => setIsEventsOpen(!isEventsOpen)}>
            <Calendar size={20} />
            <span>Manage Events</span>
            {isEventsOpen ? (
              <ChevronDown size={16} className="submenu-icon" />
            ) : (
              <ChevronRight size={16} className="submenu-icon" />
            )}
          </button>

          {isEventsOpen && (
            <div className="submenu">
              <a href="/event_ground" className="submenu-item">
                Event Grounds
              </a>
              <a href="/venue_request" className="submenu-item">
                View Requests
              </a>
              <a href="/events" className="submenu-item">
                Current Events
              </a>
            </div>
          )}
        </div>

        <a href="/bookings" className="nav-item">
          <BookOpen size={20} />
          <span>Bookings</span>
        </a>

        <a href="/report" className="nav-item">
          <ChartCandlestick size={20}/>
          <span>Financial Report</span>
        </a>
        

        <a href="/metrics" className="nav-item">
        <ChartNoAxesCombined size={20} />
        <span>Metrics</span>
        </a>

        <a href="/organizers" className="nav-item">
        <Users size={20}/>
        <span>Event Organizers</span>
        </a>
       
        
        <a href="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>

      <style jsx>{`
        .sidebar {
          width: 250px;
          
          background: white;
          border-right: 1px solid #e5e7eb;
          padding: 1rem;
        }

        .app-header {
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .app-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          color: #7c3aed;
        }

        .app-info h1 {
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .app-info p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          color: #4b5563;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-size: 0.875rem;
        }

        .nav-item:hover {
          background: #f3f4f6;
        }

        .nav-item.active {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .with-submenu {
          justify-content: space-between;
        }

        .with-submenu span:first-of-type {
          margin-right: auto;
        }

        .submenu-icon {
          color: #9ca3af;
        }

        .submenu {
          margin-left: 2.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 0.25rem;
        }

        .submenu-item {
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          color: #4b5563;
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .submenu-item:hover {
          background: #f3f4f6;
        }

        .badge {
          background: #7c3aed;
          color: white;
          font-size: 0.75rem;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
          margin-left: auto;
        }
      `}</style>
    </div>
  )
}

