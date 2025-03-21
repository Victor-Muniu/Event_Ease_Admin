import { useState, useEffect } from "react";
import EventList from "../components/EventList";
import EventCalendar from "../components/EventCalendar";
import EventFilters from "../components/EventFilters";
import EventStats from "../components/EventStats";
const Event = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("list");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedOrganizer, setSelectedOrganizer] = useState("all");
  const [selectedVenue, setSelectedVenue] = useState("all");
  const [organizers, setOrganizers] = useState([]);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3002/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const data = await response.json();
        setEvents(data);

        // Extract unique organizers and venues
        const uniqueOrganizers = new Map();
        const uniqueVenues = new Map();

        data.forEach((event) => {
          const organizer = event.bookingId.organizer;
          const venue = event.bookingId.response.venueRequest.venue;

          uniqueOrganizers.set(organizer._id, {
            id: organizer._id,
            name:
              organizer.organizationName ||
              `${organizer.firstName} ${organizer.lastName}`,
          });

          uniqueVenues.set(venue._id, {
            id: venue._id,
            name: venue.name,
          });
        });

        setOrganizers(Array.from(uniqueOrganizers.values()));
        setVenues(Array.from(uniqueVenues.values()));

        setLoading(false);
      } catch (err) {
        setError("Error fetching events. Please try again later.");
        setLoading(false);
        console.error("Error fetching events:", err);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [
    events,
    activeFilter,
    selectedMonth,
    selectedYear,
    selectedOrganizer,
    selectedVenue,
  ]);

  const filterEvents = () => {
    if (!events.length) return;

    let filtered = [...events];

    // Filter by status
    if (activeFilter !== "all") {
      filtered = filtered.filter(
        (event) => event.status.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Filter by month and year
    filtered = filtered.filter((event) => {
      const eventDates = event.bookingId.response.venueRequest.eventDates;
      return eventDates.some((dateStr) => {
        const date = new Date(dateStr);
        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      });
    });

    // Filter by organizer
    if (selectedOrganizer !== "all") {
      filtered = filtered.filter(
        (event) => event.bookingId.organizer._id === selectedOrganizer
      );
    }

    // Filter by venue
    if (selectedVenue !== "all") {
      filtered = filtered.filter(
        (event) =>
          event.bookingId.response.venueRequest.venue._id === selectedVenue
      );
    }

    setFilteredEvents(filtered);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleOrganizerChange = (organizerId) => {
    setSelectedOrganizer(organizerId);
  };

  const handleVenueChange = (venueId) => {
    setSelectedVenue(venueId);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Event Management Dashboard</h1>
        <div className="view-toggles">
          <button
            className={`view-toggle ${activeView === "list" ? "active" : ""}`}
            onClick={() => handleViewChange("list")}
          >
            List View
          </button>
          <button
            className={`view-toggle ${
              activeView === "calendar" ? "active" : ""
            }`}
            onClick={() => handleViewChange("calendar")}
          >
            Calendar View
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <EventFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
            organizers={organizers}
            venues={venues}
            selectedOrganizer={selectedOrganizer}
            selectedVenue={selectedVenue}
            onOrganizerChange={handleOrganizerChange}
            onVenueChange={handleVenueChange}
          />
          <EventStats events={events} />
        </aside>

        <main className="dashboard-main">
          {activeView === "list" ? (
            <EventList events={filteredEvents} />
          ) : (
            <EventCalendar
              events={filteredEvents}
              month={selectedMonth}
              year={selectedYear}
            />
          )}
        </main>
      </div>
      <style jsx>{`
        /* Dashboard Layout */
        .dashboard-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f5f7fa;
          color: #333;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .dashboard-header {
          background-color: #fff;
          padding: 1.5rem 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .view-toggles {
          display: flex;
          gap: 0.5rem;
        }

        .view-toggle {
          background-color: #f1f5f9;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-toggle:hover {
          background-color: #e2e8f0;
        }

        .view-toggle.active {
          background-color: #3b82f6;
          color: white;
        }

        .dashboard-content {
          display: flex;
          flex: 1;
          padding: 1.5rem;
          gap: 1.5rem;
        }

        .dashboard-sidebar {
          width: 300px;
          flex-shrink: 0;
        }

        .dashboard-main {
          flex: 1;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          overflow: auto;
        }

        /* Loading and Error States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .error-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          padding: 2rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .error-container p {
          color: #e53e3e;
          font-size: 1.2rem;
          text-align: center;
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .dashboard-content {
            flex-direction: column;
          }

          .dashboard-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Event;
