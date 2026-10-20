// import React, { createContext, useEffect, useState } from 'react'
// export const AuthContext = createContext()

// export const AuthProvider = ({children}) => {
//     const [user,setUser]= useState(()=>{
//         const savedUser = localStorage.getItem('user');return savedUser ? JSON.parse(savedUser) :null;
//     });
//     const [token,setToken]= useState(localStorage.getItem('token') || '');
//     useEffect(()=>{
//         if(token){
//             localStorage.setItem('token', token);
//         }else{
//             localStorage.removeItem('token')
//             localStorage.removeItem('user')
//             setUser(null)
//         }
//     },[token])
//     const login = (jwtToken,userData)=>{
//         setToken(jwtToken); setUser(userData); 
//         localStorage.setItem('user',JSON.stringify(userData))
//     }

//     const logout =()=>{
//         setToken(''); setUser(null);
//     }
//   return (
// <AuthContext.Provider value={{user,token, login, logout}}>
//     {children}
// </AuthContext.Provider>
//   )
// }


import React, { createContext, useState, useEffect } from 'react';

// 💡 Named Export for the Context layout node
export const AuthContext = createContext();

// 💡 Named Export for the structural provider wrapping component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => {
    try{

      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    }catch{
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
    //  else {
    //   localStorage.removeItem('token');
    //   localStorage.removeItem('user');
    //   setUser(null);
    // }
  }, [token]);

  const login = (jwtToken, userData) => {
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem("token")
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
