import { PropertyGridEditorCollection } from "survey-creator-core";

PropertyGridEditorCollection.register({
    // Use this editor for properties with `type: "shorttext"`
    fit: (prop) => {
        return prop.type === "shorttext";
    },
    // Return a question JSON configuration for the property editor
    // (a single-line input editor that is limited to 15 characters)
    getJSON: () => {
        return { type: "text", maxLength: 15 };
    }
});