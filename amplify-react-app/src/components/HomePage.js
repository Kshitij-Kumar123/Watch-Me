import React from "react";

export default function HomePage({ user, signOut }) {
  return (
    <main>
      <h1>Hello {user.username}</h1>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
