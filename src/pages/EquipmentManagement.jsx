import { useState, useEffect } from "react"
import { Search, Plus, Download, Edit, Trash, History, BarChart2, PieChart, ListOrdered } from "lucide-react"
import AddEquipment from "../components/AddEquipment"
import EditEquipment from "../components/EditEquipment"
import DeleteConfirm from "../components/DeleteConfirm"

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch("http://localhost:3002/equipment")
      const data = await response.json()
      setEquipment(data)
    } catch (error) {
      console.error("Error fetching equipment:", error)
    }
  }

  const handleAddEquipment = async (newEquipment) => {
    try {
      const response = await fetch("http://localhost:3002/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEquipment),
        credentials: "include",
      })

      if (response.ok) {
        fetchEquipment()
        setIsAddModalOpen(false)
      } else {
        console.error("Failed to add equipment")
      }
    } catch (error) {
      console.error("Error adding equipment:", error)
    }
  }

  const handleEditEquipment = (equipment) => {
    setSelectedEquipment(equipment)
    setIsEditModalOpen(true)
  }

  const handlePatchEquipment = async (equipmentId, patchData) => {
    try {
      const response = await fetch(`http://localhost:3002/equipment/${equipmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patchData),
        credentials: "include",
      })

      if (response.ok) {
        fetchEquipment()
        setIsEditModalOpen(false)
      } else {
        console.error("Failed to update equipment")
      }
    } catch (error) {
      console.error("Error updating equipment:", error)
    }
  }

  const handleDeleteClick = (equipment) => {
    setSelectedEquipment(equipment)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return

    try {
      const response = await fetch(`http://localhost:3002/equipment/${selectedEquipment._id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        fetchEquipment()
        setIsDeleteModalOpen(false)
        setSelectedEquipment(null)
      } else {
        console.error("Failed to delete equipment")
      }
    } catch (error) {
      console.error("Error deleting equipment:", error)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "KSH",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Available" && item.quantityAvailable > 0) ||
      (statusFilter === "Out of Stock" && item.quantityAvailable === 0)

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="container">
      <header className="header">
        <h1>Equipment Management</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            Add Equipment
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
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
          <option>All Categories</option>
          {[...new Set(equipment.map((item) => item.category))].map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
          <option>All Status</option>
          <option>Available</option>
          <option>Out of Stock</option>
        </select>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <ListOrdered size={24} />
          </div>
          <div className="metric-content">
            <h3>Most Rented Equipment</h3>
            <div className="metric-chart"></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <BarChart2 size={24} />
          </div>
          <div className="metric-content">
            <h3>Usage Trends</h3>
            <div className="metric-chart"></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <PieChart size={24} />
          </div>
          <div className="metric-content">
            <h3>Equipment Distribution</h3>
            <div className="metric-chart"></div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>EQUIPMENT NAME</th>
              <th>DESCRIPTION</th>
              <th>CATEGORY</th>
              <th>CONDITION</th>
              <th>PRICE/DAY</th>
              <th>QUANTITY</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipment.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.category}</td>
                <td>{item.condition}</td>
                <td>{formatPrice(item.rentalPricePerDay)}</td>
                <td>{item.quantityAvailable}</td>
                <td>
                  <span className={`status-badge ${item.quantityAvailable > 0 ? "available" : "out-of-stock"}`}>
                    {item.quantityAvailable > 0 ? "Available" : "Out of Stock"}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="action-btn edit" onClick={() => handleEditEquipment(item)}>
                      <Edit size={14} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteClick(item)}>
                      <Trash size={14} />
                    </button>
                    <button className="action-btn history">
                      <History size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddEquipment
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEquipment}
      />

      <EditEquipment
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handlePatchEquipment}
        equipment={selectedEquipment}
      />

      <DeleteConfirm
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEquipment}
        equipmentName={selectedEquipment?.name}
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

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          border-radius: 0.5rem;
          padding: 1.5rem;
          display: flex;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          background: #eff6ff;
          border-radius: 0.5rem;
          color: #3b82f6;
        }

        .metric-content h3 {
          font-size: 1rem;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .metric-chart {
          height: 100px;
          background: #f8fafc;
          border-radius: 0.375rem;
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

        .status-badge.out-of-stock {
          background: #fee2e2;
          color: #991b1b;
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

        .action-btn.history {
          color: #10b981;
          background: #dcfce7;
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

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

