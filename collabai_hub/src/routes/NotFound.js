import React from "react";

// PUBLIC_INTERFACE
function NotFound() {
  /** NotFound 404 placeholder page */
  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <h2 className="title">404 - Not Found</h2>
      <div className="description">The requested page could not be found.</div>
    </div>
  );
}

export default NotFound;
