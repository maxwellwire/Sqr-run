"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
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
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            walletAddress,
            pin
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Could not create your account."
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
          placeholder="SQRKing"
          minLength={3}
          maxLength={20}
          required
        />
      </label>

      <label>
        EVM Wallet

        <input
          className="input"
          value={walletAddress}
          onChange={(event) =>
            setWalletAddress(event.target.value)
          }
          placeholder="0x..."
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
          placeholder="4-8 digit PIN"
          minLength={4}
          maxLength={8}
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
        {loading
          ? "CREATING ACCOUNT..."
          : "CREATE ACCOUNT & PLAY"}
      </button>
    </form>
  );
}