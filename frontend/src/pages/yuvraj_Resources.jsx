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

  if (!courseId) return null;
  return (
    <div className="flex items-center gap-2">
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Title (auto-filled from YouTube)" 
        className="input input-bordered" 
      />
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)} 
        placeholder="YouTube link" 
        className="input input-bordered flex-1" 
      />
      <button 
        className="btn btn-sm" 
        onClick={handleAddVideo}
        disabled={isLoading || !url.trim()}
      >
        {isLoading ? "Adding..." : "Add YouTube Video"}
      </button>
    </div>
  );
};

const AddDocumentButton = ({ courseId, onAdded, onOverlay }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("slides");
  
  const handleAddDocument = async () => {
    if (!url.trim()) return;
    
    try {
      await yuvrajCreateCourseItem(courseId, { 
        title: title.trim() || type.toUpperCase(), 
        type, 
        url: url.trim() 
      });
      setUrl(""); 
      setTitle(""); 
      onAdded?.();
      onOverlay?.({ show: true, text: 'Document Added', color: 'green' });
    } catch (error) {
      console.error("Failed to add document:", error);
    }
  };

  if (!courseId) return null;
  return (
    <div className="flex items-center gap-2">
      <select className="select select-bordered" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="slides">Slides</option>
        <option value="pdf">PDF</option>
        <option value="doc">DOC</option>
        <option value="sheet">Sheet</option>
        <option value="text">Text</option>
        <option value="link">Link</option>
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="input input-bordered" />
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" className="input input-bordered flex-1" />
      <button className="btn btn-sm" onClick={handleAddDocument} disabled={!url.trim()}>
        Add Document
      </button>
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
  const { isInstitution } = useAuth();
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
                  {isInstitution && activeCourse === c._id && (
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
            <div className="space-y-3">
              {/* Add document button for institution */}
              {isInstitution && courses.length > 0 && (
                <div className="mb-2">
                  <AddDocumentButton courseId={activeCourse} onAdded={() => yuvrajListCourseItems(activeCourse).then(setItems)} onOverlay={setOverlay} />
                </div>
              )}
              {documents.length === 0 && <p className="text-gray-500">No documents available.</p>}
              {documents.map((d) => (
                <div key={d._id} className="p-3 rounded border hover:bg-gray-50">
                  <a href={d.url} target="_blank" rel="noreferrer">
                    <div className="font-medium text-gray-800">{d.title}</div>
                    <div className="text-sm text-gray-500">{d.type.toUpperCase()}</div>
                  </a>
                  {isInstitution && (
                    <div className="mt-2 flex gap-2">
                      <button className="btn btn-xs" onClick={async () => { await yuvrajDeleteCourseItem(activeCourse, d._id); setOverlay({ show: true, text: 'Deleted', color: 'red' }); yuvrajListCourseItems(activeCourse).then(setItems); setTimeout(()=>setOverlay({show:false}),1200); }}>Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


