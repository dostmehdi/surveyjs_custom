import {Logger} from "commons-utilities/services";
import {ComponentCollection, ITheme, settings, Serializer, Model} from "survey-core";
import {
    SurveyCreatorModel,
    ICreatorTheme,
    registerCreatorTheme,
    registerSurveyTheme
} from "survey-creator-core";
import {SurveyCreator, renderSurveyCreator} from "survey-creator-js";
import {DynamicFormType} from "../../dynamic-form-shared/types";
import "../../dynamic-form-shared/configs/index.ts";
import "../../dynamic-form-shared/properties/index.ts";
import "../../dynamic-form-shared/functions/index.ts";
import {viewerLocalization} from '../../dynamic-form-shared/localization/viewer';
import {creatorLocalization} from "../../dynamic-form-shared/localization/creator";
import {ThemeType} from "../../dynamic-form-shared/types/theme-type";
import viewerCustomThemeFlatLight from "../../dynamic-form-shared/data/theme/viewer/custom-flat-light-panelless.json";
import viewerCustomThemeFlatDark from "../../dynamic-form-shared/data/theme/viewer/custom-flat-dark-panelless.json";
import viewerCustomThemePlainLight from "../../dynamic-form-shared/data/theme/viewer/custom-plain-light-panelless.json";
import viewerCustomThemePlainDark from "../../dynamic-form-shared/data/theme/viewer/custom-plain-dark-panelless.json";
import defaultCreatorOptions from "../../dynamic-form-shared/data/options/creatorOptions.js";
import "survey-core/survey-core.fontless.min.css";
import "survey-creator-core/survey-creator-core.fontless.min.css";
import "./styles.css";
import {CustomComponents} from "../../dynamic-form-shared/types/expression.tsx";

// Import the expression creator component (side-effect: registers the custom question and toolbox item)


export class DynamicFormCreator {
    public static readonly componentName: string = "DynamicFormCreator";

    private readonly _logger: Logger;
    private readonly _dynamicFormServiceUrl: string;
    private _dotnetReference: any;
    private settings: any;
    private readonly _formType: DynamicFormType;
    private readonly _dynamicFormId?: bigint = undefined;
    private _creator!: SurveyCreator;
    private _customComponents!: CustomComponents;
    private _isDisposed: boolean = false;

    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    public constructor(dotnetReference: any, formType: DynamicFormType, dynamicFormId?: bigint) {
        const methodName: string = "constructor";

        this._logger = new Logger(DynamicFormCreator.componentName);

        this._dynamicFormServiceUrl = location.origin + "/api/DynamicsForm";

        this._dotnetReference = dotnetReference;
        this._formType = formType;
        this._dynamicFormId = dynamicFormId;

        this.initialize();
        this.bindEvents();
        this.manageToolbox();

        // Ensure the custom expression toolbox item is present after toolbox management
        try {
            // this.ensureExpressionToolboxItem();
        } catch (e) {
            this._logger.error(e);
        }

        this._logger.endMethod(methodName);
    }

    public destructor(): void {
        this.dispose();
    }

    public [Symbol.asyncDispose](): PromiseLike<void> {
        this.dispose();
        return Promise.resolve();
    }

    private initialize(): void {
        const methodName: string = "initModel";
        this._logger.startMethod(methodName);

        viewerLocalization.changeCurrentLocale("fa");
        creatorLocalization.changeCurrentLocale("fa");

        this._creator = new SurveyCreator(defaultCreatorOptions);
        // this._creator.survey = new Model("{}");

        this._customComponents = new CustomComponents(this._dotnetReference, ComponentCollection.Instance);
        this._customComponents.creator = this._creator;
        
        this._customComponents.InitFormulaQuestion();

        this._creator.isRTL = true;
        this._creator.activeTab = "designer";

        // Register SurveyJS custom questions (advanced calculator + dynamic list controls)

        this._creator.startEditTitleOnQuestionAdded = true;
        this._creator.allowChangeThemeInPreview = true;
        this._creator.previewAllowSelectLanguage = true;
        this._creator.showDefaultLanguageInPreviewTab = true;
        this._creator.showDefaultLanguageInTestSurveyTab = true;
        this._creator.addUsedLocales(["fa", "en"]);
        this._creator.translationLocalesOrder = ["fa", "en"];

        this.changeViewerThemeByJson(viewerCustomThemePlainLight as ITheme);

        this._logger.endMethod(methodName);

    }

    private bindEvents(): void {
        const methodName: string = "bindEvents";
        this._logger.startMethod(methodName);

        this._creator.onTranslationItemChanging.add((sender: SurveyCreatorModel, option) => {
            const sectionName: string = "onTranslationItemChanging";
            this._logger.startSection(sectionName);

            const elementType = option.element.getType();
            if (elementType == "survey") {
                sender.isRTL = option.newText == "fa";
            }

            this._logger.endSection(sectionName);
        });

        this._logger.endMethod(methodName);


        // this._creator.survey.onValueChanged.add(this._customComponents.CalculateExpression);
        this._creator.survey.onValueChanged.add((sender: any, options: any) => {
            try {
                alert('1122ww');
                console.log(`The question "${options.name}" changed to:`, options.value);
                // You can perform any logic here based on the changed question

                let question = options.question;

                console.log(`question PropertyValue: "${question.getPropertyValue()}" `);
            } catch (err) {
                console.log(err);

            }

        });
        this._creator.survey.onPropertyChanged.add(this._customComponents.CalculateExpression);
        // this._creator.survey.onUIStateChanged.add(this._customComponents.CalculateExpression);

        this._creator.onQuestionAdded.add((_, options) => {
            if (options.reason === "ELEMENT_CONVERTED")
                return;

            const q = options.question;

            q.title = "Question " + (Math.floor(Math.random() * 100) + 1);

        });


    }

