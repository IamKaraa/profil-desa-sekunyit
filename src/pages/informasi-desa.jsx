import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronDown, Clock, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../config/supabaseClient'; // Sesuaikan path

const formatTanggal = (dateString) => {
  if (!dateString) return '-';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options) + ' WIB';
};

export default function InformasiUser() {
  const navigate = useNavigate();

  // State untuk Data Asli dari Supabase
  const [dataTerbaru, setDataTerbaru] = useState([]);
  const [dataSelesai, setDataSelesai] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Dropdown & Sorting
  const [sortMenuTerbaru, setSortMenuTerbaru] = useState(false);
  const [sortMenuSelesai, setSortMenuSelesai] = useState(false);
  const [labelSortTerbaru, setLabelSortTerbaru] = useState('Terbaru');
  const [labelSortSelesai, setLabelSortSelesai] = useState('Terbaru');

  // Fetch Data dari Supabase
  useEffect(() => {
    const fetchInformasi = async () => {
      try {
        const { data, error } = await supabase
          .from('informasi_desa')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const sekarang = new Date();
        const terbaru = [];
        const selesai = [];

        // Memisahkan data:
        data.forEach(item => {
          if (item.waktu) {
            // 1. LOGIKA UNTUK KEGIATAN: Pindah ke 'Selesai' jika jadwal acara sudah lewat
            const waktuAgenda = new Date(item.waktu);
            if (waktuAgenda < sekarang) {
              selesai.push(item);
            } else {
              terbaru.push(item);
            }
          } else {
            // 2. LOGIKA UNTUK NON-KEGIATAN (PENGUMUMAN): Pindah ke 'Selesai' jika usianya sudah > 14 Hari
            const tanggalDibuat = new Date(item.created_at);
            const batasWaktu = new Date(tanggalDibuat);
            batasWaktu.setDate(batasWaktu.getDate() + 14); // Tambah 14 hari dari tanggal dibuat

            if (sekarang > batasWaktu) {
              selesai.push(item); // Sudah lebih dari 14 hari, pindah ke arsip
            } else {
              terbaru.push(item); // Masih baru, tetap di Terbaru
            }
          }
        });

        setDataTerbaru(terbaru);
        setDataSelesai(selesai);
      } catch (error) {
        console.error("Gagal mengambil informasi desa:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInformasi();
  }, []);

  // Fungsi Sorting
  const handleSort = (type, section) => {
    const sortByDate = (a, b) => {
      const dateA = new Date(a.waktu || a.created_at);
      const dateB = new Date(b.waktu || b.created_at);
      return type === 'asc' ? dateA - dateB : dateB - dateA;
    };

    if (section === 'terbaru') {
      const sorted = [...dataTerbaru].sort(sortByDate);
      setDataTerbaru(sorted);
      setLabelSortTerbaru(type === 'desc' ? 'Terbaru' : 'Terlama');
      setSortMenuTerbaru(false);
    } else {
      const sorted = [...dataSelesai].sort(sortByDate);
      setDataSelesai(sorted);
      setLabelSortSelesai(type === 'desc' ? 'Terbaru' : 'Terlama');
      setSortMenuSelesai(false);
    }
  };

  const InfoCard = ({ item }) => (
    <motion.div 
      onClick={() => navigate(`/informasi/${item.id}`)} 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.01 }}
      // PERUBAHAN: Ditambahkan sm:h-[180px] agar tinggi kotak konsisten
      className="flex flex-col sm:flex-row bg-[#e8e8e8] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group sm:h-[180px]"
    >
      {/* PERUBAHAN: Mengunci tinggi gambar agar proporsional dengan tinggi kotak */}
      <div className="bg-[#222222] w-full sm:w-[240px] shrink-0 h-[180px] sm:h-full flex items-center justify-center relative overflow-hidden">
        {item.gambar ? (
          <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-gray-400 font-inter text-sm">Tanpa Gambar</span>
        )}
      </div>
      
      {/* PERUBAHAN: Diberi overflow-hidden dan pengaturan jarak antar elemen */}
      <div className="p-4 md:p-5 flex flex-col flex-1 w-full overflow-hidden">
        {/* Judul dibatasi maksimal 2 baris */}
        <h4 className="font-montserrat font-bold text-gray-900 text-sm md:text-base mb-2 line-clamp-2" title={item.judul}>
          {item.judul}
        </h4>
        <div className="flex flex-col gap-1.5 mb-3">
          <p className="text-gray-600 text-xs font-inter flex items-center gap-1.5 font-medium truncate">
            <Clock size={12} className="text-gray-500 shrink-0"/> 
            <span className="truncate">{item.waktu ? formatTanggal(item.waktu) : formatTanggal(item.created_at)}</span>
          </p>
          {item.lokasi && (
            <p className="text-gray-600 text-xs font-inter flex items-center gap-1.5 font-medium truncate">
              <MapPin size={12} className="text-gray-500 shrink-0"/> 
              <span className="truncate">{item.lokasi}</span>
            </p>
          )}
        </div>
        {/* Deskripsi ditekan ke bawah dengan mt-auto dan dibatasi jumlah barisnya */}
        <p className="text-gray-700 text-[13px] font-inter leading-relaxed line-clamp-2 md:line-clamp-3 mt-auto">
          {item.deskripsi}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
                      <ArrowLeft size={20} />
                    </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">Informasi dan Berita Desa Sekunyit</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-8">
        <h2 className="text-gray-800 font-montserrat font-bold text-[15px] mb-6 tracking-wide">Informasi Dan Berita Acara Seputar Desa</h2>

        <div className="bg-[#8c8c8c] rounded-2xl md:rounded-[2rem] p-4 md:p-8 lg:p-10 shadow-lg min-h-[50vh]">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-3 py-20">
              <Loader2 size={32} className="animate-spin" />
              <span className="font-medium text-sm">Memuat Informasi Desa...</span>
            </div>
          ) : (
            <>
              {/* TERBARU */}
              <section className="mb-12 relative">
                <div className="flex justify-between items-center border-b-[1.5px] border-gray-300/50 pb-3 mb-6">
                  <h3 className="text-white font-montserrat font-semibold text-sm md:text-base">Informasi Terbaru Seputar Desa</h3>
                  <div className="relative">
                    <button onClick={() => { setSortMenuTerbaru(!sortMenuTerbaru); setSortMenuSelesai(false); }} className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors text-sm font-medium focus:outline-none">
                      <span className="hidden sm:inline-block">Urutkan: {labelSortTerbaru}</span><ChevronDown size={18} className={`transform transition-transform ${sortMenuTerbaru ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {sortMenuTerbaru && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-8 bg-white rounded-lg shadow-xl py-2 w-36 z-10">
                          <button onClick={() => handleSort('desc', 'terbaru')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium">Terbaru</button>
                          <button onClick={() => handleSort('asc', 'terbaru')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium">Terlama</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex flex-col gap-4 md:gap-5">
                  {dataTerbaru.length === 0 ? (
                    <p className="text-white/70 text-center py-6 text-sm">Tidak ada informasi terbaru saat ini.</p>
                  ) : (
                    dataTerbaru.map((item) => <InfoCard key={item.id} item={item} />)
                  )}
                </div>
              </section>

              {/* SELESAI / BERITA ACARA */}
              <section className="relative">
                <div className="flex justify-between items-center border-b-[1.5px] border-gray-300/50 pb-3 mb-6">
                  <h3 className="text-white font-montserrat font-semibold text-sm md:text-base flex items-center gap-2">
                    Berita Acara Desa <CheckCircle size={16} className="text-green-400" />
                  </h3>
                  <div className="relative">
                    <button onClick={() => { setSortMenuSelesai(!sortMenuSelesai); setSortMenuTerbaru(false); }} className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors text-sm font-medium focus:outline-none">
                      <span className="hidden sm:inline-block">Urutkan: {labelSortSelesai}</span><ChevronDown size={18} className={`transform transition-transform ${sortMenuSelesai ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {sortMenuSelesai && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-8 bg-white rounded-lg shadow-xl py-2 w-36 z-10">
                          <button onClick={() => handleSort('desc', 'selesai')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium">Terbaru</button>
                          <button onClick={() => handleSort('asc', 'selesai')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium">Terlama</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex flex-col gap-4 md:gap-5">
                  {dataSelesai.length === 0 ? (
                    <p className="text-white/70 text-center py-6 text-sm">Belum ada arsip kegiatan yang telah selesai.</p>
                  ) : (
                    dataSelesai.map((item) => <InfoCard key={item.id} item={item} />)
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}