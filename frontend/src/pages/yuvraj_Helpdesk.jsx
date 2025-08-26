import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { yuvrajListConsultationSlots, yuvrajCreateHelpdeskRequest, yuvrajListHelpdeskRequests, yuvrajUpdateHelpdeskStatus } from "../services/yuvraj_helpdesk_api.js";
import { yuvrajListInstructors } from "../services/yuvraj_instructors_api.js";
import HamburgerMenu from "../components/HamburgerMenu.jsx";

export default function Yuvraj_Helpdesk() {
  const { user, isStudent, isInstructor, isInstitution } = useAuth();
  const [slots, setSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ category: "consultation", title: "", description: "", assigneeType: "instructor" });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [responseForm, setResponseForm] = useState({ requestId: null, message: "", status: "resolved" });
  const [showResponseForm, setShowResponseForm] = useState(null);

  useEffect(() => {
    yuvrajListConsultationSlots().then(setSlots);
    yuvrajListHelpdeskRequests().then(setRequests);
    yuvrajListInstructors().then(setInstructors).catch(() => setInstructors([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      createdBy: user?._id || undefined,
      description: form.category === 'consultation' && selectedSlot ? `${form.description || ''}\nPreferred Slot: ${selectedSlot.weekday} ${selectedSlot.startMinutes}-${selectedSlot.endMinutes}` : form.description,
    };
    const created = await yuvrajCreateHelpdeskRequest(body);
    setRequests([created, ...requests]);
    setForm({ category: "consultation", title: "", description: "", assigneeType: "instructor" });
    setSelectedSlot(null);
  };

  const canManage = isInstructor || isInstitution;

  const handleResponse = async (e) => {
    e.preventDefault();
    const update = await yuvrajUpdateHelpdeskStatus(responseForm.requestId, responseForm.status, { 
      status: responseForm.status, 
      note: responseForm.message,
      respondedBy: user?.name || 'Staff'
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
          <img src="/Atsenlogo.png" alt="ATSEN" className="h-10 w-auto" />
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
                  <label className="block text-sm text-gray-700 mb-1">Consultation Hours</label>
                  <select className="select select-bordered w-full" value={selectedSlot?._id || ''} onChange={(e) => setSelectedSlot(slots.find(s => s._id === e.target.value))}>
                    <option value="">Select a slot</option>
                    {slots.map((s) => (
                      <option key={s._id} value={s._id}>{`Weekday ${s.weekday} • ${s.startMinutes}-${s.endMinutes}`}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Instructor</label>
                <select className="select select-bordered w-full" value={form.assigneeId || ''} onChange={(e) => setForm({ ...form, assigneeId: e.target.value, assigneeType: 'instructor' })}>
                  <option value="">Any available</option>
                  {instructors.map((i) => (
                    <option key={i._id || i.id} value={i._id || i.id}>{i.name || i.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title</label>
                <input className="input input-bordered w-full" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea className="textarea textarea-bordered w-full" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Assign To</label>
                <select className="select select-bordered w-full" value={form.assigneeType} onChange={(e) => setForm({ ...form, assigneeType: e.target.value })}>
                  <option value="instructor">Instructor</option>
                  <option value="institution">Institution</option>
                </select>
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
              {requests.map((r) => (
                <div key={r._id} className="p-3 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{r.title}</div>
                      <div className="text-sm text-gray-500">{r.category} • {r.status}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        r.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        r.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        r.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {r.status || 'Pending'}
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
                    <p className="text-sm text-gray-600 mb-2">{r.description}</p>
                    {r.timeline?.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        {r.timeline.map((t, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <div>
                              <div className="font-medium">{new Date(t.at).toLocaleString()} — {t.status}</div>
                              {t.note && (
                                <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                                  <span className="font-medium">{t.respondedBy || 'Staff'}:</span> {t.note}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


