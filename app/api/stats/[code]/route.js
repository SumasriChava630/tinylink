import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req, context) {
  try {
    const { code } = await context.params;  // ✅ FIXED

    const result = await pool.query(
      "SELECT code, url, clicks, last_clicked FROM links WHERE code = $1",
      [code]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });

  } catch (err) {
    console.error("Stats API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
