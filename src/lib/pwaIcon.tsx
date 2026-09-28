/** PWAアイコン用の簡易的な「壁(レンガ)」モチーフ。next/ogのImageResponseから使う */
export function WallIconMark({ size }: { size: number }) {
  const brick = "#fffdf9";
  const gap = size * 0.06;
  const brickW = size * 0.32;
  const brickH = size * 0.16;
  const radius = size * 0.03;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#4a3aa7",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap,
      }}
    >
      <div style={{ display: "flex", gap }}>
        <div style={{ width: brickW, height: brickH, background: brick, borderRadius: radius }} />
        <div style={{ width: brickW, height: brickH, background: brick, borderRadius: radius }} />
      </div>
      <div style={{ display: "flex", gap }}>
        <div style={{ width: brickH, height: brickH, background: "transparent" }} />
        <div style={{ width: brickW, height: brickH, background: brick, borderRadius: radius }} />
        <div style={{ width: brickH, height: brickH, background: "transparent" }} />
      </div>
    </div>
  );
}
