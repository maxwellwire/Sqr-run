import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentSeason } from "@/lib/season";
import SqrGame from "@/components/SqrGame";

export default async function GamePage() {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const season =
    await getCurrentSeason();

  if (!season) {
    return (
      <main className="page center">
        <div className="card">
          <h1>No Active Season</h1>

          <p className="muted">
            There is currently no active SQR RUN
            season.
          </p>
        </div>
      </main>
    );
  }

  return (
    <SqrGame
      username={user.username}
      best={user.bestDistance}
      season={season.name}
    />
  );
}