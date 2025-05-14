
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/toaster"

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <>
      <App />
      <Toaster />
    </>
  );
}

// Enable hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept();
}
