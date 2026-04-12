import { useState } from 'react'

interface Props {
  onExecute: () => void
  onCancel: () => void
  isExecuting?: boolean
}

export function ExecuteConfirmCard({ onExecute, onCancel, isExecuting }: Props) {
  const [clicked, setClicked] = useState(false)

  const handleExecute = () => {
    setClicked(true)
    onExecute()
  }

  return (
    <div className="execute-confirm-card w-full max-w-md rounded-large-card border border-accent-green/60 bg-accent-green/5 p-5 animate-slide-in shadow-glow-sm">
      <div className="text-base font-semibold text-text-primary mb-1">🚀 Ready to Execute</div>
      <p className="text-[13px] text-text-secondary mb-5 leading-relaxed">
        This will run the planned tools on your connected accounts. Confirm the plan above looks correct.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExecute}
          disabled={clicked || isExecuting}
          className="px-4 py-2.5 rounded-lg bg-accent-green text-white text-[13px] font-semibold hover:scale-[1.02] transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {clicked || isExecuting ? 'Executing…' : 'Execute'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={clicked || isExecuting}
          className="px-4 py-2.5 rounded-lg border border-border text-[13px] text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
