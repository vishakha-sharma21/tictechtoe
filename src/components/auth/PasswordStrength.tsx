'use client'

interface PasswordStrengthProps {
  strength: 0 | 1 | 2 | 3 | 4
}

export default function PasswordStrength({ strength }: PasswordStrengthProps) {
  const getSegmentColor = (index: number) => {
    if (strength === 0) return 'bg-gray-300'
    if (strength === 1) return index === 0 ? 'bg-red-500' : 'bg-gray-300'
    if (strength === 2) return index <= 1 ? 'bg-amber-500' : 'bg-gray-300'
    if (strength === 3) return index <= 2 ? 'bg-yellow-500' : 'bg-gray-300'
    if (strength === 4) return 'bg-green-500'
    return 'bg-gray-300'
  }

  const getStrengthText = () => {
    if (strength === 0) return ''
    if (strength === 1) return 'Weak'
    if (strength === 2) return 'Fair'
    if (strength === 3) return 'Good'
    if (strength === 4) return 'Strong'
    return ''
  }

  const getStrengthColor = () => {
    if (strength === 0) return 'text-gray-500'
    if (strength === 1) return 'text-red-500'
    if (strength === 2) return 'text-amber-500'
    if (strength === 3) return 'text-yellow-500'
    if (strength === 4) return 'text-green-500'
    return 'text-gray-500'
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${getSegmentColor(index)}`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className={`text-xs ${getStrengthColor()}`}>{getStrengthText()}</p>
      )}
    </div>
  )
}
