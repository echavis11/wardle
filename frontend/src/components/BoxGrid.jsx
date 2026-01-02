const BoxGrid = ({ index, player, teamColor, onClick }) => {
  const positions = ["C", "1B", "2B", "SS", "3B", "LF", "CF", "RF", "DH/P"];

  return (
    <div
      onClick={onClick}
      className={`w-64 h-24 rounded-xl flex flex-col justify-center items-center transition
        ${player ? "bg-opacity-90" : "bg-gray-800 border border-gray-600"}`}
      style={player ? { backgroundColor: teamColor } : {}}
    >
      {player ? (
        <>
          <p className="font-bold">{player.name}</p>
          <p className="text-sm">{player.team}</p>
          <p className="text-sm">BA: {player.batting_average.toFixed(3)}</p>
        </>
      ) : (
        <p className="text-gray-400">Empty Slot</p>
      )}

      <span className="absolute bottom-1 right-2 text-xs">
        {positions[index]}
      </span>
    </div>
  );
};
