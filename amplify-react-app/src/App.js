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
import ErrorPage from "./components/ErrorPage";

Amplify.configure(awsExports);

const { Header, Content, Footer } = Layout;

export default function App() {
  useEffect(() => {
    // fetchQuote().then((value) => console.log(value));
    // fetchQuote().then((value) => console.log("quote: ", value));
    // fetchIncident().then((value) => console.log("fetchIncident: ", value));
    // fetchAuthSession().then((data) => console.log(data));
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <Layout className="layout">
            <Navbar
              user={user}
              username={user.attributes.email}
              signOut={signOut}
            />
            <Content className="content">
              <Routes>
                <Route
                  path="/"
                  element={<HomePage signOut={() => signOut()} user={user} />}
                />
                <Route path="/incident" element={<IncidentHomePage />} />
                <Route path="/incident/:id" element={<IncidentDetails />} />
                <Route path="/user/:id" element={<UserDetails />} />
                <Route path="/user/admin" element={<AdminControl />} />
                <Route path="*" element={<ErrorPage />} />
              </Routes>
            </Content>
          </Layout>
          <Footer style={{ textAlign: "center" }}>Footer</Footer>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
