import { useState, useEffect, useMemo } from "react"
import { Search, Plus } from "lucide-react"
import EventGroundCard from "../components/EventGroundCard"
import CreateEventGroundModal from "../components/CreateEventGroundModal"

export default function EventGroundsManagement() {
  const [grounds, setGrounds] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    status: "All Statuses",
    capacity: "All Capacities",
    location: "All Locations",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const groundsPerPage = 6

  useEffect(() => {
    fetchEventGrounds()
  }, [])

  const fetchEventGrounds = async () => {
    try {
      const response = await fetch("http://localhost:3002/event-grounds")
      const data = await response.json()
      setGrounds(data)
    } catch (error) {
      console.error("Error fetching event grounds:", error)
    }
  }

  const handleCreateGround = async (groundData) => {
    try {
      const response = await fetch("http://localhost:3002/event-grounds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groundData),
      })

      if (response.ok) {
        fetchEventGrounds()
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("Error creating event ground:", error)
    }
  }

  const handleEdit = (id) => {
    console.log("Edit ground:", id)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event ground?")) {
      try {
        await fetch(`http://localhost:3002/event-grounds/${id}`, {
          method: "DELETE",
        })
        fetchEventGrounds()
      } catch (error) {
        console.error("Error deleting event ground:", error)
      }
    }
  }

  const filteredGrounds = useMemo(() => {
    return grounds.filter((ground) => {
      const matchesSearch = ground.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filters.status === "All Statuses" || ground.availability === filters.status
      const matchesCapacity =
        filters.capacity === "All Capacities" ||
        (filters.capacity === "0-100" && ground.capacity <= 100) ||
        (filters.capacity === "101-500" && ground.capacity > 100 && ground.capacity <= 500) ||
        (filters.capacity === "501+" && ground.capacity > 500)
      const matchesLocation = filters.location === "All Locations" || ground.location.area === filters.location

      return matchesSearch && matchesStatus && matchesCapacity && matchesLocation
    })
  }, [grounds, searchQuery, filters])

  const indexOfLastGround = currentPage * groundsPerPage
  const indexOfFirstGround = indexOfLastGround - groundsPerPage
  const currentGrounds = filteredGrounds.slice(indexOfFirstGround, indexOfLastGround)
  const totalPages = Math.ceil(filteredGrounds.length / groundsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className="event-grounds">
      <header>
        <div>
          <h1>Event Grounds Management</h1>
          <p>Create, manage, and update your event grounds easily.</p>
        </div>
        <button className="create-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Create New Event Ground
        </button>
      </header>

      <div className="filters">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search event grounds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option>All Statuses</option>
          <option>Available</option>
          <option>Booked</option>
          <option>Maintenance</option>
        </select>

        <select value={filters.capacity} onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}>
          <option>All Capacities</option>
          <option>0-100</option>
          <option>101-500</option>
          <option>501+</option>
        </select>

        <select value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
          <option>All Locations</option>
          <option>Downtown</option>
          <option>Suburbs</option>
          <option>City Center</option>
        </select>
      </div>

      <div className="grounds-grid">
        {currentGrounds.map((ground) => (
          <EventGroundCard key={ground.id} ground={ground} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      <div className="pagination">
        <button className="page-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <div className="page-numbers">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-number ${currentPage === index + 1 ? "active" : ""}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          className="page-button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      <CreateEventGroundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGround}
      />

      <style jsx>{`
        .event-grounds {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        header h1 {
          font-size: 1.875rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
        }

        header p {
          color: #64748b;
          margin: 0;
        }

        .create-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .create-button:hover {
          background: #059669;
        }

        .filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }

        .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
        }

        select {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #1e293b;
          font-size: 0.875rem;
          cursor: pointer;
        }

        .grounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .page-button {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #1e293b;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-button:not(:disabled):hover {
          background-color: #f1f5f9;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .page-number {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #1e293b;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }

        .page-number:hover {
          background-color: #f1f5f9;
        }

        .page-number.active {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }
      `}</style>
    </div>
  )
}

