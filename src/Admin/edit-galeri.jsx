import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function EditGaleri() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL (/admin/edit-galeri/:id)
  
  const [judul, setJudul] = useState('');
  
  // State untuk melacak foto lama yang sudah ada di database
  const [existingUrls, setExistingUrls] = useState([]);
  
  // State untuk melacak foto baru yang baru saja dipilih
  const [newFotos, setNewFotos] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch data galeri saat komponen pertama kali dimuat
  useEffect(() => {
    const fetchGaleri = async () => {
      setInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from('galeri_desa')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setJudul(data.judul_kegiatan || '');
          setExistingUrls(data.gambar_urls || []);
        }
      } catch (error) {
        setErrorMsg("Gagal memuat data galeri: " + error.message);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchGaleri();
  }, [id]);

  // 2. Handler untuk input file foto baru
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewFotos(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewPreviews(prev => [...prev, ...previews]);
    }
  };

  // 3. Handler untuk menghapus foto lama (yang sudah ada di DB)
  const removeExistingFoto = (indexToRemove) => {
    setExistingUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 4. Handler untuk menghapus foto baru (yang belum di-upload)
  const removeNewFoto = (indexToRemove) => {
    setNewFotos(prev => prev.filter((_, index) => index !== indexToRemove));
    setNewPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 5. Handler untuk Submit Data Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!judul) {
        throw new Error("Judul wajib diisi!");
      }
      if (existingUrls.length === 0 && newFotos.length === 0) {
        throw new Error("Minimal harus ada 1 foto di dalam galeri!");
      }

      let finalUrls = [...existingUrls];

      // Jika ada foto baru, upload dulu ke storage
      if (newFotos.length > 0) {
        const uploadPromises = newFotos.map(async (foto) => {
          const fileExt = foto.name.split('.').pop();
          const fileName = `galeri_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage.from('galeri_desa').upload(fileName, foto);
          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage.from('galeri_desa').getPublicUrl(fileName);
          return publicUrlData.publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        finalUrls = [...finalUrls, ...uploadedUrls]; // Gabungkan URL lama yang tersisa dengan URL baru
      }

      // Update data ke tabel galeri_desa
      const { error: updateError } = await supabase
        .from('galeri_desa')
        .update({
          judul_kegiatan: judul,
          gambar_urls: finalUrls
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert("Galeri berhasil diperbarui!");
      navigate('/admin/dashboard');

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen w-full bg-[#f2f7f8] flex flex-col items-center justify-center font-inter">
        <Loader2 size={36} className="animate-spin text-black mb-2" />
        <span className="text-sm font-medium text-gray-600">Memuat Data Galeri...</span>
      </div>
    );
  }

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
          <h2 className="text-xl font-bold font-montserrat mb-2">Edit Dokumentasi Galeri</h2>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 ml-2">Nama Kegiatan / Judul Galeri *</label>
              <input type="text" value={judul} onChange={(e) => setJudul(e.target.value)} required placeholder="Contoh: Keseruan Lomba 17 Agustus" className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-[1.5px] focus:ring-black" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-900 ml-2">Kelola Foto Kegiatan *</label>
              <div className="relative cursor-pointer group">
                <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                <div className="w-full border border-black border-dashed rounded-xl px-5 py-8 bg-gray-50 text-sm font-medium text-gray-500 group-hover:bg-gray-100 transition-colors flex flex-col items-center justify-center gap-2">
                  <Upload size={24} className="text-gray-600" />
                  <span>Klik atau Seret foto tambahan ke sini</span>
                </div>
              </div>

              {/* TAMPILAN PREVIEW FOTO LAMA & BARU */}
              <AnimatePresence>
                {(existingUrls.length > 0 || newPreviews.length > 0) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    
                    {/* Render Foto Lama */}
                    {existingUrls.map((url, index) => (
                      <div key={`old-${index}`} className="relative aspect-video rounded-xl overflow-hidden border border-gray-300 bg-gray-100 group">
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-bold z-10">Tersimpan</div>
                        <img src={url} alt={`Saved Preview ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeExistingFoto(index)} title="Hapus Foto Ini" className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"><X size={12} /></button>
                      </div>
                    ))}

                    {/* Render Foto Baru */}
                    {newPreviews.map((src, index) => (
                      <div key={`new-${index}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-400 bg-gray-100 group">
                         <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded font-bold z-10">Baru</div>
                        <img src={src} alt={`New Preview ${index}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewFoto(index)} title="Batal Tambah Foto" className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 z-10"><X size={12} /></button>
                      </div>
                    ))}

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2"><AlertCircle size={14}/> {errorMsg}</div>}

            <button type="submit" disabled={loading} className="mt-4 w-full bg-[#00ea30] hover:bg-[#00c729] text-black font-bold text-sm px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 flex justify-center items-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Perubahan Galeri'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}