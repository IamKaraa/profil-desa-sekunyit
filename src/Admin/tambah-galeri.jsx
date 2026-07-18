import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function TambahGaleri() {
  const navigate = useNavigate();
  
  const [judul, setJudul] = useState('');
  const [fotos, setFotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      if (!judul || fotos.length === 0) {
        throw new Error("Judul dan minimal 1 Foto wajib diisi!");
      }

      let uploadedUrls = [];

      // Upload ke storage 'galeri_desa'
      const uploadPromises = fotos.map(async (foto) => {
        const fileExt = foto.name.split('.').pop();
        const fileName = `galeri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from('galeri_desa').upload(fileName, foto);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('galeri_desa').getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      });

      uploadedUrls = await Promise.all(uploadPromises);

      // Simpan ke tabel galeri_desa
      const { error: insertError } = await supabase
        .from('galeri_desa')
        .insert([{
          judul_kegiatan: judul,
          gambar_urls: uploadedUrls
        }]);

      if (insertError) throw insertError;

      alert("Galeri berhasil ditambahkan!");
      navigate('/admin/dashboard');

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-inter bg-[#f2f7f8]">
      <header className="h-[88px] bg-[#111111] flex items-center justify-between px-6 md:px-12 shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#dedede] rounded-full flex items-center justify-center text-sm font-medium text-black">logo</div>
          <h1 className="text-white font-montserrat font-medium text-lg md:text-xl tracking-wide">Desa Sekunyit</h1>
        </div>
        <button onClick={() => navigate('/admin/dashboard')} className="bg-[#ff0a0a] hover:bg-[#d60000] text-white font-medium px-8 py-2 rounded-full transition-all duration-300 active:scale-95 shadow-sm">Batal</button>
      </header>

      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="text-xl font-bold font-montserrat mb-2">Unggah Dokumentasi Galeri</h2>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 ml-2">Nama Kegiatan / Judul Galeri *</label>
              <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} required placeholder="Contoh: Keseruan Lomba 17 Agustus" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 ml-2">Pilih Foto-Foto Kegiatan *</label>
              <div className="relative cursor-pointer group">
                <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                <div className="w-full border border-black border-dashed rounded-xl px-5 py-8 bg-gray-50 text-sm font-medium text-gray-500 group-hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2">
                  <Upload size={24} className="text-gray-600" />
                  <span>Klik atau Seret foto ke sini (Bisa pilih banyak foto sekaligus)</span>
                </div>
              </div>

              <AnimatePresence>
                {previews.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {previews.map((src, index) => (
                      <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-gray-300 bg-gray-100 group">
                        <img src={src} alt={`Preview`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeFoto(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={12} /></button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2"><AlertCircle size={14}/> {errorMsg}</div>}

            <button type="submit" disabled={loading} className="mt-4 w-full bg-[#00ea30] hover:bg-[#00c729] text-black font-bold text-sm px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 flex justify-center items-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan dan Terbitkan Galeri'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}