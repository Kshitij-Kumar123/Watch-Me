import { Auth } from "aws-amplify";

const fetchAuthSession = async () => {
  const currentSession = await Auth.currentSession();
  return currentSession;
};

export const fetchQuote = async () => {
  const response = await fetch(`${process.env.REACT_APP_URL_DEV}quotes`);
  const quotesResponse = await response.json();
  return quotesResponse;
};

export const fetchIncident = async () => {
  const { accessToken } = await fetchAuthSession();
  const { jwtToken } = accessToken;
  console.log(accessToken);
  const response = await fetch(
    `${process.env.REACT_APP_URL_DEV}incident/86f9d64d-2099-4664-8c7d-c759c667a844`,
    {
      mode: "cors",
      headers: {
        Authorization: jwtToken,
      },
    }
  );
  const incidentResponse = await response.json();
  return incidentResponse;
};
