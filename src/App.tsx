import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SceneSelect from "@/pages/SceneSelect";
import Player from "@/pages/Player";
import Stickers from "@/pages/Stickers";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SceneSelect />} />
        <Route path="/player/:sceneId" element={<Player />} />
        <Route path="/stickers" element={<Stickers />} />
      </Routes>
    </Router>
  );
}
