import React, { useState, useEffect } from "react";
import { fetchAllIncidents } from "../../ApiCalls";

export default function IncidentHomePage() {
  const [incidentsData, setIncidentsData] = useState({});

  useEffect(() => {
    fetchAllIncidents().then((response) => {
      console.log(response);
      setIncidentsData(response);
    });
  }, []);

  return <div>IncidentHomePage</div>;
}
