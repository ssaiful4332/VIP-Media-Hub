import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const telegram = window.Telegram?.WebApp;

if (telegram) {
  telegram.ready();
  telegram.expand();
  telegram.setHeaderColor("#090909");
  telegram.setBackgroundColor("#090909");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
