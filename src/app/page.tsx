import Link from "next/link";
import { HomeWallPreview } from "@/components/HomeWallPreview";
import { WallIconMark } from "@/lib/pwaIcon";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="px-4 py-20">
        <div className="mx-auto grid w-full max-w-5xl gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col gap-6">
            <div
              className="h-16 w-16 overflow-hidden rounded-xl"
              style={{ boxShadow: "0 1px 0 var(--border-hairline)" }}
            >
              <WallIconMark size={64} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <span className="h-px w-8 bg-brand" />
                <p className="text-xs font-bold tracking-[0.2em] text-brand uppercase">
                  一人暮らし新生活 総合最適化ナビ
                </p>
              </div>
              <h1 className="text-4xl leading-tight font-bold tracking-tight text-primary sm:text-5xl">
                バイトを増やしても、
                <br />「<span className="wall-highlight">壁</span>」は越えない。
              </h1>
              <p className="max-w-md text-sm text-secondary">
                複数の給与をまとめて、扶養控除や社会保険の基準額を自動計算。
                <br />
                あといくら働けるか、ひと目でわかります。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/simulator"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                今すぐシミュレーション →
              </Link>
              <span className="text-xs text-muted">登録不要・ずっと無料</span>
            </div>
            <Link
              href="/about"
              className="text-sm font-medium text-secondary underline decoration-(--border-hairline) underline-offset-4 hover:text-brand"
            >
              このツールについて
            </Link>
          </div>
          <HomeWallPreview />
        </div>
      </section>

      <div className="border-t border-(--border-hairline) px-4 py-5">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-secondary">
          <span>複数バイトをまとめて管理</span>
          <span className="text-muted">・</span>
          <span>税金・保険料を自動計算</span>
          <span className="text-muted">・</span>
          <span>シフトの目安までわかる</span>
        </div>
      </div>

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
