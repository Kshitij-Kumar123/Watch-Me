import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { Authenticator } from "@aws-amplify/ui-react";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Authenticator.Provider>
      <UserProvider>
        <App />
      </UserProvider>
    </Authenticator.Provider>
  </React.StrictMode>
);
