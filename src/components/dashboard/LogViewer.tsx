import React from 'react'

const mockLogs = [
  { timestamp: '14:32:10.123', level: 'INF', message: 'Starting workflow execution' },
  { timestamp: '14:32:10.145', level: 'RUN', message: 'parse_prompt: Extracting intent and parameters' },
  { timestamp: '14:32:10.189', level: 'OK', message: 'parse_prompt: Completed successfully (44ms)' },
  { timestamp: '14:32:10.190', level: 'RUN', message: 'fetch_sentry_errors: Fetching latest 10 errors' },
  { timestamp: '14:32:10.570', level: 'OK', message: 'fetch_sentry_errors: Completed successfully (380ms)' },
  { timestamp: '14:32:10.571', level: 'RUN', message: 'search_github_issues: Checking for duplicates' },
  { timestamp: '14:32:11.234', level: 'INF', message: 'search_github_issues: Found 2 similar issues' },
  { timestamp: '14:32:11.235', level: 'RUN', message: 'create_issue: Creating new GitHub issue' },
  { timestamp: '14:32:11.456', level: 'OK', message: 'create_issue: Issue #1234 created successfully' },
  { timestamp: '14:32:11.457', level: 'RUN', message: 'notify_slack: Sending notification to #dev-alerts' },
  { timestamp: '14:32:11.678', level: 'OK', message: 'notify_slack: Message sent successfully' },
  { timestamp: '14:32:11.679', level: 'INF', message: 'Workflow completed successfully' },
]

export function LogViewer() {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INF': return 'text-text-muted'
      case 'RUN': return 'text-accent-blue'
      case 'OK': return 'text-accent-green'
      default: return 'text-text-muted'
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="bg-muted-surface border-b border-border px-4 py-2">
        <span className="text-xs font-mono text-text-muted">Workflow Logs</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead className="bg-muted-surface border-b border-border">
            <tr>
              <th className="text-left p-3 text-text-muted">Timestamp</th>
              <th className="text-left p-3 text-text-muted">Level</th>
              <th className="text-left p-3 text-text-muted">Message</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log, index) => (
              <tr key={index} className="border-b border-border border-opacity-50">
                <td className="p-3 text-text-muted">{log.timestamp}</td>
                <td className={`p-3 font-semibold ${getLevelColor(log.level)}`}>
                  {log.level}
                </td>
                <td className="p-3 text-text-primary">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
