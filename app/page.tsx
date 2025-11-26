"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardIcon,
  TrashIcon,
  ChartBarIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

type LinkItem = {
  code: string;
  url: string;
  clicks: number;
  last_clicked: string | null;
};

export default function Home() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [url, setUrl] = useState<string>("");
  const [custom, setCustom] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [toast, setToast] = useState<string>("");


  // Load all links
  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    try {
      const res = await fetch("/api/links", { cache: "no-store" });
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  // Toast
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // URL validation
  function validURL(str: string) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  // Create short link
  async function createLink(e: any) {
    e.preventDefault();
    if (!url.trim()) return showToast("URL is required");
    if (!validURL(url)) return showToast("Invalid URL format");

    setLoading(true);

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, customCode: custom || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      showToast(data.error || "Unable to create link");
      return;
    }

    // Instant update
    setUrl("");
    setCustom("");
    setLinks([data as LinkItem, ...links]);
    showToast("Link Created!");
  }

  // Delete link
  async function deleteLink(code: string) {
    await fetch(`/api/links/${code}`, { method: "DELETE" });
    setLinks(links.filter((item) => item.code !== code));
    showToast("Link Deleted");
  }

  // Copy link
  function copyLink(code: string) {
    const full = `${window.location.origin}/r/${code}`;
    navigator.clipboard.writeText(full);
    showToast("Copied!");
  }

  // Search filter
  const filtered = links.filter((item) =>
    item.code.toLowerCase().includes(search.toLowerCase()) ||
    item.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg toast">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 text-white font-bold px-3 py-2 rounded-full text-xl">
            TL
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">TinyLink</h1>
            <p className="text-gray-500 text-sm">
              Shorten, share and track links — fast, simple and secure.
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center mt-5 md:mt-0 gap-3">
          <div className="flex items-center border rounded-lg bg-white px-3 py-2 shadow-sm w-64">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input
              placeholder="Search links, codes..."
              className="ml-2 w-full outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Link
            href="/stats/sample"
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition flex items-center gap-2"
          >
            <ChartBarIcon className="w-5 h-5" /> View Stats
          </Link>
        </div>
      </header>

      {/* Create short link */}
      <div className="card max-w-4xl mx-auto mb-10">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <PlusIcon className="w-5 h-5 text-purple-600" />
          Create a short link
        </h2>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" onSubmit={createLink}>
          <input
            placeholder="Paste a long URL (https://...)"
            className="border border-gray-300 rounded-lg p-3 w-full"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <input
            placeholder="Custom code (optional)"
            className="border border-gray-300 rounded-lg p-3 w-full"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />

          <button
            className="btn-primary flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? "Creating..." : "Shorten"}
          </button>
        </form>
      </div>

      {/* Links list */}
      <h2 className="text-xl font-semibold mb-4">Your links</h2>
      <p className="text-sm text-gray-500 mb-4">{links.length} total</p>

      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.code}
            className="card flex flex-col md:flex-row md:items-center justify-between gap-5 animate-slideFade"
          >
            {/* LEFT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="code-pill">{item.code}</span>
                <span className="truncate text-gray-700 max-w-full">{item.url}</span>
              </div>

              <div className="flex items-center gap-5 text-gray-500 text-sm mt-2">
                <div className="flex items-center gap-1">
                  <ChartBarIcon className="w-4 h-4" />
                  {item.clicks}
                </div>

                <div>
                  {item.last_clicked
                    ? new Date(item.last_clicked).toLocaleString()
                    : "Never"}
                </div>

                <div className="text-purple-600 underline">
                  {window?.location?.origin}/r/{item.code}
                </div>
              </div>
            </div>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-5 shrink-0">
              <button
                onClick={() => copyLink(item.code)}
                className="text-gray-600 hover:text-purple-600"
              >
                <ClipboardIcon className="w-6 h-6" />
              </button>

              <Link href={`/stats/${item.code}`}>
                <ChartBarIcon className="w-6 h-6 text-gray-600 hover:text-purple-600" />
              </Link>

              <button
                onClick={() => deleteLink(item.code)}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
