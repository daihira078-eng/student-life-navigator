import type { FocusEvent } from "react";

/**
 * type="number"の入力欄にフォーカスした時、中身を全選択する。
 * これが無いと、既存値(よく0)の途中にカーソルが入って「01300」のように数字が
 * 打ち足されてしまう。付けておけば、入力し始めた瞬間に置き換わる。
 */
export function selectOnFocus(e: FocusEvent<HTMLInputElement>) {
  e.target.select();
}
