import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, User, Home, BookOpen, GraduationCap, Briefcase, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../config/supabaseClient';

// Warna palet berurutan untuk grafik Donut
const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

// Custom Tooltip untuk Grafik
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg z-50 relative">
        <p className="font-bold text-gray-800">{label || payload[0].name}</p>
        <p className="text-sm font-medium text-blue-600">
          Jumlah: {payload[0].value} Jiwa
        </p>
      </div>
    );
  }
  return null;
};

export default function DataKependudukanUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State untuk menampung seluruh data dari Supabase
  const [dataKep, setDataKep] = useState({
    utama: { total: 0, laki: 0, perempuan: 0, kk: 0 },
    umur: [],
    pendidikan: [],
    pekerjaan: [],
    agama: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('desa_profil')
          .select('data')
          .eq('kategori', 'kependudukan')
          .single();

        if (error) throw error;
        
        // Memastikan struktur data dari database aman sebelum dimasukkan ke state
        if (data && data.data && data.data.utama) {
          setDataKep(data.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data kependudukan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Variabel Animasi
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Format data untuk Pie Chart Gender
  const dataGender = [
    { name: 'Laki-Laki', value: dataKep.utama.laki, color: '#3b82f6' },
    { name: 'Perempuan', value: dataKep.utama.perempuan, color: '#ec4899' }
  ];

  // Format data untuk Pie Chart Agama (Tambahkan properti warna dinamis dan value)
  const dataAgamaMapped = dataKep.agama.map((item, index) => ({
    name: item.name,
    value: item.jumlah,
    color: COLORS[index % COLORS.length]
  }));

  // Cari angka tertinggi untuk menghitung 100% dari progress bar
  const maxPendidikan = Math.max(...dataKep.pendidikan.map(d => d.jumlah), 1);
  const maxPekerjaan = Math.max(...dataKep.pekerjaan.map(d => d.jumlah), 1);

  // Mencari agama yang paling mayoritas
  const agamaMayoritas = dataKep.agama.length > 0 
    ? dataKep.agama.reduce((prev, current) => (prev.jumlah > current.jumlah) ? prev : current) 
    : { name: '-', jumlah: 0 };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
                                <ArrowLeft size={20} />
                              </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Data Kependudukan Desa Sekunyit
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-8 md:mt-10">
        
        <div className="mb-8">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="text-gray-900 font-montserrat font-bold text-2xl md:text-3xl mb-2">
            Statistika Kependudukan
          </motion.h2>
          <p className="text-gray-600 font-medium text-sm md:text-base">
            Visualisasi data demografi penduduk Desa Sekunyit secara langsung.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-32"><Loader2 className="animate-spin text-gray-400" size={40}/></div>
        ) : (
          <>
            {/* --- SECTION 1: HERO (KARTU SUMMARY & PIE CHART) --- */}
            <motion.section initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Kolom Kiri: Kartu Total & Laki-laki */}
              <div className="flex flex-col gap-6 justify-center">
                <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-wider mb-1">Total Penduduk</p>
                    <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-gray-900">{dataKep.utama.total} <span className="text-base text-gray-400 font-medium">Jiwa</span></h3>
                  </div>
                  <div className="bg-indigo-100 p-4 rounded-full text-indigo-600"><Users size={32} /></div>
                </motion.div>
                
                <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-wider mb-1">Laki - Laki</p>
                    <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-blue-600">{dataKep.utama.laki} <span className="text-base text-gray-400 font-medium">Jiwa</span></h3>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-full text-blue-600"><User size={32} /></div>
                </motion.div>
              </div>

              {/* Kolom Tengah: Pie Chart (Visualisasi Gender) */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                <h4 className="font-montserrat font-bold text-gray-800 mb-2">Rasio Gender</h4>
                <div className="w-full h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataGender} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                        {dataGender.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Kolom Kanan: Kartu Perempuan & KK */}
              <div className="flex flex-col gap-6 justify-center">
                <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-wider mb-1">Perempuan</p>
                    <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-pink-500">{dataKep.utama.perempuan} <span className="text-base text-gray-400 font-medium">Jiwa</span></h3>
                  </div>
                  <div className="bg-pink-100 p-4 rounded-full text-pink-500"><User size={32} /></div>
                </motion.div>

                <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-medium text-xs md:text-sm uppercase tracking-wider mb-1">Kepala Keluarga</p>
                    <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-emerald-600">{dataKep.utama.kk} <span className="text-base text-gray-400 font-medium">KK</span></h3>
                  </div>
                  <div className="bg-emerald-100 p-4 rounded-full text-emerald-600"><Home size={32} /></div>
                </motion.div>
              </div>
            </motion.section>

            {/* --- SECTION 2: TINGKAT UMUR (BAR CHART) --- */}
            {dataKep.umur.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm mb-8">
                <div className="mb-6">
                  <h4 className="font-montserrat font-bold text-xl text-gray-900">Demografi Berdasarkan Umur</h4>
                  <p className="text-sm text-gray-500 font-medium">Distribusi usia penduduk Desa Sekunyit</p>
                </div>
                <div className="w-full h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataKep.umur} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} content={<CustomTooltip />} />
                      <Bar dataKey="jumlah" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.section>
            )}

            {/* --- SECTION 3: PENDIDIKAN, PEKERJAAN, AGAMA (3 KOLOM) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              
              {/* Kolom 1: Tingkat Pendidikan */}
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><GraduationCap size={20} /></div>
                  <h4 className="font-montserrat font-bold text-lg text-gray-900">Pendidikan</h4>
                </div>
                
                <div className="flex flex-col gap-4">
                  {dataKep.pendidikan.length === 0 ? <p className="text-gray-400 text-sm italic">Belum ada data.</p> : null}
                  {dataKep.pendidikan.map((item, index) => {
                    const percent = Math.min((item.jumlah / maxPendidikan) * 100, 100); 
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-xs md:text-sm font-medium mb-1">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-indigo-600 font-bold">{item.jumlah} Orang</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>

              {/* Kolom 2: Mata Pencaharian */}
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600"><Briefcase size={20} /></div>
                  <h4 className="font-montserrat font-bold text-lg text-gray-900">Mata Pencaharian</h4>
                </div>
                
                <div className="flex flex-col gap-4">
                  {dataKep.pekerjaan.length === 0 ? <p className="text-gray-400 text-sm italic">Belum ada data.</p> : null}
                  {dataKep.pekerjaan.map((item, index) => {
                    const percent = Math.min((item.jumlah / maxPekerjaan) * 100, 100); 
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-xs md:text-sm font-medium mb-1">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-amber-600 font-bold">{item.jumlah} Orang</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>

              {/* Kolom 3: Penganut Agama */}
              <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600"><BookOpen size={20} /></div>
                  <h4 className="font-montserrat font-bold text-lg text-gray-900">Penganut Agama</h4>
                </div>

                {dataKep.agama.length === 0 ? (
                  <p className="text-gray-400 text-sm italic mt-4">Belum ada data.</p>
                ) : (
                  <>
                    <div className="w-full flex-1 min-h-[250px] relative flex flex-col items-center justify-center">
                       <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={dataAgamaMapped} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value">
                            {dataAgamaMapped.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                        <span className="text-gray-400 font-medium text-[10px] uppercase tracking-widest">Mayoritas</span>
                        <span className="text-xl md:text-2xl font-montserrat font-bold text-emerald-600">{agamaMayoritas.name}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 mt-4 border-t border-gray-100 pt-4 max-h-[150px] overflow-y-auto pr-2">
                      {dataAgamaMapped.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm font-medium text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div> 
                            {item.name}
                          </div>
                          <span className="font-bold text-gray-900">{item.value} Orang</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.section>

            </div>
          </>
        )}
      </main>
    </div>
  );
}