import { useEffect, useRef, useState } from "react";

const REQUIRED_TAPS = 5;
const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "2/4"];
const SEMICORCHEA = 1 / 16;

export default function Step3TimeSignature({ next, songData, setSongData }) {
  const [selected, setSelected] = useState(songData.timeSignature || "4/4");
  const [validTaps, setValidTaps] = useState([]);
  const [listening, setListening] = useState(false);
  const [duration, setDuration] = useState(songData.duration || 0);
  const audioRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!songData.audioFile) return;

    const audio = new Audio(URL.createObjectURL(songData.audioFile));
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration * 1000);
    };

    if (listening) {
      audio.currentTime = 0;
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
        const bpm = songData.tempo;
        if (!bpm) {
          setErrorMsg("Define el tempo en el paso anterior.");
          return;
        }

        const beatsPerBar = parseInt(selected.split("/")[0]);
        const beatDuration = 60000 / bpm;
        const barDuration = beatDuration * beatsPerBar;
        const tolerance = barDuration * SEMICORCHEA;

        if (validTaps.length === 0) {
          setValidTaps([now]);
        } else {
          const firstTap = validTaps[0];
          const expectedNext = firstTap + validTaps.length * barDuration;
          const diff = Math.abs(now - expectedNext);

          if (diff <= tolerance) {
            setValidTaps((prev) => [...prev, now]);
          } else {
            setValidTaps([]);
            setErrorMsg("Desajuste detectado. Reiniciando las pulsaciones.");
          }
        }

        if (validTaps.length + 1 >= REQUIRED_TAPS) {
          setListening(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [listening, validTaps, selected, songData.tempo]);

  function calcularBars(refTime, bpm, timeSignature, duration) {
    const beatsPerBar = parseInt(timeSignature.split("/")[0]);
    const beatDuration = 60000 / bpm;
    const barDuration = beatDuration * beatsPerBar;

    const bars = [];

    // Hacia atrás
    let t = refTime;
    while (t > 0) {
      t -= barDuration;
      if (t > 0) bars.unshift(t);
    }

    // Referencia
    bars.push(refTime);

    // Hacia adelante
    t = refTime + barDuration;
    while (t < duration) {
      bars.push(t);
      t += barDuration;
    }

    return bars;
  }

  const onFinish = () => {
    if (!songData.tempo) {
      alert("Falta definir el tempo.");
      return;
    }

    if (validTaps.length < REQUIRED_TAPS) {
      alert(`Marca al menos ${REQUIRED_TAPS} veces el 1 del compás.`);
      return;
    }

    const referenceTap = validTaps[2];
    const bars = calcularBars(referenceTap, songData.tempo, selected, duration);

    setSongData({
      ...songData,
      timeSignature: selected,
      downbeats: validTaps,
      bars,
      duration,
    });

    next();
  };

  const progress = (validTaps.length / REQUIRED_TAPS) * 100;

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
            setValidTaps([]);
            setErrorMsg("");
            setListening(true);
          }}
        >
          Reproducir y empezar a marcar
        </button>
      )}

      {listening && (
        <>
          <p className="mb-2">
            Pulsa la barra espaciadora cuando escuches el primer golpe del compás. Marca 5 veces.
          </p>
          {errorMsg && <p className="text-red-500 mb-2">{errorMsg}</p>}
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
                strokeDashoffset={100 - progress}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-green-700 select-none">
              {validTaps.length}
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

      {!listening && validTaps.length >= REQUIRED_TAPS && (
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
