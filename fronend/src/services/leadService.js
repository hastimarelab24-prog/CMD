
// const API_BASE= "http://localhost:5000/api/leads";
// export const leadService ={
//     async fetchLeads({page,serach,status,sortBy,sortOrder}){
//         const query = new URLSearchParams({page,serach,status,sortBy,sortOrder}).toString();
//         const res = await fetch(`${API_BASE}?${query}`);
//         if(!res.ok) throw await res.json();
//         return res.json();
//     },

//     async createLead(data){
//         const res=await fetch(API_BASE,{
//             method:"POST",
//             headers:{"Content-Type":"application/json"},
//             body:JSON.stringify(data),
//         })
//         if(!res.ok) throw await res.json();
//         return res.json();
//     },
//     async updateLead(id,data){
//         const res = await fetch(`${API_BASE}/${id}`,{
//             method:"PUT",
//             headers:{"Content-Type" : "application/json"},
//             body:JSON.stringify(data),
//         })
//         if(!res.ok) throw await res.json();
//         return res.json();
//     },

//     async pathchStatus(id,status){
//         const res = await fetch(`${API_BASE}/${id}/status`,{
//             method:"PATCH",
//             headers:{"Content-Type":"application/json"},
//             body:JSON.stringify({status}),
//         })
//              if(!res.ok) throw await res.json();
//         return res.json();
//     },
//     async deleteLEad(id){
//         const res = await fetch (`${API_BASE}/${id}`,{method:"DELETE"});
//              if(!res.ok) throw await res.json();
//         return res.json();
//     }
// }





import axios from 'axios';

const API_URL = 'http://localhost:5000/api/leads';

export const leadService = {
  fetchLeads: async (filters) => {
    // 💡 Fetching the active session token saved by AuthContext during login
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`, // ✅ CRITICAL: Essential space after Bearer keyword!
        'Content-Type': 'application/json'
      },
      params: filters
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  },

  createLead: async (leadData) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.post(API_URL, leadData, config);
    return response.data;
  },

  updateLead: async (id, leadData) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, leadData, config);
    return response.data;
  },

  patchStatus: async (id, status) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, config);
    return response.data;
  },

  deleteLead: async (id) => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  }
};
