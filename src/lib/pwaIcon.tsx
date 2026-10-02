/**
 * PWAアイコン用のモチーフ。「収入(リング)が、壁(閾値の帯)にどこまで迫れるか」という
 * アプリ本体の壁ステータス表示(ドーナツ)をそのまま縮約した形にしている。
 * 帯の上に少しだけはみ出した部分だけ白く発光させ、「壁を超えている分」を表す。
 */
export function WallIconMark({ size }: { size: number }) {
  const navy = "#0B0E16";
  const cyan = "#3FD6E0";
  const offWhite = "#EEF1F7";

  const diameter = size * 0.58;
  const holeDiameter = diameter * 0.62;
  const ringTop = size * 0.3;
  const ringLeft = (size - diameter) / 2;
  const holeTop = ringTop + (diameter - holeDiameter) / 2;
  const holeLeft = (size - holeDiameter) / 2;

  const splitPercent = 24;
  const splitY = ringTop + diameter * (splitPercent / 100);
  const lineGap = size * 0.018;
  const lineHeight = Math.max(2, size * 0.012);
  const bandLeft = size * 0.14;
  const bandWidth = size - bandLeft * 2;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: navy,
        position: "relative",
        display: "flex",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: ringTop,
          left: ringLeft,
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          background: `linear-gradient(to bottom, ${offWhite} 0%, ${offWhite} ${splitPercent}%, ${cyan} ${splitPercent}%, ${cyan} 100%)`,
          boxShadow: `0 ${size * 0.07}px ${size * 0.12}px rgba(0,0,0,0.5), inset 0 ${size * 0.015}px 0 rgba(255,255,255,0.4), inset 0 -${size * 0.045}px ${size * 0.08}px rgba(0,0,0,0.25)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: holeTop,
          left: holeLeft,
          width: holeDiameter,
          height: holeDiameter,
          borderRadius: "50%",
          background: navy,
          boxShadow: `inset 0 ${size * 0.02}px ${size * 0.035}px rgba(0,0,0,0.5)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: splitY - lineGap,
          left: bandLeft,
          width: bandWidth,
          height: lineHeight,
          background: offWhite,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: splitY + lineGap,
          left: bandLeft,
          width: bandWidth,
          height: lineHeight,
          background: offWhite,
          opacity: 0.45,
        }}
      />
    </div>
  );
}
