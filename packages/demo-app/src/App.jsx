import React, {useEffect, useRef, useState} from 'react';
import {DynamicFormCreator} from '../../dynamic-form-creator/src/index.ts';
import {DynamicFormViewer} from '../../DynamicFormViewer/src/index.ts';
import {} from '../../DynamicFormViewer/src/index.ts';
import {DynamicFormType} from '../../dynamic-form-shared/types/index.ts';
import {ThemeType} from '../../dynamic-form-shared/types/theme-type.ts';
// Import survey styles
import 'survey-core/survey-core.fontless.min.css';
import 'survey-creator-core/survey-creator-core.fontless.min.css';

function App() {
    const containerRef = useRef(null);
    const [creator, setCreator] = useState(null);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize the creator
        const initCreator = async () => {
            try {
                setLoading(true);

                // Read query string from window.location
                const params = new URLSearchParams(window.location.search);
                const mode = params.get('mode'); // ?formId=123

                let formCreator;
                if (mode == null || mode == 'creator') {

                    formCreator = new DynamicFormCreator(
                        null, // dotnetReference (null for demo)
                        DynamicFormType.Creator,
                        BigInt(1) // Example form ID
                    );
                } else {

                    formCreator = new DynamicFormViewer(
                        null, // dotnetReference (null for demo)                    
                        BigInt(1) // Example form ID
                    );

                }
                // Create the creator instance
                // const formCreator = new DynamicFormCreator(
                //     null, // dotnetReference (null for demo)
                //     DynamicFormType.Creator,
                //     BigInt(1) // Example form ID
                // );

                setCreator(formCreator);

                // Load form structure from API (optional)
                // await formCreator.loadStructureFromApiAsync();

                // Or load from sample JSON
                const sampleForm = {
                    title: "Sample Dynamic Form",
                    pages: [{
                        name: "page1",
                        elements: [{
                            type: "text",
                            name: "question1",
                            title: "What is your name?",
                            isRequired: true
                        }, {
                            type: "radiogroup",
                            name: "question2",
                            title: "Select an option",
                            choices: ["Option 1", "Option 2", "Option 3"]
                        }]
                    }]
                };
                formCreator.loadStructureDirectlyFromJson(sampleForm);

                // Render the creator
                setTimeout(() => {
                    if (containerRef.current) {
                        formCreator.renderElement(containerRef.current.id);
                    }
                }, 100);

                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        initCreator();

        // Cleanup
        return () => {
            if (creator && !creator.isDisposed) {
                creator.dispose();
            }
        };
    }, []);

    const handleSave = () => {
        if (creator) {
            const data = creator.getFormStructureAsJson();
            setFormData(data);
            console.log('Form saved:', data);
        }
    };

    const handleExport = () => {
        if (creator) {
            const jsonString = creator.getFormStructureAsString();
            console.log('Form JSON:', jsonString);
            // Create download
            const blob = new Blob([jsonString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'form-structure.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    if (loading) {
        return (
            <div style={{padding: '20px', textAlign: 'center'}}>
                <h2>Loading Form Creator...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{padding: '20px', color: 'red'}}>
                <h2>Error: {error}</h2>
            </div>
        );
    }

    return (
        <div style={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
            <div style={{
                padding: '10px 20px',
                background: '#f5f5f5',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{margin: 0}}>Dynamic Form Creator</h1>
                <div>
                    <button
                        onClick={handleSave}
                        style={{
                            marginRight: '10px',
                            padding: '8px 16px',
                            background: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Save Form
                    </button>
                    <button
                        onClick={handleExport}
                        style={{
                            padding: '8px 16px',
                            background: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Export JSON
                    </button>
                </div>
            </div>

            <div
                id="survey-creator-container"
                ref={containerRef}
                style={{flex: 1, overflow: 'hidden'}}
            />

            {formData && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    maxWidth: '400px',
                    maxHeight: '300px',
                    overflow: 'auto',
                    border: '1px solid #ddd'
                }}>
                    <h4 style={{margin: '0 0 10px 0'}}>Form Data:</h4>
                    <pre style={{margin: 0, fontSize: '12px'}}>
            {JSON.stringify(formData, null, 2)}
          </pre>
                    <button
                        onClick={() => setFormData(null)}
                        style={{
                            marginTop: '10px',
                            padding: '4px 12px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;