"use client"

import * as React from "react"

export function ProgressCircular() {
  const [progress, setProgress] = React.useState(13)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  // Calculate the circumference of the circle
  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate the stroke dash offset based on progress
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex items-center justify-center">
      <div className="relative h-[120px] w-[120px]">
        {/* Progress percentage in the middle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-medium">{Math.round(progress)}%</span>
        </div>

        {/* SVG for circular progress */}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {/* Background circle */}
          <circle cx={size / 2} cy={size / 2} r={radius} className="fill-none stroke-muted stroke-[8px]" />

          {/* Foreground circle (progress) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="fill-none stroke-primary stroke-[8px] transition-all duration-300 ease-in-out"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
