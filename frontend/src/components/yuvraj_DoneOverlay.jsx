import { useEffect, useState } from "react";

export default function YuvrajDoneOverlay({ show = false, text = "Done", color = "green" }) {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 1500);
      return () => clearTimeout(t);
    }
  }, [show]);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl p-6 shadow-2xl border animate-scale-in">
        <div className={`flex items-center gap-3 ${color === 'red' ? 'text-red-600' : color === 'blue' ? 'text-sky-600' : 'text-green-700'}`}>
          <span className="text-2xl">{color === 'red' ? '✖' : '✔'}</span>
          <span className="font-semibold">{text}</span>
        </div>
      </div>
      <style>{`
        .animate-scale-in { transform: scale(0.9); opacity: 0; animation: pop 200ms ease-out forwards; }
        @keyframes pop { to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}


