import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Upload, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabaseClient'; // Pastikan path ini benar

export default function TambahInformasi() {
  const navigate = useNavigate();
  
  // State Form
  const [formData, setFormData] = useState({
    judul: '',
    kategori_informasi: '',
    lokasi: '',
    deskripsi: '',
    waktu: ''
  });
  
  const [isKegiatan, setIsKegiatan] = useState(false);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  
  // State Loading & Notifikasi
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file)); // Buat preview gambar
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!formData.judul || !formData.kategori_informasi || !formData.deskripsi) {
        throw new Error("Judul, Kategori, dan Detail Informasi wajib diisi!");
      }

      let fotoUrl = null;

      // 1. Jika ada foto, upload dulu ke Supabase Storage (Bucket: 'informasi_desa')
      if (foto) {
        const fileExt = foto.name.split('.').pop();
        const fileName = `info_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('informasi_desa') // Pastikan Anda sudah membuat bucket ini di Supabase!
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        // Ambil URL Publik gambar tersebut
        const { data: publicUrlData } = supabase.storage
          .from('informasi_desa')
          .getPublicUrl(fileName);
          
        fotoUrl = publicUrlData.publicUrl;
      }

      // 2. Simpan semua data ke tabel informasi_desa
      const { error: insertError } = await supabase
        .from('informasi_desa')
        .insert([{
          judul: formData.judul,
          kategori_informasi: formData.kategori_informasi,
          lokasi: formData.lokasi || null,
          deskripsi: formData.deskripsi,
          waktu: isKegiatan && formData.waktu ? formData.waktu : null,
          gambar: fotoUrl
        }]);

      if (insertError) throw insertError;

      alert("Informasi desa berhasil diterbitkan!");
      navigate('/admin/dashboard');

    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-inter bg-[#f2f7f8]">
      
      {/* --- HEADER --- */}
      <header className="h-[88px] bg-[#111111] flex items-center justify-between px-6 md:px-12 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#dedede] rounded-full flex items-center justify-center text-sm font-medium text-black">logo</div>
          <h1 className="text-white font-montserrat font-medium text-lg md:text-xl tracking-wide">Desa Sekunyit</h1>
        </div>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="bg-[#ff0a0a] hover:bg-[#d60000] text-white font-medium px-8 py-2 rounded-full transition-all duration-300 active:scale-95 shadow-sm"
        >
          Batal
        </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 h-full">
          
          {/* KOLOM KIRI (Area Form Utama) */}
          <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 content-start">
            
            {/* --- SUB-KOLOM 1 (Kiri) --- */}
            <div className="flex flex-col gap-6">
              
              {/* Kategori Informasi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Kategori Informasi *</label>
                <div className="relative">
                  <select name="kategori_informasi" value={formData.kategori_informasi} onChange={handleChange} required className="w-full appearance-none border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium focus:outline-none focus:ring-[1.5px] focus:ring-black cursor-pointer text-gray-800">
                    <option value="" disabled>Pilih Kategori</option>
                    <option value="pengumuman">Pengumuman</option>
                    <option value="kegiatan">Kegiatan Warga</option>
                    <option value="bantuan">Bantuan Sosial</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black"><ChevronDown size={18} /></div>
                </div>
              </div>

              {/* Judul Informasi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Judul Informasi *</label>
                <input type="text" name="judul" value={formData.judul} onChange={handleChange} required placeholder="Contoh : Kerja Bakti" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
              </div>

              {/* Lokasi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Lokasi (Opsional)</label>
                <input type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} placeholder="Contoh : Penjuru Pantai Sekunyit" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
              </div>

              {/* Detail Informasi */}
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-bold text-gray-900 ml-2">Detail Informasi *</label>
                <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} required placeholder="Contoh : Jalan berlubang parah..." className="w-full border border-black rounded-[1.5rem] p-5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black resize-none min-h-[200px] h-full"></textarea>
              </div>
            </div>

            {/* --- SUB-KOLOM 2 (Kanan Form) --- */}
            <div className="flex flex-col gap-6">
              
              {/* Kegiatan Desa Toggle */}
              <div className="flex flex-row items-center justify-between mt-1 md:mt-0">
                <label className="text-sm font-bold text-gray-900 ml-2">Kegiatan Desa</label>
                <div className="relative w-[110px] h-[36px] border border-black rounded-full flex items-center cursor-pointer p-1 bg-transparent overflow-hidden" onClick={() => setIsKegiatan(!isKegiatan)}>
                  <motion.div className={`absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] rounded-full shadow-sm z-0 ${isKegiatan ? 'bg-[#00ea30]' : 'bg-[#ff0a0a]'}`} initial={false} animate={{ left: isKegiatan ? "2px" : "calc(50%)" }} transition={{ type: "spring", stiffness: 400, damping: 25 }} />
                  <div className="w-1/2 text-center z-10 text-[13px] font-bold flex justify-center items-center h-full"><span className={isKegiatan ? "text-white" : "text-black"}>iya</span></div>
                  <div className="w-1/2 text-center z-10 text-[13px] font-bold flex justify-center items-center h-full"><span className={!isKegiatan ? "text-white" : "text-black"}>tidak</span></div>
                </div>
              </div>

              {/* Waktu Kegiatan (Muncul jika Kegiatan = iya) */}
              <AnimatePresence>
                {isKegiatan && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-col gap-2 overflow-hidden">
                    <label className="text-sm font-bold text-gray-900 ml-2">Waktu Kegiatan *</label>
                    <input type="datetime-local" name="waktu" value={formData.waktu} onChange={handleChange} required={isKegiatan} className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium focus:outline-none focus:ring-[1.5px] focus:ring-black text-gray-800" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Foto Pendukung */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Foto Pendukung (Opsional)</label>
                <div className="relative cursor-pointer group">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                  <div className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium text-gray-400 group-hover:bg-black/5 transition-colors flex items-center justify-between overflow-hidden">
                    <span className="truncate">{foto ? foto.name : 'Import Foto'}</span>
                    <Upload size={16} className="text-black shrink-0 ml-2" />
                  </div>
                </div>
                {/* Preview Foto */}
                {fotoPreview && (
                  <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-gray-200">
                    <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
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
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan dan Terbitkan'}
                </button>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (Panduan/Tata Cara) */}
          <div className="w-full lg:w-[40%] h-[500px] lg:h-auto">
            <div className="border border-black rounded-[1.5rem] p-6 h-full flex flex-col bg-transparent">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Tata Cara Pengaduan :</h3>
              <div className="flex-1 text-sm font-medium text-gray-500 overflow-y-auto">
                <p className="mb-2">1. Pastikan judul informasi jelas dan mewakili isi konten.</p>
                <p className="mb-2">2. Pilih kategori yang paling sesuai agar warga mudah melakukan pencarian.</p>
                <p className="mb-2">3. Jika konten ini berupa kegiatan desa, aktifkan *toggle* <strong>Kegiatan Desa</strong> menjadi <strong>"Iya"</strong> dan isi waktu pelaksanaannya.</p>
                <p className="mb-2">4. Foto pendukung bersifat opsional, usahakan rasio foto 16:9 (Landscape) untuk tampilan terbaik di aplikasi warga.</p>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}