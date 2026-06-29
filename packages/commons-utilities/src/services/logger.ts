import { log } from "node:console";
import { clearNewLines } from "survey-creator-core";

export class Logger implements AsyncDisposable
{
    //#region Fieldes
    public static readonly componentName: string = "Logger";

    /* *************************************************************** */

    private _isLocalhost: boolean = location.origin.includes("localhost");

    private _defaultLogLevelInt: number = (this._isLocalhost ? 0 : 4);
    private _isActiveTraceLog: boolean = this._defaultLogLevelInt <= 0;
    private _isActiveDebugLog: boolean = this._defaultLogLevelInt <= 1;
    private _isActiveInfoLog: boolean = this._defaultLogLevelInt <= 2;
    private _isActiveWarnLog: boolean = this._defaultLogLevelInt <= 3;
    private _isActiveErrorLog: boolean = this._defaultLogLevelInt <= 4;
    private _isActiveFetalLog: boolean = this._defaultLogLevelInt <= 5;
    private _isActiveLogging: boolean = this._defaultLogLevelInt < 6;

    /* *************************************************************** */

    private readonly _profileName: string = "";
    private _profileStarted: boolean = false;
    private _methodName: string = "";
    private _sectionName: string = "";

    private _indentLevel: number = 0;

    private _isDisposed: boolean = false;
    //#endregion Fieldes

    //#region Properties
    private get indent(): string
    {
        let _indent: string = "";
        for (let i: number = 0; i < this._indentLevel; i++)
        {
            _indent += "  ";
        };
        return _indent;
    }

    public get isActiveTraceLog(): boolean
    {
        return this._isActiveLogging && this._isActiveTraceLog;
    }
    public get isActiveDebugLog(): boolean
    {
        return this._isActiveLogging && this._isActiveDebugLog;
    }
    public get isActiveInfoLog(): boolean
    {
        return this._isActiveLogging && this._isActiveInfoLog;
    }
    public get isActiveWarnLog(): boolean
    {
        return this._isActiveLogging && this._isActiveWarnLog;
    }
    public get isActiveErrorLog(): boolean
    {
        return this._isActiveLogging && this._isActiveErrorLog;
    }
    public get isActiveFetalLog(): boolean
    {
        return this._isActiveLogging && this._isActiveFetalLog;
    }
    public get isActiveLogging(): boolean
    {
        return this._isActiveLogging;
    }

    public get isDisposed(): boolean
    {
        return this._isDisposed;
    }
    //#endregion Properties

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Constructor
    /**
     * Logger Service
     */
    public constructor(profile?: string)
    {
        if (profile == undefined || profile == null || profile.trim() == "")
        {
            this._profileName = "";
            this._profileStarted = false;
            this._profileName = "";
        }
        else
        {
            this._profileName = profile.trim();

            if (this.isActiveLogging)
            {
                console.profile(this._profileName);
                this._profileStarted = true;

                const logHeader = this.generateHeader();

                console.log(`
${logHeader}
>>>>>>>>>>>>>>>>>>>>>> ${this._profileName} <<<<<<<<<<<<<<<<<<<<<<

Created new profile of ${this._profileName}

`);
            }
        }
    }

    public destructor(): void
    {
       this.dispose();
    }

    public [Symbol.asyncDispose](): PromiseLike<void>
    {
        this.dispose();
        return Promise.resolve();;
    }
    //#endregion Constructor

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Private Methods
    /**
     * Generate log header
     * @param message
     * @param callSite
     * @returns Log content text
     */
    private generateHeader(): string
    {
        let logHeader = `Setak | Setak.IMS.Blazor.UI.JS`;
        if (this._profileName != "")
        {
            logHeader += ` | ${this._profileName}`;
        }
        logHeader += `\r\n`;

        return logHeader;
    }

    /**
     * Generate log call site
     * @param callSite
     * @returns Log content text
     */
    private generateCallSite(callSite?: string): string
    {
        let logCallSite = "";
        if (callSite != null && callSite.trim() != "")
        {
            logCallSite += `CallSite: ${callSite.trim()}`;
            logCallSite += `\r\n`;
        }

        return logCallSite;
    }

    /**
     * Generate log message
     * @param message
     * @returns Log content text
     */
    private generateMessage(message?: string): string
    {
        let logMessage= "";
        if (message != null && message.trim() != "")
        {
            logMessage += `Message: ${message.trim()}`;
            logMessage += `\r\n`;
        }

        return logMessage;
    }

