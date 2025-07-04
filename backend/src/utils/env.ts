export function env(key: string): string {
  const value = process.env[key];
  if (typeof value === 'undefined') {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}
