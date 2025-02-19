import React from "react";
import { MapPin, Users, Calendar } from "lucide-react";

const EventGroundCard = ({ ground, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700";
      case "Booked":
        return "bg-amber-100 text-amber-700";
      case "Maintenance":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="event-ground-card">
      <div className="image-container">
        <img src={ground.images[0]} alt={ground.name} />
      </div>

      <div className="content">
        <div className="header">
          <h3>{ground.name}</h3>
          <span className={`status ${getStatusColor(ground.availability)}`}>
            {ground.availability}
          </span>
        </div>

        <div className="details">
          <div className="detail-item">
            <MapPin size={16} />
            <span>{ground.location.coordinates}</span>
          </div>
          <div className="detail-item">
            <Users size={16} />
            <span>{ground.capacity} guests</span>
          </div>
          
            <div className="detail-item">
              <Calendar size={16} />
              <span>{ground.description}</span>
            </div>
        
        </div>

        <div className="actions">
          <button className="edit-button" onClick={() => onEdit(ground.id)}>
            Edit
          </button>
          <button className="delete-button" onClick={() => onDelete(ground.id)}>
            Delete
          </button>
        </div>
      </div>

      <style jsx>{`
        .event-ground-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .image-container {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .content {
          padding: 1rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .status {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          background:rgb(242, 254, 226);
          color:rgb(8, 138, 67);
        }

        .details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.875rem;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
        }

        .edit-button,
        .delete-button {
          flex: 1;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-button {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #0f172a;
        }

        .edit-button:hover {
          background: #f1f5f9;
        }

        .delete-button {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #ef4444;
        }

        .delete-button:hover {
          background: #fecaca;
        }
      `}</style>
    </div>
  );
};

export default EventGroundCard;
