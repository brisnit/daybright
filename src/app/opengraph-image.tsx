import { ImageResponse } from "next/og";
import { BRAND } from "@/config/brand";

export const alt = `${BRAND.name}: client retention and milestone intelligence for regulated industries`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FBF7EF",
          padding: 72,
          fontFamily: "Georgia, serif",
          color: "#16203A",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 720 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#8A6A2B" }}>
            Advisors · Insurance · Real estate · Legal
          </div>
          <div style={{ fontSize: 62, lineHeight: 1.05, fontWeight: 700 }}>
            {"Client retention & milestone intelligence for regulated industries."}
          </div>
          <div style={{ fontSize: 30, color: "#3B3658" }}>{`${BRAND.name} · Founding Charter`}</div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 300,
              height: 220,
              background: "#1E2A44",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 30px 60px -30px rgba(22,32,58,0.6)",
            }}
          >
            <div style={{ width: 70, height: 70, borderRadius: 999, background: "#7A1F2B", display: "flex" }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
