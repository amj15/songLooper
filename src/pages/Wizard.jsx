import { useEffect, useState } from "react";
import Step1Upload from "../components/dawWizard/Step1Upload";
import Step2Tempo from "../components/dawWizard/Step2Tempo";
import Step3TimeSignature from "../components/dawWizard/Step3TimeSignature";
import Step4Summary from "../components/dawWizard/Step4Summary";

const STORAGE_KEY = "songData";

export default function Wizard() {
  // Cargar desde localStorage o estado inicial
  const [step, setStep] = useState(1);
  const [songData, setSongData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {
      audioFile: null,
      audioBuffer: null,
      tempo: null,
      timeSignature: "4/4",
      downbeats: [],
      name: "",
      id: null,
      bars: [],
      duration: 0,
    };
  });

  // Guardar cada vez que songData cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songData));
  }, [songData]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {step === 1 && (
        <Step1Upload next={() => setStep(2)} songData={songData} setSongData={setSongData} />
      )}
      {step === 2 && (
        <Step2Tempo next={() => setStep(3)} songData={songData} setSongData={setSongData} />
      )}
      {step === 3 && (
        <Step3TimeSignature next={() => setStep(4)} songData={songData} setSongData={setSongData} />
      )}
      {step === 4 && <Step4Summary songData={songData} />}
    </div>
  );
}
