import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, Dropdown, Menu, Space, Layout } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UserContext } from "../context/UserContext";

const { Header } = Layout;

export const Navbar = ({ user, signOut, username }) => {
  const [navbarItems, setNavbarItems] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("1");
  const { userData } = useContext(UserContext);
  const userId = user.attributes.sub;
  const location = useLocation();

  useEffect(() => {
    let key = "1";
    console.log(location.pathname);
    if (location.pathname === "/") {
      key = "1";
    } else if (location.pathname === "/incident/user") {
      key = "2";
    } else if (location.pathname === "/user/admin") {
      key = "3";
    } else {
      key = "0";
    }

    setSelectedMenu(key);
  }, [location]);

  useEffect(() => {
    console.log(userData);
    const navbar = [
      {
        key: "1",
        label: <Link to={"/"}>Create Requests</Link>,
      },
      {
        key: "2",
        label: <Link to={"/incident/user"}>Incidents</Link>,
      },
    ];

    if (userData.userRole?.toLowerCase().trim() === "admin") {
      navbar.push({
        key: "3",
        label: <Link to={"/user/admin"}>Admin</Link>,
      });
    }

    setNavbarItems(navbar);
  }, []);

  const handleSignOut = () => {
    signOut();
    window.location.reload();
  };

  const items = [
    {
      key: "1",
      label: <Link to={`/user/${userId}`}>Change User Details</Link>,
    },
    {
      key: "2",
      danger: true,
      label: <div onClick={handleSignOut}>Sign Out</div>,
    },
  ];

  return (
    <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%" }}>
      <div style={{ float: "right" }}>
        <Avatar
          icon={<UserOutlined />}
          style={{
            margin: "16px",
          }}
        />
        <Dropdown menu={{ items }}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>{username}</Space>
          </a>
        </Dropdown>
      </div>

      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selectedMenu]}
        items={navbarItems}
      />
    </Header>
  );
};
