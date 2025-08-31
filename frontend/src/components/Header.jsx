export default function Header() {
  return (
    <header className="text-center mb-10">
      <h1 className="text-6xl font-extrabold tracking-wide bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
        WARdle
      </h1>
      <p className="mt-3 text-lg text-gray-300 italic">
        A fun lineup-building word guessing game
      </p>
    </header>
  );
}
