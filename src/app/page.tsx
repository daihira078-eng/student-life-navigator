import Link from "next/link";
import { HomeWallPreview } from "@/components/HomeWallPreview";

const FEATURES = [
  {
    title: "複数バイト横断のシミュレーション",
    body: "時給もシフトも違う複数のバイトをまとめて入力すると、123万円・社会保険の壁までの残り稼働時間を横断で計算します。",
  },
  {
    title: "壁を超えそうなら回避策も提示",
    body: "どのバイトのシフトを週何時間減らせば壁を回避できるか、逆算して提案します。",
  },
  {
    title: "実績との答え合わせ",
    body: "実際の家計簿データと予測を並べて、見立てがどれくらい当たっていたかを振り返れます。",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section
        className="px-4 py-20"
        style={{
          background:
            "radial-gradient(120% 140% at 0% 0%, var(--brand-soft), transparent 60%), radial-gradient(120% 140% at 100% 0%, color-mix(in oklab, var(--series-1) 10%, transparent), transparent 60%)",
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <p className="text-sm font-semibold text-brand">一人暮らし新生活 総合最適化ナビ</p>
          <h1 className="text-3xl font-semibold text-primary text-balance">
            複数バイト×扶養の壁を、ひとつの画面で。
          </h1>
          <p className="text-secondary">
            マネーフォワードMEやシフトボードが「記録」するツールだとしたら、これは「この先どうすべきか」を計算する意思決定シミュレーターです。開発者自身が一人暮らしの中で直面した「複数バイト×扶養の壁」の管理を、自分のために作りました。
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/simulator"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              扶養最適化シミュレーターを開く
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <HomeWallPreview />
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex flex-col gap-2">
              <div className="h-1 w-8 rounded-full bg-brand" />
              <h2 className="text-sm font-semibold text-primary">{f.title}</h2>
              <p className="text-sm text-secondary">{f.body}</p>
            </div>
          ))}
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
          <p className="text-xs text-muted">
            税制ロジックはユニットテストで検証済み・pushのたびにCIでbuild/lint/testを自動実行しています。
          </p>
          <p className="text-xs text-muted">
            ブラウザでこのページを開いた状態で「ホーム画面に追加」すると、アプリのように使えます（オフラインでも一部利用可）。
          </p>
        </div>
      </section>
    </main>
  );
}
