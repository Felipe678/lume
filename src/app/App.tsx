import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import HomePage from '../features/home/HomePage'
import FocoPage from '../features/foco/FocoPage'
import GradePage from '../features/grade/GradePage'
import ObjetivosPage from '../features/objetivos/ObjetivosPage'
import MesPage from '../features/mes/MesPage'
import ConquistasPage from '../features/conquistas/ConquistasPage'
import PerfilPage from '../features/perfil/PerfilPage'
import ConfigPage from '../features/config/ConfigPage'
import LoginPage from '../features/auth/LoginPage'
import GoalWizard from '../features/objetivos/GoalWizard'
import GoalDetailOverlay from '../features/objetivos/GoalDetailOverlay'
import TimeTravel from '../features/dev/TimeTravel'
import { useOverlays } from '../store/useOverlays'
import { useUiPrefs } from '../store/useUiPrefs'

/** Redireciona `/` para o Foco no primeiro carregamento quando o aparelho é o painel da parede. */
function StartRedirect() {
  const startScreen = useUiPrefs((s) => s.startScreen)
  const navigate = useNavigate()
  const location = useLocation()
  const applied = useRef(false)
  useEffect(() => {
    if (!applied.current && startScreen === 'foco' && location.pathname === '/') {
      navigate('/foco', { replace: true })
    }
    applied.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export default function App() {
  const wizardOpen = useOverlays((s) => s.wizardOpen)
  const detailGoalId = useOverlays((s) => s.detailGoalId)
  return (
    <BrowserRouter>
      <StartRedirect />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/foco" element={<FocoPage />} />
        <Route path="/grade" element={<GradePage />} />
        <Route path="/mes" element={<MesPage />} />
        <Route path="/objetivos" element={<ObjetivosPage />} />
        <Route path="/conquistas" element={<ConquistasPage />} />
        <Route path="/perfil" element={<PerfilPage />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {wizardOpen && <GoalWizard />}
      {detailGoalId && <GoalDetailOverlay goalId={detailGoalId} />}
      {import.meta.env.DEV && <TimeTravel />}
    </BrowserRouter>
  )
}
