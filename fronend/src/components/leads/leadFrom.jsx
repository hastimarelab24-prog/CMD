// import React, { useEffect, useState } from 'react'

// const SOURCES =[
//         "Website","referral","Cold Outreach","inbound Call", "social media",
//     ]
// export default function leadFrom() {
//     const [fromData,setFormData]=useState({name:"",comapany:'',email:"",phone:"",source:"",assignedEmployee:"",})
//     const [ error,setErrors]=useState({});
//     useEffect(()=>{
//         if(initalData) setFormData(initalData);
//     },[initalData])
//     const handleChange =(e)=>{
//         setFormData({...fromData,[e.target.name]:e.target.value});
//         if(error[e.target.name]) setErrors({...error,[e.target.name]:""})
//     }

//     const handleSubmit = async(e)=>{
//         e.preventDefault();
//         try{
//             await onSubmit(fromData);
//         }catch(err){
//             if(err.errors){
//                 const mapped={};
//                 err.errors.forEach((err)=>(mapped[err.field]=err.message))
//                 setErrors[mapped]
//             }else{
//                 alert(err.message || "failed excution request")
//             }
//         }
//     }
//   return (
//     <div>
//         <form action="" onSubmit={handleSubmit}>
//             <div>

//                 <label htmlFor="">Full name*</label>
//                 <input type="name" onChange={handleChange} value={fromData.name} />
//                 {error.name && (<p>{error.name}</p>)}
//             </div>
//             <div>
//                 <label htmlFor="">Company*</label>
//                 <input type="comapny" value={fromData.comapany} onChange={handleChange} />
//             </div> <div>
//                 <label htmlFor="">Email*</label>
//                 <input type="email" value={fromData.email} onChange={handleChange} />
//             </div>
//              <div>
//                 <label htmlFor="">phone*</label>
//                 <input type="phonr" value={fromData.phone} onChange={handleChange} />
//              {error.phone && (<p>{error.phone}</p>)}
//             </div>
//             <div>
//                 <label htmlFor=""> Source</label>
//                 <select name="source"  value={fromData.source} onChange={handleChange} id="">
//                     <option value=""> select source</option>
//                     {SOURCES.map((s)=>(<option key={s} value={s}>{s}</option>))}
//                 </select>
//                    {error.source && (<p>{error.source}</p>)}
//             </div>
//             <div>
//                 <label htmlFor=""> Assigned Employee</label>
//                 <input type="assignedEmployee" value={fromData.assignedEmployee} onChange={handleChange} />
//                     {error.assignedEmployee && (<p>{error.assignedEmployee}</p>)}
//             </div>
//             <div>
//                 <button onClick={onclose}>cancel</button>
//                 <button>save Lead</button>
//             </div>
//         </form>
//     </div>
//   )
// }


import React, { useEffect, useState } from "react";

const SOURCES = [
  "website",
  "referral",
  "cold outreach",
  "inbound call",
  "social media",
];

const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal sent",
  "nurturing",
  "lost",
  "won",
];

const INITIAL_FORM = {
  name: "",
  company: "",
  email: "",
  phone: "",
  source: "",
  status: "new",
  assignedEmployee: "",
};

export default function LeadForm({
  initialData = null,
  onSubmit,
  onClose,
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        company: initialData.company || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        source: initialData.source || "",
        status: initialData.status || "new",
        assignedEmployee: initialData.assignedEmployee || "",
      });
    } else {
      setFormData({ ...INITIAL_FORM });
    }

    setErrors({});
    setSubmitError("");
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!SOURCES.includes(formData.source)) {
      nextErrors.source = "Please select a valid lead source.";
    }

    if (!STATUSES.includes(formData.status)) {
      nextErrors.status = "Please select a valid lead status.";
    }

    if (formData.assignedEmployee.trim().length < 2) {
      nextErrors.assignedEmployee =
        "Employee name must be at least 2 characters.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setErrors({});
    setSubmitError("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      source: formData.source,
      status: formData.status,
      assignedEmployee: formData.assignedEmployee.trim(),
    };

    try {
      setSaving(true);

      if (typeof onSubmit !== "function") {
        throw new Error("Lead submit handler is missing in the parent component.");
      }

      await onSubmit(payload);
    } catch (error) {
      console.error(
        "Save lead failed:",
        error.response?.data || error
      );

      const responseData = error.response?.data;
      const responseErrors = responseData?.errors;

      if (Array.isArray(responseErrors)) {
        const mappedErrors = {};

        responseErrors.forEach((item) => {
          if (item.field) {
            mappedErrors[item.field] = item.message;
          }
        });

        setErrors(mappedErrors);
      }

      setSubmitError(
        responseData?.message ||
          error.message ||
          "Unable to save lead. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontWeight: 600,
    fontSize: "14px",
    marginBottom: "6px",
    color: "#374151",
  };

  const renderError = (field) =>
    errors[field] ? (
      <p
        role="alert"
        style={{
          color: "#dc2626",
          fontSize: "12px",
          marginTop: "5px",
        }}
      >
        {errors[field]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {submitError && (
        <div
          role="alert"
          style={{
            padding: "12px",
            borderRadius: "6px",
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontSize: "14px",
          }}
        >
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="name" style={labelStyle}>
          Full Name *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter full name"
          required
          minLength={2}
          style={inputStyle}
          aria-invalid={Boolean(errors.name)}
        />
        {renderError("name")}
      </div>

      <div>
        <label htmlFor="company" style={labelStyle}>
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enter company name"
          style={inputStyle}
        />
        {renderError("company")}
      </div>

      <div>
        <label htmlFor="email" style={labelStyle}>
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
          required
          style={inputStyle}
          aria-invalid={Boolean(errors.email)}
        />
        {renderError("email")}
      </div>

      <div>
        <label htmlFor="phone" style={labelStyle}>
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
          style={inputStyle}
        />
        {renderError("phone")}
      </div>

      <div>
        <label htmlFor="source" style={labelStyle}>
          Lead Source *
        </label>
        <select
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
          style={inputStyle}
          aria-invalid={Boolean(errors.source)}
        >
          <option value="">Select lead source</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {source.replace(/\b\w/g, (char) => char.toUpperCase())}
            </option>
          ))}
        </select>
        {renderError("source")}
      </div>

      <div>
        <label htmlFor="status" style={labelStyle}>
          Lead Status *
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          style={inputStyle}
          aria-invalid={Boolean(errors.status)}
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replace(/\b\w/g, (char) => char.toUpperCase())}
            </option>
          ))}
        </select>
        {renderError("status")}
      </div>

      <div>
        <label htmlFor="assignedEmployee" style={labelStyle}>
          Assigned Employee *
        </label>
        <input
          id="assignedEmployee"
          name="assignedEmployee"
          type="text"
          value={formData.assignedEmployee}
          onChange={handleChange}
          placeholder="Enter employee name"
          required
          minLength={2}
          style={inputStyle}
          aria-invalid={Boolean(errors.assignedEmployee)}
        />
        {renderError("assignedEmployee")}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          marginTop: "8px",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          style={{
            padding: "10px 16px",
            background: "#e5e7eb",
            color: "#111827",
            border: "none",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 18px",
            background: saving ? "#86efac" : "#16a34a",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {saving
            ? "Saving..."
            : initialData
              ? "Update Lead"
              : "Save Lead"}
        </button>
      </div>
    </form>
  );
}
