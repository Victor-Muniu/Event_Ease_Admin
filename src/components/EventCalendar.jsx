import { useState, useEffect } from "react";

const EventCalendar = ({ events, month, year }) => {
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dateEvents, setDateEvents] = useState([]);

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

  useEffect(() => {
    generateCalendarDays();
  }, [month, year, events]);

  const generateCalendarDays = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, events: [] });
    }

    // Add days of the month with their events
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter((event) => {
        return event.bookingId.response.venueRequest.eventDates.some(
          (eventDate) => {
            const eventDateObj = new Date(eventDate);
            return (
              eventDateObj.getDate() === day &&
              eventDateObj.getMonth() === month &&
              eventDateObj.getFullYear() === year
            );
          }
        );
      });

      days.push({ day, date, events: dayEvents });
    }

    setCalendarDays(days);
  };

  const handleDateClick = (date, events) => {
    setSelectedDate(date);
    setDateEvents(events);
  };

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

  return (
    <div className="event-calendar">
      <h2>
        {monthNames[month]} {year} Calendar
      </h2>

      <div className="calendar-grid">
        <div className="calendar-header">
          <div>Sunday</div>
          <div>Monday</div>
          <div>Tuesday</div>
          <div>Wednesday</div>
          <div>Thursday</div>
          <div>Friday</div>
          <div>Saturday</div>
        </div>

        <div className="calendar-body">
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={`calendar-day ${dayData.day ? "" : "empty-day"} ${
                dayData.events.length > 0 ? "has-events" : ""
              }`}
              onClick={() =>
                dayData.day && handleDateClick(dayData.date, dayData.events)
              }
            >
              {dayData.day && (
                <>
                  <div className="day-number">{dayData.day}</div>
                  <div className="day-events">
                    {dayData.events.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`day-event-indicator ${getStatusClass(
                          event.status
                        )}`}
                        title={event.bookingId.response.venueRequest.eventName}
                      >
                        {event.bookingId.response.venueRequest.eventName.substring(
                          0,
                          15
                        )}
                        {event.bookingId.response.venueRequest.eventName
                          .length > 15
                          ? "..."
                          : ""}
                      </div>
                    ))}
                    {dayData.events.length > 3 && (
                      <div className="more-events">
                        +{dayData.events.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="date-events">
          <h3>Events on {selectedDate.toLocaleDateString()}</h3>
          {dateEvents.length === 0 ? (
            <p>No events scheduled for this date.</p>
          ) : (
            <div className="date-events-list">
              {dateEvents.map((event, index) => (
                <div
                  key={index}
                  className={`date-event-item ${getStatusClass(event.status)}`}
                >
                  <h4>{event.bookingId.response.venueRequest.eventName}</h4>
                  <p>
                    <strong>Venue:</strong>{" "}
                    {event.bookingId.response.venueRequest.venue.name}
                  </p>
                  <p>
                    <strong>Organizer:</strong>{" "}
                    {event.bookingId.organizer.organizationName}
                  </p>
                  <p>
                    <strong>Status:</strong> {event.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        .event-calendar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .event-calendar h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .calendar-grid {
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }

        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }

        .calendar-header div {
          padding: 0.75rem;
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
          color: #64748b;
        }

        .calendar-body {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-auto-rows: minmax(100px, auto);
        }

        .calendar-day {
          border-right: 1px solid #e2e8f0;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.5rem;
          position: relative;
          min-height: 100px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .calendar-day:nth-child(7n) {
          border-right: none;
        }

        .calendar-day:hover {
          background-color: #f8fafc;
        }

        .empty-day {
          background-color: #f8fafc;
          cursor: default;
        }

        .day-number {
          font-weight: 600;
          font-size: 0.9rem;
          color: #334155;
          margin-bottom: 0.5rem;
        }

        .has-events .day-number {
          color: #3b82f6;
        }

        .day-events {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
        }

        .day-event-indicator {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background-color: #f1f5f9;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.75rem;
        }

        .day-event-indicator.status-upcoming {
          background-color: #eff6ff;
          color: #3b82f6;
        }

        .day-event-indicator.status-ongoing {
          background-color: #ecfdf5;
          color: #10b981;
        }

        .day-event-indicator.status-completed {
          background-color: #eef2ff;
          color: #6366f1;
        }

        .more-events {
          font-size: 0.75rem;
          color: #64748b;
          text-align: center;
          margin-top: 0.25rem;
        }

        .date-events {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background-color: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .date-events h3 {
          margin: 0 0 1rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #334155;
        }

        .date-events-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .date-event-item {
          background-color: #fff;
          border-radius: 6px;
          padding: 1rem;
          border-left: 4px solid #94a3b8;
        }

        .date-event-item.status-upcoming {
          border-left-color: #3b82f6;
        }

        .date-event-item.status-ongoing {
          border-left-color: #10b981;
        }

        .date-event-item.status-completed {
          border-left-color: #6366f1;
        }

        .date-event-item h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
        }

        .date-event-item p {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .calendar-day {
            min-height: 80px;
          }

          .date-events-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EventCalendar;
