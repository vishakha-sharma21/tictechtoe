import React from 'react'

const mockLogs = [
  { timestamp: '14:32:10.123', level: 'INF', message: 'Starting workflow execution' },
  { timestamp: '14:32:10.145', level: 'RUN', message: 'parse_prompt: Extracting intent and parameters' },
  { timestamp: '14:32:10.189', level: 'OK', message: 'parse_prompt: Completed successfully (44ms)' },
  { timestamp: '14:32:10.190', level: 'RUN', message: 'fetch_sentry_errors: Fetching latest 10 errors' },
  { timestamp: '14:32:10.570', level: 'OK', message: 'fetch_sentry_errors: Completed successfully (380ms)' },
]

export type LogLine = { timestamp: string; level: string; message: string }

export function LogViewer({ lines }: { lines?: LogLine[] }) {
  const data = lines && lines.length > 0 ? lines : mockLogs

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INF':
        return 'text-text-secondary'
      case 'RUN':
        return 'text-accent-blue'
      case 'OK':
        return 'text-accent-green'
      case 'ERR':
        return 'text-accent-red'
      default:
        return 'text-text-secondary'
    }
  }

  return (
    <div className="bg-bg-elevated border border-border rounded-large-card overflow-hidden">
      <div className="bg-bg-surface border-b border-border px-4 py-2">
        <span className="text-xs font-mono text-text-secondary">Workflow logs</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[11px]">
          <thead className="bg-bg-surface border-b border-border">
            <tr>
              <th className="text-left p-3 text-text-faint font-normal">Timestamp</th>
              <th className="text-left p-3 text-text-faint font-normal">Level</th>
              <th className="text-left p-3 text-text-faint font-normal">Message</th>
            </tr>
          </thead>
          <tbody>
            {data.map((log, index) => (
              <tr
                key={index}
                className="border-b border-border/60 animate-slide-in opacity-0"
                style={{
                  animation: `slideInBottom 0.3s ease-out ${index * 45}ms forwards`,
                }}
              >
                <td className="p-3 text-text-faint whitespace-nowrap">{log.timestamp}</td>
                <td className={`p-3 font-semibold whitespace-nowrap ${getLevelColor(log.level)}`}>
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
