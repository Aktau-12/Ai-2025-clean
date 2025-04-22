import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import CoreTalentsTest from "./pages/CoreTalentsTest";
import CoreTalentsResults from "./pages/CoreTalentsResults";
import BigFiveTest from "./pages/BigFiveTest";
import BigFiveResultsPage from "./pages/BigFiveResultsPage";
import MBTITest from "./pages/MBTITest";
import MBTIResults from "./pages/MBTIResults";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivateRoute from "./components/PrivateRoute";
import HeroJourney from "./pages/HeroJourney"; // ✅ добавлено
import HabitTracker from "./pages/HabitTracker"; // ✅ НОВОЕ
const API_URL = import.meta.env.VITE_API_URL;


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/coretalents"
          element={
            <PrivateRoute>
              <CoreTalentsTest />
            </PrivateRoute>
          }
        />
        <Route
          path="/coretalents/results"
          element={
            <PrivateRoute>
              <CoreTalentsResults />
            </PrivateRoute>
          }
        />

        <Route
          path="/bigfive"
          element={
            <PrivateRoute>
              <BigFiveTest />
            </PrivateRoute>
          }
        />
        <Route
          path="/bigfive/results"
          element={
            <PrivateRoute>
              <BigFiveResultsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/mbti"
          element={
            <PrivateRoute>
              <MBTITest />
            </PrivateRoute>
          }
        />
        <Route
          path="/mbti/results"
          element={
            <PrivateRoute>
              <MBTIResults />
            </PrivateRoute>
          }
        />

        <Route
          path="/hero"
          element={
            <PrivateRoute>
              <HeroJourney />
            </PrivateRoute>
          }
        />

        <Route
          path="/habits"
          element={
            <PrivateRoute>
              <HabitTracker />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
