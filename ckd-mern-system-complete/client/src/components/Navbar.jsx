import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, ShieldAlert, Stethoscope, User } from 'lucide-react';

export default function Navbar() {
  const { user, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 text-cyan-400 font-bold text-xl">
          <Activity className="h-6 w-6 text-cyan-400" />
          <span>RenalGuard CKD</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                {role === 'doctor' && <Stethoscope className="w-4 h-4 text-emerald-400" />}
                {role === 'patient' && <User className="w-4 h-4 text-cyan-400" />}
                {role === 'admin' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                <span className="font-semibold text-white">{user.name || user.email}</span>
                <span className="uppercase text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  {role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex space-x-2">
              <Link to="/login" className="text-sm bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition">
                Sign In
              </Link>
              <Link to="/register" className="text-sm bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded transition font-medium">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
