import Link from "next/link";

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
  {
    title: "シフト実績は別記録で管理",
    body: "「予定通り働けたか」を日ごとに記録できます。シミュレーターの予定はあくまで仮定のまま保たれ、実績と混ざりません。",
  },
];

export default function About() {
  return (
    <main className="flex flex-1 flex-col px-4 py-16">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-secondary hover:text-brand">
            ← ホームに戻る
          </Link>
          <h1 className="text-2xl font-semibold text-primary">このツールについて</h1>
          <p className="text-sm leading-relaxed text-secondary">
            マネーフォワードMEやシフトボードが「記録」するツールだとしたら、これは「この先どうすべきか」を計算する意思決定シミュレーターです。開発者自身が一人暮らしの中で直面した「複数バイト×扶養の壁」の管理を、自分のために作りました。
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between border-b-2 border-(--text-primary) pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">できること</h2>
            <span className="text-[11px] text-muted">{FEATURES.length}件</span>
          </div>
          {FEATURES.map((f) => (
            <div key={f.title} className="border-b border-(--gridline) py-4">
              <h3 className="text-sm font-semibold text-primary">{f.title}</h3>
              <p className="mt-1 text-sm text-secondary">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-l-2 border-brand bg-(--brand-soft) px-4 py-3 text-xs text-secondary">
          <p>
            入力内容はブラウザのlocalStorageに保存され、サーバーには送信されません。税制ロジックはユニットテストで検証済みで、pushのたびにCIでbuild/lint/testを自動実行しています。
          </p>
          <p>ブラウザでこのページを開いた状態で「ホーム画面に追加」すると、アプリのように使えます(オフラインでも一部利用可)。</p>
        </div>

        <div>
          <Link
            href="/simulator"
            className="inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            扶養最適化シミュレーターを開く
          </Link>
        </div>
      </div>
    </main>
  );
}
