import React from "react";
import CreateStoreForm from "../components/Store/CreateStoreForm";

const CreateStorePage = () => (
  <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <CreateStoreForm />
  </div>
);

export default CreateStorePage;
