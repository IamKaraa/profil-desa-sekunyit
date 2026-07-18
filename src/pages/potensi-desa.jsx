import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient'; // Sesuaikan path

export default function PotensiUser() {
  const navigate = useNavigate();
  
  // State Data
  const [dataPotensi, setDataPotensi] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Pop-up Modal & Slider
  const [selectedPotensi, setSelectedPotensi] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Tarik Data dari Supabase
  useEffect(() => {
    const fetchPotensi = async () => {
      try {
        const { data, error } = await supabase
          .from('potensi_desa')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDataPotensi(data || []);
      } catch (error) {
        console.error("Gagal menarik potensi desa:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPotensi();
  }, []);

  const openModal = (potensi) => {
    setSelectedPotensi(potensi);
    setCurrentImgIndex(0);
  };

  const closeModal = () => setSelectedPotensi(null);

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedPotensi && selectedPotensi.gambar_urls) {
      setCurrentImgIndex((prev) => (prev === selectedPotensi.gambar_urls.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedPotensi && selectedPotensi.gambar_urls) {
      setCurrentImgIndex((prev) => (prev === 0 ? selectedPotensi.gambar_urls.length - 1 : prev - 1));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      
      {/* Import Font Kustom */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
                                <ArrowLeft size={20} />
                              </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Potensi Desa Sekunyit
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
        <h2 className="text-gray-800 font-inter font-semibold text-sm mb-6">
          Jelajahi potensi wisata, kekayaan alam, dan karya unggulan desa kami.
        </h2>

        {/* --- GRID POTENSI --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 size={32} className="animate-spin mb-3" />
            <p>Memuat potensi desa...</p>
          </div>
        ) : dataPotensi.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-20 text-center text-gray-500 shadow-sm">
            Belum ada data potensi desa yang dipublikasikan.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {dataPotensi.map((potensi, index) => {
              const coverImg = potensi.gambar_urls && potensi.gambar_urls.length > 0 ? potensi.gambar_urls[0] : potensi.gambar;
              return (
                <motion.div
                  key={potensi.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openModal(potensi)}
                  className="relative aspect-[4/3] bg-[#d9d9d9] cursor-pointer overflow-hidden group shadow-sm hover:shadow-md transition-shadow rounded-xl"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 flex items-center justify-center"
                    style={coverImg ? { backgroundImage: `url(${coverImg})` } : {}}
                  >
                    {!coverImg && <ImageIcon size={32} className="text-gray-400 opacity-50" />}
                  </div>

                  {/* Teks Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6">
                    <p className="text-white text-xs md:text-sm font-semibold font-montserrat line-clamp-2 leading-snug drop-shadow-md">
                      {potensi.judul}
                    </p>
                  </div>
                  
                  {/* Indikator Multiple Images */}
                  {potensi.gambar_urls && potensi.gambar_urls.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                      {potensi.gambar_urls.length} Foto
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* --- POP-UP MODAL PREVIEW (SLIDER & DETAIL) --- */}
      <AnimatePresence>
        {selectedPotensi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#1a1a1a] w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 rounded-xl overflow-hidden shadow-2xl"
            >
              
              {/* Header Modal */}
              <div className="px-6 py-4 flex justify-between items-start border-b border-white/10 shrink-0">
                <div className="pr-8">
                  <h3 className="text-white font-montserrat font-bold text-lg md:text-xl leading-tight">
                    {selectedPotensi.judul}
                  </h3>
                </div>
                <button onClick={closeModal} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 flex flex-col">
                {/* Area Gambar Slider */}
                <div className="relative w-full bg-black flex items-center justify-center overflow-hidden min-h-[30vh] md:min-h-[55vh] shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImgIndex}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                      src={selectedPotensi.gambar_urls ? selectedPotensi.gambar_urls[currentImgIndex] : selectedPotensi.gambar}
                      alt={`Preview ${currentImgIndex + 1}`}
                      className="w-full h-full object-contain absolute inset-0 m-auto"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/333/666?text=Gambar+Tidak+Tersedia"; }}
                    />
                  </AnimatePresence>

                  {/* Tombol Navigasi Slider */}
                  {selectedPotensi.gambar_urls && selectedPotensi.gambar_urls.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all active:scale-90">
                        <ChevronLeft size={24} />
                      </button>
                      <button onClick={nextImage} className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all active:scale-90">
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                  
                  {/* Indikator Titik (Dots) */}
                  {selectedPotensi.gambar_urls && selectedPotensi.gambar_urls.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                      {selectedPotensi.gambar_urls.map((_, idx) => (
                        <div key={idx} className={`h-2 rounded-full transition-all shadow-md ${idx === currentImgIndex ? 'bg-white w-6' : 'bg-white/40 w-2'}`} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Bagian Detail Deskripsi di bawah Slider */}
                <div className="p-6 md:p-8 bg-[#222222] shrink-0">
                  <h4 className="text-white/60 font-inter text-xs uppercase tracking-wider font-bold mb-3 border-b border-white/10 pb-2">Uraian Potensi</h4>
                  <p className="text-gray-300 font-inter text-sm md:text-[15px] leading-relaxed whitespace-pre-line text-justify">
                    {selectedPotensi.deskripsi}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}