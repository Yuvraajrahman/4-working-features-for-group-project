const YuvrajAnnouncementCard = ({ title, children, announcementType = "general" }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "payment":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "registration":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "event":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "academic":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "urgent":
        return "Urgent";
      case "payment":
        return "Payment Deadline";
      case "registration":
        return "Registration Deadline";
      case "event":
        return "Event";
      case "academic":
        return "Academic";
      default:
        return "General";
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(announcementType)}`}>
            {getTypeLabel(announcementType)}
          </span>
        </div>
        <div className="rounded-xl bg-gray-50 p-5 text-gray-700 border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default YuvrajAnnouncementCard;


