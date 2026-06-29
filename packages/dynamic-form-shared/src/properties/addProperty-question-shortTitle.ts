import { Serializer, surveyLocalization } from "survey-core";
import "./property-types/addPropertyType-shorttext";

// Add a custom property 'shortTitle' that uses the 'shorttext' editor
Serializer.addProperty("question", {
    name: "shortTitle",
    displayName: "Short Title",
    type: "shorttext",
    category: "general",
    isLocalizable: true,
    availableInMatrixColumn: true,
    locationInTable: "both", //column, detail, both
    default: "",
    visibleIndex: 2
});

surveyLocalization.getLocaleStrings("en")["showInReport"] = "Short name";
//surveyLocalization.getLocaleStrings("fa")["showInReport"] = "اختصار";