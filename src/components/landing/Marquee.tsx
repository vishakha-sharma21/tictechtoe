'use client'

import React from 'react'
import { mockTools } from '@/lib/mock-data'
import { Button } from '@/components/shared/Button'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

// Separate component for the logo to handle error events
function LogoImage({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  const [hasError, setHasError] = React.useState(false)

  if (hasError) {
    return <div className="text-2xl font-bold text-text-primary">{fallback}</div>
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className="w-10 h-10 object-contain transition-all duration-300"
      onError={() => setHasError(true)}
    />
  )
}

export function Marquee() {
  // Create two sets for seamless circular loop
  const duplicatedTools = [...mockTools, ...mockTools]
  
  // Intersection Observer refs for different elements
  const [headerRef, headerVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [marqueeRef, marqueeVisible] = useIntersectionObserver({ threshold: 0.1 })

  return (
    <section className="py-16 overflow-hidden relative">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-96 bg-gradient-to-r from-surface to-transparent z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-surface to-transparent z-20" />
      
      {/* Section title */}
      <div 
        ref={headerRef}
        className={`text-center mb-12 transition-all duration-700 ease-out ${
          headerVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-6'
        }`}
      >
        <h2 className="text-5xl font-serif text-text-primary mb-4">
          Seamlessly connect everything 
          <br />
          you use
        </h2>
        <p className="text-2xl text-text-secondary max-w-2xl mx-auto mb-8">
          Works with all your favorite tools. VSCode, Cursor, Claude, and more.
        </p>
      </div>

      {/* Marquee container - true circular loop */}
      <div 
        ref={marqueeRef}
        className={`relative max-w-4xl mx-auto overflow-hidden transition-all duration-700 ease-out delay-200 ${
          marqueeVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex animate-marquee">
          {/* First set */}
          {mockTools.map((tool, index) => (
            <React.Fragment key={`${tool.id}-first`}>
              <div className="flex flex-col items-center gap-2 px-6 group cursor-pointer flex-shrink-0">
                {/* App logo with enhanced hover effect */}
                <div className="relative">
                  <div className="w-20 h-20 bg-white border border-border rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    <LogoImage 
                      src={tool.icon} 
                      alt={tool.name}
                      fallback={tool.name.charAt(0)}
                    />
                  </div>
                  {/* Enhanced glow on hover */}
                  <div className="absolute inset-0 bg-text-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                </div>
                
                {/* App name below logo */}
                <span className="text-base font-semibold text-text-primary group-hover:text-text-primary transition-colors text-center whitespace-nowrap">
                  {tool.name}
                </span>
              </div>
              
              {/* Minimal separator */}
              <div className="w-px h-8 bg-border/20 mx-2 flex-shrink-0" />
            </React.Fragment>
          ))}
          
          {/* Second set - exact duplicate for seamless loop */}
          {mockTools.map((tool, index) => (
            <React.Fragment key={`${tool.id}-second`}>
              <div className="flex flex-col items-center gap-2 px-6 group cursor-pointer flex-shrink-0">
                {/* App logo with enhanced hover effect */}
                <div className="relative">
                  <div className="w-20 h-20 bg-white border border-border rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                    <LogoImage 
                      src={tool.icon} 
                      alt={tool.name}
                      fallback={tool.name.charAt(0)}
                    />
                  </div>
                  {/* Enhanced glow on hover */}
                  <div className="absolute inset-0 bg-text-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                </div>
                
                {/* App name below logo */}
                <span className="text-base font-semibold text-text-primary group-hover:text-text-primary transition-colors text-center whitespace-nowrap">
                  {tool.name}
                </span>
              </div>
              
              {/* Minimal separator */}
              {index < mockTools.length - 1 && (
                <div className="w-px h-8 bg-border/20 mx-2 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
