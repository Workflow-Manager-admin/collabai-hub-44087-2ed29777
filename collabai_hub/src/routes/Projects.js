import React from "react";

// PUBLIC_INTERFACE
function Projects() {
  /** Projects placeholder page */
  return (
    <div className="container" style={{ paddingTop: 100 }}>
      <header style={{ marginBottom: 16 }}>
        <h2 className="title" style={{ marginBottom: 4 }}>Projects</h2>
        <p className="description">
          Access all your ongoing and completed projects, track progress, and collaborate with team members.<br /><br />
          <strong>Main UI:</strong> Project list/gallery, quick filters, and project details view.<br />
          <strong>User flow:</strong> Select a project from your list to view details, manage tasks, or invite more teammates. Quickly switch between projects via sidebar or dashboard.
        </p>
      </header>
      <div className="description">View and manage your projects.</div>
    </div>
  );
}

export default Projects;
