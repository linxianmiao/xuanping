/**
 *
 * @param {string} kw 关键字
 * @param {string} value 全量字符
 */

export function stringCompare (kw, value) {
  return value.toLowerCase().indexOf(kw.toLowerCase()) !== -1
}
