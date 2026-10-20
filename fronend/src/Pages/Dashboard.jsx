// import React, { useContext, useEffect, useState } from 'react'
// import { AuthContext } from '../context/AuthContext'
// import axios from 'axios';
// const Dashboard = () => {
//     const {token,logout,user,setUser}= useContext(AuthContext);
//     const [ stats,setStats] =useState(null);
//     const [loading,setLoading] = useState(true);
//     useEffect(()=>{
//         const fetchDashboardData = async()=>{try{
//             const config = {headers:{Authorization : `Bearer ${token}`}};
//             const profileRes = await axios.get('http://localhost:5000/api/dashboard/profile',config);
//             setUser(profileRes.data);

//             const statsRes = await axios.get("http://localhost:5000/api/dashboard/stats",config);
//             setStats(statsRes.data)
//         }catch(err){
//             console.error('data fetch error',err);
//             logout()
            
//         } finally{
//             setLoading(false)
//         }}
//         fetchDashboardData()
//     },[token]);

//     if(loading)return <div>live data loading...</div>
//   return (
//     <div>
//         <aside>
//             <div>
//                 <h2> Menu bar</h2>
//                 <ul>
//                     <li> Pages</li>
//                     <li>My Profile</li>
//                     <li>Report Data</li>
//                 </ul>
//             </div>
//                     <button>logout</button>
//         </aside>

//         <main>
//             <header>
//                 <h2>user{user?.name}!</h2>
//                 <p>Register Email <strong>{user?.email}</strong></p>
//             </header>

//             <div>
//                 <div>
//                     <h4>Visites</h4>
//                     <p>{stats?.totalViews ||0}</p>
//                 </div>
//                 <div><h4>Active Project</h4>
//                     <p>{stats?.activeProjects || 0}</p>
//                 </div>
//             </div>
//         </main>
//     </div>
//   )
// }

// export default Dashboard


import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiRequest } from "../api/api";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "▦",
    roles: ["administrator", "admin", "manager", "employee"],
  },
  {
    name: "Leads",
    path: "/leads",
    icon: "♧",
    roles: ["administrator", "admin", "manager", "employee"],
  },
  {
    name: "Assign Leads",
    path: "/assign-lead",
    icon: "⇄",
    roles: ["administrator", "admin", "manager"],
  },
  {
    name: "Team Members",
    path: "/team",
    icon: "♙",
    roles: ["administrator", "admin"],
  },
  {
    name: "Create User",
    path: "/team/create",
    icon: "+",
    roles: ["administrator", "admin"],
  },
  {
    name: "Audit Logs",
    path: "/audit-logs",
    icon: "▤",
    roles: ["administrator", "admin"],
  },
];

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = String(user?.role || "employee").toLowerCase();

  const displayName =
    user?.name || user?.username || user?.email || "CRM User";

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name ||
    "Dashboard";

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        // This endpoint must exist in your backend.
       
        const data = await apiRequest("GET", "/dashboard/stats");

        if (!active) return;

        setOverview(data?.data ?? data ?? {});
      } catch (err) {
        if (!active) return;

        setOverview(null);
        setError(
          err?.message ||
            "Dashboard data could not be loaded from the server."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Mobile overlay */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col justify-between bg-slate-950 p-5 text-white transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="mb-10 flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl font-bold">
              L
            </div>

            <div>
              <h1 className="text-xl font-bold">LeadSphere</h1>
              <p className="text-xs text-slate-400">CRM Workspace</p>
            </div>
          </Link>

          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {visibleMenuItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span className="w-5 text-center text-lg">
                    {item.icon}
                  </span>

                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User account */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Account
          </p>

          <div className="rounded-xl border border-slate-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">{displayName}</p>
                <p className="truncate text-xs capitalize text-slate-400">
                  {role}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-xl px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-950"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg border border-slate-200 px-3 py-2 md:hidden"
              aria-label="Toggle navigation"
            >
              ☰
            </button>

            <div>
              <h2 className="text-xl font-bold md:text-2xl">
                {currentPage}
              </h2>

              <p className="hidden text-sm text-slate-500 sm:block">
                LeadSphere CRM / {currentPage}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs capitalize text-slate-500">{role}</p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-5 md:p-8">
          {/* Welcome banner */}
          <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 p-6 text-white md:p-8">
            <p className="mb-2 text-sm font-medium text-blue-100">
              YOUR CRM WORKSPACE
            </p>

            <h2 className="text-2xl font-bold md:text-3xl">
              Welcome back, {displayName}!
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
              Manage your leads, assignments and team activities from
              one centralized workspace.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/leads"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                View Leads →
              </Link>

              {(role === "administrator" ||
                role === "admin" ||
                role === "manager") && (
                <Link
                  to="/assign-lead"
                  className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  Assign a Lead
                </Link>
              )}
            </div>
          </section>

          {/* Dynamic backend overview */}
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Dashboard Overview</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Information retrieved from your backend.
                </p>
              </div>
            </div>

            {loading && (
              <p className="mt-6 text-sm text-slate-500">
                Loading dashboard data...
              </p>
            )}

            {!loading && error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-700">
                  Unable to load dashboard data
                </p>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && overview && (
              <div className="mt-6">
                {Object.keys(overview).length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(overview).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <p className="text-sm capitalize text-slate-500">
                          {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                        </p>

                        <p className="mt-2 break-words text-lg font-semibold">
                          {value !== null && typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value ?? "—")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-500">
                    No dashboard information is available yet.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Navigation cards */}
          <section>
            <div className="mb-5">
              <h3 className="text-lg font-bold">Workspace Sections</h3>
              <p className="mt-1 text-sm text-slate-500">
                Choose a section to view its records and available actions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleMenuItems
                .filter((item) => item.path !== "/dashboard")
                .map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-700 transition group-hover:bg-blue-100">
                        {item.icon}
                      </div>

                      <div>
                        <h4 className="font-semibold group-hover:text-blue-700">
                          {item.name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Open section →
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>

          <footer className="mt-10 text-center text-xs text-slate-400">
            LeadSphere CRM
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;