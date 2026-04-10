# DAGent — AI Workflow Orchestration Platform

Stop duct-taping your stack. Let the agent handle it.

DAGent is an AI-powered workflow orchestration platform where users describe tasks in natural language, and an intelligent agent converts them into DAG (Directed Acyclic Graph) workflows that execute tools in parallel.

## 🚀 Features

- **Natural Language Workflows**: Describe what you need in plain English
- **Parallel Execution**: Tools run simultaneously when possible for maximum efficiency
- **Real-time Visualization**: Watch your DAGs execute with live status updates
- **100+ Tool Integrations**: Connect GitHub, Slack, Notion, Sentry, and more
- **Chat Interface**: Natural conversation flow for building workflows
- **Live Logs**: Detailed execution logs with timestamps and status levels

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Fonts**: Playfair Display (serif), Inter (sans-serif), JetBrains Mono (monospace)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Authentication**: NextAuth.js (planned)
- **Database**: PostgreSQL + Prisma (planned)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── auth/page.tsx      # Authentication
│   └── dashboard/page.tsx # Main dashboard
├── components/
│   ├── shared/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Nav.tsx
│   ├── landing/           # Landing page components
│   │   ├── Hero.tsx
│   │   ├── Marquee.tsx
│   │   ├── RecipeGrid.tsx
│   │   └── DagSection.tsx
│   └── dashboard/         # Dashboard components
│       ├── IconRail.tsx
│       ├── Sidebar.tsx
│       ├── ChatPanel.tsx
│       ├── CanvasPanel.tsx
│       ├── WorkflowCard.tsx
│       ├── DagNodeCard.tsx
│       ├── ParallelBlock.tsx
│       └── LogViewer.tsx
├── lib/
│   ├── fonts.ts          # Font configuration
│   ├── utils.ts          # Utility functions
│   └── mock-data.ts      # Mock data for development
└── types/
    └── index.ts          # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
- **Background**: `#fafaf8` (paper), `#f3f2ef` (surface), `#eae9e4` (muted surface)
- **Borders**: `#e0ddd6` (default), `#ccc9c0` (emphasis)
- **Text**: `#0a0a0a` (primary), `#3d3d3d` (secondary), `#888` (muted), `#bbb` (faint)
- **Accents**: Blue `#2563eb`, Green `#16a34a`, Amber `#d97706`, Red `#dc2626`

### Typography
- **Headings**: Playfair Display (italic for emphasis)
- **UI**: Inter (weights 300, 400, 500, 600)
- **Code**: JetBrains Mono

### Border Radius
- **Small**: 8px, **Cards**: 10px, **Large Cards**: 16px, **Modals**: 24px

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DAGent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📱 Pages & Routes

### `/` - Landing Page
- Hero section with typewriter animation
- Tool integration marquee
- Recipe/use case grid
- DAG visualization showcase
- Call-to-action sections

### `/auth` - Authentication
- Clean centered login/signup form
- Email/password authentication
- Google OAuth integration
- Form validation and error handling

### `/dashboard` - Main Application
- **4-column layout**:
  1. **Icon Rail** (52px): Navigation icons
  2. **Sidebar** (260px): Workflow list and search
  3. **Chat Panel** (420px): Conversation interface
  4. **Canvas Panel** (flex): DAG visualization and logs

## 🎯 Key Interactions

### Landing Page
- **Typewriter Animation**: Cycles through example prompts at 38ms intervals
- **Marquee Strip**: Infinite scroll animation for tool logos
- **Hover States**: Card lift effects and color transitions

### Dashboard
- **Real-time Updates**: Pulsing indicators for running workflows
- **View Toggle**: Switch between DAG visualization and log viewer
- **Chat Interface**: Natural language workflow creation
- **Progress Tracking**: Visual progress bars and completion status

## 🔧 Component Architecture

### Shared Components
- `Button`: Consistent button styling with variants (primary, secondary, outline)
- `Badge`: Status indicators and metadata display
- `Nav`: Fixed navigation with backdrop blur

### Dashboard Components
- `IconRail`: Vertical navigation with tool icons
- `Sidebar`: Workflow search and history
- `ChatPanel`: Message interface with input controls
- `CanvasPanel`: DAG visualization and log viewer
- `WorkflowCard`: Embedded workflow status in chat
- `DagNodeCard`: Individual node visualization
- `ParallelBlock`: Parallel execution visualization
- `LogViewer`: Monospace log table with color coding

## 🎨 Animations

### CSS Animations
- `marquee`: 22s linear infinite scroll
- `pulse`: 3s ease-in-out infinite for status indicators
- `typewriter`: Character-by-character text reveal

### Transitions
- Hover states: 200ms ease
- Progress bars: 600ms ease
- View toggles: 300ms ease

## 📊 Mock Data

The application includes comprehensive mock data for:
- Workflows with various statuses
- DAG nodes with execution details
- Tool integrations and categories
- Recipe templates
- Chat messages and logs

## 🚧 Future Enhancements

- [ ] Real backend API integration
- [ ] User authentication with NextAuth.js
- [ ] Database integration with PostgreSQL + Prisma
- [ ] Real-time updates with WebSockets
- [ ] Interactive DAG editor with React Flow
- [ ] Tool connection management
- [ ] Workflow templates marketplace
- [ ] Advanced scheduling and triggers
- [ ] Team collaboration features

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS.
