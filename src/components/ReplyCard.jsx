import { useState } from "react";

export default function ReplyCard({ eventRequestId, onClose }) {
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3002/event-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventRequestId,
          responseMessage,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        onClose();
      } else {
        console.error("Failed to submit reply");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  return (
    <div className="reply-card">
      <form onSubmit={handleSubmit}>
        <textarea
          value={responseMessage}
          onChange={(e) => setResponseMessage(e.target.value)}
          placeholder="Type your reply here..."
          rows={4}
        />
        <div className="button-container">
          <button type="submit">Send Reply</button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
      <style jsx>{`
        .reply-card {
          background: white;
          border: 1px solid #e1e1e1;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }
        textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #e1e1e1;
          border-radius: 4px;
          resize: vertical;
        }
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 8px;
        }
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button[type="submit"] {
          background: #2563eb;
          color: white;
        }
        button[type="button"] {
          background: #e1e1e1;
        }
      `}</style>
    </div>
  );
}
