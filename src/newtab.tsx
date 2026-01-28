import React from "react";
import ReactDOM from "react-dom/client";
import "./popup.css"; // Using existing styles for now, you can create newtab.css later

const NewTab = () => {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Minha Nova Aba Personalizada</h1>
      <p>Edite o arquivo <code>src/newtab.tsx</code> para alterar esta página.</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <NewTab />
  </React.StrictMode>
);
