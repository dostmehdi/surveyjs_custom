import { Serializer, surveyLocalization } from "survey-core";

Serializer.addProperty("question", {
    name: "showInQualityRep",
    displayName: "Show In Quality Report",
    type: "boolean",
    category: "general",
    isLocalizable: true,
    availableInMatrixColumn: true,
    default: false,
    visibleIndex: 1,

    onSetValue: (_surveyElement, _value) => {
        // You can perform required checks here
        // ...
        // Set the `value`

        //surveyElement.setPropertyValue("myStringProperty", value);

        // You can perform required actions after the `value` is set
        // ...
    },
    onExecuteExpression: (_obj, _res) => {
        //obj.showHeader = res;
    }
});

surveyLocalization.getLocaleStrings("en")["showInQuality"] = "Show in quality report";
//surveyLocalization.getLocaleStrings("fa")["showInQuality"] = "نمایش در تضمین کیفیت";