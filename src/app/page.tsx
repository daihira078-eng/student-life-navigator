import Link from "next/link";
import { HomeWallPreview } from "@/components/HomeWallPreview";
import { WallIconMark } from "@/lib/pwaIcon";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="px-4 py-20">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          <div
            className="h-16 w-16 overflow-hidden rounded-xl"
            style={{ boxShadow: "0 1px 0 var(--border-hairline)" }}
          >
            <WallIconMark size={64} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-brand">一人暮らし新生活 総合最適化ナビ</p>
            <h1 className="text-3xl font-semibold text-primary text-balance">
              複数バイト×扶養の壁を、ひとつの画面で。
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/simulator"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              扶養最適化シミュレーターを開く
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-(--border-hairline) px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:border-brand"
            >
              このツールについて
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <HomeWallPreview />
        </div>
      </section>

      <section className="border-t border-(--border-hairline) px-4 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 text-center">
          <a
            href="https://github.com/daihira078-eng/student-life-navigator/actions/workflows/ci.yml"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* GitHub側が生成する外部SVGバッジで、next/imageの最適化対象外のため素のimgでよい */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://github.com/daihira078-eng/student-life-navigator/actions/workflows/ci.yml/badge.svg"
              alt="CI status"
              className="h-5"
            />
          </a>
        </div>
      </section>
    </main>
  );
}
