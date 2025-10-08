import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Disable right-click and common devtools shortcuts (basic deterrent)
if (typeof window !== 'undefined') {
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'f12' || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(key))) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
