declare module 'cordis' {
  interface Context {
    on?(event: string, handler: (...args: any[]) => void): (...args: any[]) => void
    effect(dispose: () => void, name?: string): void
    webServer?: {
      register(route: { kind: string; path: string; handler: (req: any, res: any) => Promise<void> }): () => void
    }
  }
}
