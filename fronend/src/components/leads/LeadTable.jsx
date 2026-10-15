// import React from 'react'
// import StatusBadge from "../common/StatusBadge";



// const STATUS_FLOW=['new','contacted','Qualified', 'proposal sent','nurturung','lost','won'];
// export default function LeadTable({leads,onEdit,OnDelete,OnStatusChane}) {
//   return (
//     <div>
//         <table>
//             <thead>
//                 <tr>
//                     <th>Lead Context</th>
//                     <th>Source</th>
//                     <th>Representative</th>
//                     <th>status lifecycle</th>
//                     <th> active</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {leads.map((lead)=>(
//                     <tr>
//                         <td>
//                             <p>{lead.name}</p>
//                             <p>{lead.company || 'N/A'}*{lead.email}</p>
//                             { lead.phone && (<p>{lead.phone}</p>)}
//                         </td>
//                         <td>
//                             {lead.source}
//                         </td>
//                         <td>
//                             {lead.assignedEmployee}
//                         </td>
//                         <td>
//                             <select name="" id="" value={lead.status} onChange={(e)=>OnStatusChane(lead._id,e.target.value)}> {STATUS_FLOW.map((s)=>(
//                                 <option key={s} value={s}>{s}</option>
//                             ))}</select>
//                         </td>
//                         <td>
//                             <button onClick={()=>onEdit}>Edit</button>
//                             <button onClick={()=>OnDelete(lead._id)}>delete</button>
//                         </td>
//                     </tr>
//                 ))}
//                 {
//                     leads.length === 0 && (
//                         <tr>
//                             <td> No system leads mapped here yet.</td>
//                         </tr>
//                     )
//                 }
//             </tbody>
//         </table>
//     </div>
//   )
// }

import React from 'react';

// ✅ FIXED: Ensure props are destructured using exact lowercase 'onDelete'
export default function LeadTable({ leads, onEdit, onDelete, onStatusChange }) {
  
  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Company</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Source</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads && leads.length > 0 ? (
            leads.map((lead) => (
              <tr key={lead._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{lead.name}</td>
                <td style={{ padding: '12px' }}>{lead.company || '-'}</td>
                <td style={{ padding: '12px' }}>{lead.email}</td>
                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{lead.source}</td>
                <td style={{ padding: '12px' }}>
                  <select 
                    value={lead.status} 
                    onChange={(e) => onStatusChange(lead._id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px', textTransform: 'capitalize', border: '1px solid #ccc' }}
                  >
                    {['new', 'contacted', 'qualified', 'proposal sent', 'nurturing', 'lost', 'won'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => onEdit(lead)} 
                    style={{ padding: '6px 12px', background: '#f1c40f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button 
                    // ✅ FIXED: Changed 'OnDelete' to lowercase 'onDelete' to match destructured props
                    onClick={() => onDelete(lead._id)} 
                    style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#95a5a6' }}>No active leads found in the system registry.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
