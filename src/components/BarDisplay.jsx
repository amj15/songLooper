import React from 'react';

export default function BarDisplay({ currentTime, bars, tempo, timeSignature }) {
  console.log("BarDisplay props", { currentTime, bars, tempo, timeSignature });
    if (!bars || bars.length === 0) return null;
console.log(currentTime);
  // timeSignature = "4/4" → beatsPerBar = 4
  const beatsPerBar = parseInt(timeSignature.split('/')[0]);
  const msPerBeat = 60000 / tempo;
  const msPerBar = beatsPerBar * msPerBeat;

  // Buscar el compás actual (bar)
  const currentBarIndex = bars.findIndex((barStart, index) => {
    const nextBarStart = bars[index + 1] || Infinity;
    return currentTime >= barStart && currentTime < nextBarStart;
  });

  const currentBarStart = bars[currentBarIndex] || 0;
  const beatInBar = Math.floor((currentTime - currentBarStart) / msPerBeat) + 1;

  return (
    <div className="p-4 bg-white rounded shadow flex flex-col items-start space-y-1 font-mono text-sm">
      <div>Time: {(currentTime / 1000).toFixed(2)}s</div>
      <div>Bar: {currentBarIndex + 1}</div>
      <div>Beat: {beatInBar}</div>
    </div>
  );
}
