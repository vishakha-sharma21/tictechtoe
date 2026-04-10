import { Workflow, WorkflowNode, Tool } from '@/types'

export const mockWorkflows: Workflow[] = [
  { id: 'wf_7f2kp', name: 'GitHub issue from Sentry', icon: '🐙', nodes: 4, status: 'running', elapsed: '2.1s' },
  { id: 'wf_9k4rz', name: 'Slack daily standup', icon: '💬', nodes: 3, status: 'done', elapsed: '1h ago' },
  { id: 'wf_3m8xq', name: 'Email → Notion tasks', icon: '📧', nodes: 5, status: 'done', elapsed: 'Yesterday' },
]

export const mockNodes: WorkflowNode[] = [
  { id: 'n1', name: 'parse_prompt', tool: 'LLM', desc: 'extract intent + params', status: 'done', ms: 44 },
  { id: 'n2', name: 'fetch_sentry_errors', tool: 'Sentry API', desc: 'latest 10 errors', status: 'done', ms: 380, parallel: true },
  { id: 'n3', name: 'search_github_issues', tool: 'GitHub API', desc: 'check duplicates', status: 'running', parallel: true },
  { id: 'n4', name: 'create_issue + notify_slack', tool: 'GitHub + Slack', desc: 'final step', status: 'idle' },
]

export const mockTools: Tool[] = [
  { id: 'vscode', name: 'VSCode', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', description: 'Code editor', category: 'Development' },
  { id: 'claude', name: 'Claude', icon: '/claude-color.svg', description: 'AI Assistant', category: 'AI' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', description: 'Messaging', category: 'Communication' },
  { id: 'openai', name: 'OpenAI', icon: 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/openai.svg', description: 'AI Platform', category: 'AI' },
  { id: 'n8n', name: 'n8n', icon: '/N8n-logo-new.svg', description: 'Workflow Automation', category: 'Automation' },
  { id: 'github', name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', description: 'Version control', category: 'Development' },
  { id: 'slack', name: 'Slack', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg', description: 'Team messaging', category: 'Communication' },
  { id: 'notion', name: 'Notion', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg', description: 'Documentation', category: 'Productivity' },
  { id: 'figma', name: 'Figma', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', description: 'Design tool', category: 'Design' },
  { id: 'docker', name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', description: 'Containerization', category: 'Development' },
  { id: 'aws', name: 'AWS', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg', description: 'Cloud Platform', category: 'Cloud' },
  { id: 'vercel', name: 'Vercel', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg', description: 'Deployment', category: 'Development' },
  { id: 'typescript', name: 'TypeScript', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', description: 'Programming Language', category: 'Development' },
  { id: 'react', name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', description: 'JavaScript Library', category: 'Development' },
]

export const mockRecipes = [
  {
    id: 'bug-report',
    title: 'Bug report -> GitHub issue',
    description: 'Automatically create GitHub issues from bug reports',
    icon: 'github',
    tools: ['github', 'search'],
    runs: 892,
  },
  {
    id: 'email-notion',
    title: 'Email -> Notion task',
    description: 'Convert emails to actionable Notion tasks',
    icon: 'email',
    tools: ['email', 'notion'],
    runs: 656,
  },
  {
    id: 'slack-summary',
    title: 'Slack summary + sentiment',
    description: 'Generate daily summaries with sentiment analysis',
    icon: 'slack',
    tools: ['slack', 'chart'],
    runs: 423,
  },
  {
    id: 'build-your-own',
    title: 'Build your own',
    description: 'Create custom workflows with any tools',
    icon: 'build',
    tools: ['build'],
    runs: 0,
    isCTA: true,
  },
]

export const examplePrompts = [
  "Create a GitHub issue from the latest Sentry errors and notify the team in Slack",
  "Summarize my unread emails and create tasks in Notion for follow-ups",
  "Find high-priority Jira tickets and schedule a 2-hour focus block tomorrow",
  "Monitor our app's performance and send alerts if response time exceeds 500ms",
]
