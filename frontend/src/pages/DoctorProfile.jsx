import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { RiseLoader } from 'react-spinners';

const DoctorProfile = () => {
  const { user, fetchUser } = useAppContext();
  const [doctor, setDoctor] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    specialization: '',
    experience: '',
    hourlyRate: '',
    registrationNumber: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        userName: user.userName || '',
        email: user.email || '',
      }));

      fetchDoctorDetails();
    }
  }, [user]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/get-doctor-details`, {
        credentials: 'include',
      });

      const data = await res.json();
      console.log(data)
      if (res.ok) {
        setDoctor(data.data);
        setFormData(prev => ({
          ...prev,
          specialization: data.specialization || '',
          experience: data.experience || '',
          hourlyRate: data.hourlyRate || '',
          registrationNumber: data.registrationNumber || ''
        }));
      } else {
        toast.error('Failed to fetch doctor data');
      }
    } catch (err) {
      toast.error('Error fetching doctor data');
      console.error(err);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Update user data
      const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-account`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: formData.fullName,
          userName: formData.userName,
          email: formData.email,
        }),
      });
      if (!userRes.ok) throw new Error('Failed to update user');

      // Update doctor data
      const doctorRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/update-doctor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          specialization: formData.specialization,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          registrationNumber: formData.registrationNumber
        }),
      });
      if (!doctorRes.ok) throw new Error('Failed to update doctor data');

      toast.success('Profile updated!');
      setShowEditModal(false);
      await fetchUser();
      await fetchDoctorDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Update failed');
    }
  };

  useEffect(() => {
    if (!doctor) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/get-appointments-for-doctor`, {
          credentials: 'include'
        });
        const response = await res.json();
        if (!res.ok) throw new Error(response.message || 'Failed to fetch appointments');

        const enrichedAppointments = await Promise.all(response.data.map(async (appointment) => {
          const patientRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/${appointment.patient}`, {//inside route write /doctors/:id
            credentials: 'include'
          });
          const patientData = await patientRes.json();
          if (!patientRes.ok) throw new Error(patientData.message || 'Failed to fetch patient');

          const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${patientData.data.user}`, {
            credentials: 'include'
          });
          const userData = await userRes.json();
          if (!userRes.ok) throw new Error(userData.message || 'Failed to fetch patient user');

          return {
            ...appointment,
            patientName: doctorData.data.fullName,
            patientAvatar: userData.data.avatar,
          };
        }));

        setAppointments(enrichedAppointments);
        console.log(appointments)
      } catch (err) {
        toast.error(err.message);
        console.error(err);
      }
    };

    fetchAppointments();
  }, [doctor]);


  const handleAvatarUpload = async () => {
    if (!selectedAvatar) {
      toast.error("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedAvatar);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/avatar`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload avatar");

      toast.success("Avatar updated!");
      setShowAvatarModal(false);
      setSelectedAvatar(null);
      await fetchUser(); // Refresh avatar
    } catch (err) {
      toast.error(err.message || "Upload failed");
      console.error(err);
    }
  };

  if (!doctor) return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <RiseLoader color="#80ff6f" size={15} margin={2} />
    </div>
  );

  return (
    <>
      <Navbar showMiddle={false} />
      <div className="p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-semibold">Doctor Profile</h2>
        <div className="flex gap-10">
          {/* Left Section */}
          <div className="w-1/3 bg-white rounded-xl p-4 shadow-md text-center">
            <img
              src={user.avatar}
              alt="Avatar"
              onClick={() => setShowAvatarModal(true)}
              className="w-24 h-24 mx-auto rounded-full object-cover cursor-pointer hover:opacity-80 transition"
            />
            <h3 className="mt-4 text-xl font-bold">{user.userName}</h3>
            <p className="text-gray-600">{user.email}</p>
          </div>

          {/* Right Section */}
          <div className="w-2/3 bg-white rounded-xl p-4 shadow-md">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Details</h3>
              <button
                className="bg-blue-500 text-white px-4 py-1 rounded-md"
                onClick={() => setShowEditModal(true)}
              >
                Edit
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p><strong>Full Name:</strong> {user.fullName}</p>
              <p><strong>Specialization:</strong> {doctor.specialization}</p>
              <p><strong>Experience:</strong> {doctor.experience} years</p>
              <p><strong>Hourly Rate:</strong> ₹{doctor.hourlyRate}</p>
              <p><strong>Registration Number:</strong> {doctor.registrationNumber}</p>
            </div>
          </div>
        </div>

        {/* Optional lower section */}
        <div className="bg-white rounded-xl p-4 shadow-md min-h-[350px]">
          <div className='flex justify-between items-center'>
            <h2 className="text-4xl font-semibold">Appointments</h2>
            <button
              className="cursor-pointer px-8 py-2 ml-80 bg-primary hover:bg-primary-dull hover:rounded-3xl border border-gray-800 hover:scale-110 transition text-gray-800 hover:text-white rounded-2xl">
              Set Unavailability
            </button>

          </div>
          <div className="grid gap-4 mt-4">
            {appointments.length ? appointments.map((appt) => (
              <div key={appt._id} className="flex items-center bg-gray-50 p-4 rounded-xl shadow">
                <img src={appt.doctorAvatar} alt="Doctor" className="w-16 h-16 rounded-full object-cover mr-4" />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{appt.doctorName}</h4>
                  <p><strong>Date:</strong> {appt.date?.split('T')[0]}</p>
                  <p><strong>Time:</strong> {appt.startTime} - {appt.endTime}</p>
                  <p><strong>Status:</strong> {appt.status}</p>
                </div>
              </div>
            )) : (<h1 className="text-center text-2xl font-semibold text-gray-500 mt-12 p-6">
              🚫 No Appointments Found
            </h1>)}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
            <div className="space-y-3">
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" />
              <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="Specialization" className="w-full p-2 border rounded" />
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="Experience (years)" className="w-full p-2 border rounded" />
              <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} placeholder="Hourly Rate" className="w-full p-2 border rounded" />
              <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Registration Number" className="w-full p-2 border rounded" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-1 border rounded" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="px-4 py-1 bg-blue-500 text-white rounded" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
            <h3 className="text-xl font-bold mb-4">Upload New Avatar</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedAvatar(e.target.files[0])}
              className="w-full p-2 border rounded cursor-pointer"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-1 border rounded" onClick={() => {
                setShowAvatarModal(false);
                setSelectedAvatar(null);
              }}>
                Cancel
              </button>
              <button
                className="px-4 py-1 bg-primary hover:bg-primary-dull text-white rounded"
                onClick={handleAvatarUpload}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorProfile;
