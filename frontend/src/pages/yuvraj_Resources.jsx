import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { yuvrajListCourses, yuvrajListCourseItems } from "../services/yuvraj_resources_api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { yuvrajCreateCourse, yuvrajCreateCourseItem, yuvrajDeleteCourseItem, yuvrajDeleteCourse, yuvrajUpdateCourseItem } from "../services/yuvraj_resources_write_api.js";
import YuvrajDoneOverlay from "../components/yuvraj_DoneOverlay.jsx";
import HamburgerMenu from "../components/HamburgerMenu.jsx";

const Tab = ({ active, onClick, children }) => (
  <button
    className={`px-4 py-2 rounded-lg font-medium ${active ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const YouTubeEmbed = ({ url }) => {
  const idMatch = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
  const videoId = idMatch ? idMatch[1] : null;
  if (!videoId) return null;
  return (
    <div className="aspect-video w-full">
      <iframe
        className="w-full h-full rounded-xl border"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

const GoogleSlidesEmbed = ({ url }) => {
  // Accept full share link or embed link
  const embedUrl = url.includes("/embed?") ? url : url.replace("/edit?", "/embed?");
  return (
    <div className="aspect-video w-full">
      <iframe className="w-full h-full rounded-xl border" src={embedUrl} allowFullScreen />
    </div>
  );
};

const GoogleDocsEmbed = ({ url }) => {
  // Convert Google Docs URL to embedded format
  const embedUrl = url.includes("/embed?") ? url : url.replace(/\/edit.*$/, "/preview");
  return (
    <div className="w-full h-96">
      <iframe className="w-full h-full rounded-xl border" src={embedUrl} />
    </div>
  );
};

const GoogleSheetsEmbed = ({ url }) => {
  // Convert Google Sheets URL to embedded format
  const embedUrl = url.includes("/embed?") ? url : url.replace(/\/edit.*$/, "/preview");
  return (
    <div className="w-full h-96">
      <iframe className="w-full h-full rounded-xl border" src={embedUrl} />
    </div>
  );
};

const DocumentViewer = ({ item, showActions = false, onDelete }) => {
  const downloadUrl = (url) => {
    // Convert Google URLs to download format
    if (url.includes('docs.google.com')) {
      if (url.includes('/document/')) {
        return url.replace(/\/edit.*$/, '/export?format=pdf');
      } else if (url.includes('/presentation/')) {
        return url.replace(/\/edit.*$/, '/export/pdf');
      } else if (url.includes('/spreadsheets/')) {
        return url.replace(/\/edit.*$/, '/export?format=xlsx');
      }
    }
    return url;
  };

  const renderContent = () => {
    switch (item.type) {
      case 'youtube':
        return <YouTubeEmbed url={item.url} />;
      case 'slides':
        return <GoogleSlidesEmbed url={item.url} />;
      case 'doc':
        return <GoogleDocsEmbed url={item.url} />;
      case 'sheet':
        return <GoogleSheetsEmbed url={item.url} />;
      case 'pdf':
      case 'link':
      default:
        return (
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center">
            <div className="text-gray-600">
              <div className="text-4xl mb-2">📄</div>
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-500 mt-1">{item.type.toUpperCase()}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderContent()}
      
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-800">{item.title}</h3>
          <div className="text-sm text-gray-500">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <a
            href={downloadUrl(item.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
            title="Download/Open"
          >
            📥 Download
          </a>
          
          {/* Open in New Tab */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost"
            title="Open in new tab"
          >
            🔗 Open
          </a>
          
          {/* Delete Button (only if showActions is true) */}
          {showActions && onDelete && (
            <button
              onClick={() => onDelete(item._id)}
              className="btn btn-sm btn-error"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AddVideoButton = ({ courseId, onAdded, onOverlay }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&#]+)/);
    return match ? match[1] : null;
  };

  const fetchYouTubeTitle = async (videoId) => {
    try {
      // Use YouTube oEmbed API to get title (no API key required)
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title || "YouTube Video";
      }
    } catch (e) {
      console.warn("Failed to fetch YouTube title:", e);
    }
    return "YouTube Video";
  };

  const handleAddVideo = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const videoId = extractVideoId(url);
      let finalTitle = title.trim();
      
      if (!finalTitle && videoId) {
        finalTitle = await fetchYouTubeTitle(videoId);
      }
      
      await yuvrajCreateCourseItem(courseId, { 
        title: finalTitle || "YouTube Video", 
        type: 'youtube', 
        url: url.trim() 
      });
      
      setUrl(""); 
      setTitle(""); 
      onAdded?.();
      onOverlay?.({ show: true, text: 'Video Added', color: 'green' });
    } catch (error) {
      console.error("Failed to add video:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && url.trim()) {
      e.preventDefault();
      handleAddVideo();
    }
  };

  if (!courseId) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title (auto-filled from YouTube)" 
          className="input input-bordered input-sm" 
        />
      </div>
      <div className="flex items-center gap-2">
        <input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Paste YouTube URL and press Enter" 
          className="input input-bordered input-sm flex-1" 
        />
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleAddVideo}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? "Adding..." : "Add Video"}
        </button>
      </div>
      <div className="text-xs text-gray-500">
        🎥 Tip: Paste YouTube URL and press Enter to add quickly
      </div>
    </div>
  );
};

const AddDocumentButton = ({ courseId, onAdded, onOverlay }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("slides");
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-generate title from Google Docs/Slides URL
  const generateTitleFromUrl = async (url) => {
    try {
      // Extract document ID from Google URLs
      const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      const slidesMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/);
      const sheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      
      if (docMatch || slidesMatch || sheetsMatch) {
        const docId = docMatch?.[1] || slidesMatch?.[1] || sheetsMatch?.[1];
        // Try to fetch document title using Google Drive API (oEmbed approach)
        try {
          const oembedUrl = `https://docs.google.com/document/d/${docId}/preview`;
          return `Google ${type.charAt(0).toUpperCase() + type.slice(1)} Document`;
        } catch (e) {
          console.warn('Could not fetch document title:', e);
        }
      }
      
      // Fallback: Extract filename from URL or use domain
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      
      if (filename && filename.includes('.')) {
        return filename.split('.')[0].replace(/[-_]/g, ' ');
      }
      
      return `${urlObj.hostname} Document`;
    } catch (e) {
      return `${type.charAt(0).toUpperCase() + type.slice(1)} Document`;
    }
  };

  const handleAddDocument = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      let finalTitle = title.trim();
      
      // Auto-generate title if not provided
      if (!finalTitle) {
        finalTitle = await generateTitleFromUrl(url.trim());
      }
      
      await yuvrajCreateCourseItem(courseId, { 
        title: finalTitle || `${type.charAt(0).toUpperCase() + type.slice(1)} Document`, 
        type, 
        url: url.trim() 
      });
      setUrl(""); 
      setTitle(""); 
      onAdded?.();
      onOverlay?.({ show: true, text: 'Document Added', color: 'green' });
    } catch (error) {
      console.error("Failed to add document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && url.trim()) {
      e.preventDefault();
      handleAddDocument();
    }
  };

  if (!courseId) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select className="select select-bordered select-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="slides">Google Slides</option>
          <option value="doc">Google Docs</option>
          <option value="sheet">Google Sheets</option>
          <option value="pdf">PDF</option>
          <option value="link">Link</option>
        </select>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title (auto-generated if empty)" 
          className="input input-bordered input-sm" 
        />
      </div>
      <div className="flex items-center gap-2">
        <input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Paste document URL and press Enter" 
          className="input input-bordered input-sm flex-1" 
        />
        <button 
          className="btn btn-primary btn-sm" 
          onClick={handleAddDocument} 
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
      </div>
      <div className="text-xs text-gray-500">
        💡 Tip: Paste Google Docs/Slides/Sheets URL and press Enter to add quickly
      </div>
    </div>
  );
};

