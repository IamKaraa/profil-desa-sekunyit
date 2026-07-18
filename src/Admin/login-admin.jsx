import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabaseClient'; 

export default function LoginAdmin() {
  const navigate = useNavigate();
  
  // State form diubah menggunakan email dan password
  const [formData, setFormData] = useState({
    email: '', 
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hapus pesan error ketika mulai mengetik ulang
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Ambil input dari user, kecilkan hurufnya, dan hilangkan spasi
      let emailUntukLogin = formData.email.toLowerCase().trim();

      // Cek apakah user SUDAH mengetikkan email lengkap (mengandung '@')
      // Jika belum ada '@', sistem akan bantu tambahkan '@gmail.com' otomatis
      if (!emailUntukLogin.includes('@')) {
        emailUntukLogin = `${emailUntukLogin}@gmail.com`;
      }

      // 1. Proses Login ke Supabase Auth dengan email yang sudah diformat dan password asli
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailUntukLogin,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Cek apakah user benar-benar terdaftar di tabel profil_admin
      const { data: profileData, error: profileError } = await supabase
        .from('profil_admin')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      // Jika login berhasil tapi tidak ada di tabel profil (akses ilegal)
      if (profileError || !profileData) {
        await supabase.auth.signOut(); // Paksa keluar
        throw new Error('Akun Anda tidak memiliki akses ke Panel Admin.');
      }

      // 3. Sukses! Arahkan ke Dashboard
      navigate('/admin/dashboard'); 
      
    } catch (error) {
      // Tampilkan pesan error jika salah password atau email tidak ditemukan
      setErrorMsg(error.message === 'Invalid login credentials' 
        ? 'Email atau kata sandi salah.' 
        : error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f7f8] font-inter flex flex-col">
      {/* Import Font Kustom */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER --- */}
      <header className="bg-[#111111] h-[88px] w-full flex items-center px-6 md:px-12 gap-5 shrink-0">
        <div className="w-12 h-12 bg-[#dedede] rounded-full flex items-center justify-center text-sm font-medium text-black">
          logo
        </div>
        <h1 className="text-white font-montserrat font-medium text-lg md:text-xl tracking-wide">
          Login Admin Desa Sekunyit
        </h1>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="border border-black rounded-[2rem] p-10 md:p-14 w-full max-w-[500px] flex flex-col items-center bg-[#f2f7f8]"
        >
          {/* Card Header */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-[60px] h-[60px] bg-[#dedede] rounded-full flex items-center justify-center text-sm font-medium text-black">
              logo
            </div>
            <h2 className="font-montserrat font-medium text-[22px] md:text-2xl text-black">
              Desa Sekunyit
            </h2>
          </div>

          {/* Notifikasi Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="w-full mb-6 bg-red-50 border border-red-500 rounded-xl px-4 py-3 text-sm text-red-600 font-medium text-center"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Login */}
          <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Input Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm md:text-[15px] font-medium ml-3 text-black font-inter">
                Alamat Email
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email..."
                className="w-full border border-black rounded-full px-6 py-3.5 bg-transparent text-sm md:text-base font-inter text-black placeholder:text-gray-500 focus:outline-none focus:ring-[1.5px] focus:ring-black focus:bg-white/50 transition-all duration-300"
                required
              />
            </div>

            {/* Input Kata Sandi */}
            <div className="flex flex-col gap-2">
              <label className="text-sm md:text-[15px] font-medium ml-3 text-black font-inter">
                Kata Sandi
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Masukkan kata sandi..."
                className="w-full border border-black rounded-full px-6 py-3.5 bg-transparent text-sm md:text-base font-inter text-black placeholder:text-gray-500 focus:outline-none focus:ring-[1.5px] focus:ring-black focus:bg-white/50 transition-all duration-300"
                required
              />
            </div>

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 border border-black rounded-full px-12 py-3 font-montserrat font-medium text-[17px] text-black bg-transparent hover:bg-black hover:text-white hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 self-center"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}