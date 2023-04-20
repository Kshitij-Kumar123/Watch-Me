import React, { useState, useEffect } from "react";
import type { TableProps } from "antd";
import { Button, Space, Table } from "antd";

import { fetchAllIncidents, fetchUserIncidents } from "../../ApiCalls";

export default function IncidentHomePage() {
  const [incidentsData, setIncidentsData] = useState({});

  useEffect(() => {
    fetchUserIncidents().then((response) => console.log(response));
  }, []);

  const handleChange = () => {
    console.log("hello");
  };

  const columns = [
    {
      title: "summary",
      dataIndex: "summary",
      key: "summary",
    },
    {
      title: "developerId",
      dataIndex: "developerId",
      key: "developerId",
    },
    {
      title: "reporterId",
      dataIndex: "reporterId",
      key: "reporterId",
    },
    {
      title: "timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={incidentsData}
        onChange={handleChange}
      />
    </>
  );
}
