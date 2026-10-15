// import React, { useContext, useState } from 'react'
// import { AuthContext } from '../context/AuthContext';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

//  const Login = () => {
//     const [formData,setFormData]=useState({email:'', password:''});
//     const [error,setError] =useState('')
//     const {login} =useContext(AuthContext);
//     const[loading,setLoading]=useState(false)
//     const navigate = useNavigate();
//     const handleSubmit = async (e)=>{
//         e.preventDefault();
//         setError('')
//         setLoading(true);
//         try{
//             const res = await axios.post('http://localhost:5000/api/auth/login',{email:formData.email.trim(),password:formData.password},{
//                headers:{
//                 "Content-Type":"application/json"
//                },
//             });
//             if(res.data && res.data.token){
//                 alert("login Sucessfully")
//                 login(res.data.token,res.data.user);
//                 navigate('/dashboard');
//             }
//         }catch(err){
//             console.error("login error",err.response);
            
//             setError(err.response?.data?.message || 'email end password worng');
//         }finally{
//             setLoading(false)
//         }
//     }
//   return (
//     <div>
//         <h2>Login in </h2>
//         {error && <p className=' text-red'>{error}</p>}
//         <form onSubmit={handleSubmit}>a
//             <div>
//                 <label htmlFor=""> email :</label>
//                 <input type="email" value={formData.email || ''} required onChange={(e)=>setFormData({...formData,email:e.target.value})} />
//             </div>
//                 <div>
//                     <label htmlFor=""> password</label>
//                     <input type="password" value={formData.password || ''} required onChange={(e)=>setFormData({...formData,password:e.target.value})} />
//                 </div>
//                 <button type='submit'>
//                  {loading ? 'verified' : 'Login'}
//                 </button>
//         </form>
//         <p>
//             <Link to='/register'>register </Link>
//         </p>
//     </div>
//   )
// }

// export default Login;

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const emailPayload = email ? email.trim() : '';

    if (!emailPayload || !password) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      // 🔗 Emitting explicit parameters directly to the Express server pipeline
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: emailPayload,
        password: password
      }, {
        headers: { "Content-Type": "application/json" }
      });

      if (res.data && res.data.token) {
        alert('🔑 Login Successful!');
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Detailed Login Exception Stack:", err.response);
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '25px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>Login</h2>
      {error && <p style={{ color: 'red', background: '#fee', padding: '10px', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address:</label>
          <input 
            type="email" 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Password:</label>
          <input 
            type="password" 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#95a5a6' : '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
          {loading ? 'Verifying...' : 'Sign In'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px' }}>
        New user? <Link to="/register" style={{ color: '#2ecc71', fontWeight: 'bold', textDecoration: 'none' }}>Create an Account</Link>
      </p>
    </div>
  );
};

export default Login;
