export declare class Logger {
    isDisposed: boolean;
    private readonly prefix;
    constructor(prefix: string);
    startMethod(name: string): void;
    endMethod(name: string): void;
    startSection(name: string): void;
    endSection(name: string): void;
    error(err: unknown): void;
    dispose(): void;
}
