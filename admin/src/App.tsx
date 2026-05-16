import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MailingList from "./pages/MailingList";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mailing-list" element={<MailingList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
