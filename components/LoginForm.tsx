"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            pin
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Invalid username or PIN."
        );
        setLoading(false);
        return;
      }

      router.push("/game");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  }

  return (
    <form
      className="stack"
      onSubmit={handleSubmit}
    >
      <label>
        Username

        <input
          className="input"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="Your username"
          required
        />
      </label>

      <label>
        PIN

        <input
          className="input"
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(event) =>
            setPin(event.target.value)
          }
          placeholder="Your PIN"
          required
        />
      </label>

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
        type="submit"
        disabled={loading}
      >
        {loading ? "LOGGING IN..." : "LOGIN"}
      </button>
    </form>
  );
}