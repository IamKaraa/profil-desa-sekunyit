import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Upload, ArrowLeft } from 'lucide-react';

export default function PengaduanUser() {
  const navigate = useNavigate();
  
  // State untuk Toggle Identitas (Iya / Tidak)
  // Default 'true' (Iya / Hijau)
  const [includeIdentity, setIncludeIdentity] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logika simpan pengaduan ke backend/Supabase
    console.log("Pengaduan diajukan. Mode Anonim:", !includeIdentity);
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-inter bg-[#f4f8f9]">
      
      {/* --- HEADER --- */}
      <header className="h-[70px] bg-[#111111] flex items-center px-6 md:px-12 shrink-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-white font-montserrat font-medium text-lg md:text-xl tracking-wide">
            Formulir Pengaduan Desa Sekunyit
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 h-full">
          
          {/* KOLOM KIRI (Area Form Utama) */}
          <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 content-start">
            
            {/* --- SUB-KOLOM 1 (Kiri) --- */}
            <div className="flex flex-col gap-6">
              
              {/* Kategori Pengaduan */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Kategori Pengaduan</label>
                <div className="relative">
                  <select className="w-full appearance-none border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium focus:outline-none focus:ring-[1.5px] focus:ring-black cursor-pointer text-gray-800">
                    <option value="">Pilih Kategori</option>
                    <option value="infrastruktur">Infrastruktur & Fasilitas Umum</option>
                    <option value="lingkungan">Kebersihan Lingkungan</option>
                    <option value="pelayanan">Pelayanan Desa</option>
                    <option value="keamanan">Keamanan & Ketertiban</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Judul Pengaduan */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Judul Pengaduan</label>
                <input 
                  type="text"
                  placeholder="Contoh : Jalan rusak"
                  className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-[1.5px] focus:ring-black"
                />
              </div>

              {/* Lokasi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Lokasi</label>
                <input 
                  type="text"
                  placeholder="Contoh : Jalan Merak, Depan masjid"
                  className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-[1.5px] focus:ring-black"
                />
              </div>

              {/* Detail Laporan */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-gray-900 ml-2">Detail Laporan</label>
                <textarea 
                  placeholder="Contoh : Jalan berlubang parah dan perlu di perbaiki secepatnya"
                  className="w-full border border-black rounded-[1.5rem] p-5 bg-transparent text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-[1.5px] focus:ring-black resize-none min-h-[220px] h-full"
                ></textarea>
              </div>
            </div>

            {/* --- SUB-KOLOM 2 (Kanan Form) --- */}
            {/* Menggunakan layout framer-motion agar transisi mulus saat form menyusut/melebar */}
            <motion.div layout className="flex flex-col gap-6">
              
              {/* Sertakan Identitas? (Toggle Switch Animasi) */}
              <motion.div layout className="flex flex-row items-center justify-between mt-1 md:mt-0">
                <label className="text-sm font-bold text-gray-900 ml-2">Sertakan Identitas?</label>
                
                <div 
                  className="relative w-[110px] h-[36px] border border-black rounded-full flex items-center cursor-pointer p-1 bg-transparent overflow-hidden shrink-0"
                  onClick={() => setIncludeIdentity(!includeIdentity)}
                >
                  {/* Background Slider Hijau/Merah */}
                  <motion.div
                    className={`absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] rounded-full shadow-sm z-0 ${includeIdentity ? 'bg-[#00ea30]' : 'bg-[#ff0a0a]'}`}
                    initial={false}
                    animate={{ left: includeIdentity ? "2px" : "calc(50%)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                  
                  <div className="w-1/2 text-center z-10 text-[13px] font-bold flex justify-center items-center h-full">
                    <span className={includeIdentity ? "text-white" : "text-black"}>iya</span>
                  </div>
                  <div className="w-1/2 text-center z-10 text-[13px] font-bold flex justify-center items-center h-full">
                    <span className={!includeIdentity ? "text-white" : "text-black"}>tidak</span>
                  </div>
                </div>
              </motion.div>

              {/* Area Identitas (Hanya Muncul Jika Toggle "Iya") */}
              <AnimatePresence>
                {includeIdentity && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex flex-col gap-6"
                  >
                    {/* Nama Lengkap */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-900 ml-2">Nama Lengkap</label>
                      <input 
                        type="text"
                        placeholder="Contoh : Satria Bima Bagaskara"
                        className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-[1.5px] focus:ring-black"
                      />
                    </div>

                    {/* Nomor Telepon/WA */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-900 ml-2">Nomor Telepon/WA</label>
                      <input 
                        type="tel"
                        placeholder="Contoh : 081233445566"
                        className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-[1.5px] focus:ring-black"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Foto Pendukung */}
              <motion.div layout className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Foto Pendukung (Opsional)</label>
                <div className="relative cursor-pointer group">
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/*"
                  />
                  <div className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium text-gray-400 group-hover:bg-black/5 transition-colors flex items-center justify-between">
                    <span>Import Foto</span>
                    <Upload size={16} className="text-black" />
                  </div>
                </div>
              </motion.div>

              {/* Tombol Simpan */}
              <motion.div layout className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-[#00ea30] hover:bg-[#00c729] text-black font-bold text-sm px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Simpan dan Ajukan
                </button>
              </motion.div>
              
            </motion.div>

          </div>

          {/* KOLOM KANAN (Panduan/Tata Cara) */}
          <div className="w-full lg:w-[40%] h-[400px] lg:h-auto">
            <div className="border border-black rounded-[1.5rem] p-6 h-full flex flex-col bg-transparent sticky top-[100px]">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Tata Cara Pengaduan :</h3>
              <div className="flex-1 text-sm font-medium text-gray-600 overflow-y-auto">
                <p className="mb-3">1. Tuliskan judul laporan yang singkat dan jelas.</p>
                <p className="mb-3">2. Sertakan lokasi yang spesifik agar petugas mudah melakukan pengecekan di lapangan.</p>
                <p className="mb-3">3. Jika Anda merasa laporan ini sensitif, Anda dapat mematikan *toggle* <strong>"Sertakan Identitas"</strong> menjadi <strong>Tidak</strong>. Laporan Anda akan dikirimkan secara anonim.</p>
                <p className="mb-3">4. Sangat disarankan untuk melampirkan <strong>Foto Pendukung</strong> sebagai bukti nyata agar pengaduan lebih cepat ditindaklanjuti.</p>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}