const AddPlaylistButton = ({ onAdded, onOverlay }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!name.trim()) return;
    
    setIsLoading(true);
    try {
      await yuvrajCreateCourse({ 
        name: name.trim(), 
        description: description.trim() || "Course playlist" 
      });
      
      setName(""); 
      setDescription(""); 
      setShowForm(false);
      onAdded?.();
      onOverlay?.({ show: true, text: 'Playlist Created', color: 'green' });
    } catch (error) {
      console.error("Failed to create playlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button 
        className="btn btn-primary btn-sm" 
        onClick={() => setShowForm(true)}
      >
        + Create Playlist
      </button>
    );
  }

  return (
    <div className="bg-gray-50 p-3 rounded-lg border">
      <h3 className="font-medium text-gray-800 mb-2">Create New Playlist</h3>
      <div className="space-y-2">
        <input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Playlist name (e.g., Mathematics 101)" 
          className="input input-bordered input-sm w-full" 
        />
        <input 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Description (optional)" 
          className="input input-bordered input-sm w-full" 
        />
        <div className="flex gap-2">
          <button 
            className="btn btn-primary btn-sm" 
            onClick={handleCreatePlaylist}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => { setShowForm(false); setName(""); setDescription(""); }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Yuvraj_Resources() {
  const { isInstitution, isInstructor } = useAuth();
  const canEdit = isInstitution; // Only institutions can edit/delete
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("videos");
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [overlay, setOverlay] = useState({ show: false, text: '', color: 'green' });

  useEffect(() => {
    yuvrajListCourses().then((cs) => {
      setCourses(cs);
      if (cs[0]) setActiveCourse(cs[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!activeCourse) return;
    yuvrajListCourseItems(activeCourse).then(setItems);
    setSelectedVideo(0); // Reset to first video when course changes
  }, [activeCourse]);

  const videos = useMemo(() => items.filter((i) => i.type === 'youtube'), [items]);
  const documents = useMemo(() => items.filter((i) => i.type !== 'youtube'), [items]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {overlay.show && <YuvrajDoneOverlay show text={overlay.text} color={overlay.color} />}
        <div className="flex items-center gap-3 mb-6">
          <HamburgerMenu />
          <img src="/Atsenlogo.png" alt="ATSEN" className="h-10 w-auto" />
          <h1 className="text-2xl font-semibold text-gray-800">Resources</h1>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              {courses.map((c) => (
                <div key={c._id} className="flex items-center gap-1">
                  <button
                    className={`px-3 py-1.5 rounded-full text-sm border ${activeCourse === c._id ? 'bg-sky-600 text-white border-sky-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveCourse(c._id)}
                  >
                    {c.name}
                  </button>
                  {canEdit && activeCourse === c._id && (
                    <button 
                      className="btn btn-xs btn-error ml-1" 
                      onClick={async () => {
                        if (window.confirm("Delete this playlist and all its content?")) {
                          await yuvrajDeleteCourse(c._id);
                          setOverlay({ show: true, text: 'Playlist Deleted', color: 'red' });
                          yuvrajListCourses().then((cs) => {
                            setCourses(cs);
                            setActiveCourse(cs[0]?._id || null);
                          });
                          setTimeout(() => setOverlay({ show: false }), 1200);
                        }
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isInstitution && (
              <AddPlaylistButton 
                onAdded={() => yuvrajListCourses().then((cs) => {
                  setCourses(cs);
                  if (cs[0] && !activeCourse) setActiveCourse(cs[0]._id);
                })} 
                onOverlay={setOverlay} 
              />
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Tab active={tab === 'videos'} onClick={() => setTab('videos')}>Videos</Tab>
            <Tab active={tab === 'documents'} onClick={() => setTab('documents')}>Documents</Tab>
          </div>

          {tab === 'videos' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video List - Left Side */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Video List</h3>
                {isInstitution && courses.length > 0 && (
                  <div className="mb-3">
                    <AddVideoButton courseId={activeCourse} onAdded={() => yuvrajListCourseItems(activeCourse).then(setItems)} onOverlay={setOverlay} />
                  </div>
                )}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {videos.length === 0 && <p className="text-gray-500 text-sm">No videos available.</p>}
                  {videos.map((v, index) => (
                    <div key={v._id} className={`p-3 rounded border cursor-pointer transition-colors ${selectedVideo === index ? 'bg-sky-100 border-sky-300' : 'bg-white hover:bg-gray-50'}`} onClick={() => setSelectedVideo(index)}>
                      <div className="font-medium text-sm text-gray-800 line-clamp-2">{v.title}</div>
                      <div className="text-xs text-gray-500 mt-1">Video {index + 1}</div>
                      {isInstitution && (
                        <button className="btn btn-xs btn-error mt-2" onClick={async (e) => { 
                          e.stopPropagation(); 
                          if (window.confirm('Delete this video?')) {
                            await yuvrajDeleteCourseItem(activeCourse, v._id); 
                            setOverlay({ show: true, text: 'Deleted', color: 'red' }); 
                            yuvrajListCourseItems(activeCourse).then(setItems); 
                            setTimeout(()=>setOverlay({show:false}),1200);
                            setSelectedVideo(0);
                          }
                        }}>Delete</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Player - Right Side */}
              <div className="lg:col-span-2">
                {videos.length > 0 && selectedVideo < videos.length ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">{videos[selectedVideo].title}</h3>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => window.open(videos[selectedVideo].url, '_blank')}
                      >
                        Open in YouTube
                      </button>
                    </div>
                    <YouTubeEmbed url={videos[selectedVideo].url} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Select a video from the playlist to watch</p>
                  </div>
                )}
              </div>
            </div>
                     ) : (
             <div className="space-y-6">
               {/* Add document button for institution */}
               {isInstitution && courses.length > 0 && (
                 <div className="mb-4">
                   <AddDocumentButton courseId={activeCourse} onAdded={() => yuvrajListCourseItems(activeCourse).then(setItems)} onOverlay={setOverlay} />
                 </div>
               )}
               
               {documents.length === 0 && (
                 <div className="text-center py-8">
                   <div className="text-4xl mb-2">📚</div>
                   <p className="text-gray-500">No documents available in this playlist.</p>
                   {isInstitution && (
                     <p className="text-sm text-gray-400 mt-2">Use the form above to add Google Docs, Slides, PDFs, or other documents.</p>
                   )}
                 </div>
               )}
               
               {documents.map((d) => (
                 <div key={d._id} className="bg-white p-4 rounded-lg border shadow-sm">
                   <DocumentViewer 
                     item={d} 
                     showActions={canEdit}
                     onDelete={async (itemId) => {
                       if (window.confirm('Delete this document?')) {
                         await yuvrajDeleteCourseItem(activeCourse, itemId);
                         setOverlay({ show: true, text: 'Document Deleted', color: 'red' });
                         yuvrajListCourseItems(activeCourse).then(setItems);
                         setTimeout(() => setOverlay({ show: false }), 1200);
                       }
                     }}
                   />
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}


