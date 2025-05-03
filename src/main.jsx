import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import store from "./Redux/store";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { DarkModeProvider } from "./Layouts/DarkModeContext";
import { TooltipProvider } from '@radix-ui/react-tooltip';

// import { DarkModeProvider } from "./context/DarkModeContext"; // Import DarkModeProvider

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DarkModeProvider> {/* Wrap App with DarkModeProvider */}
        <TooltipProvider>
      <App />
    </TooltipProvider>
          <Toaster />
        </DarkModeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);