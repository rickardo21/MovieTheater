import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "framework7/css/bundle";
import "framework7-icons/css/framework7-icons.css";
import "./styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
