import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { yuvrajListPolls, yuvrajGetPoll, yuvrajVotePoll, yuvrajCreatePoll } from "../services/yuvraj_polls_api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import HamburgerMenu from "../components/HamburgerMenu.jsx";
import YuvrajDoneOverlay from "../components/yuvraj_DoneOverlay.jsx";
import { yuvrajListInstructors } from "../services/yuvraj_instructors_api.js";

export default function Yuvraj_Polls() {
  const { user, isInstitution, isStudent, isInstructor } = useAuth();
  const [polls, setPolls] = useState([]);
  const [active, setActive] = useState(null);
  const [detail, setDetail] = useState(null);
  const [create, setCreate] = useState({ title: "", description: "", kind: "poll", options: "", targetInstructorId: "", createdFor: isInstitution ? "institution" : "room", targetRoomId: "" });
  const [rooms, setRooms] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [studentTextAnswer, setStudentTextAnswer] = useState("");
  const [showQnaReport, setShowQnaReport] = useState(false);
  const [showEvaluationReport, setShowEvaluationReport] = useState(false);
  const [satisfactionLevel, setSatisfactionLevel] = useState(5);
  const [contentDeliveryRating, setContentDeliveryRating] = useState(5);
  const [evaluationRecommendations, setEvaluationRecommendations] = useState("");
  const [targetInstructorName, setTargetInstructorName] = useState("");
  const [done, setDone] = useState(false);
  const [createOverlay, setCreateOverlay] = useState(false);

  useEffect(() => {
    const institutionSlug = user?.slug || null;
    yuvrajListPolls(institutionSlug).then(setPolls);
  }, [user]);

  useEffect(() => {
    async function loadRoomsAndInstructors() {
      try {
        if (isInstitution && user?.slug) {
          // Load rooms
          const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/institutions/${encodeURIComponent(user.slug)}/rooms`);
          const data = await r.json();
          setRooms(Array.isArray(data) ? data : (data.rooms || []));
          
          // Load instructors from the same institution
          const institutionInstructors = await yuvrajListInstructors(user.slug);
          setInstructors(institutionInstructors);
        } else if (isInstructor && user?.id) {
          // Load rooms assigned to this instructor
          const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/instructors/${user.id}/rooms`);
          if (r.ok) {
            const data = await r.json();
            setRooms(Array.isArray(data) ? data : []);
          }
          
          // Load instructors from the same institution for instructors too
          if (user?.slug) {
            const institutionInstructors = await yuvrajListInstructors(user.slug);
            setInstructors(institutionInstructors);
          }
        }
      } catch (_) {}
    }
    loadRoomsAndInstructors();
  }, [isInstitution, isInstructor, user?.slug, user?.id]);

  useEffect(() => {
    if (!active) return setDetail(null);
    yuvrajGetPoll(active).then(setDetail);
  }, [active]);

  const handleVote = async (optionId, textAnswer) => {
    const studentId = user?.id || user?._id || "demo-student";
    const studentName = user?.name || "Student";
    const payload = { optionId, textAnswer, studentId, studentName };
    if (detail?.poll?.kind === 'evaluation') {
      payload.satisfactionLevel = satisfactionLevel;
      payload.contentDeliveryRating = contentDeliveryRating;
      payload.recommendations = evaluationRecommendations;
      payload.targetInstructorId = detail.poll.targetInstructorId;
    }
    await yuvrajVotePoll(active, payload);
    const refreshed = await yuvrajGetPoll(active);
    setDetail(refreshed);
    setDone(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const options = create.kind === 'poll' ? create.options.split("\n").map((line, idx) => ({ id: `${idx+1}`, label: line.trim() })).filter(o => o.label) : [];
    const payload = { 
      title: create.title, 
      description: create.description, 
      kind: create.kind, 
      options,
      institutionSlug: user?.slug,
      createdBy: user?.id
    };
    if (create.kind === 'evaluation' && create.targetInstructorId) {
      payload.targetInstructorId = create.targetInstructorId;
    }
    if (create.createdFor === 'room' && create.targetRoomId) {
      payload.createdFor = 'room';
      payload.targetRoomId = create.targetRoomId;
    } else {
      payload.createdFor = 'institution';
    }
    try {
      const p = await yuvrajCreatePoll(payload);
      // Refresh the entire polls list to ensure synchronization
      const institutionSlug = user?.slug || null;
      const updatedPolls = await yuvrajListPolls(institutionSlug);
      setPolls(updatedPolls);
      
      setCreate({ title: "", description: "", kind: "poll", options: "", targetInstructorId: "", createdFor: isInstitution ? "institution" : "room", targetRoomId: "" });
      setCreateOverlay(true);
      setTimeout(() => setCreateOverlay(false), 1200);
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const myStudentId = user?.id || user?._id || "demo-student";
  const responded = useMemo(() => {
    if (!isStudent || !detail) return false;
    return detail.responses?.some((r) => String(r.studentId) === String(myStudentId) || String(r.studentId?._id) === String(myStudentId));
  }, [detail, isStudent, myStudentId]);
  const respondedAt = useMemo(() => {
    if (!detail) return null;
    const r = detail.responses?.find((x) => String(x.studentId) === String(myStudentId) || String(x.studentId?._id) === String(myStudentId));
    return r?.createdAt ? new Date(r.createdAt) : null;
  }, [detail, myStudentId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <YuvrajDoneOverlay show={done} text="Submitted successfully" />
      <YuvrajDoneOverlay show={createOverlay} text="Poll created successfully" color="green" />
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <HamburgerMenu />
          <h1 className="text-2xl font-semibold text-gray-800">Polls & Surveys</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-4 shadow border">
            <h2 className="text-lg font-semibold mb-3">Polls</h2>
            <div className="space-y-2">
              {polls.map((p) => (
                <button key={p._id} onClick={() => setActive(p._id)} className={`w-full text-left p-3 rounded border ${active===p._id ? 'bg-sky-50 border-sky-200' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-800">{p.title}</div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${p.kind==='poll' ? 'bg-blue-50 text-blue-700 border-blue-200' : p.kind==='qna' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{p.kind === 'poll' ? 'Poll' : p.kind === 'qna' ? 'Q&A' : 'Evaluation'}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        p.createdFor === 'room' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {p.createdFor === 'room' ? '🏫 Room' : '🌐 Global'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                </button>
              ))}
              {polls.length === 0 && <p className="text-gray-500">No polls yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow border lg:col-span-2">
            {!detail ? (
              <p className="text-gray-500">Select a poll to view details.</p>
            ) : (
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{detail.poll.title}</h3>
                <p className="text-gray-600 mb-3">{detail.poll.description}</p>
                {detail.poll.kind === 'poll' && (
                  <div className="space-y-2">
                    {isStudent ? (
                      <div className="space-y-3">
                        {responded ? (
                          <div className="p-4 rounded border bg-green-50 text-green-700">Responded</div>
                        ) : (
                          <>
                            {detail.poll.options.map((o) => (
                              <label key={o.id} className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50">
                                <input type="radio" name="pollOption" checked={selectedOption === o.id} onChange={() => setSelectedOption(o.id)} />
                                <span className="font-medium text-gray-800">{o.label}</span>
                              </label>
                            ))}
                            <button className="btn btn-primary" disabled={!selectedOption} onClick={() => handleVote(selectedOption)}>
                              Submit
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        {detail.poll.options.map((o) => {
                          const votes = detail.responses.filter(r => r.optionId === o.id).length;
                          const total = Math.max(detail.responses.length, 1);
                          const pct = Math.round((votes / total) * 100);
                          return (
                            <div key={o.id} className="p-3 border rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium">{o.label}</div>
                                <div className="text-sm text-gray-600">{votes} votes ({pct}%)</div>
                              </div>
                              <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
                                <div className="bg-sky-500 h-2" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
                {detail.poll.kind === 'qna' && (
                  <div className="space-y-2">
                    {isStudent && (
                      <div className="p-3 border rounded">
                        {responded ? (
                          <div className="p-4 rounded border bg-green-50 text-green-700">Your feedback has been received{respondedAt ? ` • ${respondedAt.toLocaleString()}` : ''}</div>
                        ) : (
                          <>
                            <textarea className="textarea textarea-bordered w-full" rows={3} placeholder="Your answer..." value={studentTextAnswer} onChange={(e) => setStudentTextAnswer(e.target.value)} />
                            <button className="btn btn-primary mt-2" disabled={!studentTextAnswer.trim()} onClick={() => handleVote(undefined, studentTextAnswer)}>Submit</button>
                          </>
                        )}
                      </div>
                    )}
                    {(isInstructor || isInstitution) && (
                      <div className="space-y-2">
                        <button className="btn btn-sm" onClick={() => setShowQnaReport(!showQnaReport)}>{showQnaReport ? 'Hide Report' : 'Show Report'}</button>
                        {showQnaReport && detail.responses.map((r) => (
                          <div key={r._id} className="p-2 border rounded text-sm text-gray-700">
                            <div className="font-medium">{r.studentName || 'Student'} <span className="text-xs text-gray-500">• {new Date(r.createdAt).toLocaleString()}</span></div>
                            <div className="mt-1">{r.textAnswer || "(no answer)"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {detail.poll.kind === 'evaluation' && (
                  <div className="space-y-2">
                    {isStudent && (
                      <div className="p-3 border rounded">
                        {responded ? (
                          <div className="p-4 rounded border bg-green-50 text-green-700">Responded{respondedAt ? ` • ${respondedAt.toLocaleString()}` : ''}</div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">How satisfied are you with {detail.poll.targetInstructorName || 'your instructor'}? (1-10)</label>
                              <div className="flex items-center gap-3">
                                <input type="range" min="1" max="10" value={satisfactionLevel} onChange={(e) => setSatisfactionLevel(parseInt(e.target.value))} className="flex-1" />
                                <span className="w-8 text-center font-semibold text-blue-600">{satisfactionLevel}</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Were they able to deliver the study contents properly? (1-10)</label>
                              <div className="flex items-center gap-3">
                                <input type="range" min="1" max="10" value={contentDeliveryRating} onChange={(e) => setContentDeliveryRating(parseInt(e.target.value))} className="flex-1" />
                                <span className="w-8 text-center font-semibold text-blue-600">{contentDeliveryRating}</span>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Do you have any recommendation or complaint?</label>
                              <textarea className="textarea textarea-bordered w-full" rows={3} value={evaluationRecommendations} onChange={(e) => setEvaluationRecommendations(e.target.value)} />
                            </div>
                            <button className="btn btn-primary" onClick={() => handleVote(undefined, undefined)}>Submit</button>
                          </div>
                        )}
                      </div>
                    )}
                    {isInstitution && (
                      <div className="space-y-2">
                        <button className="btn btn-sm" onClick={() => setShowEvaluationReport(!showEvaluationReport)}>{showEvaluationReport ? 'Hide Report' : 'Show Report'}</button>
                        {showEvaluationReport && detail.responses.map((r) => (
                          <div key={r._id} className="p-3 border rounded text-sm text-gray-700 bg-gray-50">
                            <div className="font-medium text-blue-600">{r.studentName || 'Student'}</div>
                            <div className="text-xs text-gray-500 mb-2">Submitted: {new Date(r.createdAt).toLocaleString()}</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Satisfaction: <span className="font-medium text-green-600">{r.satisfactionLevel ?? '-'} / 10</span></div>
                              <div>Content Delivery: <span className="font-medium text-blue-600">{r.contentDeliveryRating ?? '-'} / 10</span></div>
                            </div>
                            {r.recommendations && (
                              <div className="mt-2 p-2 bg-white rounded border">
                                <div className="text-xs text-gray-500 mb-1">Recommendations/Complaints:</div>
                                <div>{r.recommendations}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {(isInstitution || isInstructor) && (
          <div className="bg-white rounded-2xl p-4 shadow border mt-6">
            <h2 className="text-lg font-semibold mb-3">Create Poll</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Type:</label>
                <select className="select select-bordered" value={create.kind} onChange={(e) => setCreate({ ...create, kind: e.target.value })}>
                  <option value="poll">Poll</option>
                  <option value="qna">Q&A</option>
                  {isInstitution && <option value="evaluation">Evaluation</option>}
                </select>
              </div>
              <input className="input input-bordered w-full" placeholder="Title" value={create.title} onChange={(e) => setCreate({ ...create, title: e.target.value })} />
              <textarea className="textarea textarea-bordered w-full" placeholder="Description" rows={2} value={create.description} onChange={(e) => setCreate({ ...create, description: e.target.value })} />
              {create.kind === 'poll' && (
                <textarea className="textarea textarea-bordered w-full" placeholder="One option per line" rows={4} value={create.options} onChange={(e) => setCreate({ ...create, options: e.target.value })} />
              )}
              {create.kind === 'evaluation' && isInstitution && (
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Select Instructor for Evaluation</label>
                  <select 
                    className="select select-bordered w-full" 
                    value={create.targetInstructorId} 
                    onChange={(e) => {
                      const selectedInstructor = instructors.find(i => i._id === e.target.value);
                      setCreate({ 
                        ...create, 
                        targetInstructorId: e.target.value 
                      });
                      setTargetInstructorName(selectedInstructor?.name || '');
                    }}
                  >
                    <option value="">Choose an instructor to evaluate...</option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {instructor.name} ({instructor.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-700">Visibility</label>
                  <select className="select select-bordered w-full" value={create.createdFor} onChange={(e) => setCreate({ ...create, createdFor: e.target.value })}>
                    {isInstitution && <option value="institution">Global (institution)</option>}
                    <option value="room">Specific room</option>
                  </select>
                </div>
                {create.createdFor === 'room' && (
                  <div>
                    <label className="text-sm text-gray-700">Room</label>
                    <select className="select select-bordered w-full" value={create.targetRoomId} onChange={(e) => setCreate({ ...create, targetRoomId: e.target.value })}>
                      <option value="">Select room</option>
                      {rooms.map((r) => (
                        <option key={r._id || r.id} value={r._id || r.id}>{r.room_name || r.name || r.title || 'Room'}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary">Create</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


