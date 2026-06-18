'use client';

import { useEffect, useState } from 'react';
import { db, auth, googleProvider } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Escuchar el estado de autenticación y validar rol en base de datos
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        try {
          // Validar si el correo figura en el documento de administradores
          const docRef = doc(db, 'config', 'admin_users');
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const adminEmails = docSnap.data().emails || [];
            if (adminEmails.includes(currentUser.email)) {
              setUser(currentUser);
              setCargandoAuth(false);
              return;
            }
          }
          
          // Si no es admin, rechazar acceso
          alert("Acceso denegado. No tienes permisos de administrador.");
          await signOut(auth);
          setUser(null);
          router.push('/login');
        } catch (error) {
          console.error("Error validando permisos:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setCargandoAuth(false);
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Escuchar las citas de Firestore en tiempo real (solo si es Admin validado)
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

  const cerrarSesion = async () => {
    await signOut(auth);
    setCitas([]);
    router.push('/login');
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

  if (!user) {
    return null; // Evita parpadeos mientras redirige a /login
  }

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
            className="text-stone-400 bg-stone-900 border border-stone-800 hover:border-red-900 hover:text-red-400 text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-xl transition"
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
                        <span className={`px-2.5 py-1 rounded-full text-xs tracking-wider uppercase font-bold border ${
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