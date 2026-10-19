
// import { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { Users, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
// import { apiRequest } from "../api/api";
// import RoleSelector from "./RoleSelector";

// const Team = () => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const loadUsers = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // apiRequest arguments: endpoint, method, body
//       const data = await apiRequest("/users", "GET");

//       setUsers(
//         Array.isArray(data)
//           ? data
//           : Array.isArray(data.users)
//           ? data.users
//           : []
//       );
//     } catch (err) {
//       console.error("Failed to load users:", err);
//       setError(err.message || "Failed to load team members.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadUsers();
//   }, [loadUsers]);

//   return (
//     <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
//               <Users size={18} />
//               <span>LeadSphere CRM</span>
//             </div>

//             <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
//               Team Management
//             </h1>

//             <p className="mt-2 text-sm text-slate-500">
//               Manage team members, roles, and account status.
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <button
//               type="button"
//               onClick={loadUsers}
//               disabled={loading}
//               className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               <RefreshCw
//                 size={17}
//                 className={loading ? "animate-spin" : ""}
//               />
//               Refresh
//             </button>

//             <Link
//               to="/team/create"
//               className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
//             >
//               <UserPlus size={18} />
//               Add Team Member
//             </Link>
//           </div>
//         </div>

//         {/* Summary card */}
//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-500">
//                   Total Team Members
//                 </p>
//                 <p className="mt-2 text-3xl font-bold text-slate-900">
//                   {users.length}
//                 </p>
//               </div>

//               <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
//                 <Users size={25} />
//               </div>
//             </div>
//           </div>

//           <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-500">
//                   Active Members
//                 </p>
//                 <p className="mt-2 text-3xl font-bold text-emerald-600">
//                   {users.filter((user) => user.isActive !== false).length}
//                 </p>
//               </div>

//               <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
//                 <UserPlus size={25} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Team table */}
//         <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:px-6">
//             <h2 className="text-lg font-bold text-slate-900">
//               Team Members
//             </h2>
//             <p className="text-sm text-slate-500">
//               View team accounts and manage member roles.
//             </p>
//           </div>

//           {loading ? (
//             <div className="flex flex-col items-center justify-center px-4 py-16">
//               <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
//               <p className="mt-4 text-sm font-medium text-slate-500">
//                 Loading team members...
//               </p>
//             </div>
//           ) : error ? (
//             <div className="m-5 flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
//               <AlertCircle size={32} className="text-red-500" />
//               <h3 className="mt-3 font-semibold text-red-800">
//                 Unable to load team members
//               </h3>
//               <p className="mt-2 text-sm text-red-700">{error}</p>
//               <button
//                 type="button"
//                 onClick={loadUsers}
//                 className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
//               >
//                 Try Again
//               </button>
//             </div>
//           ) : (
//             <>
//               {/* Mobile cards */}
//               <div className="divide-y divide-slate-100 md:hidden">
//                 {users.map((user) => (
//                   <div
//                     key={user._id || user.id}
//                     className="space-y-3 p-4"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold uppercase text-blue-700">
//                         {(user.name || "U").charAt(0)}
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <p className="truncate font-semibold text-slate-900">
//                           {user.name}
//                         </p>
//                         <p className="break-all text-sm text-slate-500">
//                           {user.email}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-2">
//                       <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700">
//                         {user.role}
//                       </span>

//                       <span
//                         className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                           user.isActive === false
//                             ? "bg-red-50 text-red-700"
//                             : "bg-emerald-50 text-emerald-700"
//                         }`}
//                       >
//                         {user.isActive === false ? "Inactive" : "Active"}
//                       </span>
//                     </div>

//                     <div className="border-t border-slate-100 pt-3">
//                       <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
//                         Manage Role
//                       </p>
//                       <RoleSelector user={user} onUpdated={loadUsers} />
//                     </div>
//                   </div>
//                 ))}

//                 {users.length === 0 && (
//                   <div className="px-4 py-12 text-center">
//                     <Users
//                       size={36}
//                       className="mx-auto text-slate-300"
//                     />
//                     <p className="mt-3 font-semibold text-slate-700">
//                       No team members found
//                     </p>
//                     <p className="mt-1 text-sm text-slate-500">
//                       Add your first team member to get started.
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* Desktop table */}
//               <div className="hidden overflow-x-auto md:block">
//                 <table className="w-full min-w-[700px] text-left">
//                   <thead className="bg-slate-50">
//                     <tr className="border-b border-slate-200">
//                       <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Team Member
//                       </th>
//                       <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Role
//                       </th>
//                       <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
//                         Manage Role
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody className="divide-y divide-slate-100">
//                     {users.map((user) => (
//                       <tr
//                         key={user._id || user.id}
//                         className="transition hover:bg-slate-50"
//                       >
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold uppercase text-blue-700">
//                               {(user.name || "U").charAt(0)}
//                             </div>
//                             <div>
//                               <p className="font-semibold text-slate-900">
//                                 {user.name}
//                               </p>
//                               <p className="mt-1 text-sm text-slate-500">
//                                 {user.email}
//                               </p>
//                             </div>
//                           </div>
//                         </td>

//                         <td className="px-6 py-4">
//                           <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold capitalize text-violet-700">
//                             {user.role}
//                           </span>
//                         </td>

//                         <td className="px-6 py-4">
//                           <span
//                             className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
//                               user.isActive === false
//                                 ? "bg-red-50 text-red-700"
//                                 : "bg-emerald-50 text-emerald-700"
//                             }`}
//                           >
//                             <span
//                               className={`h-2 w-2 rounded-full ${
//                                 user.isActive === false
//                                   ? "bg-red-500"
//                                   : "bg-emerald-500"
//                               }`}
//                             />
//                             {user.isActive === false ? "Inactive" : "Active"}
//                           </span>
//                         </td>

//                         <td className="px-6 py-4">
//                           <RoleSelector
//                             user={user}
//                             onUpdated={loadUsers}
//                           />
//                         </td>
//                       </tr>
//                     ))}

//                     {users.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={4}
//                           className="px-6 py-16 text-center"
//                         >
//                           <Users
//                             size={36}
//                             className="mx-auto text-slate-300"
//                           />
//                           <p className="mt-3 font-semibold text-slate-700">
//                             No team members found
//                           </p>
//                           <p className="mt-1 text-sm text-slate-500">
//                             Add your first team member to get started.
//                           </p>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>

//         <p className="mt-4 text-xs text-slate-400">
//           Team members and permissions are managed through your CRM account.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Team;





