import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { supabase } from "./services/supabase";
import Login from "./components/Login";
import Register from "./components/Register";
import Files from "./pages/Files";
import DAW from "./pages/DAW";
import Wizard from "./pages/Wizard";

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div>
        {showRegister ? (
          <>
            <Register onRegister={() => setShowRegister(false)} />
            <p className="text-center mt-4">
              ¿Ya tienes cuenta?{" "}
              <button
                onClick={() => setShowRegister(false)}
                className="text-blue-600 underline"
              >
                Inicia sesión
              </button>
            </p>
          </>
        ) : (
          <>
            <Login onLogin={setUser} />
            <p className="text-center mt-4">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => setShowRegister(true)}
                className="text-blue-600 underline"
              >
                Regístrate
              </button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Mi WebApp</h1>
          <nav className="space-x-4">
            <Link to="/files" className="text-gray-700 hover:text-blue-500">Files</Link>
            <Link to="/daw" className="text-gray-700 hover:text-blue-500">DAW</Link>
            <button
          onClick={handleLogout}
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        >
          Cerrar sesión
        </button>
          </nav>
        </div>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/files" element={<Files />} />
          <Route path="/daw" element={<Wizard />} />
          <Route path="/daw/:id" element={<DAW />} />
          <Route path="*" element={<Files />} />
        </Routes>
      </main>
    </div>
  );
}
