export const tryCall = async <T>(
  fn: () => T | Promise<T>
): Promise<T | undefined> => {
  try {
    return await fn();
  } catch (e) {
    console.error(e);
  }
};
