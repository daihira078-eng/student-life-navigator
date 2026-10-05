import type { FocusEvent } from "react";

/**
 * type="number"の入力欄にフォーカスした時、中身を全選択する。
 * これが無いと、既存値(よく0)の途中にカーソルが入って「01300」のように数字が
 * 打ち足されてしまう。付けておけば、入力し始めた瞬間に置き換わる。
 *
 * select()をこの場で同期的に呼ぶだけだと、マウスクリックでフォーカスした場合に
 * 直後のmouseupイベントがブラウザ標準の挙動でカーソル位置を上書きし、選択が
 * 解除されてしまう(Tabキーでのフォーカスでは発生しない、クリック時だけの既知の挙動)。
 * setTimeoutでmouseup後まで遅延させることで確実に選択状態を残す。
 */
export function selectOnFocus(e: FocusEvent<HTMLInputElement>) {
  const target = e.target;
  setTimeout(() => target.select(), 0);
}
