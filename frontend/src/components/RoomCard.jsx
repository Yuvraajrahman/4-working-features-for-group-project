import { PenSquareIcon, Trash2Icon } from "lucide-react";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";

const RoomCard = ({ room, setRooms }) => {
  const handleDelete = async (e, id) => {
    e.preventDefault(); // get rid of the navigation behaviour

    if (!window.confirm("Are you sure you want to delete this room?")) return;

    try {
      await api.delete(`/rooms/${id}`);
      setRooms((prev) => prev.filter((room) => room._id !== id)); // get rid of the deleted one
      toast.success("Room deleted successfully");
    } catch (error) {
      console.log("Error in handleDelete", error);
      toast.error("Failed to delete room");
    }
  };
  return (
    <Link
      to={`/teacher/room/${room._id}/forum`}
      className="bg-white hover:bg-sky-50 hover:shadow-lg transition-all duration-200 rounded-lg border border-gray-200 hover:border-sky-300 group"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-sky-700 mb-2">{room.room_name}</h3>
        <p className="text-gray-600 line-clamp-3 mb-4">{room.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500">
            {formatDate(new Date(room.createdAt))}
          </span>
          <div className="flex items-center gap-2">
            <PenSquareIcon className="h-4 w-4 text-sky-500" />
            <button
              className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-600 transition-colors"
              onClick={(e) => handleDelete(e, room._id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
