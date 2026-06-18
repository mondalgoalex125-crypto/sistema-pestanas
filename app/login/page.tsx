'use client';

import { useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation'; // 👈 CORREGIDO: Se agregó 'next/' adelante

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setCargando(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (user && user.email) {
        // Verificar si el correo está en la lista de administradores en Firestore
        const docRef = doc(db, 'config', 'admin_users');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const adminEmails = docSnap.data().emails || [];
          if (adminEmails.includes(user.email)) {
            // Es Administrador -> Redirigir al panel de control
            router.push('/admin');
            return;
          }
        }
        
        // No es Admin -> Es cliente común, redirigir al inicio
        router.push('/');
      }
    } catch (error) {
      console.error("Error al autenticar: ", error);
      alert("Error al iniciar sesión o acceso denegado.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 antialiased">
      <div className="max-w-md w-full bg-white border border-stone-200 p-8 rounded-3xl shadow-xl text-center">
        <span className="text-xs bg-stone-900 text-stone-100 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
          Portal de Acceso
        </span>
        <h1 className="text-2xl font-serif text-stone-950 mt-6">Bienvenido a Karen Lash.</h1>
        <p className="text-stone-500 text-xs font-light mt-2 mb-8">
          Identifícate de forma segura para acceder a tus paneles correspondientes.
        </p>

        <button
          onClick={handleLogin}
          disabled={cargando}
          className="w-full flex items-center justify-center gap-3 bg-stone-950 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-bold py-4 px-4 rounded-xl shadow-md transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {cargando ? 'Verificando...' : 'Continuar con Google'}
        </button>
      </div>
    </div>
  );
}