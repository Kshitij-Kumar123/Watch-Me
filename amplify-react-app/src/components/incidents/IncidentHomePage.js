import React, { useState, useEffect } from "react";
import { Button, Space, Table } from "antd";

import { fetchAllIncidents, fetchUserIncidents } from "../../ApiCalls";
import { Link } from "react-router-dom";

export default function IncidentHomePage() {
  const [incidentsData, setIncidentsData] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    fetchUserIncidents().then((response) => {
      console.log(response);
      setIncidentsData(response);
    });
  }, []);

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const setAgeSort = () => {
    setSortedInfo({
      order: "descend",
      columnKey: "age",
    });
  };

  const columns = [
    {
      title: "incidentId",
      dataIndex: "incidentId",
      key: "incidentId",
      filters: [
        { text: "Joe", value: "Joe" },
        { text: "Jim", value: "Jim" },
      ],
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.incidentId.includes(value),
      sorter: (a, b) => a.incidentId.length - b.incidentId.length,
      sortOrder:
        sortedInfo.columnKey === "incidentId" ? sortedInfo.order : null,
      ellipsis: true,
      render: (text) => <Link to={`/incident/${text}`}>{text}</Link>,
    },
    {
      title: "developerId",
      dataIndex: "developerId",
      key: "developerId",
      sorter: (a, b) => a.developerId - b.developerId,
      sortOrder:
        sortedInfo.columnKey === "developerId" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "reporterId",
      dataIndex: "reporterId",
      key: "reporterId",
      filters: [
        { text: "London", value: "London" },
        { text: "New York", value: "New York" },
      ],
      sorter: (a, b) => a.reporterId - b.reporterId,
      sortOrder:
        sortedInfo.columnKey === "reporterId" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      filters: [
        { text: "London", value: "London" },
        { text: "New York", value: "New York" },
      ],
      filteredValue: filteredInfo.timestamp || null,
      onFilter: (value, record) => record.timestamp.includes(value),
      sorter: (a, b) => a.timestamp.length - b.timestamp.length,
      sortOrder: sortedInfo.columnKey === "timestamp" ? sortedInfo.order : null,
      ellipsis: true,
    },
  ];

  return (
    <>
      {incidentsData.length > 0 && (
        <Table
          columns={columns}
          dataSource={incidentsData}
          onChange={handleChange}
        />
      )}
    </>
  );
}
