import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { getUserProfile } from "@/server/auth.service";

export const runtime = "nodejs";
export const revalidate = 86400;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserProfile(username);

  const displayUsername = user?.username || username;
  const bio = user?.bio || "Cybersecurity researcher & CTF solver on WriteupHub.";
  const publishedCount = user?._count.writeups || 0;

  const fontNotoSans = fs.readFileSync(
    path.join(process.cwd(), "src/assets/fonts/NotoSans-Bold.ttf")
  );
  const fontEthiopic = fs.readFileSync(
    path.join(process.cwd(), "src/assets/fonts/NotoSansEthiopic-Bold.ttf")
  );

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
          fontFamily: "NotoSans, NotoSansEthiopic, sans-serif",
          border: "8px solid #242936",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
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

          <div
            style={{
              fontSize: "14px",
              padding: "6px 14px",
              borderRadius: "6px",
              backgroundColor: "rgba(34, 211, 160, 0.15)",
              color: "#22D3A0",
              border: "1px solid rgba(34, 211, 160, 0.3)",
              fontWeight: "bold",
            }}
          >
            RESEARCHER PROFILE
          </div>
        </div>

        {/* Profile Card Body */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "24px",
              backgroundColor: "#181C25",
              border: "3px solid #242936",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#22D3A0",
            }}
          >
            {displayUsername.slice(0, 2).toUpperCase()}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "800px" }}>
            <div style={{ fontSize: "44px", fontWeight: "bold", color: "#FFFFFF" }}>
              @{displayUsername}
            </div>
            <div style={{ fontSize: "20px", color: "#94A3B8", lineHeight: "1.3" }}>
              {bio}
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
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
          <div style={{ display: "flex", gap: "30px" }}>
            <div>
              <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>{publishedCount}</span>
              <span> Published Writeups</span>
            </div>
            <div>
              <span style={{ color: "#22D3A0", fontWeight: "bold" }}>{publishedCount * 4}</span>
              <span> CTF Solves</span>
            </div>
          </div>

          <div style={{ color: "#38BDF8" }}>
            walkthrough-by.samgirma.app/u/{displayUsername}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "NotoSans",
          data: fontNotoSans,
          weight: 700,
          style: "normal",
        },
        {
          name: "NotoSansEthiopic",
          data: fontEthiopic,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
