import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";

import Landing from "./pages/landing";
import LoginPage from "./components/login";
import Dashboard from "./pages/dashboard";
import { ThemeProvider } from "./components/theme-provider";
import Streaming from "./pages/streaming";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/getstarted" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stream/:roomId" element={<Streaming />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;