    /**
     * Generate log content
     * @param message
     * @param callSite
     * @returns Log content text
     */
    private generateLogContent(message: string, callSite?: string): string
    {
        const logHeader = this.generateHeader();
        const logCallSite = this.generateCallSite(callSite);
        const logMessage = this.generateMessage(callSite);

        return logHeader + logCallSite + logMessage;
    }
    //#endregion Private Methods

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Public Methods
    /**
     * Start executing method
     * @param methodName
     */
    public startMethod(methodName: string): void
    {
        if (this.isActiveLogging)
        {
            this._indentLevel++;
            this._methodName = methodName.trim();

            const logContent = this.generateLogContent(`Method '${this._methodName}' started`);

            console.group(logContent);
        }
    }

    /**
     * Method executed
     * @param methodName
     */
    public endMethod(methodName: string): void
    {
        if (this.isActiveLogging)
        {
            const logContent = this.generateLogContent(`Method '${this._methodName}' ends`);

            console.log(logContent);
            console.groupEnd();

            this._indentLevel--;
            this._methodName = "";
        }
    }

    /**
     * Start sub section in method
     * @param sectionName
     */
    public startSection(sectionName: string): void
    {
        if (this.isActiveLogging)
        {
            this._indentLevel++;
            if (this._methodName == "")
            {
                this._sectionName = sectionName.trim();
            }
            else
            {
                this._sectionName = `${this._methodName}.${sectionName.trim()}`;
            }

            const logContent = this.generateLogContent(`Section '${this._sectionName}' started`);

            console.group(logContent);
        }
    }

    /**
     * Ends sub section in method
     * @param sectionName
     */
    public endSection(sectionName: string): void
    {
        if (this.isActiveLogging)
        {
            const logContent = this.generateLogContent(`Section '${this._sectionName}' ends`);

            console.group(logContent);
            console.groupEnd();

            this._indentLevel--;
            this._sectionName = "";
        }
    }

    /**
     * Writing information logs to the console
     * @param data
     * @param callSite
     */
    public info<T>(data: T, callSite?: string): void
    {
        if (this._isActiveInfoLog)
        {
            const logHeader = this.generateHeader();
            const logCallSite = this.generateCallSite(callSite);
            
            console.info(logHeader, logCallSite,`\r\nMessage: `, data);
        }
    }

    /**
     * Writing error logs to the console
     * @param data
     * @param callSite
     */
    public error<T>(data: T, callSite?: string): void
    {
        if (this._isActiveErrorLog)
        {
            const logHeader = this.generateHeader();
            const logCallSite = this.generateCallSite(callSite);
            
            console.error(logHeader, logCallSite,`\r\nMessage: `, data);
        }
    }

    /**
     * Writing fetal logs to the console
     * @param data
     * @param callSite
     */
    public fetal<T>(data: T, callSite?: string): void
    {
        if (this._isActiveFetalLog)
        {
            const logHeader = this.generateHeader();
            const logCallSite = this.generateCallSite(callSite);
            
            console.error(logHeader, logCallSite,`\r\nMessage: `, data);
        }
    }

    /**
     * Writing warning logs to the console
     * @param data
     * @param callSite
     */
    public warn<T>(data: T, callSite?: string): void
    {
        if (this._isActiveWarnLog)
        {
            const logHeader = this.generateHeader();
            const logCallSite = this.generateCallSite(callSite);
            
            console.warn(logHeader, logCallSite,`\r\nMessage: `, data);
        }
    }

    /**
     * Writing debug logs to the console
     * @param data
     * @param callSite
     */
    public debug<T>(data: T, callSite?: string): void
    {
        if (this._isActiveDebugLog)
        {
            const logHeader = this.generateHeader();
            const logCallSite = this.generateCallSite(callSite);
            
            console.debug(logHeader, logCallSite,`\r\nMessage: `, data);
        }
    }

    /**
     * Writing trace logs to the console
     * @param data
     * @param callSite
     */
    public trace<T>(data: T, callSite?: string): void
    {
        if (this._isActiveTraceLog)
        {
            const logHeader = this.generateHeader();
            const logCallSite = this.generateCallSite(callSite);
            
            console.trace(logHeader, logCallSite,`\r\nMessage: `, data);
        }
    }

    public dispose(): void
    {
        if (!this._isDisposed)
        {
            this._isDisposed = true;

            if (this._isActiveLogging && this._profileStarted)
            {
                const logHeader = this.generateHeader();

                console.log(`
${logHeader}
Disposed profile ${this._profileName}

==================================================================

`);
                console.profileEnd(this._profileName);
                this._profileStarted = false;
            }
        }
    }
    //#endregion Public Methods
}