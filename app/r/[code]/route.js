// app/r/[code]/route.js
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const code = params.code;

    // 1. Fetch link
    const result = await pool.query("SELECT url FROM links WHERE code=$1", [code]);
    if (result.rowCount === 0) {
      // Not found → return a 404 JSON (or a not-found page) — we return JSON here to simplify
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const url = result.rows[0].url;

    // 2. Update clicks + last_clicked
    await pool.query(
      `UPDATE links 
       SET clicks = clicks + 1, last_clicked = NOW()
       WHERE code = $1`,
      [code]
    );

    // 3. Redirect
    return NextResponse.redirect(url, 302);
  } catch (err) {
    console.error("Redirect error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
