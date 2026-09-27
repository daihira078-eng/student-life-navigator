import type { WallStatus } from "./types";
import { formatHours, formatYen } from "./format";

// 書き出し画像は閲覧環境のダーク/ライト設定に左右されないよう、ライトテーマの値を固定で使う
const COLORS = {
  plane: "#f9f9f7",
  surface: "#ffffff",
  primary: "#0b0b0b",
  secondary: "#52514e",
  muted: "#898781",
  border: "#e1e0d9",
  accent: "#2a78d6",
  good: "#0ca30c",
  goodBg: "#e3f6e3",
  warning: "#fab219",
  warningBg: "#fef3dd",
  critical: "#d03b3b",
  criticalBg: "#fbe4e4",
};

function statusColor(status: WallStatus["status"]) {
  if (status === "good") return COLORS.good;
  if (status === "warning") return COLORS.warning;
  return COLORS.critical;
}

function statusBg(status: WallStatus["status"]) {
  if (status === "good") return COLORS.goodBg;
  if (status === "warning") return COLORS.warningBg;
  return COLORS.criticalBg;
}

function statusLabel(status: WallStatus["status"]) {
  if (status === "good") return "余裕あり";
  if (status === "warning") return "壁に接近中";
  return "壁を超える見込み";
}

function overallStatus(walls: WallStatus[]): WallStatus["status"] {
  if (walls.some((w) => w.status === "critical")) return "critical";
  if (walls.some((w) => w.status === "warning")) return "warning";
  return "good";
}

function headline(status: WallStatus["status"]) {
  if (status === "good") return "まだ余裕があります";
  if (status === "warning") return "壁に接近中です";
  return "壁を超える見込みです";
}

function shortWallLabel(wall: WallStatus["wall"]): string {
  const man = Math.round(wall.threshold / 10000);
  return wall.key === "incomeTax" ? `${man}万円の壁（所得税）` : `${man}万円の壁（社会保険）`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const FONT = "system-ui, -apple-system, 'Hiragino Sans', 'Yu Gothic', sans-serif";

export function drawShareCard(canvas: HTMLCanvasElement, walls: WallStatus[], targetYear: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = COLORS.plane;
  ctx.fillRect(0, 0, W, H);

  const margin = 40;
  roundRect(ctx, margin, margin, W - margin * 2, H - margin * 2, 24);
  ctx.fillStyle = COLORS.surface;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  const padX = margin + 48;

  ctx.fillStyle = COLORS.accent;
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText("一人暮らし新生活シミュレーター", padX, margin + 60);

  ctx.fillStyle = COLORS.muted;
  ctx.font = `400 18px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText(`${targetYear}年`, W - margin - 48, margin + 58);
  ctx.textAlign = "left";

  const status = overallStatus(walls);
  ctx.fillStyle = statusColor(status);
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(headline(status), padX, margin + 128);

  const blockTop = margin + 170;
  const blockGap = 32;
  const blockWidth = (W - margin * 2 - 96 - blockGap * (walls.length - 1)) / walls.length;
  const blockHeight = H - margin - blockTop - 48;

  walls.forEach((w, i) => {
    const x = padX + i * (blockWidth + blockGap);
    roundRect(ctx, x, blockTop, blockWidth, blockHeight, 16);
    ctx.fillStyle = statusBg(w.status);
    ctx.fill();

    let cy = blockTop + 40;
    ctx.fillStyle = COLORS.secondary;
    ctx.font = `600 20px ${FONT}`;
    ctx.fillText(shortWallLabel(w.wall), x + 28, cy);

    cy += 34;
    ctx.fillStyle = statusColor(w.status);
    ctx.font = `600 16px ${FONT}`;
    ctx.fillText(statusLabel(w.status), x + 28, cy);

    cy += 56;
    ctx.fillStyle = COLORS.primary;
    ctx.font = `700 44px ${FONT}`;
    const hoursText =
      w.remainingAmount > 0 ? `あと${formatHours(w.remainingHours)}` : "すでに超過";
    ctx.fillText(hoursText, x + 28, cy);

    cy += 44;
    ctx.fillStyle = COLORS.secondary;
    ctx.font = `400 18px ${FONT}`;
    ctx.fillText(
      `年間見込み ${formatYen(w.annualProjection)} / ${formatYen(w.wall.threshold)}`,
      x + 28,
      cy,
    );
  });

  ctx.fillStyle = COLORS.muted;
  ctx.font = `400 16px ${FONT}`;
  ctx.fillText("student-life-navigator.vercel.app", padX, H - margin - 24);
}
