import Leaderboard from "@/components/Leaderboard";

export default function LeaderboardPage() {
  return (
    <main className="page">
      <div
        className="container"
        style={{
          padding: "30px 0"
        }}
      >
        <Leaderboard />
      </div>
    </main>
  );
}