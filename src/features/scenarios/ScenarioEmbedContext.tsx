import { createContext, useContext } from 'react'

// Every tool/visualizer page component (ToolPageLayout, VisualizerPageLayout,
// ReferencePageLayout) renders itself as if it owns the whole page: one <h1>,
// one breadcrumb schema block. A scenario stage embeds that exact same
// component nested inside its own page, so it needs to know it's embedded --
// context instead of threading an `embedded` prop through every tool/
// visualizer component (~15 of them, none of which otherwise need to know
// scenarios exist) down to the three shared layouts that actually care.
export const ScenarioEmbedContext = createContext(false)

export function useIsScenarioEmbed() {
  return useContext(ScenarioEmbedContext)
}
