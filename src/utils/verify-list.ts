export async function verifyList<T extends string>(
  input: string[],
  available: T[],
  fallback: () => Promise<T[]>,
): Promise<T[]> {
  const filtered: T[] = available.filter(item => input.includes(item));

  if (!filtered.length) {
    return await fallback();
  }

  return filtered;
}
