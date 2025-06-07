import { useState } from 'react';
import Navbar from '../components/Navbar';

const CompletePatient = () => {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // handle form submission logic here
    console.log({ dob, gender });
  };

  return (
    <>
      <Navbar showMiddle={false} />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-6">Complete Patient Information</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col text-gray-700">
            Date of Birth
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col text-gray-700">
            Gender
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className="mt-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" disabled>Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-4 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </>
  );
};

export default CompletePatient;
