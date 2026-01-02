import React from "react";
import { teamData } from "../constants/teamData"; // adjust path as needed

const BoxGrid = ({ lineup, onSlotClick }) => {
  const positions = ["C", "1B", "2B", "SS", "3B", "LF", "CF", "RF", "DH/P"];

  return (
    <div
      key={index}
      onClick={() => onSlotClick(index)}
      className={`w-64 h-24 rounded-xl flex flex-col justify-center items-center transition transform hover:scale-105 hover:shadow-xl cursor-pointer
        ${player ? "bg-opacity-90" : "bg-gray-800 bg-opacity-50 border border-gray-600 hover:bg-gray-700"}`}
      style={player ? { backgroundColor: teamColor, color: "#fff" } : {}}
    >
      {player ? (
        <>
          <p className="font-bold text-lg">{player.name}</p>
          <p className="text-sm opacity-80">{player.team}</p>
          <p className="text-sm">BA: {player.batting_average.toFixed(3)}</p>
        </>
      ) : (
        <p className="text-gray-400">Empty Slot</p>
      )}

      <span className="absolute bottom-1 right-2 text-xs bg-black bg-opacity-40 px-2 py-0.5 rounded">
        {positions[index]}
      </span>
    </div>

  );
};

export default BoxGrid;
