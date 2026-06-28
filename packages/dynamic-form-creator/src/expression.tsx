import * as React from "react";
import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import "survey-core/survey.i18n";
import "survey-creator-core/survey-creator-core.i18n";
import { Serializer, ComponentCollection } from "survey-core";

import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import "./styles.css";
import SurveyCreatorTheme from "survey-creator-core/themes";
import { registerCreatorTheme } from "survey-creator-core";

registerCreatorTheme(SurveyCreatorTheme); // Add predefined Survey Creator UI themes

// Avoid double-registration: check if a custom question with this name already exists
try {
    const existing = ComponentCollection.Instance.getCustomQuestionByName?.("formulaExpression");
    if (!existing) {
        ComponentCollection.Instance.add({
            name: "formulaExpression",
            defaultQuestionTitle: {
                "default": "Formula Expression",
                "fa": "فرمول"
            },
            questionJSON: {
                type: "text",
                placeholder: {
                    "default": "Enter formula expression",
                    "de": "عبارت فرمول را تایپ کنید"
                }
            },
            inheritBaseProps: true
        });

        // Add a property to the base Question class and to all questions as a result
        Serializer.addProperty("question", {
            name: "formula",
            type: "number",
            category: "customCategory",
            default: 1,
            visibleIndex: 0,
            onSetValue: (survey, value) => {
                // ...
                // You can perform required checks here
                // ...
                // Set the `value`
                survey.setPropertyValue("formula", value);
                // You can perform required actions after the `value` is set
                // ...
            }
        });
    }
} catch (e: any) {
    // Some SurveyJS distributions already register an 'expression' class. Ignore duplicate-registration errors.
    if (e && typeof e.message === 'string' && e.message.indexOf("There is already class with name 'expression'") !== -1) {
        // ignore
    } else {
        // rethrow unknown errors so devs can see them
        throw e;
    }
}

export function ExpressionComponent() {
    const creator = new SurveyCreator();

    // Ensure toolbox item is visible in the toolbox. The default toolbox categories are usually sufficient,
    // so we only need to add the item if it doesn't exist.

    const exists = creator.toolbox.getItemByName?.("formulaExpression");
    if (!exists) {
        creator.toolbox.addItem({
            name: "formulaExpression",
            title: "Formula Expression",
            iconName: "icon-calculator",
            category: "Custom",
            json: { type: "formulaExpression", name: "formulaExpression", title: "Formula Expression" }
        });
    }

    // Default JSON for the creator preview - use a lowercase name to match the registered question type
    creator.JSON = {
        elements: [
            { type: "formulaExpression", name: "formulaExpression" }
        ]
    };

    return <SurveyCreatorComponent creator={creator} />;
}

export default ExpressionComponent;


