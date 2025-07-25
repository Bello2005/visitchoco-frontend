import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((json) => setMessage(json.message))
      .catch((err) => setError(err.message));
  }, [navigate]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!message) return <p>Loading...</p>;

  return <h1 className="text-2xl font-bold">{message}</h1>;
}
