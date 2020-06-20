export function buildClassName(arr: (string| undefined)[]) {
    return arr.filter(p => p).join(" ");
}