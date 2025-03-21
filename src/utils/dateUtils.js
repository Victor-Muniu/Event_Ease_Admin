export const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  
    return date.toLocaleDateString("en-US", options)
  }
  
  export const isDateInMonth = (date, month, year) => {
    return date.getMonth() === month && date.getFullYear() === year
  }
  
  export const getMonthName = (month) => {
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
    ]
  
    return monthNames[month]
  }
  
  