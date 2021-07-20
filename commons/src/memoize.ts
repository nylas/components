function memoize<FunctionParameterType, FunctionResultType>(
  func: (...args: FunctionParameterType[]) => FunctionResultType,
  hashcode: (...args: FunctionParameterType[]) => string = (...args) =>
    JSON.stringify(args),
): (...args: FunctionParameterType[]) => FunctionResultType {
  const cache = new Map<string, FunctionResultType>();
  return (...args: FunctionParameterType[]): FunctionResultType => {
    const hash = hashcode(...args);
    if (cache.has(hash)) {
      return cache.get(hash) as FunctionResultType;
    }
    const result = func(...args);
    cache.set(hash, result);
    return result;
  };
}

export default memoize;
