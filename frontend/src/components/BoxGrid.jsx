// components/BoxGrid.jsx
const BoxGrid = ({
  index,
  player,
  teamColor,
  label,
  isBest,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: player ? teamColor : "#374151",
      }}
      className={`relative w-36 h-24 !rounded-xl text-white border border-white
        flex flex-col items-center justify-center transition
        ${player ? "opacity-90 cursor-not-allowed" : "hover:scale-105"}
      `}
    >
      <span className="font-semibold">{label}</span>

      <span className="flex items-center gap-1">
        {player && isBest && <span className="text-yellow-400">⭐</span>}
        <span>{player ? player.name : "Empty Slot"}</span>
        {player && isBest && <span className="text-yellow-400">⭐</span>}
      </span>

      {player && (
        <span className="text-yellow-400 text-sm">
          {player.batting_average.toFixed(3)}
        </span>
      )}
    </button>
  );
};

export default BoxGrid;
