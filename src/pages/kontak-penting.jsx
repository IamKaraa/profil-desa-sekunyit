import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Phone, MessageCircle, Shield, Flame, Stethoscope, Zap, Building, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function KontakUser() {
  const navigate = useNavigate();
  
  // State untuk menampung data dari Supabase
  const [kontakList, setKontakList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data kontak dari Supabase saat halaman dimuat
  useEffect(() => {
    const fetchKontak = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('desa_profil')
          .select('data')
          .eq('kategori', 'kontak')
          .single();

        if (error) throw error;
        
        if (data && data.data) {
          setKontakList(data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data kontak:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchKontak();
  }, []);

  // Fungsi untuk render Ikon dan Warna berdasarkan kategori
  const getIconAndColor = (kategori, tipe) => {
    switch (kategori) {
      case 'keamanan': return { icon: <Shield size={24} />, bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'kesehatan': return { icon: <Stethoscope size={24} />, bg: 'bg-teal-100', text: 'text-teal-600' };
      case 'darurat': return { icon: <Flame size={24} />, bg: 'bg-red-100', text: 'text-red-600' };
      case 'infrastruktur': return { icon: <Zap size={24} />, bg: 'bg-yellow-100', text: 'text-yellow-600' };
      default: 
        return tipe === 'wa' 
          ? { icon: <MessageCircle size={24} />, bg: 'bg-green-100', text: 'text-green-600' }
          : { icon: <Building size={24} />, bg: 'bg-gray-200', text: 'text-gray-700' };
    }
  };

  // Fungsi untuk mengeksekusi panggilan / WhatsApp
  const handleContact = (tipe, nomor) => {
    // Bersihkan karakter non-angka (jika ada spasi atau strip)
    const cleanNumber = nomor.replace(/[^0-9+]/g, '');
    
    if (tipe === 'wa') {
      // Mengubah 08... menjadi 628... untuk link WA (Standar Indonesia)
      let waNumber = cleanNumber;
      if (waNumber.startsWith('0')) {
        waNumber = '62' + waNumber.substring(1);
      }
      window.open(`https://wa.me/${waNumber}`, '_blank');
    } else {
      window.location.href = `tel:${cleanNumber}`;
    }
  };

  // Animasi Variabel untuk Grid
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

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
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Kontak Penting Desa Sekunyit
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-8 md:mt-12">
        
        {/* Judul & Deskripsi Pembuka */}
        <div className="text-center md:text-left mb-10 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-gray-900 font-montserrat font-bold text-2xl md:text-3xl mb-3"
          >
            Daftar Kontak Pendukung
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 font-medium text-sm md:text-base leading-relaxed"
          >
            Hubungi nomor-nomor di bawah ini untuk layanan masyarakat, pelaporan darurat, atau informasi lebih lanjut terkait Desa Sekunyit.
          </motion.p>
        </div>

        {/* --- STATE LOADING & KOSONG --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
             <Loader2 className="animate-spin" size={40}/>
             <span className="font-medium text-sm">Memuat daftar kontak...</span>
          </div>
        ) : kontakList.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
             <Phone size={48} className="text-gray-300 mb-4" />
             <p className="text-gray-500 font-medium">Belum ada daftar kontak yang ditambahkan oleh Admin.</p>
          </div>
        ) : (
          /* --- GRID KONTAK --- */
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {kontakList.map((item) => {
              const style = getIconAndColor(item.kategori, item.tipe);
              
              return (
                <motion.div 
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Header Card (Icon & Jabatan) */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                      {style.icon}
                    </div>
                    <div>
                      <h3 className="font-montserrat font-bold text-gray-900 text-[17px] leading-tight mb-1">
                        {item.nama}
                      </h3>
                      <p className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                        {item.peran}
                      </p>
                    </div>
                  </div>

                  {/* Nomor Telepon Display */}
                  <div className="mt-auto mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                     <span className="font-montserrat font-bold text-gray-800 tracking-wider text-lg">
                       {item.nomor}
                     </span>
                  </div>

                  {/* Tombol Aksi */}
                  <button
                    onClick={() => handleContact(item.tipe, item.nomor)}
                    className={`w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                      item.tipe === 'wa' 
                        ? 'bg-[#25D366] hover:bg-[#1EBE57] text-white shadow-lg shadow-green-500/30' 
                        : 'bg-black hover:bg-gray-800 text-white shadow-lg shadow-gray-900/30'
                    }`}
                  >
                    {item.tipe === 'wa' ? (
                      <>
                        <MessageCircle size={18} /> Chat WhatsApp
                      </>
                    ) : (
                      <>
                        <Phone size={18} /> Panggil Telepon
                      </>
                    )}
                  </button>

                </motion.div>
              );
            })}
          </motion.div>
        )}

      </main>
    </div>
  );
}