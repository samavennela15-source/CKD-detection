import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Activity, MessageSquare, Star, User, CheckCircle2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');
  const [vitals, setVitals] = useState({
    serumCreatinine: '',
    uacr: '',
    systolicBP: '120',
    diastolicBP: '80',
    bloodUreaNitrogen: '18',
    fastingBloodSugar: '95'
  });
  const [queryForm, setQueryForm] = useState({ subject: '', question: '' });
  const [queries, setQueries] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: '', category: 'General' });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patient/profile');
      setProfile(res.data);
      setProfileForm(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueries = async () => {
    try {
      const res = await api.get('/patient/view-query');
      setQueries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchQueries();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/patient/predict', vitals);
      fetchProfile();
      alert(`Prediction completed: Stage ${res.data.assessment.stage} (${res.data.assessment.riskLevel} Risk)`);
    } catch (err) {
      alert(err.response?.data?.message || 'Prediction failed');
    }
  };

  const handleAskQuery = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patient/ask-query', queryForm);
      setQueryForm({ subject: '', question: '' });
      fetchQueries();
      alert('Query submitted to your medical team!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit query');
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patient/add-feedback', feedbackForm);
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 4000);
      setFeedbackForm({ rating: 5, comments: '', category: 'General' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send feedback');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/patient/update-profile', profileForm);
      fetchProfile();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading patient portal...</div>;

  const history = profile?.predictionHistory || [];
  const latest = history[history.length - 1];

  const chartData = {
    labels: history.map((h) => new Date(h.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'eGFR mL/min/1.73m²',
        data: history.map((h) => h.egfr),
        borderColor: '#06b6d4',
        backgroundColor: '#0891b2',
        tension: 0.2
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {profile?.name}</h1>
          <p className="text-slate-400 text-sm">
            Age: {profile?.age} | Gender: {profile?.gender} | Blood: {profile?.bloodGroup} | Doctor: {profile?.assignedDoctor?.name || 'Unassigned'}
          </p>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('predict')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'predict' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> Assessment
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'queries' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Queries
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'feedback' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className="w-4 h-4" /> Feedback
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
        </div>
      </div>

      {activeTab === 'predict' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Run CKD Prediction</h2>
            <form onSubmit={handlePredict} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Serum Creatinine (mg/dL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={vitals.serumCreatinine}
                  onChange={(e) => setVitals({ ...vitals, serumCreatinine: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                  placeholder="e.g. 1.4"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">UACR (Albumin/Creatinine mg/g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitals.uacr}
                  onChange={(e) => setVitals({ ...vitals, uacr: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                  placeholder="e.g. 35"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-400">Systolic BP</label>
                  <input
                    type="number"
                    value={vitals.systolicBP}
                    onChange={(e) => setVitals({ ...vitals, systolicBP: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-400">Diastolic BP</label>
                  <input
                    type="number"
                    value={vitals.diastolicBP}
                    onChange={(e) => setVitals({ ...vitals, diastolicBP: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-400">BUN (mg/dL)</label>
                  <input
                    type="number"
                    value={vitals.bloodUreaNitrogen}
                    onChange={(e) => setVitals({ ...vitals, bloodUreaNitrogen: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase font-semibold text-slate-400">Blood Sugar</label>
                  <input
                    type="number"
                    value={vitals.fastingBloodSugar}
                    onChange={(e) => setVitals({ ...vitals, fastingBloodSugar: e.target.value })}
                    className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2.5 rounded-lg text-sm transition mt-2"
              >
                Calculate eGFR & KDIGO Stage
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {latest && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-3xl font-extrabold text-cyan-400">{latest.egfr}</span>
                    <span className="text-slate-400 text-xs ml-2">mL/min/1.73m²</span>
                    <div className="mt-1 font-semibold text-white">Stage {latest.stage} - {latest.description}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    latest.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                    latest.riskLevel === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                    latest.riskLevel === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {latest.riskLevel} Risk
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl text-sm border border-slate-800">
                  <span className="font-semibold text-cyan-400 block mb-1">Clinical Directive:</span>
                  <p className="text-slate-300">{latest.recommendation}</p>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Progression Over Time (eGFR Graph)</h3>
              {history.length > 0 ? (
                <Line data={chartData} options={{ responsive: true, scales: { y: { min: 0, max: 140 } } }} />
              ) : (
                <p className="text-slate-500 text-sm">No historical clinical data submitted yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Ask Medical Question</h2>
            <form onSubmit={handleAskQuery} className="space-y-4">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Subject</label>
                <input
                  type="text"
                  required
                  value={queryForm.subject}
                  onChange={(e) => setQueryForm({ ...queryForm, subject: e.target.value })}
                  placeholder="e.g. Swelling in ankles after medication"
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Detailed Question</label>
                <textarea
                  rows="4"
                  required
                  value={queryForm.question}
                  onChange={(e) => setQueryForm({ ...queryForm, question: e.target.value })}
                  placeholder="Describe your symptoms or inquiries for the doctor..."
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg text-sm transition"
              >
                Send Question to Doctor
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">My Submitted Queries</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {queries.length === 0 && <p className="text-slate-500 text-sm">No queries logged yet.</p>}
              {queries.map((q) => (
                <div key={q._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-white text-sm">{q.subject}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      q.status === 'Replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-2">{q.question}</p>
                  {q.response && (
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-2">
                      <span className="text-[11px] font-semibold text-cyan-400 block">Doctor Response:</span>
                      <p className="text-xs text-slate-200">{q.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Share Experience Feedback</h2>
          {feedbackSent && (
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Thank you! Your feedback has been registered.
            </div>
          )}
          <form onSubmit={handleAddFeedback} className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Category</label>
              <select
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                value={feedbackForm.category}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
              >
                <option value="Doctor Consultation">Doctor Consultation</option>
                <option value="Platform Experience">Platform Experience</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Rating (1 to 5 Stars)</label>
              <select
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Needs Improvement</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Comments</label>
              <textarea
                rows="4"
                required
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                placeholder="Give us your feedback..."
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white text-sm"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg text-sm transition"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Update Profile Information</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Full Name</label>
              <input
                type="text"
                value={profileForm.name || ''}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Age</label>
                <input
                  type="number"
                  value={profileForm.age || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Phone</label>
                <input
                  type="text"
                  value={profileForm.contact || ''}
                  onChange={(e) => setProfileForm({ ...profileForm, contact: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Medical History</label>
              <textarea
                rows="3"
                value={profileForm.medicalHistory || ''}
                onChange={(e) => setProfileForm({ ...profileForm, medicalHistory: e.target.value })}
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 rounded-lg text-sm transition"
            >
              Save Profile Updates
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
