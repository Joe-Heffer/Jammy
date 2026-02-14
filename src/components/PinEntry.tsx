"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PinEntry() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      });

      if (response.ok) {
        // Successful authentication - redirect to jam list
        router.push("/jam");
        router.refresh();
      } else {
        // Invalid PIN - show error
        setError(true);
        setPin("");

        // Remove error state after animation completes
        setTimeout(() => setError(false), 820);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 820);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      {/* Logo/Title */}
      <div className="text-center">
        <h1 className="font-heading text-7xl font-bold tracking-tight text-primary sm:text-8xl">
          JAMMY
        </h1>
        <p className="mt-4 text-lg text-muted">
          Shared jam tracker for bass + drums
        </p>
      </div>

      {/* PIN Entry Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="pin"
            className="block text-center text-sm font-medium uppercase tracking-wider text-muted"
          >
            Enter PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            disabled={loading}
            autoFocus
            maxLength={8}
            className={`
              w-full rounded-lg border-2 bg-surface px-6 py-4
              text-center text-2xl font-mono tracking-widest
              transition-all duration-200
              placeholder:text-subtle
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                error
                  ? "border-primary animate-shake"
                  : "border-border hover:border-surface-hover"
              }
            `}
            placeholder="••••"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center">
            <p className="font-heading text-2xl font-bold tracking-wide text-primary animate-pulse">
              DENIED
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !pin}
          className="
            w-full rounded-lg bg-primary px-6 py-4
            font-heading text-lg font-bold uppercase tracking-wide text-foreground
            transition-all duration-200
            hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
            disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-95
          "
        >
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
