import React from 'react'
import { mockRecipes } from '@/lib/mock-data'
import { getRecipeIcon } from '@/components/icons/RecipeIcons'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

export function RecipeGrid() {
  const [headerRef, headerVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [gridRef, gridVisible] = useIntersectionObserver({ threshold: 0.1 })

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div 
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ease-out ${
            headerVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-6'
          }`}
        >
          <h2 className="text-5xl font-serif text-text-primary mb-5">
            Ready-to-run recipes
          </h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto">
            Start with these proven workflows or build your own custom automations
          </p>
        </div>

        <div 
          ref={gridRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto transition-all duration-700 ease-out delay-200 ${
            gridVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          {mockRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`card p-6 cursor-pointer group border-[0.5px] border-[#e0ddd7] hover:border-[1px] hover:border-[#0a0a0a] hover:-translate-y-[2px] transition-all duration-[0.18s] ease ${
                recipe.isCTA ? 'border-2 border-dashed border-border hover:border-[#0a0a0a]' : ''
              }`}
            >
              {/* Tool Icons */}
              <div className="flex items-center gap-2 mb-4">
                {recipe.tools.map((tool, index) => {
                  const IconComponent = getRecipeIcon(tool)
                  return (
                    <div
                      key={index}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-[0.15s] ease"
                    >
                      <IconComponent size={28} />
                    </div>
                  )
                })}
              </div>

              {/* Title */}
              <h3 className="text-[15px] font-[500] text-[#0a0a0a] mb-2 group-hover:text-[16px] group-hover:font-[600] group-hover:text-[#0a0a0a] transition-all duration-[0.15s] ease">
                {recipe.title}
              </h3>

              {/* Description */}
              <p className="text-[13px] text-[#888888] mb-4 line-clamp-2 group-hover:text-[14px] group-hover:text-[#3d3d3d] transition-all duration-[0.15s] ease">
                {recipe.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#2563eb] group-hover:text-[#0a0a0a] group-hover:font-[500] transition-all duration-[0.15s] ease flex items-center gap-1">
                  {(() => {
                    const BuildIcon = getRecipeIcon('build')
                    return <BuildIcon size={14} />
                  })()}
                  Try this ?
                </span>
                {recipe.runs > 0 && (
                  <span className="text-[12px] font-mono text-[#bbbbbb] group-hover:text-[#888888] transition-all duration-[0.15s] ease">
                    {recipe.runs}+ runs
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
