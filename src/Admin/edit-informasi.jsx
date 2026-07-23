import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Upload, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '../config/supabaseClient';

export default function EditInformasi() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL parameter
  
  // State Form
  const [formData, setFormData] = useState({
    judul: '',
    kategori_informasi: '',
    lokasi: '',
    deskripsi: '',
    waktu: ''
  });
  
  const [isKegiatan, setIsKegiatan] = useState(false);
  
  // Perubahan: State untuk Foto Banyak (Multi)
  const [existingUrls, setExistingUrls] = useState([]); // URL foto lama dari database
  const [newFotos, setNewFotos] = useState([]); // Array file asli baru
  const [newPreviews, setNewPreviews] = useState([]); // Array preview url blob baru
  
  // State Loading & Notifikasi
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Tarik data dari database saat komponen dimuat
  useEffect(() => {
    const fetchInformasi = async () => {
      setInitialLoading(true);
      try {
        const { data, error } = await supabase
          .from('informasi_desa')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          // Format tanggal untuk input datetime-local (Hanya ambil YYYY-MM-DDThh:mm)
          const formatWaktu = data.waktu ? data.waktu.slice(0, 16) : '';

          setFormData({
            judul: data.judul || '',
            kategori_informasi: data.kategori_informasi || '',
            lokasi: data.lokasi || '',
            deskripsi: data.deskripsi || '',
            waktu: formatWaktu
          });

          // Cek apakah ini kegiatan (punya waktu)
          if (data.waktu) {
            setIsKegiatan(true);
          }

          // Cek array gambar lama, fallback ke gambar tunggal jika array kosong
          if (data.gambar_urls && data.gambar_urls.length > 0) {
            setExistingUrls(data.gambar_urls);
          } else if (data.gambar) {
            setExistingUrls([data.gambar]);
          }
        }
      } catch (err) {
        setErrorMsg("Gagal memuat data: " + err.message);
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) fetchInformasi();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler pilih banyak file BARU
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewFotos(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewPreviews(prev => [...prev, ...previews]);
    }
  };

  // Hapus foto lama (yang sudah ada di DB)
  const removeExistingFoto = (indexToRemove) => {
    setExistingUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Hapus foto baru (yang belum diupload)
  const removeNewFoto = (indexToRemove) => {
    setNewFotos(prev => prev.filter((_, i) => i !== indexToRemove));
    setNewPreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!formData.judul || !formData.kategori_informasi || !formData.deskripsi) {
        throw new Error("Judul, Kategori, dan Detail Informasi wajib diisi!");
      }

      let finalUrls = [...existingUrls];

      // 1. Jika ada foto BARU yang diupload, simpan ke Supabase Storage
      if (newFotos.length > 0) {
        const uploadPromises = newFotos.map(async (foto) => {
          const fileExt = foto.name.split('.').pop();
          const fileName = `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('informasi_desa')
            .upload(fileName, foto);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from('informasi_desa')
            .getPublicUrl(fileName);
            
          return publicUrlData.publicUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        finalUrls = [...finalUrls, ...uploadedUrls]; // Gabungkan URL lama dan baru
      }

      // PERBAIKAN ZONA WAKTU: Tambahkan offset +07:00 (WIB) agar tidak dianggap UTC
      const waktuLokal = isKegiatan && formData.waktu 
        ? `${formData.waktu}:00+07:00` 
        : null;

      // 2. Update data ke tabel informasi_desa
      const { error: updateError } = await supabase
        .from('informasi_desa')
        .update({
          judul: formData.judul,
          kategori_informasi: formData.kategori_informasi,
          lokasi: formData.lokasi || null,
          deskripsi: formData.deskripsi,
          waktu: waktuLokal, // Simpan dengan zona waktu yang benar (WIB)
          gambar_urls: finalUrls,
          gambar: finalUrls.length > 0 ? finalUrls[0] : null // Fallback
        })
        .eq('id', id);

      if (updateError) throw updateError;

      alert("Perubahan informasi desa berhasil disimpan!");
      navigate('/admin/dashboard');

    } catch (error) {
      setErrorMsg(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  // Tampilan loading awal saat fetch data
  if (initialLoading) {
    return (
      <div className="h-screen w-full bg-[#f2f7f8] flex flex-col items-center justify-center font-inter">
        <Loader2 size={36} className="animate-spin text-black mb-2" />
        <span className="text-sm font-medium text-gray-600">Memuat Formulir Informasi...</span>
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
                    <option value="lainnya">Lain Lainnya</option>
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

              {/* Unggah Foto Pendukung Multi */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-900 ml-2">Kelola Foto Pendukung</label>
                <div className="relative cursor-pointer group">
                  <input type="file" onChange={handleFileChange} multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/*" />
                  <div className="w-full border border-black rounded-full px-5 py-2.5 bg-transparent text-sm font-medium text-gray-400 group-hover:bg-black/5 transition-colors flex items-center justify-between overflow-hidden">
                    <span>Klik untuk menambah foto baru</span>
                    <Upload size={16} className="text-black shrink-0 ml-2" />
                  </div>
                </div>
                
                {/* Grid Preview Foto Tersimpan & Baru */}
                <AnimatePresence>
                  {(existingUrls.length > 0 || newPreviews.length > 0) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }} 
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3"
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
              <div className="mt-auto pt-6">
                <button type="submit" disabled={loading} className="w-full bg-[#00ea30] hover:bg-[#00c729] text-black font-bold text-sm px-6 py-3.5 rounded-full transition-all duration-300 active:scale-95 shadow-md flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Perubahan'}
                </button>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (Panduan/Tata Cara) */}
          <div className="w-full lg:w-[40%] h-[500px] lg:h-auto">
            <div className="border border-black rounded-[1.5rem] p-6 h-full flex flex-col bg-transparent">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Mode Edit Informasi :</h3>
              <div className="flex-1 text-sm font-medium text-gray-500 overflow-y-auto space-y-3">
                <p>1. Anda dapat mengubah isi informasi yang telah dipublikasikan sebelumnya.</p>
                <p>2. Anda bisa <strong>menghapus foto lama</strong> dengan menekan tombol silang (X) merah pada foto yang bertanda "Tersimpan".</p>
                <p>3. Jika Anda mengganti opsi <strong>Kegiatan Desa</strong> menjadi <strong>"Tidak"</strong>, maka data jadwal waktu yang lama akan otomatis dihapus oleh sistem.</p>
                <p>4. Pastikan untuk menekan tombol "Simpan Perubahan" agar data terbaru terkirim ke database warga.</p>
              </div>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}