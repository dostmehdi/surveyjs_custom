export class Logger {
  public isDisposed: boolean = false;
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  // Safe logging with fallback
  private log(level: 'debug' | 'error' | 'warn' | 'info', ...args: any[]): void {
    if (this.isDisposed) return;
    // Use the global console
    const method = (console as any)[level] || console.log;
    try {
      method(`[${this.prefix}]`, ...args);
    } catch {
      // Silently ignore if even console.log fails
    }
  }

  public startMethod(name: string): void {
    this.log('debug', `start ${name}`);
  }

  public endMethod(name: string): void {
    this.log('debug', `end ${name}`);
  }

  public startSection(name: string): void {
    this.log('debug', `section ${name}`);
  }

  public endSection(name: string): void {
    this.log('debug', `end section ${name}`);
  }

  public error(err: unknown): void {
    this.log('error', err);
  }

  public dispose(): void {
    this.isDisposed = true;
    this.log('debug', 'disposed');
  }
}