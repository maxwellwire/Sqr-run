"use client";

import {
  useEffect,
  useState
} from "react";

interface Leader {
  rank: number;
  username: string;
  distance: number;
  userId: string;
}

interface LeaderboardData {
  season: {
    name: string;
    endDate: string;
  } | null;

  leaders: Leader[];

  mine: Leader | null;
}

export default function Leaderboard() {
  const [
    data,
    setData
  ] = useState<LeaderboardData | null>(
    null
  );

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response =
          await fetch(
            "/api/leaderboard",
            {
              cache: "no-store"
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          setError(
            result.error ||
              "Could not load leaderboard."
          );

          return;
        }

        setData(result);
      } catch {
        setError(
          "Could not load leaderboard."
        );
      }
    }

    load();
  }, []);

  if (error) {
    return (
      <div className="card">
        <h1>Leaderboard</h1>

        <p
          style={{
            color: "#ff8f8f"
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="card">
      <div className="brand">
        🐿️ SQR RUN
      </div>

      <h1>
        {data.season?.name ||
          "LEADERBOARD"}
      </h1>

      {data.season && (
        <p className="muted">
          Longest valid distance
          survived.
        </p>
      )}

      {!data.leaders.length ? (
        <div
          style={{
            padding: "30px 0",
            textAlign: "center"
          }}
        >
          <h2>
            No runs yet
          </h2>

          <p className="muted">
            Be the first player on
            the leaderboard.
          </p>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto"
          }}
        >
          <table className="table">
            <thead>
              <tr>
                <th>
                  Rank
                </th>

                <th>
                  Username
                </th>

                <th>
                  Best Distance
                </th>
              </tr>
            </thead>

            <tbody>
              {data.leaders.map(
                (player) => (
                  <tr
                    key={
                      player.userId
                    }
                  >
                    <td>
                      {player.rank ===
                      1
                        ? "🥇"
                        : player.rank ===
                            2
                          ? "🥈"
                          : player.rank ===
                              3
                            ? "🥉"
                            : `#${player.rank}`}
                    </td>

                    <td>
                      {player.username}
                    </td>

                    <td>
                      {player.distance.toLocaleString()}
                      m
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {data.mine &&
        !data.leaders.some(
          (player) =>
            player.userId ===
            data.mine?.userId
        ) && (
          <div
            className="card"
            style={{
              marginTop: 20
            }}
          >
            <div className="muted">
              YOUR POSITION
            </div>

            <strong>
              #{data.mine.rank}{" "}
              {data.mine.username}
              {" — "}
              {data.mine.distance.toLocaleString()}
              m
            </strong>
          </div>
        )}
    </div>
  );
}