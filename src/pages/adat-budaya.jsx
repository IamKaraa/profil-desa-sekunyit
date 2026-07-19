import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdatBudayaUser() {
  const navigate = useNavigate();

  // Animasi varian untuk list/grid agar muncul bergantian
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter">
      {/* Import Font (Jika belum ada secara global) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          {/* Tombol Kembali (Opsional untuk UX yang baik) */}
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
                                <ArrowLeft size={20} />
                              </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Adat dan Budaya Desa
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        
        {/* Subtitle */}
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-montserrat font-bold text-gray-900 text-xl md:text-2xl mb-8"
        >
          Adat dan Budaya Desa Sekunyit
        </motion.h2>

        {/* --- SECTION 1: HERO KONTEN UTAMA --- */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#4b4b4b] rounded-[1.5rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-10 shadow-lg mb-12"
        >
          {/* Kolom Teks Kiri */}
          <div className="w-full md:w-3/5 text-gray-200 text-sm md:text-[15px] leading-relaxed space-y-4 text-justify font-medium">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          
          {/* Kolom Gambar Kanan */}
          <div className="w-full md:w-2/5 flex">
            {/* Tempat gambar (Nantinya diganti tag <img>) */}
            <div className="w-full h-full min-h-[300px] bg-[#d9d9d9] rounded-xl shadow-inner border border-white/10 flex items-center justify-center text-gray-500 font-medium">
              Area Gambar / Video Utama
            </div>
          </div>
        </motion.section>

        {/* --- SECTION 2: GRID GALERI/HIGHLIGHT --- */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12"
        >
          {/* Mapping 6 kotak sesuai desain */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <motion.div 
              key={item}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-[#4b4b4b] aspect-video rounded-2xl shadow-md cursor-pointer flex items-center justify-center text-gray-400 font-medium hover:bg-[#3d3d3d] transition-colors duration-300"
            >
              Grid {item}
            </motion.div>
          ))}
        </motion.section>

        {/* --- SECTION 3: LIST DETAIL BUDAYA --- */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-6"
        >
          {/* Looping 2 item list sesuai desain */}
          {[1, 2].map((item) => (
            <motion.div 
              key={item}
              variants={itemVariants}
              className="flex flex-col md:flex-row gap-4 group"
            >
              {/* Box Gambar (Kiri) */}
              <div className="w-full md:w-1/4 bg-[#1e1e1e] rounded-2xl min-h-[200px] flex items-center justify-center text-gray-400 font-inter text-sm shadow-md overflow-hidden relative">
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">gambar</span>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              {/* Box Teks (Kanan) */}
              <div className="w-full md:w-3/4 bg-[#e2e8f0] rounded-2xl p-6 md:p-8 flex flex-col justify-center shadow-sm">
                <div className="text-gray-700 text-sm leading-relaxed text-justify space-y-4">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

      </main>
    </div>
  );
}