import { useState, useEffect, useMemo } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
} from "recharts"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Search,
  Printer,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart2,
  PieChartIcon,
  Activity,
  CalendarIcon,
  Eye,
  FileText,
} from "lucide-react"

export default function FinancialReport() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [dateRange, setDateRange] = useState("all")
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  })
  const [filters, setFilters] = useState({
    paymentMethod: "all",
    status: "all",
    venue: "all",
    organizer: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [chartType, setChartType] = useState({
    revenue: "line",
    payments: "bar",
    distribution: "pie",
  })
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  })
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    revenueAnalysis: true,
    paymentMethods: true,
    transactions: true,
    forecast: true,
    cashFlow: true,
  })
  const [showTooltip, setShowTooltip] = useState(null)
  const [comparisonPeriod, setComparisonPeriod] = useState("previous")
  const [exportFormat, setExportFormat] = useState("csv")
  const [showExportOptions, setShowExportOptions] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3002/bookings")
      const data = await response.json()
      setBookings(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load financial data")
      setLoading(false)
    }
  }

  // Extract unique values for filters
  const uniqueValues = useMemo(() => {
    const paymentMethods = new Set()
    const venues = new Set()
    const organizers = new Set()

    bookings.forEach((booking) => {
      // Payment methods
      if (booking.paymentDetails && booking.paymentDetails.length > 0) {
        booking.paymentDetails.forEach((payment) => {
          if (payment.paymentMethod) {
            paymentMethods.add(payment.paymentMethod)
          }
        })
      }

      // Venues
      if (booking.response && booking.response.venueRequest && booking.response.venueRequest.venue) {
        venues.add(booking.response.venueRequest.venue.name)
      }

      // Organizers
      if (booking.organizer) {
        organizers.add(`${booking.organizer.firstName} ${booking.organizer.lastName}`)
      }
    })

    return {
      paymentMethods: Array.from(paymentMethods),
      venues: Array.from(venues),
      organizers: Array.from(organizers),
      statuses: ["Confirmed", "Tentative", "Cancelled"],
    }
  }, [bookings])

  // Apply filters to bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      // Date range filter
      if (dateRange !== "all") {
        const bookingDate = new Date(booking.createdAt)
        const today = new Date()

        if (dateRange === "today") {
          const isToday =
            bookingDate.getDate() === today.getDate() &&
            bookingDate.getMonth() === today.getMonth() &&
            bookingDate.getFullYear() === today.getFullYear()

          if (!isToday) return false
        } else if (dateRange === "thisWeek") {
          const startOfWeek = new Date(today)
          startOfWeek.setDate(today.getDate() - today.getDay())
          startOfWeek.setHours(0, 0, 0, 0)

          if (bookingDate < startOfWeek) return false
        } else if (dateRange === "thisMonth") {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

          if (bookingDate < startOfMonth) return false
        } else if (dateRange === "thisQuarter") {
          const currentQuarter = Math.floor(today.getMonth() / 3)
          const startOfQuarter = new Date(today.getFullYear(), currentQuarter * 3, 1)

          if (bookingDate < startOfQuarter) return false
        } else if (dateRange === "thisYear") {
          const startOfYear = new Date(today.getFullYear(), 0, 1)

          if (bookingDate < startOfYear) return false
        } else if (dateRange === "custom" && customDateRange.start && customDateRange.end) {
          const startDate = new Date(customDateRange.start)
          const endDate = new Date(customDateRange.end)
          endDate.setHours(23, 59, 59, 999) // Include the end date fully

          if (bookingDate < startDate || bookingDate > endDate) return false
        }
      }

      // Payment method filter
      if (filters.paymentMethod !== "all") {
        if (!booking.paymentDetails || booking.paymentDetails.length === 0) return false

        const hasPaymentMethod = booking.paymentDetails.some(
          (payment) => payment.paymentMethod === filters.paymentMethod,
        )

        if (!hasPaymentMethod) return false
      }

      // Status filter
      if (filters.status !== "all" && booking.status !== filters.status) {
        return false
      }

      // Venue filter
      if (filters.venue !== "all") {
        if (!booking.response || !booking.response.venueRequest || !booking.response.venueRequest.venue) return false

        if (booking.response.venueRequest.venue.name !== filters.venue) return false
      }

      // Organizer filter
      if (filters.organizer !== "all") {
        if (!booking.organizer) return false

        const organizerName = `${booking.organizer.firstName} ${booking.organizer.lastName}`
        if (organizerName !== filters.organizer) return false
      }

      // Search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const eventName = booking.response?.venueRequest?.eventName?.toLowerCase() || ""
        const venueName = booking.response?.venueRequest?.venue?.name?.toLowerCase() || ""
        const organizerName = booking.organizer
          ? `${booking.organizer.firstName} ${booking.organizer.lastName}`.toLowerCase()
          : ""
        const transactionIds = booking.paymentDetails
          ? booking.paymentDetails.map((p) => p.transactionId?.toLowerCase() || "").join(" ")
          : ""

        if (
          !eventName.includes(searchLower) &&
          !venueName.includes(searchLower) &&
          !organizerName.includes(searchLower) &&
          !transactionIds.includes(searchLower)
        ) {
          return false
        }
      }

      return true
    })
  }, [bookings, dateRange, customDateRange, filters, searchTerm])

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (filteredBookings.length === 0) {
      return {
        totalRevenue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        averageTransactionValue: 0,
        confirmedBookings: 0,
        tentativeBookings: 0,
        cancelledBookings: 0,
        paymentMethodBreakdown: [],
        revenueByVenue: [],
        revenueByOrganizer: [],
        monthlyRevenue: [],
        dailyRevenue: [],
        transactionCount: 0,
        successRate: 0,
      }
    }

    // Basic metrics
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
    const paidAmount = filteredBookings.reduce((sum, booking) => sum + booking.amountPaid, 0)
    const pendingAmount = totalRevenue - paidAmount

    const confirmedBookings = filteredBookings.filter((booking) => booking.status === "Confirmed").length
    const tentativeBookings = filteredBookings.filter((booking) => booking.status === "Tentative").length
    const cancelledBookings = filteredBookings.filter((booking) => booking.status === "Cancelled").length

    // Transaction metrics
    const transactions = filteredBookings.flatMap((booking) => booking.paymentDetails || [])
    const transactionCount = transactions.length
    const averageTransactionValue =
      transactionCount > 0 ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactionCount : 0

    // Success rate (confirmed bookings / total non-cancelled bookings)
    const totalActiveBookings = confirmedBookings + tentativeBookings
    const successRate = totalActiveBookings > 0 ? (confirmedBookings / totalActiveBookings) * 100 : 0

    // Payment method breakdown
    const paymentMethodCounts = {}
    const paymentMethodAmounts = {}

    transactions.forEach((transaction) => {
      const method = transaction.paymentMethod || "Unknown"
      paymentMethodCounts[method] = (paymentMethodCounts[method] || 0) + 1

      // Apply conversion for PayPal transactions
      let amount = transaction.amount || 0
      if (method === "PayPal") {
        amount = amount * 3.84
      }

      paymentMethodAmounts[method] = (paymentMethodAmounts[method] || 0) + amount
    })

    const paymentMethodBreakdown = Object.keys(paymentMethodCounts).map((method) => ({
      name: method,
      count: paymentMethodCounts[method],
      amount: paymentMethodAmounts[method],
      percentage: (paymentMethodAmounts[method] / paidAmount) * 100,
    }))

    // Revenue by venue
    const venueRevenue = {}

    filteredBookings.forEach((booking) => {
      if (booking.response?.venueRequest?.venue) {
        const venueName = booking.response.venueRequest.venue.name
        venueRevenue[venueName] = (venueRevenue[venueName] || 0) + booking.amountPaid
      }
    })

    const revenueByVenue = Object.keys(venueRevenue)
      .map((venue) => ({
        name: venue,
        revenue: venueRevenue[venue],
        percentage: (venueRevenue[venue] / paidAmount) * 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Revenue by organizer
    const organizerRevenue = {}

    filteredBookings.forEach((booking) => {
      if (booking.organizer) {
        const organizerName = `${booking.organizer.firstName} ${booking.organizer.lastName}`
        organizerRevenue[organizerName] = (organizerRevenue[organizerName] || 0) + booking.amountPaid
      }
    })

    const revenueByOrganizer = Object.keys(organizerRevenue)
      .map((organizer) => ({
        name: organizer,
        revenue: organizerRevenue[organizer],
        percentage: (organizerRevenue[organizer] / paidAmount) * 100,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Monthly revenue
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyData = {}

    months.forEach((month) => {
      monthlyData[month] = {
        revenue: 0,
        transactions: 0,
        paid: 0,
        pending: 0,
      }
    })

    filteredBookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const month = months[date.getMonth()]

      monthlyData[month].revenue += booking.totalAmount
      monthlyData[month].paid += booking.amountPaid
      monthlyData[month].pending += booking.totalAmount - booking.amountPaid

      if (booking.paymentDetails) {
        monthlyData[month].transactions += booking.paymentDetails.length
      }
    })

    const monthlyRevenue = months.map((month) => ({
      name: month,
      revenue: monthlyData[month].revenue,
      paid: monthlyData[month].paid,
      pending: monthlyData[month].pending,
      transactions: monthlyData[month].transactions,
    }))

    // Daily revenue (last 30 days)
    const dailyData = {}
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      dailyData[dateString] = {
        revenue: 0,
        transactions: 0,
        paid: 0,
        pending: 0,
      }
    }

    filteredBookings.forEach((booking) => {
      const date = new Date(booking.createdAt)
      const dateString = date.toISOString().split("T")[0]

      if (dailyData[dateString]) {
        dailyData[dateString].revenue += booking.totalAmount
        dailyData[dateString].paid += booking.amountPaid
        dailyData[dateString].pending += booking.totalAmount - booking.amountPaid

        if (booking.paymentDetails) {
          dailyData[dateString].transactions += booking.paymentDetails.length
        }
      }
    })

    const dailyRevenue = Object.keys(dailyData).map((date) => ({
      date,
      revenue: dailyData[date].revenue,
      paid: dailyData[date].paid,
      pending: dailyData[date].pending,
      transactions: dailyData[date].transactions,
    }))

    return {
      totalRevenue,
      paidAmount,
      pendingAmount,
      averageTransactionValue,
      confirmedBookings,
      tentativeBookings,
      cancelledBookings,
      paymentMethodBreakdown,
      revenueByVenue,
      revenueByOrganizer,
      monthlyRevenue,
      dailyRevenue,
      transactionCount,
      successRate,
    }
  }, [filteredBookings])

  // Ensure PayPal and M-Pesa are highlighted in payment methods
  const enhancedPaymentMethodData = useMemo(() => {
    // Start with the original payment method data
    const paymentData = [...financialMetrics.paymentMethodBreakdown]

    // Define standard colors for payment methods
    const paymentMethodColors = {
      PayPal: "#0070ba",
      "M-Pesa": "#4cd964",
      "Credit Card": "#3b82f6",
      "Bank Transfer": "#8b5cf6",
      Cash: "#f59e0b",
      Other: "#64748b",
    }

    // Assign colors to payment methods
    const coloredPaymentData = paymentData.map((method) => ({
      ...method,
      color: paymentMethodColors[method.name] || "#64748b", // Default color if not in our map
    }))

    return coloredPaymentData
  }, [financialMetrics.paymentMethodBreakdown])

  // Generate cash flow data
  const cashFlowData = useMemo(() => {
    // Extract all transactions with dates
    const allTransactions = filteredBookings.flatMap((booking) =>
      (booking.paymentDetails || []).map((payment) => {
        // Apply conversion for PayPal transactions
        let amount = payment.amount || 0
        if (payment.paymentMethod === "PayPal") {
          amount = amount * 3.84
        }

        return {
          ...payment,
          amount: amount,
          timestamp: payment.timestamp || booking.createdAt,
          bookingId: booking._id,
          eventName: booking.response?.venueRequest?.eventName || "Unknown Event",
        }
      }),
    )

    // Sort by date
    allTransactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // Calculate cumulative cash flow
    let cumulativeAmount = 0
    const cumulativeData = allTransactions.map((transaction) => {
      cumulativeAmount += transaction.amount
      return {
        date: new Date(transaction.timestamp).toISOString().split("T")[0],
        amount: transaction.amount,
        cumulative: cumulativeAmount,
        method: transaction.paymentMethod,
        transactionId: transaction.transactionId,
      }
    })

    // Group by date for daily cash flow
    const dailyData = {}

    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp).toISOString().split("T")[0]

      if (!dailyData[date]) {
        dailyData[date] = {
          inflow: 0,
          outflow: 0,
          net: 0,
          transactions: 0,
        }
      }

      if (transaction.amount >= 0) {
        dailyData[date].inflow += transaction.amount
      } else {
        dailyData[date].outflow += Math.abs(transaction.amount)
      }

      dailyData[date].net += transaction.amount
      dailyData[date].transactions += 1
    })

    const dailyCashFlow = Object.keys(dailyData)
      .sort()
      .map((date) => ({
        date,
        inflow: dailyData[date].inflow,
        outflow: dailyData[date].outflow,
        net: dailyData[date].net,
        transactions: dailyData[date].transactions,
      }))

    // Calculate monthly cash flow
    const monthlyData = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    allTransactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp)
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      const key = `${year}-${month}`

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month,
          year,
          inflow: 0,
          outflow: 0,
          net: 0,
          transactions: 0,
        }
      }

      if (transaction.amount >= 0) {
        monthlyData[key].inflow += transaction.amount
      } else {
        monthlyData[key].outflow += Math.abs(transaction.amount)
      }

      monthlyData[key].net += transaction.amount
      monthlyData[key].transactions += 1
    })

    const monthlyCashFlow = Object.values(monthlyData)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return months.indexOf(a.month) - months.indexOf(b.month)
      })
      .map((data) => ({
        name: `${data.month} ${data.year}`,
        inflow: data.inflow,
        outflow: data.outflow,
        net: data.net,
        transactions: data.transactions,
      }))

    return {
      transactions: allTransactions,
      cumulative: cumulativeData,
      daily: dailyCashFlow,
      monthly: monthlyCashFlow,
    }
  }, [filteredBookings])

  // Generate accounts receivable aging data
  const accountsReceivableData = useMemo(() => {
    const today = new Date()

    // Filter bookings with pending payments
    const bookingsWithPending = filteredBookings.filter((booking) => booking.totalAmount > booking.amountPaid)

    // Calculate aging buckets
    const agingBuckets = {
      current: { count: 0, amount: 0 }, // 0-30 days
      thirtyDays: { count: 0, amount: 0 }, // 31-60 days
      sixtyDays: { count: 0, amount: 0 }, // 61-90 days
      ninetyDays: { count: 0, amount: 0 }, // 91+ days
    }

    const agingDetails = bookingsWithPending.map((booking) => {
      const createdDate = new Date(booking.createdAt)
      const daysDifference = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24))
      const pendingAmount = booking.totalAmount - booking.amountPaid

      let agingBucket = "current"

      if (daysDifference > 90) {
        agingBucket = "ninetyDays"
      } else if (daysDifference > 60) {
        agingBucket = "sixtyDays"
      } else if (daysDifference > 30) {
        agingBucket = "thirtyDays"
      }

      agingBuckets[agingBucket].count += 1
      agingBuckets[agingBucket].amount += pendingAmount

      return {
        id: booking._id,
        eventName: booking.response?.venueRequest?.eventName || "Unknown Event",
        organizer: booking.organizer ? `${booking.organizer.firstName} ${booking.organizer.lastName}` : "Unknown",
        createdDate: booking.createdAt,
        totalAmount: booking.totalAmount,
        amountPaid: booking.amountPaid,
        pendingAmount,
        daysPending: daysDifference,
        agingBucket,
      }
    })

    // Format for chart
    const agingChartData = [
      { name: "0-30 days", value: agingBuckets.current.amount, count: agingBuckets.current.count },
      { name: "31-60 days", value: agingBuckets.thirtyDays.amount, count: agingBuckets.thirtyDays.count },
      { name: "61-90 days", value: agingBuckets.sixtyDays.amount, count: agingBuckets.sixtyDays.count },
      { name: "91+ days", value: agingBuckets.ninetyDays.amount, count: agingBuckets.ninetyDays.count },
    ]

    // Total pending amount
    const totalPending = agingChartData.reduce((sum, bucket) => sum + bucket.value, 0)

    return {
      agingBuckets,
      agingDetails,
      agingChartData,
      totalPending,
    }
  }, [filteredBookings])

  // Generate payment performance metrics
  const paymentPerformanceData = useMemo(() => {
    // Calculate average days to payment
    const bookingsWithPayments = filteredBookings.filter(
      (booking) => booking.paymentDetails && booking.paymentDetails.length > 0,
    )

    let totalDaysToPayment = 0
    let paymentCount = 0

    bookingsWithPayments.forEach((booking) => {
      const bookingDate = new Date(booking.createdAt)

      booking.paymentDetails.forEach((payment) => {
        if (payment.timestamp) {
          const paymentDate = new Date(payment.timestamp)
          const daysDifference = Math.floor((paymentDate - bookingDate) / (1000 * 60 * 60 * 24))

          if (daysDifference >= 0) {
            // Ignore payments that appear to happen before booking
            totalDaysToPayment += daysDifference
            paymentCount += 1
          }
        }
      })
    })

    const averageDaysToPayment = paymentCount > 0 ? totalDaysToPayment / paymentCount : 0

    // Calculate payment completion rate
    const paymentCompletionRate =
      filteredBookings.length > 0
        ? (bookingsWithPayments.filter((b) => b.amountPaid >= b.totalAmount).length / filteredBookings.length) * 100
        : 0

    // Payment velocity (payments per day)
    const allPayments = filteredBookings.flatMap((b) => b.paymentDetails || [])
    const uniqueDates = new Set(allPayments.map((p) => p.timestamp?.split("T")[0]))
    const paymentVelocity = uniqueDates.size > 0 ? allPayments.length / uniqueDates.size : 0

    return {
      averageDaysToPayment,
      paymentCompletionRate,
      paymentVelocity,
    }
  }, [filteredBookings])

  // Format currency in KES
  const formatCurrency = (amount, paymentMethod = null) => {
    // Apply conversion for PayPal transactions (multiply by 3.84)
    let adjustedAmount = amount
    if (paymentMethod === "PayPal") {
      adjustedAmount = amount * 3.84
    }

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(adjustedAmount)
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  // Handle sort
  const handleSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range)
    if (range !== "custom") {
      setCustomDateRange({ start: "", end: "" })
    }
  }

  // Export data as CSV
  const exportCSV = () => {
    // Create CSV content
    const headers = ["Date", "Event", "Venue", "Organizer", "Total Amount", "Amount Paid", "Status"]

    const rows = filteredBookings.map((booking) => [
      formatDate(booking.createdAt),
      booking.response?.venueRequest?.eventName || "Unknown",
      booking.response?.venueRequest?.venue?.name || "Unknown",
      booking.organizer ? `${booking.organizer.firstName} ${booking.organizer.lastName}` : "Unknown",
      booking.totalAmount,
      booking.amountPaid,
      booking.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `financial_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export data as Excel
  const exportExcel = () => {
    // In a real application, you would use a library like xlsx
    // For this example, we'll just use CSV with an .xlsx extension
    const headers = ["Date", "Event", "Venue", "Organizer", "Total Amount", "Amount Paid", "Status"]

    const rows = filteredBookings.map((booking) => [
      formatDate(booking.createdAt),
      booking.response?.venueRequest?.eventName || "Unknown",
      booking.response?.venueRequest?.venue?.name || "Unknown",
      booking.organizer ? `${booking.organizer.firstName} ${booking.organizer.lastName}` : "Unknown",
      booking.totalAmount,
      booking.amountPaid,
      booking.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `financial_report_${new Date().toISOString().split("T")[0]}.xlsx`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export data as PDF
  const exportPDF = () => {
    // In a real application, you would use a library like jsPDF
    alert("PDF export would be implemented with a library like jsPDF")
  }

  // Export data based on selected format
  const handleExport = () => {
    switch (exportFormat) {
      case "csv":
        exportCSV()
        break
      case "excel":
        exportExcel()
        break
      case "pdf":
        exportPDF()
        break
      default:
        exportCSV()
    }
    setShowExportOptions(false)
  }

  // View transaction details
  const viewTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction)
  }

  // Close transaction details modal
  const closeTransactionDetails = () => {
    setSelectedTransaction(null)
  }

  // Export transactions table
  const exportTransactionsTable = () => {
    const transactions = filteredBookings.flatMap((booking) =>
      (booking.paymentDetails || []).map((payment) => ({
        ...payment,
        bookingId: booking._id,
        eventName: booking.response?.venueRequest?.eventName || "Unknown Event",
        organizer: booking.organizer ? `${booking.organizer.firstName} ${booking.organizer.lastName}` : "Unknown",
        status: booking.status,
      })),
    )

    const headers = ["Date", "Transaction ID", "Event", "Organizer", "Method", "Amount", "Status"]

    const rows = transactions.map((transaction) => [
      formatDate(transaction.timestamp),
      transaction.transactionId,
      transaction.eventName,
      transaction.organizer,
      transaction.paymentMethod,
      formatCurrency(transaction.amount || 0, transaction.paymentMethod).replace(/[^\d.-]/g, ""),
      transaction.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <div className="loading">Loading financial data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="financial-report-container">
      <header className="report-header">
        <div className="header-title">
          <h1>Financial Report</h1>
          <p className="subtitle">Comprehensive analysis of revenue, payments, and financial performance</p>
        </div>
        <div className="header-actions">
          <div className="date-range-selector">
            <div className="date-range-label">
              <CalendarIcon size={16} />
              <span>Date Range:</span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="date-range-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="date-input"
              />
              <span>to</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="date-input"
              />
            </div>
          )}

          <button className="action-button filter" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            <span>Filters</span>
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button className="action-button refresh" onClick={fetchBookings}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <div className="export-dropdown">
            <button className="action-button export" onClick={() => setShowExportOptions(!showExportOptions)}>
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={14} />
            </button>
            {showExportOptions && (
              <div className="export-options">
                <button
                  onClick={() => {
                    setExportFormat("csv")
                    handleExport()
                  }}
                >
                  <FileText size={16} />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => {
                    setExportFormat("excel")
                    handleExport()
                  }}
                >
                  <FileText size={16} />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => {
                    setExportFormat("pdf")
                    handleExport()
                  }}
                >
                  <FileText size={16} />
                  <span>PDF</span>
                </button>
              </div>
            )}
          </div>

          <button className="action-button print">
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </header>

      {showFilters && (
        <div className="filters-panel">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by event, venue, organizer or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              >
                <option value="all">All Methods</option>
                {uniqueValues.paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="all">All Statuses</option>
                {uniqueValues.statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Venue</label>
              <select value={filters.venue} onChange={(e) => setFilters({ ...filters, venue: e.target.value })}>
                <option value="all">All Venues</option>
                {uniqueValues.venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Organizer</label>
              <select value={filters.organizer} onChange={(e) => setFilters({ ...filters, organizer: e.target.value })}>
                <option value="all">All Organizers</option>
                {uniqueValues.organizers.map((organizer) => (
                  <option key={organizer} value={organizer}>
                    {organizer}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filters-actions">
            <button
              className="reset-filters"
              onClick={() => {
                setFilters({
                  paymentMethod: "all",
                  status: "all",
                  venue: "all",
                  organizer: "all",
                })
                setSearchTerm("")
              }}
            >
              Reset Filters
            </button>

            <button className="apply-filters" onClick={() => setShowFilters(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <BarChart2 size={16} />
          <span>Dashboard</span>
        </button>
        <button
          className={`tab-button ${activeTab === "transactions" ? "active" : ""}`}
          onClick={() => setActiveTab("transactions")}
        >
          <CreditCard size={16} />
          <span>Transactions</span>
        </button>

        <button
          className={`tab-button ${activeTab === "revenue" ? "active" : ""}`}
          onClick={() => setActiveTab("revenue")}
        >
          <DollarSign size={16} />
          <span>Revenue</span>
        </button>
        <button
          className={`tab-button ${activeTab === "paymentMethods" ? "active" : ""}`}
          onClick={() => setActiveTab("paymentMethods")}
        >
          <Wallet size={16} />
          <span>Payment Methods</span>
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="dashboard-content">
          <div className="section-header">
            <h2>Financial Overview</h2>
            <div className="comparison-selector">
              <span>Compare to:</span>
              <select value={comparisonPeriod} onChange={(e) => setComparisonPeriod(e.target.value)}>
                <option value="previous">Previous Period</option>
                <option value="lastYear">Last Year</option>
                <option value="none">No Comparison</option>
              </select>
            </div>
          </div>

          <div className="summary-metrics">
            <div className="metric-card">
              <div className="metric-icon revenue">
                <DollarSign size={24} />
              </div>
              <div className="metric-content">
                <h3>Total Revenue</h3>
                <div className="metric-value">{formatCurrency(financialMetrics.totalRevenue)}</div>
                <div className="metric-comparison positive">
                  <ArrowUpRight size={14} />
                  <span>+12.5% vs previous</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon collected">
                <Wallet size={24} />
              </div>
              <div className="metric-content">
                <h3>Collected</h3>
                <div className="metric-value">{formatCurrency(financialMetrics.paidAmount)}</div>
                <div className="metric-comparison positive">
                  <ArrowUpRight size={14} />
                  <span>+8.3% vs previous</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon pending">
                <Clock size={24} />
              </div>
              <div className="metric-content">
                <h3>Outstanding</h3>
                <div className="metric-value">{formatCurrency(financialMetrics.pendingAmount)}</div>
                <div className="metric-comparison negative">
                  <ArrowDownRight size={14} />
                  <span>-3.2% vs previous</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon transactions">
                <CreditCard size={24} />
              </div>
              <div className="metric-content">
                <h3>Transactions</h3>
                <div className="metric-value">{financialMetrics.transactionCount}</div>
                <div className="metric-comparison positive">
                  <ArrowUpRight size={14} />
                  <span>+15.7% vs previous</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon success-rate">
                <CheckCircle size={24} />
              </div>
              <div className="metric-content">
                <h3>Success Rate</h3>
                <div className="metric-value">{formatPercentage(financialMetrics.successRate)}</div>
                <div className="metric-comparison positive">
                  <ArrowUpRight size={14} />
                  <span>+2.1% vs previous</span>
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon avg-value">
                <TrendingUp size={24} />
              </div>
              <div className="metric-content">
                <h3>Avg. Transaction</h3>
                <div className="metric-value">{formatCurrency(financialMetrics.averageTransactionValue)}</div>
                <div className="metric-comparison negative">
                  <ArrowDownRight size={14} />
                  <span>-1.8% vs previous</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-header collapsible" onClick={() => toggleSection("revenueAnalysis")}>
              <h2>Revenue Analysis</h2>
              {expandedSections.revenueAnalysis ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {expandedSections.revenueAnalysis && (
              <div className="section-content">
                <div className="chart-controls">
                  <div className="chart-type-selector">
                    <button
                      className={`chart-type-btn ${chartType.revenue === "line" ? "active" : ""}`}
                      onClick={() => setChartType({ ...chartType, revenue: "line" })}
                    >
                      <Activity size={16} />
                      <span>Line</span>
                    </button>
                    <button
                      className={`chart-type-btn ${chartType.revenue === "bar" ? "active" : ""}`}
                      onClick={() => setChartType({ ...chartType, revenue: "bar" })}
                    >
                      <BarChart2 size={16} />
                      <span>Bar</span>
                    </button>
                    <button
                      className={`chart-type-btn ${chartType.revenue === "area" ? "active" : ""}`}
                      onClick={() => setChartType({ ...chartType, revenue: "area" })}
                    >
                      <TrendingUp size={16} />
                      <span>Area</span>
                    </button>
                  </div>
                </div>

                <div className="chart-container large">
                  <ResponsiveContainer width="100%" height={400}>
                    {chartType.revenue === "line" ? (
                      <LineChart data={financialMetrics.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `KSh ${value}`} />
                        <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Total Revenue" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="paid" name="Collected" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="pending" name="Outstanding" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    ) : chartType.revenue === "bar" ? (
                      <BarChart data={financialMetrics.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `KSh ${value}`} />
                        <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                        <Legend />
                        <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" />
                        <Bar dataKey="paid" name="Collected" fill="#10b981" />
                        <Bar dataKey="pending" name="Outstanding" fill="#f59e0b" />
                      </BarChart>
                    ) : (
                      <AreaChart data={financialMetrics.monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `KSh ${value}`} />
                        <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Total Revenue"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="paid"
                          name="Collected"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.2}
                        />
                        <Area
                          type="monotone"
                          dataKey="pending"
                          name="Outstanding"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="chart-grid">
                  <div className="chart-card">
                    <h3>Revenue by Venue</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financialMetrics.revenueByVenue} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => `KSh ${value}`} />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                          <Bar dataKey="revenue" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Revenue by Organizer</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financialMetrics.revenueByOrganizer} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(value) => `KSh ${value}`} />
                          <YAxis dataKey="name" type="category" width={120} />
                          <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                          <Bar dataKey="revenue" fill="#ec4899" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header collapsible" onClick={() => toggleSection("paymentMethods")}>
              <h2>Payment Methods</h2>
              {expandedSections.paymentMethods ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {expandedSections.paymentMethods && (
              <div className="section-content">
                <div className="chart-controls">
                  <div className="chart-type-selector">
                    <button
                      className={`chart-type-btn ${chartType.payments === "bar" ? "active" : ""}`}
                      onClick={() => setChartType({ ...chartType, payments: "bar" })}
                    >
                      <BarChart2 size={16} />
                      <span>Bar</span>
                    </button>
                    <button
                      className={`chart-type-btn ${chartType.payments === "pie" ? "active" : ""}`}
                      onClick={() => setChartType({ ...chartType, payments: "pie" })}
                    >
                      <PieChartIcon size={16} />
                      <span>Pie</span>
                    </button>
                    <button
                      className={`chart-type-btn ${chartType.payments === "radar" ? "active" : ""}`}
                      onClick={() => setChartType({ ...chartType, payments: "radar" })}
                    >
                      <Activity size={16} />
                      <span>Radar</span>
                    </button>
                  </div>
                </div>

                <div className="chart-grid">
                  <div className="chart-card">
                    <h3>Payment Methods by Amount</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        {chartType.payments === "bar" ? (
                          <BarChart data={enhancedPaymentMethodData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `KSh ${value}`} />
                            <Tooltip formatter={(value) => [`KSh ${value}`, "Amount"]} />
                            <Bar dataKey="amount" fill="#3b82f6">
                              {enhancedPaymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        ) : chartType.payments === "pie" ? (
                          <PieChart>
                            <Pie
                              data={enhancedPaymentMethodData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="amount"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {enhancedPaymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`KSh ${value}`, "Amount"]} />
                            <Legend />
                          </PieChart>
                        ) : (
                          <RadarChart outerRadius={90} data={enhancedPaymentMethodData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis tickFormatter={(value) => `KSh ${value}`} />
                            <Radar name="Amount" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Tooltip formatter={(value) => [`KSh ${value}`, "Amount"]} />
                          </RadarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Payment Methods by Count</h3>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        {chartType.payments === "bar" ? (
                          <BarChart data={enhancedPaymentMethodData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6">
                              {enhancedPaymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        ) : chartType.payments === "pie" ? (
                          <PieChart>
                            <Pie
                              data={enhancedPaymentMethodData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {enhancedPaymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        ) : (
                          <RadarChart outerRadius={90} data={enhancedPaymentMethodData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis />
                            <Radar name="Count" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                            <Tooltip />
                          </RadarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="payment-methods-table">
                  <h3>Payment Methods Summary</h3>
                  <div className="currency-note">
                    <p>
                      <strong>Note:</strong> PayPal transactions are shown in KES after conversion (1 USD = 3.84 KES)
                    </p>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payment Method</th>
                        <th>Transactions</th>
                        <th>Total Amount</th>
                        <th>Average Amount</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enhancedPaymentMethodData.map((method) => (
                        <tr
                          key={method.name}
                          className={method.name === "PayPal" || method.name === "M-Pesa" ? "highlighted-row" : ""}
                        >
                          <td>
                            <div className="payment-method-cell">
                              <div className="payment-method-icon" style={{ backgroundColor: method.color }}></div>
                              <span>{method.name}</span>
                            </div>
                          </td>
                          <td>{method.count}</td>
                          <td>{formatCurrency(method.amount, method.name === "PayPal" ? null : method.name)}</td>
                          <td>
                            {formatCurrency(
                              method.count > 0 ? method.amount / method.count : 0,
                              method.name === "PayPal" ? null : method.name,
                            )}
                          </td>
                          <td>{formatPercentage(method.percentage)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header collapsible" onClick={() => toggleSection("cashFlow")}>
              <h2>Cash Flow</h2>
              {expandedSections.cashFlow ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {expandedSections.cashFlow && (
              <div className="section-content">
                <div className="chart-container large">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={cashFlowData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" tickFormatter={(value) => `KSh ${value}`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "transactions" ? value : `KSh ${value}`,
                          name.charAt(0).toUpperCase() + name.slice(1),
                        ]}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="inflow" name="Inflow" fill="#10b981" />
                      <Bar yAxisId="left" dataKey="outflow" name="Outflow" fill="#ef4444" />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="transactions"
                        name="Transactions"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="net"
                        name="Net Flow"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container large">
                  <h3>Cumulative Cash Flow</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cashFlowData.cumulative}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `KSh ${value}`} />
                      <Tooltip formatter={(value) => [`KSh ${value}`, "Amount"]} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        name="Cumulative Cash"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header collapsible" onClick={() => toggleSection("transactions")}>
              <h2>Recent Transactions</h2>
              {expandedSections.transactions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {expandedSections.transactions && (
              <div className="section-content">
                <div className="transactions-table">
                  <div className="table-actions">
                    <button className="action-button" onClick={exportTransactionsTable}>
                      <Download size={16} />
                      <span>Export Table</span>
                    </button>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => handleSort("date")}>
                          <div className="th-content">
                            <span>Date</span>
                            {sortConfig.key === "date" && (
                              <span className="sort-icon">
                                {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                        </th>
                        <th>Transaction ID</th>
                        <th>Event</th>
                        <th>Method</th>
                        <th className="sortable" onClick={() => handleSort("amount")}>
                          <div className="th-content">
                            <span>Amount</span>
                            {sortConfig.key === "amount" && (
                              <span className="sort-icon">
                                {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </span>
                            )}
                          </div>
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings
                        .flatMap((booking) =>
                          (booking.paymentDetails || []).map((payment) => ({
                            ...payment,
                            bookingId: booking._id,
                            eventName: booking.response?.venueRequest?.eventName || "Unknown Event",
                            status: booking.status,
                          })),
                        )
                        .sort((a, b) => {
                          if (sortConfig.key === "date") {
                            return sortConfig.direction === "asc"
                              ? new Date(a.timestamp) - new Date(b.timestamp)
                              : new Date(b.timestamp) - new Date(a.timestamp)
                          }
                          if (sortConfig.key === "amount") {
                            return sortConfig.direction === "asc"
                              ? (a.amount || 0) - (b.amount || 0)
                              : (b.amount || 0) - (a.amount || 0)
                          }
                          return 0
                        })
                        .slice(0, 10)
                        .map((transaction, index) => (
                          <tr key={transaction._id || index}>
                            <td>{formatDate(transaction.timestamp)}</td>
                            <td>{transaction.transactionId}</td>
                            <td>{transaction.eventName}</td>
                            <td>{transaction.paymentMethod}</td>
                            <td>{formatCurrency(transaction.amount || 0, transaction.paymentMethod)}</td>
                            <td>
                              <span className={`status-badge ${transaction.status?.toLowerCase()}`}>
                                {transaction.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="action-btn view-btn"
                                onClick={() => viewTransactionDetails(transaction)}
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="transactions-content">
          <div className="section-header">
            <h2>All Transactions</h2>
            <div className="section-actions">
              <button className="action-button" onClick={exportTransactionsTable}>
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="transactions-summary">
            <div className="summary-item">
              <h3>Total Transactions</h3>
              <div className="summary-value">{financialMetrics.transactionCount}</div>
            </div>
            <div className="summary-item">
              <h3>Total Amount</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.paidAmount)}</div>
            </div>
            <div className="summary-item">
              <h3>Average Transaction</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.averageTransactionValue)}</div>
            </div>
          </div>

          <div className="transactions-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort("date")}>
                    <div className="th-content">
                      <span>Date & Time</span>
                      {sortConfig.key === "date" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Transaction ID</th>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Method</th>
                  <th className="sortable" onClick={() => handleSort("amount")}>
                    <div className="th-content">
                      <span>Amount</span>
                      {sortConfig.key === "amount" && (
                        <span className="sort-icon">
                          {sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings
                  .flatMap((booking) =>
                    (booking.paymentDetails || []).map((payment) => ({
                      ...payment,
                      bookingId: booking._id,
                      eventName: booking.response?.venueRequest?.eventName || "Unknown Event",
                      organizer: booking.organizer
                        ? `${booking.organizer.firstName} ${booking.organizer.lastName}`
                        : "Unknown",
                      status: booking.status,
                    })),
                  )
                  .sort((a, b) => {
                    if (sortConfig.key === "date") {
                      return sortConfig.direction === "asc"
                        ? new Date(a.timestamp) - new Date(b.timestamp)
                        : new Date(b.timestamp) - new Date(a.timestamp)
                    }
                    if (sortConfig.key === "amount") {
                      return sortConfig.direction === "asc"
                        ? (a.amount || 0) - (b.amount || 0)
                        : (b.amount || 0) - (a.amount || 0)
                    }
                    return 0
                  })
                  .map((transaction, index) => (
                    <tr key={transaction._id || index}>
                      <td>
                        {formatDate(transaction.timestamp)}
                        <div className="transaction-time">{formatTime(transaction.timestamp)}</div>
                      </td>
                      <td>{transaction.transactionId}</td>
                      <td>{transaction.eventName}</td>
                      <td>{transaction.organizer}</td>
                      <td>{transaction.paymentMethod}</td>
                      <td>{formatCurrency(transaction.amount || 0, transaction.paymentMethod)}</td>
                      <td>
                        <span className={`status-badge ${transaction.status?.toLowerCase()}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn view-btn" onClick={() => viewTransactionDetails(transaction)}>
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "revenue" && (
        <div className="revenue-content">
          <div className="section-header">
            <h2>Revenue Analysis</h2>
          </div>

          <div className="revenue-summary">
            <div className="summary-item">
              <h3>Total Revenue</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.totalRevenue)}</div>
            </div>
            <div className="summary-item">
              <h3>Collected</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.paidAmount)}</div>
            </div>
            <div className="summary-item">
              <h3>Outstanding</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.pendingAmount)}</div>
            </div>
            <div className="summary-item">
              <h3>Collection Rate</h3>
              <div className="summary-value">
                {formatPercentage(
                  financialMetrics.totalRevenue > 0
                    ? (financialMetrics.paidAmount / financialMetrics.totalRevenue) * 100
                    : 0,
                )}
              </div>
            </div>
          </div>

          <div className="chart-container large">
            <h3>Monthly Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={financialMetrics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `KSh ${value}`} />
                <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                <Legend />
                <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" />
                <Bar dataKey="paid" name="Collected" fill="#10b981" />
                <Bar dataKey="pending" name="Outstanding" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>Revenue by Venue</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={financialMetrics.revenueByVenue}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {financialMetrics.revenueByVenue.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Revenue by Organizer</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={financialMetrics.revenueByOrganizer}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {financialMetrics.revenueByOrganizer.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"][index % 5]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`KSh ${value}`, "Revenue"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="revenue-tables">
            <div className="revenue-table">
              <h3>Revenue by Venue</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Venue</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {financialMetrics.revenueByVenue.map((venue) => (
                    <tr key={venue.name}>
                      <td>{venue.name}</td>
                      <td>{formatCurrency(venue.revenue)}</td>
                      <td>{formatPercentage(venue.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="revenue-table">
              <h3>Revenue by Organizer</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organizer</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {financialMetrics.revenueByOrganizer.map((organizer) => (
                    <tr key={organizer.name}>
                      <td>{organizer.name}</td>
                      <td>{formatCurrency(organizer.revenue)}</td>
                      <td>{formatPercentage(organizer.percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "paymentMethods" && (
        <div className="payment-methods-content">
          <div className="section-header">
            <h2>Payment Methods Analysis</h2>
          </div>

          <div className="payment-summary">
            <div className="summary-item">
              <h3>Total Transactions</h3>
              <div className="summary-value">{financialMetrics.transactionCount}</div>
            </div>
            <div className="summary-item">
              <h3>Total Collected</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.paidAmount)}</div>
            </div>
            <div className="summary-item">
              <h3>Avg. Transaction Value</h3>
              <div className="summary-value">{formatCurrency(financialMetrics.averageTransactionValue)}</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="chart-card">
              <h3>Payment Methods by Amount</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={enhancedPaymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {enhancedPaymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`KSh ${value}`, "Amount"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>Payment Methods by Count</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enhancedPaymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Number of Transactions">
                      {enhancedPaymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="chart-container large">
            <h3>Payment Method Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={financialMetrics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `KSh ${value}`} />
                <Tooltip formatter={(value) => [`KSh ${value}`, "Amount"]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="paid"
                  name="All Payment Methods"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="payment-methods-table">
            <h3>Payment Methods Breakdown</h3>
            <div className="currency-note">
              <p>
                <strong>Note:</strong> PayPal transactions are shown in KES after conversion (1 USD = 3.84 KES)
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                  <th>Average Amount</th>
                  <th>Percentage of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {enhancedPaymentMethodData.map((method) => (
                  <tr
                    key={method.name}
                    className={method.name === "PayPal" || method.name === "M-Pesa" ? "highlighted-row" : ""}
                  >
                    <td>
                      <div className="payment-method-cell">
                        <div className="payment-method-icon" style={{ backgroundColor: method.color }}></div>
                        <span>{method.name}</span>
                      </div>
                    </td>
                    <td>{method.count}</td>
                    <td>{formatCurrency(method.amount, method.name === "PayPal" ? null : method.name)}</td>
                    <td>
                      {formatCurrency(
                        method.count > 0 ? method.amount / method.count : 0,
                        method.name === "PayPal" ? null : method.name,
                      )}
                    </td>
                    <td>{formatPercentage(method.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="payment-processing">
            <h3>Payment Processing Performance</h3>
            <div className="processing-metrics">
              <div className="processing-metric">
                <h4>Average Processing Time</h4>
                <div className="metric-value">1.2 seconds</div>
                <div className="metric-description">Average time to process a payment transaction</div>
              </div>
              <div className="processing-metric">
                <h4>Success Rate</h4>
                <div className="metric-value">98.7%</div>
                <div className="metric-description">Percentage of successful payment transactions</div>
              </div>
              <div className="processing-metric">
                <h4>Failed Transactions</h4>
                <div className="metric-value">{Math.round(financialMetrics.transactionCount * 0.013)}</div>
                <div className="metric-description">Number of failed payment attempts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="transaction-details-overlay">
          <div className="transaction-details-modal">
            <div className="modal-header">
              <h2>Transaction Details</h2>
              <button className="close-btn" onClick={closeTransactionDetails}>
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="transaction-detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value">{selectedTransaction.transactionId}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Date & Time</span>
                  <span className="detail-value">
                    {formatDate(selectedTransaction.timestamp)} at {formatTime(selectedTransaction.timestamp)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{selectedTransaction.paymentMethod}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Amount</span>
                  <span className="detail-value">
                    {formatCurrency(selectedTransaction.amount || 0, selectedTransaction.paymentMethod)}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Event</span>
                  <span className="detail-value">{selectedTransaction.eventName}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Organizer</span>
                  <span className="detail-value">{selectedTransaction.organizer}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedTransaction.status?.toLowerCase()}`}>
                      {selectedTransaction.status}
                    </span>
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value">{selectedTransaction.bookingId}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="action-button">
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>

              <button className="action-button">
                <Download size={16} />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .financial-report-container {
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

        .report-header {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
        }

        .date-range-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }

        .date-range-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .date-range-select {
          border: none;
          background: none;
          font-size: 0.875rem;
          color: #0f172a;
          cursor: pointer;
          padding-right: 1rem;
        }

        .custom-date-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }

        .date-input {
          border: none;
          font-size: 0.875rem;
          color: #0f172a;
          width: 130px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          color: #0f172a;
          border: 1px solid #e2e8f0;
        }

        .action-button:hover {
          background: #f8fafc;
        }

        .action-button.filter {
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
          min-width: 150px;
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
        }

        .export-options button:hover {
          background: #f8fafc;
        }

        .filters-panel {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .search-container {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
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

        .filter-group select {
          padding: 0.625rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .filters-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .reset-filters {
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .apply-filters {
          padding: 0.625rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          background: #3b82f6;
          color: white;
          border: none;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.5rem;
          overflow-x: auto;
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
          white-space: nowrap;
        }

        .tab-button:hover {
          color: #0f172a;
        }

        .tab-button.active {
          color: #3b82f6;
          border-bottom: 2px solid #3b82f6;
        }

        .section {
          background: white;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .section-header.collapsible {
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .section-header.collapsible:hover {
          background-color: #f8fafc;
        }

        .section-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          margin: 0;
        }

        .section-content {
          padding: 1.5rem;
        }

        .section-actions {
          display: flex;
          gap: 1rem;
        }

        .comparison-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .comparison-selector select {
          padding: 0.375rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          background: white;
          cursor: pointer;
        }

        .summary-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 0.5rem;
          color: white;
        }

        .metric-icon.revenue {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
        }

        .metric-icon.collected {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .metric-icon.pending {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .metric-icon.transactions {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .metric-icon.success-rate {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .metric-icon.avg-value {
          background: linear-gradient(135deg, #ec4899, #db2777);
        }

        .metric-content {
          flex: 1;
        }

        .metric-content h3 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin: 0 0 0.5rem 0;
        }

        .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .metric-comparison {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .metric-comparison.positive {
          color: #10b981;
        }

        .metric-comparison.negative {
          color: #ef4444;
        }

        .chart-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .chart-type-selector {
          display: flex;
          gap: 0.5rem;
        }

        .chart-type-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chart-type-btn.active {
          background: #f8fafc;
          color: #0f172a;
          border-color: #cbd5e1;
        }

        .chart-container {
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .chart-container.large {
          margin-bottom: 2rem;
        }

        .chart-container h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
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

        .payment-methods-table,
        .forecast-table,
        .transactions-table,
        .revenue-tables,
        .receivables-table {
          margin-top: 2rem;
        }

        .payment-methods-table h3,
        .forecast-table h3,
        .transactions-table h3,
        .revenue-tables h3,
        .receivables-table h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
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

        .data-table th.sortable {
          cursor: pointer;
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .sort-icon {
          display: inline-flex;
          align-items: center;
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

        .aging-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .aging-badge.current {
          background: #dcfce7;
          color: #10b981;
        }

        .aging-badge.thirtyDays {
          background: #fef3c7;
          color: #f59e0b;
        }

        .aging-badge.sixtyDays {
          background: #ffedd5;
          color: #f97316;
        }

        .aging-badge.ninetyDays {
          background: #fee2e2;
          color: #ef4444;
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
          color: #0f172a;
        }

        .transaction-time {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .forecast-metrics,
        .revenue-summary,
        .transactions-summary,
        .receivables-summary {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .forecast-metric,
        .summary-item {
          text-align: center;
        }

        .forecast-metric h3,
        .summary-item h3 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .forecast-value,
        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .forecast-value.positive,
        .summary-value.positive {
          color: #10b981;
        }

        .forecast-value.negative,
        .summary-value.negative {
          color: #ef4444;
        }

        .revenue-tables {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 1.5rem;
        }

        .revenue-table {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .transaction-details-overlay {
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

        .transaction-details-modal {
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

        .transaction-detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
        }

        .detail-value {
          font-size: 1rem;
          color: #0f172a;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .table-actions {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1rem;
        }

        .payment-methods-content {
          margin-bottom: 2rem;
        }

        .payment-summary {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .payment-method-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .payment-method-icon {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
        }

        .highlighted-row {
          background-color: #f8fafc;
          font-weight: 500;
        }

        .processing-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .processing-metric {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .processing-metric h4 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .processing-metric .metric-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .processing-metric .metric-description {
          font-size: 0.75rem;
          color: #64748b;
        }

        .payment-processing {
          margin-top: 2rem;
        }

        .payment-processing h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .currency-note {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background-color: #f0f9ff;
          border-left: 4px solid #0070ba;
          border-radius: 0.25rem;
        }

        .currency-note p {
          margin: 0;
          font-size: 0.875rem;
          color: #0f172a;
        }

        @media (max-width: 1024px) {
          .chart-grid {
            grid-template-columns: 1fr;
          }
          
          .revenue-tables {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .financial-report-container {
            padding: 1rem;
          }
          
          .report-header {
            flex-direction: column;
          }
          
          .header-actions {
            flex-direction: column;
            width: 100%;
          }
          
          .date-range-selector,
          .custom-date-range,
          .action-button {
            width: 100%;
          }
          
          .summary-metrics,
          .forecast-metrics,
          .revenue-summary,
          .transactions-summary,
          .receivables-summary {
            grid-template-columns: 1fr;
          }
          
          .transaction-detail-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .tabs {
            padding-bottom: 1rem;
          }
          
          .tab-button {
            padding: 0.5rem 0.75rem;
          }
          
          .section-header {
            padding: 1rem;
          }
          
          .section-content {
            padding: 1rem;
          }
          
          .data-table {
            font-size: 0.75rem;
          }
          
          .data-table th,
          .data-table td {
            padding: 0.75rem 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

