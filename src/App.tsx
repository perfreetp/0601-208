import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Lobby from "@/pages/Lobby";
import Island from "@/pages/Island";
import Tasks from "@/pages/Tasks";
import Build from "@/pages/Build";
import Voice from "@/pages/Voice";
import MapPage from "@/pages/MapPage";
import Replay from "@/pages/Replay";
import Host from "@/pages/Host";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/island" element={<Island />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/build" element={<Build />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/replay" element={<Replay />} />
        <Route path="/host" element={<Host />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
