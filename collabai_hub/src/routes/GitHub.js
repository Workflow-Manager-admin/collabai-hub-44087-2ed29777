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
      <h2 className="title">GitHub Integration</h2>
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
