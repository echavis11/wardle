// components/ShuffleButton.js
export default function ShuffleButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`mt-6 px-8 py-3 !rounded-xl font-bold text-lg tracking-wide shadow-lg transition transform hover:scale-105
        ${disabled
          ? "bg-gray-600 cursor-not-allowed text-gray-300"
          : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:shadow-yellow-500/50"
        }`}
    >
      Shuffle Team
    </button>

  );
}
