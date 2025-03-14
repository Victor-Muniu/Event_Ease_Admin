import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

const OrganizersPage = () => {
  const [organizers, setOrganizers] = useState([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const response = await fetch("http://localhost:3002/organizers");

        if (!response.ok) {
          throw new Error("Failed to fetch organizers");
        }

        const data = await response.json();
        setOrganizers(data);
        setFilteredOrganizers(data);
      } catch (err) {
        setError("Error fetching organizers. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrganizers(organizers);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = organizers.filter(
      (org) =>
        org.firstName.toLowerCase().includes(term) ||
        org.lastName.toLowerCase().includes(term) ||
        org.email.toLowerCase().includes(term) ||
        org.organizationName.toLowerCase().includes(term) ||
        org.phone.includes(term)
    );

    setFilteredOrganizers(filtered);
  }, [searchTerm, organizers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div className="loading-container">Loading organizers...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="organizers-page">
      <header className="header">
        <h1>Event Organizers</h1>
        <p>View all registered event organizers in our system</p>
      </header>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search organizers..."
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="organizers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizers.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-results">
                  No organizers found
                </td>
              </tr>
            ) : (
              filteredOrganizers.map((organizer) => (
                <tr key={organizer._id}>
                  <td>
                    {organizer.firstName} {organizer.lastName}
                  </td>
                  <td>{organizer.organizationName}</td>
                  <td>{organizer.email}</td>
                  <td>{organizer.phone}</td>
                  <td>{organizer.address}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        organizer.isVerified ? "verified" : "unverified"
                      }`}
                    >
                      {organizer.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td>{new Date(organizer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        /* Base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          background-color: #f5f5f5;
          color: #333;
          line-height: 1.6;
        }

        /* Page layout */
        .organizers-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Header styles */
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.5rem;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .header p {
          font-size: 1.1rem;
          color: #7f8c8d;
        }

        /* Search container */
        .search-container {
          margin-bottom: 2rem;
        }

        .search-input-wrapper {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #7f8c8d;
        }

        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        /* Table styles */
        .table-container {
          overflow-x: 100%;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .organizers-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .organizers-table th,
        .organizers-table td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .organizers-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
          position: sticky;
          top: 0;
        }

        .organizers-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .organizers-table tbody tr:last-child td {
          border-bottom: none;
        }

        /* Status badge */
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.verified {
          background-color: #e3fcef;
          color: #0d9f6e;
        }

        .status-badge.unverified {
          background-color: #feebc8;
          color: #c05621;
        }

        /* Loading and error states */
        .loading-container,
        .error-container {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
          color: #7f8c8d;
        }

        .error-container {
          color: #e74c3c;
        }

        .no-results {
          text-align: center;
          padding: 2rem;
          color: #7f8c8d;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .organizers-page {
            padding: 1rem;
          }

          .header h1 {
            font-size: 2rem;
          }

          .organizers-table th,
          .organizers-table td {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrganizersPage;
