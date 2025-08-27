import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import RateLimitedUi from "../../components/RateLimitedUi";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router";
import { BookOpen, Users, Calendar, CheckCircle, MessageCircle, HelpCircle, MessageSquare } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { yuvrajListPolls } from "../../services/yuvraj_polls_api";
import { yuvrajListHelpdeskRequests } from "../../services/yuvraj_helpdesk_api";
import { yuvrajListAnnouncements } from "../../services/yuvraj_announcements_api";
const S_Dashboard = () => {
  const { user } = useAuth();
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState([]);
  const [helpdeskRequests, setHelpdeskRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!user?.id) return;
      
      try {
        const res = await api.get(`/students/${user.id}/rooms`);
        console.log(res.data);
        setRooms(res.data);
        setIsRateLimited(false);
      } catch (error) {
        console.error("Error fetching rooms");
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Failed to load rooms");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user]);

  useEffect(() => {
    const fetchResponseHistory = async () => {
      if (!user?.id || !user?.slug) return;
      
      try {
        // Fetch polls with institution filtering
        const pollsData = await yuvrajListPolls(user.slug);
        setPolls(pollsData);
        
        // Fetch helpdesk requests with institution filtering
        const helpdeskData = await yuvrajListHelpdeskRequests(user.slug);
        setHelpdeskRequests(helpdeskData);
        
        // Fetch announcements with institution filtering  
        const announcementsData = await yuvrajListAnnouncements(10, user.slug);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error("Error fetching response history:", error);
      }
    };

    fetchResponseHistory();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Filter student's own helpdesk requests
  const myHelpdeskRequests = helpdeskRequests.filter(req => 
    String(req.createdBy) === String(user?.id)
  ).slice(0, 5); // Show latest 5

  // Get recent polls for display (limit to 5)
  const recentPolls = polls.slice(0, 5);
  
  // Get recent announcements for display (limit to 5)
  const recentAnnouncements = announcements.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {isRateLimited && <RateLimitedUi />}

      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {user?.name || 'Student'}
          </h1>
          <p className="text-gray-600">Here are your enrolled courses</p>
        </div>

        {loading && (
          <div className="text-center text-sky-600 py-10">Loading your enrolled courses...</div>
        )}

        {!isRateLimited && (
          <>
            {rooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Link
                    key={room._id}
                    to={`/student/room/${room._id}/forum`}
                    className="bg-white hover:bg-sky-50 hover:shadow-lg transition-all duration-200 rounded-lg border border-gray-200 hover:border-sky-300 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-sky-700">{room.room_name}</h3>
                        <BookOpen className="h-5 w-5 text-sky-500 group-hover:text-sky-600" />
                      </div>
                      <p className="text-gray-600 line-clamp-3 mb-4">{room.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(room.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Enrolled</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No enrolled courses yet
                </h3>
                <p className="text-gray-500 mb-6">
                  You haven't been enrolled in any courses yet. Contact your instructor to get started.
                </p>
              </div>
            )}

            {/* Response History Sections */}
            {(recentPolls.length > 0 || myHelpdeskRequests.length > 0 || recentAnnouncements.length > 0) && (
              <>
                <div className="mt-12 mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Activity & Updates</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Polls & Surveys Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Recent Polls & Surveys</h3>
                    </div>
                    
                    {recentPolls.length > 0 ? (
                      <div className="space-y-3">
                        {recentPolls.map((poll) => (
                          <div key={poll._id} className="p-3 rounded border border-gray-100 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 text-sm">{poll.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {poll.kind === 'poll' ? 'Poll' : poll.kind === 'qna' ? 'Q&A' : 'Evaluation'} • {formatDate(poll.createdAt)}
                                </div>
                              </div>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                        ))}
                        <Link 
                          to="/yuvraj/polls"
                          className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4"
                        >
                          View All Polls →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No polls available yet</p>
                    )}
                  </div>

                  {/* Helpdesk Requests Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <HelpCircle className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Helpdesk Requests</h3>
                    </div>
                    
                    {myHelpdeskRequests.length > 0 ? (
                      <div className="space-y-3">
                        {myHelpdeskRequests.map((request) => (
                          <div key={request._id} className="p-3 rounded border border-gray-100 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 text-sm">{request.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {request.category} • {formatDate(request.createdAt)}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                request.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                request.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.status || 'Pending'}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Link 
                          to="/yuvraj/helpdesk"
                          className="block text-center text-purple-600 hover:text-purple-700 text-sm font-medium mt-4"
                        >
                          View All Requests →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No helpdesk requests sent yet</p>
                    )}
                  </div>

                  {/* Institution Announcements Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Recent Announcements</h3>
                    </div>
                    
                    {recentAnnouncements.length > 0 ? (
                      <div className="space-y-3">
                        {recentAnnouncements.map((ann) => (
                          <div key={ann._id || ann.id} className="p-3 rounded border border-gray-100 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 text-sm">{ann.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {ann.announcementType || 'General'} • {formatDate(ann.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Link 
                          to="/yuvraj/announcements"
                          className="block text-center text-green-600 hover:text-green-700 text-sm font-medium mt-4"
                        >
                          View All Announcements →
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No announcements available yet</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default S_Dashboard;
