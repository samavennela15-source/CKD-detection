import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { ShieldCheck, UserCheck, Stethoscope } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = `/${role}/login`;
      const res = await api.post(endpoint, formData);
      login(res.data, role);
      if (role === 'patient') navigate('/patient');
      else if (role === 'doctor') navigate('/doctor');
      else if (role === 'admin') navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Access Portal</h2>
        <p className="text-slate-400 text-sm text-center mb-6">Select your role to sign into the CKD Network</p>

        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              role === 'patient' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              role === 'doctor' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Doctor
          </button>
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
              role === 'admin' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none text-sm"
              placeholder={role === 'admin' ? 'admin@ckd.org' : 'name@example.com'}
            />
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-cyan-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : `Log in as ${role.toUpperCase()}`}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Need an account? <Link to="/register" className="text-cyan-400 hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}
