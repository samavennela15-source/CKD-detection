import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Users, Stethoscope, MessageSquare, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [queries, setQueries] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const loadData = async () => {
    try {
      const [docRes, patRes, qRes, fbRes] = await Promise.all([
        api.get('/admin/view-doctors'),
        api.get('/admin/view-patients'),
        api.get('/admin/view-queries'),
        api.get('/admin/view-feedback')
      ]);
      setDoctors(docRes.data);
      setPatients(patRes.data);
      setQueries(qRes.data);
      setFeedbacks(fbRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFreezeDoctor = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/freeze-doctor/${id}`, { isFrozen: !currentStatus });
      loadData();
    } catch (err) {
      alert('Failed to update freeze status');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete doctor account completely?')) return;
    try {
      await api.delete(`/admin/delete-doctor/${id}`);
      loadData();
    } catch (err) {
      alert('Failed to delete doctor');
    }
  };

  const handleFreezePatient = async (id, currentStatus) => {
    try {
      await api.patch(`/admin/freeze-patient/${id}`, { isFrozen: !currentStatus });
      loadData();
    } catch (err) {
      alert('Failed to update freeze status');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Delete patient account completely?')) return;
    try {
      await api.delete(`/admin/delete-patient/${id}`);
      loadData();
    } catch (err) {
      alert('Failed to delete patient');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">System Administration Panel</h1>
          <p className="text-slate-400 text-sm">Oversee clinicians, patients, and platform audits</p>
        </div>
      </div>

      <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 mb-8">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex justify-center items-center gap-1.5 ${
            activeTab === 'doctors' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Doctors ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex justify-center items-center gap-1.5 ${
            activeTab === 'patients' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Patients ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex justify-center items-center gap-1.5 ${
            activeTab === 'queries' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Queries ({queries.length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition flex justify-center items-center gap-1.5 ${
            activeTab === 'feedback' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" /> Feedbacks ({feedbacks.length})
        </button>
      </div>

      {activeTab === 'doctors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Doctor</th>
                <th className="p-4">Specialization</th>
                <th className="p-4">Affiliation</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="font-semibold text-white">{d.name}</div>
                    <div className="text-xs text-slate-400">{d.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">{d.specialization}</td>
                  <td className="p-4 text-slate-300">{d.hospitalAffiliation}</td>
                  <td className="p-4">
                    {d.isFrozen ? (
                      <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-semibold">Frozen</span>
                    ) : (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleFreezeDoctor(d._id, d.isFrozen)}
                      className={`text-xs px-2.5 py-1 rounded transition ${
                        d.isFrozen ? 'bg-cyan-600/20 text-cyan-400' : 'bg-amber-600/20 text-amber-400'
                      }`}
                    >
                      {d.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(d._id)}
                      className="text-xs bg-rose-600/20 text-rose-400 px-2.5 py-1 rounded hover:bg-rose-600 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Patient</th>
                <th className="p-4">Demographics</th>
                <th className="p-4">Assigned Doctor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">{p.age} yrs | {p.gender}</td>
                  <td className="p-4 text-slate-300">{p.assignedDoctor?.name || 'None'}</td>
                  <td className="p-4">
                    {p.isFrozen ? (
                      <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-semibold">Frozen</span>
                    ) : (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-semibold">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleFreezePatient(p._id, p.isFrozen)}
                      className={`text-xs px-2.5 py-1 rounded transition ${
                        p.isFrozen ? 'bg-cyan-600/20 text-cyan-400' : 'bg-amber-600/20 text-amber-400'
                      }`}
                    >
                      {p.isFrozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button
                      onClick={() => handleDeletePatient(p._id)}
                      className="text-xs bg-rose-600/20 text-rose-400 px-2.5 py-1 rounded hover:bg-rose-600 hover:text-white transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="space-y-4">
          {queries.map((q) => (
            <div key={q._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white text-sm">{q.subject}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  q.status === 'Replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {q.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                From: {q.patientId?.name} ({q.patientId?.email}) → To: {q.doctorId?.name || 'General Inquiries'}
              </p>
              <p className="text-sm text-slate-300">{q.question}</p>
              {q.response && (
                <div className="bg-slate-950 p-2.5 rounded mt-3 text-xs border border-slate-800">
                  <span className="text-cyan-400 font-semibold">Doctor Reply: </span>
                  <span className="text-slate-300">{q.response}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div key={f._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-white">{f.patientId?.name || 'Patient'}</span>
                <span className="text-amber-400 font-bold text-xs">{f.rating} / 5 Stars</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">Category: {f.category} | Assigned: {f.doctorId?.name || 'General'}</p>
              <p className="text-sm text-slate-300">{f.comments}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
