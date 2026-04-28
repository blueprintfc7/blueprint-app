import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@/index.css'

// Auto-apply dark class based on system preference (only if user hasn't manually overridden)
if (!document.documentElement.classList.contains('light') && !document.documentElement.classList.contains('dark')) {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
