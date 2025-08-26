import { useState, useEffect } from "react";
import { MessageSquare, Loader, Megaphone, MessageCircle } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import CreateForumContent from "./CreateForumContent";
import ForumContentCard from "./ForumContentCard";

const DiscussionForum = ({ roomId }) => {
  const [forumContent, setForumContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatingContent, setAnimatingContent] = useState(new Set());

  const fetchForumContent = async () => {
    try {
      console.log("Fetching forum content for room:", roomId);
      const response = await api.get(`/forum-content/room/${roomId}`);
      console.log("Fetched forum content:", response.data);
      
      // Sort content: pinned first (by pin time), then by creation date
      const sortedContent = response.data.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isPinned && b.isPinned) {
          // If both are pinned, sort by updatedAt (latest pinned first)
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setForumContent(sortedContent);
    } catch (error) {
      console.error("Error fetching forum content:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to fetch forum content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("DiscussionForum useEffect triggered with roomId:", roomId);
    if (roomId) {
      fetchForumContent();
    }
  }, [roomId]);

  const handleAnnouncementCreated = (newAnnouncement) => {
    setForumContent(prev => {
      // Sort content: pinned first (by pin time), then by creation date
      const updatedContent = [...prev, newAnnouncement];
      return updatedContent.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isPinned && b.isPinned) {
          // If both are pinned, sort by updatedAt (latest pinned first)
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
  };

  // Separate announcements and discussions for teachers to see both
  const announcements = forumContent.filter(item => item.contentType === 'announcement');
  const discussions = forumContent.filter(item => item.contentType === 'discussion');

  const handleAnnouncementUpdated = (updatedAnnouncement) => {
    // Add animation tracking for the updated content
    setAnimatingContent(prev => new Set([...prev, updatedAnnouncement._id]));
    
    setForumContent(prev => {
      // Update the content and re-sort
      const updatedContent = prev.map(content => 
        content._id === updatedAnnouncement._id ? updatedAnnouncement : content
      );
      
      // Sort content: pinned first (by pin time), then by creation date
      return updatedContent.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.isPinned && b.isPinned) {
          // If both are pinned, sort by updatedAt (latest pinned first)
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
    
    // Remove animation tracking after animation completes
    setTimeout(() => {
      setAnimatingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(updatedAnnouncement._id);
        return newSet;
      });
    }, 700);
  };

  const handleAnnouncementDeleted = (deletedId) => {
    setForumContent(prev => prev.filter(content => content._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Discussion Forum</h2>
      </div>

      <CreateForumContent 
        roomId={roomId} 
        onAnnouncementCreated={handleAnnouncementCreated}
      />

      {/* Teacher Announcements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Announcements</h3>
        </div>
        
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
            <h4 className="text-md font-medium text-base-content/70 mb-1">
              No announcements yet
            </h4>
            <p className="text-sm text-base-content/50">
              Create your first announcement for this room!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div
                key={announcement._id}
                className={`transition-all duration-700 ease-in-out ${
                  animatingContent.has(announcement._id) 
                    ? 'animate-pulse shadow-xl scale-105' 
                    : ''
                }`}
                style={{
                  transform: `translateY(0px)`,
                  transitionDelay: `${index * 30}ms`,
                  order: index,
                  zIndex: animatingContent.has(announcement._id) ? 10 : 1
                }}
              >
                <ForumContentCard
                  announcement={announcement}
                  onUpdate={handleAnnouncementUpdated}
                  onDelete={handleAnnouncementDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Discussions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-secondary" />
          <h3 className="text-lg font-semibold">Class Discussions</h3>
        </div>
        
        {discussions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
            <h4 className="text-md font-medium text-base-content/70 mb-1">
              No discussions yet
            </h4>
            <p className="text-sm text-base-content/50">
              Students can start discussions here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion, index) => (
              <div
                key={discussion._id}
                className={`transition-all duration-700 ease-in-out ${
                  animatingContent.has(discussion._id) 
                    ? 'animate-pulse shadow-xl scale-105' 
                    : ''
                }`}
                style={{
                  transform: `translateY(0px)`,
                  transitionDelay: `${index * 30}ms`,
                  order: index,
                  zIndex: animatingContent.has(discussion._id) ? 10 : 1
                }}
              >
                <ForumContentCard
                  announcement={discussion}
                  onUpdate={handleAnnouncementUpdated}
                  onDelete={handleAnnouncementDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionForum;
