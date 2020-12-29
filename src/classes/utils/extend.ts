export default function extend(...args: any[]) {
  const t = args[0];
  for (let i = 1; i < args.length; i++) {
    const s = args[i];
    for (const p in s) {
      t[p] = s[p];
    }
  }
  return t;
}
