import { useState } from "react"
import { X } from "lucide-react"

export default function AddEquipment({ isOpen, onClose, onSubmit }) {
  const [equipmentData, setEquipmentData] = useState({
    name: "",
    category: "",
    description: "",
    quantityAvailable: "",
    rentalPricePerDay: "",
    condition: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setEquipmentData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...equipmentData,
      quantityAvailable: Number(equipmentData.quantityAvailable),
      rentalPricePerDay: Number(equipmentData.rentalPricePerDay),
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Equipment</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Equipment Name</label>
            <input type="text" id="name" name="name" value={equipmentData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={equipmentData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={equipmentData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantityAvailable">Quantity Available</label>
              <input
                type="number"
                id="quantityAvailable"
                name="quantityAvailable"
                value={equipmentData.quantityAvailable}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rentalPricePerDay">Price per Day</label>
              <input
                type="number"
                id="rentalPricePerDay"
                name="rentalPricePerDay"
                value={equipmentData.rentalPricePerDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select id="condition" name="condition" value={equipmentData.condition} onChange={handleChange} required>
              <option value="">Select condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Equipment
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 8px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
        }

        .close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-row .form-group {
          flex: 1;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }

        textarea {
          height: 100px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn-primary,
        .btn-secondary {
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

        @media (max-width: 640px) {
          .form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}

