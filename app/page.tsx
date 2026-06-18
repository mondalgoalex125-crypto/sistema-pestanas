'use client';

import { useState } from 'react';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SERVICIOS = [
  { id: '1', nombre: 'Extensiones Clásicas', precio: 'S/. 80', duracion: '1h 30m', desc: 'Efecto rímel natural y elegante, una extensión por cada pestaña propia.' },
  { id: '2', nombre: 'Volumen Ruso', precio: 'S/. 120', duracion: '2h 15m', desc: 'Máxima densidad, profundidad y volumen con abanicos ultra ligeros.' },
  { id: '3', nombre: 'Lifting de Pestañas', precio: 'S/. 60', duracion: '45m', desc: 'Curvatura natural desde la raíz, incluye tratamiento de nutrición y tinte.' },
];

export default function Home() {
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicioSeleccionado) return;
    
    setCargando(true);
    try {
      // Guardando los datos en tiempo real en la colección 'citas' de Firestore
      await addDoc(collection(db, 'citas'), {
        cliente: nombre,
        telefono: telefono,
        servicio: servicioSeleccionado,
        fecha: fecha,
        hora: hora,
        estado: 'Pendiente',
        creadoEn: serverTimestamp()
      });
      
      setEnviado(true);
      // Limpiar campos
      setNombre('');
      setTelefono('');
      setFecha('');
      setHora('');
    } catch (error) {
      console.error("Error al guardar la cita: ", error);
      alert("Hubo un error al procesar tu cita. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-stone-800 antialiased selection:bg-amber-200">
      {/* Navbar Minimalista */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold tracking-widest text-stone-900 uppercase">Lash & Co.</span>
          <span className="text-xs bg-stone-900 text-stone-100 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">Citas En Línea</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-950">
          Resalta el poder de <span className="font-serif italic text-amber-700">tu mirada</span>
        </h1>
        <p className="mt-4 text-stone-500 font-light max-w-lg mx-auto">
          Selecciona el servicio de tu preferencia y agenda una experiencia de belleza personalizada de manera inmediata.
        </p>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Catálogo de Servicios */}
        <section className="lg:col-span-7 space-y-4">
          <h2 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-2">Servicios Disponibles</h2>
          {SERVICIOS.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setServicioSeleccionado(item.nombre)}
              className={`p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                servicioSeleccionado === item.nombre 
                  ? 'border-amber-600 shadow-md shadow-amber-100/50 translate-x-1' 
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-medium text-lg text-stone-900 group-hover:text-amber-800 transition-colors">{item.nombre}</h3>
                  <p className="text-sm text-stone-500 font-light mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-semibold text-stone-900">{item.precio}</span>
                  <div className="text-xs text-stone-400 mt-1 font-mono">⏳ {item.duracion}</div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Formulario Dinámico */}
        <section className="lg:col-span-5">
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-sm sticky top-24">
            <h2 className="text-xl font-medium text-stone-900 tracking-tight">Formulario de Reserva</h2>
            <p className="text-xs text-stone-400 font-light mt-1 mb-6">Ingresa tus datos a continuación</p>

            {enviado ? (
              <div className="py-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
                <h3 className="text-stone-900 font-medium text-xl mt-4">¡Solicitud Procesada!</h3>
                <p className="text-stone-500 text-sm font-light mt-2 px-4">Tu espacio ha sido apartado exitosamente. Nos pondremos en contacto vía WhatsApp.</p>
                <button 
                  onClick={() => setEnviado(false)}
                  className="mt-8 text-xs uppercase tracking-widest font-bold text-amber-700 hover:text-amber-900 transition-colors"
                >
                  Registrar otra cita
                </button>
              </div>
            ) : (
              <form onSubmit={handleReserva} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1.5">Nombre Completo</label>
                  <input 
                    type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-950 outline-none transition bg-stone-50/50 text-sm"
                    placeholder="Ej. Ariana Medina"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1.5">WhatsApp de Contacto</label>
                  <input 
                    type="tel" required value={telefono} onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-950 outline-none transition bg-stone-50/50 text-sm"
                    placeholder="Ej. 912345678"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1.5">Servicio Elegido</label>
                  <input 
                    type="text" disabled required value={servicioSeleccionado}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-sm font-medium cursor-not-allowed"
                    placeholder="Selecciona un servicio de la lista"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1.5">Fecha</label>
                    <input 
                      type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-950 outline-none transition bg-stone-50/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1.5">Hora</label>
                    <input 
                      type="time" required value={hora} onChange={(e) => setHora(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-900 focus:ring-1 focus:ring-stone-950 outline-none transition bg-stone-50/50 text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!servicioSeleccionado || cargando}
                  className="w-full mt-4 bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-widest font-bold py-4 px-4 rounded-xl shadow-lg transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cargando ? 'Procesando...' : 'Confirmar Solicitud'}
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}