import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  getAdminStats, 
  getAllInstitutions, 
  deleteInstitution, 
  getAllStudents,
  deleteStudent,
  getAllInstructors,
  deleteInstructor,
  getAllAnnouncements, 
  deleteAnnouncement, 
  getAllPolls, 
  deletePoll,
  getAllHelpdeskRequests,
  deleteHelpdeskRequest 
} from "../../services/admin_api";
import Navbar from "../../components/Navbar";
import { 
  Users, 
  School, 
  MessageSquare, 
  BarChart3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [helpdeskRequests, setHelpdeskRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('institutions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    
    const loadData = async () => {
      try {
        const [statsData, institutionsData, studentsData, instructorsData, announcementsData, pollsData, helpdeskData] = await Promise.all([
          getAdminStats(),
          getAllInstitutions(),
          getAllStudents(),
          getAllInstructors(),
          getAllAnnouncements(),
          getAllPolls(),
          getAllHelpdeskRequests()
        ]);
        
        setStats(statsData);
        setInstitutions(institutionsData);
        setStudents(studentsData);
        setInstructors(instructorsData);
        setAnnouncements(announcementsData);
        setPolls(pollsData);
        setHelpdeskRequests(helpdeskData);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  const handleDeleteInstitution = async (institutionId, institutionName) => {
    if (!confirm(`Are you sure you want to delete "${institutionName}" and all associated data? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteInstitution(institutionId);
      setInstitutions(prev => prev.filter(inst => inst._id !== institutionId));
      toast.success('Institution deleted successfully');
      
      // Refresh stats
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error deleting institution:', error);
      toast.error('Failed to delete institution');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await deleteAnnouncement(announcementId);
      setAnnouncements(prev => prev.filter(ann => ann._id !== announcementId));
      toast.success('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!confirm('Are you sure you want to delete this poll?')) {
      return;
    }

    try {
      await deletePoll(pollId);
      setPolls(prev => prev.filter(poll => poll._id !== pollId));
      toast.success('Poll deleted successfully');
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Failed to delete poll');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to delete student "${studentName}"?`)) {
      return;
    }

    try {
      await deleteStudent(studentId);
      setStudents(prev => prev.filter(student => student._id !== studentId));
      toast.success('Student deleted successfully');
      
      // Refresh stats
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const handleDeleteInstructor = async (instructorId, instructorName) => {
    if (!confirm(`Are you sure you want to delete instructor "${instructorName}"?`)) {
      return;
    }

    try {
      await deleteInstructor(instructorId);
      setInstructors(prev => prev.filter(instructor => instructor._id !== instructorId));
      toast.success('Instructor deleted successfully');
      
      // Refresh stats
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error deleting instructor:', error);
      toast.error('Failed to delete instructor');
    }
  };

  const handleDeleteHelpdeskRequest = async (requestId) => {
    if (!confirm('Are you sure you want to delete this helpdesk request?')) {
      return;
    }

    try {
      await deleteHelpdeskRequest(requestId);
      setHelpdeskRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success('Helpdesk request deleted successfully');
    } catch (error) {
      console.error('Error deleting helpdesk request:', error);
      toast.error('Failed to delete helpdesk request');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name || 'Admin'}</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <StatCard icon={School} title="Institutions" value={stats.totalInstitutions} color="blue" />
            <StatCard icon={Users} title="Students" value={stats.totalStudents} color="green" />
            <StatCard icon={Users} title="Instructors" value={stats.totalInstructors} color="purple" />
            <StatCard icon={MessageSquare} title="Announcements" value={stats.totalAnnouncements} color="yellow" />
            <StatCard icon={BarChart3} title="Polls" value={stats.totalPolls} color="pink" />
            <StatCard icon={HelpCircle} title="Helpdesk" value={stats.totalHelpdeskRequests} color="indigo" />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'institutions', label: 'Institutions', icon: School },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'instructors', label: 'Instructors', icon: Users },
                { id: 'announcements', label: 'Announcements', icon: MessageSquare },
                { id: 'polls', label: 'Polls & Surveys', icon: BarChart3 },
                { id: 'helpdesk', label: 'Helpdesk', icon: HelpCircle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'institutions' && (
              <InstitutionsTab 
                institutions={institutions} 
                onDelete={handleDeleteInstitution}
              />
            )}
            {activeTab === 'students' && (
              <StudentsTab 
                students={students} 
                onDelete={handleDeleteStudent}
              />
            )}
            {activeTab === 'instructors' && (
              <InstructorsTab 
                instructors={instructors} 
                onDelete={handleDeleteInstructor}
              />
            )}
            {activeTab === 'announcements' && (
              <AnnouncementsTab 
                announcements={announcements} 
                onDelete={handleDeleteAnnouncement}
              />
            )}
            {activeTab === 'polls' && (
              <PollsTab 
                polls={polls} 
                onDelete={handleDeletePoll}
              />
            )}
            {activeTab === 'helpdesk' && (
              <HelpdeskTab 
                requests={helpdeskRequests} 
                onDelete={handleDeleteHelpdeskRequest}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="h-8 w-8 opacity-70" />
      </div>
    </div>
  );
}

function InstitutionsTab({ institutions, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Institutions Management</h2>
        <p className="text-sm text-gray-600">{institutions.length} total institutions</p>
      </div>
      
      <div className="space-y-4">
        {institutions.map((institution) => (
          <div key={institution._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{institution.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    institution.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {institution.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium">{institution.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">EIIN</p>
                    <p className="text-sm font-medium">{institution.eiin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Students</p>
                    <p className="text-sm font-medium">{institution.stats?.students || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructors</p>
                    <p className="text-sm font-medium">{institution.stats?.instructors || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Created: {new Date(institution.createdAt).toLocaleDateString()}</span>
                  <span>Announcements: {institution.stats?.announcements || 0}</span>
                  <span>Polls: {institution.stats?.polls || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {/* Pseudo accept/reject buttons (demo only) */}
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors">
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors">
                  <XCircle className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => onDelete(institution._id, institution.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Institution"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {institutions.length === 0 && (
          <div className="text-center py-12">
            <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No institutions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnnouncementsTab({ announcements, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Announcements Management</h2>
        <p className="text-sm text-gray-600">{announcements.length} total announcements</p>
      </div>
      
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    announcement.announcementType === 'urgent' ? 'bg-red-100 text-red-800' :
                    announcement.announcementType === 'event' ? 'bg-green-100 text-green-800' :
                    announcement.announcementType === 'academic' ? 'bg-purple-100 text-purple-800' :
                    announcement.announcementType === 'payment' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {(announcement.announcementType || 'General').charAt(0).toUpperCase() + (announcement.announcementType || 'general').slice(1)}
                  </span>
                  {announcement.pinned && (
                    <span className="text-yellow-600 text-sm">📌 Pinned</span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{announcement.content}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>By: {announcement.author}</span>
                  <span>Institution: {announcement.institutionSlug}</span>
                  <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button
                onClick={() => onDelete(announcement._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
                title="Delete Announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No announcements found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PollsTab({ polls, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Polls & Surveys Management</h2>
        <p className="text-sm text-gray-600">{polls.length} total polls</p>
      </div>
      
      <div className="space-y-4">
        {polls.map((poll) => (
          <div key={poll._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{poll.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    poll.kind === 'poll' ? 'bg-blue-100 text-blue-800' :
                    poll.kind === 'qna' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {poll.kind === 'poll' ? 'Poll' : poll.kind === 'qna' ? 'Q&A' : 'Evaluation'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    poll.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {poll.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {poll.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{poll.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Institution: {poll.institutionSlug}</span>
                  <span>Created: {new Date(poll.createdAt).toLocaleDateString()}</span>
                  <span>Scope: {poll.createdFor}</span>
                  {poll.options && poll.options.length > 0 && (
                    <span>Options: {poll.options.length}</span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => onDelete(poll._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
                title="Delete Poll"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {polls.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No polls found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsTab({ students, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Students Management</h2>
        <p className="text-sm text-gray-600">{students.length} total students</p>
      </div>
      
      <div className="space-y-4">
        {students.map((student) => (
          <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{student.name}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Student
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Student ID</p>
                    <p className="text-sm font-medium">{student.studentId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Institutions</p>
                    <p className="text-sm font-medium">
                      {student.institutions?.map(inst => inst.name).join(', ') || 'None'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                  <span>Enrolled Rooms: {student.room?.length || 0}</span>
                </div>
              </div>
              
              <button
                onClick={() => onDelete(student._id, student.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
                title="Delete Student"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {students.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No students found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InstructorsTab({ instructors, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Instructors Management</h2>
        <p className="text-sm text-gray-600">{instructors.length} total instructors</p>
      </div>
      
      <div className="space-y-4">
        {instructors.map((instructor) => (
          <div key={instructor._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{instructor.name}</h3>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    Instructor
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-sm font-medium">{instructor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructor ID</p>
                    <p className="text-sm font-medium">{instructor.instructorId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Institutions</p>
                    <p className="text-sm font-medium">
                      {instructor.institutions?.map(inst => inst.name).join(', ') || 'None'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Joined: {new Date(instructor.createdAt).toLocaleDateString()}</span>
                  <span>Teaching Rooms: {instructor.rooms?.length || 0}</span>
                </div>
              </div>
              
              <button
                onClick={() => onDelete(instructor._id, instructor.name)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
                title="Delete Instructor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {instructors.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No instructors found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HelpdeskTab({ requests, onDelete }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Helpdesk Requests Management</h2>
        <p className="text-sm text-gray-600">{requests.length} total requests</p>
      </div>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium text-gray-800">{request.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    request.category === 'consultation' ? 'bg-blue-100 text-blue-800' :
                    request.category === 'administration' ? 'bg-purple-100 text-purple-800' :
                    request.category === 'complaint' ? 'bg-red-100 text-red-800' :
                    request.category === 'technical' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.category}
                  </span>
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
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>By: {request.createdBy?.name || 'Unknown'}</span>
                  <span>Email: {request.createdBy?.email || 'N/A'}</span>
                  <span>Institution: {request.institutionSlug || 'N/A'}</span>
                  <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                  <span>Assigned to: {request.assigneeType}</span>
                </div>
              </div>
              
              <button
                onClick={() => onDelete(request._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ml-4"
                title="Delete Request"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {requests.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No helpdesk requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
