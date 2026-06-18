import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/login'
import { ProjectsPage } from '@/pages/projects'
import { InputPage } from '@/pages/input'
import { BrdReviewPage } from '@/pages/brd-review'
import { QuestionSeedPage } from '@/pages/question-seed'
import { ResultPage } from '@/pages/result'
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
        <Route path="/:projectId" element={<ResultPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
