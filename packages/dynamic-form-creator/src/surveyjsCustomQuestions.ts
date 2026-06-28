/*
  surveyjsCustomQuestions.ts
  - Exposes registerSurveyJsCustomQuestions which registers two SurveyJS custom questions:
    1) advancedcalculator (an advanced calculator composed of multipletext)
    2) dynamic list question types coming from a dynamics list

  This file is intentionally minimal and uses the DynamicFormCreator instance's
  ComponentCollection and toolbox to register custom question types used by the
  creator UI.
*/

export function registerSurveyJsCustomQuestions(objInstance: any, dynamicslist?: string, apiConfig?: any) {
    const survey = objInstance?.getCreator?.();

    function parseVariables(text: string | undefined) {
        const result: any = {};
        if (!text) return result;
        text.split(",").forEach(pair => {
            const [key, value] = pair.split("=").map((x: string) => x.trim());
            if (!key) return;
            const number = Number(value);
            result[key] = Number.isNaN(number) ? value : number;
        });
        return result;
    }

    function registerCalculatorQuestion(config: any = {}) {
        const questionName = config.name || 'advancedcalculator';
        const displayName = config.displayName || 'Advanced Calculator';
        const expressionPlaceholder = config.expressionPlaceholder || 'Enter mathematical expression...';

        if (!objInstance || !objInstance.ComponentCollection) return;

        const existing = objInstance.ComponentCollection.Instance.getCustomQuestionByName(questionName);
        if (existing) {
            objInstance.ComponentCollection.Instance.remove(questionName);
        }

        objInstance.ComponentCollection.Instance.add({
            name: questionName,
            title: displayName,
            questionJSON: {
                type: "multipletext",
                name: questionName,
                title: displayName,
                panelCount: 1,
                maxPanelCount: 1,
                items: [
                    {
                        type: "text",
                        name: questionName + "expression",
                        title: "Mathematical Expression",
                        placeholder: expressionPlaceholder,
                        visible: false
                    },
                    {
                        type: "text",
                        name: questionName + "variables",
                        title: "Variables (optional)",
                        placeholder: "x=5, y=10",
                        visible: false
                    },
                    {
                        type: "html",
                        name: questionName + "resultDisplay",
                        title: "Result",
                        html: "<div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; min-height: 50px;'>Wait for calculation...</div>"
                    },
                    {
                        type: "text",
                        name: questionName + "result",
                        title: "Calculated Result",
                        readOnly: true,
                        visible: false
                    }
                ]
            },
            inheritBaseProps: true
        });

        if (survey && survey.toolbox) {
            const exists = survey.toolbox.getItemByName?.(questionName);
            if (!exists) {
                survey.toolbox.addItem({
                    name: questionName,
                    title: displayName,
                    iconName: "icon-calculator",
                    category: "Custom",
                    json: { type: questionName, name: questionName, title: displayName }
                });
            }
        }
    }

    function registerDynamicQuestion(dynamic: any) {
        if (!objInstance || !objInstance.ComponentCollection) return;
        const name = ('[' + (dynamic.schema || '').toLowerCase() + '].[' + (dynamic.tableName || '').toLowerCase() + ']');

        const existing = objInstance.ComponentCollection.Instance.getCustomQuestionByName(name);
        if (existing) objInstance.ComponentCollection.Instance.remove(name);

        objInstance.ComponentCollection.Instance.add({
            name: name,
            title: dynamic.displayName || name,
            questionJSON: {
                type: "dropdown",
                placeholder: "انتخاب کنید ...",
                choicesByUrl: {
                    url: (objInstance.apiBaseAddress || '') + '/api/DynamicsData/DynamicsDataRecordsByDynamicsDataId/' + dynamic.id,
                    valueName: "id",
                    titleName: "displayName"
                }
            },
            inheritBaseProps: true
        });

        if (survey && survey.toolbox) {
            const exists = survey.toolbox.getItemByName?.(name);
            if (!exists) {
                survey.toolbox.addItem({
                    name: name,
                    title: dynamic.displayName || name,
                    iconName: "icon-dropdown",
                    category: "Custom",
                    json: { type: name, name: dynamic.displayName || name }
                });
            }
        }
    }

    function registerAdvancedCalculator(config?: any) {
        const defaultConfig = {
            name: 'advancedcalculator',
            displayName: 'Advanced Calculator',
            expressionPlaceholder: 'Enter mathematical expression...'
        };
        registerCalculatorQuestion(Object.assign({}, defaultConfig, config || {}));
    }

    // Register from provided dynamics list if available
    if (dynamicslist) {
        try {
            const dynamics = typeof dynamicslist === 'string' ? JSON.parse(dynamicslist) : dynamicslist;
            if (Array.isArray(dynamics)) {
                dynamics.forEach((d: any) => registerDynamicQuestion(d));
            }
        } catch (e) {
            // swallow parse errors
            console.error('Failed to parse dynamicslist', e);
        }
    }

    // Register the calculator by default
    registerAdvancedCalculator(apiConfig);

    return {
        registerDynamicQuestion,
        registerCalculatorQuestion,
        registerAdvancedCalculator
    };
}
