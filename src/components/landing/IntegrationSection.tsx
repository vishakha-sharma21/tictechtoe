'use client'

import React from 'react'

interface IntegrationItem {
  name: string
  icon: string
  label: string
}

const integrations: IntegrationItem[] = [
  {
    name: 'OpenAI',
    icon: 'M13.768 4.2C13.5 4.1 13.2 4 12.8 4C12.4 4 12 4.1 11.7 4.2C11.4 4.3 11.1 4.5 10.9 4.7C10.7 4.9 10.5 5.2 10.4 5.5C10.3 5.8 10.3 6.1 10.3 6.5C10.3 6.9 10.3 7.2 10.4 7.5C10.5 7.8 10.7 8.1 10.9 8.3C11.1 8.5 11.4 8.7 11.7 8.8C12 8.9 12.4 9 12.8 9C13.2 9 13.5 8.9 13.8 8.8C14.1 8.7 14.4 8.5 14.6 8.3C14.8 8.1 15 7.8 15.1 7.5C15.2 7.2 15.2 6.9 15.2 6.5C15.2 6.1 15.2 5.8 15.1 5.5C15 5.2 14.8 4.9 14.6 4.7C14.4 4.5 14.1 4.3 13.8 4.2ZM12.8 7.8C12.6 7.8 12.4 7.7 12.2 7.6C12 7.5 11.9 7.4 11.8 7.2C11.7 7 11.6 6.8 11.5 6.5C11.4 6.2 11.4 5.8 11.5 5.5C11.6 5.2 11.7 5 11.8 4.8C11.9 4.6 12.1 4.5 12.2 4.4C12.4 4.3 12.6 4.2 12.8 4.2C13 4.2 13.2 4.3 13.4 4.4C13.6 4.5 13.7 4.6 13.8 4.8C13.9 5 14 5.2 14.1 5.5C14.2 5.8 14.2 6.2 14.1 6.5C14 6.8 13.9 7 13.8 7.2C13.7 7.4 13.5 7.5 13.4 7.6C13.2 7.7 13 7.8 12.8 7.8ZM8.5 4.2C8.2 4.1 7.8 4 7.4 4C7 4 6.6 4.1 6.3 4.2C6 4.3 5.7 4.5 5.5 4.7C5.3 4.9 5.1 5.2 5 5.5C4.9 5.8 4.9 6.1 4.9 6.5C4.9 6.9 4.9 7.2 5 7.5C5.1 7.8 5.3 8.1 5.5 8.3C5.7 8.5 6 8.7 6.3 8.8C6.6 8.9 7 9 7.4 9C7.8 9 8.1 8.9 8.4 8.8C8.7 8.7 9 8.5 9.2 8.3C9.4 8.1 9.6 7.8 9.7 7.5C9.8 7.2 9.8 6.9 9.8 6.5C9.8 6.1 9.8 5.8 9.7 5.5C9.6 5.2 9.4 4.9 9.2 4.7C9 4.5 8.7 4.3 8.4 4.2ZM7.4 7.8C7.2 7.8 7 7.7 6.8 7.6C6.6 7.5 6.5 7.4 6.4 7.2C6.3 7 6.2 6.8 6.1 6.5C6 6.2 6 5.8 6.1 5.5C6.2 5.2 6.3 5 6.4 4.8C6.5 4.6 6.7 4.5 6.8 4.4C7 4.3 7.2 4.2 7.4 4.2C7.6 4.2 7.8 4.3 8 4.4C8.2 4.5 8.3 4.6 8.4 4.8C8.5 5 8.6 5.2 8.7 5.5C8.8 5.8 8.8 6.2 8.7 6.5C8.6 6.8 8.5 7 8.4 7.2C8.3 7.4 8.1 7.5 8 7.6C7.8 7.7 7.6 7.8 7.4 7.8Z',
    label: 'AI Platform'
  },
  {
    name: 'n8n',
    icon: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z',
    label: 'Workflow Automation'
  },
  {
    name: 'MCP',
    icon: 'M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v8H8V8zm2 2v4h4v-4h-4z',
    label: 'Model Context Protocol'
  },
  {
    name: 'VS Code',
    icon: 'M23.15 2.58L13.54 0l-.01.01L4.02 2.56c-.5.14-.85.58-.85 1.1v10.98c0 .52.35.96.85 1.1l9.51 2.56 9.51-2.56c.5-.14.85-.58.85-1.1V3.66c0-.52-.35-.96-.85-1.1h0zM13.53 2.27l7.98 2.16-7.98 2.15-7.98-2.15 7.98-2.16zm-8.48 3.53l7.48 2.02v7.48l-7.48-2.02V5.8zm16.96 0v7.48l-7.48 2.02V7.82l7.48-2.02z',
    label: 'Code Editor'
  },
  {
    name: 'Claude',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    label: 'AI Assistant'
  },
  {
    name: 'Cursor',
    icon: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7zm2 2v6h6V9H9z',
    label: 'AI Code Editor'
  }
]

function IntegrationCard({ integration }: { integration: IntegrationItem }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-white/50 group">
      <div className="relative">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
        
        {/* Icon container */}
        <div className="relative w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:shadow-md group-hover:border-gray-200 transition-all duration-300">
          <svg 
            className="w-8 h-8 text-gray-600 group-hover:text-gray-800 transition-colors duration-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d={integration.icon} />
          </svg>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
          {integration.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {integration.label}
        </p>
      </div>
    </div>
  )
}

export function IntegrationSection() {
  return (
    <section className="bg-gray-50 py-20 px-4 overflow-hidden relative">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Seamlessly connect 
            <span className="italic font-medium"> everything</span> 
            <br />
            you use
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Orchestrate workflows across tools using DAG-based execution
          </p>
        </div>

        {/* Integration Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16">
          {integrations.map((integration) => (
            <IntegrationCard 
              key={integration.name} 
              integration={integration}
            />
          ))}
        </div>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 pointer-events-none" />
    </section>
  )
}
