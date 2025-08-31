import React from "react";
import Image from "next/image";
import { teamData } from "../constants/teamData";

export default function TeamDisplay({ teamName }) {
  const teamInfo = teamData[teamName];
  if (!teamInfo) return null;

  // Normalize team name to match image filename (lowercase, no spaces)
  const normalizedName = teamInfo.name.toLowerCase().replace(/\s+/g, "");

  // Path to image in public folder
  const logoUrl = `/pictures/${normalizedName}.png`;

  return (
    <div className="flex flex-col items-center mt-6">
      <Image
        src={logoUrl}
        alt={`${teamName} logo`}
        width={128}
        height={128}
        className="mb-4 drop-shadow-lg"
      />
      <h1
        className="text-4xl font-extrabold tracking-wide"
        style={{
          color: teamInfo.color || "white",
          textShadow: "0px 0px 12px rgba(0,0,0,0.8)",
        }}
      >
        {teamName}
      </h1>
    </div>
  );
}