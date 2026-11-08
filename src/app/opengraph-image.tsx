import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from "@/config/site";

export const runtime = "nodejs";
export const revalidate = 86400;
export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #22D3A0 0%, #38BDF8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0B0D12",
                fontWeight: "bold",
                fontSize: "24px",
              }}
            >
              &gt;_
            </div>
            <span style={{ fontSize: "32px", fontWeight: "bold", color: "#FFFFFF" }}>
              Writeup<span style={{ color: "#22D3A0" }}>Hub</span>
            </span>
          </div>

          <div
            style={{
              fontSize: "14px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(34, 211, 160, 0.12)",
              color: "#22D3A0",
              border: "1px solid rgba(34, 211, 160, 0.3)",
              fontWeight: "bold",
              letterSpacing: "0.05em",
            }}
          >
            VERIFIED SECURITY ARCHIVE
          </div>
        </div>

        {/* Center Hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1050px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#FFFFFF",
              lineHeight: "1.15",
              letterSpacing: "-0.02em",
            }}
          >
            CTF Walkthroughs &amp; Exploit Research
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#94A3B8",
              lineHeight: "1.4",
              maxWidth: "900px",
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        {/* Footer */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#22D3A0" }}>●</span>
            <span>walkthrough-by.samgirma.app</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#38BDF8" }}>
            DEFCON • CTFTime • HackTheBox • CVEs
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
