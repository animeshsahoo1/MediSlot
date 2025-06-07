import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const specializations = [
  "Cardiology",
  "Dermatology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "General Medicine",
  "Neurology",
  "ENT",
  "Radiology",
  "Anesthesiology"
];

const CompleteDoctor = () => {
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    HRN: '',
    hourlyRate: '',
    registrationNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/create-doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save doctor data');

      alert('Doctor profile completed successfully!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <Navbar showMiddle={false} />
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Complete Doctor Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            Specialization
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded animate-fadeIn"
            >
              <option value="">Select Specialization</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </label>

          <input
            type="number"
            name="experience"
            placeholder="Experience (in years)"
            value={formData.experience}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded animate-fadeIn"
            min="0"
          />

          <input
            name="HRN"
            placeholder="Hospital Registration Number (HRN)"
            value={formData.HRN}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded animate-fadeIn"
          />

          <input
            type="number"
            name="hourlyRate"
            placeholder="Hourly Rate (in ₹)"
            value={formData.hourlyRate}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded animate-fadeIn"
            min="0"
          />

          <input
            name="registrationNumber"
            placeholder="Doctor Registration Number"
            value={formData.registrationNumber}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded animate-fadeIn"
          />

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded animate-fadeIn">Submit</button>
        </form>
      </div>
    </>
  );
};

export default CompleteDoctor;
