import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Import Halaman Utama (Beranda)
import App from './App.jsx'

// Import Komponen Proteksi Rute Admin
import ProtectedRoute from './components/ProtectedRoute.jsx' 

// ==========================================================
// PERBAIKAN DI SINI: Gunakan "./Admin/..." (Huruf A Besar) 
// dan pastikan semua berakhiran .jsx
// ==========================================================
import LoginAdmin from './Admin/login-admin.jsx' 
import DashboardAdmin from './Admin/dash-admin.jsx'
import TambahInformasi from './Admin/tambah-informasi.jsx'
import TambahPotensi from './Admin/tambah-potensi.jsx'
import TambahGaleri from './Admin/tambah-galeri.jsx'
import EditGaleri from './Admin/edit-galeri.jsx'
import EditInformasi from './Admin/edit-informasi.jsx'
import EditPotensi from './Admin/edit-potensi.jsx'

// Import Halaman User (Ini sudah aman karena foldernya "pages" huruf kecil)
import AdatBudayaUser from './pages/adat-budaya.jsx'
import GaleriUser from './pages/galeri-desa.jsx'
import InformasiUser from './pages/informasi-desa.jsx'
import DetailInformasiUser from './pages/detail-informasi.jsx'
import PengaduanUser from './pages/pengaduan-user.jsx'
import KontakPentingUser from './pages/kontak-penting.jsx'
import GeologiDesa from './pages/geologi-desa.jsx'
import VisiMisi from './pages/visi-misi.jsx'
import StrukturOrganisasi from './pages/struktur-organisasi.jsx'
import DataKependudukan from './pages/data-kependudukan.jsx'
import DataBangunan from './pages/data-bangunan.jsx'
import PotensiUser from './pages/potensi-desa.jsx' 
import AduanWarga from './pages/aduan-warga.jsx'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ==============================================================================
            1. RUTE PUBLIK (Bisa Diakses Siapa Saja Tanpa Login)
           ============================================================================== */}
        <Route path="/" element={<App />} />
        
        {/* Halaman Login Admin */}
        <Route path="/admin" element={<LoginAdmin />} />

        {/* Halaman Konten User */}
        <Route path="/adat-budaya" element={<AdatBudayaUser />} />
        <Route path="/galeri-desa" element={<GaleriUser />} />
        <Route path="/informasi-desa" element={<InformasiUser />} />  
        <Route path="/informasi/:id" element={<DetailInformasiUser />} />
        <Route path="/pengaduan" element={<PengaduanUser />} />
        <Route path="/kontak-penting" element={<KontakPentingUser />} />
        <Route path="/geologi-desa" element={<GeologiDesa />} />
        <Route path="/visi-misi" element={<VisiMisi />} />
        <Route path="/struktur-organisasi" element={<StrukturOrganisasi />} />
        <Route path="/data-kependudukan" element={<DataKependudukan />} />
        <Route path="/data-bangunan" element={<DataBangunan />} />
        <Route path="/potensi-desa" element={<PotensiUser />} />
        <Route path="/aduan-warga" element={<AduanWarga />} />

        {/* ==============================================================================
            2. RUTE TERPROTEKSI (Hanya Bisa Diakses Setelah Login Staf Desa)
           ============================================================================== */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/admin/tambah-informasi" element={<TambahInformasi />} />
          <Route path="/admin/tambah-potensi" element={<TambahPotensi />} />
          <Route path="/admin/tambah-galeri" element={<TambahGaleri />} />
          <Route path="/admin/edit-galeri/:id" element={<EditGaleri />} />
          <Route path="/admin/edit-informasi/:id" element={<EditInformasi />} />
          <Route path="/admin/edit-potensi/:id" element={<EditPotensi />} />
        </Route>

      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)