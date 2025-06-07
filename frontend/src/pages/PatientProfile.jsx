import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { RiseLoader } from "react-spinners";

const PatientProfile = () => {
    const { user, fetchUser, navigate, globalRole } = useAppContext();
    const [showEditModal, setShowEditModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [patient, setPatient] = useState(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        userName: '',
        email: '',
        gender: '',
        dob: ''
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/get-patient-details`, {
                    credentials: 'include'
                });
                const response = await res.json();
                if (!res.ok) throw new Error(response.message || 'Failed to fetch patient');
                console.log(response);
                setPatient(response.data);
            } catch (err) {
                toast.error(err.message);
                console.error(err);
            }
        };

        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || '',
                userName: user.userName || '',
                email: user.email || ''
            }));
            fetchPatient();
        }
    }, [user]);

    useEffect(() => {
        if (patient) {
            setFormData(prev => ({
                ...prev,
                gender: patient.gender || '',
                dob: patient.dob ? patient.dob.split('T')[0] : ''
            }));
        }
    }, [patient]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update-account`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    fullName: formData.fullName,
                    userName: formData.userName,
                    email: formData.email
                })
            });

            if (!userRes.ok) throw new Error('Failed to update user');

            const patientRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/update-patient`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    gender: formData.gender,
                    dob: formData.dob
                })
            });

            if (!patientRes.ok) throw new Error('Failed to update patient info');

            toast.success('Profile updated!');
            setShowEditModal(false);
            await fetchUser();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Update failed');
        }
    };

    useEffect(() => {
        if (!patient) return;

        const fetchAppointments = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/patients/get-appointments-for-patient`, {
                    credentials: 'include'
                });
                const response = await res.json();
                if (!res.ok) throw new Error(response.message || 'Failed to fetch appointments');

                const enrichedAppointments = await Promise.all(response.data.map(async (appointment) => {
                    const doctorRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/doctors/${appointment.doctorId}`, {//inside route write /doctors/:id
                        credentials: 'include'
                    });
                    const doctorData = await doctorRes.json();
                    if (!doctorRes.ok) throw new Error(doctorData.message || 'Failed to fetch doctor');

                    const userRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${doctorData.data.user}`, {
                        credentials: 'include'
                    });
                    const userData = await userRes.json();
                    if (!userRes.ok) throw new Error(userData.message || 'Failed to fetch doctor user');

                    return {
                        ...appointment,
                        doctorName: doctorData.data.fullName,
                        doctorAvatar: userData.data.avatar,
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
    }, [patient]);

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







    if (!patient) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <RiseLoader color="#80ff6f" size={15} margin={2} />
        </div>
    );

    return (
        <>
            <Navbar showMiddle={false} />
            <div className="p-6 flex flex-col gap-6">
                <h2 className="text-2xl font-semibold">Patient Profile</h2>
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
                                className="bg-blue-500 hover:bg-primary-dull cursor-pointer text-white px-4 py-1 rounded-md"
                                onClick={() => setShowEditModal(true)}
                            >
                                Edit
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <p><strong>Full Name:</strong> {user.fullName}</p>
                            <p><strong>Gender:</strong> {patient?.gender || 'Not provided'}</p>
                            <p><strong>Date of Birth:</strong> {patient?.dob ? patient.dob.split('T')[0] : 'Not provided'}</p>
                        </div>
                    </div>
                </div>

                {/* Optional lower section */}
                <div className="bg-white rounded-xl p-4 shadow-md min-h-[350px]">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-4xl font-semibold">Appointments</h2>
                        <button
                            onClick={() => {
                                navigate(`${globalRole}s/`)
                            }}
                            className="cursor-pointer px-8 py-2 ml-80 bg-primary hover:bg-primary-dull hover:rounded-3xl border border-gray-800 hover:scale-110 transition text-gray-800 hover:text-white rounded-2xl">
                            Book Appointments
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
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                        <div className="space-y-3">
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="w-full p-2 border rounded" />
                            <input type="text" name="userName" value={formData.userName} onChange={handleChange} placeholder="Username" className="w-full p-2 border rounded" />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-2 border rounded" />
                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <button className="px-4 py-1 cursor-pointer border rounded" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="px-4 py-1 cursor-pointer bg-primary hover:bg-primary-dull  border text-white rounded" onClick={handleSave}>Save</button>
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
                            className="w-full p-2 border rounded"
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

export default PatientProfile;
