import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { yuvrajListConsultationSlots, yuvrajCreateHelpdeskRequest, yuvrajListHelpdeskRequests, yuvrajUpdateHelpdeskStatus } from "../services/yuvraj_helpdesk_api.js";
import { yuvrajListInstructors } from "../services/yuvraj_instructors_api.js";
import HamburgerMenu from "../components/HamburgerMenu.jsx";

export default function Yuvraj_Helpdesk() {
  const { user, isStudent, isInstructor, isInstitution } = useAuth();
  const [slots, setSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ category: "consultation", title: "", description: "", assigneeType: "institution", consultationDate: "", consultationTime: "" });
  const [instructors, setInstructors] = useState([]);
  const [responseForm, setResponseForm] = useState({ requestId: null, message: "", status: "resolved" });
  const [showResponseForm, setShowResponseForm] = useState(null);

  useEffect(() => {
    const institutionSlug = user?.slug || null;
    yuvrajListConsultationSlots().then(setSlots);
    yuvrajListHelpdeskRequests(institutionSlug).then(setRequests);
    // Load instructors filtered by institution
    yuvrajListInstructors(institutionSlug).then(setInstructors).catch(() => setInstructors([]));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let description = form.description || '';
    
    // Add consultation details to description
    if (form.category === 'consultation') {
      if (form.consultationDate && form.consultationTime) {
        description += `\n\n🕒 Preferred Consultation Time:\n📅 Date: ${form.consultationDate}\n⏰ Time: ${form.consultationTime}`;
      }
    }
    
    const body = {
      ...form,
      createdBy: user?.id || user?.student?.id,
      institutionSlug: user?.slug,
      description: description,
    };
    const created = await yuvrajCreateHelpdeskRequest(body);
    setRequests([created, ...requests]);
    setForm({ category: "consultation", title: "", description: "", assigneeType: "institution", consultationDate: "", consultationTime: "" });
  };

  const canManage = isInstructor || isInstitution;

  const handleResponse = async (e) => {
    e.preventDefault();
    // Format response with actual name
    const respondedBy = isInstructor ? `${user?.name || 'Instructor'}` : isInstitution ? `${user?.name || user?.institution?.name || 'Institution'}` : (user?.name || 'Staff');
    const update = await yuvrajUpdateHelpdeskStatus(responseForm.requestId, responseForm.status, { 
      status: responseForm.status, 
      note: responseForm.message,
      respondedBy: respondedBy
    });
    setRequests((prev) => prev.map(x => x._id === responseForm.requestId ? update : x));
    setResponseForm({ requestId: null, message: "", status: "resolved" });
    setShowResponseForm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <HamburgerMenu />
          <h1 className="text-2xl font-semibold text-gray-800">Helpdesk</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Create Request (Students Only) */}
          {isStudent && (
            <div className="bg-white rounded-2xl p-4 shadow border">
              <h2 className="text-lg font-semibold mb-3">Create Request</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select
                  className="select select-bordered w-full"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="consultation">Request consultation</option>
                  <option value="administration">Administration help</option>
                  <option value="complaint">Report a complaint</option>
                  <option value="payment">Payment</option>
                  <option value="technical">Technical</option>
                  <option value="course">Course</option>
                  <option value="instructor">Instructor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {form.category === 'consultation' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Preferred Date & Time</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      className="input input-bordered w-full"
                      value={form.consultationDate || ''}
                      onChange={(e) => setForm({ ...form, consultationDate: e.target.value })}
                    />
                    <input 
                      type="time" 
                      className="input input-bordered w-full"
                      value={form.consultationTime || ''}
                      onChange={(e) => setForm({ ...form, consultationTime: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Assign To</label>
                <select className="select select-bordered w-full" value={form.assigneeType} onChange={(e) => setForm({ ...form, assigneeType: e.target.value })}>
                  <option value="institution">Institution</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              {form.assigneeType === 'instructor' && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Select Instructor</label>
                  <select className="select select-bordered w-full" value={form.assigneeId || ''} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}>
                    <option value="">Any available</option>
                    {instructors.map((i) => (
                      <option key={i._id || i.id} value={i._id || i.id}>{i.name || i.email}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input className="input input-bordered w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea className="textarea textarea-bordered w-full" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary">Submit Request</button>
            </form>
          </div>
          )}

          {/* Response Form (Instructors/Institutions Only) */}
          {canManage && showResponseForm && (
            <div className="bg-white rounded-2xl p-4 shadow border">
              <h2 className="text-lg font-semibold mb-3">Respond to Request</h2>
              <form onSubmit={handleResponse} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Status</label>
                  <select 
                    className="select select-bordered w-full" 
                    value={responseForm.status} 
                    onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                  >
                    <option value="accepted">Accepted</option>
                    <option value="processing">Processing</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Response Message</label>
                  <textarea 
                    className="textarea textarea-bordered w-full" 
                    rows={4} 
                    value={responseForm.message} 
                    onChange={(e) => setResponseForm({ ...responseForm, message: e.target.value })}
                    placeholder="Enter your response to the student..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">Send Response</button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowResponseForm(null);
                      setResponseForm({ requestId: null, message: "", status: "resolved" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Requests Timeline */}
          <div className={`bg-white rounded-2xl p-4 shadow border ${isStudent ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <h2 className="text-lg font-semibold mb-3">Requests Timeline</h2>
            <div className="space-y-3">
              {requests.map((r) => {
                // Extract consultation time from description for highlighting
                const consultationMatch = r.description?.match(/📅 Date: ([\d-]+)\n⏰ Time: ([\d:]+)/);
                const hasConsultationTime = consultationMatch && r.category === 'consultation';
                
                return (
                  <div key={r._id} className={`p-4 rounded-lg border-2 ${
                    r.status === 'resolved' || r.status === 'accepted' ? 'border-green-200 bg-green-50' :
                    r.status === 'processing' ? 'border-yellow-200 bg-yellow-50' :
                    r.status === 'rejected' ? 'border-red-200 bg-red-50' :
                    'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          {r.title}
                          {(r.status === 'resolved' || r.status === 'accepted') && (
                            <span className="text-green-600">✅</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{r.category}</div>
                        {hasConsultationTime && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="text-sm font-medium text-blue-800">📅 Requested Consultation</div>
                            <div className="text-sm text-blue-700">
                              🗓️ {consultationMatch[1]} at ⏰ {consultationMatch[2]}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          r.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-300' :
                          r.status === 'accepted' ? 'bg-green-100 text-green-800 border-green-300' :
                          r.status === 'processing' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          r.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {r.status === 'resolved' ? '✅ Resolved' :
                           r.status === 'accepted' ? '✅ Accepted' :
                           r.status === 'processing' ? '⏳ Processing' :
                           r.status === 'rejected' ? '❌ Rejected' :
                           '⏰ Pending'}
                        </span>
                        {canManage && r.status !== 'resolved' && r.status !== 'rejected' && (
                          <button 
                            className="btn btn-xs btn-primary" 
                            onClick={() => {
                              setShowResponseForm(r._id);
                              setResponseForm({ ...responseForm, requestId: r._id });
                            }}
                          >
                            Respond
                          </button>
                        )}
                        {isStudent && r.status === 'resolved' && (
                          <button className="btn btn-xs btn-outline">View Response</button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2 whitespace-pre-line">{r.description}</p>
                      {r.timeline?.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-sm font-medium text-gray-700">Response Timeline:</div>
                          {r.timeline.map((t, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                t.status === 'resolved' || t.status === 'accepted' ? 'bg-green-500' :
                                t.status === 'processing' ? 'bg-yellow-500' :
                                t.status === 'rejected' ? 'bg-red-500' :
                                'bg-gray-400'
                              }`}></span>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700">
                                  {new Date(t.at).toLocaleString()} — {t.status}
                                </div>
                                {t.note && (
                                  <div className={`mt-1 p-3 rounded-md border ${
                                    t.status === 'resolved' || t.status === 'accepted' ? 'bg-green-50 border-green-200' :
                                    t.status === 'processing' ? 'bg-yellow-50 border-yellow-200' :
                                    t.status === 'rejected' ? 'bg-red-50 border-red-200' :
                                    'bg-gray-50 border-gray-200'
                                  }`}>
                                    <div className="text-sm">
                                      <span className="font-semibold text-gray-800">{t.respondedBy || 'Staff'}:</span>
                                      <span className="ml-2">{t.note}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


