"use client";

import { useState } from "react";

interface DashboardData {
  stats: {
    players: number;
    active: number;
    suspicious: number;
  };

  season: {
    id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;

  top: {
    id: string;
    username: string;
    walletAddress: string;
    bestDistance: number;
  }[];
}

export default function AdminPage() {
  const [secret, setSecret] =
    useState("");

  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function loadDashboard() {
    if (!secret.trim()) {
      setError(
        "Enter the admin secret."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/dashboard?key=${encodeURIComponent(
            secret
          )}`,
          {
            cache: "no-store"
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.error ||
            "Unauthorized."
        );

        setLoading(false);
        return;
      }

      setData(result);
    } catch {
      setError(
        "Could not load the admin dashboard."
      );
    }

    setLoading(false);
  }

  if (!data) {
    return (
      <main className="page center">
        <div
          className="card"
          style={{
            width: "min(500px, 92%)"
          }}
        >
          <div className="brand">
            SQR RUN ADMIN
          </div>

          <h1>Admin Dashboard</h1>

          <p className="muted">
            Authorized administrators only.
          </p>

          <div
            className="stack"
            style={{
              marginTop: 20
            }}
          >
            <input
              className="input"
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={(event) =>
                setSecret(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  loadDashboard();
                }
              }}
            />

            {error && (
              <div
                style={{
                  color: "#ff8f8f",
                  fontWeight: 700
                }}
              >
                {error}
              </div>
            )}

            <button
              className="btn"
              onClick={
                loadDashboard
              }
              disabled={loading}
            >
              {loading
                ? "CHECKING..."
                : "OPEN DASHBOARD"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div
        className="container"
        style={{
          padding: "30px 0"
        }}
      >
        <div className="card">
          <div className="brand">
            SQR RUN ADMIN
          </div>

          <h1>Dashboard</h1>

          <div
            className="grid"
            style={{
              marginTop: 20
            }}
          >
            <div className="card">
              <div className="muted">
                Total Players
              </div>

              <h2>
                {data.stats.players}
              </h2>
            </div>

            <div className="card">
              <div className="muted">
                Active Players
              </div>

              <h2>
                {data.stats.active}
              </h2>
            </div>

            <div className="card">
              <div className="muted">
                Suspicious Runs
              </div>

              <h2>
                {data.stats.suspicious}
              </h2>
            </div>
          </div>

          <section
            style={{
              marginTop: 30
            }}
          >
            <h2>
              Current Season
            </h2>

            {data.season ? (
              <div className="card">
                <h3>
                  {data.season.name}
                </h3>

                <p className="muted">
                  Status:{" "}
                  {data.season.status}
                </p>

                <p className="muted">
                  Starts:{" "}
                  {new Date(
                    data.season.startDate
                  ).toLocaleString()}
                </p>

                <p className="muted">
                  Ends:{" "}
                  {new Date(
                    data.season.endDate
                  ).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="muted">
                No current season.
              </p>
            )}
          </section>

          <section
            style={{
              marginTop: 30
            }}
          >
            <h2>
              Top Players
            </h2>

            <div
              style={{
                overflowX: "auto"
              }}
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      #
                    </th>

                    <th>
                      Username
                    </th>

                    <th>
                      Distance
                    </th>

                    <th>
                      Wallet
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.top.map(
                    (player, index) => (
                      <tr
                        key={
                          player.id
                        }
                      >
                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {player.username}
                        </td>

                        <td>
                          {player.bestDistance.toLocaleString()}
                          m
                        </td>

                        <td
                          style={{
                            fontSize:
                              12,
                            wordBreak:
                              "break-all"
                          }}
                        >
                          {
                            player.walletAddress
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}