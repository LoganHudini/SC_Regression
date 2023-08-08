import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import ReactPWAInstallProvider from "react-pwa-install";
import { BrowserRouter as Router } from "react-router-dom";
import { ReactNotifications } from "react-notifications-component";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ReactPWAInstallProvider enableLogging>
    <Router>
      <ReactNotifications />
      <App />
    </Router>
  </ReactPWAInstallProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
