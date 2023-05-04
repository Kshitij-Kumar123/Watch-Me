import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Layout } from "antd";
import { Navbar } from "../Navbar";
import { Content, Footer } from "antd/es/layout/layout";
import IncidentHomePage from "../incidents/IncidentHomePage";
import IncidentDetails from "../incidents/IncidentDetails";
import UserDetails from "../user/UserDetails";
import AdminControl from "../user/AdminControl";
import ErrorPage from "../ErrorPage";

export default function HomePage({ user, signOut }) {
  return (
    <div>
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
            <Route path="/incident/user" element={<IncidentHomePage />} />
            <Route path="/incident/:id" element={<IncidentDetails />} />
            <Route path="/user/:id" element={<UserDetails />} />
            <Route path="/user/admin" element={<AdminControl />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Content>
      </Layout>
      <Footer style={{ textAlign: "center" }}>Footer</Footer>
    </div>
  );
}
