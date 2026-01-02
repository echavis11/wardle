// pages/index.js
import Header from "@/components/Header";
import Game from "@/components/Game";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl p-10">
        <Header />
        <Game />
      </div>
    </div>
  );
}
