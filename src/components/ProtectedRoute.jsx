import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../config/supabaseClient'; // Sesuaikan path ini jika berbeda

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      // 1. Cek sesi login yang aktif di browser
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. Jika ada sesi, pastikan dia terdaftar sebagai admin di tabel profil_admin
        const { data } = await supabase
          .from('profil_admin')
          .select('id')
          .eq('id', session.user.id)
          .single();

        setIsAuthenticated(!!data);
      } else {
        setIsAuthenticated(false);
      }
      setChecking(false);
    };

    checkUser();
  }, []);

  // Tampilan saat sedang mengecek status login
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f7f8] font-inter">
        <span className="text-sm font-medium text-black">Memverifikasi akses...</span>
      </div>
    );
  }

  // Jika lolos verifikasi, izinkan masuk (<Outlet />). Jika gagal, kembalikan ke halaman login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin" replace />;
}