import { DynamicFormLocale } from "../types/dynamic-form-locale";
import { editorLocalization, setupLocale } from "survey-creator-core";
import englishStrings from "../../data/i18n/creator/englishStrings.json";
import persianStrings from "../../data/i18n/creator/persianStrings.json";

class CreatorLocalization implements AsyncDisposable
{
    //#region Fieldes
    private _isInitilized: boolean = false;
    private _isDisposed: boolean = false;
    //#endregion Fieldes

    //#region Properties
    public get defaultLocale(): DynamicFormLocale
    {
        return (editorLocalization.defaultLocale == "fa" ? "fa" : "en");
    }

    public get currentLocale(): DynamicFormLocale
    {
        return (editorLocalization.currentLocale == "fa" ? "fa" : "en");
    }

    public get isRTL(): boolean
    {
        return (editorLocalization.currentLocale == "fa" ? true : false);
    }

    public get isDisposed(): boolean
    {
        return this._isDisposed;
    }
    //#endregion Properties

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Constructor
    public constructor()
    {
        this.setupCustomLocales();
        this.initialize();
    }

    public destructor(): void
    {
        if (!this._isDisposed)
        {
            this._isDisposed = true;
        }
    }

    public [Symbol.asyncDispose](): PromiseLike<void>
    {
        this.destructor();
        return null;
    }
    //#endregion Constructor

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Private Methods
    private setupCustomLocales(): void
    {
        setupLocale({ localeCode: "en", strings: englishStrings });
        setupLocale({ localeCode: "fa", strings: persianStrings });
    }

    private initialize(): void
    {
        if (this._isInitilized)
        {
            return;
        }

        this._isInitilized = true;

        editorLocalization.defaultLocale = "en";
        editorLocalization.currentLocale = null;
    }
    //#endregion Private Methods

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Public Methods
    public changeDefaultLocale(locale: DynamicFormLocale): void
    {
        const strLocale = locale.toLowerCase();
        if (strLocale != editorLocalization.defaultLocale)
        {
            editorLocalization.defaultLocale = strLocale;
        }
    }

    public changeCurrentLocale(locale: DynamicFormLocale): void
    {
        const strLocale = locale.toLowerCase();
        if (strLocale != editorLocalization.currentLocale)
        {
            editorLocalization.currentLocale = strLocale;
        }
    }

    public clearCurrentLocale(): void
    {
        editorLocalization.currentLocale = null;
    }

    public dispose(): void
    {
        this.destructor();
    }
    //#endregion Public Methods
}

const creatorLocalization: CreatorLocalization = new CreatorLocalization();
export { creatorLocalization };