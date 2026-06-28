import { Logger } from "commons-utilities/services";
import { settings, Serializer } from "survey-core";
import { SurveyCreator, renderSurveyCreator } from "survey-creator-js";
import "dynamic-form-shared/configs/global-settings";
import "dynamic-form-shared/configs/creator-settings";
import "dynamic-form-shared/properties/register";
import "dynamic-form-shared/functions/register";
import { viewerLocalization } from 'dynamic-form-shared/localization/viewer';
import { creatorLocalization } from "dynamic-form-shared/localization/creator";
import viewerCustomThemePlainLight from "dynamic-form-shared/data/theme/viewer/custom-plain-light-panelless.json";
import defaultCreatorOptions from "dynamic-form-shared/data/options/creatorOptions.js";
import questionInputTypes from "dynamic-form-shared/data/toolbox/questionInputTypes.js";
import "survey-core/survey-core.fontless.min.css";
import "survey-creator-core/survey-creator-core.fontless.min.css";
import "./styles.css";
export class DynamicFormCreator {
    get isDisposed() {
        return this._isDisposed;
    }
    constructor(dotnetReference, formType, dynamicFormId) {
        this._dynamicFormId = undefined;
        this._isDisposed = false;
        const methodName = "constructor";
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
    destructor() {
        this.dispose();
    }
    [Symbol.asyncDispose]() {
        this.dispose();
        return Promise.resolve();
    }
    initialize() {
        const methodName = "initModel";
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
        this.changeViewerThemeByJson(viewerCustomThemePlainLight);
        this._logger.endMethod(methodName);
    }
    bindEvents() {
        const methodName = "bindEvents";
        this._logger.startMethod(methodName);
        this._creator.onTranslationItemChanging.add((sender, option) => {
            const sectionName = "onTranslationItemChanging";
            this._logger.startSection(sectionName);
            const elementType = option.element.getType();
            if (elementType == "survey") {
                sender.isRTL = option.newText == "fa";
            }
            this._logger.endSection(sectionName);
        });
        this._logger.endMethod(methodName);
    }
    manageToolbox() {
        const methodName = "manageToolbox";
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
        const newDefaultChoices = [];
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
    async GetAsync(url) {
        const methodName = "GetAsync";
        this._logger.startMethod(methodName);
        try {
            const response = await fetch(url, { method: "GET" });
            if (!response.ok) {
                throw new Error(`Status: ${response.status}, Error: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    setDotNetReference(dotnetRef) {
        this._dotnetReference = dotnetRef;
    }
    getCreator() {
        this._creator.Serializer = Serializer;
        this.settings = settings;
        return this._creator;
    }
    getSerializer() {
        return Serializer;
    }
    getDotNetReference() {
        return this._dotnetReference;
    }
    addProperty(name, value) {
        Serializer.addProperty(name, value);
    }
    renderElement(elementId) {
        const methodName = "renderElement";
        this._logger.startMethod(methodName);
        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`elementId '${elementId}' not exist`);
            }
            renderSurveyCreator(this._creator, element);
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    changeViewerThemeType(themeType) {
        const strThemeType = themeType.toString().toLowerCase();
        if (this._creator.theme.colorPalette != strThemeType) {
            this._creator.theme.colorPalette = strThemeType;
        }
    }
    changeViewerThemeByJson(themeJson) {
        this._creator.applyTheme(themeJson);
    }
    changeCreatorThemeType(themeType) {
        if (themeType == "Light") {
            if (!this._creator.creatorTheme.isLight) {
                this._creator.creatorTheme.isLight = true;
            }
        }
        else {
            if (this._creator.creatorTheme.isLight) {
                this._creator.creatorTheme.isLight = false;
            }
        }
    }
    changeCreatorThemeByJson(themeJson) {
        this._creator.applyCreatorTheme(themeJson);
    }
    async loadStructureFromApiAsync() {
        const methodName = "loadStructureFromApiAsync";
        this._logger.startMethod(methodName);
        try {
            const structureJson = await this.GetAsync(this._dynamicFormServiceUrl + "/DynamicsFormStructureJson/" + this._dynamicFormId?.toString());
            this.loadStructureDirectlyFromJson(structureJson);
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    async loadStructureFromApi2Async(endpoint) {
        const methodName = "loadStructureFromApi2Async";
        this._logger.startMethod(methodName);
        try {
            const structureJson = await this.GetAsync(endpoint);
            this.loadStructureDirectlyFromJson(structureJson);
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    loadStructureDirectlyFromString(structureString) {
        const methodName = "loadStructureDirectlyFromString";
        this._logger.startMethod(methodName);
        try {
            if (structureString == null || structureString.trim() == "") {
                throw new Error("Structure string has empty");
            }
            let structureJson;
            try {
                structureJson = JSON.parse(structureString);
            }
            catch (err) {
                this._logger.error(err);
                throw new Error("Structure string format is not valid");
            }
            this.loadStructureDirectlyFromJson(structureJson);
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    loadStructureDirectlyFromJson(structureJson) {
        const methodName = "loadStructureDirectlyFromJson";
        this._logger.startMethod(methodName);
        try {
            if (structureJson == null) {
                throw new Error("Structure json has empty");
            }
            this._creator.JSON = structureJson;
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    getFormStructureAsJson() {
        const methodName = "getFormStructureAsJson";
        this._logger.startMethod(methodName);
        try {
            return this._creator.JSON;
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    getFormStructureAsString() {
        const methodName = "getFormStructureAsString";
        this._logger.startMethod(methodName);
        try {
            return JSON.stringify(this.getFormStructureAsJson());
        }
        catch (err) {
            this._logger.error(err);
            throw err;
        }
        finally {
            this._logger.endMethod(methodName);
        }
    }
    dispose() {
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
DynamicFormCreator.componentName = "DynamicFormCreator";
export function dynamicFormCreator(dotnetReference, formType, dynamicFormId) {
    return new DynamicFormCreator(dotnetReference, formType, dynamicFormId);
}
