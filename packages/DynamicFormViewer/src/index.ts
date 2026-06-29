import {Logger} from "commons-utilities/services";
import {ComponentCollection, ITheme, settings, Serializer, Model} from "survey-core";
import {renderSurvey} from "survey-js-ui";
import surveyThemes from "survey-core/themes";

import "dynamic-form-shared/configs/global-settings.ts";
import "../../dynamic-form-shared/properties/register.ts";
import "../../dynamic-form-shared/functions/register.ts";
import {viewerLocalization} from "../../dynamic-form-shared/localization/viewer/index.ts";
import {ThemeType} from "../../dynamic-form-shared/types/theme-type.ts";
import sampleJson from "../../dynamic-form-shared/data/samples/testDraft.json";
// import viewerCustomThemeFlatLight from "../../dynamic-form-shared/data/theme/viewer/custom-flat-light-panelless.json";
// import viewerCustomThemeFlatDark from "../../dynamic-form-shared/data/theme/viewer/custom-flat-dark-panelless.json";
import viewerCustomThemePlainLight from "../../dynamic-form-shared/data/theme/viewer/custom-plain-light-panelless.json";
import viewerCustomThemePlainDark from "../../dynamic-form-shared/data/theme/viewer/custom-plain-dark-panelless.json";
import "survey-core/survey-core.fontless.min.css";
import "./styles.css";
import {CustomComponents} from "../../dynamic-form-shared/types/expression.tsx";

/**
 * View dynamic form created by dynamic form creator
 */
export class DynamicFormViewer implements AsyncDisposable {
    //#region Fieldes
    public static readonly componentName: string = "DynamicFormViewer";

    private readonly _logger: Logger;
    private readonly _dynamicFormServiceUrl: string = location.origin + "/api/DynamicsForm";
    private readonly _dotnetReference: any;
    private readonly _dynamicFormId: bigint;
    private readonly _entityId: bigint;
    private _customComponents!: CustomComponents;
    private _viewer: Model;
    private _resultData: any = [];
    private _isDisposed: boolean = false;
    //#endregion Fieldes

    //#region Properties
    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    //#endregion Definations

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Constructor
    /**
     * Dynamic Form Viewer
     *
     * Dynamic form id to load/save form structer
     * @param {bigint} dynamicFormId
     *
     * Entity id to load/save form data
     * @param {bigint} entityId
     */
    public constructor(dotnetReference: any, dynamicFormId: bigint, entityId: bigint) {
        this._logger = new Logger(DynamicFormViewer.componentName);

        this._dynamicFormServiceUrl = location.origin + "/api/DynamicsForm";

        this._dotnetReference = dotnetReference;
        this._dynamicFormId = dynamicFormId;
        this._entityId = entityId;

        this.initialize();
        this.bindEvents();
    }

    public destructor(): void {
        this.dispose();
    }

    public [Symbol.asyncDispose](): PromiseLike<void> {
        this.dispose();

        return Promise.resolve();
    }

