// ...imports...
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabase";
import * as Tone from "tone";
import AudioControls from "../components/AudioControls";
import BarDisplay from "../components/BarDisplay";

export default function DAW() {
  const { id } = useParams();
  const metronomeSynth = useRef(
    new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
    }).toDestination()
  );

  const [project, setProject] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const rafRef = useRef(null);
  const metronomeLoopRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentSubdivision, setCurrentSubdivision] = useState(0);
  const [loopStart, setLoopStart] = useState(null);
  const [loopEnd, setLoopEnd] = useState(null);
  const [loopActive, setLoopActive] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      try {
        const { data: projectLoaded, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        console.log("Proyecto cargado:", projectLoaded);

        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from("user.songs")
          .createSignedUrl(projectLoaded.audio_url, 60 * 60 * 24);

        if (signedUrlError) throw signedUrlError;

        setProject({
          ...projectLoaded,
          audioUrl: signedUrlData.signedUrl,
        });
        setAudioUrl(signedUrlData.signedUrl);
      } catch {
        alert("No se pudo cargar el proyecto.");
      }
    }

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleBarClick = (index) => {
    if (loopStart === null) {
      setLoopStart(index);
      setLoopEnd(index);
    } else if (loopEnd === null) {
      if (index >= loopStart) {
        setLoopEnd(index);
      } else {
        setLoopStart(index);
        setLoopEnd(null);
      }
    } else {
      setLoopStart(index);
      setLoopEnd(null);
    }
  };

  const updateCursor = () => {
    if (!audioRef.current || !project?.bars) return;

    const currentTime = audioRef.current.currentTime * 1000;
    const bars = project.bars;
    const subdivisionsCount = Number(project.time_signature.split("/")[0]);

    let barIndex = bars.findIndex((barTimeMs, i) => {
      const nextBarTimeMs = bars[i + 1] ?? Infinity;
      return currentTime >= barTimeMs && currentTime < nextBarTimeMs;
    });

    if (barIndex === -1) barIndex = 0;

    if (loopActive && loopStart !== null && loopEnd !== null) {
      const loopEndTime = bars[loopEnd + 1] ?? bars[loopEnd] + 4000;
      if (currentTime >= loopEndTime) {
        audioRef.current.currentTime = bars[loopStart] / 1000;
        barIndex = loopStart;
      }
    }
console.log(audioRef.current.currentTime);
    setCurrentIndex(barIndex);

    const barStart = bars[barIndex];
    const barEnd = bars[barIndex + 1] ?? barStart + 4000;
    const barDuration = barEnd - barStart;
    const subdivisionDuration = barDuration / subdivisionsCount;

    const subdivisionIndex = Math.floor((currentTime - barStart) / subdivisionDuration);
    setCurrentSubdivision(subdivisionIndex);

    if (audioRef.current.paused || audioRef.current.ended) {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
    } else {
      rafRef.current = requestAnimationFrame(updateCursor);
    }
  };

  const playClick = (isDownbeat = false) => {
    const synth = metronomeSynth.current;
    if (!synth) return;

    const volume = isDownbeat ? -5 : -10;
    synth.volume.value = volume;
    synth.triggerAttackRelease("8n");
  };

  const startMetronome = () => {
    const bpm = Number(project.tempo);
    const beatsPerBar = Number(project.time_signature.split("/")[0]);

    Tone.Transport.bpm.value = bpm;

    let beatCount = 0;

    metronomeLoopRef.current = Tone.Transport.scheduleRepeat((time) => {
      const isDownbeat = beatCount % beatsPerBar === 0;
      playClick(isDownbeat);
      beatCount++;
    }, "4n");

    Tone.Transport.start();
  };

  const stopMetronome = () => {
    if (metronomeLoopRef.current) {
      Tone.Transport.clear(metronomeLoopRef.current);
      metronomeLoopRef.current = null;
    }
    Tone.Transport.stop();
  };

  const play = async () => {
    if (!audioRef.current) return;
    await Tone.start();
    startMetronome();
    audioRef.current.play();
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(updateCursor);
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentIndex(0);
    stopMetronome();
    cancelAnimationFrame(rafRef.current);
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    stopMetronome();
    cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    stop();
  }, [audioUrl]);

  if (!project) {
    return <div className="p-4 text-center">Cargando proyecto...</div>;
  }

  const subdivisionsCount = Number(project.time_signature.split("/")[0]);
  const firstBar = project.bars[0] ?? 0;
  const audioMs = audioRef.current ? audioRef.current.currentTime * 1000 : 0;
  const normalizedAudioMs = audioMs - firstBar;

  return (
    <div className="p-6 w-full">
      <audio ref={audioRef} src={audioUrl} preload="auto" />



    {/* ========== HEADER ========== */}
<header className="sticky top-4 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full before:absolute before:inset-0 before:max-w8xl before:mx-2 lg:before:mx-auto before:rounded-[26px] before:bg-neutral-800/30 before:backdrop-blur-md">
  <nav className="relative max-w-8xl w-full flex flex-wrap md:flex-nowrap basis-full items-center justify-between py-2 ps-5 pe-2 md:py-0 mx-2 lg:mx-auto">
    <div className="flex items-center">
      <div className="flex-none rounded-md text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80 text-white" aria-label="Project">
        {project.name}
      </div>
    </div>

    {/* Collapse */}
    <div id="hs-navbar-floating-dark" className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block" aria-labelledby="hs-navbar-floating-dark-collapse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-y-3 py-2 md:py-0 md:ps-7">
        <AudioControls
        isPlaying={isPlaying}
        onPlayPause={play}
        onStop={stop}
      />
        <a className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-white hover:text-neutral-300 focus:outline-hidden focus:text-neutral-300" href="../templates/agency/index.html" aria-current="page">Home</a>
        <a className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-white hover:text-neutral-300 focus:outline-hidden focus:text-neutral-300" href="#">Stories</a>
        <a className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-white hover:text-neutral-300 focus:outline-hidden focus:text-neutral-300" href="#">Reviews</a>
        <a className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-white hover:text-neutral-300 focus:outline-hidden focus:text-neutral-300" href="#">Approach</a>

        {/* Dropdown Link */}
        <div className="hs-dropdown [--strategy:static] md:[--strategy:absolute] [--adaptive:none] md:[--trigger:hover] [--auto-close:inside] md:inline-block">
          {/* Link Button */}
          <button id="hs-pro-anpd" type="button" className="hs-dropdown-toggle md:px-3 md:py-4 w-full md:w-auto flex items-center text-sm text-white hover:text-neutral-300 focus:outline-hidden focus:text-neutral-300" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
            Product
            <svg className="hs-dropdown-open:-rotate-180 md:hs-dropdown-open:rotate-0 duration-300 ms-auto md:ms-1 shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</header>




      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-gray-600">{project.tempo} BPM – {project.timeSignature}</p>
      </div>
      
      

      {audioRef.current && project?.bars?.length > 0 && (
        <BarDisplay
          currentTime={audioRef.current.currentTime * 1000} // Si estás usando tiempo en ms
          bars={project.bars}
          timeSignature={project.time_signature}
          tempo={project.tempo}
        />
      )}

      {/* Controles */}
      {/* <div className="flex gap-2 mb-6">
        <button onClick={play} className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700" disabled={isPlaying}>▶️ Play</button>
        <button onClick={pause} className="px-4 py-2 rounded text-white bg-yellow-500 hover:bg-yellow-600" disabled={!isPlaying}>⏸️ Pause</button>
        <button onClick={stop} className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700">⏹️ Stop</button>
        <button onClick={() => setLoopActive(!loopActive)} disabled={loopStart === null || loopEnd === null} className={`px-4 py-2 rounded text-white ${loopActive ? "bg-purple-700" : "bg-purple-500"} hover:bg-purple-600`}>
          {loopActive ? "Desactivar Loop" : "Activar Loop"}
        </button>
        <button onClick={() => { setLoopStart(null); setLoopEnd(null); setLoopActive(false); }} className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white">
          Limpiar Loop
        </button>
      </div> */}

      {/* Visualización */}
      <div className="grid grid-cols-8 gap-0">
        {project.bars.map((startTime, index) => {
          const endTime = project.bars[index + 1] ?? startTime + 4000;
          const normalizedStartTime = startTime - firstBar;
          const normalizedEndTime = endTime - firstBar;

          const barDuration = normalizedEndTime - normalizedStartTime;
          const subdivisionDuration = barDuration / subdivisionsCount;

          return (
            <div key={index} onClick={() => handleBarClick(index)} className={`m-1 p-0 rounded-[5px] border border-gray-100 cursor-pointer
              ${index === currentIndex ? "border-b-[7px] border-b-gray-500" : ""}
              ${loopStart !== null && loopEnd !== null && index >= loopStart && index <= loopEnd ? "bg-yellow-300" : ""}
            `}>
              <div className="flex h-24 overflow-hidden relative">
                {Array.from({ length: subdivisionsCount }).map((_, subIndex) => {
                  const isActiveSubdivision = index === currentIndex && subIndex === currentSubdivision;
                  const isDownbeat = subIndex === 0;
                  return (
                    <div key={subIndex} className={`flex-1 border-l border-gray-200 transition-colors ${
                      isActiveSubdivision
                        ? "bg-sky-500/50"
                        : isDownbeat
                        ? "bg-gray-100"
                        : "bg-transparent"
                    }`} />
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
