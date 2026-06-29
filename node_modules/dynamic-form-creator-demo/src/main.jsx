// index.tsx
// ============================================================
// Ensure console exists and all methods are functions
if (typeof window !== 'undefined') {
    const noop = () => {
    };
    const consoleMethods = ['log', 'debug', 'error', 'warn', 'info', 'trace', 'dir', 'dirxml', 'table'];
    if (!window.console) {
        window.console = {};
    }
    consoleMethods.forEach((method) => {
        if (typeof (window.console)[method] !== 'function') {
            (window.console)[method] = noop;
        }
    });
}
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)