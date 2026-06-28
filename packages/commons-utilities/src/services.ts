export class Logger {
  public isDisposed: boolean = false;
  private readonly prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  public startMethod(name: string): void {
    console.debug(`${this.prefix} - start ${name}`);
  }

  public endMethod(name: string): void {
    console.debug(`${this.prefix} - end ${name}`);
  }

  public startSection(name: string): void {
    console.debug(`${this.prefix} - section ${name}`);
  }

  public endSection(name: string): void {
    console.debug(`${this.prefix} - end section ${name}`);
  }

  public error(err: unknown): void {
    console.error(`${this.prefix} -`, err);
  }

  public dispose(): void {
    this.isDisposed = true;
    console.debug(`${this.prefix} - disposed`);
  }
}
