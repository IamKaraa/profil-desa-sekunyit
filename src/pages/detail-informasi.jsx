import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabaseClient';

const formatTanggal = (dateString) => {
  if (!dateString) return '-';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options) + ' WIB';
};

export default function DetailInformasiUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data: detailData, error } = await supabase
          .from('informasi_desa')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setData(detailData);
      } catch (error) {
        console.error("Gagal menarik data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8f9] flex flex-col items-center justify-center text-gray-800">
        <Loader2 size={36} className="animate-spin mb-3" />
        <p className="font-medium">Membuka informasi...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f4f8f9] flex flex-col items-center justify-center font-inter">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Informasi Tidak Ditemukan</h2>
        <button onClick={() => navigate(-1)} className="bg-[#111] hover:bg-[#333] text-white px-6 py-2.5 rounded-full transition-colors font-medium">
          Kembali ke Daftar Informasi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide truncate">
            Detail Informasi Desa
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-12 mt-8 md:mt-10">
        <motion.article 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-200"
        >
          {/* Badge Kategori */}
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            {data.kategori_informasi}
          </span>

          {/* Judul Utama */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-montserrat font-bold text-gray-900 leading-tight mb-6">
            {data.judul}
          </h1>

          {/* Meta Data */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-2.5 text-gray-600 font-medium text-sm">
              <div className="bg-gray-100 p-2 rounded-full"><Calendar size={18} className="text-gray-500" /></div>
              {data.waktu ? formatTanggal(data.waktu) : formatTanggal(data.created_at)}
            </div>
            {data.lokasi && (
              <div className="flex items-center gap-2.5 text-gray-600 font-medium text-sm">
                <div className="bg-gray-100 p-2 rounded-full"><MapPin size={18} className="text-gray-500" /></div>
                {data.lokasi}
              </div>
            )}
          </div>

          {/* Area Gambar Besar */}
          {data.gambar ? (
            <div className="w-full aspect-video rounded-2xl mb-8 shadow-sm overflow-hidden bg-gray-100">
              <img src={data.gambar} alt={data.judul} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-video bg-[#222222] rounded-2xl flex flex-col items-center justify-center mb-8 shadow-inner overflow-hidden">
               <ImageIcon size={48} className="text-gray-600 mb-2" />
               <span className="text-gray-500 font-medium text-sm">Tidak Ada Lampiran Foto</span>
            </div>
          )}

          {/* Deskripsi Penuh */}
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 text-[15px] md:text-[16px] leading-relaxed whitespace-pre-line text-justify font-medium">
              {data.deskripsi}
            </p>
          </div>
        </motion.article>
      </main>
    </div>
  );
}