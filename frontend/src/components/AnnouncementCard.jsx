/*
  Card to render a single announcement. Shows title, date, and content.
*/
const AnnouncementCard = ({ announcement, highlighted = false }) => {
  const { title, content, createdAt, author, pinned } = announcement;

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${highlighted || pinned ? "border-sky-300" : "border-gray-200"} hover:shadow-md transition-shadow`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 leading-snug">{title}</h3>
          {(highlighted || pinned) && <div className="bg-sky-500 text-white px-2 py-1 rounded text-xs font-medium">Highlighted</div>}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(createdAt).toLocaleString()} {author ? `• ${author}` : ""}
        </p>
        <p className="mt-3 text-gray-700">{content}</p>
      </div>
    </div>
  );
};

export default AnnouncementCard;


