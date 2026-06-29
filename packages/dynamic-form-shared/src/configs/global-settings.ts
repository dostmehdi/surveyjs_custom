import { settings } from "survey-core";
import acceptedFileCategories from "../../data/options/acceptedFileCategories.json";

settings.acceptedFileCategories = acceptedFileCategories;
settings.animationEnabled = true;

settings.comparator.trimStrings=true;
settings.comparator.caseSensitive=false;

settings.useLocalTimeZone = true;
settings.storeUtcDates = false;

settings.allowShowEmptyTitleInDesignMode = true;
settings.allowShowEmptyDescriptionInDesignMode = true;
settings.designMode.showEmptyTitles = true;
settings.designMode.showEmptyDescriptions = true;

settings.itemValueAlwaysSerializeText = true;
settings.serialization.itemValueSerializeDisplayText = true;

settings.localization.storeDuplicatedTranslations = false;

settings.web.encodeUrlParams = true;
settings.web.cacheLoadedChoices = true;
settings.web.disableQuestionWhileLoadingChoices = false;

settings.web.onBeforeRequestChoices = (_, options) =>
{
    const requestVerificationToken = "";
    if (options.request) {
        options.request.setRequestHeader("RequestVerificationToken", requestVerificationToken);
    }
    if (options.fetchOptions) {
        //options.fetchOptions.headers?.append("RequestVerificationToken", requestVerificationToken);
    }
};

//---------------------------------------------------------------------------------------------------------------------------------

//SurveyCreatorCore.AceJsonEditorModel.aceBasePath = "/lib/ace-builds/src-min-noconflict/";
//SurveyCreator.settings.designer.showAddQuestionButton = isAdmin;