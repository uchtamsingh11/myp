// Type definitions for fyers-api-v3
// This is a simple declaration to avoid TypeScript errors

declare module 'fyers-api-v3' {
  export default class FyersAPI {
    constructor();
    setAccessToken(token: string): void;
    // Add more method signatures as needed
  }
}
