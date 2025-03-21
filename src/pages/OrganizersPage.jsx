import { useEffect, useState } from "react"
import {
  Search,
  X,
  ChevronRight,
  Filter,
  Calendar,
  Phone,
  Mail,
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react"


export default function OrganizersTableView() {
  const [organizers, setOrganizers] = useState([])
  const [filteredOrganizers, setFilteredOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrganizer, setSelectedOrganizer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const response = await fetch("http://localhost:3002/organizers")

        if (!response.ok) {
          throw new Error("Failed to fetch organizers")
        }

        const data = await response.json()
        setOrganizers(data)
        setFilteredOrganizers(data)
      } catch (err) {
        setError("Error fetching organizers. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrganizers(organizers)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = organizers.filter(
      (org) =>
        org.firstName.toLowerCase().includes(term) ||
        org.lastName.toLowerCase().includes(term) ||
        org.email.toLowerCase().includes(term) ||
        org.organizationName.toLowerCase().includes(term) ||
        org.phone.includes(term),
    )

    setFilteredOrganizers(filtered)
  }, [searchTerm, organizers])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const openModal = (organizer) => {
    setSelectedOrganizer(organizer)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = "auto"
  }

  const handleSort = (field) => {
    const isAsc = sortField === field && sortDirection === "asc"
    setSortDirection(isAsc ? "desc" : "asc")
    setSortField(field)

    const sorted = [...filteredOrganizers].sort((a, b) => {
      if (field === "firstName") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return isAsc ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB)
      }

      if (field === "createdAt") {
        return isAsc
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      if (field === "isVerified") {
        return isAsc ? (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0) : (a.isVerified ? 1 : 0) - (b.isVerified ? 1 : 0)
      }

      const valueA = String(a[field]).toLowerCase()
      const valueB = String(b[field]).toLowerCase()
      return isAsc ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
    })

    setFilteredOrganizers(sorted)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading organizers...</p>
      </div>
    )
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="organizers-page">
      <div className="header">
        <div className="header-content">
          <h1>Event Organizers</h1>
          <p>View and manage all registered event organizers in our system</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, organization..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button className="filter-button">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      <div className="table-container">
        {filteredOrganizers.length === 0 ? (
          <div className="no-results">
            <p>No organizers found matching your search criteria</p>
          </div>
        ) : (
          <table className="organizers-table">
            <thead>
              <tr>
                <th onClick={() => handleSort("firstName")} className="sortable-header">
                  <span>Name</span>
                  {sortField === "firstName" && (
                    <ArrowUpDown size={14} className={sortDirection === "asc" ? "sort-icon asc" : "sort-icon desc"} />
                  )}
                </th>
                <th onClick={() => handleSort("organizationName")} className="sortable-header">
                  <span>Organization</span>
                  {sortField === "organizationName" && (
                    <ArrowUpDown size={14} className={sortDirection === "asc" ? "sort-icon asc" : "sort-icon desc"} />
                  )}
                </th>
                <th onClick={() => handleSort("email")} className="sortable-header">
                  <span>Contact</span>
                  {sortField === "email" && (
                    <ArrowUpDown size={14} className={sortDirection === "asc" ? "sort-icon asc" : "sort-icon desc"} />
                  )}
                </th>
                <th onClick={() => handleSort("isVerified")} className="sortable-header">
                  <span>Status</span>
                  {sortField === "isVerified" && (
                    <ArrowUpDown size={14} className={sortDirection === "asc" ? "sort-icon asc" : "sort-icon desc"} />
                  )}
                </th>
                <th onClick={() => handleSort("createdAt")} className="sortable-header">
                  <span>Joined</span>
                  {sortField === "createdAt" && (
                    <ArrowUpDown size={14} className={sortDirection === "asc" ? "sort-icon asc" : "sort-icon desc"} />
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganizers.map((organizer) => (
                <tr key={organizer._id} className="organizer-row" onClick={() => openModal(organizer)}>
                  <td className="name-cell">
                    <div className="name-container">
                      <div className="avatar">
                        {organizer.firstName.charAt(0)}
                        {organizer.lastName.charAt(0)}
                      </div>
                      <div className="name-details">
                        <div className="full-name">
                          {organizer.firstName} {organizer.lastName}
                        </div>
                        <div className="org-name">{organizer.organizationName}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="org-cell">
                      <Building size={16} />
                      <span>{organizer.organizationName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <div className="contact-item">
                        <Mail size={14} />
                        <span>{organizer.email}</span>
                      </div>
                      <div className="contact-item">
                        <Phone size={14} />
                        <span>{organizer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`status-badge ${organizer.isVerified ? "verified" : "unverified"}`}>
                      {organizer.isVerified ? (
                        <>
                          <CheckCircle size={14} /> Verified
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> Unverified
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="joined-cell">
                      <Calendar size={14} />
                      <span>{new Date(organizer.createdAt).toLocaleDateString()}</span>
                      <ChevronRight size={16} className="view-details" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && selectedOrganizer && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <h2>
                {selectedOrganizer.firstName} {selectedOrganizer.lastName}
              </h2>
              <div className={`status-badge ${selectedOrganizer.isVerified ? "verified" : "unverified"}`}>
                {selectedOrganizer.isVerified ? (
                  <>
                    <CheckCircle size={14} /> Verified
                  </>
                ) : (
                  <>
                    <XCircle size={14} /> Unverified
                  </>
                )}
              </div>
            </div>

            <div className="modal-body">
              <div className="detail-group">
                <h3>Organization</h3>
                <div className="detail-item">
                  <Building size={16} />
                  <span>{selectedOrganizer.organizationName}</span>
                </div>
              </div>

              <div className="detail-group">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <Mail size={16} />
                  <span>{selectedOrganizer.email}</span>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <span>{selectedOrganizer.phone}</span>
                </div>
                <div className="detail-item">
                  <MapPin size={16} />
                  <span>{selectedOrganizer.address}</span>
                </div>
              </div>

              <div className="detail-group">
                <h3>Account Details</h3>
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>
                    Joined on{" "}
                    {new Date(selectedOrganizer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            
          </div>
        </div>
      )}

      <style jsx>{`
         :root {
          --primary-color: #5046e5;
          --primary-light: #eeecff;
          --secondary-color: #2d3748;
          --success-color: #0ca678;
          --success-bg: #e6f8f3;
          --warning-color: #e67700;
          --warning-bg: #fff4e6;
          --border-color: #e2e8f0;
          --bg-color: #f7f9fc;
          --card-bg: #ffffff;
          --text-primary: #1a202c;
          --text-secondary: #4a5568;
          --text-muted: #718096;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
          --shadow-lg: 0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.05);
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
        }

        .organizers-page {
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        /* Header styles */
        .header {
          background-color: var(--card-bg);
          border-bottom: 1px solid var(--border-color);
          padding: 1.5rem 0;
          margin-bottom: 2rem;
        }

        .header-content {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .header p {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        /* Controls */
        .controls {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto 1.5rem;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-container {
          flex: 1;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-input {
          width: 90%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          background-color: var(--card-bg);
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(80, 70, 229, 0.1);
        }

        .filter-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-button:hover {
          background-color: var(--primary-light);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        /* Table Container */
        .table-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
          background-color: var(--card-bg);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          margin-bottom: 2rem;
        }

        /* Unique Table Styling */
        .organizers-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .organizers-table thead {
          background-color: var(--primary-light);
        }

        .organizers-table th {
          padding: 1rem;
          font-weight: 600;
          color: var(--primary-color);
          text-align: left;
          border-bottom: 2px solid var(--primary-color);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sortable-header {
          cursor: pointer;
          user-select: none;
          position: relative;
          padding-right: 1.5rem;
          transition: all 0.2s ease;
        }

        .sortable-header:hover {
          background-color: rgba(80, 70, 229, 0.15);
        }

        .sort-icon {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          transition: transform 0.2s ease;
        }

        .sort-icon.asc {
          transform: translateY(-50%) rotate(180deg);
        }

        .organizer-row {
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .organizer-row:hover {
          background-color: var(--primary-light);
        }

        .organizer-row::after {
          content: '';
          position: absolute;
          left: 0;
          width: 4px;
          height: 0;
          background-color: var(--primary-color);
          top: 50%;
          transform: translateY(-50%);
          transition: height 0.2s ease;
        }

        .organizer-row:hover::after {
          height: 70%;
        }

        .organizer-row td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .organizer-row:last-child td {
          border-bottom: none;
        }

        /* Custom Cell Styling */
        .name-cell {
          width: 25%;
        }

        .name-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .name-details {
          display: flex;
          flex-direction: column;
        }

        .full-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .org-name {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .org-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          width: fit-content;
        }

        .status-badge.verified {
          background-color: var(--success-bg);
          color: var(--success-color);
        }

        .status-badge.unverified {
          background-color: var(--warning-bg);
          color: var(--warning-color);
        }

        .joined-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .view-details {
          color: var(--primary-color);
          margin-left: auto;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background-color: var(--card-bg);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
          position: relative;
        }

        .close-modal {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-modal:hover {
          background-color: var(--border-color);
          color: var(--text-primary);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-group h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .action-button {
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-button.primary {
          background-color: var(--primary-color);
          color: white;
          border: none;
        }

        .action-button.primary:hover {
          background-color: #4338ca;
        }

        .action-button.secondary {
          background-color: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .action-button.secondary:hover {
          background-color: var(--bg-color);
        }

        /* Loading and error states */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 50vh;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
          color: #e53e3e;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .organizers-table th:nth-child(2),
          .organizers-table td:nth-child(2) {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
          }
          
          .filter-button {
            width: 100%;
            justify-content: center;
          }
          
          .organizers-table th:nth-child(4),
          .organizers-table td:nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .organizers-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  )
}

