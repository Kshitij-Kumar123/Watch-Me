import { Amplify } from "aws-amplify";
import React, { useState, useEffect } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";
import { fetchQuote } from "./ApiCalls";
Amplify.configure(awsExports);

export default function App() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // fetchQuote().then((value) => setQuote(value));
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <h2>{quote["quote"]}</h2>
          <br />
          <h3>- {quote["author"]}</h3>
        </main>
      )}
    </Authenticator>
  );
}
