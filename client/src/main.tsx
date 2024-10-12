import { createRoot } from "react-dom/client";
import { ThirdwebProvider } from "thirdweb/react";
import { BrowserRouter as Router } from "react-router-dom"; // Import BrowserRouter

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThirdwebProvider>
    <Router>
      {" "}
      {/* Wrap the app in Router */}
      <App />
    </Router>
  </ThirdwebProvider>
);
