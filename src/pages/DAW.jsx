import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const STORAGE_KEY = "songLooperProjects";

export default function DAW() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const found = stored.find((p) => p.id === id);
    setProject(found);
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setShowPopup(false);
    } else {
      alert("Por favor, selecciona un archivo de audio válido.");
    }
  };

  const updateCursor = () => {
    if (!audioRef.current || !project?.bars) return;

    const currentTime = audioRef.current.currentTime;
    const bars = project.bars;

    // Buscamos la barra actual según currentTime (en ms)
    const index = bars.findIndex((barTimeMs, i) => {
      const nextBarTimeMs = bars[i + 1] ?? Infinity;
      return (
        currentTime * 1000 >= barTimeMs &&
        currentTime * 1000 < nextBarTimeMs
      );
    });

    if (index !== -1) setCurrentIndex(index);

    if (audioRef.current.paused || audioRef.current.ended) {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      rafRef.current = requestAnimationFrame(updateCursor);
    }
  };

  const play = () => {
    if (!audioRef.current) return;
    audioRef.current.play();
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(updateCursor);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentIndex(0);
    cancelAnimationFrame(rafRef.current);
  };

  console.log("Project:", project);

  useEffect(() => {
    stop(); // Resetea playback y cursor si cambia la canción
  }, [audioUrl]);

  if (!project) {
    return <div className="p-4 text-center">Cargando proyecto...</div>;
  }

  const subdivisionsCount = Number(project.timeSignature.split("/")[0]);

  const firstBar = project.bars[0] ?? 0;
  const audioMs = audioRef.current ? audioRef.current.currentTime * 1000 : 0;
  const normalizedAudioMs = audioMs; // NO restes firstBar aquí

console.log("audioMs:", audioMs.toFixed(2), "firstBar:", firstBar.toFixed(2), "normalizedAudioMs:", normalizedAudioMs.toFixed(2));

return (
  <div className="p-6 max-w-6xl mx-auto">
    {showPopup && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">Selecciona una canción</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="mb-4"
          />
          <p className="text-sm text-gray-500">Formatos compatibles: mp3, wav, etc.</p>
        </div>
      </div>
    )}

    <audio
      ref={audioRef}
      src={audioUrl || project.audioUrl}
      preload="auto"
    />

    <div className="mb-6">
      <h1 className="text-3xl font-bold">{project.name}</h1>
      <p className="text-gray-600">{project.tempo} BPM – {project.timeSignature}</p>
    </div>

    {/* Topbar de control */}
    <div className="flex gap-2 mb-6">
      <button
        onClick={play}
        className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
        disabled={isPlaying}
      >
        ▶️ Play
      </button>
      <button
        onClick={pause}
        className="px-4 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600"
        disabled={!isPlaying}
      >
        ⏸️ Pause
      </button>
      <button
        onClick={stop}
        className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
      >
        ⏹️ Stop
      </button>
    </div>

    {/* Visualización barras subdivididas */}
    <div className="grid grid-cols-8 gap-0">
      {project.bars.map((startTime, index) => {
        const endTime = project.bars[index + 1] ?? startTime + 4000; // fallback para la última barra

        const normalizedStartTime = startTime - firstBar;
        const normalizedEndTime = endTime - firstBar;

        const barDuration = normalizedEndTime - normalizedStartTime;
        const subdivisionDuration = barDuration / subdivisionsCount;

        return (
          <div
            key={index}
            className="border border-gray-300"
          >
            <div className="flex h-24">
              {Array.from({ length: subdivisionsCount }).map((_, subIndex) => {
                const subStart = normalizedStartTime + subIndex * subdivisionDuration;
                const subEnd = subStart + subdivisionDuration;
                const isActive = normalizedAudioMs >= subStart && normalizedAudioMs < subEnd;

                return (
                  <div
                    key={subIndex}
                    className={`flex-1 border-l border-gray-200 transition-colors ${
                      isActive ? "bg-blue-100" : "bg-transparent"
                    }`}
                  >
                    {/* Puedes descomentar para mostrar números de subdivisión */}
                    {/* <span className="text-xs text-center block">{subIndex + 1}</span> */}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}
