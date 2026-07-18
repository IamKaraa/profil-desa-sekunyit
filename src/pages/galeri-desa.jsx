import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ExternalLink, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function GaleriUser() {
  const navigate = useNavigate();
  
  const [dataGaleri, setDataGaleri] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const fetchGaleriDanInformasi = async () => {
      try {
        // Tarik data Galeri Murni
        const { data: resGaleri } = await supabase.from('galeri_desa').select('*').order('created_at', { ascending: false });
        
        // Tarik data Informasi (Hanya yang ada fotonya)
        const { data: resInformasi } = await supabase.from('informasi_desa').select('*').not('gambar', 'is', null).order('created_at', { ascending: false });

        const galeriMurni = (resGaleri || []).map(g => ({
          ...g,
          source: 'galeri'
        }));

        const galeriDariInfo = (resInformasi || []).map(info => ({
          id: `info-${info.id}`,
          judul: info.judul,
          gambar_urls: [info.gambar], // Paksa jadi array
          created_at: info.created_at,
          source: 'informasi',
          infoId: info.id
        }));

        const combined = [...galeriMurni, ...galeriDariInfo].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setDataGaleri(combined);

      } catch (error) {
        console.error("Gagal menarik galeri:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGaleriDanInformasi();
  }, []);

  const openModal = (album) => { setSelectedAlbum(album); setCurrentImgIndex(0); };
  const closeModal = () => setSelectedAlbum(null);

  const nextImage = (e) => {
    e.stopPropagation();
    if (selectedAlbum) setCurrentImgIndex((prev) => (prev === selectedAlbum.gambar_urls.length - 1 ? 0 : prev + 1));
  };
  const prevImage = (e) => {
    e.stopPropagation();
    if (selectedAlbum) setCurrentImgIndex((prev) => (prev === 0 ? selectedAlbum.gambar_urls.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
                                <ArrowLeft size={20} />
                              </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">Galeri Desa Sekunyit</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8">
        <h2 className="text-gray-800 font-inter font-semibold text-sm mb-6">Dokumentasi seputar kegiatan Desa Sekunyit</h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Loader2 size={32} className="animate-spin mb-3" /><p>Memuat galeri desa...</p></div>
        ) : dataGaleri.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-20 text-center text-gray-500 shadow-sm">Belum ada foto yang dipublikasikan.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {dataGaleri.map((album, index) => {
              const coverImg = album.gambar_urls && album.gambar_urls.length > 0 ? album.gambar_urls[0] : null;
              return (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => openModal(album)}
                  className="relative aspect-[4/3] bg-[#d9d9d9] cursor-pointer overflow-hidden group shadow-sm hover:shadow-md transition-shadow rounded-lg"
                >
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 flex items-center justify-center" style={coverImg ? { backgroundImage: `url(${coverImg})` } : {}}>
                    {!coverImg && <ImageIcon size={32} className="text-gray-400 opacity-50" />}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 md:p-3 backdrop-blur-[2px]">
                    <p className="text-white text-[10px] md:text-xs font-medium font-inter truncate">{album.judul || 'Tanpa Judul'}</p>
                  </div>
                  
                  {album.gambar_urls && album.gambar_urls.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm">
                      1/{album.gambar_urls.length}
                    </div>
                  )}
                  {album.source === 'informasi' && (
                    <div className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-sm">Info</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* MODAL SLIDER */}
      <AnimatePresence>
        {selectedAlbum && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1a1a1a] w-full max-w-4xl max-h-[90vh] flex flex-col relative z-10 rounded-xl overflow-hidden shadow-2xl">
              
              <div className="px-6 py-4 flex justify-between items-start border-b border-white/10 shrink-0">
                <div className="pr-8">
                  <h3 className="text-white font-montserrat font-semibold text-lg md:text-xl leading-tight mb-1">{selectedAlbum.judul}</h3>
                  <p className="text-gray-400 text-xs flex items-center gap-2"><Calendar size={14} /> Diunggah: {new Date(selectedAlbum.created_at).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                </div>
                <button onClick={closeModal} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors shrink-0"><X size={20} /></button>
              </div>

              <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-[60vh]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImgIndex}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                    src={selectedAlbum.gambar_urls[currentImgIndex]}
                    alt="Preview" className="max-w-full max-h-full object-contain absolute m-auto"
                  />
                </AnimatePresence>

                {selectedAlbum.gambar_urls.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md active:scale-90"><ChevronLeft size={24} /></button>
                    <button onClick={nextImage} className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md active:scale-90"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {selectedAlbum.gambar_urls.map((_, idx) => (
                        <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentImgIndex ? 'bg-white w-6' : 'bg-white/40 w-2'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {selectedAlbum.infoId && (
                <div className="bg-[#222] p-4 flex justify-end shrink-0 border-t border-white/5">
                  <button onClick={() => navigate(`/informasi/${selectedAlbum.infoId}`)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-lg">
                    Lihat Informasi Terkait <ExternalLink size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}