// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [backendMessage, setBackendMessage] = useState('Connecting to backend...');

//   useEffect(() => {
//     // Calling the API endpoint created in server.js
//     axios.get('http://localhost:5000/api/test')
//       .then((response) => {
//         setBackendMessage(response.data.message);
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//         setBackendMessage('Failed to connect to backend server.');
//       });
//   }, []);

//   return (
//     <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
//       <header className="App-header">
//         <h1>React Frontend Stack</h1>
//         <p style={{ color: '#4caf50', fontSize: '1.2rem', fontWeight: 'bold' }}>
//           Backend Status: {backendMessage}
//         </p>
//       </header>
//     </div>
//   );
// }

// export default App;


import React from 'react'
import { AuthProvider } from './context/AuthContext'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './Pages/Login';
import Register from './Pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './Pages/Dashboard';
import Leads from './Pages/Leads';

function App() {
  return (
    <div>
      <AuthProvider>
        {/* <BrowserRouter> */}
          <Routes>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>

            <Route element={<ProtectedRoute/>}/>
            <Route path='/dashboard' element={<Dashboard/>}/>
            <Route path='/leads' element={<Leads/>}/>
            <Route  path='*' element={<Navigate to="/login" replace/>}/>
          </Routes>
        {/* </BrowserRouter> */}
      </AuthProvider>
    </div>
  )
}

export default App