import React, { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import FollowUpReminder from "../components/FollowUpReminder";
const initialForm = {
  lead: "",
  assignedTo: "",
  type: "call",
  title: "",
  dueDate: "",
  priority: "medium",
  notes: "",
  reminderAt: "",
};

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [view, setView] = useState("all");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFollowUps = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (view !== "all") params.view = view;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const data = await apiRequest("/follow-ups", {
        method: "GET",
        params,
      });

      setFollowUps(data.followUps || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load follow-ups.");
    } finally {
      setLoading(false);
    }
  }, [view, status, priority]);

  const loadFormOptions = useCallback(async () => {
    try {
      const [leadData, userData] = await Promise.all([
        apiRequest("/leads"),
        apiRequest("/follow-ups/assignees"),
      ]);

      const leadList = Array.isArray(leadData)
        ? leadData
        : leadData?.leads || [];

      const userList = Array.isArray(userData)
        ? userData
        : userData?.users || [];

      setLeads(leadList);
      setUsers(userList);

      console.log("Follow-up leads loaded:", leadList.length);
      console.log("Available assignees:", userList.length);
    } catch (err) {
      console.error(
        "Unable to load form options:",
        err.response?.data || err.message,
      );

      setLeads([]);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  useEffect(() => {
    loadFormOptions();
  }, [loadFormOptions]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        dueDate: new Date(form.dueDate).toISOString(),
        reminderAt: form.reminderAt
          ? new Date(form.reminderAt).toISOString()
          : null,
      };

      await apiRequest("/follow-ups", {
        method: "POST",
        body: payload,
      });

      setForm(initialForm);
      setSuccess("Follow-up created successfully.");

      await loadFollowUps();
    } catch (err) {
      console.error("Create follow-up failed:", err.response?.data || err);

      setError(err.response?.data?.message || "Failed to create follow-up.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (id) => {
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/follow-ups/${id}/complete`, {
        method: "PATCH",
        body: {},
      });

      setSuccess("Follow-up completed.");
      await loadFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete follow-up.");
    }
  };

  const handleCancel = async (id) => {
    const confirmed = window.confirm("Cancel this follow-up?");

    if (!confirmed) return;

    try {
      await apiRequest(`/follow-ups/${id}/cancel`, {
        method: "PATCH",
        body: {},
      });

      setSuccess("Follow-up cancelled.");
      await loadFollowUps();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel follow-up.");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Follow-ups & Activities
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Schedule tasks, track deadlines and manage lead activities.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700"
        >
          {success}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Schedule a Follow-up</h2>

        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <label className="space-y-1">
            <span className="text-sm font-medium">Lead</span>
            <select
              name="lead"
              value={form.lead}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select lead</option>
              {leads.map((lead) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name} {lead.company ? `- ${lead.company}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Assign To</span>
            <select
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            >
              <option value="">Select team member</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Title</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={150}
              placeholder="Call customer about proposal"
              className="w-full rounded-lg border p-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Activity Type</span>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Due Date & Time</span>
            <input
              type="datetime-local"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
              className="w-full rounded-lg border p-3"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">Priority</span>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Reminder Date & Time (optional)
            </span>
            <input
              type="datetime-local"
              name="reminderAt"
              value={form.reminderAt}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="text-sm font-medium">Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              maxLength={5000}
              rows={3}
              placeholder="Add customer discussion details..."
              className="w-full rounded-lg border p-3"
            />
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Follow-up"}
            </button>
          </div>
        </form>
      </section>

<FollowUpReminder followUps={followUps}/>
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Your Activities</h2>

          <div className="flex flex-wrap gap-2">
            <select
              value={view}
              onChange={(event) => setView(event.target.value)}
              className="rounded-lg border bg-white p-2"
            >
              <option value="all">All tasks</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border bg-white p-2"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className="rounded-lg border bg-white p-2"
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-slate-500">Loading activities...</p>
        ) : followUps.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-slate-500">
            No follow-ups found for these filters.
          </div>
        ) : (
          
          
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {followUps.map((item) => {
              const overdue =
                item.status === "pending" &&
                new Date(item.dueDate) < new Date();

              return (
                <article
                  key={item._id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.lead?.name || "Lead"}
                        {" · "}
                        {item.type}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                      {item.priority}
                    </span>
                  </div>

                  <p className="mt-3 text-sm">
                    <strong>Due:</strong> {formatDate(item.dueDate)}
                  </p>

                  <p className="mt-1 text-sm">
                    <strong>Assigned to:</strong>{" "}
                    {item.assignedTo?.name || "Unknown"}
                  </p>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.notes || "No notes added."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        overdue
                          ? "bg-red-100 text-red-700"
                          : item.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item.status === "cancelled"
                              ? "bg-slate-200 text-slate-600"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {overdue ? "Overdue" : item.status}
                    </span>

                    {item.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleComplete(item._id)}
                          className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white"
                        >
                          Complete
                        </button>

                        <button
                          onClick={() => handleCancel(item._id)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default FollowUps;



// import React, { useCallback, useEffect, useState } from "react";
// import { apiRequest } from "../api/api";
// import NotificationBell from "../components/NotificationBell";

// const FollowUps = () => {
//   const [followUps, setFollowUps] = useState([]);
//   const [view, setView] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
// const loadFollowUps = useCallback(async () => {
//   try {
//     setLoading(true);
//     setError("");

//     const response = await apiRequest("/follow-ups", {
//       method: "GET",
//     });

//     setFollowUps(
//       Array.isArray(response)
//         ? response
//         : response?.followUps || []
//     );
//   } catch (error) {
//     console.error("Load follow-ups error:", error);

//     setError(
//       error.response?.data?.message ||
//       error.response?.data?.error ||
//       error.message ||
//       "Unable to load follow-ups."
//     );
//   } finally {
//     setLoading(false);
//   }
// }, []);

// useEffect(() => {
//   loadFollowUps();
// }, [loadFollowUps]);

//   const completeFollowUp = async (id) => {
//     try {
//       await apiRequest(`/follow-ups/${id}/complete`, {
//         method: "PATCH",
//       });
//       await loadFollowUps();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to complete follow-up."
//       );
//     }
//   };

//   const cancelFollowUp = async (id) => {
//     try {
//       await apiRequest(`/follow-ups/${id}/cancel`, {
//         method: "PATCH",
//       });
//       await loadFollowUps();
//     } catch (err) {
//       setError(
//         err.response?.data?.message || "Unable to cancel follow-up."
//       );
//     }
//   };

//   return (
//     <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
//       <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900">
//             Follow-ups and Activities
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             Manage scheduled calls, emails, meetings and tasks.
//           </p>
//         </div>
//         <NotificationBell />
//       </div>

//       <div className="mb-6 flex flex-wrap gap-2">
//         {[
//           ["all", "All"],
//           ["upcoming", "Upcoming"],
//           ["overdue", "Overdue"],
//         ].map(([value, label]) => (
//           <button
//             key={value}
//             type="button"
//             onClick={() => setView(value)}
//             className={`rounded-lg px-4 py-2 text-sm font-semibold ${
//               view === value
//                 ? "bg-blue-700 text-white"
//                 : "border bg-white text-slate-700 hover:bg-slate-100"
//             }`}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       {error && (
//         <div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
//           {error}
//         </div>
//       )}

//       {loading ? (
//         <p className="text-slate-500">Loading follow-ups...</p>
//       ) : followUps.length === 0 ? (
//         <div className="rounded-xl border bg-white p-8 text-center">
//           <p className="font-semibold text-slate-700">
//             No {view === "all" ? "" : `${view} `}follow-ups found.
//           </p>
//         </div>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//           {followUps.map((item) => {
//             const dueTime = new Date(item.dueDate).getTime();
//             const overdue =
//               item.status === "pending" && dueTime < Date.now();

//             const assignedName =
//               typeof item.assignedTo === "object"
//                 ? item.assignedTo?.name || item.assignedTo?.email
//                 : null;

//             return (
//               <article
//                 key={item._id}
//                 className="rounded-xl border bg-white p-5 shadow-sm"
//               >
//                 <div className="mb-3 flex items-start justify-between gap-2">
//                   <h2 className="font-bold text-slate-900">
//                     {item.title}
//                   </h2>

//                   <span
//                     className={`rounded-full px-2 py-1 text-xs font-semibold ${
//                       overdue
//                         ? "bg-red-100 text-red-700"
//                         : item.status === "completed"
//                         ? "bg-green-100 text-green-700"
//                         : item.status === "cancelled"
//                         ? "bg-slate-100 text-slate-600"
//                         : "bg-blue-100 text-blue-700"
//                     }`}
//                   >
//                     {overdue ? "Overdue" : item.status}
//                   </span>
//                 </div>

//                 <p className="text-sm text-slate-600">
//                   Type: {item.type}
//                 </p>
//                 <p className="mt-1 text-sm text-slate-600">
//                   Priority: {item.priority}
//                 </p>
//                 <p className="mt-1 text-sm text-slate-600">
//                   Due:{" "}
//                   {item.dueDate
//                     ? new Date(item.dueDate).toLocaleString()
//                     : "Not set"}
//                 </p>
//                 <p className="mt-1 text-sm text-slate-600">
//                   Assigned to: {assignedName || "User not found"}
//                 </p>
//                 <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
//                   {item.notes || "No notes"}
//                 </p>

//                 {item.status === "pending" && (
//                   <div className="mt-4 flex flex-wrap gap-2">
//                     <button
//                       type="button"
//                       onClick={() => completeFollowUp(item._id)}
//                       className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
//                     >
//                       Complete
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => cancelFollowUp(item._id)}
//                       className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 )}
//               </article>
//             );
//           })}
//         </div>
//       )}
//     </main>
//   );
// };

// export default FollowUps;
