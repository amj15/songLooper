import { useEffect, useRef, useState } from "react";

const MAX_TAPS = 10;
const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "2/4"];

export default function Step3TimeSignature({ next, songData, setSongData }) {
  const [selected, setSelected] = useState(songData.timeSignature || "4/4");
  const [downbeats, setDownbeats] = useState(songData.downbeats || []);
  const [listening, setListening] = useState(false);
  const audioRef = useRef(null);
  const [bars, setBars] = useState([]);
  const [duration, setDuration] = useState(songData.duration || 0);

  useEffect(() => {
    if (!songData.audioFile) return;

    const audio = new Audio(URL.createObjectURL(songData.audioFile));
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration * 1000);
    };

    if (listening) {
      audio.play();
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [songData.audioFile, listening]);

  useEffect(() => {
    if (!listening) return;

    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        const now = audioRef.current.currentTime * 1000;
        setDownbeats((prev) => {
          if (prev.length >= MAX_TAPS) return prev; // no más taps
          const newDownbeats = [...prev, now];
          if (newDownbeats.length >= MAX_TAPS) {
            setListening(false);
          }
          return newDownbeats;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [listening]);

  function calcularBars(downbeats, bpm, timeSignature, duration) {
    if (downbeats.length === 0) return [];

    const beatsPerBar = parseInt(timeSignature.split("/")[0], 10);
    const beatDuration = 60000 / bpm;
    const barDuration = beatDuration * beatsPerBar;
    const firstDownbeat = average(downbeats);

    let bars = [];
    let current = firstDownbeat;

    while (current < duration) {
      bars.push(current);
      current += barDuration;
    }

    if (bars[0] > barDuration * 0.5) {
      bars.unshift(bars[0] - barDuration);
    }

    return bars;
  }

  function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  const onFinish = () => {
    const bpm = songData.tempo;
    if (!bpm) {
      alert("Falta definir el tempo en el paso anterior");
      return;
    }

    if (downbeats.length < MAX_TAPS) {
      alert(`Por favor, marca al menos ${MAX_TAPS} veces el inicio del compás.`);
      return;
    }

    const barsCalc = calcularBars(downbeats, bpm, selected, duration);

    setBars(barsCalc);

    setSongData({
      ...songData,
      timeSignature: selected,
      downbeats,
      bars: barsCalc,
      duration,
    });
    next();
  };

  // Cálculo para animar el círculo (porcentaje de borde completo)
  const circleProgress = (downbeats.length / MAX_TAPS) * 100;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Paso 3: Selecciona el compás y marca el "1"</h2>

      <div className="mb-4">
        <label className="block mb-2 font-semibold">Compás:</label>
        <select
          className="border border-gray-300 rounded p-2"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={listening}
        >
          {TIME_SIGNATURES.map((ts) => (
            <option key={ts} value={ts}>
              {ts}
            </option>
          ))}
        </select>
      </div>

      {!listening && (
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4"
          onClick={() => {
            setDownbeats([]);
            setBars([]);
            setListening(true);
          }}
        >
          Empezar a reproducir y marcar el "1" (barra espaciadora)
        </button>
      )}

      {listening && (
        <>
          <p className="mb-4">
            Pulsa la barra espaciadora cuando escuches el "1" de cada compás. Marca al menos {MAX_TAPS} veces.
          </p>

          <div className="mx-auto mb-4 w-24 h-24 relative">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                className="text-gray-300"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
              />
              <circle
                className="text-green-500 transition-all duration-150 ease-out"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                cx="18"
                cy="18"
                r="15.9155"
                strokeDasharray="100"
                strokeDashoffset={100 - circleProgress}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-700 select-none">
              {downbeats.length}
            </div>
          </div>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => setListening(false)}
          >
            Parar reproducción
          </button>
        </>
      )}

      {downbeats.length >= MAX_TAPS && !listening && (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={onFinish}
        >
          Guardar y continuar
        </button>
      )}
    </div>
  );
}
