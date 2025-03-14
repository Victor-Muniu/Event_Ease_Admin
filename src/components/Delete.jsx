import { X } from "lucide-react"

export default function Delete({ isOpen, onClose, onConfirm, venueName }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Confirm Deletion</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          <p>Are you sure you want to delete the venue "{venueName}"?</p>
          <p>This action cannot be undone.</p>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Delete
          </button>
        </div>
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
          max-width: 400px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .modal-header h2 {
          font-size: 1.25rem;
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

        .modal-content {
          margin-bottom: 1.5rem;
        }

        .modal-content p {
          margin-bottom: 0.5rem;
          color: #4a5568;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .btn-secondary,
        .btn-danger {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: white;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover {
          background: #f7fafc;
        }

        .btn-danger {
          background: #f56565;
          color: white;
          border: none;
        }

        .btn-danger:hover {
          background: #e53e3e;
        }
      `}</style>
    </div>
  )
}
