import HeaderBar from "@/components/HeaderBar";
import Game from "@/components/Game";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <HeaderBar />

      <div className="flex justify-center p-8">
        <div className="w-full max-w-5xl">
          <Game />
        </div>
      </div>
    </div>
  );
}
