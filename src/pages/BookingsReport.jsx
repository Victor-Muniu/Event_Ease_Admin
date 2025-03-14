import { useState, useEffect } from "react"
import {
  Search,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  BarChart4,
  FileText,
  FileSpreadsheet,
  FileIcon as FilePdf,
} from "lucide-react"

export default function BookingsReport() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "All",
    organizer: "All",
    dateRange: "All Time",
  })
  const [expandedBooking, setExpandedBooking] = useState(null)
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  })
  const [showExportOptions, setShowExportOptions] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3002/bookings")
      const data = await response.json()

      setBookings(Array.isArray(data) ? data : [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings data")
      setLoading(false)
      setBookings([])
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "completed"
      case "tentative":
        return "tentative"
      case "cancelled":
        return "cancelled"
      default:
        return "default"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPaymentProgress = (amountPaid, totalAmount) => {
    if (totalAmount === 0) return 0
    return (amountPaid / totalAmount) * 100
  }

  const toggleExpandBooking = (id) => {
    if (expandedBooking === id) {
      setExpandedBooking(null)
    } else {
      setExpandedBooking(id)
    }
  }

  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Export data as PDF
  const exportPDF = () => {
    // In a real implementation, we would use a library like jsPDF
    // This is a simplified version for demonstration
    const content = document.querySelector(".bookings-table-container").innerHTML
    const style = `
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background-color: #f8fafc; }
        .status-badge { padding: 4px 8px; border-radius: 9999px; font-size: 12px; }
        .status-badge.completed { background: #dcfce7; color: #166534; }
        .status-badge.tentative { background: #fef3c7; color: #92400e; }
        .status-badge.cancelled { background: #fee2e2; color: #b91c1c; }
      </style>
    `

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <html>
        <head>
          <title>Bookings Report</title>
          ${style}
        </head>
        <body>
          <h1>Bookings Report</h1>
          ${content}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  // Export data as Excel (CSV format)
  const exportExcel = () => {
    // Create CSV content
    const headers = ["Event", "Venue", "Organizer", "Dates", "Amount", "Payment %", "Status", "Created"]

    const rows = filteredBookings.map((booking) => [
      booking.response.venueRequest.eventName,
      booking.response.venueRequest.venue?.name || "No venue",
      `${booking.organizer.firstName} ${booking.organizer.lastName}`,
      booking.response.venueRequest.eventDates.length > 0
        ? formatDate(booking.response.venueRequest.eventDates[0])
        : "",
      booking.response.totalAmount,
      getPaymentProgress(booking.amountPaid, booking.response.totalAmount).toFixed(0) + "%",
      booking.status,
      formatDate(booking.createdAt),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `bookings_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Generate a detailed report
  const generateReport = () => {
    // Calculate additional statistics
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.response.totalAmount, 0)
    const totalPaid = bookings.reduce((sum, booking) => sum + booking.amountPaid, 0)
    const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0

    // Create report content
    const reportContent = `
      <div class="report-container">
        <h1>Detailed Bookings Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-item">
            <h3>Total Bookings</h3>
            <p>${bookingStats.total}</p>
          </div>
          <div class="summary-item">
            <h3>Completed</h3>
            <p>${bookingStats.completed} (${((bookingStats.completed / bookingStats.total) * 100).toFixed(1)}%)</p>
          </div>
          <div class="summary-item">
            <h3>Tentative</h3>
            <p>${bookingStats.tentative} (${((bookingStats.tentative / bookingStats.total) * 100).toFixed(1)}%)</p>
          </div>
          <div class="summary-item">
            <h3>Cancelled</h3>
            <p>${bookingStats.cancelled} (${((bookingStats.cancelled / bookingStats.total) * 100).toFixed(1)}%)</p>
          </div>
          <div class="summary-item">
            <h3>Total Revenue</h3>
            <p>${formatCurrency(totalRevenue)}</p>
          </div>
          <div class="summary-item">
            <h3>Total Collected</h3>
            <p>${formatCurrency(totalPaid)}</p>
          </div>
          <div class="summary-item">
            <h3>Average Booking Value</h3>
            <p>${formatCurrency(averageBookingValue)}</p>
          </div>
        </div>
        
        <h2>Bookings</h2>
        <table class="report-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Venue</th>
              <th>Organizer</th>
              <th>Dates</th>
              <th>Amount</th>
              <th>Payment %</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings
              .map(
                (booking) => `
              <tr>
                <td>${booking.response.venueRequest.eventName}</td>
                <td>${booking.response.venueRequest.venue?.name || "No venue"}</td>
                <td>${booking.organizer.firstName} ${booking.organizer.lastName}</td>
                <td>${
                  booking.response.venueRequest.eventDates.length > 0
                    ? formatDate(booking.response.venueRequest.eventDates[0])
                    : ""
                }</td>
                <td>${formatCurrency(booking.response.totalAmount)}</td>
                <td>${getPaymentProgress(booking.amountPaid, booking.response.totalAmount).toFixed(0)}%</td>
                <td>${booking.status}</td>
                <td>${formatDate(booking.createdAt)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `

    // Add styles
    const style = `
      <style>
        .report-container { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #0f172a; }
        h2 { color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-item { background: #f8fafc; padding: 15px; border-radius: 8px; }
        .summary-item h3 { margin: 0 0 10px 0; font-size: 14px; color: #64748b; }
        .summary-item p { margin: 0; font-size: 18px; font-weight: bold; color: #0f172a; }
        .report-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .report-table th, .report-table td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        .report-table th { background: #f8fafc; font-weight: bold; }
        .report-table tr:nth-child(even) { background: #f8fafc; }
      </style>
    `

    // Open in new window
    const reportWindow = window.open("", "_blank")
    reportWindow.document.write(`
      <html>
        <head>
          <title>Detailed Bookings Report</title>
          ${style}
        </head>
        <body>
          ${reportContent}
        </body>
      </html>
    `)

    reportWindow.document.close()
    reportWindow.focus()
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortConfig.key === "organizer") {
      const aValue = `${a.organizer.firstName} ${a.organizer.lastName}`
      const bValue = `${b.organizer.firstName} ${b.organizer.lastName}`
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (sortConfig.key === "eventName") {
      const aValue = a.response.venueRequest.eventName
      const bValue = b.response.venueRequest.eventName
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (sortConfig.key === "venue") {
      const aValue = a.response.venueRequest.venue?.name || ""
      const bValue = b.response.venueRequest.venue?.name || ""
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (sortConfig.key === "totalAmount") {
      return sortConfig.direction === "asc"
        ? a.response.totalAmount - b.response.totalAmount
        : b.response.totalAmount - a.response.totalAmount
    }

    if (sortConfig.key === "createdAt") {
      return sortConfig.direction === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt)
    }

    return 0
  })

  const filteredBookings = sortedBookings.filter((booking) => {
    // Search term filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      booking.response.venueRequest.eventName.toLowerCase().includes(searchLower) ||
      (booking.response.venueRequest.venue?.name || "").toLowerCase().includes(searchLower) ||
      `${booking.organizer.firstName} ${booking.organizer.lastName}`.toLowerCase().includes(searchLower)

    // Status filter
    const matchesStatus = filters.status === "All" || booking.status.toLowerCase() === filters.status.toLowerCase()

    // Organizer filter
    const matchesOrganizer =
      filters.organizer === "All" ||
      `${booking.organizer.firstName} ${booking.organizer.lastName}` === filters.organizer

    // Date range filter
    let matchesDateRange = true
    if (filters.dateRange !== "All Time") {
      const bookingDate = new Date(booking.createdAt)
      const now = new Date()

      if (filters.dateRange === "Last 7 Days") {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
        matchesDateRange = bookingDate >= sevenDaysAgo
      } else if (filters.dateRange === "Last 30 Days") {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
        matchesDateRange = bookingDate >= thirtyDaysAgo
      } else if (filters.dateRange === "Last 90 Days") {
        const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90))
        matchesDateRange = bookingDate >= ninetyDaysAgo
      }
    }

    return matchesSearch && matchesStatus && matchesOrganizer && matchesDateRange
  })

  // Calculate summary statistics
  const bookingStats = {
    total: bookings?.length || 0,
    completed: bookings?.filter((b) => b?.status?.toLowerCase() === "confirmed")?.length || 0,
    tentative: bookings?.filter((b) => b?.status?.toLowerCase() === "tentative")?.length || 0,
    cancelled: bookings?.filter((b) => b?.status?.toLowerCase() === "cancelled")?.length || 0,
    totalValue:
      bookings
        ?.filter((b) => b?.status?.toLowerCase() === "confirmed")
        ?.reduce((sum, booking) => sum + (booking?.response?.totalAmount || 0), 0) || 0,
  }

  // Get unique organizers for filter
  const organizers = [
    ...new Set(
      bookings?.map((b) => (b?.organizer ? `${b.organizer.firstName} ${b.organizer.lastName}` : ""))?.filter(Boolean) ||
        [],
    ),
  ]

  if (loading) return <div className="loading">Loading bookings data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="container">
      <header className="header">
        <div className="header-title">
          <h1>Bookings Report</h1>
          <p className="subtitle">Track and analyze all venue bookings</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={generateReport}>
            <FileText size={16} />
            Generate Report
          </button>
          <div className="export-dropdown">
            <button className="btn-primary" onClick={() => setShowExportOptions(!showExportOptions)}>
              <Download size={16} />
              Export Data
              <ChevronDown size={14} className="ml-1" />
            </button>
            {showExportOptions && (
              <div className="export-options">
                <button onClick={exportExcel}>
                  <FileSpreadsheet size={16} />
                  Export as Excel
                </button>
                <button onClick={exportPDF}>
                  <FilePdf size={16} />
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <BarChart4 size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{bookingStats.total}</p>
            <div className="stat-bar">
              <div
                className="stat-bar-segment completed"
                style={{ width: `${(bookingStats.completed / bookingStats.total) * 100}%` }}
              ></div>
              <div
                className="stat-bar-segment tentative"
                style={{ width: `${(bookingStats.tentative / bookingStats.total) * 100}%` }}
              ></div>
              <div
                className="stat-bar-segment cancelled"
                style={{ width: `${(bookingStats.cancelled / bookingStats.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-value">{bookingStats.completed}</p>
            <p className="stat-percent">{((bookingStats.completed / bookingStats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tentative">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Tentative</h3>
            <p className="stat-value">{bookingStats.tentative}</p>
            <p className="stat-percent">{((bookingStats.tentative / bookingStats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cancelled">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Cancelled</h3>
            <p className="stat-value">{bookingStats.cancelled}</p>
            <p className="stat-percent">{((bookingStats.cancelled / bookingStats.total) * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">{formatCurrency(bookingStats.totalValue)}</p>
          </div>
        </div>
      </div>

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
            <label>Status</label>
            <div className="select-wrapper">
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option>All</option>
                <option>Confirmed</option>
                <option>Tentative</option>
                <option>Cancelled</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Organizer</label>
            <div className="select-wrapper">
              <select value={filters.organizer} onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}>
                <option>All</option>
                {organizers.map((org) => (
                  <option key={org}>{org}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <div className="select-wrapper">
              <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}>
                <option>All Time</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("eventName")} className="sortable">
                Event
                {sortConfig.key === "eventName" &&
                  (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </th>
              <th onClick={() => handleSort("venue")} className="sortable">
                Venue
                {sortConfig.key === "venue" &&
                  (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </th>
              <th onClick={() => handleSort("organizer")} className="sortable">
                Organizer
                {sortConfig.key === "organizer" &&
                  (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </th>
              <th>Dates</th>
              <th onClick={() => handleSort("totalAmount")} className="sortable">
                Amount
                {sortConfig.key === "totalAmount" &&
                  (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </th>
              <th>Payment</th>
              <th>Status</th>
              <th onClick={() => handleSort("createdAt")} className="sortable">
                Created
                {sortConfig.key === "createdAt" &&
                  (sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-results">
                  No bookings match your filters
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <>
                  <tr
                    key={booking._id}
                    className={expandedBooking === booking._id ? "expanded" : ""}
                    onClick={() => toggleExpandBooking(booking._id)}
                  >
                    <td className="event-name">{booking.response.venueRequest.eventName}</td>
                    <td>{booking.response.venueRequest.venue?.name || "No venue"}</td>
                    <td>
                      <div className="organizer">
                        <div className="avatar">
                          {booking.organizer.firstName.charAt(0)}
                          {booking.organizer.lastName.charAt(0)}
                        </div>
                        <span>
                          {booking.organizer.firstName} {booking.organizer.lastName}
                        </span>
                      </div>
                    </td>
                    <td>
                      {booking.response.venueRequest.eventDates.length > 0 && (
                        <>
                          {formatDate(booking.response.venueRequest.eventDates[0])}
                          {booking.response.venueRequest.eventDates.length > 1 && (
                            <span className="date-count">+{booking.response.venueRequest.eventDates.length - 1}</span>
                          )}
                        </>
                      )}
                    </td>
                    <td>{formatCurrency(booking.response.totalAmount)}</td>
                    <td>
                      <div className="payment-progress">
                        <div
                          className="progress-bar"
                          style={{ width: `${getPaymentProgress(booking.amountPaid, booking.response.totalAmount)}%` }}
                        ></div>
                        <span className="progress-text">
                          {getPaymentProgress(booking.amountPaid, booking.response.totalAmount).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </td>
                    <td>{formatDate(booking.createdAt)}</td>
                  </tr>
                  {expandedBooking === booking._id && (
                    <tr className="details-row">
                      <td colSpan={8}>
                        <div className="booking-details">
                          <div className="details-grid">
                            <div className="detail-group">
                              <h4>Event Details</h4>
                              <p>
                                <strong>Name:</strong> {booking.response.venueRequest.eventName}
                              </p>
                              <p>
                                <strong>Description:</strong> {booking.response.venueRequest.eventDescription}
                              </p>
                              <p>
                                <strong>Expected Attendance:</strong>{" "}
                                {booking.response.venueRequest.expectedAttendance.toLocaleString()} people
                              </p>
                              <p>
                                <strong>Additional Requests:</strong> {booking.response.venueRequest.additionalRequests}
                              </p>
                            </div>

                            <div className="detail-group">
                              <h4>Venue Information</h4>
                              <p>
                                <strong>Name:</strong> {booking.response.venueRequest.venue?.name || "No venue"}
                              </p>
                              <p>
                                <strong>Location:</strong>{" "}
                                {booking.response.venueRequest.venue?.location || "No location"}
                              </p>
                              <p>
                                <strong>Capacity:</strong>{" "}
                                {booking.response.venueRequest.venue?.capacity?.toLocaleString() || "N/A"} people
                              </p>
                              <p>
                                <strong>Amenities:</strong>{" "}
                                {booking.response.venueRequest.venue?.amenities?.join(", ") || "None"}
                              </p>
                            </div>

                            <div className="detail-group">
                              <h4>Booking Dates</h4>
                              <ul className="dates-list">
                                {booking.response.dailyRates.map((rate, index) => (
                                  <li key={index}>
                                    <span>{formatDate(rate.date)}</span>
                                    <span>{formatCurrency(rate.price)}</span>
                                  </li>
                                ))}
                              </ul>
                              <p className="total-amount">
                                <strong>Total:</strong> {formatCurrency(booking.response.totalAmount)}
                              </p>
                            </div>

                            <div className="detail-group">
                              <h4>Organizer Information</h4>
                              <p>
                                <strong>Name:</strong> {booking.organizer.firstName} {booking.organizer.lastName}
                              </p>
                              <p>
                                <strong>Organization:</strong> {booking.organizer.organizationName}
                              </p>
                              <p>
                                <strong>Email:</strong> {booking.organizer.email}
                              </p>
                              <p>
                                <strong>Phone:</strong> {booking.organizer.phone}
                              </p>
                              <p>
                                <strong>Address:</strong> {booking.organizer.address}
                              </p>
                            </div>
                          </div>

                          <div className="details-actions">
                            <button className="btn-secondary">
                              <FileText size={14} />
                              Generate Invoice
                            </button>
                            <button className="btn-primary">Update Status</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          align-items: flex-start;
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

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary {
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

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f8fafc;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          color: white;
        }

        .stat-icon.total {
          background: #6366f1;
        }

        .stat-icon.completed {
          background: #10b981;
        }

        .stat-icon.tentative {
          background: #f59e0b;
        }

        .stat-icon.cancelled {
          background: #ef4444;
        }

        .stat-icon.revenue {
          background: #3b82f6;
        }

        .stat-content h3 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .stat-percent {
          font-size: 0.875rem;
          color: #64748b;
        }

        .stat-bar {
          height: 0.5rem;
          background: #f1f5f9;
          border-radius: 999px;
          display: flex;
          overflow: hidden;
          margin-top: 0.75rem;
        }

        .stat-bar-segment {
          height: 100%;
        }

        .stat-bar-segment.completed {
          background: #10b981;
        }

        .stat-bar-segment.tentative {
          background: #f59e0b;
        }

        .stat-bar-segment.cancelled {
          background: #ef4444;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .chart-placeholder {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 0.5rem;
        }

        .chart-icon {
          color: #cbd5e1;
        }

        .filters-section {
          display: flex;
          align-items: flex-end;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-container input {
          width: 90%;
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
          gap: 0.5rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
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

        .bookings-table-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .bookings-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .bookings-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
          position: relative;
        }

        .bookings-table th.sortable {
          cursor: pointer;
          padding-right: 1.5rem;
        }

        .bookings-table th.sortable svg {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .bookings-table td {
          padding: 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bookings-table tr {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .bookings-table tr:hover {
          background-color: #f8fafc;
        }

        .bookings-table tr.expanded {
          background-color: #f1f5f9;
        }

        .event-name {
          font-weight: 500;
          color: #0f172a;
        }

        .organizer {
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

        .date-count {
          margin-left: 0.5rem;
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 999px;
          font-size: 0.75rem;
          color: #64748b;
        }

        .payment-progress {
          position: relative;
          height: 0.5rem;
          background: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
          width: 100%;
        }

        .progress-bar {
          height: 100%;
          background: #3b82f6;
        }

        .progress-text {
          position: absolute;
          right: 0;
          top: 0.625rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.tentative {
          background: #fef3c7;
          color: #92400e;
        }

        .status-badge.cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        .status-badge.default {
          background: #e2e8f0;
          color: #475569;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }

        .details-row {
          background: #f8fafc;
        }

        .booking-details {
          padding: 1.5rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .detail-group h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-group p {
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .dates-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1rem 0;
        }

        .dates-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 0.875rem;
        }

        .total-amount {
          text-align: right;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .details-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .chart-grid {
            grid-template-columns: 1fr;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filters-container {
            flex-direction: row;
            flex-wrap: wrap;
            width: 100%;
          }

          .filter-group {
            flex: 1;
            min-width: 150px;
          }

          .select-wrapper select {
            width: 100%;
          }

          .bookings-table-container {
            overflow-x: auto;
          }

          .bookings-table {
            min-width: 900px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters-container {
            flex-direction: column;
          }
        }

        .export-dropdown {
          position: relative;
        }

        .export-options {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 10;
          min-width: 180px;
          overflow: hidden;
        }

        .export-options button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          font-size: 0.875rem;
          color: #0f172a;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .export-options button:hover {
          background: #f8fafc;
        }

        .ml-1 {
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  )
}

