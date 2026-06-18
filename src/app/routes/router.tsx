import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { ProjectsPage } from '@/pages/projects'
import { InputPage } from '@/pages/input'
import { BrdReviewPage } from '@/pages/brd-review'
import { QuestionSeedPage } from '@/pages/question-seed'
import { GraphOntologyPage } from '@/pages/graph-ontology'
import { DbInputPage } from '@/pages/db-input'
import { AlignmentPage } from '@/pages/alignment'
import { GraphFinalPage } from '@/pages/graph-final'
import { RequireAuth } from '@/features/require-auth'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<InputPage />} />
        <Route path="/brd" element={<BrdReviewPage />} />
        <Route path="/seed" element={<QuestionSeedPage />} />
        <Route path="/graph/ontology" element={<GraphOntologyPage />} />
        <Route path="/db" element={<DbInputPage />} />
        <Route path="/align" element={<AlignmentPage />} />
        <Route path="/graph/final" element={<GraphFinalPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
