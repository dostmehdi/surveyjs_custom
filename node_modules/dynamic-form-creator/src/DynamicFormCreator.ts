import { Logger } from "commons-utilities/services";
import { ITheme, settings, Serializer } from "survey-core";
import { 
    SurveyCreatorModel, 
    ICreatorTheme, 
    registerCreatorTheme, 
    registerSurveyTheme 
} from "survey-creator-core";
import { SurveyCreator, renderSurveyCreator } from "survey-creator-js";
import { DynamicFormType } from "../../dynamic-form-shared/types";
import "../../dynamic-form-shared/configs/index.ts";
import "../../dynamic-form-shared/properties/index.ts";
import "../../dynamic-form-shared/functions/index.ts";
import { viewerLocalization } from '../../dynamic-form-shared/localization/viewer';
import { creatorLocalization } from "../../dynamic-form-shared/localization/creator";
import { ThemeType } from "../../dynamic-form-shared/types/theme-type";
import viewerCustomThemeFlatLight from "../../dynamic-form-shared/data/theme/viewer/custom-flat-light-panelless.json";
import viewerCustomThemeFlatDark from "../../dynamic-form-shared/data/theme/viewer/custom-flat-dark-panelless.json";
import viewerCustomThemePlainLight from "../../dynamic-form-shared/data/theme/viewer/custom-plain-light-panelless.json";
import viewerCustomThemePlainDark from "../../dynamic-form-shared/data/theme/viewer/custom-plain-dark-panelless.json";
import defaultCreatorOptions from "../../dynamic-form-shared/data/options/creatorOptions.js";
import questionInputTypes from "../../dynamic-form-shared/data/toolbox/questionInputTypes.js";
import "survey-core/survey-core.fontless.min.css";
import "survey-creator-core/survey-creator-core.fontless.min.css";
import "./styles.css";

export class DynamicFormCreator {
    public static readonly componentName: string = "DynamicFormCreator";

    private readonly _logger: Logger;
    private readonly _dynamicFormServiceUrl: string;
    private _dotnetReference: any;
    private settings: any;
    private readonly _formType: DynamicFormType;
    private readonly _dynamicFormId?: bigint = undefined;
    private _creator!: SurveyCreator;
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
        this._creator.isRTL = true;
        this._creator.activeTab = "designer";
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
    }

    private manageToolbox(): void {
        const methodName: string = "manageToolbox";
        this._logger.startMethod(methodName);

        const toolbox = this._creator.toolbox;
        toolbox.forceCompact = false;

        // Remove unwanted question types
        const removeTypes = [
            questionInputTypes.ratingScale.type,
            questionInputTypes.fileUpload.type,
            questionInputTypes.html.type,
            questionInputTypes.expression.type,
            questionInputTypes.image.type,
            questionInputTypes.signature.type
        ];
        removeTypes.forEach(type => toolbox.removeItem(type));

        // Remove unwanted subtypes
        const singleTextInputItem = this._creator.toolbox.getItemByName(questionInputTypes.singleLineInput.type);
        const removeSubtypes = [
            questionInputTypes.singleLineInput.inputTypes.color,
            questionInputTypes.singleLineInput.inputTypes.date,
            questionInputTypes.singleLineInput.inputTypes.dateAndTime,
            questionInputTypes.singleLineInput.inputTypes.month,
            questionInputTypes.singleLineInput.inputTypes.phoneNumber,
            questionInputTypes.singleLineInput.inputTypes.url,
            questionInputTypes.singleLineInput.inputTypes.week
        ];
        removeSubtypes.forEach(subtype => singleTextInputItem.removeSubitem(subtype));

        // Set custom choices
        const newDefaultChoices: any[] = [];
        const choiceTypes = [
            questionInputTypes.checkboxes.type,
            questionInputTypes.radioButtonGroup.type,
            questionInputTypes.dropdown.type
        ];
        choiceTypes.forEach(type => {
            toolbox.getItemByName(type).json.choices = newDefaultChoices;
        });

        this._logger.endMethod(methodName);
    }

    private async GetAsync(url: string): Promise<object> {
        const methodName: string = "GetAsync";
        this._logger.startMethod(methodName);

        try {
            const response = await fetch(url, { method: "GET" });
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