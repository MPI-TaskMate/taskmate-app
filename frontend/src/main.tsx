import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SubjectProvider } from "./context/SubjectContext";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <SubjectProvider>
        <App />
      </SubjectProvider>
    </AuthProvider>
  </BrowserRouter>,
);