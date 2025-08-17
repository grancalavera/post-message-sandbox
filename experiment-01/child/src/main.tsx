import React from "react";
import ReactDOM from "react-dom/client";
import ChildApp from "./ChildApp.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChildApp />
  </React.StrictMode>,
);
