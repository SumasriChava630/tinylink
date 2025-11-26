"use client";

import { useEffect, useState } from "react";

export default function StatsPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { code } = await params;   // ❗ same fix — await params
        const res = await fetch(`/api/stats/${code}`);

        if (!res.ok) {
          setError("Invalid or missing link");
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch {
        setError("Error loading stats");
      }
      setLoading(false);
    }

    load();
  }, [params]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Stats for {data.code}</h1>

      <div className="card p-5">
        <p><strong>Target:</strong> {data.url}</p>
        <p><strong>Clicks:</strong> {data.clicks}</p>
        <p>
          <strong>Last Click:</strong>{" "}
          {data.last_clicked ? new Date(data.last_clicked).toLocaleString() : "Never"}
        </p>
      </div>
    </div>
  );
}
