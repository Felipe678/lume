import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import PainelPage from '../features/painel/PainelPage'
import GradePage from '../features/grade/GradePage'
import ObjetivosPage from '../features/objetivos/ObjetivosPage'
import TimeTravel from '../features/dev/TimeTravel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PainelPage />} />
        <Route path="/grade" element={<GradePage />} />
        <Route path="/objetivos" element={<ObjetivosPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {import.meta.env.DEV && <TimeTravel />}
    </BrowserRouter>
  )
}