    private manageToolbox(): void {
        const methodName: string = "manageToolbox";
        this._logger.startMethod(methodName);

        const toolbox = this._creator.toolbox;
        toolbox.forceCompact = false;


        // Set custom choices
        const newDefaultChoices: any[] = [];


        this._logger.endMethod(methodName);
    }

    /**
     * Ensure the custom `expression` toolbox item is present.
     * Called after manageToolbox to re-add the item if something removed it.
     */
    private ensureExpressionToolboxItem(): void {
        const toolbox = this._creator.toolbox;
        if (!toolbox) return;

        // const exists = toolbox.getItemByName?.("expression");
        // if (!exists) {
        // toolbox.addItem({
        //     name: "expression",
        //     title: "Expression",
        //     iconName: "icon-calculator",
        //     category: "Custom",
        //     json: { type: "expression", name: "expression", title: "Expression" }
        // });
        // }
    }

    private async GetAsync(url: string): Promise<object> {
        const methodName: string = "GetAsync";
        this._logger.startMethod(methodName);

        try {
            const response = await fetch(url, {method: "GET"});
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
    }

    public setDotNetReference(dotnetRef: any): void {
        this._dotnetReference = dotnetRef;
    }

    public getCreator(): SurveyCreator {
        (this._creator as any).Serializer = Serializer;
        this.settings = settings;
        return this._creator;
    }

    public getSerializer(): any {
        return Serializer;
    }

    public getDotNetReference(): any {
        return this._dotnetReference;
    }

    public addProperty(name: string, value: any): void {
        Serializer.addProperty(name, value);
    }

    public renderElement(elementId: string): void {
        const methodName: string = "renderElement";
        this._logger.startMethod(methodName);

        try {
            const element = document.getElementById(elementId) as HTMLElement | null;
            if (!element) {
                throw new Error(`elementId '${elementId}' not exist`);
            }
            renderSurveyCreator(this._creator, element);
        } catch (err) {
            this._logger.error(err);
            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public changeViewerThemeType(themeType: ThemeType): void {
        const strThemeType: string = themeType.toString().toLowerCase();
        if (this._creator.theme.colorPalette != strThemeType) {
            this._creator.theme.colorPalette = strThemeType;
        }
    }

    public changeViewerThemeByJson(themeJson: ITheme): void {
        this._creator.applyTheme(themeJson);
    }

    public changeCreatorThemeType(themeType: ThemeType): void {
        if (themeType == "Light") {
            if (!this._creator.creatorTheme.isLight) {
                this._creator.creatorTheme.isLight = true;
            }
        } else {
            if (this._creator.creatorTheme.isLight) {
                this._creator.creatorTheme.isLight = false;
            }
        }
    }

    public changeCreatorThemeByJson(themeJson: ICreatorTheme): void {
        this._creator.applyCreatorTheme(themeJson);
    }

    public async loadStructureFromApiAsync(): Promise<void> {
        const methodName: string = "loadStructureFromApiAsync";
        this._logger.startMethod(methodName);

        try {
            const structureJson: any = await this.GetAsync(
                this._dynamicFormServiceUrl + "/DynamicsFormStructureJson/" + this._dynamicFormId?.toString()
            );
            this.loadStructureDirectlyFromJson(structureJson);
        } catch (err) {
            this._logger.error(err);
            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public async loadStructureFromApi2Async(endpoint: string): Promise<void> {
        const methodName: string = "loadStructureFromApi2Async";
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
            this._creator.JSON = structureJson;
        } catch (err) {
            this._logger.error(err);
            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public getFormStructureAsJson(): object {
        const methodName: string = "getFormStructureAsJson";
        this._logger.startMethod(methodName);

        try {
            return this._creator.JSON;
        } catch (err) {
            this._logger.error(err);
            throw err;
        } finally {
            this._logger.endMethod(methodName);
        }
    }

    public getFormStructureAsString(): string {
        const methodName: string = "getFormStructureAsString";
        this._logger.startMethod(methodName);

        try {
            return JSON.stringify(this.getFormStructureAsJson());
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

            if (!creatorLocalization.isDisposed) {
                creatorLocalization.dispose();
            }

            if (!this._creator.isDisposed || !this._creator.isCreatorDisposed) {
                this._creator.dispose();
            }

            if (!this._logger.isDisposed) {
                this._logger.dispose();
            }
        }
    }
}

export function dynamicFormCreator(
    dotnetReference: any,
    formType: DynamicFormType,
    dynamicFormId?: bigint
): DynamicFormCreator {
    return new DynamicFormCreator(dotnetReference, formType, dynamicFormId);
}