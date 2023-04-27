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
      if (response.data.status === 200) {
        notification.info({
          message: `Activity done`,
          duration: 300,
          description: "",
        });
      }
      return response;
    },
    function (error) {
      console.log(error);
      if (error.response.status === 401) {
        navigate("/error");
        return Promise.reject(error);
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

export const fetchUserIncidents = async () => {
  const { accessToken } = await fetchAuthSession();
  const { username } = accessToken.payload;
  const response = await client.get(`/incident/reporter/${username}`);
  return response.data;
};

export const fetchCurrentUserDetails = async () => {
  const { accessToken } = await fetchAuthSession();
  const username = accessToken.payload.username;
  const response = await client.get(`/user/${username}`);
  return response;
};

export const fetchUserDetails = async (userId) => {
  const response = await client.get(`/user/${userId}`);
  return response;
};

export const fetchAllIncidents = async () => {
  const response = await client.get(`/incident/all`);
  return response.json();
};

export const fetchIncident = async (incidentId) => {
  const response = await client.get(`/incident/${incidentId}`);
  return response;
};

export const updatePermissions = async (values) => {
  const response = await client.post(`/updatePermissions`, {
    userEmail: values.userEmail,
    userId: values.userId,
    role: values.role,
  });
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
