'use client';

import { useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setCargando(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user || !user.email) {
        alert("El proveedor de Google no retornó información de usuario.");
        return;
      }

      // 1. Diagnóstico inicial en pantalla: qué correo leyó Google
      console.log("Usuario autenticado en Google exitosamente:", user.email);

      // 2. Buscar en Firestore dentro de config/admin_users
      const docRef = doc(db, 'config', 'admin_users');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const adminData = docSnap.data();
        const adminEmails = adminData.emails || [];
        
        // Convertimos todo a minúsculas para evitar que falle por una mayúscula
        const correoLimpio = user.email.toLowerCase().trim();
        const listaLimpiada = adminEmails.map((email: string) => email.toLowerCase().trim());

        if (listaLimpiada.includes(correoLimpio)) {
          // ¡ÉXITO! Es administrador. Forzamos la redirección al panel.
          router.push('/admin');
          return;
        } else {
          // Si el login fue correcto pero NO está en la lista de Firestore
          alert(`Acceso Denegado: El correo "${user.email}" no está registrado en la lista de administradores en Firestore.`);
        }
      } else {
        alert("Error de Configuración: No se encontró el documento 'admin_users' dentro de la colección 'config' en tu Firestore database.");
      }
      
    } catch (error: any) {
      console.error("Detalle completo del error en consola:", error);
      
      // Capturamos los códigos exactos de Firebase para darte la solución directa
      if (error.code === 'auth/unauthorized-domain') {
        alert(`Dominio no autorizado.\n\nDebes ir a Firebase Console > Authentication > Configuración > Dominios Autorizados y agregar exactamente el dominio desde el que estás navegando ahora.`);
      } else if (error.code === 'auth/operation-not-allowed') {
        alert("Error: El proveedor de inicio de sesión con Google está deshabilitado en tu consola de Firebase. Actívalo en la pestaña 'Método de acceso'.");
      } else {
        alert(`Error técnico de Firebase (${error.code || 'Desconocido'}): ${error.message}`);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 antialiased relative overflow-hidden">
      {/* Elementos decorativos de fondo tipo Studio Premium */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-md border border-stone-200/60 p-10 rounded-[2.5rem] shadow-xl shadow-stone-200/40 text-center relative z-10">
        
        {/* Identificador de Ubicación de Marca */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200/60 text-amber-700 px-4 py-1.5 rounded-full text-xxs font-bold uppercase tracking-widest mx-auto">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
          Salta, Argentina
        </div>

        {/* Branding principal refinado */}
        <h1 className="text-3xl font-serif text-stone-950 mt-8 tracking-wide font-black">
          KAREN <span className="font-light text-amber-600 italic">LASH</span>
        </h1>
        
        <div className="w-12 h-[1px] bg-amber-500/40 mx-auto mt-4 mb-4" />

        <p className="text-stone-500 text-xs font-light max-w-xs mx-auto leading-relaxed mb-10">
          Ingresa al módulo administrativo para gestionar la agenda de turnos, servicios y parámetros del sistema.
        </p>

        {/* Botón interactivo premium */}
        <button
          onClick={handleLogin}
          disabled={cargando}
          className="w-full flex items-center justify-center gap-3 bg-stone-950 hover:bg-amber-600 text-white text-xs uppercase tracking-widest font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-amber-600/10 transition-all duration-300 disabled:opacity-50 group"
        >
          {cargando ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verificando Credenciales...
            </span>
          ) : (
            <>
              <svg className="w-4 h-4 transition-transform group-hover:scale-110 duration-200" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#ffffff" className="opacity-90" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#ffffff" className="opacity-80" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                <path fill="#ffffff" className="opacity-90" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Identificarse con Google</span>
            </>
          )}
        </button>

        {/* Retorno discreto a la web */}
        <div className="mt-8">
          <a href="/" className="text-stone-400 hover:text-stone-600 text-xxs tracking-wider uppercase font-medium transition-colors">
            ← Volver a la página principal
          </a>
        </div>

      </div>
    </div>
  );
}