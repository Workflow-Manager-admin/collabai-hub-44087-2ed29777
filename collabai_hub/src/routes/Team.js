import React from "react";

// PUBLIC_INTERFACE
/** 
 * Team Collaboration Stub Page
 * - Create projects
 * - Invite users
 * - Shared insights
 */
function Team() {
  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 400 }}>
      <h2 className="title">Team Collaboration</h2>
      <div className="description">
        <ul style={{ marginLeft: 20 }}>
          <li><strong>Project Management:</strong> Create and join projects (TBD)</li>
          <li><strong>Invite Users:</strong> User invite dialog/list (TBD)</li>
          <li><strong>Shared Insights:</strong> Commenting/discussion tools (TBD)</li>
        </ul>
        <div style={{ marginTop: 32, opacity: 0.6 }}>Feature page under construction</div>
      </div>
    </div>
  );
}

export default Team;
