import { Amplify } from "aws-amplify";
import React, { useState, useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import { fetchQuote, fetchAuthSession, fetchIncident } from "./ApiCalls";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout } from "antd";
import { Navbar } from "./components/Navbar";
import HomePage from "./components/HomePage";
import IncidentHomePage from "./components/incidents/IncidentHomePage";
import IncidentDetails from "./components/incidents/IncidentDetails";
import UserDetails from "./components/user/UserDetails";
import AdminControl from "./components/user/AdminControl";

Amplify.configure(awsExports);

const { Header, Content, Footer } = Layout;

export default function App() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // fetchQuote().then((value) => setQuote(value));
    // fetchQuote().then((value) => console.log("quote: ", value));
    // fetchIncident().then((value) => console.log("fetchIncident: ", value));
    // fetchAuthSession().then((data) => console.log(data));
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Navbar
            user={user}
            username={user.attributes.email}
            signOut={signOut}
          />
          <Routes>
            <Route
              path="/"
              element={<HomePage signOut={() => signOut()} user={user} />}
            />
            <Route path="/incident" element={<IncidentHomePage />} />
            <Route path="/incident/:id" element={<IncidentDetails />} />
            <Route path="/user/:id" element={<UserDetails />} />
            <Route path="/user/admin" element={<AdminControl />} />
          </Routes>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
