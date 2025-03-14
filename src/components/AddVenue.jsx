import { useState } from "react"
import { X } from "lucide-react"

export default function AddVenueModal({ isOpen, onClose, onSubmit }) {
  const [venueData, setVenueData] = useState({
    name: "",
    location: "",
    capacity: "",
    pricePerDay: "",
    amenities: [],
    availability: true,
    description: "",
    images: ["", ""],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setVenueData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAmenitiesChange = (e) => {
    const amenities = e.target.value.split(",").map((item) => item.trim())
    setVenueData((prev) => ({ ...prev, amenities }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...venueData,
      capacity: Number.parseInt(venueData.capacity),
      pricePerDay: Number.parseInt(venueData.pricePerDay),
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Add New Venue</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Venue Name</label>
            <input type="text" id="name" name="name" value={venueData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={venueData.location}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={venueData.capacity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pricePerDay">Price Per Day</label>
              <input
                type="number"
                id="pricePerDay"
                name="pricePerDay"
                value={venueData.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="amenities">Amenities (comma-separated)</label>
            <input
              type="text"
              id="amenities"
              name="amenities"
              value={venueData.amenities.join(", ")}
              onChange={handleAmenitiesChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={venueData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="image1">Image URL 1</label>
            <input
              type="url"
              id="image1"
              name="images"
              value={venueData.images[0]}
              onChange={(e) => setVenueData((prev) => ({ ...prev, images: [e.target.value, prev.images[1]] }))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="image2">Image URL 2</label>
            <input
              type="url"
              id="image2"
              name="images"
              value={venueData.images[1]}
              onChange={(e) => setVenueData((prev) => ({ ...prev, images: [prev.images[0], e.target.value] }))}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Venue
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
          border-radius: 0.5rem;
          padding: 2rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
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
      `}</style>
    </div>
  )
}

