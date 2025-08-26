import { useState, useEffect } from "react";
import { MessageSquare, Loader, Megaphone, MessageCircle } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import ForumContentCard from "./ForumContentCard";
import CreateDiscussion from "./CreateDiscussion";

const StudentDiscussionForum = ({ roomId }) => {
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
    console.log("StudentDiscussionForum useEffect triggered with roomId:", roomId);
    if (roomId) {
      fetchForumContent();
    }
  }, [roomId]);

  const handleContentUpdated = (updatedContent) => {
    // Add animation tracking for the updated content
    setAnimatingContent(prev => new Set([...prev, updatedContent._id]));
    
    setForumContent(prev => {
      // Update the content and re-sort
      const updatedContentList = prev.map(content => 
        content._id === updatedContent._id ? updatedContent : content
      );
      
      // Sort content: pinned first (by pin time), then by creation date
      return updatedContentList.sort((a, b) => {
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
        newSet.delete(updatedContent._id);
        return newSet;
      });
    }, 700);
  };

  const handleContentDeleted = (deletedId) => {
    setForumContent(prev => prev.filter(content => content._id !== deletedId));
  };

  const handleDiscussionCreated = (newDiscussion) => {
    setForumContent(prev => {
      // Sort content: pinned first (by pin time), then by creation date
      const updatedContent = [...prev, newDiscussion];
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

  // Separate announcements and discussions
  const announcements = forumContent.filter(item => item.contentType === 'announcement');
  const discussions = forumContent.filter(item => item.contentType === 'discussion');

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
              Check back later for announcements from your instructor!
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
                  onUpdate={handleContentUpdated}
                  onDelete={handleContentDeleted}
                  isStudent={true}
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
        
        <CreateDiscussion 
          roomId={roomId} 
          onDiscussionCreated={handleDiscussionCreated}
        />

        {discussions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-10 w-10 text-base-content/30 mx-auto mb-3" />
            <h4 className="text-md font-medium text-base-content/70 mb-1">
              No discussions yet
            </h4>
            <p className="text-sm text-base-content/50">
              Be the first to start a discussion!
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
                  onUpdate={handleContentUpdated}
                  onDelete={handleContentDeleted}
                  isStudent={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDiscussionForum;
