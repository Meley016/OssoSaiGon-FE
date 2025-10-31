export default function AlertModal({ message, type = "info", onClose }) {
  if (!message) return null;

  const colorMap = {
    success: "text-black",
    error: "text-black",
    warning: "text-black",
    info: "text-black",
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 w-80 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className={`mb-4 font-medium ${colorMap[type] || "text-black"}`}>
          {message}
        </p>
        <button
          className="flex-1 w-full py-2 bg-black text-white hover:bg-[#ffe6e6] hover:text-black  transition  font-medium"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
