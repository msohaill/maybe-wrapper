export interface API {
  onStart: (callback: () => void) => void,
  started: () => Promise<boolean>,
}

declare global {
  interface Window {
    api: API
  }
}
