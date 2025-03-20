"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Building,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  CalendarDays,
  ChevronUp,
  ChevronDown,
  FileText,
} from "lucide-react"

export default function VenueRequests() {
  const [requests, setRequests] = useState([])
  const [responses, setResponses] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    venue: "All Venues",
    status: "All Status",
    dateRange: "All Time",
    organizer: "All Organizers",
    timeFrame: "All Time", // New filter for daily/weekly/monthly
  })
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: "requestDate",
    direction: "desc",
  })
  const [viewMode, setViewMode] = useState("table")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch both requests and responses
      const [requestsResponse, responsesResponse] = await Promise.all([
        fetch("http://localhost:3002/venue-requests"),
        fetch("http://localhost:3002/venue-request-responses"),
      ])

      if (!requestsResponse.ok) {
        throw new Error("Failed to load venue requests")
      }

      if (!responsesResponse.ok) {
        throw new Error("Failed to load venue request responses")
      }

      const requestsData = await requestsResponse.json()
      const responsesData = await responsesResponse.json()

      setRequests(requestsData)
      setResponses(responsesData)

      // Filter out requests that have responses
      const responseRequestIds = responsesData
        .filter((response) => response && response.venueRequest)
        .map((response) => response.venueRequest._id)
      const requestsWithoutResponses = requestsData.filter((request) => !responseRequestIds.includes(request._id))

      setFilteredRequests(requestsWithoutResponses)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data: " + err.message)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getDateRangeFilter = (request) => {
    const requestDate = new Date(request.requestDate)
    const now = new Date()

    if (filters.timeFrame === "Daily") {
      // Today only
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return requestDate >= today
    } else if (filters.timeFrame === "Weekly") {
      // Current week (last 7 days)
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return requestDate >= weekAgo
    } else if (filters.timeFrame === "Monthly") {
      // Current month
      const monthAgo = new Date(now)
      monthAgo.setMonth(now.getMonth() - 1)
      return requestDate >= monthAgo
    }

    return true // "All Time" or default
  }

  // Apply search and filters to the already filtered requests (those without responses)
  const displayedRequests = filteredRequests
    .filter((request) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        request.eventName.toLowerCase().includes(searchLower) ||
        (request.venue?.name || "").toLowerCase().includes(searchLower) ||
        `${request.organizer.firstName} ${request.organizer.lastName}`.toLowerCase().includes(searchLower) ||
        request.eventDescription.toLowerCase().includes(searchLower)

      // Venue filter
      const matchesVenue = filters.venue === "All Venues" || request.venue?.name === filters.venue

      // Status filter
      const matchesStatus =
        filters.status === "All Status" ||
        (filters.status === "Read" && request.isRead) ||
        (filters.status === "Unread" && !request.isRead)

      // Organizer filter
      const matchesOrganizer =
        filters.organizer === "All Organizers" ||
        `${request.organizer.firstName} ${request.organizer.lastName}` === filters.organizer

      // Date range filter
      let matchesDateRange = true
      if (filters.dateRange !== "All Time") {
        const requestDate = new Date(request.requestDate)
        const now = new Date()

        if (filters.dateRange === "Last 7 Days") {
          const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
          matchesDateRange = requestDate >= sevenDaysAgo
        } else if (filters.dateRange === "Last 30 Days") {
          const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
          matchesDateRange = requestDate >= thirtyDaysAgo
        } else if (filters.dateRange === "Last 90 Days") {
          const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90))
          matchesDateRange = requestDate >= ninetyDaysAgo
        }
      }

      // New time frame filter (daily/weekly/monthly)
      const matchesTimeFrame = getDateRangeFilter(request)

      return matchesSearch && matchesVenue && matchesStatus && matchesOrganizer && matchesDateRange && matchesTimeFrame
    })
    .sort((a, b) => {
      if (sortConfig.key === "eventName") {
        return sortConfig.direction === "asc"
          ? a.eventName.localeCompare(b.eventName)
          : b.eventName.localeCompare(a.eventName)
      }

      if (sortConfig.key === "venue") {
        return sortConfig.direction === "asc"
          ? (a.venue?.name || "").localeCompare(b.venue?.name || "")
          : (b.venue?.name || "").localeCompare(a.venue?.name || "")
      }

      if (sortConfig.key === "organizer") {
        const aName = `${a.organizer.firstName} ${a.organizer.lastName}`
        const bName = `${b.organizer.firstName} ${b.organizer.lastName}`
        return sortConfig.direction === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName)
      }

      if (sortConfig.key === "attendance") {
        return sortConfig.direction === "asc"
          ? a.expectedAttendance - b.expectedAttendance
          : b.expectedAttendance - a.expectedAttendance
      }

      if (sortConfig.key === "requestDate") {
        return sortConfig.direction === "asc"
          ? new Date(a.requestDate) - new Date(b.requestDate)
          : new Date(b.requestDate) - new Date(a.requestDate)
      }

      return 0
    })

  // Get unique venues and organizers for filters
  const venues = [...new Set(filteredRequests.filter((r) => r.venue).map((r) => r.venue.name))]
  const organizers = [...new Set(filteredRequests.map((r) => `${r.organizer.firstName} ${r.organizer.lastName}`))]

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
  }

  const handleCloseDetails = () => {
    setSelectedRequest(null)
  }

  const handleMarkAsRead = async (requestId, isCurrentlyRead) => {
    try {
      const response = await fetch(`http://localhost:3002/venue-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: !isCurrentlyRead }),
        credentials: "include",
      })

      if (response.ok) {
        // Update local state
        setFilteredRequests(
          filteredRequests.map((req) => (req._id === requestId ? { ...req, isRead: !isCurrentlyRead } : req)),
        )
      } else {
        console.error("Failed to update request status")
      }
    } catch (err) {
      console.error("Error updating request status:", err)
    }
  }

  const handleSendQuotation = async (requestId) => {
    try {
      const quotationResponse = await fetch("http://localhost:3002/venue-request-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venueRequest: requestId,
        }),
        credentials: "include",
      })

      if (!quotationResponse.ok) {
        throw new Error("Failed to send quotation")
      }

      const readResponse = await fetch(`http://localhost:3002/venue-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: true }),
        credentials: "include",
      })

      if (!readResponse.ok) {
        console.error("Failed to mark request as read")
      }

      // Remove the request from the filtered list since it now has a response
      setFilteredRequests(filteredRequests.filter((req) => req._id !== requestId))

      // Close the modal after sending quotation
      setSelectedRequest(null)

      // Optionally show a success message
      alert("Quotation sent successfully!")
    } catch (err) {
      console.error("Error sending quotation:", err)
      alert("Failed to send quotation. Please try again.")
    }
  }

  if (loading) return <div className="loading">Loading venue requests...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="container">
      <header className="header">
        <div className="header-title">
          <h1>Pending Venue Requests</h1>
          <p className="subtitle">Manage and respond to venue booking requests without responses</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-value">{filteredRequests.length}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{filteredRequests.filter((r) => !r.isRead).length}</div>
            <div className="stat-label">Unread</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{filteredRequests.filter((r) => r.isRead).length}</div>
            <div className="stat-label">Reviewed</div>
          </div>
        </div>
      </header>

      <div className="filters-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by event, venue or organizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <div className="select-wrapper">
              <select value={filters.venue} onChange={(e) => setFilters({ ...filters, venue: e.target.value })}>
                <option>All Venues</option>
                {venues.map((venue) => (
                  <option key={venue}>{venue}</option>
                ))}
              </select>
              <Building size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <div className="select-wrapper">
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option>All Status</option>
                <option>Read</option>
                <option>Unread</option>
              </select>
              <Eye size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <div className="select-wrapper">
              <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}>
                <option>All Time</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
              <Calendar size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <div className="select-wrapper">
              <select value={filters.organizer} onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}>
                <option>All Organizers</option>
                {organizers.map((org) => (
                  <option key={org}>{org}</option>
                ))}
              </select>
              <User size={16} className="select-icon" />
            </div>
          </div>
          <div className="filter-group">
            <div className="select-wrapper">
              <select value={filters.timeFrame} onChange={(e) => setFilters({ ...filters, timeFrame: e.target.value })}>
                <option>All Time</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <Calendar size={16} className="select-icon" />
            </div>
          </div>
        </div>
        <div className="view-toggle">
          <button className={`toggle-btn ${viewMode === "card" ? "active" : ""}`} onClick={() => setViewMode("card")}>
            <div className="grid-icon"></div>
            Card View
          </button>
          <button className={`toggle-btn ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")}>
            <div className="table-icon"></div>
            Table View
          </button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="requests-grid">
          {displayedRequests.length === 0 ? (
            <div className="no-results">No pending venue requests match your filters</div>
          ) : (
            displayedRequests.map((request) => (
              <div key={request._id} className={`request-card ${!request.isRead ? "unread" : ""}`}>
                <div className="request-header">
                  <h3 className="event-name">{request.eventName}</h3>
                  <div className="request-actions">
                    <button
                      className="action-btn read-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(request._id, request.isRead)
                      }}
                      title={request.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {request.isRead ? <EyeOff size={16} /> : ""}
                    </button>
                  </div>
                </div>

                <div className="request-venue">
                  <Building size={16} />
                  <span>{request.venue?.name || "No venue"}</span>
                </div>

                <div className="request-location">
                  <MapPin size={16} />
                  <span>{request.venue?.location || "No location"}</span>
                </div>

                <div className="request-dates">
                  <CalendarDays size={16} />
                  <span>
                    {request.eventDates.length > 0 ? (
                      <>
                        {formatDate(request.eventDates[0])}
                        {request.eventDates.length > 1 && (
                          <span className="date-count">+{request.eventDates.length - 1}</span>
                        )}
                      </>
                    ) : (
                      "No dates specified"
                    )}
                  </span>
                </div>

                <div className="request-attendance">
                  <Users size={16} />
                  <span>{request.expectedAttendance.toLocaleString()} attendees</span>
                </div>

                <div className="request-organizer">
                  <User size={16} />
                  <span>
                    {request.organizer.firstName} {request.organizer.lastName}
                  </span>
                </div>

                <div className="request-time">
                  <Clock size={16} />
                  <span>
                    Requested on {formatDate(request.requestDate)} at {formatTime(request.requestDate)}
                  </span>
                </div>

                <div className="request-description">
                  <p>{request.eventDescription.substring(0, 120)}...</p>
                </div>

                <div className="request-footer">
                  <button className="btn-view" onClick={() => handleViewRequest(request)}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th className="status-col"></th>
                <th className="sortable">
                  <div className="th-content" onClick={() => handleSort("eventName")}>
                    <span>Event</span>
                    {sortConfig.key === "eventName" && (
                      <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="sortable">
                  <div className="th-content" onClick={() => handleSort("venue")}>
                    <span>Venue</span>
                    {sortConfig.key === "venue" && (
                      <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th>Event Dates</th>
                <th className="sortable">
                  <div className="th-content" onClick={() => handleSort("attendance")}>
                    <span>Attendees</span>
                    {sortConfig.key === "attendance" && (
                      <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="sortable">
                  <div className="th-content" onClick={() => handleSort("organizer")}>
                    <span>Organizer</span>
                    {sortConfig.key === "organizer" && (
                      <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="sortable">
                  <div className="th-content" onClick={() => handleSort("requestDate")}>
                    <span>Request Date</span>
                    {sortConfig.key === "requestDate" && (
                      <span className="sort-icon">
                        {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-results-cell">
                    No pending venue requests match your filters
                  </td>
                </tr>
              ) : (
                displayedRequests.map((request) => (
                  <tr key={request._id} className={!request.isRead ? "unread-row" : ""}>
                    <td className="status-col">{!request.isRead && <div className="unread-indicator"></div>}</td>
                    <td>{request.eventName}</td>
                    <td>{request.venue?.name || "No venue"}</td>
                    <td>
                      {request.eventDates.length > 0 ? (
                        <>
                          {formatDate(request.eventDates[0])}
                          {request.eventDates.length > 1 && (
                            <span className="date-count">+{request.eventDates.length - 1}</span>
                          )}
                        </>
                      ) : (
                        "No dates specified"
                      )}
                    </td>
                    <td>{request.expectedAttendance.toLocaleString()}</td>
                    <td>
                      <div className="organizer-cell">
                        <div className="avatar">
                          {request.organizer.firstName.charAt(0)}
                          {request.organizer.lastName.charAt(0)}
                        </div>
                        <span>
                          {request.organizer.firstName} {request.organizer.lastName}
                        </span>
                      </div>
                    </td>
                    <td>{formatDate(request.requestDate)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn read-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(request._id, request.isRead)
                          }}
                          title={request.isRead ? "Mark as unread" : "Mark as read"}
                        >
                          {request.isRead ? <EyeOff size={16} /> : " "}
                        </button>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewRequest(request)}
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedRequest && (
        <div className="request-details-overlay">
          <div className="request-details-modal">
            <div className="modal-header">
              <h2>{selectedRequest.eventName}</h2>
              <button className="close-btn" onClick={handleCloseDetails}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h3>Event Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Event Name</span>
                    <span className="detail-value">{selectedRequest.eventName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description</span>
                    <span className="detail-value">{selectedRequest.eventDescription}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expected Attendance</span>
                    <span className="detail-value">{selectedRequest.expectedAttendance.toLocaleString()} people</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Request Date</span>
                    <span className="detail-value">
                      {formatDate(selectedRequest.requestDate)} at {formatTime(selectedRequest.requestDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Venue Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Venue Name</span>
                    <span className="detail-value">{selectedRequest.venue?.name || "No venue"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{selectedRequest.venue?.location || "No location"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Capacity</span>
                    <span className="detail-value">
                      {selectedRequest.venue?.capacity?.toLocaleString() || "N/A"} people
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Event Dates</h3>
                <div className="dates-list">
                  {selectedRequest.eventDates.map((date, index) => (
                    <div key={index} className="date-item">
                      <Calendar size={16} />
                      <span>{formatDate(date)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Organizer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name</span>
                    <span className="detail-value">
                      {selectedRequest.organizer.firstName} {selectedRequest.organizer.lastName}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Organization</span>
                    <span className="detail-value">{selectedRequest.organizer.organizationName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{selectedRequest.organizer.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{selectedRequest.organizer.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Additional Requests</h3>
                <div className="additional-requests">
                  <p>{selectedRequest.additionalRequests || "None"}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-reject" onClick={handleCloseDetails}>
                <XCircle size={16} />
                Cancel
              </button>
              <button className="btn-quotation" onClick={() => handleSendQuotation(selectedRequest._id)}>
                <FileText size={16} />
                Send Quotation
              </button>
              <button
                className="btn-approve"
                onClick={() => {
                  handleMarkAsRead(selectedRequest._id, false)
                  handleCloseDetails()
                }}
              >
                <CheckCircle size={16} />
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          color: #1e293b;
        }

        .loading, .error {
          text-align: center;
          padding: 3rem;
          font-size: 1.125rem;
          color: #64748b;
        }

        .error {
          color: #ef4444;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-title h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #64748b;
          font-size: 1rem;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        .filters-section {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-container input {
          width: 80%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .filters-container {
          display: flex;
          gap: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .select-wrapper {
          position: relative;
        }

        .select-wrapper select {
          appearance: none;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          min-width: 150px;
          cursor: pointer;
        }

        .select-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .request-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 4px solid transparent;
        }

        .request-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .request-card.unread {
          border-left-color: #3b82f6;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .event-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: background-color 0.2s;
        }

        .action-btn:hover {
          background-color: #f1f5f9;
        }

        .request-venue,
        .request-location,
        .request-dates,
        .request-attendance,
        .request-organizer,
        .request-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #475569;
        }

        .date-count {
          margin-left: 0.5rem;
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .request-description {
          margin: 1rem 0;
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
        }

        .request-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .btn-view {
          background: #f8fafc;
          color: #0f172a;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-view:hover {
          background: #f1f5f9;
        }

        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: #64748b;
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .request-details-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .request-details-modal {
          background: white;
          border-radius: 0.75rem;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #64748b;
          cursor: pointer;
        }

        .modal-content {
          padding: 1.5rem;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 0.875rem;
          color: #0f172a;
        }

        .dates-list {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .date-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f8fafc;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #0f172a;
        }

        .additional-requests {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #0f172a;
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-approve,
        .btn-reject,
        .btn-quotation {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-approve {
          background: #10b981;
          color: white;
          border: none;
        }

        .btn-approve:hover {
          background: #059669;
        }

        .btn-reject {
          background: white;
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        .btn-reject:hover {
          background: #fef2f2;
        }

        .btn-quotation {
          background: #6366f1;
          color: white;
          border: none;
        }

        .btn-quotation:hover {
          background: #4f46e5;
        }

        .view-toggle {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toggle-btn.active {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .grid-icon,
        .table-icon {
          width: 16px;
          height: 16px;
          position: relative;
        }

        .grid-icon:before,
        .grid-icon:after {
          content: "";
          position: absolute;
          background: currentColor;
        }

        .grid-icon:before {
          width: 7px;
          height: 7px;
          top: 0;
          left: 0;
          box-shadow: 9px 0 0 0 currentColor, 0 9px 0 0 currentColor, 9px 9px 0 0 currentColor;
        }

        .table-icon:before,
        .table-icon:after {
          content: "";
          position: absolute;
          background: currentColor;
        }

        .table-icon:before {
          width: 16px;
          height: 2px;
          top: 0;
          left: 0;
          box-shadow: 0 7px 0 0 currentColor, 0 14px 0 0 currentColor;
        }

        .table-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          overflow-x: auto;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
          white-space: nowrap;
        }

        .requests-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          height: 3.5rem;
          vertical-align: middle;
        }

        .requests-table th.sortable {
          cursor: pointer;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
        }

        .sort-icon {
          display: inline-flex;
          align-items: center;
        }

        .status-col {
          width: 8px;
          padding: 0 !important;
        }

        .unread-indicator {
          width: 8px;
          height: 100%;
          background: #3b82f6;
        }

        .unread-row {
          background-color: #f8fafc;
        }

        .organizer-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }

        .no-results-cell {
          text-align: center;
          padding: 3rem !important;
          color: #64748b;
        }

        .requests-table td {
          padding: 1.5rem 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
          height: 4.5rem;
          vertical-align: middle;
        }

        @media (max-width: 768px) {
          .view-toggle {
            width: 100%;
            margin-top: 1rem;
          }

          .toggle-btn {
            flex: 1;
            justify-content: center;
          }
          
          .container {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-stats {
            width: 100%;
            justify-content: space-between;
          }

          .filters-container {
            flex-direction: column;
            width: 100%;
          }

          .filter-group {
            width: 100%;
          }

          .select-wrapper select {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .stat-item {
            flex: 1;
          }

          .date-item {
            width: 100%;
          }

          .modal-footer {
            flex-direction: column;
          }

          .btn-approve,
          .btn-reject,
          .btn-quotation {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}

