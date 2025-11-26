// app/api/links/route.js
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

function generateCode(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM links ORDER BY created_at DESC");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/links error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, customCode } = body;

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    let code = (customCode || generateCode(6)).trim();

    // ensure code length not too big
    if (code.length > 32) {
      return NextResponse.json({ error: "Code too long" }, { status: 400 });
    }

    // check duplicates
    const exists = await pool.query("SELECT 1 FROM links WHERE code = $1", [code]);
    if (exists.rowCount > 0) {
      return NextResponse.json({ error: "Code exists" }, { status: 409 });
    }

    const insert = await pool.query(
      "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING code, url, clicks, last_clicked, created_at",
      [code, url]
    );

    return NextResponse.json(insert.rows[0], { status: 200 });
  } catch (err) {
    console.error("POST /api/links error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
