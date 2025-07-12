import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "songLooperProjects";

export default function Files() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch {
        setProjects([]);
      }
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tus proyectos</h2>
      {projects.length === 0 ? (
        <p>No hay proyectos guardados todavía.</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id} className="border p-3 rounded hover:bg-gray-50 transition">
              <Link to={`/daw/${project.id}`} className="text-blue-600 hover:underline">
                {project.name || "Sin nombre"} ({project.timeSignature}, {project.tempo} BPM)
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
