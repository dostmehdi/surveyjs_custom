export class Logger {
    constructor(prefix) {
        this.isDisposed = false;
        this.prefix = prefix;
    }
    startMethod(name) {
        console.debug(`${this.prefix} - start ${name}`);
    }
    endMethod(name) {
        console.debug(`${this.prefix} - end ${name}`);
    }
    startSection(name) {
        console.debug(`${this.prefix} - section ${name}`);
    }
    endSection(name) {
        console.debug(`${this.prefix} - end section ${name}`);
    }
    error(err) {
        console.error(`${this.prefix} -`, err);
    }
    dispose() {
        this.isDisposed = true;
        console.debug(`${this.prefix} - disposed`);
    }
}
