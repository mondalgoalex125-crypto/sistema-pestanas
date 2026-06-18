'use client';

import { useEffect, useState } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface Cita {
  id: string;
  cliente: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Escuchar el estado de autenticación del usuario
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCargandoAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Escuchar las citas de Firestore SOLO si el usuario está autenticado
  useEffect(() => {
    if (!user) return;

    setCargandoDatos(true);
    const q = query(collection(db, 'citas'), orderBy('creadoEn', 'desc'));

    const unsubscribeData = onSnapshot(q, (querySnapshot) => {
      const citasArray: Cita[] = [];
      querySnapshot.forEach((doc) => {
        citasArray.push({ id: doc.id, ...doc.data() } as Cita);
      });
      setCitas(citasArray);
      setCargandoDatos(false);
    }, (error) => {
      console.error("Error escuchando citas: ", error);
      setCargandoDatos(false);
    });

    return () => unsubscribeData();
  }, [user]);

  const loginConGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error en Login: ", error);
    }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    setCitas([]);
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    await updateDoc(doc(db, 'citas', id), { estado: nuevoEstado });
  };

  const eliminarCita = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
      await deleteDoc(doc(db, 'citas', id));
    }
  };

  if (cargandoAuth) {
    return (
      <div className="min-h-screen bg-[#141412] flex items-center justify-center">
        <p className="text-stone-500 font-mono text-xs tracking-widest animate-pulse">VERIFICANDO CREDENCIALES...</p>
      </div>
    );
  }

  // ---------------- VISTA 1: PANTALLA DE LOGIN PROFESIONAL ----------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#141412] flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full bg-[#1c1c1a] border border-stone-800 p-8 rounded-3xl shadow-2xl text-center">
          <div className="w-12 h-12 bg-stone-900 border border-stone-800 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-xl">
            🔒
          </div>
          <h1 className="text-xl font-medium tracking-wider text-white uppercase">Acceso Administrativo</h1>
          <p className="text-stone-500 text-xs font-light mt-1.5 mb-8 leading-relaxed">
            Área protegida de Lash & Co. Inicia sesión para gestionar agendas, clientes y solicitudes activas.
          </p>

          <button
            onClick={loginConGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-100 text-stone-900 text-xs uppercase tracking-widest font-bold py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
          >
            {/* SVG Oficial del logo de Google */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Acceder con Google
          </button>
        </div>
      </div>
    );
  }

  // ---------------- VISTA 2: DASHBOARD ORIGINAL PROTEGIDO ----------------
  return (
    <div className="min-h-screen bg-[#141412] text-stone-300 p-6 md:p-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4 border-b border-stone-800 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-wider text-white uppercase">Panel Interno de Control</h1>
            <div className="flex items-center gap-2 mt-1.5 text-stone-500 text-xs">
              <span>Sesión iniciada como: <strong className="text-stone-300 font-medium">{user.displayName || user.email}</strong></span>
            </div>
          </div>
          <button 
            onClick={cerrarSesion}
            className="text-stone-400 bg-stone-900 border border-stone-800 hover:border-red-900 hover:text-red-400 text-xxs uppercase tracking-wider font-bold px-4 py-2 rounded-xl transition"
          >
            Cerrar Sesión
          </button>
        </header>

        {cargandoDatos ? (
          <div className="text-center py-20 text-stone-500 text-sm tracking-widest">Sincronizando con base de datos...</div>
        ) : citas.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-stone-800 rounded-3xl text-stone-500">
            No hay solicitudes de citas registradas aún.
          </div>
        ) : (
          <div className="bg-stone-900/60 rounded-2xl border border-stone-800/80 overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-400 text-xs font-bold uppercase tracking-wider border-b border-stone-800">
                    <th className="p-5">Cliente</th>
                    <th className="p-5">Servicio</th>
                    <th className="p-5">Fecha / Hora</th>
                    <th className="p-5">WhatsApp</th>
                    <th className="p-5">Estado</th>
                    <th className="p-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850 text-sm">
                  {citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-stone-850/40 transition-colors">
                      <td className="p-5 font-medium text-white">{cita.cliente}</td>
                      <td className="p-5 text-amber-400/90 font-light">{cita.servicio}</td>
                      <td className="p-5">
                        <div className="text-stone-200">{cita.fecha}</div>
                        <div className="text-xs text-stone-500 font-mono mt-0.5">{cita.hora}</div>
                      </td>
                      <td className="p-5">
                        <a 
                          href={`https://wa.me/51${cita.telefono}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-stone-300 hover:text-emerald-400 hover:underline transition-colors font-mono"
                        >
                          {cita.telefono} ↗
                        </a>
                      </td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-full text-xxs tracking-wider uppercase font-bold border ${
                          cita.estado === 'Confirmada' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' :
                          cita.estado === 'Pendiente' ? 'bg-amber-950/40 text-amber-400 border-amber-900' :
                          'bg-stone-800 text-stone-400 border-stone-700'
                        }`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td className="p-5 text-right space-x-2 whitespace-nowrap">
                        {cita.estado === 'Pendiente' && (
                          <button 
                            onClick={() => cambiarEstado(cita.id, 'Confirmada')}
                            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-1.5 rounded-lg transition"
                          >
                            Confirmar
                          </button>
                        )}
                        <button 
                          onClick={() => eliminarCita(cita.id)}
                          className="bg-stone-800 hover:bg-red-950/60 hover:text-red-400 text-stone-400 text-xs px-2.5 py-1.5 rounded-lg transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}