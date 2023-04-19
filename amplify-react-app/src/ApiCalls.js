import { Auth } from "aws-amplify";
import axios from "axios";
import { useRouter } from "react-router";

const fetchAuthSession = async () => {
  const currentSession = await Auth.currentSession();
  return currentSession;
};

const client = axios.create({
  baseURL: process.env.REACT_APP_URL_DEV,
});

client.interceptors.request.use(async (config) => {
  const { accessToken } = await fetchAuthSession();
  const { jwtToken } = accessToken;

  if (jwtToken) {
    config.headers["Authorization"] = jwtToken;
  }

  return config;
});

export const AxiosInterceptorsSetup = (navigate) => {
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    function (error) {
      if (error.response.status !== 200) {
        navigate("/error");
      }
      return Promise.reject(error);
    }
  );
};

export const fetchQuote = async () => {
  const response = await fetch(`${process.env.REACT_APP_URL_DEV}quotes`);
  const quotesResponse = await response.json();
  return quotesResponse;
};

export const fetchAllIncidents = async () => {
  const response = await client.get(`/incident/all`);
  return response.json();
};

export const fetchIncident = async () => {
  const { accessToken } = await fetchAuthSession();
  const { jwtToken } = accessToken;
  console.log(accessToken);
  const response = await fetch(
    `${process.env.REACT_APP_URL_DEV}user/2dc608dd-c9ea-47d7-bd50-f8a282c24362`,
    {
      mode: "cors",
      method: "GET",
      // body: JSON.stringify({
      //     // "developerId": "2dc608dd-c9ea-47d7-bd50-f8a282c24362",
      //     // "reporterId": "2dc608dd-c9ea-47d7-bd50-f8a282c24362",
      //     // "timestamp": "2023-04-13 04:53:36 PM",
      //     // "summary": "second placeholder",
      //     // "title": "well, this is a title placeholder of something"
      //     "summary": "jedi master"
      // }),
      headers: {
        Authorization: jwtToken,
      },
    }
  );
  const incidentResponse = await response.json();
  return incidentResponse;
};
