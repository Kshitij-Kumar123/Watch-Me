import React, { useState, useEffect, useContext } from "react";
import { Table } from "antd";

import { fetchAssignedIncidents, fetchUserIncidents } from "../../ApiCalls";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

export default function IncidentHomePage() {
  const [incidentsData, setIncidentsData] = useState([]);
  const [assignedIncidentsData, setAssignedIncidentsData] = useState([]);

  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const { userData } = useContext(UserContext);

  useEffect(() => {
    fetchUserIncidents().then((response) => {
      console.log(response);
      setIncidentsData(response);
    });

    fetchAssignedIncidents().then((response) => {
      console.log(response);
      setAssignedIncidentsData(response);
    });
  }, [userData]);

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "incidentId",
      key: "incidentId",
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.incidentId.includes(value),
      sorter: (a, b) => a.incidentId.length - b.incidentId.length,
      sortOrder:
        sortedInfo.columnKey === "incidentId" ? sortedInfo.order : null,
      ellipsis: true,
      render: (text) => <Link to={`/incident/${text}`}>{text}</Link>,
    },
    {
      title: "Task Type",
      dataIndex: "taskType",
      key: "taskType",
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.taskType.includes(value),
      sorter: (a, b) => a.taskType.length - b.taskType.length,
      sortOrder: sortedInfo.columnKey === "taskType" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "incidentStatus",
      key: "incidentStatus",
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.incidentStatus.includes(value),
      sorter: (a, b) => a.incidentStatus.length - b.incidentStatus.length,
      sortOrder:
        sortedInfo.columnKey === "incidentStatus" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.title.includes(value),
      sorter: (a, b) => a.title.length - b.title.length,
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Summary",
      dataIndex: "summary",
      key: "summary",
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.summary.includes(value),
      sorter: (a, b) => a.summary.length - b.summary.length,
      sortOrder: sortedInfo.columnKey === "summary" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "Sub Category",
      dataIndex: "subCategory",
      key: "subCategory",
      filteredValue: filteredInfo.name || null,
      onFilter: (value, record) => record.subCategory.includes(value),
      sorter: (a, b) => a.subCategory.length - b.subCategory.length,
      sortOrder:
        sortedInfo.columnKey === "subCategory" ? sortedInfo.order : null,
      ellipsis: true,
    },
    {
      title: "timestamp",
      dataIndex: "timestamp",
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
        <>
          <h1>Your requests</h1>
          <Table
            columns={columns}
            dataSource={incidentsData}
            onChange={handleChange}
          />
        </>
      )}
      {assignedIncidentsData.length > 0 && (
        <>
          <h1>Assigned Requests</h1>
          <Table
            columns={columns}
            dataSource={assignedIncidentsData}
            onChange={handleChange}
          />
        </>
      )}
    </>
  );
}
