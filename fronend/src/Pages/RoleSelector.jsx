
import { useState } from "react";
// import { apiRequest } from "../api";
import { apiRequest } from "../api/api";

const roles = ["administrator", "manager", "employee"];

const RoleSelector = ({ user, onUpdated }) => {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateRole = async () => {
    if (role === user.role) return;

    try {
      setLoading(true);
      setError("");

      await apiRequest(`/users/${user._id || user.id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });

      await onUpdated();
    } catch (err) {
      setError(err.message);
      setRole(user.role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex gap-2">
        <select
          className="form-select form-select-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={loading}
        >
          {roles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          className="btn btn-sm btn-success"
          onClick={updateRole}
          disabled={loading || role === user.role}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {error && <small className="text-danger">{error}</small>}
    </div>
  );
};

export default RoleSelector;
