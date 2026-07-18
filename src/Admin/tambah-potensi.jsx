import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function TambahPotensi() {
  const navigate = useNavigate();
  
  // State Form
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: ''
  });
  
  const [fotos, setFotos] = useState([]); // Array file asli
  const [previews, setPreviews] = useState([]); // Array preview url blob
  
  // State Loading & Notifikasi
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler pilih banyak file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setFotos(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Hapus salah satu foto dari daftar sebelum diupload
  const removeFoto = (index) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!formData.judul || !formData.deskripsi) {
        throw new Error("Judul dan Deskripsi Potensi wajib diisi!");
      }

      let uploadedUrls = [];

      // 1. Upload semua file foto ke bucket 'potensi_desa' secara paralel
      if (fotos.length > 0) {
        const uploadPromises = fotos.map(async (foto) => {
          const fileExt = foto.name.split('.').pop();
          const fileName = `potensi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('potensi_desa')
            .upload(fileName, foto);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('potensi_desa')
            .getPublicUrl(fileName);
            
          return publicUrlData.publicUrl;
        });

        uploadedUrls = await Promise.all(uploadPromises);
      }

      // 2. Simpan data ke tabel potensi_desa (menggunakan array gambar_urls)
      const { error: insertError } = await supabase
        .from('potensi_desa')
        .insert([{
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          gambar_urls: uploadedUrls, // Menyimpan array url gambar
          gambar: uploadedUrls.length > 0 ? uploadedUrls[0] : null // Fallback kompatibilitas kolom lama
        }]);

      if (insertError) throw insertError;

      alert("Potensi desa berhasil diterbitkan!");
      navigate('/admin/dashboard');

    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan potensi.");
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
          <div className="w-full lg:w-[60%] flex flex-col gap-6 content-start">
            
            {/* Judul Potensi */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 ml-2">Nama / Judul Potensi *</label>
              <input 
                type="text" 
                name="judul" 
                value={formData.judul} 
                onChange={handleChange} 
                required 
                placeholder="Contoh: Pantai Karang Alami Sekunyit" 
                className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" 
              />
            </div>

            {/* Uraian Deskripsi */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-bold text-gray-900 ml-2">Uraian Detail Potensi *</label>
              <textarea 
                name="deskripsi" 
                value={formData.deskripsi} 
                onChange={handleChange} 
                required 
                placeholder="Jelaskan secara mendalam tentang daya tarik, keunggulan, atau nilai ekonomi dari potensi ini..." 
                className="w-full border border-black rounded-[1.5rem] p-5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black resize-none min-h-[220px]"
              ></textarea>
            </div>

            {/* Unggah Foto Pendukung (Bisa Lebih dari 1) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 ml-2">Foto-Foto Pendukung (Bisa lebih dari 1) *</label>
              <div className="relative cursor-pointer group">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  multiple 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept="image/*" 
                />
                <div className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium text-gray-400 group-hover:bg-black/5 transition-colors flex items-center justify-between">
                  <span>Pilih foto-foto potensi desa</span>
                  <Upload size={16} className="text-black" />
                </div>
              </div>

              {/* Grid Preview Foto Terpilih */}
              <AnimatePresence>
                {previews.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3"
                  >
                    {previews.map((src, index) => (
                      <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-gray-300 group shadow-sm bg-gray-100">
                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeFoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle size={14}/> {errorMsg}
              </div>
            )}

            {/* Tombol Simpan */}
            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#00ea30] hover:bg-[#00c729] text-black font-bold text-sm px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan dan Terbitkan Potensi'}
              </button>
            </div>

          </div>

          {/* KOLOM KANAN (Panduan/Tata Cara) */}
          <div className="w-full lg:w-[40%] h-auto">
            <div className="border border-black rounded-[1.5rem] p-6 h-full flex flex-col bg-transparent">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Ketentuan Unggah Potensi :</h3>
              <div className="text-sm font-medium text-gray-500 space-y-3">
                <p>1. <strong>Tulis nama potensi</strong> secara menarik dan informatif untuk memikat wisatawan atau investor.</p>
                <p>2. <strong>Tulis deskripsi secara detail</strong>. Ceritakan keunikan, lokasi rute, tarif masuk (jika ada), atau kontak pengelola.</p>
                <p>3. Anda dapat <strong>mengunggah banyak foto sekaligus</strong>. Foto pertama yang Anda pilih akan otomatis dijadikan gambar sampul utama.</p>
                <p>4. Gunakan rasio landscape (horizontal) dengan resolusi yang baik agar tampak menawan di halaman depan warga.</p>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}