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
      <header style={{ marginBottom: 24 }}>
        <h2 className="title" style={{ marginBottom: 4 }}>Team Collaboration</h2>
        <p className="description">
          The Team page helps you collaborate efficiently—create projects, invite coworkers, and share insights in real time. <br /><br />
          <strong>Key UI Sections:</strong> project list, invite user forms, and discussion/comment areas.<br />
          <strong>User flow:</strong> Start by creating a project or joining an invitation, add users to your team, and use the collaborative tools to exchange feedback and track project progress seamlessly.
        </p>
      </header>
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
