import { ImageResponse } from "next/og";
import { getWriteupByAuthorAndSlug } from "@/server/writeup.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "WriteupHub CTF Walkthrough";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const writeup = await getWriteupByAuthorAndSlug(username, slug);

  const title = writeup?.title || "CTF Exploit Walkthrough";
  const ctfName = writeup?.ctfName || "CTF Competition";
  const category = writeup?.category || "SECURITY";
  const difficulty = writeup?.difficulty || "MEDIUM";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: "#0B0D12",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #181C25 2%, transparent 0%), radial-gradient(circle at 75px 75px, #181C25 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "60px",
          color: "#E0E2EC",
          fontFamily: "sans-serif",
          border: "8px solid #242936",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #22D3A0 0%, #38BDF8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0B0D12",
                fontWeight: "bold",
                fontSize: "22px",
              }}
            >
              &gt;_
            </div>
            <span style={{ fontSize: "28px", fontWeight: "bold", color: "#FFFFFF" }}>
              Writeup<span style={{ color: "#22D3A0" }}>Hub</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <span
              style={{
                fontSize: "14px",
                padding: "6px 14px",
                borderRadius: "6px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38BDF8",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                fontWeight: "bold",
              }}
            >
              {category}
            </span>
            <span
              style={{
                fontSize: "14px",
                padding: "6px 14px",
                borderRadius: "6px",
                backgroundColor: "#181C25",
                color: "#22D3A0",
                border: "1px solid #242936",
                fontWeight: "bold",
              }}
            >
              {difficulty}
            </span>
          </div>
        </div>

        {/* Title & CTF Name */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "1000px" }}>
          <div style={{ fontSize: "18px", color: "#94A3B8", fontWeight: "600", textTransform: "uppercase" }}>
            {ctfName}
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#FFFFFF",
              lineHeight: "1.15",
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "2px solid #242936",
            fontSize: "18px",
            color: "#94A3B8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Author:</span>
            <span style={{ color: "#22D3A0", fontWeight: "bold" }}>@{username}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#38BDF8" }}>
            ZERO-AUTH VERIFIED ARCHIVE
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
