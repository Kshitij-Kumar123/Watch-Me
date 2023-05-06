import { Amplify } from "aws-amplify";
import React from "react";
import {
  Authenticator,
  useAuthenticator,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import { AxiosInterceptorsSetup } from "./ApiCalls";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Col, Layout, Row, Card } from "antd";
import { Navbar } from "./components/Navbar";
import HomePage from "./components/HomePage";
import IncidentHomePage from "./components/incidents/IncidentHomePage";
import IncidentDetails from "./components/incidents/IncidentDetails";
import UserDetails from "./components/user/UserDetails";
import AdminControl from "./components/user/AdminControl";
import ErrorPage from "./components/ErrorPage";

Amplify.configure(awsExports);

const { Content, Footer } = Layout;

function AxiosInterceptorNavigate() {
  let navigate = useNavigate();
  AxiosInterceptorsSetup(navigate);
  return <></>;
}

function Login() {
  return (
    <Row
      gutter={[16, 16]}
      justify={"start"}
      align={"middle"}
      style={{ marginTop: 100 }}
    >
      <Col md={16} sm={24}>
        <Authenticator />
      </Col>
      <Col md={6} sm={24}>
        <Card
          title="Placeholder Title"
          bordered={false}
          style={{ height: "60vh" }}
        >
          Placeholder description
        </Card>
      </Col>
    </Row>
  );
}

function Home() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  return (
    <BrowserRouter>
      {<AxiosInterceptorNavigate />}
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
    </BrowserRouter>
  );
}

export default function App() {
  const { user } = useAuthenticator();

  if (user) {
    return <Home />;
  }

  return <Login />;
}

// export default function App() {
//   return (
//     <div>
//       <Authenticator>
//         {({ signOut, user }) => (
//           <BrowserRouter>
//             {<AxiosInterceptorNavigate />}
//             <Layout className="layout">
//               <Navbar
//                 user={user}
//                 username={user.attributes.email}
//                 signOut={signOut}
//               />
//               <Content className="content">
//                 <Routes>
//                   <Route
//                     path="/"
//                     element={<HomePage signOut={() => signOut()} user={user} />}
//                   />
//                   <Route path="/incident/user" element={<IncidentHomePage />} />
//                   <Route path="/incident/:id" element={<IncidentDetails />} />
//                   <Route path="/user/:id" element={<UserDetails />} />
//                   <Route path="/user/admin" element={<AdminControl />} />
//                   <Route path="*" element={<ErrorPage />} />
//                 </Routes>
//               </Content>
//             </Layout>
//             <Footer style={{ textAlign: "center" }}>Footer</Footer>
//           </BrowserRouter>
//         )}
//       </Authenticator>
//     </div>
//   );
// }
