import { Auth } from "aws-amplify";
import axios from "axios";
import { notification } from "antd";

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
      if (error.response.status === 401) {
        navigate("/error");
        return Promise.reject(error);
      }
      notification.info({
        message: `Error ${error.response.status}: `,
        duration: 300,
        description: "",
      });

      return Promise.reject(error);
    }
  );
};

export const fetchQuote = async () => {
  const response = await fetch(`${process.env.REACT_APP_URL_DEV}quotes`);
  const quotesResponse = await response.json();
  return quotesResponse;
};

export const fetchUserIncidents = async () => {
  const { accessToken } = await fetchAuthSession();
  const { username } = accessToken.payload;
  const response = await client.get(`/incident/reporter/${username}`);
  return response.data;
};

export const fetchAllIncidents = async () => {
  const response = await client.get(`/incident/all`);
  return response.json();
};

export const fetchIncident = async (incidentId) => {
  const response = await client.get(`/incident/${incidentId}`);
  return response;
};

export const createIncident = async (form) => {
  const { accessToken } = await fetchAuthSession();
  const { username } = accessToken.payload;
  // TODO: add comments, start and end date later
  const response = await client.post(`/incident`, {
    incidentStatus: "New",
    title: form.getFieldValue("title"),
    summary: form.getFieldValue("description"),
    taskType: form.getFieldValue("requestType"),
    complexityRating: form.getFieldValue("complexityRating"),
    subCategory: form.getFieldValue("subCategory"),
    reporterId: username,
    developerId: username,
    // comments: [form.getFieldValue("comment")],
  });

  return response.json();
};
