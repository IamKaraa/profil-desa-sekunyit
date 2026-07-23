import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function EditPotensi() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL (/admin/edit-potensi/:id)
  
  // State Form
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: ''
  });
  
  // State untuk Foto
  const [existingUrls, setExistingUrls] = useState([]); // Foto lama dari database
  const [newFotos, setNewFotos] = useState([]); // Array file asli baru
  const [newPreviews, setNewPreviews] = useState([]); // Array preview url blob baru
  
  // State Loading & Notifikasi
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Ambil data potensi dari database saat komponen dimuat
  useEffect(() => {
    const fetchPotensi = async () => {
      setInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from('potensi_desa')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFormData({
            judul: data.judul || '',
            deskripsi: data.deskripsi || ''
          });
          
          // Masukkan array gambar lama, fallback ke gambar tunggal jika array kosong
          if (data.gambar_urls && data.gambar_urls.length > 0) {
            setExistingUrls(data.gambar_urls);
          } else if (data.gambar) {
            setExistingUrls([data.gambar]);
          }
        }
      } catch (err) {
        setErrorMsg("Gagal memuat data potensi: " + err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchPotensi();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handler pilih banyak file BARU
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewFotos(prev => [...prev, ...files]);
      
      const previews = files.map(file => URL.createObjectURL(file));
      setNewPreviews(prev => [...prev, ...previews]);
    }
  };

  // 3. Hapus foto lama (yang sudah ada di DB)
  const removeExistingFoto = (indexToRemove) => {
    setExistingUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 4. Hapus foto baru (yang belum diupload)
  const removeNewFoto = (indexToRemove) => {
    setNewFotos(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // 5. Submit Perubahan
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!formData.judul || !formData.deskripsi) {
        throw new Error("Judul dan Deskripsi Potensi wajib diisi!");
      }

      let finalUrls = [...existingUrls];

      // Jika ada file foto baru, upload ke storage 'potensi_desa'
      if (newFotos.length > 0) {
        const uploadPromises = newFotos.map(async (foto) => {
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

        const uploadedUrls = await Promise.all(uploadPromises);
        finalUrls = [...finalUrls, ...uploadedUrls]; // Gabungkan URL lama dan baru
      }

      // Update data ke tabel potensi_desa
      const { error: updateError } = await supabase
        .from('potensi_desa')
        .update({
          judul: formData.judul,
          deskripsi: formData.deskripsi,
          gambar_urls: finalUrls, 
          gambar: finalUrls.length > 0 ? finalUrls[0] : null // Fallback kompatibilitas kolom lama
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert("Potensi desa berhasil diperbarui!");
      navigate('/admin/dashboard');

    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan saat memperbarui potensi.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="h-screen w-full bg-[#f2f7f8] flex flex-col items-center justify-center font-inter">
        <Loader2 size={36} className="animate-spin text-black mb-2" />
        <span className="text-sm font-medium text-gray-600">Memuat Formulir Potensi...</span>
      </div>
    );
  }

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
              <label className="text-sm font-bold text-gray-900 ml-2">Kelola Foto Potensi (Bisa lebih dari 1)</label>
              <div className="relative cursor-pointer group">
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  multiple 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  accept="image/*" 
                />
                <div className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium text-gray-400 group-hover:bg-black/5 transition-colors flex items-center justify-between">
                  <span>Klik untuk menambah foto baru</span>
                  <Upload size={16} className="text-black" />
                </div>
              </div>

              {/* Grid Preview Foto Tersimpan & Baru */}
              <AnimatePresence>
                {(existingUrls.length > 0 || newPreviews.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-3"
                  >
                    {/* Render Foto Lama */}
                    {existingUrls.map((url, index) => (
                      <div key={`old-${index}`} className="relative aspect-video rounded-xl overflow-hidden border border-gray-300 group shadow-sm bg-gray-100">
                        <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-bold z-10">Tersimpan</div>
                        <img src={url} alt={`Saved ${index}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeExistingFoto(index)}
                          title="Hapus Foto Ini"
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {/* Render Foto Baru */}
                    {newPreviews.map((src, index) => (
                      <div key={`new-${index}`} className="relative aspect-video rounded-xl overflow-hidden border-2 border-emerald-400 group shadow-sm bg-gray-100">
                        <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded font-bold z-10">Baru</div>
                        <img src={src} alt={`New Preview ${index}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeNewFoto(index)}
                          title="Batal Tambah"
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
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
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Perubahan Potensi'}
              </button>
            </div>

          </div>

          {/* KOLOM KANAN (Panduan/Tata Cara) */}
          <div className="w-full lg:w-[40%] h-auto">
            <div className="border border-black rounded-[1.5rem] p-6 h-full flex flex-col bg-transparent">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Mode Edit Potensi :</h3>
              <div className="text-sm font-medium text-gray-500 space-y-3">
                <p>1. Anda dapat mengubah isi konten potensi yang sudah terpublikasi.</p>
                <p>2. Anda bisa <strong>menghapus foto lama</strong> dengan menekan tombol silang (X) merah pada foto yang bertanda "Tersimpan".</p>
                <p>3. Anda juga bisa <strong>menambahkan foto baru</strong> secara bersamaan.</p>
                <p>4. Foto di urutan paling pertama (kiri atas) akan otomatis dijadikan sebagai gambar sampul (cover) potensi di halaman depan warga.</p>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}