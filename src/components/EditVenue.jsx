import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function EditVenue({ isOpen, onClose, onSubmit, venue }) {
  const [venueData, setVenueData] = useState({
    name: "",
    location: "",
    capacity: "",
    pricePerDay: "",
    amenities: [],
    availability: true,
    description: "",
  });

  useEffect(() => {
    if (venue) {
      setVenueData({
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        pricePerDay: venue.pricePerDay,
        amenities: venue.amenities,
        availability: venue.availability,
        description: venue.description,
      });
    }
  }, [venue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVenueData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenitiesChange = (e) => {
    const amenities = e.target.value.split(",").map((item) => item.trim());
    setVenueData((prev) => ({ ...prev, amenities }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(venue._id, {
      ...venueData,
      capacity: Number(venueData.capacity),
      pricePerDay: Number(venueData.pricePerDay),
    });
  };

  if (!isOpen || !venue) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Edit Venue</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Venue Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={venueData.name}
              onChange={handleChange}
              required
            />
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
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              name="availability"
              value={venueData.availability}
              onChange={handleChange}
            >
              <option value={true}>Available</option>
              <option value={false}>Booked</option>
            </select>
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
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Update Venue
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
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
            0 1px 3px rgba(0, 0, 0, 0.08);
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
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a202c;
        }

        .close-btn {
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #1a202c;
        }

        .form-group {
          margin-bottom: 1.5rem;
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
          color: #4a5568;
        }

        input,
        select,
        textarea {
          width: 100%;
          padding: 0.625rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          font-size: 1rem;
          color: #1a202c;
          transition: border-color 0.2s;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
        }

        textarea {
          height: 100px;
          resize: vertical;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #4299e1;
          color: white;
          border: none;
        }

        .btn-primary:hover {
          background: #3182ce;
        }

        .btn-secondary {
          background: white;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f7fafc;
        }

        @media (max-width: 640px) {
          .modal {
            width: 95%;
            padding: 1.5rem;
          }

          .form-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
