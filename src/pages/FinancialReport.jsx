import { useState, useEffect, useMemo, useRef } from "react"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function FinancialReport() {

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exchangeRate, setExchangeRate] = useState(3.5) 


  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  })

  // Refs for export
  const reportRef = useRef(null)

  // Fetch bookings data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch bookings data
        const bookingsRes = await fetch("http://localhost:3002/bookings")

        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings")

        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)

        // Fetch current exchange rate (in a real app, this would use a currency API)
        try {
          const rateRes = await fetch("https://open.er-api.com/v6/latest/THB")
          if (rateRes.ok) {
            const rateData = await rateRes.json()
            if (rateData.rates && rateData.rates.KES) {
              setExchangeRate(rateData.rates.KES)
            }
          }
        } catch (rateErr) {
          console.error("Could not fetch exchange rate, using default", rateErr)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to get nested values
  const getNestedValue = (obj, path) => {
    const keys = path.split(".")
    return keys.reduce((o, key) => (o || {})[key], obj) || ""
  }

  // Apply filters and sorting
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        // Apply status filter
        if (statusFilter !== "all" && booking.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false
        }

        // Apply payment method filter
        if (paymentMethodFilter !== "all") {
          const hasPaymentMethod = booking.paymentDetails?.some(
            (payment) => payment.paymentMethod?.toLowerCase() === paymentMethodFilter.toLowerCase(),
          )
          if (!hasPaymentMethod) return false
        }

        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            booking.response?.venueRequest?.eventName?.toLowerCase().includes(searchLower) ||
            booking.response?.venueRequest?.venue?.name?.toLowerCase().includes(searchLower) ||
            booking.paymentDetails?.some(
              (payment) =>
                payment.transactionId?.toLowerCase().includes(searchLower) ||
                payment.paymentMethod?.toLowerCase().includes(searchLower),
            )
          )
        }

        // Apply date range filter
        if (dateRange.start && dateRange.end) {
          const bookingDate = new Date(booking.createdAt)
          return bookingDate >= dateRange.start && bookingDate <= dateRange.end
        }

        return true
      })
      .sort((a, b) => {
        const aValue = getNestedValue(a, sortConfig.key)
        const bValue = getNestedValue(b, sortConfig.key)

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
  }, [bookings, statusFilter, paymentMethodFilter, searchTerm, dateRange, sortConfig])

  // Calculate summary data
  const summaryData = useMemo(() => {
    if (!bookings.length)
      return {
        totalBookings: 0,
        totalRevenue: 0,
        paidAmount: 0,
        outstandingAmount: 0,
        confirmedBookings: 0,
        tentativeBookings: 0,
        paypalRevenue: 0,
        mpesaRevenue: 0,
      }

    let totalRevenue = 0
    let paidAmount = 0
    let paypalRevenue = 0
    let mpesaRevenue = 0

    bookings.forEach((booking) => {
      totalRevenue += booking.totalAmount || 0
      paidAmount += booking.amountPaid || 0

      booking.paymentDetails?.forEach((payment) => {
        if (payment.paymentMethod === "PayPal") {
          paypalRevenue += payment.amount || 0
        } else if (payment.paymentMethod === "M-Pesa") {
          mpesaRevenue += payment.amount || 0
        }
      })
    })

    return {
      totalBookings: bookings.length,
      totalRevenue,
      paidAmount,
      outstandingAmount: totalRevenue - paidAmount,
      confirmedBookings: bookings.filter((b) => b.status === "Confirmed").length,
      tentativeBookings: bookings.filter((b) => b.status === "Tentative").length,
      paypalRevenue,
      mpesaRevenue,
    }
  }, [bookings])

  // Calculate monthly revenue data
  const monthlyRevenueData = useMemo(() => {
    if (!bookings.length) return []

    const monthlyData = {}

    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const monthYear = `${date.toLocaleString("default", {
        month: "short",
      })} ${date.getFullYear()}`

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          total: 0,
          paid: 0,
          outstanding: 0,
        }
      }

      monthlyData[monthYear].total += booking.totalAmount || 0
      monthlyData[monthYear].paid += booking.amountPaid || 0
      monthlyData[monthYear].outstanding += (booking.totalAmount || 0) - (booking.amountPaid || 0)
    })

    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ")
      const [bMonth, bYear] = b.month.split(" ")

      if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.indexOf(aMonth) - months.indexOf(bMonth)
    })
  }, [bookings])

  // Format currency
  const formatCurrency = (amount, currency = "KES") => {
    if (amount === undefined || amount === null) return "N/A"

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Convert THB to KSH for PayPal transactions
  const convertCurrency = (amount, method) => {
    if (method === "PayPal") {
      // Assuming PayPal transactions are in THB
      return amount * exchangeRate
    }
    return amount
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Handle date filter
  const handleDateFilter = (e) => {
    const { name, value } = e.target
    setDateRange((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : null,
    }))
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape", "pt", "a4")

    // Add title
    doc.setFontSize(18)
    doc.text("Financial Report", 40, 40)

    // Add date
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 60)

    // Add summary
    doc.setFontSize(14)
    doc.text("Summary", 40, 90)
    doc.setFontSize(10)
    doc.text(`Total Bookings: ${summaryData.totalBookings}`, 40, 110)
    doc.text(`Total Revenue: ${formatCurrency(summaryData.totalRevenue)}`, 40, 125)
    doc.text(`Paid Amount: ${formatCurrency(summaryData.paidAmount)}`, 40, 140)
    doc.text(`Outstanding Amount: ${formatCurrency(summaryData.outstandingAmount)}`, 40, 155)

    // Add transactions table
    doc.setFontSize(14)
    doc.text("Transactions", 40, 185)

    // Table headers
    const headers = ["Event", "Venue", "Date", "Amount", "Paid", "Status"]
    let y = 205

    // Draw headers
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    headers.forEach((header, i) => {
      doc.text(header, 40 + i * 120, y)
    })

    // Draw rows
    doc.setFont("helvetica", "normal")
    filteredBookings.slice(0, 20).forEach((booking, index) => {
      y += 20
      doc.text(booking.response?.venueRequest?.eventName || "N/A", 40, y)
      doc.text(booking.response?.venueRequest?.venue?.name || "N/A", 160, y)
      doc.text(formatDate(booking.createdAt), 280, y)
      doc.text(formatCurrency(booking.totalAmount), 400, y)
      doc.text(formatCurrency(booking.amountPaid), 520, y)
      doc.text(booking.status, 640, y)
    })

    doc.save("financial-report.pdf")
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredBookings.map((booking) => ({
        Event: booking.response?.venueRequest?.eventName || "N/A",
        Venue: booking.response?.venueRequest?.venue?.name || "N/A",
        Date: formatDate(booking.createdAt),
        "Total Amount": booking.totalAmount,
        "Paid Amount": booking.amountPaid,
        Outstanding: (booking.totalAmount || 0) - (booking.amountPaid || 0),
        Status: booking.status,
        "Payment Methods": booking.paymentDetails?.map((p) => p.paymentMethod).join(", ") || "None",
      })),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report")
    XLSX.writeFile(workbook, "financial-report.xlsx")
  }

  // Reset filters
  const resetFilters = () => {
    setDateRange({ start: null, end: null })
    setPaymentMethodFilter("all")
    setStatusFilter("all")
    setSearchTerm("")
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading financial data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="financial-report" ref={reportRef}>
      <div className="report-header">
        <div className="header-title">
          <h1>Financial Report</h1>
          <p>Comprehensive overview of venue booking finances</p>
        </div>
        <div className="header-actions">
          <div className="export-dropdown">
            <button className="export-button">Export Report</button>
            <div className="export-options">
              <button onClick={exportToPDF}>Export as PDF</button>
              <button onClick={exportToExcel}>Export as Excel</button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-card">
          <div className="card-icon revenue-icon">₹</div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-value">{formatCurrency(summaryData.totalRevenue)}</p>
            <div className="card-footer">
              <span className="card-label">Paid: </span>
              <span className="card-subvalue">{formatCurrency(summaryData.paidAmount)}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon outstanding-icon">!</div>
          <div className="card-content">
            <h3>Outstanding Amount</h3>
            <p className="card-value">{formatCurrency(summaryData.outstandingAmount)}</p>
            <div className="card-footer">
              <span className="card-label">From: </span>
              <span className="card-subvalue">{summaryData.tentativeBookings} bookings</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon bookings-icon">📅</div>
          <div className="card-content">
            <h3>Total Bookings</h3>
            <p className="card-value">{summaryData.totalBookings}</p>
            <div className="card-footer">
              <span className="card-label">Confirmed: </span>
              <span className="card-subvalue">{summaryData.confirmedBookings}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon payment-icon">💳</div>
          <div className="card-content">
            <h3>Payment Methods</h3>
            <div className="payment-split">
              <div className="payment-method">
                <span className="method-label">M-Pesa:</span>
                <span className="method-value">{formatCurrency(summaryData.mpesaRevenue)}</span>
              </div>
              <div className="payment-method">
                <span className="method-label">PayPal:</span>
                <span className="method-value">{formatCurrency(summaryData.paypalRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart - FIXED WITH RECHARTS */}
      <div className="chart-section">
        <h2>Monthly Revenue Trends</h2>
        <div className="chart-container">
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color total-color"></div>
              <span>Total Revenue</span>
            </div>
            <div className="legend-item">
              <div className="legend-color paid-color"></div>
              <span>Paid Amount</span>
            </div>
            <div className="legend-item">
              <div className="legend-color outstanding-color"></div>
              <span>Outstanding</span>
            </div>
          </div>

          {monthlyRevenueData.length > 0 ? (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => `Month: ${label}`} />
                  <Legend />
                  <Bar dataKey="total" name="Total Revenue" fill="#3498db" />
                  <Bar dataKey="paid" name="Paid Amount" fill="#27ae60" />
                  <Bar dataKey="outstanding" name="Outstanding" fill="#e74c3c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="no-data">No monthly data available</div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>Transaction Details</h2>
        <div className="filters-container">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by event, venue, or transaction ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="filter">
              <label>Date Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  name="start"
                  value={dateRange.start ? dateRange.start.toISOString().split("T")[0] : ""}
                  onChange={handleDateFilter}
                />
                <span>to</span>
                <input
                  type="date"
                  name="end"
                  value={dateRange.end ? dateRange.end.toISOString().split("T")[0] : ""}
                  onChange={handleDateFilter}
                />
              </div>
            </div>

            <div className="filter">
              <label>Payment Method</label>
              <select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)}>
                <option value="all">All Methods</option>
                <option value="paypal">PayPal</option>
                <option value="m-pesa">M-Pesa</option>
              </select>
            </div>

            <div className="filter">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="tentative">Tentative</option>
              </select>
            </div>

            <button className="reset-filters" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-section">
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("response.venueRequest.eventName")}>
                  Event
                  <span className="sort-icon">⇅</span>
                </th>
                <th onClick={() => requestSort("response.venueRequest.venue.name")}>
                  Venue
                  <span className="sort-icon">⇅</span>
                </th>
                <th onClick={() => requestSort("createdAt")}>
                  Date
                  <span className="sort-icon">⇅</span>
                </th>
                <th onClick={() => requestSort("totalAmount")}>
                  Total Amount
                  <span className="sort-icon">⇅</span>
                </th>
                <th onClick={() => requestSort("amountPaid")}>
                  Paid Amount
                  <span className="sort-icon">⇅</span>
                </th>
                <th onClick={() => requestSort("status")}>
                  Status
                  <span className="sort-icon">⇅</span>
                </th>
                <th>Payment Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="cell-main">{booking.response?.venueRequest?.eventName || "N/A"}</div>
                    <div className="cell-sub">
                      {booking.response?.venueRequest?.eventDates?.length > 0
                        ? formatDate(booking.response.venueRequest.eventDates[0]) +
                          (booking.response.venueRequest.eventDates.length > 1
                            ? ` (+${booking.response.venueRequest.eventDates.length - 1} more)`
                            : "")
                        : "No dates"}
                    </div>
                  </td>
                  <td>
                    <div className="cell-main">{booking.response?.venueRequest?.venue?.name || "N/A"}</div>
                    <div className="cell-sub">{booking.response?.venueRequest?.venue?.location || ""}</div>
                  </td>
                  <td>{formatDate(booking.createdAt)}</td>
                  <td className="amount-cell">{formatCurrency(booking.totalAmount)}</td>
                  <td className="amount-cell">
                    <div className="cell-main">{formatCurrency(booking.amountPaid)}</div>
                    {booking.amountPaid < booking.totalAmount && (
                      <div className="cell-sub outstanding">
                        Outstanding: {formatCurrency(booking.totalAmount - booking.amountPaid)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </td>
                  <td>
                    {booking.paymentDetails && booking.paymentDetails.length > 0 ? (
                      <div className="payment-details">
                        {booking.paymentDetails.map((payment, index) => (
                          <div key={index} className="payment-detail">
                            <div className="payment-method">
                              <span className={`method-icon ${payment.paymentMethod.toLowerCase()}`}>
                                {payment.paymentMethod === "PayPal" ? "P" : "M"}
                              </span>
                              {payment.paymentMethod}
                            </div>
                            <div className="payment-amount">
                              {payment.paymentMethod === "PayPal" ? (
                                <div className="converted-amount">
                                  <span className="original">{formatCurrency(payment.amount, "THB")}</span>
                                  <span className="converted">
                                    {formatCurrency(convertCurrency(payment.amount, payment.paymentMethod))}
                                  </span>
                                </div>
                              ) : (
                                formatCurrency(payment.amount)
                              )}
                            </div>
                            <div className="transaction-id">{payment.transactionId}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="no-payment">No payment details</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="no-data">
                    No transactions match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="payment-distribution-section">
        <h2>Payment Method Distribution</h2>
        <div className="distribution-container">
          <div className="distribution-chart">
            <div
              className="distribution-segment mpesa-segment"
              style={{
                width: `${
                  (summaryData.mpesaRevenue / (summaryData.mpesaRevenue + summaryData.paypalRevenue || 1)) * 100
                }%`,
              }}
            >
              <span className="segment-label">M-Pesa</span>
              <span className="segment-value">{formatCurrency(summaryData.mpesaRevenue)}</span>
            </div>
            <div
              className="distribution-segment paypal-segment"
              style={{
                width: `${
                  (summaryData.paypalRevenue / (summaryData.mpesaRevenue + summaryData.paypalRevenue || 1)) * 100
                }%`,
              }}
            >
              <span className="segment-label">PayPal</span>
              <span className="segment-value">{formatCurrency(summaryData.paypalRevenue)}</span>
            </div>
          </div>
          <div className="distribution-stats">
            <div className="stat-item">
              <div className="stat-label">M-Pesa Transactions</div>
              <div className="stat-value">
                {bookings.reduce((count, booking) => {
                  return count + (booking.paymentDetails?.filter((p) => p.paymentMethod === "M-Pesa").length || 0)
                }, 0)}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">PayPal Transactions</div>
              <div className="stat-value">
                {bookings.reduce((count, booking) => {
                  return count + (booking.paymentDetails?.filter((p) => p.paymentMethod === "PayPal").length || 0)
                }, 0)}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Average Transaction</div>
              <div className="stat-value">
                {formatCurrency(
                  bookings.reduce((sum, booking) => sum + (booking.amountPaid || 0), 0) /
                    bookings.reduce((count, booking) => count + (booking.paymentDetails?.length || 0), 0) || 0,
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="report-footer">
        <p>Financial Report generated on {new Date().toLocaleDateString()}</p>
        <p>Exchange Rate: 1 THB = {exchangeRate.toFixed(2)} KSH</p>
      </div>

      <style jsx>{`
        /* Base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f5f7fa;
          line-height: 1.6;
        }

        .financial-report {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Header styles */
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-title h1 {
          font-size: 2.2rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .header-title p {
          color: #7f8c8d;
          font-size: 1rem;
        }

        .header-actions {
          position: relative;
        }

        .export-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .export-button:hover {
          background-color: #2980b9;
        }

        .export-options {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 10;
          overflow: hidden;
        }

        .export-options button {
          display: block;
          width: 100%;
          text-align: left;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #333;
          transition: background-color 0.2s;
        }

        .export-options button:hover {
          background-color: #f5f7fa;
        }

        /* Summary cards */
        .summary-section {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          display: flex;
          align-items: center;
        }

        .card-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-right: 1rem;
          color: white;
        }

        .revenue-icon {
          background-color: #27ae60;
        }

        .outstanding-icon {
          background-color: #e74c3c;
        }

        .bookings-icon {
          background-color: #3498db;
        }

        .payment-icon {
          background-color: #9b59b6;
        }

        .card-content {
          flex: 1;
        }

        .card-content h3 {
          font-size: 0.9rem;
          color: #7f8c8d;
          margin-bottom: 0.5rem;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .card-footer {
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .card-subvalue {
          color: #2c3e50;
          font-weight: 600;
        }

        .payment-split {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payment-method {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .method-label {
          color: #7f8c8d;
        }

        .method-value {
          font-weight: 600;
          color: #2c3e50;
        }

        /* Chart section */
        .chart-section {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .chart-section h2 {
          font-size: 1.25rem;
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }

        .chart-container {
          position: relative;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 0.85rem;
          color: #7f8c8d;
        }

        .legend-color {
          width: 1rem;
          height: 1rem;
          margin-right: 0.5rem;
          border-radius: 2px;
        }

        .total-color {
          background-color: #3498db;
        }

        .paid-color {
          background-color: #27ae60;
        }

        .outstanding-color {
          background-color: #e74c3c;
        }

        .no-data {
          text-align: center;
          padding: 2rem;
          color: #7f8c8d;
          font-style: italic;
        }

        /* Filters section */
        .filters-section {
          margin-bottom: 2rem;
        }

        .filters-section h2 {
          font-size: 1.25rem;
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .filters-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
        }

        .search-filter {
          margin-bottom: 1rem;
        }

        .search-filter input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .search-filter input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .filter-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }

        .filter {
          flex: 1;
          min-width: 200px;
        }

        .filter label {
          display: block;
          font-size: 0.85rem;
          color: #7f8c8d;
          margin-bottom: 0.5rem;
        }

        .filter select,
        .filter input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ecf0f1;
          border-radius: 4px;
          font-size: 0.9rem;
          background-color: white;
        }

        .filter select:focus,
        .filter input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        .date-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-inputs span {
          color: #7f8c8d;
        }

        .reset-filters {
          background-color: #ecf0f1;
          color: #7f8c8d;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .reset-filters:hover {
          background-color: #bdc3c7;
        }

        /* Transactions table */
        .transactions-section {
          margin-bottom: 2rem;
        }

        .table-container {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .transactions-table th {
          background-color: #f5f7fa;
          padding: 1rem;
          text-align: left;
          font-size: 0.85rem;
          color: #7f8c8d;
          border-bottom: 1px solid #ecf0f1;
          cursor: pointer;
          position: relative;
        }

        .sort-icon {
          margin-left: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.5;
        }

        .transactions-table th:hover .sort-icon {
          opacity: 1;
        }

        .transactions-table td {
          padding: 1rem;
          border-bottom: 1px solid #ecf0f1;
          font-size: 0.9rem;
          color: #2c3e50;
        }

        .cell-main {
          font-weight: 500;
        }

        .cell-sub {
          font-size: 0.8rem;
          color: #7f8c8d;
          margin-top: 0.25rem;
        }

        .amount-cell {
          font-weight: 600;
        }

        .outstanding {
          color: #e74c3c;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-confirmed {
          background-color: rgba(39, 174, 96, 0.1);
          color: #27ae60;
        }

        .status-tentative {
          background-color: rgba(243, 156, 18, 0.1);
          color: #f39c12;
        }

        .payment-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .payment-detail {
          font-size: 0.85rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .method-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 50%;
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .method-icon.paypal {
          background-color: #0070ba;
        }

        .method-icon.m-pesa {
          background-color: #4caf50;
        }

        .payment-amount {
          margin-bottom: 0.25rem;
        }

        .converted-amount {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .original {
          text-decoration: line-through;
          color: #7f8c8d;
        }

        .converted {
          color: #2c3e50;
          font-weight: 600;
        }

        .transaction-id {
          color: #7f8c8d;
          font-size: 0.8rem;
        }

        .no-payment {
          color: #7f8c8d;
          font-style: italic;
        }

        /* Payment distribution section */
        .payment-distribution-section {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .payment-distribution-section h2 {
          font-size: 1.25rem;
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }

        .distribution-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .distribution-chart {
          display: flex;
          height: 3rem;
          border-radius: 4px;
          overflow: hidden;
        }

        .distribution-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          position: relative;
          min-width: 5%;
        }

        .mpesa-segment {
          background-color: #4caf50;
        }

        .paypal-segment {
          background-color: #0070ba;
        }

        .segment-label {
          margin-right: 0.5rem;
        }

        .distribution-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #7f8c8d;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2c3e50;
        }

        /* Footer */
        .report-footer {
          text-align: center;
          padding: 2rem 0;
          color: #7f8c8d;
          font-size: 0.85rem;
        }

        /* Loading state */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .loading-spinner {
          width: 3rem;
          height: 3rem;
          border: 4px solid rgba(52, 152, 219, 0.1);
          border-left-color: #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-container p {
          color: #7f8c8d;
        }

        /* Error state */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
        }

        .error-icon {
          width: 4rem;
          height: 4rem;
          background-color: #e74c3c;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .error-container h2 {
          font-size: 1.5rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .error-container p {
          color: #7f8c8d;
          margin-bottom: 1.5rem;
        }

        .error-container button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .error-container button:hover {
          background-color: #2980b9;
        }

        /* Responsive styles */
        @media (max-width: 768px) {
          .financial-report {
            padding: 1rem;
          }

          .report-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .summary-section {
            grid-template-columns: 1fr;
          }

          .filter-group {
            flex-direction: column;
          }

          .filter {
            width: 100%;
          }

          .date-inputs {
            flex-direction: column;
            align-items: flex-start;
          }

          .transactions-table {
            display: block;
            overflow-x: auto;
          }

          .distribution-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

