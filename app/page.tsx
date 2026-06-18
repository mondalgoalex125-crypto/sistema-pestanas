'use client';

import { useState } from 'react';
import { db } from './lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [servicio, setServicio] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [procesando, setProcesando] = useState(false);

  const servicios = [
    { id: '1', nombre: 'Extensiones Clásicas', precio: 'S/. 80', duracion: '1h 30m', desc: 'Efecto rímel natural y sofisticado, una extensión por cada pestaña propia.' },
    { id: '2', nombre: 'Volumen Ruso', precio: 'S/. 120', duracion: '2h 15m', desc: 'Máxima densidad, profundidad y volumen de impacto con abanicos ultra ligeros.' },
    { id: '3', nombre: 'Lifting de Pestañas', precio: 'S/. 60', duracion: '45m', desc: 'Curvatura natural desde la raíz que incluye tratamiento de nutrición y tinte.' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !telefono || !servicio || !fecha || !hora) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    setProcesando(true);
    try {
      await addDoc(collection(db, 'citas'), {
        cliente: nombre,
        telefono: telefono,
        servicio: servicio,
        fecha: fecha,
        hora: hora,
        estado: 'Pendiente',
        creadoEn: serverTimestamp()
      });
      alert("¡Tu solicitud de cita ha sido registrada con éxito! Nos comunicaremos contigo por WhatsApp.");
      setNombre('');
      setTelefono('');
      setServicio('');
      setFecha('');
      setHora('');
    } catch (error) {
      console.error("Error al guardar la cita: ", error);
      alert("Hubo un problema al registrar tu cita. Inténtalo de nuevo.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 font-sans antialiased">
      
      {/* HEADER ÚNICO Y CORREGIDO */}
      <header className="flex justify-between items-center p-6 bg-white/90 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
        <div className="text-xl font-serif tracking-widest text-stone-900 font-black">
          KAREN <span className="font-light text-amber-600">LASH</span>
        </div>
        <div className="flex items-center gap-6">
          <a 
            href="/login" 
            className="text-stone-500 hover:text-amber-600 text-xs uppercase tracking-wider font-semibold transition-colors duration-200"
          >
            Ingreso Staff
          </a>
          <a 
            href="#reserva" 
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs uppercase tracking-widest font-bold px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-amber-600/10"
          >
            Citas en Línea
          </a>
        </div>
      </header>

      {/* HERO SECTION LLAMATIVO */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-12 gap-12 items-start">
        
        <div className="md:col-span-7 space-y-8">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Salta, Argentina • Studio Premium
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-stone-950 leading-tight">
              Resalta el poder de <br />
              <span className="italic text-amber-600 font-normal">tu mirada</span>
            </h1>
            <p className="text-stone-500 text-sm md:text-base font-light max-w-md leading-relaxed">
              Diseño de pestañas personalizado de nivel internacional. Agenda una experiencia exclusiva en el corazón de Salta de manera inmediata.
            </p>
          </div>

          {/* LISTA DE SERVICIOS */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Servicios Disponibles</h3>
            <div className="space-y-3">
              {servicios.map((s) => (
                <div 
                  key={s.id}
                  onClick={() => setServicio(s.nombre)}
                  className={`p-5 rounded-2xl border bg-white transition-all duration-300 cursor-pointer flex justify-between items-center gap-4 hover:shadow-md ${
                    servicio === s.nombre ? 'border-amber-500 ring-1 ring-amber-500/50 bg-amber-50/20' : 'border-stone-200/80'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-stone-900 text-base">{s.nombre}</h4>
                    <p className="text-stone-400 font-light text-xs max-w-sm">{s.desc}</p>
                    <span className="inline-block text-xxs text-stone-400 font-mono bg-stone-50 px-2 py-0.5 rounded mt-1">⏳ {s.duracion}</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-lg font-serif font-black text-amber-600">{s.precio}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FORMULARIO DE RESERVA DE CITAS */}
        <div id="reserva" className="md:col-span-5 bg-white border border-stone-200/80 rounded-3xl p-8 shadow-xl shadow-stone-200/40 sticky top-28">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-bold text-stone-900">Formulario de Reserva</h2>
            <p className="text-stone-400 text-xs font-light mt-1">Ingresa tus datos a continuación</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-400 font-medium text-xxs uppercase tracking-wider mb-1.5">Nombre Completo</label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ariana Medina" 
                className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white text-stone-900 text-xs py-3 px-4 rounded-xl transition outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-medium text-xxs uppercase tracking-wider mb-1.5">WhatsApp de Contacto</label>
              <input 
                type="tel" 
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 387123456" 
                className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white text-stone-900 text-xs py-3 px-4 rounded-xl transition outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-400 font-medium text-xxs uppercase tracking-wider mb-1.5">Servicio Elegido</label>
              <select 
                value={servicio}
                onChange={(e) => setServicio(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white text-stone-900 text-xs py-3 px-4 rounded-xl transition outline-none appearance-none"
              >
                <option value="">Selecciona un servicio de la lista</option>
                {servicios.map((s) => (
                  <option key={s.id} value={s.nombre}>{s.nombre} ({s.precio})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 font-medium text-xxs uppercase tracking-wider mb-1.5">Fecha</label>
                <input 
                  type="date" 
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white text-stone-900 text-xs py-3 px-4 rounded-xl transition outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-400 font-medium text-xxs uppercase tracking-wider mb-1.5">Hora</label>
                <input 
                  type="time" 
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:bg-white text-stone-900 text-xs py-3 px-4 rounded-xl transition outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={procesando}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl mt-4 transition-all shadow-md shadow-amber-600/10"
            >
              {procesando ? 'Procesando...' : 'Confirmar Solicitud'}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}