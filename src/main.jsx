// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import CartProvider from "./contexts/CartProvider";
import SettingsProvider from "./contexts/SettingsProvider";
import "./i18n/index.js";
import './index.css';
import './style/fonts.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </SettingsProvider>
  </React.StrictMode>
);