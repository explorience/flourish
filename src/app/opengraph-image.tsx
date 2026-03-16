import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Potluck — Coordinate What You Need";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdf6e3 0%, #f5ead0 50%, #e6c49e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 120, marginBottom: 8 }}>🍲</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#4a7c59",
            letterSpacing: "-2px",
            marginBottom: 16,
          }}
        >
          Potluck
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#5c4a3a",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          What do we need? Who&apos;s bringing what?
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#8a7a6a",
            marginTop: 24,
          }}
        >
          potluck.exchange
        </div>
      </div>
    ),
    { ...size }
  );
}
