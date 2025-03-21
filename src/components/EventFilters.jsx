import React from "react";

const EventFilters = ({
  activeFilter,
  onFilterChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  organizers,
  venues,
  selectedOrganizer,
  selectedVenue,
  onOrganizerChange,
  onVenueChange,
}) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="event-filters">
      <h3>Filters</h3>

      <div className="filter-section">
        <h4>Event Status</h4>
        <div className="status-filters">
          <button
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => onFilterChange("all")}
          >
            All
          </button>
          <button
            className={`filter-btn upcoming ${
              activeFilter === "upcoming" ? "active" : ""
            }`}
            onClick={() => onFilterChange("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`filter-btn ongoing ${
              activeFilter === "ongoing" ? "active" : ""
            }`}
            onClick={() => onFilterChange("ongoing")}
          >
            Ongoing
          </button>
          <button
            className={`filter-btn completed ${
              activeFilter === "completed" ? "active" : ""
            }`}
            onClick={() => onFilterChange("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="filter-section">
        <h4>Date Range</h4>
        <div className="date-filters">
          <div className="select-container">
            <label htmlFor="month-select">Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="select-container">
            <label htmlFor="year-select">Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h4>Organizer</h4>
        <div className="select-container full-width">
          <select
            value={selectedOrganizer}
            onChange={(e) => onOrganizerChange(e.target.value)}
          >
            <option value="all">All Organizers</option>
            {organizers.map((organizer) => (
              <option key={organizer.id} value={organizer.id}>
                {organizer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="filter-section">
        <h4>Venue</h4>
        <div className="select-container full-width">
          <select
            value={selectedVenue}
            onChange={(e) => onVenueChange(e.target.value)}
          >
            <option value="all">All Venues</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <style jsx>{`
        .event-filters {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .event-filters h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .filter-section h4 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
        }

        .status-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .filter-btn {
          background-color: #f1f5f9;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          background-color: #e2e8f0;
        }

        .filter-btn.active {
          background-color: #334155;
          color: white;
        }

        .filter-btn.upcoming.active {
          background-color: #3b82f6;
        }

        .filter-btn.ongoing.active {
          background-color: #10b981;
        }

        .filter-btn.completed.active {
          background-color: #6366f1;
        }

        .date-filters {
          display: flex;
          gap: 0.75rem;
        }

        .select-container {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .select-container.full-width {
          width: 100%;
        }

        .select-container label {
          font-size: 0.8rem;
          color: #64748b;
        }

        .select-container select {
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
          font-size: 0.85rem;
          color: #334155;
          width: 100%;
        }

        .select-container select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        @media (max-width: 768px) {
          .date-filters {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default EventFilters;
