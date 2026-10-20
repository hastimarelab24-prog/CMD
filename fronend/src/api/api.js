


// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     // config.headers = config.headers || {};
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export async function apiRequest(url, options = {}) {
//   // const method = (options.method || "GET").toLowerCase();

//   const config = {
//     url,
//     method:options.method || "GET",
//     params: options.params,
//   };

//   if (options.body !== undefined) {
//     config.data =
//       typeof options.body === "string"
//         ? JSON.parse(options.body)
//         : options.body;
//   } else if (options.data !== undefined) {
//     config.data = options.data;
//   }

//   const response = await api.request(config);
//   return response.data;
// }

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const apiRequest = async (method, endpoint, data = null) => {
  const response = await api.request({
    method: method.toLowerCase(),
    url: endpoint,
    ...(data !== null ? { data } : {}),
  });

  return response.data;
};

export default api;
