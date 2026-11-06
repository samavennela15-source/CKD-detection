import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Stethoscope, BookOpen, MessageSquare, Star, Users, Trash2, Edit2 } from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [queries, setQueries] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  const [diseaseForm, setDiseaseForm] = useState({
    name: '',
    stageCode: 'G1',
    symptoms: '',
    causes: '',
    preventiveMeasures: '',
    dietaryGuidelines: '',
    recommendedTests: ''
  });
  const [editingDiseaseId, setEditingDiseaseId] = useState(null);

  const [predictForm, setPredictForm] = useState({
    patientId: '',
    serumCreatinine: '',
    uacr: '',
    systolicBP: '120',
    diastolicBP: '80',
    bloodUreaNitrogen: '18',
    fastingBloodSugar: '90',
    notes: '',
    age: '50',
    gender: 'male'
  });

  const [replyText, setReplyText] = useState('');
  const [selectedQueryId, setSelectedQueryId] = useState(null);

  const loadData = async () => {
    try {
      const [pRes, dRes, qRes, fRes] = await Promise.all([
        api.get('/doctor/my-patients'),
        api.get('/doctor/view-disease'),
        api.get('/doctor/view-query'),
        api.get('/doctor/view-feedback')
      ]);
      setPatients(pRes.data);
      setDiseases(dRes.data);
      setQueries(qRes.data);
      setFeedbacks(fRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDiseaseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDiseaseId) {
        await api.put(`/doctor/update-disease/${editingDiseaseId}`, diseaseForm);
        setEditingDiseaseId(null);
      } else {
        await api.post('/doctor/add-disease', diseaseForm);
      }
      setDiseaseForm({
        name: '',
        stageCode: 'G1',
        symptoms: '',
        causes: '',
        preventiveMeasures: '',
        dietaryGuidelines: '',
        recommendedTests: ''
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteDisease = async (id) => {
    if (!window.confirm('Delete this disease record?')) return;
    try {
      await api.delete(`/doctor/delete-disease/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/doctor/predict', predictForm);
      alert(`Diagnosis Recorded: Stage ${res.data.assessment.stage} (${res.data.assessment.riskLevel} Risk)`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Diagnosis failed');
    }
  };

  const handleReplyQuery = async (queryId) => {
    if (!replyText.trim()) return;
    try {
      await api.post('/doctor/reply-query', { queryId, response: replyText });
      setReplyText('');
      setSelectedQueryId(null);
      loadData();
    } catch (err) {
      alert('Failed to reply query');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'patients' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" /> Patients Cohort
        </button>
        <button
          onClick={() => setActiveTab('predict')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'predict' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Stethoscope className="w-4 h-4" /> Run Diagnosis
        </button>
        <button
          onClick={() => setActiveTab('diseases')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'diseases' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Disease Catalog
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'queries' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Patient Queries ({queries.filter(q => q.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'feedback' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4" /> View Feedback
        </button>
      </div>

      {activeTab === 'patients' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-white text-lg">Assigned Patient Cohort</h2>
            <span className="text-xs text-slate-400 font-mono">{patients.length} Registered</span>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Age / Gender</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Latest eGFR</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const latest = p.predictionHistory?.[p.predictionHistory.length - 1];
                return (
                  <tr key={p._id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="p-4 font-semibold text-white">{p.name}</td>
                    <td className="p-4 text-slate-400">{p.age}y / {p.gender}</td>
                    <td className="p-4 text-slate-400">{p.contact || 'N/A'}</td>
                    <td className="p-4 font-mono text-cyan-400">{latest ? latest.egfr : 'No tests'}</td>
                    <td className="p-4 font-mono">{latest ? latest.stage : '-'}</td>
                    <td className="p-4">
                      {p.isFrozen ? (
                        <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded">Frozen</span>
                      ) : (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'predict' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Doctor Clinical Test & Assessment</h2>
          <form onSubmit={handlePredictSubmit} className="space-y-4">
            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Select Patient (Optional)</label>
              <select
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                value={predictForm.patientId}
                onChange={(e) => setPredictForm({ ...predictForm, patientId: e.target.value })}
              >
                <option value="">Manual Entry (No Profile Link)</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Serum Creatinine (mg/dL) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={predictForm.serumCreatinine}
                  onChange={(e) => setPredictForm({ ...predictForm, serumCreatinine: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">UACR (mg/g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={predictForm.uacr}
                  onChange={(e) => setPredictForm({ ...predictForm, uacr: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-slate-400">Doctor's Clinical Recommendation</label>
              <textarea
                rows="3"
                value={predictForm.notes}
                onChange={(e) => setPredictForm({ ...predictForm, notes: e.target.value })}
                placeholder="Prescribe ACE inhibitors, low-sodium dietary advice..."
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              Dispatch Diagnostic Assessment
            </button>
          </form>
        </div>
      )}

      {activeTab === 'diseases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">{editingDiseaseId ? 'Edit Disease' : 'Add Disease Entry'}</h3>
            <form onSubmit={handleDiseaseSubmit} className="space-y-3">
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Disease / Condition Name</label>
                <input
                  type="text"
                  required
                  value={diseaseForm.name}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, name: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">KDIGO Stage Code</label>
                <select
                  value={diseaseForm.stageCode}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, stageCode: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                >
                  <option value="G1">G1 - Normal (eGFR ≥ 90)</option>
                  <option value="G2">G2 - Mildly Decreased (60-89)</option>
                  <option value="G3a">G3a - Mild-Moderate (45-59)</option>
                  <option value="G3b">G3b - Moderate-Severe (30-44)</option>
                  <option value="G4">G4 - Severely Decreased (15-29)</option>
                  <option value="G5">G5 - Kidney Failure (&lt; 15)</option>
                  <option value="Other">Other Renal Disorder</option>
                </select>
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Symptoms (comma separated)</label>
                <input
                  type="text"
                  value={diseaseForm.symptoms}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, symptoms: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Causes (comma separated)</label>
                <input
                  type="text"
                  value={diseaseForm.causes}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, causes: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-semibold text-slate-400">Dietary Guidelines</label>
                <textarea
                  rows="2"
                  value={diseaseForm.dietaryGuidelines}
                  onChange={(e) => setDiseaseForm({ ...diseaseForm, dietaryGuidelines: e.target.value })}
                  className="mt-1 w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded text-sm transition"
              >
                {editingDiseaseId ? 'Update Record' : 'Save Disease Info'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {diseases.map((d) => (
              <div key={d._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-base">{d.name}</h4>
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      Stage {d.stageCode}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDiseaseId(d._id);
                        setDiseaseForm({
                          name: d.name,
                          stageCode: d.stageCode,
                          symptoms: d.symptoms.join(', '),
                          causes: d.causes.join(', '),
                          preventiveMeasures: d.preventiveMeasures.join(', '),
                          dietaryGuidelines: d.dietaryGuidelines,
                          recommendedTests: d.recommendedTests.join(', ')
                        });
                      }}
                      className="p-1.5 text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDisease(d._id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-2 space-y-1">
                  <div><strong>Symptoms:</strong> {d.symptoms.join(', ')}</div>
                  <div><strong>Diet:</strong> {d.dietaryGuidelines}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'queries' && (
        <div className="space-y-4">
          {queries.map((q) => (
            <div key={q._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-white">{q.subject}</h4>
                  <p className="text-xs text-slate-400">Patient: {q.patientId?.name} ({q.patientId?.email})</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  q.status === 'Replied' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {q.status}
                </span>
              </div>
              <p className="text-sm text-slate-300 mb-3">{q.question}</p>

              {q.response ? (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="font-semibold text-emerald-400">Dispatched Response:</span>
                  <p className="text-slate-300 mt-1">{q.response}</p>
                </div>
              ) : (
                <div>
                  {selectedQueryId === q._id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write clinical reply..."
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white"
                      ></textarea>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReplyQuery(q._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded"
                        >
                          Send Response
                        </button>
                        <button
                          onClick={() => setSelectedQueryId(null)}
                          className="bg-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedQueryId(q._id)}
                      className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded hover:bg-emerald-600 hover:text-white transition"
                    >
                      Reply to Patient
                    </button>
                  )}
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
                <span className="font-semibold text-white text-sm">{f.patientId?.name || 'Anonymous'}</span>
                <span className="text-amber-400 text-xs font-bold">{f.rating} / 5 Stars</span>
              </div>
              <p className="text-xs text-slate-400 mb-2 font-mono">Category: {f.category}</p>
              <p className="text-sm text-slate-300">{f.comments}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
