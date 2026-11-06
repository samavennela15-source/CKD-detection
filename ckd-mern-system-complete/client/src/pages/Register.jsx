import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const [role, setRole] = useState('patient');
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    contact: '',
    bloodGroup: 'O+',
    medicalHistory: '',
    assignedDoctor: '',
    specialization: 'Nephrologist',
    qualification: 'MD, DM Nephrology',
    experienceYears: 5,
    hospitalAffiliation: 'Central Renal Hospital'
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patient/doctors-list').then((res) => setDoctors(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = `/${role}/register`;
      const res = await api.post(endpoint, formData);
      login(res.data, role);
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Register New Account</h2>
        <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              role === 'patient' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              role === 'doctor' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register as Doctor
          </button>
        </div>

        {error && <div className="bg-rose-500/10 text-rose-400 border border-rose-500/30 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Password</label>
              <input
                type="password"
                required
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase">Contact / Phone</label>
              <input
                type="text"
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>
          </div>

          {role === 'patient' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Age</label>
                  <input
                    type="number"
                    required
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Gender</label>
                  <select
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Blood Group</label>
                  <input
                    type="text"
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                    placeholder="e.g. O+"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Assign Doctor</label>
                <select
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                  value={formData.assignedDoctor}
                  onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                >
                  <option value="">Select a Doctor</option>
                  {doctors.map((d) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Medical History</label>
                <textarea
                  rows="2"
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                  placeholder="Hypertension, diabetes, past surgeries..."
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                ></textarea>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Specialization</label>
                  <input
                    type="text"
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase">Experience (Years)</label>
                  <input
                    type="number"
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase">Hospital Affiliation</label>
                <input
                  type="text"
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                  value={formData.hospitalAffiliation}
                  onChange={(e) => setFormData({ ...formData, hospitalAffiliation: e.target.value })}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg text-sm transition mt-2"
          >
            Complete Registration
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-4">
          Already registered? <Link to="/login" className="text-cyan-400 hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
