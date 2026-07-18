import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Rocket, Compass, CheckCircle2 } from 'lucide-react';

export default function VisiMisiUser() {
  const navigate = useNavigate();

  // Data Tujuan (Placeholder Lorem Ipsum sesuai permintaan)
  const dataTujuan = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  ];

  // Variabel Animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      
      {/* Import Font Kustom */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Visi & Misi Desa Sekunyit
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-8 md:mt-12">
        
        {/* Judul Halaman */}
        <div className="mb-10 text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-gray-900 font-montserrat font-extrabold text-3xl md:text-4xl mb-3"
          >
            Arah Gerak Desa
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 font-medium text-base max-w-2xl mx-auto md:mx-0"
          >
            Mengenal lebih dekat cita-cita, harapan, dan langkah nyata yang akan diwujudkan demi kesejahteraan seluruh masyarakat Desa Sekunyit.
          </motion.p>
        </div>

        {/* Kumpulan Kartu (Grid) dengan Animasi Masuk Bergantian */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-8"
        >
          
          {/* --- KARTU VISI (HERO CARD) --- */}
          <motion.section 
            variants={itemVariants}
            className="bg-[#111111] text-white rounded-[2rem] p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden"
          >
            {/* Ornamen Latar Belakang */}
            <Target className="absolute -top-10 -right-10 text-white/5 rotate-12" size={300} />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="bg-white/10 text-blue-300 font-bold text-xs uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 flex items-center gap-2 backdrop-blur-sm">
                <Target size={16} /> Visi Desa
              </span>
              
              <h1 className="font-montserrat font-extrabold text-3xl md:text-5xl lg:text-6xl leading-[1.3] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                "Membangun Desa Bersama Rakyat dan Berkeadilan"
              </h1>
            </div>
          </motion.section>

          {/* --- KARTU MISI --- */}
          <motion.section 
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-[2rem] p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-start gap-6 md:gap-8 group hover:shadow-md transition-shadow"
          >
            <div className="bg-orange-100 p-5 rounded-2xl text-orange-600 shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              <Rocket size={36} />
            </div>
            <div>
              <h3 className="font-montserrat font-bold text-2xl text-gray-900 mb-4 flex items-center gap-3">
                Misi Utama
              </h3>
              <p className="text-gray-700 font-medium text-lg md:text-xl leading-relaxed text-justify">
                Menciptakan Desa Maju Seimbang dengan Kemajuan Sumber Daya Manusia dan mensejahterakan rakyat secara menyeluruh.
              </p>
            </div>
          </motion.section>

          {/* --- KARTU TUJUAN --- */}
          <motion.section 
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-[2rem] p-8 md:p-10 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                <Compass size={28} />
              </div>
              <h3 className="font-montserrat font-bold text-2xl text-gray-900">
                Tujuan Pelaksanaan
              </h3>
            </div>

            {/* Grid List Tujuan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {dataTujuan.map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex gap-4 items-start transition-all hover:bg-emerald-50 hover:border-emerald-100"
                >
                  <div className="mt-0.5 shrink-0 text-emerald-500">
                    <CheckCircle2 size={22} />
                  </div>
                  <p className="text-gray-600 font-medium text-sm leading-relaxed">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

        </motion.div>
      </main>
    </div>
  );
}