
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await apiRequest("/audit-logs");
        setLogs(Array.isArray(data) ? data : data.logs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Audit Logs</h2>

      {loading && <p>Loading audit logs...</p>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Record ID</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log._id || log.id}>
                  <td>{log.user?.name || log.user?.email || "Unknown"}</td>
                  <td>{log.action}</td>
                  <td>{log.entity}</td>
                  <td>{log.entityId || "-"}</td>
                  <td>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
