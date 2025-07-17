import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabase";
import { v4 as uuidv4 } from "uuid";

export default function Step4Summary({ songData }) {
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  console.log(songData);

  const handleSave = async () => {
    setSaving(true);

    try {
      // 1. Obtener usuario
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      

      if (userError || !user) {
        throw new Error("No se pudo obtener el usuario. Asegúrate de haber iniciado sesión.");
      }

      // 2. Subir archivo a Supabase Storage

      const songId = uuidv4(); // genera un ID único
      const fileExt = songData.audioFile.name.split('.').pop(); // conserva la extensión, ej. mp3
      const path = `${songId}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from("user.songs")
        .upload(path, songData.audioFile);

      if (uploadError) {
        throw new Error("Error subiendo el archivo de audio: " + uploadError.message);
      }

      // 3. Guardar proyecto en la tabla
      const { error: insertError } = await supabase.from("projects").insert({
        user_id: user.id,
        name: songData.name,
        tempo: songData.tempo,
        time_signature: songData.timeSignature,
        bars: songData.bars, // si esto es JSON, Supabase lo acepta tal cual
        audio_url: path,
      });

      if (insertError) {
        throw new Error("Error al guardar el proyecto: " + insertError.message);
      }

      setIsSaved(true);
      navigate("/"); // redirección tras guardar
    } catch (err) {
      console.error("Fallo al guardar el proyecto:", err);
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
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
        disabled={isSaved || saving}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Guardando..." : isSaved ? "Guardado" : "Guardar proyecto"}
      </button>
    </div>
  );
}
