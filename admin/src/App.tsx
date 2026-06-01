import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MailingList from "./pages/MailingList";
import { ActivityEditorPage } from "./pages/ActivityEditorPage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mailing-list" element={<MailingList />} />
        <Route
          path="/activities/new"
          element={<ActivityEditorPage mode="create" />}
        />
        <Route
          path="/activities/:activityId/edit"
          element={<ActivityEditorPage mode="edit" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
