import React from 'react';

export default function AudioControls({ isPlaying, onPlayPause, onStop }) {
  return (
    <>
      <button
        onClick={onPlayPause}
        className="btn btn-secondary me-2"
      >
        { isPlaying ?
          <i className="fa-solid fa-pause"></i> :
          <i className="fa-solid fa-play"></i>
        }
      </button>
      <button
        onClick={onStop}
        className="btn btn-danger"
        disabled={!isPlaying}
      >
          <i className="fa-solid fa-stop"></i>
      </button>
    </>
  );
}
