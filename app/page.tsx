import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="page">
      <section className="hero">
        <div className="container">
          <div className="brand">
            $SQR
          </div>

          <h1>SQR RUN</h1>

          <p>
            Run. Collect. Survive.
          </p>

          <p className="muted">
            Compete for the longest valid distance.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 30,
              flexWrap: "wrap"
            }}
          >
            <Link
              className="btn"
              href={user ? "/game" : "/register"}
            >
              {user
                ? "PLAY NOW"
                : "CREATE ACCOUNT & PLAY"}
            </Link>

            <Link
              className="btn secondary"
              href="/leaderboard"
            >
              LEADERBOARD
            </Link>
          </div>
        </div>
      </section>

      <section
        className="container"
        style={{ padding: "30px 0" }}
      >
        <div className="grid">
          <div className="card">
            <h2>PLAY</h2>
            <p className="muted">
              Run through the forest, jump obstacles,
              slide under hazards and collect items.
            </p>
          </div>

          <div className="card">
            <h2>COMPETE</h2>
            <p className="muted">
              Your main competitive metric is your
              best distance survived.
            </p>
          </div>

          <div className="card">
            <h2>WIN $SQR</h2>
            <p className="muted">
              Season winners can be rewarded manually
              by the project team.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}