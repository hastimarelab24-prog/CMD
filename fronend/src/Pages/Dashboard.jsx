import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios';
const Dashboard = () => {
    const {token,logout,user,setUser}= useContext(AuthContext);
    const [ stats,setStats] =useState(null);
    const [loading,setLoading] = useState(true);
    useEffect(()=>{
        const fetchDashboardData = async()=>{try{
            const config = {headers:{Authorization : `Bearer ${token}`}};
            const profileRes = await axios.get('http://localhost:5000/api/dashboard/profile',config);
            setUser(profileRes.data);

            const statsRes = await axios.get("http://localhost:5000/api/dashboard/stats",config);
            setStats(statsRes.data)
        }catch(err){
            console.error('data fetch error',err);
            logout()
            
        } finally{
            setLoading(false)
        }}
        fetchDashboardData()
    },[token]);

    if(loading)return <div>live data loading...</div>
  return (
    <div>
        <aside>
            <div>
                <h2> Menu bar</h2>
                <ul>
                    <li> Pages</li>
                    <li>My Profile</li>
                    <li>Report Data</li>
                </ul>
            </div>
                    <button>logout</button>
        </aside>

        <main>
            <header>
                <h2>user{user?.name}!</h2>
                <p>Register Email <strong>{user?.email}</strong></p>
            </header>

            <div>
                <div>
                    <h4>Visites</h4>
                    <p>{stats?.totalViews ||0}</p>
                </div>
                <div><h4>Active Project</h4>
                    <p>{stats?.activeProjects || 0}</p>
                </div>
            </div>
        </main>
    </div>
  )
}

export default Dashboard