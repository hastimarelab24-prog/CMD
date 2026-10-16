
import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

const AssignLead = () => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leadData, userData] = await Promise.all([
          apiRequest("/leads"),
          apiRequest("/users"),
        ]);

        setLeads(Array.isArray(leadData) ? leadData : leadData.leads || []);

        const list = Array.isArray(userData)
          ? userData
          : userData.users || [];

        setEmployees(
          list.filter(
            (user) => user.role === "employee" && user.isActive
          )
        );
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);

      const result = await apiRequest(`/leads/${leadId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ employeeId }),
      });

      setMessage(result.message || "Lead assigned successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 650 }}>
      <h2>Assign Lead to Employee</h2>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleAssign}>
        <div className="mb-3">
          <label className="form-label">Select Lead</label>
          <select
            className="form-select"
            value={leadId}
            onChange={(e) => setLeadId(e.target.value)}
            required
          >
            <option value="">Choose a lead</option>
            {leads.map((lead) => (
              <option key={lead._id || lead.id} value={lead._id || lead.id}>
                {lead.name || lead.leadName || lead.company}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Select Employee</label>
          <select
            className="form-select"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          >
            <option value="">Choose an employee</option>
            {employees.map((employee) => (
              <option
                key={employee._id || employee.id}
                value={employee._id || employee.id}
              >
                {employee.name} ({employee.email})
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Assigning..." : "Assign Lead"}
        </button>
      </form>
    </div>
  );
};

export default AssignLead;