    //#endregion Constructor

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Private Methods
    private initialize(): void {
        const methodName: string = "initialize";

        this._logger.startMethod(methodName);

        try {
            viewerLocalization.changeCurrentLocale("fa");

            this._viewer = new Model();
            this._viewer.locale = "fa";
            this._viewer.localeChanged();
            this._viewer.locStrsChanged();

            this._viewer.addUsedLocales(["en", "fa"]);

            this._customComponents = new CustomComponents(this._viewer, ComponentCollection.Instance);
            this._customComponents.viewer = this._viewer;
            this._customComponents.InitFormulaQuestion();

            this.changeThemeByJson(viewerCustomThemePlainLight as ITheme);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    private bindEvents(): void {
        const methodName: string = "bindEvents";

        this._logger.startMethod(methodName);

        /*
        //Client-Side Validation
        this._viewer.onValidateQuestion.add((survey: any, options: { name: string; value: string; error: string; }) =>
        {
            const sectionName: string = "onValidateQuestion";

            this._logger.startSection(sectionName);

            try
            {
                // if (options.name == "GenderType")
                // {
                //     if (options.value != "M" && options.value != "F")
                //     {
                //         options.error = 'Your answer must M or F';
                //     }
                // }
            }
            catch (err)
            {
                this._logger.error(err);

                throw err;
            }
            finally
            {
                this._logger.endMethod(methodName);
            }
        });
         */

        /*
        //Server-Side Validation
        this._viewer.onServerValidateQuestions.add(this.validateCountry);
        */

        /*
        this.viewer.onValueChanging.add((survey: any, { name, question, oldValue, value }: any) => {
            console.log(`The ${name} question value is about to change from ${oldValue} to ${value}.`);
            // You can redefine the `value` argument if you want to change the question value:
            // value = myNewValue;
        });
        */

        //this.viewer.onUIStateChanged.add(this.saveSurveyUIState);

        this._viewer.onComplete.add(async (survey: Model, options) => {
            const sectionName: string = "onValidateQuestion";

            this._logger.startSection(sectionName);

            try {
                options.showSaveInProgress();

                //******************************************

                for (const key in this._viewer.data) {
                    const question = this._viewer.getQuestionByName(key);

                    if (question) {
                        const item = {
                            name: key,
                            value: question.value,
                            title: question.displayValue,
                            displayValue: question.displayValue
                        };

                        this._resultData.push(item);
                    }
                }

                const dataText: string = JSON.stringify(this._viewer.data);
                const resultText: string = JSON.stringify(this._resultData);

                if (this._dotnetReference != null) {
                    this._dotnetReference.invokeMethodAsync("SaveFormResultHandlerAsync", dataText, resultText);
                }

                options.clearSaveMessages();

                return Promise.resolve();

                //******************************************

                //try {
                //    await this.saveSurveyResultsAsync(survey.data);

                //    options.showSaveSuccess();
                //    // options.clearSaveMessages();

                //} catch (error: any) {
                //    options.showSaveError();
                //}
            } catch (err) {
                this._logger.error(err);

                throw err;
            } finally {
                this._logger.endMethod(methodName);
            }
        });

        this._logger.endMethod(methodName);


        this._viewer.onValueChanged.add(this._customComponents.CalculateExpression);
        // this._viewer.onValueChanged.add((sender: any, options: any) => {
        //     try {
        //         alert('2222222222');
        //         console.log(`The question "${options.name}" changed to:`, options.value);
        //         // You can perform any logic here based on the changed question
        //
        //         let question = options.question;
        //
        //         console.log(`question PropertyValue: "${question.getPropertyValue()}" `);
        //     } catch (err) {
        //         console.log(err);
        //
        //     }
        //
        // });
        // this._viewer.onPropertyChanged.add(this._customComponents.CalculateExpression);
        // this._viewer.onUIStateChanged.add(this._customComponents.CalculateExpression);

        this._viewer.onQuestionAdded.add((_, options) => {
            
            const q = options.question;

            q.title = "Question " + (Math.floor(Math.random() * 100) + 1);

        });
    }

    private validateCountry(survey: any, {data, errors, complete}: any) {
        const methodName: string = "validateCountry";

        this._logger.startMethod(methodName);

        try {
            const countryName = data["country"];
            if (!countryName) {
                complete();
                return;
            }

            fetch("/api/CountriesExample?name=" + countryName)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Status: ${response.status}, Error: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const found = data.length > 0;
                    if (!found) {
                        errors["country"] = "Country is not found";
                    }
                    complete();
                })
                .catch(error => {
                    throw new Error(error);
                });
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    private saveSurveyUIState(survey: any): void {
        const methodName: string = "saveSurveyUIState";

        this._logger.startMethod(methodName);

        //const uiState = JSON.stringify(this.viewer);

        this._logger.endMethod(methodName);
    }

    /**
     * Send Get Request To Server
     * @param url
     * @returns Response json
     * @throws Error
     */
    private async GetAsync(url: string): Promise<object> {
        const methodName: string = "GetAsync";

        this._logger.startMethod(methodName);

        try {
            const response = await fetch(url, {
                method: "GET"
            });

            if (!response.ok) {
                throw new Error(`Status: ${response.status}, Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    };

    //#endregion Private Methods

    //-------------------------------------------------------------------------------------------------------------------------

    //#region Public Methods
    /**
     * Html tag id to convert to viewer,
     * @param {string} elementId
     */
    public renderElement(elementId: string): void {
        const methodName: string = "renderElement";

        this._logger.startMethod(methodName);

        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`elementId '${elementId}' not exist`);
            }

            renderSurvey(this._viewer, element);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public async loadStructureFromApiAsync(): Promise<void> {
        const methodName: string = "loadStructureFromApiAsync";

        this._logger.startMethod(methodName);

        try {
            const structureJson: any = await this.GetAsync(this._dynamicFormServiceUrl + "/DynamicsFormStructureJson/" + this._dynamicFormId.toString());

            this.loadStructureDirectlyFromJson(structureJson);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public async loadStructureFromApi2Async(endpoint: string): Promise<void> {
        const methodName: string = "loadStructureFromApiAsync";

        this._logger.startMethod(methodName);

        try {
            const structureJson: any = await this.GetAsync(endpoint);

            this.loadStructureDirectlyFromJson(structureJson);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public loadStructureDirectlyFromString(structureString: string): void {
        const methodName: string = "loadStructureDirectlyFromString";

        this._logger.startMethod(methodName);

        try {
            if (structureString == null || structureString.trim() == "") {
                throw new Error("Structure string has empty");
            }

            let structureJson;
            try {
                structureJson = JSON.parse(structureString);
            } catch (err) {
                this._logger.error(err);

                throw new Error("Structure string format is not valid");
            }

            this.loadStructureDirectlyFromJson(structureJson);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public loadStructureDirectlyFromJson(structureJson: object): void {
        const methodName: string = "loadStructureDirectlyFromJson";

        this._logger.startMethod(methodName);

        try {
            if (structureJson == null) {
                throw new Error("Structure json has empty");
            }

            this._viewer.beginLoading();
            this._viewer.fromJSON(structureJson);
            this._viewer.endLoading();
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public async loadDataFromServerAsync(entityId: number): Promise<void> {
        const methodName: string = "loadDataFromServerAsync";

        this._logger.startMethod(methodName);

        try {
            const dataJson = await this.GetAsync(this._dynamicFormServiceUrl + "/DynamicsFormDataJson/" + this._dynamicFormId.toString() + "/" + entityId.toString());

            this.loadDataDirectlyFromJson(dataJson);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public loadDataDirectlyFromString(dataString: string): void {
        const methodName: string = "loadDataDirectlyFromString";

        this._logger.startMethod(methodName);

        try {
            if (dataString == null || dataString.trim() == "") {
                throw new Error("Data string has empty");
            }

            let dataJson;
            try {
                dataJson = JSON.parse(dataString);
            } catch (err) {
                this._logger.error(err);

                throw new Error('Data string format is not valid cause: '+err);
            }

            this.loadDataDirectlyFromJson(dataJson);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public loadDataDirectlyFromJson(dataJson: object): void {
        const methodName: string = "loadDataDirectlyFromJson";

        this._logger.startMethod(methodName);

        try {
            if (dataJson == null || dataJson == "") {
                throw new Error("Data json has empty");
            }

            this._viewer.data = dataJson;
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public getFormDataAsString(): string {
        const methodName: string = "getFormDataAsString";

        this._logger.startMethod(methodName);

        try {
            const data: object = this.getFormDataAsJson();

            const resultAsString: string = JSON.stringify(data);

            return resultAsString;
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public getFormDataAsJson(): object {
        const methodName: string = "getFormDataAsJson";

        this._logger.startMethod(methodName);

        try {
            //const data = this.viewer.getData({ includePages: true, includePanels: true });

            const data: object = this._viewer.data;

            return data;
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public async saveTempResultsAsync(): Promise<void> {
        const methodName: string = "saveTempResultsAsync";

        this._logger.startMethod(methodName);

        try {
            const data: string = this.getFormDataAsString();

            const headers = new Headers({"Content-Type": "application/json; charset=utf-8"});
            const response = await fetch(this._dynamicFormServiceUrl + "/SaveTempResults", {
                method: 'POST',
                headers: headers,
                body: data
            });

            if (!response.ok) {
                throw new Error(`Status: ${response.status}, Error: ${response.statusText}`);
            }
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public async saveFinalResultsAsync(): Promise<void> {
        const methodName: string = "saveFinalResultsAsync";

        this._logger.startMethod(methodName);

        try {
            const data: string = this.getFormDataAsString();

            const headers = new Headers({"Content-Type": "application/json; charset=utf-8"});
            const response = await fetch(this._dynamicFormServiceUrl + "/SaveFinalResults/", {
                method: 'POST',
                headers: headers,
                body: data
            });

            if (!response.ok) {
                throw new Error(`Status: ${response.status}, Error: ${response.statusText}`);
            }
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public changeThemeType(themeType: ThemeType): void {
        const methodName: string = "changeThemeType";

        this._logger.startMethod(methodName);

        try {
            let theme: ITheme;
            if (themeType == "Light") {
                theme = viewerCustomThemePlainLight as ITheme;
            } else {
                theme = viewerCustomThemePlainDark as ITheme;
            }

            this.changeThemeByJson(theme);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public changeThemeByName(themeName: string): void {
        const methodName: string = "changeThemeByName";

        this._logger.startMethod(methodName);

        try {
            const theme: ITheme = surveyThemes[themeName];
            this.changeThemeByJson(theme);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public changeThemeByJson(themeJson: ITheme): void {
        const methodName: string = "changeThemeByJson";

        this._logger.startMethod(methodName);

        try {
            this._viewer.applyTheme(themeJson);
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public getPlainData(): any {
        const methodName: string = "getPlainData";

        this._logger.startMethod(methodName);

        try {
            const plainData = this._viewer.getPlainData();

            return plainData;
        } catch (err) {
            this._logger.error(err);

            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public dispose(): void {
        if (!this._isDisposed) {
            this._isDisposed = true;

            if (!viewerLocalization.isDisposed) {
                viewerLocalization.dispose();
            }

            if (!this._viewer.isDisposed) {
                this._viewer.dispose();
            }

            if (!this._logger.isDisposed) {
                this._logger.dispose();
            }
        }
    }

    //#endregion Public Methods
}

export function dynamicFormViewer(dotnetReference: any, dynamicFormId: bigint, entityId: bigint): DynamicFormViewer {
    return new DynamicFormViewer(dotnetReference, dynamicFormId, entityId);
}

export function getSampleJson(): any {
    return sampleJson;
}
