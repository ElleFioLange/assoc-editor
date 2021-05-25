export default function indexOfId(
  list: { id: string }[],
  id: string
): number | undefined {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return undefined;
}
