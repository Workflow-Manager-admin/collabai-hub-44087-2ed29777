import React from "react";

// PUBLIC_INTERFACE
/** 
 * GitHub Integration Page Stub
 * - Connect repositories
 * - Fetch commit history
 * - AI Q&A on code
 */
function GitHub() {
  return (
    <div className="container" style={{ paddingTop: 100, minHeight: 400 }}>
      <header style={{ marginBottom: 24 }}>
        <h2 className="title" style={{ marginBottom: 4 }}>GitHub Integration</h2>
        <p className="description">
          Use the GitHub page to link your repositories for AI-powered collaboration. This feature enables connecting to GitHub via OAuth, reviewing commit histories, and gaining insights through code and PR Q&A.<br /><br />
          <strong>Main sections:</strong> repository connection &amp; list, commit feed, and AI Q&amp;A.<br />
          <strong>User flow:</strong> Connect your GitHub account, select a repository, browse commit details, and utilize AI features for code exploration—all from an intuitive interface.
        </p>
      </header>
      <div className="description">
        <ul style={{ marginLeft: 20 }}>
          <li><strong>Connect Repositories:</strong> OAuth repo connect, show repo list (TBD)</li>
          <li><strong>Commit History:</strong> Fetch/display latest commits (TBD)</li>
          <li><strong>AI Q&amp;A:</strong> Ask questions about code and PRs (TBD)</li>
        </ul>
        <div style={{ marginTop: 32, opacity: 0.6 }}>Feature page under construction</div>
      </div>
    </div>
  );
}

export default GitHub;
