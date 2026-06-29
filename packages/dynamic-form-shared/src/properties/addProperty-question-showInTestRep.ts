import { Serializer, surveyLocalization } from "survey-core";

Serializer.addProperty("question", {
    name: "showInTestRep",
    displayName: "Show In Test Report",
    type: "boolean",
    category: "general",
    isLocalizable: true,
    availableInMatrixColumn: true,
    locationInTable: "both", //column, detail, both
    default: false,
    visibleIndex: 0
});

surveyLocalization.getLocaleStrings("en")["showInReport"] = "Show in test report";
//surveyLocalization.getLocaleStrings("fa")["showInReport"] = "نمایش در گزارش آزمایش";