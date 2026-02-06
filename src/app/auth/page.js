// src/app/auth/page.js

"use client";

import { useState } from "react";
import { saveUserSession } from "@/lib/utils/session";

export default function AuthPage() {
  const [formData, setFormData] = useState({
    enrollmentNumber: "",
    email: "",
    phone: "",
    agreedToTerms: false,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      console.log("📤 Sending auth request with:", {
        enrollmentNumber: formData.enrollmentNumber,
        email: formData.email,
        phone: formData.phone,
        agreedToTerms: formData.agreedToTerms,
      });

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("📥 Response status:", response.status);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (data.success) {
        saveUserSession(data.user);
        setMessage(`✅ ${data.message}`);

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Auth error:", error);
      setMessage("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "20px" }}>
      <h1>IC Library - Login/Register</h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          {/* <label>Enrollment Number (must contain "17" for IC dept)</label> */}
          <input
            type="text"
            value={formData.enrollmentNumber}
            onChange={(e) =>
              setFormData({ ...formData, enrollmentNumber: e.target.value })
            }
            placeholder="240130117001"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="your.email@gmail.com"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="9876543210"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={(e) =>
                setFormData({ ...formData, agreedToTerms: e.target.checked })
              }
              required
            />{" "}
            I agree to the terms and conditions
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            background: "#0070f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            background: message.includes("✅") ? "#d4edda" : "#f8d7da",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}
