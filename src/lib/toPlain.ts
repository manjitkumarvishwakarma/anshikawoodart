export function toPlain<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}