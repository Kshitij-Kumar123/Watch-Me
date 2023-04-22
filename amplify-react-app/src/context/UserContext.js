import React, { createContext, useState, useEffect } from "react";
import { fetchCurrentUserDetails } from "../ApiCalls";
export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    fetchCurrentUserDetails().then((response) => {
      setUserData(response.data);
    });
  }, []);

  return (
    <UserContext.Provider value={{ userData }}>{children}</UserContext.Provider>
  );
};

export { UserProvider };
