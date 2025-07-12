import { useEffect, useState } from "react";

const STORAGE_KEY = "songLooperProjects";

export default function Step4Summary({ songData }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    // Evita duplicados por ID
    const updated = stored.filter((item) => item.id !== songData.id);
    updated.push(songData);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setIsSaved(true);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Resumen del proyecto</h2>

      <div className="bg-gray-100 p-4 rounded space-y-2 text-sm">
        <div><strong>Nombre:</strong> {songData.name}</div>
        <div><strong>BPM estimado:</strong> {songData.tempo}</div>
        <div><strong>Compás:</strong> {songData.timeSignature}</div>
        <div><strong>Número de compases:</strong> {songData.downbeats?.length || 0}</div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaved}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSaved ? "Guardado" : "Guardar proyecto"}
      </button>
    </div>
  );
}
