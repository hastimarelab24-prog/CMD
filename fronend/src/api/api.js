// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   headers:{
//     "Content-Type":"application/json",
//   }
// });

// // Automatically attach JWT token to every request
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Reusable API request function



// export const apiRequest = async (endpoint, method = "GET", body = null,url,options={}) => {
//   // const token = localStorage.getItem("token");
//   // const method= (options.method || "GET").toLowerCase();

//   try{
//     const response = await api({
//       url:endpoint,method:method.toLowerCase(),data:body || options.data,...options
//     })
//     return response.data;
//   }catch(err){
//     const errorMessange = err.response?.data?.message || err.response?.data?.err || `REquest failed :${err.status || err.message}`
//     throw new err(errorMessange)
//   }
//   // const config ={method:method,url,params:options.params,data:options.data,};
//   // if(options.body !==undefined){
//   //   config.data = typeof options.body === "string"?JSON.parse(options.body):options.body;

//   // }

  
//   // const response = await fetch(`${API_URL}${endpoint}`, {
//   //   method:config.method || "GET",
//   //   headers: {
//   //     "Content-Type": "application/json",
//   //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   //     ...(config.headers || {}),
//   //   },
//   //   ...(body !== null ? { body: JSON.stringify(body) } : {}),
//   //   ...(config.data ? {body :JSON.stringify(config.data )}:{})
//   // });

//   // const data = await response.json().catch(() => ({}));

//   // if (!response.ok) {
//   //   throw new Error(data.message || data.error || `Request failed: ${response.status}`);
//   // }

//   // return data;
// };



// export default api;



import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function apiRequest(url, options = {}) {
  // const method = (options.method || "GET").toLowerCase();

  const config = {
    url,
    method:options.method || "GET",
    params: options.params,
  };

  if (options.body !== undefined) {
    config.data =
      typeof options.body === "string"
        ? JSON.parse(options.body)
        : options.body;
  } else if (options.data !== undefined) {
    config.data = options.data;
  }

  const response = await api.request(config);
  return response.data;
}

export default api;
