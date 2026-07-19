import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, MapPin, Mail, Phone, Image as ImageIcon, Map, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './config/supabaseClient'; 

const FacebookIcon = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>);
const TwitterIcon = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>);
const InstagramIcon = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>);
const YoutubeIcon = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>);
const TiktokIcon = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="lucide"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.77 0 2.89 2.89 0 0 1 2.5-2.87V9.75a6.34 6.34 0 0 0-2.5 12.25 6.34 6.34 0 0 0 6.34-6.34V6.69a6.88 6.88 0 0 0 4.19 1.39v3.45Z" /></svg>);

const FadeInOnScroll = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold: 0.15 }
    );

    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function App() {
  const navigate = useNavigate(); 
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null); 
  
  // State untuk menampung Data Dashboard
  const [infoTerbaru, setInfoTerbaru] = useState([]);
  const [potensiTerbaru, setPotensiTerbaru] = useState([]);
  const [galeriTerbaru, setGaleriTerbaru] = useState([]); 
  const [mapImage, setMapImage] = useState(null); 

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Tarik Data Peta dari Profil Desa
        const { data: profilData, error: profilError } = await supabase
          .from('desa_profil')
          .select('data')
          .eq('kategori', 'struktur')
          .single();
        if (!profilError && profilData?.data?.peta_desa) {
          setMapImage(profilData.data.peta_desa);
        }

        // 2. Tarik Data Informasi
        const { data: infoData, error: infoError } = await supabase
          .from('informasi_desa')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);
        if (!infoError) setInfoTerbaru(infoData || []);

        // 3. Tarik Data Potensi
        const { data: potensiData, error: potensiError } = await supabase
          .from('potensi_desa')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        if (!potensiError) setPotensiTerbaru(potensiData || []);

        // 4. Tarik Data Galeri & Gabungkan dengan Informasi yang ada gambarnya
        const { data: resGaleri, error: galeriError } = await supabase
          .from('galeri_desa')
          .select('*')
          .order('created_at', { ascending: false });
        if (!galeriError) {
          const galeriMurni = (resGaleri || []).map(g => ({ ...g, source: 'galeri' }));
          const galeriDariInfo = (infoData || [])
            .filter(info => info.gambar)
            .map(info => ({
              id: `info-${info.id}`,
              judul_kegiatan: info.judul,
              gambar_urls: [info.gambar],
              created_at: info.created_at,
              source: 'informasi'
            }));

          const combinedGaleri = [...galeriMurni, ...galeriDariInfo]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 4); 

          setGaleriTerbaru(combinedGaleri);
        }

      } catch (err) {
        console.error("Gagal menarik data beranda:", err.message);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="font-inter text-gray-800 bg-slate-50 min-h-screen overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        html { scroll-behavior: smooth; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-3 shadow-lg' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="text-white font-montserrat font-bold text-xl tracking-wider flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs">DS</span>
            </div>
            <a href="#beranda" className="text-white font-montserrat font-bold text-xl tracking-wider">
              DESA SEKUNYIT
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-white font-poppins text-sm uppercase tracking-widest">
            <a href="#profil" className="hover:text-gray-300 transition-colors">Profil</a>
            <a href="#seputar" className="hover:text-gray-300 transition-colors">Seputar Desa</a>
            <a href="#potensi" className="hover:text-gray-300 transition-colors">Potensi Desa</a>
            <a href="#informasi" className="hover:text-gray-300 transition-colors">Informasi</a>
            <a href="#galeri" className="hover:text-gray-300 transition-colors">Galeri</a>
            <a href="/aduan-warga" className="hover:text-gray-300 transition-colors">Adu</a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md flex flex-col py-2 px-6 shadow-xl"
            >
              <a href="#profil" className="text-white font-poppins py-4 border-b border-gray-700 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors" onClick={() => setMobileMenuOpen(false)}>Profil</a>
              <a href="#seputar" className="text-white font-poppins py-4 border-b border-gray-700 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors" onClick={() => setMobileMenuOpen(false)}>Seputar Desa</a>
              <a href="#potensi" className="text-white font-poppins py-4 border-b border-gray-700 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors" onClick={() => setMobileMenuOpen(false)}>Potensi Desa</a>
              <a href="#informasi" className="text-white font-poppins py-4 border-b border-gray-700 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors" onClick={() => setMobileMenuOpen(false)}>Informasi</a>
              <a href="#galeri" className="text-white font-poppins py-4 border-b border-gray-700 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors" onClick={() => setMobileMenuOpen(false)}>Galeri</a>
              <a href="/aduan-warga" className="text-white font-poppins py-4 text-sm tracking-widest uppercase hover:text-gray-300 transition-colors" onClick={() => setMobileMenuOpen(false)}>Adu</a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="beranda" className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/Foto/IMG_4424.jpg")' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-zinc-900"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 flex flex-col justify-center h-full pt-20">
          <FadeInOnScroll delay={100}><p className="text-white font-montserrat tracking-[0.2em] md:tracking-[0.3em] uppercase text-2xl md:text-2xl mb-2">Selamat Datang</p></FadeInOnScroll>
          <FadeInOnScroll delay={300}><h1 className="text-white font-montserrat font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight leading-none mb-8">DESA SEKUNYIT</h1></FadeInOnScroll>
          <FadeInOnScroll delay={500} className="self-end md:w-1/3 mt-20 hidden md:block">
            <p className="text-gray-200 text-xl md:text-lg font-inter text-left border-l-2 border-white pl-4">
              Selamat datang di Desa Sekunyit. <br/>Halaman ini menyediakan informasi seputar desa, serta tempat untuk menyampaikan pengaduan desa.
            </p> 
          </FadeInOnScroll>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="profil" className="bg-zinc-900 text-gray-300 py-30 px-6 md:px-12">
        <div className="container mx-auto max-w-6xl">
          <FadeInOnScroll>
            <div className="flex flex-col items-center mb-16 mt-20">
              <h2 className="text-white font-montserrat font-bold text-2xl md:text-3xl uppercase tracking-wider mb-2">Desa Sekunyit</h2>
              <div className="w-100 h-1 bg-white"></div>
            </div>
          </FadeInOnScroll>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-2/3 font-inter text-sm md:text-base leading-relaxed space-y-4 text-justify">
              <FadeInOnScroll delay={100}>
                <p>
                  Desa Sekunyit adalah sebuah desa pesisir bersejarah di Kecamatan Kaur Selatan, Kabupaten Kaur, Provinsi Bengkulu, yang berbatasan langsung dengan hamparan Samudera Hindia. Berjarak hanya sekitar 4 kilometer di utara ibu kota Bintuhan, desa yang mengusung visi "Membangun Desa Yang Berkeadilan" ini memiliki cikal bakal pemukiman sejak tahun 1917. Nama "Sekunyit" resmi disematkan pada tahun 1948, terinspirasi dari fenomena alam unik pada tahun 1918 ketika air muara hingga lautan lepas berubah warna menjadi kuning pekat menyerupai kunyit. Sejarah lisan dan identitas inilah yang terus menjadi kebanggaan masyarakat setempat hingga kini.
                </p>
              </FadeInOnScroll>
              <FadeInOnScroll delay={200}>
                <p>
                  Sebagai kawasan pesisir, denyut nadi perekonomian Desa Sekunyit sangat bertumpu pada sektor kelautan dengan 75% penduduknya berprofesi sebagai nelayan tangkap tradisional. Lebih dari itu, desa ini memegang peran krusial sebagai pusat ekonomi pesisir bagi wilayah sekitarnya. Hal ini didukung oleh keberadaan pelabuhan lokal yang menjadi titik sandar kapal dari berbagai desa tetangga, Tempat Pelelangan Ikan (TPI), serta fasilitas penunjang yang lengkap seperti gudang ikan berskala besar, pabrik es mini, dan lapak-lapak penjualan ikan segar.
                </p>
              </FadeInOnScroll>
              <FadeInOnScroll delay={300}>
                <p>
                  Selain kaya akan hasil tangkapan laut, potensi alam Desa Sekunyit juga memancarkan daya tarik pariwisata yang berjalan selaras dengan kesadaran lingkungan masyarakatnya. Wisata Pantai Sekunyit menawarkan karakteristik pantai karang yang landai, hamparan pasir putih, serta nuansa asri dari deretan pohon kelapa milik warga yang menjadikannya destinasi favorit wisatawan. Menyadari pentingnya menjaga kekayaan alam tersebut, masyarakat nelayan secara aktif berpartisipasi menjaga Daerah Perlindungan Laut (DPL) yang telah ditetapkan sejak tahun 2009. Upaya pelestarian terumbu karang di zona inti konservasi ini menjadi bukti nyata komitmen desa dalam memastikan keberlanjutan ekosistem pesisir mereka.
                </p>
              </FadeInOnScroll>
            </div>
            
            <FadeInOnScroll delay={400} className="md:w-1/3 w-full flex justify-center pb-20">
              <div 
                className="bg-transparent size-full aspect-square rounded-sm flex items-center justify-center"
                style={{ 
                    backgroundImage: 'url("/Foto/KabupatenKaur.png")', 
                    backgroundSize: 'contain', 
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
                >
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* --- Peta Desa (DINAMIS DARI ADMIN) --- */}
      <section className="bg-slate-50 py-20 px-6 md:px-12 border-t-4 border-zinc-900">
        <div className="container mx-auto max-w-5xl">
          <FadeInOnScroll>
            <div className="flex flex-col items-center mb-12">
                <div className="w-300 h-1 bg-zinc-900"></div>
            </div>
            <h2 className="text-zinc-900 font-montserrat font-bold text-xl md:text-2xl mb-6">Peta Desa Sekunyit</h2>
            
            <div 
              onClick={() => mapImage && setFullscreenImage(mapImage)}
              className={`w-full bg-[#dcdcdc] rounded-xl border border-gray-300 flex flex-col items-center justify-center relative overflow-hidden group shadow-xl transition-all ${mapImage ? 'cursor-pointer hover:shadow-2xl h-auto' : 'aspect-video cursor-default'}`}
            >
              {mapImage ? (
                <>
                  <img src={mapImage} alt="Peta Desa Sekunyit" className="w-full h-auto object-contain" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="bg-white/90 text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                      <Maximize size={18} /> Perbesar Peta
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Map size={48} className="text-gray-400 mb-2" />
                  <span className="text-gray-500 font-inter text-sm font-medium">Peta belum diunggah Admin</span>
                </>
              )}
            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* --- Seputar Desa --- */}
      <section id="seputar" className="bg-slate-50 py-30 px-6 md:px-12 pb-24 mt-20">
        <div className="container mx-auto max-w-4xl">
          <FadeInOnScroll>
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-zinc-900 font-montserrat font-bold text-xl md:text-2xl uppercase tracking-wider mb-2">Seputar Desa</h2>
              <div className="w-16 h-1 bg-zinc-900"></div>
            </div>
          </FadeInOnScroll>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20">
            {[
                { label: "Struktur Desa", path: "/struktur-organisasi" },
                { label: "Visi dan Misi Desa", path: "/visi-misi" },
                { label: "Tujuan Desa", path: "/visi-misi" }, 
                { label: "Data Kependudukan", path: "/data-kependudukan" },
                { label: "Potensi Desa", path: "/potensi-desa" },
                { label: "Data Pembangunan", path: "/data-bangunan" },
                { label: "Kontak Penting", path: "/kontak-penting" },
                { label: "Geologis Desa", path: "/geologi-desa" },
                { label: "Adat dan Budaya", path: "/adat-budaya" }
            ].map((item, index) => (
                <FadeInOnScroll key={index} delay={index * 50}>
                <button 
                    onClick={() => navigate(item.path)}
                    className="w-full bg-zinc-900 text-white font-poppins text-sm py-4 px-4 rounded shadow-md hover:bg-zinc-800 hover:-translate-y-1 transition-all duration-300 text-center"
                >
                    {item.label}
                </button>
                </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- POTENSI DESA --- */}
      <section id="potensi" className="relative py-30 px-6 md:px-12 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: 'url("Foto/IMG_4725.jpg")', filter: 'blur(2px)' }}></div>
        <div className="container mx-auto max-w-5xl relative z-10 pt-20">
          <FadeInOnScroll>
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-white font-montserrat font-bold text-xl md:text-2xl uppercase tracking-wider mb-2">Potensi Desa Sekunyit</h2>
            </div>
          </FadeInOnScroll>
          <FadeInOnScroll delay={200}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 border border-white/20 shadow-2xl mb-20">
              <div className="md:w-1/3 flex flex-col justify-center">
                <p className="text-white font-inter text-sm md:text-base leading-relaxed">
                  Desa Sekunyit memiliki beberapa spot wisata dan potensi yang menjanjikan, dikelilingi oleh indahnya hamparan karang laut, kekayaan maritim, hingga UMKM kreatif warga setempat.
                </p>
                <button onClick={() => navigate('/potensi-desa')} className="mt-6 self-start text-xs font-poppins bg-white text-zinc-900 px-6 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-colors">
                  Lihat Selengkapnya
                </button>
              </div>
              
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {potensiTerbaru.length === 0 ? (
                  <div className="col-span-3 text-center text-white/50 text-sm py-10 font-inter border border-dashed border-white/20 rounded-lg">Belum ada potensi terdaftar.</div>
                ) : (
                  potensiTerbaru.map((potensi, index) => {
                    const imgCover = potensi.gambar_urls && potensi.gambar_urls.length > 0 ? potensi.gambar_urls[0] : potensi.gambar;
                    return (
                      <div 
                        key={potensi.id} 
                        onClick={() => navigate('/potensi-desa')}
                        className="bg-zinc-800/90 rounded-xl aspect-video sm:aspect-auto sm:min-h-[250px] md:h-full bg-cover bg-center cursor-pointer hover:scale-[1.03] transition-transform overflow-hidden relative group shadow-md"
                        style={{ backgroundImage: imgCover ? `url(${imgCover})` : 'none', animationDelay: `${index * 150}ms` }}
                      >
                        {!imgCover && <div className="absolute inset-0 flex items-center justify-center text-white/40 text-xs">Tanpa Gambar</div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white font-montserrat font-bold text-sm leading-tight line-clamp-3">{potensi.judul}</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

            </div>
          </FadeInOnScroll>
        </div>
      </section>

      {/* --- INFORMASI DESA --- */}
      <section id="informasi" className="bg-zinc-950 py-30 px-6 md:px-12 border-t border-zinc-800">
        <div className="container mx-auto max-w-6xl pt-20">
          <FadeInOnScroll>
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-white font-montserrat font-bold text-xl md:text-2xl uppercase tracking-wider mb-2">Informasi Desa</h2>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
            {infoTerbaru.length === 0 ? (
               <div className="col-span-full text-center text-zinc-500 text-sm py-10 font-inter">Belum ada informasi yang dipublikasikan.</div>
            ) : (
              infoTerbaru.map((item, index) => (
                <FadeInOnScroll key={item.id} delay={index * 100}>
                  <div 
                    onClick={() => navigate(`/informasi/${item.id}`)}
                    className="bg-zinc-800 aspect-square rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden border border-zinc-700 relative group bg-cover bg-center"
                    style={{ backgroundImage: item.gambar ? `url(${item.gambar})` : 'none' }}
                  >
                     {!item.gambar && (
                       <div className="absolute inset-0 flex items-center justify-center p-4">
                         <span className="text-zinc-500 font-poppins text-xs font-semibold text-center line-clamp-3">{item.judul}</span>
                       </div>
                     )}
                     
                     <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/80 transition-opacity duration-300 p-3 text-center gap-2">
                        <span className="text-white font-poppins text-sm md:text-base font-bold line-clamp-2 leading-tight">{item.judul}</span>
                        <span className="text-gray-300 font-poppins text-[10px] uppercase tracking-wider">Baca Selengkapnya</span>
                     </div>
                  </div>
                </FadeInOnScroll>
              ))
            )}
          </div>

          <FadeInOnScroll delay={100}>
            <button 
              onClick={() => navigate('/informasi-desa')}
              className="relative mb-20 self-start text-xs font-poppins border-2 border-white bg-transparent text-white px-6 py-2.5 rounded-full font-semibold hover:bg-white hover:text-zinc-900 transition-colors"
            >
              Lihat Selengkapnya
            </button>
          </FadeInOnScroll>
        </div>
      </section>

      {/* --- GALERI DESA --- */}
      <section id="galeri" className="bg-zinc-950 py-30 px-6 md:px-12 border-t border-zinc-800">
        <div className="container mx-auto max-w-6xl pt-20">
          <FadeInOnScroll>
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-white font-montserrat font-bold text-xl md:text-2xl uppercase tracking-wider mb-2">Galeri Desa</h2>
            </div>
          </FadeInOnScroll>

          {/* Render Dinamis Galeri */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10">
            {galeriTerbaru.length === 0 ? (
               <div className="col-span-full text-center text-zinc-500 text-sm py-10 font-inter">Belum ada galeri yang dipublikasikan.</div>
            ) : (
              galeriTerbaru.map((item, index) => {
                const coverImg = item.gambar_urls && item.gambar_urls.length > 0 ? item.gambar_urls[0] : null;
                return (
                  <FadeInOnScroll key={item.id} delay={index * 100}>
                    <div 
                      onClick={() => navigate('/galeri-desa')}
                      className="bg-zinc-800 aspect-square rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer overflow-hidden border border-zinc-700 relative group bg-cover bg-center"
                      style={coverImg ? { backgroundImage: `url(${coverImg})` } : {}}
                    >
                      {!coverImg && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <ImageIcon size={32} className="text-gray-400 opacity-50" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity duration-300">
                        <span className="text-white font-poppins text-sm font-semibold">Lihat Galeri</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-3">
                        <p className="text-white text-[10px] md:text-xs font-medium font-inter truncate">{item.judul_kegiatan || 'Dokumentasi'}</p>
                      </div>
                    </div>
                  </FadeInOnScroll>
                );
              })
            )}
          </div>

          <FadeInOnScroll delay={100}>
            <button 
              onClick={() => navigate('/galeri-desa')}
              className="relative mb-20 self-start text-xs font-poppins border-2 border-white bg-transparent text-white px-6 py-2.5 rounded-full font-semibold hover:bg-white hover:text-zinc-900 transition-colors"
            >
              Lihat Selengkapnya
            </button>
          </FadeInOnScroll>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <section className="bg-gradient-to-b from-zinc-950 to-slate-200 py-16 px-6 md:px-12 text-center">
        <FadeInOnScroll>
          <h3 className="text-zinc-800 font-montserrat font-semibold text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            <br/><br/><br/><br/> Terima kasih telah berkunjung<br/>kami nantikan kedatanganmu di desa kami!
          </h3>
        </FadeInOnScroll>
      </section>

      <footer className="bg-slate-100 text-zinc-600 py-12 px-6 md:px-12 border-t border-gray-300">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:w-1/2">
            <div className="w-24 h-24 bg-gray-300 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-xs text-gray-500">Logo</span>
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-zinc-800 text-lg mb-2">Desa Sekunyit</h4>
              <p className="font-inter text-sm mb-1 flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0" /><span>Kec. Kaur Selatan,<br/>Kabupaten Kaur,<br/>Bengkulu</span></p>
              <p className="font-inter text-sm mt-4 flex items-center gap-2"><span className="font-semibold text-zinc-800">Kode Pos:</span> 38963</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 md:w-1/2 md:items-end text-left md:text-right w-full">
            <div>
              <h4 className="font-montserrat font-bold text-zinc-800 text-sm mb-2 uppercase">Layanan Kami</h4>
              <p className="font-inter text-sm flex items-center md:justify-end gap-2 mb-1"><Mail size={16} /> info@sekunyit.desa.id</p>
              <p className="font-inter text-sm flex items-center md:justify-end gap-2"><Phone size={16} /> +62 812 3456 7890</p>
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-zinc-800 text-sm mb-3 uppercase">Media Sosial</h4>
              <div className="flex items-center md:justify-end gap-4">
                <a href="#" className="p-2 bg-zinc-200 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><FacebookIcon size={18} /></a>
                <a href="#" className="p-2 bg-zinc-200 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><TwitterIcon size={18} /></a>
                <a href="#" className="p-2 bg-zinc-200 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><InstagramIcon size={18} /></a>
                <a href="#" className="p-2 bg-zinc-200 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><YoutubeIcon size={18} /></a>
                <a href="#" className="p-2 bg-zinc-200 rounded-full hover:bg-zinc-800 hover:text-white transition-colors"><TiktokIcon size={18} /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-gray-300 text-center font-inter text-xs text-gray-500">
          <p>© 2026 KKN Kelompok 205 UNIB X UNILA</p>
        </div>
      </footer>

      {/* LIGHTBOX MODAL UNTUK PETA */}
      <AnimatePresence>
        {fullscreenImage && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFullscreenImage(null)} className="absolute inset-0 bg-black/95 backdrop-blur-sm cursor-zoom-out" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative z-10 w-full max-w-6xl h-full flex flex-col pointer-events-none">
              <div className="flex justify-between items-start mb-4 pointer-events-auto">
                <h3 className="text-white font-montserrat font-bold text-lg md:text-xl drop-shadow-md pr-8">Peta Desa Sekunyit</h3>
                <button onClick={() => setFullscreenImage(null)} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md"><X size={24} /></button>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center pointer-events-auto">
                <img src={fullscreenImage} alt="Peta Fullscreen" className="max-w-full max-h-full object-contain drop-shadow-2xl" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}