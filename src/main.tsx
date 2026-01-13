/**
 * Web 앱 진입점입니다.
 *
 * - React 앱을 DOM(#root)에 마운트합니다.
 * - 향후 여기서 전역 라우터/상태관리/에러 바운더리 등을 초기화할 수 있습니다.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/site.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
