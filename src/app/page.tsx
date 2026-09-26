import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-4 py-20">
      <p className="text-sm font-medium text-series-1">一人暮らし新生活 総合最適化ナビ</p>
      <h1 className="text-3xl font-semibold text-primary">
        複数バイト×扶養の壁×経済圏を、ひとつの画面で。
      </h1>
      <p className="text-secondary">
        マネーフォワードMEやシフトボードが「記録」するツールだとしたら、これは「この先どうすべきか」を計算する意思決定シミュレーターです。
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/simulator"
          className="rounded-full bg-series-1 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          扶養最適化シミュレーターを開く
        </Link>
        <Link
          href="/economic-zone"
          className="rounded-full border border-(--border-hairline) px-5 py-2.5 text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          経済圏・固定費診断を開く
        </Link>
      </div>
    </main>
  );
}
