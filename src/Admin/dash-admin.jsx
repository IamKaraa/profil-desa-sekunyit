import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Eye, Image as ImageIcon, Calendar, Tag, Clock, MapPin, ChevronLeft, ChevronRight, ExternalLink, Plus, ChevronDown, Loader2, AlertCircle, Filter, Trash2, Edit, Upload, Settings, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../config/supabaseClient';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Pusat Pengaduan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ nama: 'Staf Desa', role: 'admin' });
  
  const [pengaduanList, setPengaduanList] = useState([]);
  const [informasiList, setInformasiList] = useState([]);
  const [potensiList, setPotensiList] = useState([]);
  const [galeriList, setGaleriList] = useState([]);
  const [staffList, setStaffList] = useState([]); 

  // --- STATE PROFIL DESA ---
  const [profilDesa, setProfilDesa] = useState({
    struktur: { pemerintah: '', bpd: '', karang_taruna: '', pkk: '', peta_desa: '' },
    kontak: [],
    kependudukan: { 
      utama: { total: 0, laki: 0, perempuan: 0, kk: 0 }, 
      umur: [], pendidikan: [], pekerjaan: [], agama: [] 
    },
    bangunan: { pendidikan: [], kesehatan: [], ibadah: [], umum: [] },
    geografi: { 
      luas_total: '', luas_belum: '', utara: '', selatan: '', timur: '', barat: '',
      lahan: [], pertanian: [], perkebunan: [] 
    }
  });
  
  const [selectedStruktur, setSelectedStruktur] = useState('pemerintah');
  const [tempData, setTempData] = useState(null); 
  const [activeKepTab, setActiveKepTab] = useState('umur'); 
  const [activeBangunanTab, setActiveBangunanTab] = useState('pendidikan'); 
  const [activeGeoTab, setActiveGeoTab] = useState('wilayah'); 
  const [formKontak, setFormKontak] = useState({ nama: '', peran: '', nomor: '', tipe: 'wa', kategori: 'pemerintahan' });

  const [filterKategori, setFilterKategori] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua'); 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const [staffForm, setStaffForm] = useState({ email: '', nama_user: '', password: '', role: 'admin' });
  const [staffSubmitLoading, setStaffSubmitLoading] = useState(false);
  const [staffError, setStaffError] = useState('');

  const baseMenuItems = ["Pusat Pengaduan", "Informasi Desa", "Galeri Desa", "Potensi Desa", "Edit Konten"];
  const menuItems = adminProfile.role === 'super_admin' ? [...baseMenuItems, "Tambah Staff"] : baseMenuItems;

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Gagal memverifikasi identitas staf.");

        const { data: profile, error: profileError } = await supabase.from('profil_admin').select('nama_user, role').eq('id', user.id).single();
        if (profileError || !profile) throw new Error("Akses profil ditolak.");
        setAdminProfile({ nama: profile.nama_user, role: profile.role });

        await refreshAllData(profile.role);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initDashboard();
  }, []);

  const refreshAllData = async (currentRole = adminProfile.role) => {
    const [resPengaduan, resInformasi, resPotensi, resGaleri, resProfil] = await Promise.all([
      supabase.from('pengaduan_warga').select('*').order('created_at', { ascending: false }),
      supabase.from('informasi_desa').select('*').order('created_at', { ascending: false }),
      supabase.from('potensi_desa').select('*').order('created_at', { ascending: false }),
      supabase.from('galeri_desa').select('*').order('created_at', { ascending: false }),
      supabase.from('desa_profil').select('*')
    ]);

    if (resPengaduan.data) setPengaduanList(resPengaduan.data);
    if (resInformasi.data) setInformasiList(resInformasi.data);
    if (resPotensi.data) setPotensiList(resPotensi.data);
    
    if (resGaleri.data && resInformasi.data) {
      const galeriMurni = resGaleri.data.map(g => ({ ...g, source: 'galeri' }));
      const galeriDariInfo = resInformasi.data.filter(info => info.gambar).map(info => ({
        id: `info-${info.id}`, judul: info.judul, gambar_urls: [info.gambar], created_at: info.created_at, source: 'informasi', infoId: info.id 
      }));
      setGaleriList([...galeriMurni, ...galeriDariInfo].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    }

    if (resProfil.data) {
      const pData = { ...profilDesa };
      resProfil.data.forEach(row => { 
        if (row.kategori === 'kependudukan') {
           if (row.data.total !== undefined && !row.data.utama) {
             pData.kependudukan = {
               utama: { total: row.data.total, laki: row.data.laki, perempuan: row.data.perempuan, kk: row.data.kk },
               umur: [ { name: '0-5 thn', jumlah: 136 }, { name: '6-12 thn', jumlah: 120 }, { name: '13-18 thn', jumlah: 122 }, { name: '19-25 thn', jumlah: 110 }, { name: '26-50 thn', jumlah: 385 }, { name: '51-70 thn', jumlah: 182 }, { name: '>70 thn', jumlah: 15 } ],
               pendidikan: [ { name: 'Tidak Pernah Sekolah', jumlah: 15 }, { name: 'Tidak Tamat SD', jumlah: 16 }, { name: 'Tamat SD', jumlah: 120 }, { name: 'Tamat SLTP', jumlah: 36 }, { name: 'Tamat SLTA', jumlah: 361 }, { name: 'Perguruan Tinggi', jumlah: 114 }, { name: 'Belum Sekolah', jumlah: 136 }, { name: 'Sedang Sekolah', jumlah: 272 } ],
               pekerjaan: [ { name: 'Pertanian', jumlah: 108 }, { name: 'Nelayan', jumlah: 177 }, { name: 'PNS', jumlah: 79 }, { name: 'Pedagang', jumlah: 31 } ],
               agama: [ { name: 'Islam', jumlah: 1062 }, { name: 'Katolik', jumlah: 8 } ]
             };
           } else {
             pData.kependudukan = row.data;
           }
        } else if (row.kategori === 'bangunan') {
           if (row.data.sd !== undefined && !row.data.pendidikan) {
             pData.bangunan = {
               pendidikan: [ { name: 'Gedung Sekolah SD', jumlah: row.data.sd }, { name: 'Gedung Sekolah SLTP', jumlah: row.data.smp }, { name: 'Gedung Sekolah SLTA', jumlah: row.data.sma }, { name: 'Perguruan Tinggi', jumlah: row.data.pt } ],
               kesehatan: [ { name: 'Rumah Sakit', jumlah: row.data.rs }, { name: 'Puskesmas', jumlah: row.data.puskesmas }, { name: 'Puskesmas Pembantu (Pustu)', jumlah: row.data.pustu } ],
               ibadah: [ { name: 'Masjid', jumlah: row.data.masjid }, { name: 'Langgar', jumlah: row.data.langgar }, { name: 'Gereja', jumlah: row.data.gereja }, { name: 'Kuil', jumlah: row.data.kuil } ],
               umum: []
             };
           } else {
             pData.bangunan = row.data;
           }
        } else if (row.kategori === 'geografi') {
           if (!Array.isArray(row.data.lahan)) {
             pData.geografi = {
               luas_total: row.data.luas_total || '', luas_belum: row.data.luas_belum || '', utara: row.data.utara || '', selatan: row.data.selatan || '', timur: row.data.timur || '', barat: row.data.barat || '',
               lahan: [
                 { name: 'Sawah', value: row.data.lahan?.sawah || '20 HA' }, { name: 'Pekarangan', value: row.data.lahan?.pekarangan || '28 HA' }, { name: 'Lapangan', value: row.data.lahan?.lapangan || '2 HA' }, { name: 'Jalan Kel/Desa', value: row.data.lahan?.jalan || '3 HA' }, { name: 'Kolam Ikan', value: row.data.lahan?.kolam || '- HA' }, { name: 'Pemakaman', value: row.data.lahan?.pemakaman || '2 HA' }
               ],
               pertanian: [
                 { name: 'Sawah Teknis', value: row.data.pertanian?.teknis || '- HA' }, { name: 'Sawah Tradisional', value: row.data.pertanian?.tradisional || '- HA' }, { name: 'Sawah Tadah Hujan', value: row.data.pertanian?.tadah_hujan || '- HA' }
               ],
               perkebunan: [
                 { name: 'Cengkeh', value: row.data.perkebunan?.cengkeh || '11 HA' }, { name: 'Kelapa', value: row.data.perkebunan?.kelapa || '19 HA' }, { name: 'Sawit', value: row.data.perkebunan?.sawit || '2 HA' }, { name: 'Lainnya', value: row.data.perkebunan?.lainnya || '7,09 HA' }, { name: 'Kopi', value: row.data.perkebunan?.kopi || '- HA' }, { name: 'Lada', value: row.data.perkebunan?.lada || '- HA' }, { name: 'Coklat', value: row.data.perkebunan?.coklat || '- HA' }
               ]
             };
           } else {
             pData.geografi = row.data;
           }
        } else {
           pData[row.kategori] = row.data; 
        }
      });
      setProfilDesa(pData);
    }

    if (currentRole === 'super_admin') {
      const { data: staffData } = await supabase.from('profil_admin').select('*').order('created_at', { ascending: false });
      if (staffData) setStaffList(staffData);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const handleUploadGambarProfil = async (e, folderKey, itemKey) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const fileName = `${itemKey}_${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('profil_desa').upload(fileName, file);
      if (uploadError) throw new Error("Gagal upload gambar: " + uploadError.message);
      
      const { data: urlData } = supabase.storage.from('profil_desa').getPublicUrl(fileName);
      const updatedData = { ...profilDesa[folderKey], [itemKey]: urlData.publicUrl };
      
      const { error: dbError } = await supabase.from('desa_profil').upsert([{ kategori: folderKey, data: updatedData }]);
      if (dbError) throw new Error("Gagal menyimpan ke database: " + dbError.message);
      
      setProfilDesa(prev => ({ ...prev, [folderKey]: updatedData }));
      alert("Gambar berhasil diperbarui & tersimpan!");
    } catch (err) {
      alert("Terjadi Kendala: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfilData = async (kategori) => {
    setLoading(true);
    try {
      const { error: dbError } = await supabase.from('desa_profil').upsert([{ kategori: kategori, data: tempData }]);
      if (dbError) throw new Error("Gagal menyimpan ke database: " + dbError.message);
      setProfilDesa(prev => ({ ...prev, [kategori]: tempData }));
      alert('Data berhasil diperbarui secara permanen!');
      closeModal();
    } catch (err) {
      alert("Terjadi Kendala: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKontak = async () => {
    if (!formKontak.nama || !formKontak.nomor) return alert('Nama dan Nomor wajib diisi!');
    const newKontakList = [...profilDesa.kontak, { ...formKontak, id: Date.now() }];
    setLoading(true);
    try {
      await supabase.from('desa_profil').upsert([{ kategori: 'kontak', data: newKontakList }]);
      setProfilDesa(prev => ({ ...prev, kontak: newKontakList }));
      setFormKontak({ nama: '', peran: '', nomor: '', tipe: 'wa', kategori: 'pemerintahan' });
    } catch(err) { alert('Gagal menambah kontak'); }
    setLoading(false);
  };

  const handleDeleteKontak = async (id) => {
    if(!window.confirm("Hapus kontak ini?")) return;
    const newKontakList = profilDesa.kontak.filter(k => k.id !== id);
    setLoading(true);
    await supabase.from('desa_profil').upsert([{ kategori: 'kontak', data: newKontakList }]);
    setProfilDesa(prev => ({ ...prev, kontak: newKontakList }));
    setLoading(false);
  };

  const handleDeletePotensi = async (id, e) => {
    e.stopPropagation(); 
    if (window.confirm("Apakah Anda yakin ingin menghapus potensi desa ini?")) {
        const { error } = await supabase.from('potensi_desa').delete().eq('id', id);
        if (!error) { alert("Dihapus!"); await refreshAllData(); }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setLoading(true); 
    await supabase.from('pengaduan_warga').update({ status: newStatus }).eq('id', id);
    await refreshAllData(); 
    closeModal(); setLoading(false);
  };

  const openModal = (item, type) => { setSelectedItem(item); setModalType(type); setCurrentImageIndex(0); };
  
  const openProfilModal = (type) => { 
    let key = type;
    if (type.includes('kependudukan')) key = 'kependudukan';
    else if (type.includes('bangunan')) key = 'bangunan';
    else key = type.replace('edit_', '');
    
    setTempData(JSON.parse(JSON.stringify(profilDesa[key]))); 
    setModalType(type); 
    if (type === 'edit_kependudukan_detail') setActiveKepTab('umur');
    if (type === 'edit_bangunan') setActiveBangunanTab('pendidikan');
    if (type === 'edit_geografi') setActiveGeoTab('wilayah');
  };
  
  const closeModal = () => { setSelectedItem(null); setModalType(null); setFullscreenImage(null); setTempData(null); };

  const jumpToInformasi = (informasiId) => {
    const infoData = informasiList.find(info => info.id === informasiId);
    if (infoData) { setSelectedItem(infoData); setModalType('informasi'); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffSubmitLoading(true);
    setStaffError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ email: staffForm.email, password: staffForm.password })
      });
      const authResult = await response.json();
      if (!response.ok) throw new Error(authResult.msg || "Pendaftaran gagal.");
      if (authResult.user?.id) {
        await supabase.from('profil_admin').insert([{ id: authResult.user.id, nama_user: staffForm.nama_user, role: staffForm.role }]);
        setStaffForm({ email: '', nama_user: '', password: '', role: 'admin' });
        await refreshAllData();
        alert('Staf baru berhasil didaftarkan.');
      }
    } catch (err) {
      setStaffError(err.message || 'Gagal menambahkan staf baru.');
    } finally {
      setStaffSubmitLoading(false);
    }
  };

  const formatTanggal = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';


  // --- RENDERING UI ---

  const renderEditKonten = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-full pb-8 font-inter">
      {/* --- KOLOM KIRI --- */}
      <div className="flex flex-col gap-4 md:gap-6">
        
        {/* Modul 1 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">MODUL 1</div>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3 mt-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Settings size={20} /></div>
            <div>
              <h3 className="font-montserrat font-bold text-gray-900 text-sm md:text-base">Struktur Pemerintahan</h3>
              <p className="text-gray-500 text-[10px] md:text-[11px] font-medium">Unggah bagan (.JPG/.PNG).</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:flex-1">
              <select value={selectedStruktur} onChange={e => setSelectedStruktur(e.target.value)} className="w-full appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium bg-gray-50 focus:outline-none focus:border-black cursor-pointer text-gray-800">
                <option value="pemerintah">Struktur Pemerintah Desa</option>
                <option value="bpd">Struktur BPD</option>
                <option value="karang_taruna">Struktur Karang Taruna</option>
                <option value="pkk">Struktur PKK Desa</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={16} /></div>
            </div>
            <input type="file" id="upload-struktur" className="hidden" accept="image/*" onChange={(e) => handleUploadGambarProfil(e, 'struktur', selectedStruktur)} />
            <button onClick={() => document.getElementById('upload-struktur').click()} className="w-full sm:w-auto bg-black text-white rounded-lg p-2.5 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
              <Upload size={18} /> <span className="sm:hidden text-sm font-semibold">Unggah File</span>
            </button>
          </div>
          <div className="bg-gray-50 w-full h-[140px] rounded-lg flex items-center justify-center border border-dashed border-gray-300 overflow-hidden">
            {profilDesa.struktur[selectedStruktur] ? <img src={profilDesa.struktur[selectedStruktur]} alt="Preview Struktur" className="w-full h-full object-contain" /> : <span className="text-gray-400 font-inter text-xs font-medium flex flex-col items-center gap-1"><ImageIcon size={20}/> Belum Ada Gambar Bagan</span>}
          </div>
        </div>

        {/* Modul 3: Data Kependudukan */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">MODUL 3</div>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3 mt-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Settings size={20} /></div>
            <div>
              <h3 className="font-montserrat font-bold text-gray-900 text-sm md:text-base">Data Kependudukan</h3>
              <p className="text-gray-500 text-[10px] md:text-[11px] font-medium">Perbarui angka statistik demografi desa.</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
             <button onClick={() => openProfilModal('edit_kependudukan_utama')} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex justify-center items-center gap-2">
               <Edit size={16} className="text-emerald-600"/> Nilai Kependudukan Utama
             </button>
             <button onClick={() => openProfilModal('edit_kependudukan_detail')} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex justify-center items-center gap-2">
               <Edit size={16} className="text-emerald-600"/> Data Demografi Dinamis
             </button>
          </div>
        </div>

        {/* Modul 4: Data Bangunan */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">MODUL 4</div>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3 mt-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Settings size={20} /></div>
            <div>
              <h3 className="font-montserrat font-bold text-gray-900 text-sm md:text-base">Data Infrastruktur Bangunan</h3>
              <p className="text-gray-500 text-[10px] md:text-[11px] font-medium">Kelola jumlah fasilitas Pendidikan, Kesehatan, Ibadah.</p>
            </div>
          </div>
          <button onClick={() => openProfilModal('edit_bangunan')} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex justify-center items-center gap-2">
            <Edit size={16} className="text-amber-600"/> Kelola Angka Fasilitas
          </button>
        </div>

      </div>

      {/* --- KOLOM KANAN --- */}
      <div className="flex flex-col gap-4 md:gap-6">

        {/* Modul 5: Kontak Penting */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">MODUL 5</div>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3 mt-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Settings size={20} /></div>
            <div>
              <h3 className="font-montserrat font-bold text-gray-900 text-sm md:text-base">Kontak Penting & Darurat</h3>
              <p className="text-gray-500 text-[10px] md:text-[11px] font-medium">Tambah, edit, atau hapus daftar kontak instansi.</p>
            </div>
          </div>
          <div className="border border-dashed border-gray-300 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-3 bg-gray-50">
             <button onClick={() => openProfilModal('edit_kontak')} className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md">
               Kelola Daftar Kontak <ExternalLink size={16}/>
             </button>
             <span className="text-[10px] text-gray-400 font-medium text-center">*Nomor ini akan terhubung ke WhatsApp / Telepon Warga</span>
          </div>
        </div>

        {/* Modul 6: Geografi Desa */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">MODUL 6</div>
          <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-3 mt-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg"><Settings size={20} /></div>
            <div>
              <h3 className="font-montserrat font-bold text-gray-900 text-sm md:text-base">Geologis & Pemetaan Lahan</h3>
              <p className="text-gray-500 text-[10px] md:text-[11px] font-medium">Kelola gambar peta dan data wilayah.</p>
            </div>
          </div>
          <div className="bg-gray-50 w-full h-[140px] rounded-lg flex items-center justify-center relative group overflow-hidden mb-4 border border-dashed border-gray-300">
            {profilDesa.struktur.peta_desa ? (
              <img src={profilDesa.struktur.peta_desa} alt="Peta Desa" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 font-inter text-xs font-medium flex flex-col items-center gap-2"><MapPin size={24}/> Preview Peta Belum Diunggah</span>
            )}
            <input type="file" id="upload-peta" className="hidden" accept="image/*" onChange={(e) => handleUploadGambarProfil(e, 'struktur', 'peta_desa')} />
            <div onClick={() => document.getElementById('upload-peta').click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm">
              <span className="text-white text-xs font-bold border border-white px-4 py-2 rounded-full flex items-center gap-2"><Upload size={14}/> Ganti Peta</span>
            </div>
          </div>
          <button onClick={() => openProfilModal('edit_geografi')} className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex justify-center items-center gap-2">
             <Edit size={16} className="text-rose-600"/> Kelola Statistik Geografi
          </button>
        </div>

        {/* Info Modul Statis */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden flex flex-col justify-center">
          <div className="flex items-start gap-3">
             <AlertCircle size={20} className="text-zinc-600 shrink-0 mt-0.5" />
             <div>
                <h4 className="font-bold text-zinc-800 text-sm mb-1.5">Informasi Konten Statis Tersistem</h4>
                <p className="text-xs text-zinc-600 leading-relaxed text-justify">
                   Sesuai dengan regulasi sistem, modul <strong>(2) Visi, Misi, Tujuan</strong> dan modul <strong>(7) Adat & Budaya</strong> bersifat permanen di dalam *source code*. Konten ini tidak memerlukan akses perubahan rutin oleh Admin.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );

  const renderTambahStaff = () => (
    <div className="flex flex-col gap-6 md:gap-8 h-full pb-8 font-inter">
      {/* Form Tambah Staff */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="mb-6">
          <h3 className="font-montserrat font-bold text-gray-900 text-lg">Daftarkan Staf Baru</h3>
          <p className="text-gray-500 text-xs mt-1">Buat akun untuk perangkat desa agar dapat mengakses dashboard ini.</p>
        </div>

        {staffError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{staffError}</span>
          </div>
        )}

        <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nama Pengguna</label>
            <input type="text" required value={staffForm.nama_user} onChange={e => setStaffForm({...staffForm, nama_user: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-black focus:border-black outline-none bg-gray-50 text-sm font-medium" placeholder="Cth: Budi Santoso" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email</label>
            <input type="email" required value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-black focus:border-black outline-none bg-gray-50 text-sm font-medium" placeholder="Cth: budi@sekunyit.desa.id" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Kata Sandi (Password)</label>
            <input type="password" required minLength={6} value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-black focus:border-black outline-none bg-gray-50 text-sm font-medium" placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Hak Akses (Role)</label>
            <div className="relative">
              <select value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-black focus:border-black outline-none bg-gray-50 text-sm font-bold appearance-none cursor-pointer">
                <option value="admin">Admin Biasa</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><ChevronDown size={18} /></div>
            </div>
          </div>
          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={staffSubmitLoading} className="w-full sm:w-auto bg-black text-white font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {staffSubmitLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {staffSubmitLoading ? 'Memproses...' : 'Daftarkan Akun Staf'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Daftar Staff */}
      <div className="bg-white border border-gray-200 rounded-2xl flex flex-col shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
          <h3 className="font-montserrat font-bold text-gray-900 text-lg">Daftar Pengurus Sistem</h3>
          <p className="text-gray-500 text-xs mt-1">Akun yang memiliki hak akses ke Dashboard Desa Sekunyit.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-800 font-montserrat uppercase text-xs border-b border-gray-200 whitespace-nowrap">
              <tr>
                <th className="px-4 md:px-6 py-4">Nama Pengguna</th>
                <th className="px-4 md:px-6 py-4">Hak Akses</th>
                <th className="px-4 md:px-6 py-4">Tgl Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 whitespace-nowrap">
              {staffList.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-8 text-gray-400 italic">Belum ada data staf.</td></tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 font-bold text-gray-900">{staff.nama_user}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${staff.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {staff.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-xs font-medium">{formatTanggal(staff.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInformasiDesa = () => (
    <div className="flex flex-col gap-4 mt-2 h-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-gray-800 font-montserrat uppercase text-xs whitespace-nowrap">
            <tr><th className="px-4 md:px-6 py-4">Judul Informasi</th><th className="px-4 md:px-6 py-4">Kategori</th><th className="px-4 md:px-6 py-4">Lokasi Wilayah</th><th className="px-4 md:px-6 py-4">Tgl Publikasi</th><th className="px-4 md:px-6 py-4 text-center">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-inter whitespace-nowrap">
            {informasiList.length === 0 ? <tr><td colSpan="5" className="text-center py-8 text-gray-400 italic">Belum ada konten informasi desa.</td></tr> : informasiList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4 font-semibold text-gray-900 max-w-[180px] md:max-w-[220px] truncate">{item.judul}</td>
                  <td className="px-4 md:px-6 py-4 uppercase text-xs"><span className={`px-2.5 py-1 rounded-md font-bold ${item.kategori_informasi === 'kegiatan' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>{item.kategori_informasi}</span></td>
                  <td className="px-4 md:px-6 py-4 truncate max-w-[120px] md:max-w-[150px]">{item.lokasi || '-'}</td>
                  <td className="px-4 md:px-6 py-4 text-xs font-medium text-gray-500">{formatTanggal(item.created_at)}</td>
                  <td className="px-4 md:px-6 py-4 text-center"><button onClick={() => openModal(item, 'informasi')} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Eye size={18} /></button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPusatPengaduan = () => {
    const filteredPengaduan = pengaduanList.filter(item => {
      const matchKategori = filterKategori === 'Semua' || (item.kategori_pengaduan || item.kategori) === filterKategori;
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      return matchKategori && matchStatus;
    });
    return (
      <div className="flex flex-col gap-4 md:gap-6 mt-2 h-full">
        {/* Filter Section - Responsive for Mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
          <h3 className="font-montserrat font-bold text-gray-900 text-sm flex items-center gap-2 whitespace-nowrap"><Filter size={16} className="text-blue-500" /> Filter Laporan:</h3>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="w-full sm:w-48 text-sm bg-gray-50 border border-gray-300 rounded-full pl-5 pr-9 py-2 focus:ring-black focus:border-black outline-none appearance-none cursor-pointer"><option value="Semua">Semua Kategori</option><option value="Infrastruktur & Fasilitas">Infrastruktur</option><option value="Keamanan & Ketertiban">Keamanan</option><option value="Kebersihan & Lingkungan">Lingkungan</option><option value="Pelayanan Aparatur">Aparatur</option><option value="Lainnya">Lainnya</option></select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"><ChevronDown size={16} /></div>
            </div>
            <div className="relative w-full sm:w-auto">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full sm:w-40 text-sm bg-gray-50 border border-gray-300 rounded-full pl-5 pr-9 py-2 focus:ring-black focus:border-black outline-none appearance-none cursor-pointer"><option value="Semua">Semua Status</option><option value="Menunggu">Menunggu</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option></select><div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600"><ChevronDown size={16} /></div>
            </div>
          </div>
        </div>

        {/* Table Section - Horizontal Scrollable on Mobile */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-left text-sm text-gray-600 font-inter">
            <thead className="bg-gray-100 text-gray-800 font-montserrat uppercase text-[11px] md:text-xs whitespace-nowrap">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">Pelapor</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Kategori</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Lokasi Masalah</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Judul Laporan</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 whitespace-nowrap">
              {filteredPengaduan.length === 0 ? <tr><td colSpan="6" className="text-center py-10 text-gray-400 italic">Tidak ada laporan.</td></tr> : filteredPengaduan.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-4 font-medium">{item.is_anonim ? <span className="italic text-gray-400">Anonim</span> : item.nama_pelapor}</td>
                    <td className="px-4 md:px-6 py-4"><span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-[10px] md:text-xs font-medium">{item.kategori_pengaduan || item.kategori}</span></td>
                    <td className="px-4 md:px-6 py-4 truncate max-w-[120px] md:max-w-[150px]">{item.lokasi || '-'}</td>
                    <td className="px-4 md:px-6 py-4 font-medium text-gray-900 truncate max-w-[150px] md:max-w-[180px]">{item.judul}</td>
                    <td className="px-4 md:px-6 py-4 text-center"><span className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${item.status === 'Selesai' ? 'bg-green-100 text-green-700' : item.status === 'Diproses' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></td>
                    <td className="px-4 md:px-6 py-4 text-center"><button onClick={() => openModal(item, 'pengaduan')} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"><Eye size={18} /></button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPotensiDesa = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-2 pb-8 h-full font-inter">
      {potensiList.length === 0 ? <div className="col-span-full text-center py-12 text-gray-400 italic bg-white rounded-xl border">Belum ada potensi desa terdaftar.</div> : potensiList.map((item, index) => {
          const sampulPotensi = item.gambar_urls && item.gambar_urls.length > 0 ? item.gambar_urls[0] : item.gambar;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} onClick={() => openModal(item, 'potensi')} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-zinc-800 bg-zinc-950 shadow-md flex flex-col justify-end group hover:scale-[1.02] transition-transform">
              {sampulPotensi ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sampulPotensi})` }}></div> : <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 opacity-40"><ImageIcon size={40} className="text-gray-500" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                <span className="text-[10px] bg-[#00bced] text-white font-bold px-2 py-0.5 rounded w-fit mb-1.5 uppercase">{(item.gambar_urls || []).length || 1} Foto</span>
                <h4 className="text-white font-montserrat font-bold text-sm md:text-base leading-tight mb-1 truncate drop-shadow-md">{item.judul}</h4>
                <p className="text-gray-300 text-xs font-normal leading-normal line-clamp-2 drop-shadow-sm">{item.deskripsi}</p>
                <button onClick={(e) => handleDeletePotensi(item.id, e)} className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100 shadow-md"><Trash2 size={14} /></button>
              </div>
            </motion.div>
          );
        })
      }
    </div>
  );

  const renderGaleriDesa = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-2 pb-8 h-full font-inter">
      {galeriList.length === 0 ? <div className="col-span-full text-center py-12 text-gray-400 italic bg-white rounded-xl border">Belum ada album galeri terdaftar.</div> : galeriList.map((item, index) => {
          const coverImg = item.gambar_urls && item.gambar_urls.length > 0 ? item.gambar_urls[0] : null;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} onClick={() => openModal(item, 'galeri')} className="relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-zinc-800 bg-zinc-950 shadow-md flex flex-col justify-end group hover:scale-[1.02] transition-transform">
              {coverImg ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${coverImg})` }}></div> : <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 opacity-40"><ImageIcon size={40} className="text-gray-500" /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-4 h-full flex flex-col justify-end">
                <div className="flex gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] bg-green-500 text-white font-bold px-2 py-0.5 rounded uppercase">{(item.gambar_urls || []).length || 1} Foto</span>
                  {item.source === 'informasi' && <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><ExternalLink size={10} /> Info</span>}
                </div>
                <h4 className="text-white font-montserrat font-bold text-sm md:text-base leading-tight mb-1 line-clamp-2 drop-shadow-md">{item.judul || item.judul_kegiatan}</h4>
              </div>
            </motion.div>
          );
        })
      }
    </div>
  );

  if (loading) {
    return <div className="h-screen w-full bg-[#f2f7f8] flex flex-col items-center justify-center font-inter"><Loader2 size={36} className="animate-spin text-black mb-2" /><span className="text-sm font-medium text-gray-600">Sinkronisasi Database...</span></div>;
  }

  if (error) {
    return <div className="h-screen w-full bg-[#f2f7f8] flex flex-col items-center justify-center font-inter p-6 text-center"><AlertCircle size={44} className="text-red-500 mb-3" /><h3 className="text-lg font-bold text-gray-900 mb-1">Koneksi Gagal</h3><p className="text-sm text-gray-500 max-w-sm mb-4">{error}</p><button onClick={() => window.location.reload()} className="border border-black px-6 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-all">Muat Ulang</button></div>;
  }

  return (
    <div className="h-screen w-full flex flex-col font-inter bg-[#f2f7f8] overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap'); .font-montserrat { font-family: 'Montserrat', sans-serif; } .font-inter { font-family: 'Inter', sans-serif; } .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />

      <header className="h-[88px] bg-[#111111] flex items-center justify-between px-4 sm:px-6 md:px-12 shrink-0 z-30 relative shadow-md">
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          <button className="md:hidden text-white hover:text-gray-300 transition-colors" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={28} /></button>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#dedede] rounded-full flex items-center justify-center text-sm font-bold text-black uppercase">{adminProfile.nama.charAt(0)}</div>
          <div className="flex flex-col"><h1 className="text-white font-montserrat font-semibold text-sm md:text-base tracking-wide leading-tight">Desa Sekunyit</h1><span className="text-gray-400 text-[9px] md:text-[11px] font-bold uppercase tracking-wider">{adminProfile.nama} ({adminProfile.role})</span></div>
        </div>
        <button onClick={handleLogout} className="bg-[#ff0a0a] hover:bg-[#d60000] text-white font-medium px-4 md:px-8 py-2 md:py-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-lg shadow-red-500/20 text-xs md:text-sm">Keluar</button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`absolute md:static top-0 left-0 h-full w-[260px] bg-[#9ca3af] z-20 transform transition-transform duration-300 ease-in-out flex flex-col py-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col w-full">
            {menuItems.map((item) => (
              <button key={item} onClick={() => { setActiveTab(item); setIsSidebarOpen(false); setFilterKategori('Semua'); setFilterStatus('Semua'); }} className={`w-full py-4 px-6 text-left text-[16px] transition-all duration-300 ${activeTab === item ? 'bg-black/10 font-bold text-black border-r-4 border-[#111111]' : 'text-[#111111] hover:bg-black/5 font-medium border-r-4 border-transparent'}`}>{item}</button>
            ))}
          </div>
        </aside>

        <AnimatePresence>{isSidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsSidebarOpen(false)} />}</AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto relative z-0 flex flex-col bg-[#f2f7f8]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4 border-b border-gray-200 pb-3 md:pb-4 shrink-0">
            <div><h2 className="text-lg md:text-2xl font-montserrat font-bold text-gray-900">{activeTab}</h2><p className="text-[11px] md:text-xs text-gray-500 font-medium mt-0.5">Manajemen repositori sistem digital</p></div>
            {['Informasi Desa', 'Galeri Desa', 'Potensi Desa'].includes(activeTab) && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => navigate(activeTab==='Informasi Desa'?'/admin/tambah-informasi':activeTab==='Potensi Desa'?'/admin/tambah-potensi':'/admin/tambah-galeri')} className="w-full sm:w-auto bg-[#00bced] hover:bg-[#00a3cc] text-white font-medium px-6 py-2.5 rounded-full transition-all duration-300 active:scale-95 shadow-md flex items-center justify-center gap-2 text-sm whitespace-nowrap"><Plus size={16}/> Tambah {activeTab.split(' ')[0]} Baru</motion.button>
            )}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`w-full flex-1 flex flex-col h-full ${activeTab === 'Edit Konten' || activeTab === 'Tambah Staff' ? '' : 'bg-[#dcdcdc] rounded-sm border border-gray-300 p-4 sm:p-6 md:p-8'}`}>
            {activeTab === 'Informasi Desa' && renderInformasiDesa()}
            {activeTab === 'Pusat Pengaduan' && renderPusatPengaduan()}
            {activeTab === 'Potensi Desa' && renderPotensiDesa()}
            {activeTab === 'Galeri Desa' && renderGaleriDesa()}
            {activeTab === 'Edit Konten' && renderEditKonten()}
            {activeTab === 'Tambah Staff' && renderTambahStaff()}
          </motion.div>
        </main>
      </div>

      {/* --- MODAL POPUP MULTIFUNGSI --- */}
      <AnimatePresence>
        {(selectedItem || modalType?.startsWith('edit_')) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`bg-white shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] ${modalType === 'galeri' ? 'w-full max-w-4xl bg-[#111] rounded-sm' : 'w-full max-w-2xl rounded-2xl'}`}>
              <div className={`px-4 sm:px-6 py-4 flex justify-between items-center gap-4 ${modalType === 'galeri' ? 'bg-[#222] border-b border-[#333]' : 'bg-gray-50 border-b border-gray-100'}`}>
                <h3 className={`font-montserrat font-bold text-sm md:text-lg ${modalType === 'galeri' ? 'text-white' : 'text-gray-900'} truncate`}>
                  {modalType === 'pengaduan' ? 'Detail Pengaduan Masuk' : 
                   modalType === 'potensi' ? 'Detail Potensi Wilayah' : 
                   modalType === 'galeri' ? selectedItem.judul_kegiatan : 
                   modalType === 'edit_kependudukan_utama' ? 'Edit Angka Kependudukan Dasar' :
                   modalType === 'edit_kependudukan_detail' ? 'Edit Demografi Kependudukan' :
                   modalType === 'edit_bangunan' ? 'Kelola Fasilitas Bangunan' :
                   modalType === 'edit_geografi' ? 'Kelola Data Geografi' :
                   modalType === 'edit_kontak' ? 'Manajemen Kontak Darurat' : 'Rincian Informasi'}
                </h3>
                <button onClick={closeModal} className={`p-2 rounded-full shrink-0 transition-colors ${modalType === 'galeri' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}><X size={20} /></button>
              </div>

              <div className={`overflow-y-auto ${modalType === 'galeri' ? 'p-0 flex flex-col' : 'p-4 sm:p-6'}`}>
                
                {/* 1.A Modal Kependudukan UTAMA */}
                {modalType === 'edit_kependudukan_utama' && tempData && tempData.utama && (
                   <div className="space-y-4 font-inter text-sm">
                     <p className="text-gray-500 mb-4 text-xs md:text-sm">Perbarui empat pilar statistik kependudukan utama desa.</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div><label className="font-bold text-gray-700 block mb-1">Total Penduduk</label><input type="number" className="w-full border p-2.5 rounded-lg focus:border-black outline-none" value={tempData.utama.total} onChange={e=> setTempData({...tempData, utama: {...tempData.utama, total: e.target.value === '' ? '' : parseInt(e.target.value, 10)}}) } /></div>
                       <div><label className="font-bold text-gray-700 block mb-1">Total Kepala Keluarga (KK)</label><input type="number" className="w-full border p-2.5 rounded-lg focus:border-black outline-none" value={tempData.utama.kk} onChange={e=> setTempData({...tempData, utama: {...tempData.utama, kk: e.target.value === '' ? '' : parseInt(e.target.value, 10)}}) } /></div>
                       <div><label className="font-bold text-gray-700 block mb-1">Laki - Laki</label><input type="number" className="w-full border p-2.5 rounded-lg focus:border-black outline-none" value={tempData.utama.laki} onChange={e=> setTempData({...tempData, utama: {...tempData.utama, laki: e.target.value === '' ? '' : parseInt(e.target.value, 10)}}) } /></div>
                       <div><label className="font-bold text-gray-700 block mb-1">Perempuan</label><input type="number" className="w-full border p-2.5 rounded-lg focus:border-black outline-none" value={tempData.utama.perempuan} onChange={e=> setTempData({...tempData, utama: {...tempData.utama, perempuan: e.target.value === '' ? '' : parseInt(e.target.value, 10)}}) } /></div>
                     </div>
                     <button onClick={() => handleSaveProfilData('kependudukan')} className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"><Save size={18}/> Simpan Data Kependudukan</button>
                   </div>
                )}

                {/* 1.B Modal Kependudukan DETAIL */}
                {modalType === 'edit_kependudukan_detail' && tempData && (
                   <div className="space-y-4 font-inter text-sm flex flex-col h-full max-h-[70vh]">
                     <div className="flex gap-2 border-b border-gray-200 overflow-x-auto hide-scrollbar pb-3">
                        {['umur', 'pendidikan', 'pekerjaan', 'agama'].map(tab => (
                           <button key={tab} onClick={() => setActiveKepTab(tab)} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeKepTab === tab ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>DATA {tab.toUpperCase()}</button>
                        ))}
                     </div>
                     <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[250px] p-1">
                        {tempData[activeKepTab]?.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2 md:gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                              <div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Kategori</label><input className="w-full border p-2 rounded-lg outline-none focus:border-emerald-500 font-semibold text-gray-800 text-xs md:text-sm" value={item.name} placeholder="Contoh: Petani" onChange={e => { const newArr = [...tempData[activeKepTab]]; newArr[idx] = { ...newArr[idx], name: e.target.value }; setTempData({...tempData, [activeKepTab]: newArr}); }} /></div>
                              <div className="w-20 md:w-24"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Jumlah</label><input type="number" className="w-full border p-2 rounded-lg outline-none focus:border-emerald-500 text-center font-bold text-gray-800 text-xs md:text-sm" value={item.jumlah} onChange={e => { const val = e.target.value; const newArr = [...tempData[activeKepTab]]; newArr[idx] = { ...newArr[idx], jumlah: val === '' ? '' : parseInt(val, 10) }; setTempData({...tempData, [activeKepTab]: newArr}); }} /></div>
                              <button title="Hapus Baris" className="mt-5 bg-red-50 text-red-500 p-2 md:p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition" onClick={() => { const newArr = tempData[activeKepTab].filter((_, i) => i !== idx); setTempData({...tempData, [activeKepTab]: newArr}); }}><Trash2 size={16} /></button>
                           </div>
                        ))}
                        {(!tempData[activeKepTab] || tempData[activeKepTab].length === 0) && <div className="text-center py-10 text-gray-400 italic">Belum ada data, silakan tambah baris baru.</div>}
                     </div>
                     <button onClick={() => setTempData({...tempData, [activeKepTab]: [...(tempData[activeKepTab] || []), {name: '', jumlah: 0}]})} className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2"><Plus size={16} /> Tambah Baris {activeKepTab.toUpperCase()} Baru</button>
                     <button onClick={() => handleSaveProfilData('kependudukan')} className="w-full mt-2 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"><Save size={18}/> Simpan Perubahan Demografi</button>
                   </div>
                )}

                {/* 2. Modal Infrastruktur Bangunan Dinamis */}
                {modalType === 'edit_bangunan' && tempData && (
                   <div className="space-y-4 font-inter text-sm flex flex-col h-full max-h-[70vh]">
                     <p className="text-gray-500 mb-2 text-xs md:text-sm">Kelola daftar fasilitas desa berdasarkan kategorinya.</p>
                     <div className="flex gap-2 border-b border-gray-200 overflow-x-auto hide-scrollbar pb-3">
                        {['pendidikan', 'kesehatan', 'ibadah', 'umum'].map(tab => (
                           <button key={tab} onClick={() => setActiveBangunanTab(tab)} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeBangunanTab === tab ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>DATA {tab.toUpperCase()}</button>
                        ))}
                     </div>
                     <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[250px] p-1">
                        {tempData[activeBangunanTab]?.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2 md:gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                              <div className="flex-1"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nama Bangunan</label><input className="w-full border p-2 rounded-lg outline-none focus:border-amber-500 font-semibold text-gray-800 text-xs md:text-sm" value={item.name} placeholder="Contoh: Posyandu Mekar" onChange={e => { const newArr = [...tempData[activeBangunanTab]]; newArr[idx] = { ...newArr[idx], name: e.target.value }; setTempData({...tempData, [activeBangunanTab]: newArr}); }} /></div>
                              <div className="w-20 md:w-24"><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Jumlah</label><input type="number" className="w-full border p-2 rounded-lg outline-none focus:border-amber-500 text-center font-bold text-gray-800 text-xs md:text-sm" value={item.jumlah} onChange={e => { const val = e.target.value; const newArr = [...tempData[activeBangunanTab]]; newArr[idx] = { ...newArr[idx], jumlah: val === '' ? '' : parseInt(val, 10) }; setTempData({...tempData, [activeBangunanTab]: newArr}); }} /></div>
                              <button title="Hapus Baris" className="mt-5 bg-red-50 text-red-500 p-2 md:p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition" onClick={() => { const newArr = tempData[activeBangunanTab].filter((_, i) => i !== idx); setTempData({...tempData, [activeBangunanTab]: newArr}); }}><Trash2 size={16} /></button>
                           </div>
                        ))}
                        {(!tempData[activeBangunanTab] || tempData[activeBangunanTab].length === 0) && <div className="text-center py-10 text-gray-400 italic">Belum ada data, silakan tambah fasilitas baru.</div>}
                     </div>
                     
                     <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mt-2 flex flex-col gap-2">
                        <h4 className="font-bold text-amber-900 text-xs uppercase">Tambah Fasilitas Baru</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                           <input type="text" id="newBangunanKey" placeholder="Nama Bangunan (Cth: Posyandu)" className="flex-1 border border-amber-200 p-2 rounded-lg outline-none focus:border-amber-500 text-sm" />
                           <button onClick={() => { const inputEl = document.getElementById('newBangunanKey'); const val = inputEl.value.trim(); if(val) { setTempData({...tempData, [activeBangunanTab]: [...(tempData[activeBangunanTab]||[]), {name: val, jumlah: 0}]}); inputEl.value = ''; } }} className="w-full sm:w-auto bg-amber-500 text-white px-4 py-2 sm:py-0 rounded-lg font-bold hover:bg-amber-600 transition text-sm">Tambah</button>
                        </div>
                     </div>
                     <button onClick={() => handleSaveProfilData('bangunan')} className="w-full mt-4 bg-amber-600 text-white font-bold py-3.5 rounded-lg hover:bg-amber-700 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"><Save size={18}/> Simpan Data Bangunan</button>
                   </div>
                )}

                {/* 3. Modal Geografi TABS */}
                {modalType === 'edit_geografi' && tempData && (
                   <div className="space-y-4 font-inter text-sm flex flex-col h-full max-h-[75vh]">
                     
                     {/* Navigasi Tab Geografi */}
                     <div className="flex gap-2 border-b border-gray-200 overflow-x-auto hide-scrollbar pb-3 shrink-0">
                        <button onClick={() => setActiveGeoTab('wilayah')} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeGeoTab === 'wilayah' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Wilayah & Batas</button>
                        <button onClick={() => setActiveGeoTab('lahan')} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeGeoTab === 'lahan' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Lahan Yang Diolah</button>
                        <button onClick={() => setActiveGeoTab('pertanian')} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeGeoTab === 'pertanian' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Tanah Pertanian</button>
                        <button onClick={() => setActiveGeoTab('perkebunan')} className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${activeGeoTab === 'perkebunan' ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Perkebunan</button>
                     </div>

                     <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-2">
                        {/* TAB 1: WILAYAH & BATAS */}
                        {activeGeoTab === 'wilayah' && (
                          <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div><label className="font-bold text-gray-700 block mb-1">Total Luas Desa</label><input type="text" placeholder="Cth: 95,09 HA" className="w-full border p-2.5 rounded-lg focus:border-rose-500 outline-none" value={tempData.luas_total} onChange={e=>setTempData({...tempData, luas_total: e.target.value})} /></div>
                              <div><label className="font-bold text-gray-700 block mb-1">Lahan Belum Dimanfaatkan</label><input type="text" placeholder="Cth: 1 HA" className="w-full border p-2.5 rounded-lg focus:border-rose-500 outline-none" value={tempData.luas_belum} onChange={e=>setTempData({...tempData, luas_belum: e.target.value})} /></div>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 border-b pb-2 mb-4">Batas Wilayah Teritorial</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="font-bold text-gray-700 block mb-1 text-xs uppercase">Batas Utara</label><input type="text" className="w-full border p-2.5 rounded-lg focus:border-rose-500 outline-none" value={tempData.utara} onChange={e=>setTempData({...tempData, utara: e.target.value})} /></div>
                                <div><label className="font-bold text-gray-700 block mb-1 text-xs uppercase">Batas Selatan</label><input type="text" className="w-full border p-2.5 rounded-lg focus:border-rose-500 outline-none" value={tempData.selatan} onChange={e=>setTempData({...tempData, selatan: e.target.value})} /></div>
                                <div><label className="font-bold text-gray-700 block mb-1 text-xs uppercase">Batas Timur</label><input type="text" className="w-full border p-2.5 rounded-lg focus:border-rose-500 outline-none" value={tempData.timur} onChange={e=>setTempData({...tempData, timur: e.target.value})} /></div>
                                <div><label className="font-bold text-gray-700 block mb-1 text-xs uppercase">Batas Barat</label><input type="text" className="w-full border p-2.5 rounded-lg focus:border-rose-500 outline-none" value={tempData.barat} onChange={e=>setTempData({...tempData, barat: e.target.value})} /></div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 2, 3, 4: DINAMIS ARRAY */}
                        {(activeGeoTab === 'lahan' || activeGeoTab === 'pertanian' || activeGeoTab === 'perkebunan') && (
                           <div className="space-y-4 animate-fade-in flex flex-col h-full">
                              <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[250px] p-1">
                                 {tempData[activeGeoTab]?.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 md:gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                       <div className="flex-1">
                                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nama Kategori</label>
                                         <input className="w-full border p-2 rounded-lg outline-none focus:border-rose-500 font-semibold text-gray-800 text-xs md:text-sm" value={item.name} placeholder="Cth: Sawah"
                                            onChange={e => {
                                               const newArr = [...tempData[activeGeoTab]];
                                               newArr[idx] = { ...newArr[idx], name: e.target.value };
                                               setTempData({...tempData, [activeGeoTab]: newArr});
                                            }} 
                                         />
                                       </div>
                                       <div className="w-24 md:w-32">
                                         <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Luas / Nilai</label>
                                         <input type="text" className="w-full border p-2 rounded-lg outline-none focus:border-rose-500 text-center font-bold text-gray-800 text-xs md:text-sm" value={item.value} placeholder="- HA"
                                            onChange={e => {
                                               const newArr = [...tempData[activeGeoTab]];
                                               newArr[idx] = { ...newArr[idx], value: e.target.value };
                                               setTempData({...tempData, [activeGeoTab]: newArr});
                                            }} 
                                         />
                                       </div>
                                       <button title="Hapus Baris" className="mt-5 bg-red-50 text-red-500 p-2 md:p-2.5 rounded-lg hover:bg-red-500 hover:text-white transition"
                                          onClick={() => {
                                             const newArr = tempData[activeGeoTab].filter((_, i) => i !== idx);
                                             setTempData({...tempData, [activeGeoTab]: newArr});
                                          }} 
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    </div>
                                 ))}
                                 {(!tempData[activeGeoTab] || tempData[activeGeoTab].length === 0) && <div className="text-center py-10 text-gray-400 italic">Belum ada data, silakan tambah baris baru.</div>}
                              </div>
                              
                              <button onClick={() => setTempData({...tempData, [activeGeoTab]: [...(tempData[activeGeoTab] || []), {name: '', value: ''}]})} className="w-full border-2 border-dashed border-gray-300 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2">
                                 <Plus size={16} /> Tambah Baris {activeGeoTab.toUpperCase()} Baru
                              </button>
                           </div>
                        )}
                     </div>

                     <button onClick={() => handleSaveProfilData('geografi')} className="w-full mt-2 bg-rose-600 text-white font-bold py-3.5 rounded-xl hover:bg-rose-700 transition flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30">
                       <Save size={18}/> Simpan Data Geografi
                     </button>
                   </div>
                )}

                {/* 4. Modal Daftar Kontak Penting */}
                {modalType === 'edit_kontak' && (
                   <div className="space-y-6 font-inter text-sm">
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3 text-sm">Tambah Kontak Baru</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                           <input type="text" placeholder="Nama Orang/Instansi" className="border p-2 rounded-lg outline-none focus:border-black" value={formKontak.nama} onChange={e=>setFormKontak({...formKontak, nama: e.target.value})}/>
                           <input type="text" placeholder="Peran/Jabatan" className="border p-2 rounded-lg outline-none focus:border-black" value={formKontak.peran} onChange={e=>setFormKontak({...formKontak, peran: e.target.value})}/>
                           <input type="text" placeholder="No. Telepon / WA" className="border p-2 rounded-lg outline-none focus:border-black" value={formKontak.nomor} onChange={e=>setFormKontak({...formKontak, nomor: e.target.value})}/>
                           <select className="border p-2 rounded-lg outline-none focus:border-black bg-white" value={formKontak.tipe} onChange={e=>setFormKontak({...formKontak, tipe: e.target.value})}><option value="wa">WhatsApp</option><option value="tel">Telepon Biasa</option></select>
                           <select className="border p-2 rounded-lg outline-none focus:border-black bg-white sm:col-span-2" value={formKontak.kategori} onChange={e=>setFormKontak({...formKontak, kategori: e.target.value})}><option value="pemerintahan">Pemerintahan Desa</option><option value="keamanan">Keamanan & Ketertiban</option><option value="kesehatan">Pusat Kesehatan</option><option value="darurat">Darurat / Bencana</option><option value="infrastruktur">Infrastruktur Publik</option></select>
                        </div>
                        <button onClick={handleAddKontak} className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition">Tambahkan ke Daftar</button>
                     </div>
                     <div>
                        <h4 className="font-bold text-gray-900 mb-3 text-sm border-b pb-2">Daftar Kontak Tersimpan</h4>
                        <ul className="space-y-3 max-h-[300px] overflow-y-auto">
                           {profilDesa.kontak.length === 0 ? <li className="text-gray-400 italic">Belum ada kontak.</li> : profilDesa.kontak.map((k) => (
                               <li key={k.id} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                                  <div className="flex-1 pr-2"><p className="font-bold text-gray-900 text-xs md:text-sm">{k.nama} <span className="text-gray-400 font-medium text-[10px] md:text-xs block sm:inline">({k.peran})</span></p><p className="text-gray-600 text-[10px] md:text-xs mt-0.5">{k.nomor} - <span className="uppercase text-blue-500 font-bold">{k.tipe}</span></p></div>
                                  <button onClick={() => handleDeleteKontak(k.id)} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-50 hover:text-white transition shrink-0"><Trash2 size={16}/></button>
                               </li>
                             ))
                           }
                        </ul>
                     </div>
                   </div>
                )}

                {/* MODAL PENGADUAN DLL */}
                {modalType === 'pengaduan' && (
                  <div className="space-y-5 text-sm">
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-2"><div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-[10px] md:text-xs"><Calendar size={14}/> Masuk: {formatTanggal(selectedItem.created_at)}</div><div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-[10px] md:text-xs"><Tag size={14}/> Kategori: {selectedItem.kategori_pengaduan || selectedItem.kategori}</div></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5 font-bold">Identitas Pelapor</p><p className="text-gray-900 font-semibold">{selectedItem.is_anonim ? 'Anonim (Rahasia)' : selectedItem.nama_pelapor}</p></div><div><p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5 font-bold">Kontak Telepon/WA</p><p className="text-gray-900 font-semibold">{selectedItem.is_anonim || !selectedItem.no_telepon ? '-' : selectedItem.no_telepon}</p></div></div>
                    <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Lokasi Aduan</p><p className="text-gray-800 font-medium flex items-center gap-1.5"><MapPin size={14} className="text-red-500 shrink-0"/> <span className="truncate">{selectedItem.lokasi || '-'}</span></p></div>
                    <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Isi Laporan Pengaduan ({selectedItem.judul})</p><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed text-justify whitespace-pre-line text-xs md:text-sm">{selectedItem.detail}</div></div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-bold flex items-center gap-1.5"><ImageIcon size={14}/> Lampiran Bukti Warga</p>
                      {selectedItem.gambar_urls && selectedItem.gambar_urls.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedItem.gambar_urls.map((url, i) => (
                            <div key={i} onClick={() => setFullscreenImage(url)} className="aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 hover:opacity-90 cursor-pointer relative group">
                              <img src={url} alt={`Bukti Laporan ${i+1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Eye className="text-white" size={24} /></div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center text-xs text-gray-400 italic font-medium">Pelapor tidak menyertakan berkas lampiran.</div>
                      )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <label className="text-sm font-bold text-gray-900 mb-3 block">Ubah Status Pengaduan:</label>
                        <div className="flex flex-wrap gap-2">
                            {['Menunggu', 'Diproses', 'Selesai'].map((statusOption) => (
                            <button key={statusOption} onClick={() => handleUpdateStatus(selectedItem.id, statusOption)} disabled={loading || selectedItem.status === statusOption} className={`flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold rounded-lg sm:rounded-full transition-all duration-200 ${selectedItem.status === statusOption ? 'bg-black text-white cursor-default shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>{statusOption}</button>
                            ))}
                        </div>
                    </div>
                  </div>
                )}
                
                {modalType === 'informasi' && (
                  <div className="space-y-5 text-sm">
                    <h4 className="text-base md:text-lg font-bold text-gray-900 leading-tight">{selectedItem.judul}</h4>
                    <div className="flex flex-wrap gap-2 md:gap-3 mb-2">
                      <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-[10px] md:text-xs"><Calendar size={14}/> Dibuat: {formatTanggal(selectedItem.created_at)}</div>
                      {selectedItem.waktu && <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-medium text-[10px] md:text-xs"><Clock size={14}/> Agenda: {new Date(selectedItem.waktu).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})} WIB</div>}
                    </div>
                    {selectedItem.lokasi && <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5 font-bold">Lokasi Pelaksanaan</p><p className="text-gray-800 font-medium text-sm">{selectedItem.lokasi}</p></div>}
                    <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Isi Deskripsi Pengumuman</p><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed text-justify whitespace-pre-line text-xs md:text-sm">{selectedItem.deskripsi}</div></div>
                    {selectedItem.gambar && (
                      <div className="mt-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-1.5"><ImageIcon size={14}/> Lampiran Poster/Gambar</p>
                        <div className="w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50"><img src={selectedItem.gambar} alt="Lampiran Media" className="w-full h-full object-contain" /></div>
                      </div>
                    )}
                  </div>
                )}

                {modalType === 'potensi' && (
                  <div className="space-y-5 text-sm">
                    <h4 className="text-lg md:text-xl font-montserrat font-bold text-gray-900 leading-tight">{selectedItem.judul}</h4>
                    <div className="w-full aspect-video bg-[#cecece] rounded-xl border border-gray-300 flex items-center justify-center overflow-hidden relative group">
                      {selectedItem.gambar_urls && selectedItem.gambar_urls.length > 0 ? (
                        <>
                          <img src={selectedItem.gambar_urls[currentImageIndex]} alt={selectedItem.judul} className="w-full h-full object-cover" />
                          {selectedItem.gambar_urls.length > 1 && (
                            <>
                              <button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.gambar_urls.length - 1 : prev - 1))} className="absolute left-3 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"><ChevronLeft size={18} /></button>
                              <button onClick={() => setCurrentImageIndex((prev) => (prev === selectedItem.gambar_urls.length - 1 ? 0 : prev + 1))} className="absolute right-3 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all"><ChevronRight size={18} /></button>
                              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                {selectedItem.gambar_urls.map((_, idx) => (
                                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : selectedItem.gambar ? (
                        <img src={selectedItem.gambar} alt={selectedItem.judul} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center"><ImageIcon size={44} className="mb-1" /> <span className="text-xs">Tidak Ada Gambar</span></div>
                      )}
                    </div>
                    <div><p className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">Uraian Potensi Desa</p><div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-700 leading-relaxed text-justify whitespace-pre-line text-xs md:text-sm">{selectedItem.deskripsi}</div></div>
                  </div>
                )}

                {modalType === 'galeri' && selectedItem.gambar_urls && (
                  <div className="flex flex-col w-full h-[60vh] md:h-[70vh]">
                    <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
                      {selectedItem.gambar_urls.length > 0 ? (
                        <AnimatePresence mode="wait">
                          <motion.div key={currentImageIndex} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${selectedItem.gambar_urls[currentImageIndex]})` }} />
                        </AnimatePresence>
                      ) : (
                        <div className="text-gray-500 text-sm italic">Album tidak memiliki arsip foto.</div>
                      )}
                      {selectedItem.gambar_urls.length > 1 && (
                        <>
                          <button onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.gambar_urls.length - 1 : prev - 1))} className="absolute left-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all active:scale-90"><ChevronLeft size={24} /></button>
                          <button onClick={() => setCurrentImageIndex((prev) => (prev === selectedItem.gambar_urls.length - 1 ? 0 : prev + 1))} className="absolute right-4 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all active:scale-90"><ChevronRight size={24} /></button>
                        </>
                      )}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {selectedItem.gambar_urls.map((_, idx) => (
                          <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#222] p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-gray-300 text-xs font-medium flex items-center gap-2"><Calendar size={14} /> Dok. Tanggal: {formatTanggal(selectedItem.tanggal || selectedItem.created_at)}</p>
                      {selectedItem.infoId && (
                        <button onClick={() => jumpToInformasi(selectedItem.infoId)} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-sm font-semibold text-xs transition-colors flex items-center justify-center gap-2">
                          Buka Acara Terhubung <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {fullscreenImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setFullscreenImage(null)}>
            <button className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 rounded-full bg-black/50 backdrop-blur-md"><X size={32} /></button>
            <motion.img initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} src={fullscreenImage} alt="Preview Layar Penuh" className="max-w-full max-h-full object-contain drop-shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}