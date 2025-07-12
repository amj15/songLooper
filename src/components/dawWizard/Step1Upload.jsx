import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Step1Upload({ next, songData, setSongData }) {
  const [name, setName] = useState(songData.name || "");

  function onFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const id = songData.id || uuidv4();
    setSongData({
      ...songData,
      id,
      name,
      audioFile: file,
    });
  }

  function onNext() {
    if (!songData.audioFile) {
      alert("Por favor, selecciona un archivo de audio");
      return;
    }
    if (!name.trim()) {
      alert("Por favor, pon un nombre para el proyecto");
      return;
    }
    setSongData({ ...songData, name });
    next();
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Paso 1: Carga una canción y ponle un nombre</h2>

      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="name">
          Nombre del proyecto
        </label>
        <input
          id="name"
          type="text"
          className="border border-gray-300 rounded p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Mi primer loop"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold" htmlFor="file">
          Selecciona archivo MP3
        </label>
        <input
          id="file"
          type="file"
          accept="audio/mp3,audio/mpeg"
          onChange={onFileChange}
        />
      </div>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={onNext}
      >
        Siguiente
      </button>
    </div>
  );
}
