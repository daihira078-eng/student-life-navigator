import { ImageResponse } from "next/og";
import { WallIconMark } from "@/lib/pwaIcon";

export async function GET() {
  return new ImageResponse(<WallIconMark size={512} />, { width: 512, height: 512 });
}
