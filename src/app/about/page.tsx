import Link from "next/link";
import Image from "next/image";

const STORY_ENTRIES = [
  {
    title: "配色とロゴの刷新",
    body: "当初は紫×生成りの配色で、ロゴもレンガの壁モチーフでした。「給与明細やダッシュボードのような、シャープで精密な印象にしたい」という方向性を固め、紺×シアンに刷新。ロゴも、壁ステータス表示(ドーナツリング)をそのまま縮約した、ツール本体と一貫性のあるモチーフに作り直しました。",
    before: "/story/before-home.jpg",
    after: "/story/after-home.jpg",
    objectPosition: "object-top",
  },
  {
    title: "ロゴのモチーフ変更",
    body: "レンガの壁モチーフは直感的ではあるものの、ツール内の実際の表示(壁ステータスのリング)とは関連の薄い意匠でした。「収入がリング状に積み上がり、帯(閾値)にどこまで迫れるか」を縮約した形に描き直し、ツール内のUIとロゴが同じ視覚言語で繋がるようにしました。",
    before: "/story/before-logo.jpg",
    after: "/story/after-logo.jpg",
    objectPosition: "object-center",
  },
  {
    title: "角丸カードからledger行へ",
    body: "バイトの入力欄は当初、角丸カードを並べる一般的なデザインでした。「角丸カードの羅列はAIが作ったテンプレートっぽく見えて陳腐」という指摘を受け、給与明細のような罫線区切りの行(ledger row)形式に作り直しました。スライダーも「もう分かっている事実を入力する場面に、連続値を探るスライダーは不向き」という理由で数値入力に変更しています。",
    before: "/story/before-jobcard.jpg",
    after: "/story/after-jobcard.jpg",
    objectPosition: "object-top",
  },
];

const CALCULATION_BASIS = [
  {
    title: "123万円の壁(所得税・住民税)",
    body: "令和7年度税制改正後の基礎控除58万円+給与所得控除65万円=123万円。年齢・加入状況に関わらず全員共通の基準です。",
  },
  {
    title: "150万円 / 130万円の壁(社会保険)",
    body: "2025年10月の被扶養者認定基準の改正により、19〜23歳(特定扶養親族)は130万円から150万円に引き上げられました。それ以外の年齢は従来どおり130万円のままです。(出典: 日本年金機構)",
  },
  {
    title: "通勤手当の扱いの違い",
    body: "所得税法上は非課税のため123万円の壁には含めませんが、社会保険の算定では「報酬」に含まれるため、150万円/130万円の壁には加算して計算しています。同じ手当でも、どちらの壁を見ているかで扱いが変わります。",
  },
];

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

        <div>
          <div className="mb-1 flex items-baseline justify-between border-b-2 border-(--text-primary) pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">開発ストーリー</h2>
            <span className="text-[11px] text-muted">{STORY_ENTRIES.length}件</span>
          </div>
          <p className="mt-3 text-xs text-muted">
            一人で何度も作り直しながら進めました。完成形だけでなく、やり直した過程も残しています。
          </p>
          {STORY_ENTRIES.map((s) => (
            <div key={s.title} className="border-b border-(--gridline) py-5">
              <h3 className="text-sm font-semibold text-primary">{s.title}</h3>
              <p className="mt-1 text-sm text-secondary">{s.body}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">Before</span>
                  <div className="relative aspect-video overflow-hidden border border-(--border-hairline)">
                    <Image
                      src={s.before}
                      alt={`${s.title}(変更前)`}
                      fill
                      className={`object-cover ${s.objectPosition}`}
                      sizes="(max-width: 640px) 45vw, 320px"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold tracking-wide text-brand uppercase">After</span>
                  <div className="relative aspect-video overflow-hidden border border-(--border-hairline)">
                    <Image
                      src={s.after}
                      alt={`${s.title}(変更後)`}
                      fill
                      className={`object-cover ${s.objectPosition}`}
                      sizes="(max-width: 640px) 45vw, 320px"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-1 flex items-baseline justify-between border-b-2 border-(--text-primary) pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">計算の根拠</h2>
            <span className="text-[11px] text-muted">{CALCULATION_BASIS.length}件</span>
          </div>
          <p className="mt-3 text-xs text-muted">
            「壁」の金額や扱いは年齢・加入状況・制度改正によって変わります。このツールが何を根拠に計算しているかをまとめました。
          </p>
          {CALCULATION_BASIS.map((c) => (
            <div key={c.title} className="border-b border-(--gridline) py-4">
              <h3 className="text-sm font-semibold text-primary">{c.title}</h3>
              <p className="mt-1 text-sm text-secondary">{c.body}</p>
            </div>
          ))}
        </div>

        <div
          id="privacy"
          className="flex flex-col gap-2 border-l-2 border-brand bg-(--brand-soft) px-4 py-3 text-xs text-secondary"
        >
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
