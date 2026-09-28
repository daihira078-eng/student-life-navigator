import { ImageResponse } from "next/og";
import { WallIconMark } from "@/lib/pwaIcon";

export async function GET() {
  return new ImageResponse(<WallIconMark size={192} />, { width: 192, height: 192 });
}
