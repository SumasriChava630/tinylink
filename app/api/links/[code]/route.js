// app/api/links/[code]/route.js
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  try {
    const params = await context.params;
    const code = params.code;

    const result = await pool.query(
      "SELECT code, url, clicks, last_clicked, created_at FROM links WHERE code=$1",
      [code]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/links/[code] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const code = params.code;

    const result = await pool.query("DELETE FROM links WHERE code=$1", [code]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/links/[code] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
