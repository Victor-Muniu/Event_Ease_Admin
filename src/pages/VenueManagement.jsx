import { useState, useEffect } from "react"
import { Search, Plus, Download, Edit, Trash, ExternalLink } from "lucide-react"
import AddVenue from "../components/AddVenue"
import EditVenue from "../components/EditVenue"
import Delete from "../components/Delete"

export default function VenueManagement() {
  const [venues, setVenues] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    location: "Select Location",
    capacity: "Select Capacity",
    status: "Select Status",
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [venueToDelete, setVenueToDelete] = useState(null)
  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await fetch("http://localhost:3002/venues")
      const data = await response.json()
      setVenues(data)
    } catch (error) {
      console.error("Error fetching venues:", error)
    }
  }

  const handleAddVenue = async (newVenue) => {
    try {
      const response = await fetch("http://localhost:3002/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVenue),
        credentials: "include",
      })

      if (response.ok) {
        fetchVenues()
        setIsAddModalOpen(false)
      } else {
        console.error("Failed to add venue")
      }
    } catch (error) {
      console.error("Error adding venue:", error)
    }
  }

  const handleEditVenue = (venue) => {
    setSelectedVenue(venue)
    setIsEditModalOpen(true)
  }

  const handlePatchVenue = async (venueId, patchData) => {
    try {
      const response = await fetch(`http://localhost:3002/venues/${venueId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
        credentials: "include",
      })

      if (response.ok) {
        fetchVenues()
        setIsEditModalOpen(false)
      } else {
        console.error("Failed to patch venue")
      }
    } catch (error) {
      console.error("Error patching venue:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KSH",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = filters.location === "Select Location" || venue.location === filters.location
    const matchesCapacity =
      filters.capacity === "Select Capacity" ||
      (filters.capacity === "0-1000" && venue.capacity <= 1000) ||
      (filters.capacity === "1001-5000" && venue.capacity > 1000 && venue.capacity <= 5000) ||
      (filters.capacity === "5001+" && venue.capacity > 5000)
    const matchesStatus =
      filters.status === "Select Status" ||
      (filters.status === "Available" && venue.availability) ||
      (filters.status === "Booked" && !venue.availability)

    return matchesSearch && matchesLocation && matchesCapacity && matchesStatus
  })

  const handleDeleteVenue = (venue) => {
    setVenueToDelete(venue)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteVenue = async () => {
    if (!venueToDelete) return

    try {
      const response = await fetch(`http://localhost:3002/venues/${venueToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchVenues()
        setIsDeleteModalOpen(false)
        setVenueToDelete(null)
      } else {
        console.error("Failed to delete venue")
      }
    } catch (error) {
      console.error("Error deleting venue:", error)
    }
  }


  const handleViewVenue = (venueId) => {
   
    console.log("View venue:", venueId)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Venue Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add New Venue
          </button>
          <button className="btn-secondary">
            <Download size={16} />
            Export
          </button>
        </div>
      </header>

      <div className="filters">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="filter-select"
        >
          <option>Select Location</option>
          {[...new Set(venues.map((venue) => venue.location))].map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>

        <select
          value={filters.capacity}
          onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
          className="filter-select"
        >
          <option>Select Capacity</option>
          <option>0-1000</option>
          <option>1001-5000</option>
          <option>5001+</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="filter-select"
        >
          <option>Select Status</option>
          <option>Available</option>
          <option>Booked</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>VENUE NAME</th>
              <th>LOCATION</th>
              <th>CAPACITY</th>
              <th>PRICE/DAY</th>
              <th>STATUS</th>
              <th>DATE ADDED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredVenues.map((venue) => (
              <tr key={venue._id}>
                <td>{venue.name}</td>
                <td>{venue.location}</td>
                <td>{venue.capacity.toLocaleString()}</td>
                <td>{formatPrice(venue.pricePerDay)}</td>
                <td>
                  <span className={`status-badge ${venue.availability ? "available" : "booked"}`}>
                    {venue.availability ? "Available" : "Booked"}
                  </span>
                </td>
                <td>{formatDate(venue.createdAt)}</td>
                <td>
                  <div className="actions">
                    <button className="action-btn edit" onClick={() => handleEditVenue(venue)}>
                      <Edit size={14} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteVenue(venue._id)}>
                      <Trash size={14} />
                    </button>
                    <button className="action-btn view" onClick={() => handleViewVenue(venue._id)}>
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddVenue isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddVenue} />
      <EditVenue
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handlePatchVenue}
        venue={selectedVenue}
      />
      <Delete
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteVenue}
        venueName={venueToDelete?.name}
      />


      <style jsx>{`
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
          border: none;
        }

        .btn-secondary {
          background: white;
          color: #1e293b;
          border: 1px solid #e2e8f0;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-container {
          position: relative;
          flex: 1;
        }

        .search-container input {
          width: 90%;
          padding: 0.625rem 1rem 0.625rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          width: 1rem;
          height: 1rem;
        }

        .filter-select {
          padding: 0.625rem 2rem 0.625rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
          cursor: pointer;
          min-width: 140px;
        }

        .table-container {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 1rem;
          font-size: 0.875rem;
          color: #1e293b;
          border-bottom: 1px solid #e2e8f0;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.available {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.booked {
          background: #fee2e2;
          color: #991b1b;
        }

        .manager {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .manager-avatar {
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.375rem;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .action-btn.edit {
          color: #3b82f6;
          background: #eff6ff;
        }

        .action-btn.delete {
          color: #ef4444;
          background: #fee2e2;
        }

        .action-btn.view {
          color: #10b981;
          background: #dcfce7;
        }

        @media (max-width: 1024px) {
          .filters {
            flex-wrap: wrap;
          }

          .search-container {
            width: 100%;
          }

          .filter-select {
            flex: 1;
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

          .btn-primary,
          .btn-secondary {
            flex: 1;
            justify-content: center;
          }

          .table-container {
            overflow-x: auto;
          }

          table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  )
}

