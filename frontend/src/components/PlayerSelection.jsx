// components/PlayerSelection.js
import React from 'react';

const PlayerSelection = ({ players, onPlayerSelect, selectedPlayerId }) => {
  if (!players || players.length === 0) {
    return (
      <div className="text-white text-lg mt-4">No players available for this team or still loading...</div>
    );
  }

  return (
    <div className="mt-8 p-4 bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl">
      <h3 className="text-white text-2xl font-semibold mb-4 text-center">Select a Player</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar">
        {players.map((player) => (
          <div
            key={player.id}
            className={`p-3 border rounded-lg cursor-pointer transition duration-200
              ${selectedPlayerId === player.id ? 'bg-blue-600 border-blue-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}
              ${selectedPlayerId === player.id ? 'text-white' : 'text-gray-200'}`
            }
            onClick={() => onPlayerSelect(player)}
          >
            <p className="font-semibold text-lg">{player.name}</p>
            <p className="text-sm">Team: {player.team}</p>
            <p className="text-sm">Position: {player.position}</p>
            <p className="text-sm">BA: {player.batting_average.toFixed(3)}</p>
          </div>
        ))}
      </div>
      {/* Basic styling for custom-scrollbar (you might put this in styles/globals.css) */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #777;
        }
      `}</style>
    </div>
  );
};

export default PlayerSelection;