// client/src/main.jsx
import "quill/dist/quill.snow.css";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import CartProvider from "./contexts/CartProvider";
import LoadingProvider from "./contexts/LoadingProvider";
import SettingsProvider from "./contexts/SettingsProvider";
import "./i18n/index.js";
import './index.css';
import './style/fonts.css';
import "./style/quill-word.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoadingProvider>
      <HelmetProvider>         
        <SettingsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </SettingsProvider>
      </HelmetProvider>
    </LoadingProvider>
  </React.StrictMode>
);