import React from "react";
import { Link } from "react-router-dom";
import { Avatar, Dropdown, Menu, Space, Layout } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Header } = Layout;

export const Navbar = ({ user, signOut, username }) => {
  const userId = user.attributes.sub;
  const items = [
    {
      key: "1",
      label: <Link to={`/user/${userId}`}>Change User Details</Link>,
    },
    {
      key: "2",
      danger: true,
      label: <div onClick={signOut}>Sign Out</div>,
    },
  ];

  const navbarItems = [
    {
      key: "1",
      label: <Link to={"/"}>Create Requests</Link>,
    },
    {
      key: "2",
      label: <Link to={"/incident"}>Incidents</Link>,
    },
    {
      key: "3",
      label: <Link to={"/user/admin"}>Admin</Link>,
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
        defaultSelectedKeys={["2"]}
        items={navbarItems}
      />
    </Header>
  );
};
