import { Link, Route, Routes } from "react-router-dom";
import Files from "./pages/Files";
import DAW from "./pages/DAW";
import Wizard from "./pages/Wizard";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Mi WebApp</h1>
          <nav className="space-x-4">
            <Link to="/files" className="text-gray-700 hover:text-blue-500">Files</Link>
            <Link to="/daw" className="text-gray-700 hover:text-blue-500">DAW</Link>
          </nav>
        </div>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/files" element={<Files />} />
          <Route path="/daw" element={<Wizard />} />
          <Route path="/daw/:id" element={<DAW />} />
          <Route path="*" element={<Files />} />
        </Routes>
      </main>
    </div>
  );
}
