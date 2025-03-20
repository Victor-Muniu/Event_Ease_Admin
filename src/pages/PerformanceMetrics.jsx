import { useState, useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Calendar,
  Users,
  Building,
  DollarSign,
  Filter,
  TrendingUp,
  Download,
  RefreshCw,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCcw,
} from "lucide-react"

export default function PerformanceMetrics() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    organizer: "All Organizers",
    venue: "All Venues",
    dateRange: "All Time",
    status: "All Status",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [exchangeRate, setExchangeRate] = useState(null)
  const [exchangeRateLoading, setExchangeRateLoading] = useState(true)
  const [exchangeRateError, setExchangeRateError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchExchangeRate()
    fetchBookings()
  }, [])

  const fetchExchangeRate = async () => {
    try {
      setExchangeRateLoading(true)
      // Using a free currency API - in production, you might want to use a more reliable service
      const response = await fetch("https://open.er-api.com/v6/latest/THB")
      const data = await response.json()

      if (data && data.rates && data.rates.KES) {
        setExchangeRate(data.rates.KES)
        setLastUpdated(new Date())
      } else {
        // Fallback rate in case API fails
        setExchangeRate(0.37) // Example fallback rate: 1 THB = 0.37 KSH
        setExchangeRateError("Could not fetch current exchange rate, using fallback rate")
      }
    } catch (err) {
      console.error("Error fetching exchange rate:", err)
      // Fallback rate in case API fails
      setExchangeRate(0.37) // Example fallback rate: 1 THB = 0.37 KSH
      setExchangeRateError("Could not fetch current exchange rate, using fallback rate")
    } finally {
      setExchangeRateLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3002/bookings")
      const data = await response.json()
      setBookings(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load booking data")
      setLoading(false)
    }
  }

  // Convert THB to KSH
  const convertCurrency = (thbAmount) => {
    if (exchangeRate === null) return thbAmount // Return original if rate not loaded
    return thbAmount * exchangeRate
  }

  // Extract unique organizers, venues, and statuses for filters
  const organizers = useMemo(() => {
    const uniqueOrganizers = [
      ...new Set(bookings.map((booking) => `${booking.organizer.firstName} ${booking.organizer.lastName}`)),
    ]
    return ["All Organizers", ...uniqueOrganizers]
  }, [bookings])

  const venues = useMemo(() => {
    const uniqueVenues = [
      ...new Set(bookings.map((booking) => booking.response.venueRequest.venue?.name).filter(Boolean)),
    ]
    return ["All Venues", ...uniqueVenues]
  }, [bookings])

  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(bookings.map((booking) => booking.status))]
    return ["All Status", ...uniqueStatuses]
  }, [bookings])

  // Apply filters to bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const organizerName = `${booking.organizer.firstName} ${booking.organizer.lastName}`
      const venueName = booking.response.venueRequest.venue?.name || "No Venue"
      const bookingStatus = booking.status

      const matchesOrganizer = filters.organizer === "All Organizers" || organizerName === filters.organizer
      const matchesVenue = filters.venue === "All Venues" || venueName === filters.venue
      const matchesStatus = filters.status === "All Status" || bookingStatus === filters.status

      // Search term filtering
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        organizerName.toLowerCase().includes(searchLower) ||
        venueName.toLowerCase().includes(searchLower) ||
        booking.response.venueRequest.eventName.toLowerCase().includes(searchLower)

      return matchesOrganizer && matchesVenue && matchesStatus && matchesSearch
    })
  }, [bookings, filters, searchTerm])

  // Calculate summary metrics with currency conversion
  const summaryMetrics = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        totalBookings: 0,
        confirmedBookings: 0,
        tentativeBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
      }
    }

    const confirmed = filteredBookings.filter((booking) => booking.status === "Confirmed").length
    const tentative = filteredBookings.filter((booking) => booking.status === "Tentative").length
    const cancelled = filteredBookings.filter((booking) => booking.status === "Cancelled").length

    // Convert THB to KSH for revenue calculations
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + convertCurrency(booking.amountPaid), 0)

    return {
      totalBookings: filteredBookings.length,
      confirmedBookings: confirmed,
      tentativeBookings: tentative,
      cancelledBookings: cancelled,
      totalRevenue: totalRevenue,
      averageBookingValue: totalRevenue / filteredBookings.length,
    }
  }, [filteredBookings, exchangeRate])

  // Prepare data for charts with currency conversion
  const venueBookingsData = useMemo(() => {
    const venueCount = {}

    filteredBookings.forEach((booking) => {
      const venueName = booking.response.venueRequest.venue?.name || "No Venue"
      venueCount[venueName] = (venueCount[venueName] || 0) + 1
    })

    return Object.entries(venueCount)
      .map(([name, count]) => ({
        name,
        bookings: count,
      }))
      .sort((a, b) => b.bookings - a.bookings)
  }, [filteredBookings])

  const monthlyBookingsData = useMemo(() => {
    const monthlyData = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize all months with zero
    months.forEach((month) => {
      monthlyData[month] = { confirmed: 0, tentative: 0, cancelled: 0, total: 0 }
    })

    filteredBookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const month = months[date.getMonth()]
      const status = booking.status.toLowerCase()

      monthlyData[month][status] = (monthlyData[month][status] || 0) + 1
      monthlyData[month].total += 1
    })

    return months.map((month) => ({
      name: month,
      confirmed: monthlyData[month].confirmed,
      tentative: monthlyData[month].tentative,
      cancelled: monthlyData[month].cancelled || 0,
      total: monthlyData[month].total,
    }))
  }, [filteredBookings])

  const statusDistributionData = useMemo(() => {
    const confirmed = filteredBookings.filter((booking) => booking.status === "Confirmed").length
    const tentative = filteredBookings.filter((booking) => booking.status === "Tentative").length
    const cancelled = filteredBookings.filter((booking) => booking.status === "Cancelled").length

    return [
      { name: "Confirmed", value: confirmed, color: "#10b981" },
      { name: "Tentative", value: tentative, color: "#f59e0b" },
      { name: "Cancelled", value: cancelled, color: "#ef4444" },
    ].filter((item) => item.value > 0)
  }, [filteredBookings])

  const organizerPerformanceData = useMemo(() => {
    const organizerStats = {}

    filteredBookings.forEach((booking) => {
      const organizerName = `${booking.organizer.firstName} ${booking.organizer.lastName}`

      if (!organizerStats[organizerName]) {
        organizerStats[organizerName] = {
          name: organizerName,
          bookings: 0,
          revenue: 0,
          confirmed: 0,
          tentative: 0,
          cancelled: 0,
        }
      }

      organizerStats[organizerName].bookings += 1
      // Convert THB to KSH for revenue
      organizerStats[organizerName].revenue += convertCurrency(booking.amountPaid)

      if (booking.status === "Confirmed") {
        organizerStats[organizerName].confirmed += 1
      } else if (booking.status === "Tentative") {
        organizerStats[organizerName].tentative += 1
      } else if (booking.status === "Cancelled") {
        organizerStats[organizerName].cancelled += 1
      }
    })

    return Object.values(organizerStats).sort((a, b) => b.bookings - a.bookings)
  }, [filteredBookings, exchangeRate])

  const revenueByVenueData = useMemo(() => {
    const venueRevenue = {}

    filteredBookings.forEach((booking) => {
      const venueName = booking.response.venueRequest.venue?.name || "No Venue"

      if (!venueRevenue[venueName]) {
        venueRevenue[venueName] = 0
      }

      // Convert THB to KSH for revenue
      venueRevenue[venueName] += convertCurrency(booking.amountPaid)
    })

    return Object.entries(venueRevenue)
      .map(([name, revenue]) => ({
        name,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredBookings, exchangeRate])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const refreshData = () => {
    fetchExchangeRate()
    fetchBookings()
  }

  if (loading || exchangeRateLoading) return <div className="loading">Loading performance metrics...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="metrics-container">
      <header className="metrics-header">
        <div className="header-title">
          <h1>Performance Metrics</h1>
          <p className="subtitle">Analyze booking trends, venue popularity, and revenue</p>
          {exchangeRate && (
            <div className="exchange-rate-info">
              <span>Exchange Rate: 1 THB = {exchangeRate.toFixed(4)} KSH</span>
              {lastUpdated && <span> • Last updated: {lastUpdated.toLocaleTimeString()}</span>}
              <button className="refresh-rate-btn" onClick={fetchExchangeRate} title="Refresh exchange rate">
                <RefreshCcw size={14} />
              </button>
              {exchangeRateError && <div className="exchange-rate-error">{exchangeRateError}</div>}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button className="action-button refresh" onClick={refreshData}>
            <RefreshCw size={16} />
            <span>Refresh Data</span>
          </button>
          <button className="action-button export">
            <Download size={16} />
            <span>Export Report</span>
          </button>
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
            <label>Organizer</label>
            <div className="select-wrapper">
              <select value={filters.organizer} onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}>
                {organizers.map((organizer) => (
                  <option key={organizer} value={organizer}>
                    {organizer}
                  </option>
                ))}
              </select>
              <User size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Venue</label>
            <div className="select-wrapper">
              <select value={filters.venue} onChange={(e) => setFilters({ ...filters, venue: e.target.value })}>
                {venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </select>
              <Building size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <div className="select-wrapper">
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Filter size={16} className="select-icon" />
            </div>
          </div>

          <div className="filter-group">
            <label>Date Range</label>
            <div className="select-wrapper">
              <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}>
                <option value="All Time">All Time</option>
                <option value="This Month">This Month</option>
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="This Year">This Year</option>
              </select>
              <Calendar size={16} className="select-icon" />
            </div>
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon bookings">
            <Calendar size={24} />
          </div>
          <div className="card-content">
            <h3>Total Bookings</h3>
            <div className="card-value">{summaryMetrics.totalBookings}</div>
            <div className="card-breakdown">
              <div className="breakdown-item">
                <CheckCircle size={14} className="confirmed" />
                <span>Confirmed: {summaryMetrics.confirmedBookings}</span>
              </div>
              <div className="breakdown-item">
                <AlertCircle size={14} className="tentative" />
                <span>Tentative: {summaryMetrics.tentativeBookings}</span>
              </div>
              <div className="breakdown-item">
                <XCircle size={14} className="cancelled" />
                <span>Cancelled: {summaryMetrics.cancelledBookings}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <div className="card-value">{formatCurrency(summaryMetrics.totalRevenue)}</div>
            <div className="card-subtitle">
              <span>Avg. {formatCurrency(summaryMetrics.averageBookingValue)} per booking</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon venues">
            <Building size={24} />
          </div>
          <div className="card-content">
            <h3>Top Venue</h3>
            <div className="card-value">{venueBookingsData.length > 0 ? venueBookingsData[0].name : "N/A"}</div>
            <div className="card-subtitle">
              <span>{venueBookingsData.length > 0 ? `${venueBookingsData[0].bookings} bookings` : "No data"}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon organizers">
            <Users size={24} />
          </div>
          <div className="card-content">
            <h3>Top Organizer</h3>
            <div className="card-value">
              {organizerPerformanceData.length > 0 ? organizerPerformanceData[0].name : "N/A"}
            </div>
            <div className="card-subtitle">
              <span>
                {organizerPerformanceData.length > 0
                  ? `${organizerPerformanceData[0].bookings} bookings, ${formatCurrency(organizerPerformanceData[0].revenue)}`
                  : "No data"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <TrendingUp size={16} />
          <span>Overview</span>
        </button>
        <button
          className={`tab-button ${activeTab === "venues" ? "active" : ""}`}
          onClick={() => setActiveTab("venues")}
        >
          <Building size={16} />
          <span>Venues</span>
        </button>
        <button
          className={`tab-button ${activeTab === "organizers" ? "active" : ""}`}
          onClick={() => setActiveTab("organizers")}
        >
          <Users size={16} />
          <span>Organizers</span>
        </button>
        <button
          className={`tab-button ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          <Calendar size={16} />
          <span>Bookings</span>
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="charts-section">
          <div className="chart-row">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>Monthly Booking Activity</h3>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#10b981" }}></div>
                    <span>Confirmed</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#f59e0b" }}></div>
                    <span>Tentative</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: "#ef4444" }}></div>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyBookingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="confirmed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="tentative" stroke="#f59e0b" strokeWidth={2} />
                    <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Booking Status Distribution</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} bookings`, "Count"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Venues by Bookings</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={venueBookingsData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Revenue by Venue</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueByVenueData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${formatCurrency(value).split(".")[0]}`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Organizers by Revenue</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={organizerPerformanceData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${formatCurrency(value).split(".")[0]}`} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue" ? "Revenue" : "Bookings",
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "venues" && (
        <div className="detail-section">
          <h2>Venue Performance</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>Total Bookings</th>
                  <th>Confirmed</th>
                  <th>Tentative</th>
                  <th>Cancelled</th>
                  <th>Revenue</th>
                  <th>Avg. Booking Value</th>
                </tr>
              </thead>
              <tbody>
                {venueBookingsData.map((venue) => {
                  const venueBookings = filteredBookings.filter(
                    (booking) => booking.response.venueRequest.venue?.name === venue.name,
                  )

                  const confirmed = venueBookings.filter((b) => b.status === "Confirmed").length
                  const tentative = venueBookings.filter((b) => b.status === "Tentative").length
                  const cancelled = venueBookings.filter((b) => b.status === "Cancelled").length

                  // Convert THB to KSH for revenue
                  const revenue = venueBookings.reduce((sum, b) => sum + convertCurrency(b.amountPaid), 0)
                  const avgValue = venueBookings.length > 0 ? revenue / venueBookings.length : 0

                  return (
                    <tr key={venue.name}>
                      <td>{venue.name}</td>
                      <td>{venue.bookings}</td>
                      <td>{confirmed}</td>
                      <td>{tentative}</td>
                      <td>{cancelled}</td>
                      <td>{formatCurrency(revenue)}</td>
                      <td>{formatCurrency(avgValue)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="chart-row">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>Venue Popularity Comparison</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={venueBookingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>Revenue by Venue</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueByVenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${formatCurrency(value).split(".")[0]}`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "organizers" && (
        <div className="detail-section">
          <h2>Organizer Performance</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Organizer</th>
                  <th>Total Bookings</th>
                  <th>Confirmed</th>
                  <th>Tentative</th>
                  <th>Cancelled</th>
                  <th>Revenue</th>
                  <th>Avg. Booking Value</th>
                </tr>
              </thead>
              <tbody>
                {organizerPerformanceData.map((organizer) => {
                  const avgValue = organizer.bookings > 0 ? organizer.revenue / organizer.bookings : 0

                  return (
                    <tr key={organizer.name}>
                      <td>{organizer.name}</td>
                      <td>{organizer.bookings}</td>
                      <td>{organizer.confirmed}</td>
                      <td>{organizer.tentative}</td>
                      <td>{organizer.cancelled}</td>
                      <td>{formatCurrency(organizer.revenue)}</td>
                      <td>{formatCurrency(avgValue)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="chart-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Bookings by Organizer</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={organizerPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Revenue by Organizer</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={organizerPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${formatCurrency(value).split(".")[0]}`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} />
                    <Bar dataKey="revenue" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-card large">
              <div className="chart-header">
                <h3>Booking Status by Organizer</h3>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={organizerPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="confirmed" stackId="a" fill="#10b981" />
                    <Bar dataKey="tentative" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="cancelled" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="detail-section">
          <h2>Booking Details</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Organizer</th>
                  <th>Venue</th>
                  <th>Event Dates</th>
                  <th>Status</th>
                  <th>Amount (KSH)</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const eventDates = booking.response.venueRequest.eventDates

                  return (
                    <tr key={booking._id}>
                      <td>{booking.response.venueRequest.eventName}</td>
                      <td>{`${booking.organizer.firstName} ${booking.organizer.lastName}`}</td>
                      <td>{booking.response.venueRequest.venue?.name || "No venue"}</td>
                      <td>
                        {eventDates.length > 0 ? (
                          <>
                            {formatDate(eventDates[0])}
                            {eventDates.length > 1 && <span className="date-count">+{eventDates.length - 1}</span>}
                          </>
                        ) : (
                          "No dates specified"
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                      </td>
                      <td>{formatCurrency(convertCurrency(booking.totalAmount))}</td>
                      <td>{formatDate(booking.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .metrics-container {
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

        .metrics-header {
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

        .exchange-rate-info {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .refresh-rate-btn {
          background: none;
          border: none;
          color: #3b82f6;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .refresh-rate-btn:hover {
          background-color: #f1f5f9;
        }

        .exchange-rate-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button.refresh {
          background: white;
          color: #0f172a;
          border: 1px solid #e2e8f0;
        }

        .action-button.refresh:hover {
          background: #f8fafc;
        }

        .action-button.export {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .action-button.export:hover {
          background: #2563eb;
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
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
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

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          color: white;
        }

        .card-icon.bookings {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .card-icon.revenue {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .card-icon.venues {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .card-icon.organizers {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .card-content {
          flex: 1;
        }

        .card-content h3 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin: 0 0 0.5rem 0;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .card-subtitle {
          font-size: 0.75rem;
          color: #64748b;
        }

        .card-breakdown {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .breakdown-item .confirmed {
          color: #10b981;
        }

        .breakdown-item .tentative {
          color: #f59e0b;
        }

        .breakdown-item .cancelled {
          color: #ef4444;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: none;
          border: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 0.375rem 0.375rem 0 0;
          transition: all 0.2s;
        }

        .tab-button:hover {
          color: #0f172a;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .charts-section {
          margin-bottom: 2rem;
        }

        .chart-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .chart-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .chart-card.large {
          grid-column: 1 / -1;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .chart-legend {
          display: flex;
          gap: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
        }

        .legend-color {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
        }

        .chart-container {
          width: 100%;
          height: 100%;
        }

        .detail-section {
          margin-bottom: 2rem;
        }

        .detail-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }

        .table-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          overflow-x: auto;
          margin-bottom: 2rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          white-space: nowrap;
        }

        .data-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table td {
          padding: 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.confirmed {
          background: #dcfce7;
          color: #10b981;
        }

        .status-badge.tentative {
          background: #fef3c7;
          color: #f59e0b;
        }

        .status-badge.cancelled {
          background: #fee2e2;
          color: #ef4444;
        }

        .date-count {
          margin-left: 0.5rem;
          background: #f1f5f9;
          padding: 0.125rem 0.375rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: #64748b;
        }

        @media (max-width: 1024px) {
          .chart-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .metrics-container {
            padding: 1rem;
          }

          .metrics-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
          }

          .action-button {
            flex: 1;
            justify-content: center;
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

          .tabs {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .tab-button {
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

