import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle, ArrowLeft, AlertCircle, ChevronDown } from 'lucide-react';
import { supabase } from '../config/supabaseClient'; // Sesuaikan path

export default function AduanWarga() {
  const navigate = useNavigate();
  
  // State Form (isAnonim: false = sertakan identitas, true = tidak/anonim)
  const [isAnonim, setIsAnonim] = useState(false); 
  const [formData, setFormData] = useState({
    kategori: '',
    judul: '',
    lokasi: '',
    detail: '',
    nama_pelapor: '',
    no_telepon: ''
  });
  
  const [fotos, setFotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFotos(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Validasi
      if (!formData.kategori) throw new Error("Silakan pilih Kategori Pengaduan.");
      if (!formData.judul || !formData.detail) throw new Error("Judul dan Detail laporan wajib diisi.");
      if (!isAnonim && (!formData.nama_pelapor || !formData.no_telepon)) {
        throw new Error("Nama Lengkap dan Nomor Telepon wajib diisi jika menyertakan identitas.");
      }

      let uploadedUrls = [];

      // Upload banyak foto ke bucket 'pengaduan_warga'
      if (fotos.length > 0) {
        const uploadPromises = fotos.map(async (foto) => {
          const fileExt = foto.name.split('.').pop();
          const fileName = `aduan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('pengaduan_warga').upload(fileName, foto);
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('pengaduan_warga').getPublicUrl(fileName);
          return publicUrlData.publicUrl;
        });

        uploadedUrls = await Promise.all(uploadPromises);
      }

      // Insert ke Database tabel 'pengaduan_warga'
      const { error: insertError } = await supabase
        .from('pengaduan_warga')
        .insert([{
          kategori_pengaduan: formData.kategori, // PASTIKAN NAMA KOLOM INI COCOK DENGAN DI SUPABASE
          judul: formData.judul,
          lokasi: formData.lokasi || null,
          detail: formData.detail,
          gambar_urls: uploadedUrls,
          is_anonim: isAnonim,
          nama_pelapor: isAnonim ? 'Anonim' : formData.nama_pelapor,
          no_telepon: isAnonim ? null : formData.no_telepon,
          status: 'Menunggu'
        }]);

      if (insertError) throw insertError;

      setIsSuccess(true);
      
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN SUKSES ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#f2f7f8] flex flex-col items-center justify-center font-inter p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 md:p-12 rounded-[2rem] shadow-lg max-w-md w-full text-center flex flex-col items-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={40} className="text-[#00ea30]" />
          </div>
          <h2 className="text-2xl font-bold font-montserrat text-gray-900 mb-2">Laporan Terkirim!</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8 font-medium">
            Terima kasih atas kepedulian Anda. Laporan pengaduan Anda telah masuk ke sistem dan akan segera ditindaklanjuti oleh perangkat desa.
          </p>
          <button onClick={() => navigate('/')} className="w-full bg-[#111] hover:bg-[#333] text-white font-bold py-3.5 rounded-full transition-colors active:scale-95">
            Kembali ke Beranda
          </button>
        </motion.div>
      </div>
    );
  }

  // --- TAMPILAN FORMULIR ---
  return (
    <div className="min-h-screen w-full flex flex-col font-inter bg-[#f2f7f8]">
      
      {/* HEADER */}
      <header className="h-[88px] bg-[#111111] flex items-center justify-between px-6 md:px-12 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#dedede] rounded-full flex items-center justify-center text-sm font-medium text-black">logo</div>
          <h1 className="text-white font-montserrat font-medium text-lg md:text-xl tracking-wide">Layanan Aduan Warga</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#ff0a0a] hover:bg-[#d60000] text-white font-medium px-8 py-2 rounded-full transition-all duration-300 active:scale-95 shadow-sm"
        >
          Batal
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 h-full">
          
          {/* AREA KIRI (Grid 2 Kolom untuk Input) */}
          <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 content-start">
            
            {/* --- SUB-KOLOM 1 (Kiri) --- */}
            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Kategori Pengaduan *</label>
                <div className="relative">
                  <select name="kategori" value={formData.kategori} onChange={handleChange} required className="w-full appearance-none border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium focus:outline-none focus:ring-[1.5px] focus:ring-black cursor-pointer text-gray-800">
                    <option value="" disabled>Pilih Kategori</option>
                    <option value="Infrastruktur & Fasilitas">Infrastruktur & Fasilitas</option>
                    <option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
                    <option value="Kebersihan & Lingkungan">Kebersihan & Lingkungan</option>
                    <option value="Pelayanan Aparatur">Pelayanan Aparatur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black"><ChevronDown size={18} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Judul Pengaduan *</label>
                <input type="text" name="judul" value={formData.judul} onChange={handleChange} required placeholder="Contoh : Jalan rusak di Dusun 2" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Lokasi Terjadinya (Opsional)</label>
                <input type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} placeholder="Contoh : Dekat jembatan gantung" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-gray-900 ml-2">Detail Laporan *</label>
                <textarea name="detail" value={formData.detail} onChange={handleChange} required placeholder="Ceritakan kronologi atau keluhan Anda secara detail di sini..." className="w-full border border-black rounded-[1.5rem] p-5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black resize-none min-h-[200px] h-full"></textarea>
              </div>
            </div>

            {/* --- SUB-KOLOM 2 (Kanan Form) --- */}
            <div className="flex flex-col gap-6">
              
              {/* Toggle Identitas */}
              <div className="flex flex-row items-center justify-between mt-1 md:mt-0">
                <label className="text-sm font-bold text-gray-900 ml-2">Sertakan Identitas?</label>
                <div className="relative w-[110px] h-[36px] border border-black rounded-full flex items-center cursor-pointer p-1 bg-transparent overflow-hidden" onClick={() => setIsAnonim(!isAnonim)}>
                  {/* Background Slider (Jika isAnonim = false (Sertakan), warna Hijau di kiri. Jika isAnonim = true (TIDAK Sertakan), warna Merah di kanan) */}
                  <motion.div className={`absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] rounded-full shadow-sm z-0 ${!isAnonim ? 'bg-[#00ea30]' : 'bg-[#ff0a0a]'}`} initial={false} animate={{ left: !isAnonim ? "2px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                  <div className="w-1/2 text-center z-10 text-[13px] font-bold flex justify-center items-center h-full"><span className={!isAnonim ? "text-white" : "text-black"}>iya</span></div>
                  <div className="w-1/2 text-center z-10 text-[13px] font-bold flex justify-center items-center h-full"><span className={isAnonim ? "text-white" : "text-black"}>tidak</span></div>
                </div>
              </div>

              {/* Input Identitas (Animasi Sembunyi jika Anonim) */}
              <AnimatePresence>
                {!isAnonim && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-6 overflow-hidden">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-900 ml-2">Nama Lengkap *</label>
                      <input type="text" name="nama_pelapor" value={formData.nama_pelapor} onChange={handleChange} required={!isAnonim} placeholder="Contoh : Budi Santoso" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-gray-900 ml-2">Nomor Telepon/WA *</label>
                      <input type="text" name="no_telepon" value={formData.no_telepon} onChange={handleChange} required={!isAnonim} placeholder="Contoh : 081233445566" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Foto Pendukung */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Foto Pendukung (Opsional)</label>
                <div className="relative cursor-pointer group">
                  <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                  <div className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium text-gray-400 group-hover:bg-black/5 transition-colors flex items-center justify-between overflow-hidden">
                    <span>Import Foto</span>
                    <Upload size={16} className="text-black shrink-0 ml-2" />
                  </div>
                </div>

                {/* Preview Foto */}
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                    {previews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-300 group shadow-sm bg-gray-100">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFoto(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle size={14}/> {errorMsg}
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="mt-auto pt-6">
                <button type="submit" disabled={loading} className="w-full bg-[#00ea30] hover:bg-[#00c729] text-black font-bold text-sm px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Kirim Laporan'}
                </button>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (Panduan/Tata Cara) */}
          <div className="w-full lg:w-[40%] h-[500px] lg:h-auto">
            <div className="border border-black rounded-[1.5rem] p-6 h-full flex flex-col bg-transparent">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Tata Cara Pengaduan :</h3>
              <div className="flex-1 text-sm font-medium text-gray-500 overflow-y-auto space-y-4">
                <p>1. Pilih <strong>kategori aduan</strong> yang paling sesuai dengan permasalahan yang Anda laporkan.</p>
                <p>2. Tuliskan <strong>judul</strong> dan <strong>detail laporan</strong> dengan bahasa yang jelas agar perangkat desa mudah memahaminya.</p>
                <p>3. Jika laporan Anda berkaitan dengan lokasi tertentu (misal: jalan berlubang), mohon sertakan detail lokasinya.</p>
                <p>4. Anda sangat disarankan untuk mengunggah <strong>foto bukti</strong> guna mempercepat proses penanganan.</p>
                <p>5. Jika Anda merasa khawatir terkait keamanan privasi Anda, gunakan opsi <strong>"Sertakan Identitas: Tidak"</strong> agar laporan Anda bersifat Anonim.</p>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}