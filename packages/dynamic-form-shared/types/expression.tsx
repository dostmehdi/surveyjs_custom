import React from "react";
import {SurveyCreator, SurveyCreatorComponent} from "survey-creator-react";
import "survey-core/survey.i18n";
import "survey-creator-core/survey-creator-core.i18n";
import {ComponentCollection, Serializer, ComponentQuestionJSON, Model, QuestionCustomModel, Question, SurveyModel} from "survey-core";
import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import SurveyCreatorTheme from "survey-creator-core/themes";
import {registerCreatorTheme} from "survey-creator-core";
import {DynamicFormType} from "dynamic-form-shared/types";


const CUSTOM_QUESTION_NAME = "formulaExpression";

export class CustomComponents {
    set viewer(value: SurveyModel) {
        this._viewer = value;
    }
    set creator(value: SurveyCreator) {
        this._creator = value;
    }

    private _creator: SurveyCreator = new SurveyCreator;
    private _viewer: Model = new SurveyModel;
    private _collection: ComponentCollection;
    private readonly _dotnetReference: any;

    public constructor(dotnetReference: any,  collection: ComponentCollection) {
        this._dotnetReference = dotnetReference;
        this._collection = collection;
    }

    // public constructor(creator: SurveyCreator, collection: ComponentCollection) {
    //     this._creator = creator;
    //     this._collection = collection;
    // }

    public RegisterNewQuestion(newQuestion: any, toolboxItem: any): void {

        this._collection?.add(newQuestion);
        this.AddToolbox(toolboxItem)
    }

    public InitFormulaQuestion(): void {

        // @ts-ignore
        let newQuestion = {
            name: CUSTOM_QUESTION_NAME,
            title: CUSTOM_QUESTION_NAME,
            titleLocation: "hidden",

            defaultQuestionTitle: "",
            readOnly: true,
            elementsJSON: [{
                type: "text",
                name: "result",
                title: "Result",
            }],
            onInit() {
                // Add a `showMiddleName` Boolean property to the `fullname` question type
                Serializer.addProperty("formulaExpression", {
                    name: "formulaExpression",
                    type: "text",
                    default: "2+6",
                    category: "custom",
                });
            },
            // @ts-ignore
            onLoaded(question) {
                question.panelWrapper.questionTitleLocation = "hidden";
                // Set the Middle Name question visibility at startup
                this.changeMiddleNameVisibility(question);
            },
            // Track the changes of the `showMiddleName` property
            // @ts-ignore
            onPropertyChanged(question, propertyName) {
                if (propertyName === "showMiddleName") {
                    this.changeMiddleNameVisibility(question);
                }
            },
            // @ts-ignore
            changeMiddleNameVisibility(question) {
                const middleName = question.contentPanel.getQuestionByName("middleName");
                if (!!middleName) {
                    // Set the `middleName` question's visibility based on the composite question's `showMiddleName` property 
                    middleName.visible = question.showMiddleName;
                }
            },
        };

        let toolboxItem = {
            category: "Custom Items",
            items: [
                CUSTOM_QUESTION_NAME
            ]
        };

        this.RegisterNewQuestion(newQuestion, toolboxItem);
    }


    public AddToolbox(newElement: any): void {


        let creator = this._creator ?? this._viewer;
        creator?.toolbox.defineCategories([newElement], true);

        creator.JSON = {
            elements: [{
                type: "text",
                name: "firstName",
                title: "First Name"
            }, {
                type: "text",
                name: "middleName",
                title: "Middle Name",
                visible: false
            }, {
                type: "text",
                name: "lastName",
                title: "Last Name"
            }]
        };
        // return (<SurveyCreatorComponent creator={this._creator}/>);
    }

    public CalculateExpression(sender: any, options: any): void {
        try {
            console.log(`The question "${options.name}" changed to:`, options.value);
            // You can perform any logic here based on the changed question

            let question = options.question;

            let questions: Question[] = sender.getQuestionsByValueName("formulaExpression");
            if (questions != null) {
                for (let i = 0; i < questions.length; i++) {
                    let q = question[i];
                    let expression = q.getPropertyValue("formulaExpression");

                    const value = this._dotnetReference.invokeMethodAsync(
                        "CalculateFormulaHandlerAsync", expression, null
                    );

                    q.setPropertyValue('default', value);
                    q.setValue('default', value);

                }
            }
            console.log(`question PropertyValue: "${question.getPropertyValue()}" `);


        } catch (err) {
            console.log(err);

        }

    }

}
