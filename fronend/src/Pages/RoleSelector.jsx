import { useState } from "react";
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
    <div className="w-full max-w-xs">
      {/* Tailwind equivalent of d-flex gap-2 */}
      <div className="flex gap-2 items-center">
        <select
          className="block w-full rounded-md border-gray-300 py-1.5 px-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50 border"
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
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={updateRole}
          disabled={loading || role === user.role}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Tailwind equivalent of text-danger */}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default RoleSelector;
