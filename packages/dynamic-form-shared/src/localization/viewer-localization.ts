import { DynamicFormLocale } from "../types/dynamic-form-locale";
import { surveyLocalization, setupLocale } from "survey-core";
import englishStrings from "../../data/i18n/viewer/englishStrings.json";
import persianStrings from "../../data/i18n/viewer/persianStrings.json";

class ViewerLocalization implements AsyncDisposable
{
    //#region Fieldes
    private readonly _supportedLocales: string[];
    private _isInitilized: boolean = false;
    private _isDisposed: boolean = false;
    //#endregion Fieldes

    //#region Properties
    public get supportedLocales(): string[]
    {
        return this._supportedLocales;
    }
    public get defaultLocale(): DynamicFormLocale
    {
        return (surveyLocalization.defaultLocale == "fa" ? "fa" : "en");
    }

    public get currentLocale(): DynamicFormLocale
    {
        return (surveyLocalization.currentLocale == "fa" ? "fa" : "en");
    }

    public get isRTL(): boolean
    {
        return (surveyLocalization.currentLocale == "fa" ? true : false);
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
        this._supportedLocales = ["en", "fa"];

        this.setupCustomLocales();
        this.initialize();
    }

    public destructor(): void
    {
        if (!this._isDisposed) {
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
        setupLocale({ localeCode: "en", strings: englishStrings, nativeName: "English", englishName: "English", rtl: false });
        setupLocale({ localeCode: "fa", strings: persianStrings, nativeName: "فارسی", englishName: "Persian", rtl: true });
    }

    private initialize(): void
    {
        if (this._isInitilized) {
            return;
        }

        this._isInitilized = true;

        surveyLocalization.supportedLocales = this._supportedLocales;
        surveyLocalization.defaultLocale = "en";
        surveyLocalization.currentLocale = null;
    }
    //#endregion Private Methods

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Public Methods
    public changeDefaultLocale(locale: DynamicFormLocale): void
    {
        const strLocale = locale.toLowerCase();
        if (strLocale != surveyLocalization.defaultLocale) {
            surveyLocalization.defaultLocale = strLocale;
        }
    }

    public changeCurrentLocale(locale: DynamicFormLocale): void
    {
        const strLocale = locale.toLowerCase();
        if (strLocale != surveyLocalization.currentLocale) {
            surveyLocalization.currentLocale = strLocale;
        }
    }

    public clearCurrentLocale(): void
    {
            surveyLocalization.currentLocale = null;
    }

    public dispose(): void
    {
        this.destructor();
    }
    //#endregion Public Methods
}

const viewerLocalization: ViewerLocalization = new ViewerLocalization();
export { viewerLocalization };

//const surveyLocaleEn = surveyLocalization.getLocaleStrings("en");

//import { getLocaleStrings } from "survey-core";
//const surveyLocaleEn = getLocaleStrings("en");

//surveyLocaleEn.pagePrevText = "Back";
//surveyLocaleEn.pageNextText = "Forward";
//surveyLocaleEn.completeText = "Send";