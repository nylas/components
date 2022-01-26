export function addKeyValue<T>(arr: any[], obj: Record<any, any>): T[] {
  return arr.map((item: any) => ({ ...item, ...obj }));
}
