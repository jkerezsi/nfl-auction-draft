import { useState } from "react";

import {
  login
} from "../../services/adminAuthService";


interface AdminLoginProps {
  onLogin: () => void;
}


export default function AdminLogin({
  onLogin
}: AdminLoginProps) {
  const [pin, setPin] =
    useState("");

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);


  async function handleLogin() {
    const trimmedPin =
      pin.trim();

    if (!trimmedPin) {
      setError(
        "Please enter the commissioner PIN."
      );

      return;
    }

    try {
      setError("");

      setIsLoading(true);

      await login(
        trimmedPin
      );

      onLogin();
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ??
          "Invalid commissioner PIN."
      );
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#111827"
      }}
    >
      <div
        style={{
          width: "380px",
          padding: "32px",
          borderRadius: "16px",
          background: "#1f2937",
          color: "white"
        }}
      >
        <h1
          style={{
            marginTop: 0,
            marginBottom: "8px"
          }}
        >
          Commissioner Login
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            opacity: 0.7
          }}
        >
          Enter the commissioner PIN to access the draft controls.
        </p>

        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={event =>
            setPin(
              event.target.value
            )
          }
          onKeyDown={event => {
            if (
              event.key ===
              "Enter"
            ) {
              void handleLogin();
            }
          }}
          placeholder="Commissioner PIN"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "8px",
            border: "1px solid #4b5563",
            background: "#374151",
            color: "white"
          }}
        />

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "8px",
              background: "#7f1d1d"
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            void handleLogin()
          }
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            fontSize: "16px",
            fontWeight: 700,
            cursor: isLoading
              ? "not-allowed"
              : "pointer",
            opacity: isLoading
              ? 0.6
              : 1
          }}
        >
          {isLoading
            ? "Signing in..."
            : "Unlock Draft"}
        </button>
      </div>
    </div>
  );
}