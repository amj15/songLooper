import { useEffect, useRef, useState } from "react";

export default function Step2Tempo({ next, songData, setSongData }) {
  const [taps, setTaps] = useState([]);
  const [bpm, setBpm] = useState(null);
  const [pulse, setPulse] = useState(false); // para animación pulso
  const [waves, setWaves] = useState([]); // para mostrar ondas expansivas
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(URL.createObjectURL(songData.audioFile));
    audioRef.current = audio;
    audio.play();

    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        const now = performance.now();

        // pulso animado
        setPulse(true);
        setTimeout(() => setPulse(false), 200);

        // añadir onda
        const id = now;
        setWaves((ws) => [...ws, id]);
        setTimeout(() => setWaves((ws) => ws.filter((w) => w !== id)), 1000);

        setTaps((prev) => {
          const updated = [...prev, now];
          if (updated.length < 2) return updated;

          const intervals = updated
            .slice(1)
            .map((t, i) => t - updated[i])
            .filter((i) => i > 200 && i < 2000);

          if (intervals.length === 0) return updated;

          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          const newBpm = Math.round(60000 / avgInterval);

          setBpm(newBpm);

          if (intervals.length >= 20 && isStable(intervals)) {
            setSongData({ ...songData, tempo: newBpm });
            audio.pause();
            next();
          }

          return updated;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-6">Paso 2: Marca el tempo</h2>
      <p className="mb-4 text-center max-w-md">
        Pulsa la barra espaciadora al ritmo de la canción. Detectaremos el tempo automáticamente.
      </p>

      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Círculo base */}
        <div
          className={`rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-4xl select-none
            transition-transform duration-150 ease-out
            ${pulse ? "scale-110" : "scale-100"}`}
          style={{ width: 150, height: 150 }}
        >
          {bpm || "..."}
        </div>

        {/* Ondas expansivas */}
        {waves.map((id) => (
          <span
            key={id}
            className="absolute rounded-full border-4 border-blue-400 opacity-75 animate-wave"
            style={{ width: 150, height: 150, top: 0, left: 0 }}
          />
        ))}
      </div>

      <style>{`
        @keyframes wave {
          0% {
            transform: scale(1);
            opacity: 0.75;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-wave {
          animation: wave 1s linear forwards;
        }
      `}</style>
    </div>
  );
}

function isStable(intervals) {
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const deviation = intervals.map((i) => Math.abs(i - avg));
  const maxDev = Math.max(...deviation);
  return maxDev < 50;
}
