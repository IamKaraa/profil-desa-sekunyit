import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, Compass, Layers, Globe, Maximize, MapPin, Tractor, Trees, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function GeologisUser() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // State untuk menampung data dari Supabase
  const [mapImage, setMapImage] = useState(null);
  const [dataGeo, setDataGeo] = useState({
    luas_total: '-', luas_belum: '-', 
    utara: '-', selatan: '-', timur: '-', barat: '-',
    lahan: [], pertanian: [], perkebunan: []
  });

  // Koordinat Peta Interaktif (Google Maps)
  const mapEmbedUrl = "https://maps.google.com/maps?q=Sekunyit,%20Kaur,%20Bengkulu&t=&z=14&ie=UTF8&iwloc=&output=embed";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ambil semua data profil desa sekaligus untuk efisiensi
        const { data, error } = await supabase.from('desa_profil').select('*');
        if (error) throw error;

        if (data) {
          // 1. Ambil foto peta dari kategori 'struktur' (karena admin mengunggahnya di sana)
          const dataStruktur = data.find(d => d.kategori === 'struktur')?.data;
          if (dataStruktur && dataStruktur.peta_desa) {
            setMapImage(dataStruktur.peta_desa);
          }

          // 2. Ambil rincian geografi dari kategori 'geografi'
          const rawGeo = data.find(d => d.kategori === 'geografi')?.data;
          if (rawGeo) {
            setDataGeo({
              luas_total: rawGeo.luas_total || '-',
              luas_belum: rawGeo.luas_belum || '-',
              utara: rawGeo.utara || '-',
              selatan: rawGeo.selatan || '-',
              timur: rawGeo.timur || '-',
              barat: rawGeo.barat || '-',
              lahan: Array.isArray(rawGeo.lahan) ? rawGeo.lahan : [],
              pertanian: Array.isArray(rawGeo.pertanian) ? rawGeo.pertanian : [],
              perkebunan: Array.isArray(rawGeo.perkebunan) ? rawGeo.perkebunan : []
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data geografi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOGIKA MINI CHART PERKEBUNAN ---
  // Kita konversi string seperti "19 HA" menjadi angka 19 untuk dihitung persentasenya
  const parseNumber = (str) => {
    if (!str) return 0;
    const num = parseFloat(str.replace(/[^0-9,.]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  };

  const parsedPerkebunan = dataGeo.perkebunan
    .map(item => ({ name: item.name, value: parseNumber(item.value) }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value); // Urutkan dari yang terbesar

  const totalLuasPerkebunan = parsedPerkebunan.reduce((acc, curr) => acc + curr.value, 0);
  
  // Ambil top 3 untuk ditampilkan di grafik, sisanya gabung ke "Lainnya"
  const top3Perkebunan = parsedPerkebunan.slice(0, 3);
  const sisaPerkebunanValue = parsedPerkebunan.slice(3).reduce((acc, curr) => acc + curr.value, 0);
  
  const chartData = [...top3Perkebunan];
  if (sisaPerkebunanValue > 0) {
    chartData.push({ name: 'Lainnya', value: sisaPerkebunanValue });
  }

  // Palet warna untuk mini chart (Oranye, Kuning, Hijau, Abu-abu)
  const chartColors = ['bg-orange-500', 'bg-yellow-400', 'bg-emerald-500', 'bg-gray-300'];

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      
      {/* Import Font */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Kondisi Geologis Desa Sekunyit
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-8 md:mt-12">
        
        {/* Judul Halaman */}
        <div className="mb-8">
          <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-gray-900 font-montserrat font-bold text-2xl md:text-3xl mb-2">
            Pemetaan Spasial & Geologis
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-gray-600 font-medium text-sm md:text-base">
            Informasi struktur tanah, topografi, dan pemetaan wilayah administrasi Desa Sekunyit.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
            <Loader2 className="animate-spin" size={40}/>
            <span className="font-medium text-sm">Memuat pemetaan wilayah...</span>
          </div>
        ) : (
          <>
            {/* --- KONTEN ATAS (PETA) --- */}
            <div className="flex flex-col gap-8 mb-12">
              
              {/* PETA 1: GAMBAR DARI ADMIN */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3">
                  <div className="p-2 bg-zinc-900 text-white rounded-lg"><Layers size={20} /></div>
                  <div>
                    <h3 className="font-montserrat font-bold text-gray-900 text-base">Peta Struktur & Tata Guna Lahan</h3>
                    <p className="text-gray-400 text-xs font-medium">Diunggah oleh pihak admin desa</p>
                  </div>
                </div>

                <div 
                  onClick={() => mapImage && setFullscreenImage(mapImage)}
                  className={`w-full bg-[#dcdcdc] rounded-xl border border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group shadow-sm transition-all ${mapImage ? 'cursor-pointer hover:shadow-md h-auto' : 'h-[300px] md:h-[450px] cursor-default'}`}
                >
                  {mapImage ? (
                    <>
                      <img src={mapImage} alt="Peta Desa" className="w-full h-auto object-contain" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="bg-white/90 text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                          <Maximize size={18} /> Perbesar Peta
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Map size={48} className="text-gray-400 mb-2" />
                      <span className="text-gray-500 font-inter text-sm font-medium">Peta belum diunggah Admin</span>
                    </>
                  )}
                </div>
              </motion.section>

              {/* PETA 2: GOOGLE MAPS INTERAKTIF */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md shadow-blue-500/20"><Compass size={20} /></div>
                    <div>
                      <h3 className="font-montserrat font-bold text-gray-900 text-base">Navigasi Peta Digital Interaktif</h3>
                      <p className="text-gray-400 text-xs font-medium">Terintegrasi langsung dengan Google Maps</p>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 hidden sm:flex">
                    <Globe size={12} /> Live Maps
                  </span>
                </div>

                <div className="w-full h-[350px] md:h-[500px] rounded-xl overflow-hidden border border-gray-300 shadow-inner relative bg-gray-100">
                  <iframe title="Peta Interaktif Desa Sekunyit" src={mapEmbedUrl} className="w-full h-full border-0" allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                </div>
              </motion.section>
            </div>

            {/* --- KONTEN BAWAH (STATISTIK NUMERIK GEOLOGI) --- */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-montserrat font-bold text-gray-900">Data Statistik Kewilayahan</h3>
                <div className="h-[2px] bg-gray-200 flex-1 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* KOLOM KIRI (Ringkasan & Batas) */}
                <div className="flex flex-col gap-6">
                  {/* Highlight Luas */}
                  <div className="bg-[#111] text-white rounded-2xl p-6 shadow-lg shadow-gray-900/10 flex flex-col justify-between">
                    <div>
                      <p className="text-gray-400 font-medium text-xs uppercase tracking-widest mb-1">Total Luas Desa</p>
                      <h4 className="text-3xl font-montserrat font-bold text-white mb-4 flex items-end gap-1">
                        {dataGeo.luas_total.replace(/HA|ha/i, '').trim()} <span className="text-lg text-gray-400 font-medium pb-1">HA</span>
                      </h4>
                    </div>
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-400 font-medium text-xs uppercase tracking-widest mb-1">Lahan Belum Dimanfaatkan</p>
                      <h4 className="text-xl font-montserrat font-bold text-red-400 flex items-end gap-1">
                        {dataGeo.luas_belum.replace(/HA|ha/i, '').trim()} <span className="text-sm text-gray-500 font-medium pb-0.5">HA</span>
                      </h4>
                    </div>
                  </div>

                  {/* Batas Desa */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={18} className="text-blue-600" />
                      <h4 className="font-montserrat font-bold text-gray-900">Batas Wilayah</h4>
                    </div>
                    <ul className="flex flex-col gap-3">
                      <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium">Utara</span>
                        <span className="text-gray-900 font-semibold">{dataGeo.utara}</span>
                      </li>
                      <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium">Selatan</span>
                        <span className="text-gray-900 font-semibold">{dataGeo.selatan}</span>
                      </li>
                      <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                        <span className="text-gray-500 font-medium">Timur</span>
                        <span className="text-gray-900 font-semibold">{dataGeo.timur}</span>
                      </li>
                      <li className="flex justify-between items-center text-sm pt-1">
                        <span className="text-gray-500 font-medium">Barat</span>
                        <span className="text-blue-600 font-semibold">{dataGeo.barat}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* KOLOM TENGAH (Pemanfaatan Lahan Utama & Pertanian) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Maximize size={18} className="text-emerald-600" />
                    <h4 className="font-montserrat font-bold text-gray-900">Lahan Yang Diolah</h4>
                  </div>
                  
                  <div className="flex-1">
                    <ul className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 hide-scrollbar">
                      {dataGeo.lahan.length === 0 && <p className="text-gray-400 italic text-xs">Belum ada data didaftarkan.</p>}
                      {dataGeo.lahan.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-600 font-medium truncate max-w-[120px]" title={item.name}>{item.name}</span>
                          <span className={`font-semibold ${!item.value || item.value.startsWith('-') || item.value === '0' ? 'text-gray-400' : 'text-gray-900'}`}>
                            {item.value || '-'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rincian Tambahan Pertanian */}
                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-2 mb-3 text-emerald-700">
                      <Tractor size={16} />
                      <span className="font-bold text-sm">Rincian Tanah Pertanian</span>
                    </div>
                    <ul className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-2 hide-scrollbar">
                      {dataGeo.pertanian.length === 0 && <p className="text-gray-400 italic text-[11px]">Belum ada data didaftarkan.</p>}
                      {dataGeo.pertanian.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-[13px]">
                          <span className="text-gray-500 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                          <span className={`font-medium ${!item.value || item.value.startsWith('-') || item.value === '0' ? 'text-gray-400' : 'text-gray-800'}`}>
                            {item.value || '-'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* KOLOM KANAN (Rincian Perkebunan) */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Trees size={18} className="text-orange-500" />
                    <h4 className="font-montserrat font-bold text-gray-900">Rincian Perkebunan</h4>
                  </div>
                  
                  <ul className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2 hide-scrollbar">
                    {dataGeo.perkebunan.length === 0 && <p className="text-gray-400 italic text-xs">Belum ada data didaftarkan.</p>}
                    {dataGeo.perkebunan.map((item, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-600 font-medium truncate max-w-[120px]" title={item.name}>{item.name}</span>
                        <span className={`font-semibold ${!item.value || item.value.startsWith('-') || item.value === '0' ? 'text-gray-400' : 'text-gray-900'}`}>
                          {item.value || '-'}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Visualisasi Mini Chart Dinamis */}
                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">Dominasi Tanaman Berdasar Luas</p>
                    
                    {totalLuasPerkebunan > 0 ? (
                      <>
                        <div className="w-full h-3 bg-gray-100 rounded-full flex overflow-hidden">
                          {chartData.map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`h-full ${chartColors[idx % chartColors.length]}`} 
                              style={{ width: `${(item.value / totalLuasPerkebunan) * 100}%` }} 
                              title={`${item.name} (${item.value} HA)`}
                            ></div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-medium">
                          {chartData.map((item, idx) => (
                            <span key={idx} className="truncate px-1 text-center" style={{ width: `${(item.value / totalLuasPerkebunan) * 100}%` }}>
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-3 bg-gray-100 rounded-full"></div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </main>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {fullscreenImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFullscreenImage(null)} className="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-6xl h-full flex flex-col pointer-events-none">
              <div className="flex justify-between items-start mb-4 pointer-events-auto">
                <h3 className="text-white font-montserrat font-bold text-lg md:text-xl drop-shadow-md pr-8">Peta Geologis Desa Sekunyit</h3>
                <button onClick={() => setFullscreenImage(null)} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md"><X size={24} /></button>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center pointer-events-auto">
                <img src={fullscreenImage} alt="Peta Fullscreen" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}