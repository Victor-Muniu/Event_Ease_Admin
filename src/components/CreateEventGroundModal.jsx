import React, { useState } from "react";
import { X } from "lucide-react";

const CreateEventGroundModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: {
      type: "Point",
      coordinates: [0, 0], // Default coordinates
    },
    capacity: "",
    availability: "Available",
    pricePerDay: "",
    amenities: [],
    description: "",
    images: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Event Ground</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Venue Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="pricePerDay">Price Per Day</label>
              <input
                type="number"
                id="pricePerDay"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerDay: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="availability">Availability</label>
            <select
              id="availability"
              value={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.value })
              }
            >
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amenities">Amenities</label>
            <div className="amenities-group">
              {[
                "Restrooms",
                "Parking",
                "Stage",
                "WiFi",
                "Security",
                "Catering",
              ].map((amenity) => (
                <label key={amenity} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => {
                      const newAmenities = e.target.checked
                        ? [...formData.amenities, amenity]
                        : formData.amenities.filter((a) => a !== amenity);
                      setFormData({ ...formData, amenities: newAmenities });
                    }}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="images">Images</label>
            <input
              type="text"
              id="image-url"
              placeholder="Enter image URL"
              onChange={(e) => {
                setFormData({
                  ...formData,
                  images: e.target.value.split(",").map((url) => url.trim()), // Handles multiple image URLs
                });
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              value={formData.location.coordinates[0]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    coordinates: [parseFloat(e.target.value), formData.location.coordinates[1]],
                  },
                })
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              value={formData.location.coordinates[1]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: {
                    ...formData.location,
                    coordinates: [formData.location.coordinates[0], parseFloat(e.target.value)],
                  },
                })
              }
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Event Ground
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
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
        }

        form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #1e293b;
          font-size: 0.875rem;
          font-weight: 500;
        }

        input,
        select,
        textarea {
          width: 90%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #2563eb;
          ring: 2px solid #2563eb;
        }

        .amenities-group {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #1e293b;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .submit-button,
        .cancel-button {
          flex: 1;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-button {
          background: #10b981;
          color: white;
          border: none;
        }

        .submit-button:hover {
          background: #059669;
        }

        .cancel-button {
          background: white;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }

        .cancel-button:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default CreateEventGroundModal;
