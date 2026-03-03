import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import StatusPage from './components/StatusPage.jsx'
import './index.css'
import './Mobile.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/status" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
