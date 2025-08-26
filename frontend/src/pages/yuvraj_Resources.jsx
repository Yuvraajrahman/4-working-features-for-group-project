import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { yuvrajListCourses, yuvrajListCourseItems } from "../services/yuvraj_resources_api.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { yuvrajCreateCourseItem, yuvrajDeleteCourseItem, yuvrajUpdateCourseItem } from "../services/yuvraj_resources_write_api.js";
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

export default function Yuvraj_Resources() {
  const { isInstitution } = useAuth();
  const [courses, setCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("videos");
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {courses.map((c) => (
              <button
                key={c._id}
                className={`px-3 py-1.5 rounded-full text-sm border ${activeCourse === c._id ? 'bg-sky-600 text-white border-sky-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => setActiveCourse(c._id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Tab active={tab === 'videos'} onClick={() => setTab('videos')}>Videos</Tab>
            <Tab active={tab === 'documents'} onClick={() => setTab('documents')}>Documents</Tab>
          </div>

          {tab === 'videos' ? (
            <div className="space-y-4">
              {/* Add video button for institution */}
              {isInstitution && courses.length > 0 && (
                <div className="mb-2">
                  <AddVideoButton courseId={activeCourse} onAdded={() => yuvrajListCourseItems(activeCourse).then(setItems)} onOverlay={setOverlay} />
                </div>
              )}
              {videos.length === 0 && <p className="text-gray-500">No videos available.</p>}
              {videos.map((v) => {
                const idMatch = v.url?.match(/[?&]v=([^&#]+)/) || v.url?.match(/youtu\.be\/([^?&#]+)/);
                const videoId = idMatch ? idMatch[1] : null;
                const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
                return (
                  <div key={v._id} className="space-y-2">
                    <div className="font-medium text-gray-800">{v.title}</div>
                    {thumb && <img src={thumb} alt="thumbnail" className="w-full max-w-xl rounded border" />}
                    <YouTubeEmbed url={v.url} />
                    {isInstitution && (
                      <div className="flex gap-2">
                        <button className="btn btn-xs" onClick={async () => { await yuvrajDeleteCourseItem(activeCourse, v._id); setOverlay({ show: true, text: 'Deleted', color: 'red' }); yuvrajListCourseItems(activeCourse).then(setItems); setTimeout(()=>setOverlay({show:false}),1200); }}>Delete</button>
                      </div>
                    )}
                  </div>
                );
              })}
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


