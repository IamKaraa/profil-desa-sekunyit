import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Maximize2, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function StrukturOrganisasiUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dataStruktur, setDataStruktur] = useState({
    pemerintah: null,
    bpd: null,
    karang_taruna: null,
    pkk: null
  });
  const [selectedImage, setSelectedImage] = useState(null);

  // Ambil data dari Supabase saat halaman dibuka
  useEffect(() => {
    const fetchStruktur = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('desa_profil')
          .select('data')
          .eq('kategori', 'struktur')
          .single();

        if (error) throw error;
        if (data) setDataStruktur(data.data);
      } catch (err) {
        console.error("Gagal mengambil struktur:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStruktur();
  }, []);

  // Definisi urutan dan judul yang akan ditampilkan
  const items = [
    { key: 'pemerintah', judul: 'Struktur Organisasi Pemerintah Desa Sekunyit' },
    { key: 'bpd', judul: 'Struktur Badan Permusyawaratan Desa (BPD)' },
    { key: 'karang_taruna', judul: 'Struktur Organisasi Karang Taruna' },
    { key: 'pkk', judul: 'Struktur Pemberdayaan Kesejahteraan Keluarga (PKK)' }
  ];

  const closeModal = () => setSelectedImage(null);

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">Struktur Organisasi Desa Sekunyit</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-8 md:mt-10">
        <motion.h2 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-gray-900 font-montserrat font-bold text-2xl md:text-3xl mb-10">
          Struktur Organisasi dan Tata Kerja Desa
        </motion.h2>

        {loading ? (
           <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32}/></div>
        ) : (
          <div className="flex flex-col gap-12">
            {items.map((item, index) => (
              <motion.section key={item.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex flex-col gap-4">
                <h3 className="font-inter font-semibold text-gray-800 text-sm md:text-base border-l-4 border-gray-800 pl-3">
                  {item.judul}
                </h3>

                <div 
                  onClick={() => dataStruktur[item.key] && setSelectedImage({ judul: item.judul, gambar: dataStruktur[item.key] })}
                  className={`w-full rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden group shadow-sm transition-all ${
                    dataStruktur[item.key] 
                      ? 'bg-white border-gray-200 cursor-pointer hover:shadow-md' 
                      : 'aspect-[4/3] md:aspect-[21/9] bg-gray-100 border-gray-300 cursor-default'
                  }`}
                >
                  {dataStruktur[item.key] ? (
                    // Perubahan: Tinggi otomatis mengikuti gambar (h-auto), full lebar, hapus padding
                    <img src={dataStruktur[item.key]} alt={item.judul} className="w-full h-auto object-contain" />
                  ) : (
                    <>
                      <ImageIcon size={48} className="text-gray-400 mb-2" />
                      <span className="text-gray-500 font-inter text-sm font-medium">Bagan belum diunggah Admin</span>
                    </>
                  )}

                  {dataStruktur[item.key] && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-white/90 text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                        <Maximize2 size={18} /> Perbesar Gambar
                      </div>
                    </div>
                  )}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </main>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-6xl h-full flex flex-col pointer-events-none">
              <div className="flex justify-between items-start mb-4 pointer-events-auto">
                <h3 className="text-white font-montserrat font-bold text-lg md:text-xl drop-shadow-md pr-8">{selectedImage.judul}</h3>
                <button onClick={closeModal} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md"><X size={24} /></button>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center pointer-events-auto">
                <img src={selectedImage.gambar} alt={selectedImage.judul} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}