import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, School, Stethoscope, Moon, Landmark, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { supabase } from '../config/supabaseClient';

const COLORS = ['#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

// Helper untuk Tooltip Custom di Recharts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg z-50 relative">
        <p className="font-bold text-gray-800">{payload[0].name}</p>
        <p className="text-sm font-medium text-blue-600">
          Jumlah: {payload[0].value} Buah
        </p>
      </div>
    );
  }
  return null;
};

export default function DataBangunanUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State untuk menampung data bangunan dari database
  const [dataBangunan, setDataBangunan] = useState({
    pendidikan: [], kesehatan: [], ibadah: [], umum: []
  });

  // Ambil Data dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('desa_profil')
          .select('data')
          .eq('kategori', 'bangunan')
          .single();

        if (error) throw error;
        if (data && data.data) {
          // Fallback check jika format database masih lama
          if (data.data.sd !== undefined && !data.data.pendidikan) {
             setDataBangunan({
               pendidikan: [ { name: 'Gedung Sekolah SD', jumlah: data.data.sd }, { name: 'Gedung Sekolah SLTP', jumlah: data.data.smp }, { name: 'Gedung Sekolah SLTA', jumlah: data.data.sma }, { name: 'Perguruan Tinggi', jumlah: data.data.pt } ],
               kesehatan: [ { name: 'Rumah Sakit', jumlah: data.data.rs }, { name: 'Puskesmas', jumlah: data.data.puskesmas }, { name: 'Puskesmas Pembantu (Pustu)', jumlah: data.data.pustu } ],
               ibadah: [ { name: 'Masjid', jumlah: data.data.masjid }, { name: 'Langgar', jumlah: data.data.langgar }, { name: 'Gereja', jumlah: data.data.gereja }, { name: 'Kuil', jumlah: data.data.kuil } ],
               umum: []
             });
          } else {
             setDataBangunan(data.data);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data bangunan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- PERHITUNGAN DINAMIS ---
  // Fungsi menghitung total nilai dalam array
  const sumVal = (arr) => (arr || []).reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  
  const totalPendidikan = sumVal(dataBangunan.pendidikan);
  const totalKesehatan = sumVal(dataBangunan.kesehatan);
  const totalIbadah = sumVal(dataBangunan.ibadah);
  const totalUmum = sumVal(dataBangunan.umum);
  const grandTotal = totalPendidikan + totalKesehatan + totalIbadah + totalUmum;

  // Format Data untuk List (Kiri) digabung menjadi satu array besar dengan identifikasi ikon
  const dataPemerintah = [
    ...(dataBangunan.pendidikan || []).map(item => ({ ...item, icon: 'pendidikan' })),
    ...(dataBangunan.kesehatan || []).map(item => ({ ...item, icon: 'kesehatan' })),
    ...(dataBangunan.umum || []).map(item => ({ ...item, icon: 'umum' })),
  ];

  // Format Data untuk Pie Chart Ibadah (Kanan)
  const rawIbadah = (dataBangunan.ibadah || []).map((item, idx) => ({
    name: item.name,
    value: Number(item.jumlah) || 0,
    color: COLORS[idx % COLORS.length]
  }));
  
  // Chart HANYA merender yang nilainya lebih dari 0 agar tidak error/tumpang tindih
  const dataIbadahChart = rawIbadah.filter(item => item.value > 0);

  // Variabel Animasi
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      
      {/* Import Font */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Data Infrastruktur Desa
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-8 md:mt-10">
        
        <div className="mb-8">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="text-gray-900 font-montserrat font-bold text-2xl md:text-3xl mb-2"
          >
            Statistika Bangunan Desa
          </motion.h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">
            Rincian jumlah fasilitas umum, bangunan pemerintah, dan tempat ibadah di Desa Sekunyit.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-4">
             <Loader2 className="animate-spin" size={40}/>
             <span className="font-medium text-sm">Menyelaraskan Data Infrastruktur...</span>
          </div>
        ) : (
          <>
            {/* --- SECTION 1: KARTU RINGKASAN (HERO) --- */}
            <motion.section 
              initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
            >
              {/* Card 1: Total Semua Bangunan */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium text-[11px] md:text-xs uppercase tracking-wider mb-1">Total Fasilitas</p>
                  <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-gray-900">{grandTotal} <span className="text-sm text-gray-400 font-medium">Buah</span></h3>
                </div>
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><Building2 size={24} /></div>
              </motion.div>

              {/* Card 2: Pendidikan */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium text-[11px] md:text-xs uppercase tracking-wider mb-1">Pendidikan</p>
                  <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-blue-600">{totalPendidikan} <span className="text-sm text-gray-400 font-medium">Buah</span></h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600"><School size={24} /></div>
              </motion.div>

              {/* Card 3: Kesehatan */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium text-[11px] md:text-xs uppercase tracking-wider mb-1">Kesehatan</p>
                  <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-rose-500">{totalKesehatan} <span className="text-sm text-gray-400 font-medium">Buah</span></h3>
                </div>
                <div className="bg-rose-100 p-3 rounded-2xl text-rose-500"><Stethoscope size={24} /></div>
              </motion.div>

              {/* Card 4: Ibadah */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-gray-500 font-medium text-[11px] md:text-xs uppercase tracking-wider mb-1">Tempat Ibadah</p>
                  <h3 className="font-montserrat font-bold text-2xl md:text-3xl text-emerald-600">{totalIbadah} <span className="text-sm text-gray-400 font-medium">Buah</span></h3>
                </div>
                <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><Moon size={24} /></div>
              </motion.div>
            </motion.section>

            {/* --- SECTION 2: DETAIL BANGUNAN (GRID 2 KOLOM) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* KOLOM KIRI: Bangunan Pemerintah (Progress List) */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><Landmark size={20} /></div>
                  <h4 className="font-montserrat font-bold text-lg text-gray-900">Bangunan Pemerintah & Umum</h4>
                </div>
                
                <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {dataPemerintah.length === 0 ? <p className="text-gray-400 italic text-sm text-center py-4">Belum ada daftar fasilitas didaftarkan.</p> : null}
                  {dataPemerintah.map((item, index) => {
                    // Logika warna berdasarkan ketersediaan (jumlah > 0)
                    const isAvailable = Number(item.jumlah) > 0;
                    
                    // Menentukan warna progress bar berdasarkan kategori icon
                    const barColor = isAvailable 
                      ? (item.icon === 'pendidikan' ? 'bg-blue-500' : item.icon === 'kesehatan' ? 'bg-rose-500' : 'bg-amber-500') 
                      : 'bg-gray-200';
                    
                    const textColor = isAvailable ? 'text-gray-900' : 'text-gray-400';
                    const countColor = isAvailable ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium';

                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center text-sm mb-1.5">
                          <div className="flex items-center gap-2">
                            {item.icon === 'pendidikan' 
                              ? <School size={14} className={isAvailable ? 'text-blue-500' : 'text-gray-300'} /> 
                              : item.icon === 'kesehatan'
                                ? <Stethoscope size={14} className={isAvailable ? 'text-rose-500' : 'text-gray-300'} />
                                : <Landmark size={14} className={isAvailable ? 'text-amber-500' : 'text-gray-300'} />
                            }
                            <span className={`${textColor} font-medium max-w-[180px] md:max-w-[240px] truncate`} title={item.name}>{item.name}</span>
                          </div>
                          <span className={countColor}>
                            {Number(item.jumlah) === 0 ? '- buah' : `${item.jumlah} buah`}
                          </span>
                        </div>
                        {/* Visualisasi Bar (Penuh jika ada, kosong/abu jika tidak ada) */}
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`${barColor} h-1.5 rounded-full transition-all duration-1000 ease-out`} 
                            style={{ width: isAvailable ? '100%' : '0%' }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>

              {/* KOLOM KANAN: Tempat Ibadah (Donut Chart) */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><Moon size={20} /></div>
                  <h4 className="font-montserrat font-bold text-lg text-gray-900">Tempat Ibadah</h4>
                </div>

                {/* Area Donut Chart */}
                <div className="w-full flex-1 min-h-[250px] relative flex flex-col items-center justify-center mt-4">
                  {dataIbadahChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={dataIbadahChart}
                          cx="50%" cy="50%"
                          innerRadius={70} outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {dataIbadahChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Moon size={40} className="mb-2 opacity-50" />
                        <p className="text-sm italic">Tidak ada tempat ibadah terdaftar.</p>
                     </div>
                  )}
                  
                  {/* Teks di tengah Donut */}
                  {dataIbadahChart.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                      <span className="text-gray-500 font-medium text-xs uppercase tracking-widest">Total</span>
                      <span className="text-3xl font-montserrat font-bold text-gray-900">{totalIbadah}</span>
                    </div>
                  )}
                </div>

                {/* Legend / Keterangan Manual di bawah chart (Selalu Muncul Semua) */}
                <div className="flex flex-col gap-3 mt-4 px-4 max-h-[150px] overflow-y-auto hide-scrollbar">
                  {rawIbadah.map((item, idx) => {
                    const isAvailable = item.value > 0;
                    return (
                      <div key={idx} className="flex justify-between items-center text-sm font-medium border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div className={`flex items-center gap-2 ${isAvailable ? 'text-gray-700' : 'text-gray-400'}`}>
                           <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: isAvailable ? item.color : '#d1d5db' }}></div> 
                           <span className="truncate max-w-[150px]" title={item.name}>{item.name}</span>
                        </div>
                        <span className={isAvailable ? 'font-bold text-gray-900' : 'font-semibold text-gray-400'}>
                          {isAvailable ? `${item.value} buah` : '- buah'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

            </div>
          </>
        )}
      </main>
    </div>
  );
}