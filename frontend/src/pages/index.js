import HeaderBar from "@/components/HeaderBar";
import Game from "@/components/Game";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* FULL-WIDTH HEADER */}
      <HeaderBar />

      {/* CENTERED GAME */}
      <div className="flex justify-center p-8">
        <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
          <Game />
        </div>
      </div>
    </div>
  );
}
