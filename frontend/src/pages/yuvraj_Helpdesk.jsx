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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <HamburgerMenu />
          <img src="/Atsenlogo.png" alt="ATSEN" className="h-10 w-auto" />
          <h1 className="text-2xl font-semibold text-gray-800">Helpdesk</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Create Request */}
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

          {/* Middle: Requests Timeline */}
          <div className="bg-white rounded-2xl p-4 shadow border lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Requests Timeline</h2>
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r._id} className="p-3 rounded border">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{r.title}</div>
                      <div className="text-sm text-gray-500">{r.category} • {r.status}</div>
                    </div>
                    {canManage && (
                      <div className="space-x-2">
                        <button className="btn btn-xs" onClick={async () => {
                          const u = await yuvrajUpdateHelpdeskStatus(r._id, "accepted", { status: "accepted", note: "Accepted" });
                          setRequests((prev) => prev.map(x => x._id === r._id ? u : x));
                        }}>Accept</button>
                        <button className="btn btn-xs" onClick={async () => {
                          const u = await yuvrajUpdateHelpdeskStatus(r._id, "processing", { status: "processing", note: "Processing" });
                          setRequests((prev) => prev.map(x => x._id === r._id ? u : x));
                        }}>Process</button>
                        <button className="btn btn-xs" onClick={async () => {
                          const u = await yuvrajUpdateHelpdeskStatus(r._id, "rejected", { status: "rejected", note: "Rejected" });
                          setRequests((prev) => prev.map(x => x._id === r._id ? u : x));
                        }}>Reject</button>
                      </div>
                    )}
                  </div>
                  {r.timeline?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {r.timeline.map((t, i) => (
                        <div key={i}>• {new Date(t.at).toLocaleString()} — {t.status} {t.note ? `(${t.note})` : ''}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


