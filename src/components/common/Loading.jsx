export default function GlobalLoading({ message }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-xl px-10 py-8 flex flex-col items-center shadow-xl">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />

        {/* Text */}
        <p className="text-lg font-medium text-gray-800 text-center">
          {message}
        </p>

        <p className="text-sm text-gray-500 mt-2">
          Vui lòng không đóng trình duyệt
        </p>
      </div>
    </div>
  );
}
