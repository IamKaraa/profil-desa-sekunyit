import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Data Array untuk mempermudah mapping pilar budaya
const budayaList = [
  {
    id: 1,
    title: "Ketaatan pada Nilai Musyawarah (Mufakat)",
    desc1: "Karakteristik utama masyarakat Sekunyit adalah tingginya rasa kekeluargaan yang diwujudkan melalui sistem adat. Warga menjunjung tinggi prinsip Duduk Sepakat atau musyawarah adat.",
    desc2: "Segala bentuk dinamika sosial, mulai dari perencanaan hajatan besar desa hingga penyelesaian perselisihan antarwarga, selalu mengedepankan peran tokoh adat dan agama melalui Badan Musyawarah Adat (BMA). Masalah diselesaikan secara kekeluargaan untuk memastikan kerukunan warga tetap terjaga.",
    imgAlt: "Musyawarah Adat",
    img: "./Foto/musyawarah_desa.png"
  },
  {
    id: 2,
    title: "Pelestarian Tradisi Leluhur: Perayaan Bimbang",
    desc1: "Dalam siklus hidup masyarakat Sekunyit, perayaan hajatan seperti pernikahan atau khitanan rasul dirayakan melalui upacara adat besar yang disebut Bimbang. Seluruh warga desa akan turun tangan membantu persiapan secara bergotong-royong.",
    desc2: "Dalam perayaan ini, ragam seni pertunjukan wajib ditampilkan, seperti Tari Dewa Sembilan (tarian sakral menggunakan piring dan lilin), Tari Pedang (tari penyambutan simbol kepahlawanan), serta Berejung (lantunan syair dan pantun petuah yang diiringi petikan gitar tunggal).",
    imgAlt: "Tari Bimbang Kaur",
    img: "./Foto/Berejung.png"
  },
  {
    id: 3,
    title: "Tradisi Sengkure: Semarak Silaturahmi Idul Fitri",
    desc1: "Setiap perayaan Hari Raya Idul Fitri (biasanya pada hari ke-3 atau ke-4), masyarakat pesisir Kaur, termasuk Desa Sekunyit, menggelar tradisi pawai budaya Sengkure.",
    desc2: "Pemuda dan warga desa mengenakan topeng dan kostum unik dari ijuk atau pelepah pinang berkeliling desa. Di balik kemeriahannya, Sengkure adalah wadah silaturahmi massal untuk saling bermaaf-maafan dan mempererat tali persaudaraan antarwarga dan perantau.",
    imgAlt: "Tradisi Sengkure",
    img: "./Foto/sengkure.png"
  },
  {
    id: 4,
    title: "Budaya Komunal: Filosofi Melemang",
    desc1: "Menjelang hari-hari besar keagamaan atau acara adat, warga akan melaksanakan tradisi Melemang secara bergotong-royong. Beras ketan dan santan dimasukkan ke bumbung bambu lalu dibakar di perapian kayu yang memanjang.",
    desc2: "Kuliner ini bukan sekadar makanan. Tekstur ketan yang lengket di dalam lemang menyimbolkan filosofi sosial dan harapan agar persaudaraan antarwarga selalu 'merekat' kuat, harmonis, dan tidak mudah terpecah belah.",
    imgAlt: "Tradisi Melemang",
    img: "./Foto/malemang.png"
  },
  {
    id: 5,
    title: "Kearifan Lokal Pesisir: Harmoni Manusia dan Laut",
    desc1: "Berhadapan langsung dengan Samudra Hindia, warga Desa Sekunyit memiliki kearifan lokal (hukum adat tak tertulis) dalam menjaga ekosistem perairan. Terdapat larangan keras menggunakan racun (tuba) atau bahan peledak di wilayah perairan karang.",
    desc2: "Nelayan Sekunyit juga mewariskan ilmu tradisional dalam membaca rasi bintang, siklus pasang-surut (Langat), dan arah angin untuk menentukan waktu melaut yang paling aman dan berkah.",
    imgAlt: "Pesisir Sekunyit",
    img: "./Foto/pantai.png"
  }
];

export default function AdatBudayaUser() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f9] font-inter">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@500;600;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* --- HEADER DESA --- */}
      <header className="bg-[#111111] text-white h-[70px] flex items-center px-6 md:px-12 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto w-full flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-montserrat font-semibold text-lg tracking-wide">
            Profil Budaya Desa
          </h1>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="font-montserrat font-bold text-gray-900 text-xl md:text-2xl mb-8"
        >
          Adat, Budaya, dan Kearifan Lokal Desa Sekunyit
        </motion.h2>

        {/* --- SECTION 1: HERO KONTEN UTAMA --- */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#4b4b4b] rounded-[1.5rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-10 shadow-lg mb-12"
        >
          {/* Kolom Teks Kiri */}
          <div className="w-full md:w-3/5 text-gray-200 text-sm md:text-[15px] leading-relaxed space-y-4 text-justify font-medium">
            <p>
              Sebagai desa yang terletak di pesisir Kaur Selatan, kehidupan sosial masyarakat Desa Sekunyit tidak bisa dilepaskan dari akar kebudayaan Adat Kaur. Desa ini bukan sekadar wilayah geografis, melainkan sebuah ruang hidup di mana nilai-nilai luhur masa lalu terus dijaga, dipraktikkan, dan diwariskan dari generasi ke generasi.
            </p>
            <p>
              Hal ini tercermin dari ketaatan warga pada nilai musyawarah (mufakat), serta pelestarian tradisi leluhur seperti perayaan Bimbang, tradisi Sengkure saat Idul Fitri, dan budaya gotong royong memasak Lemang.
            </p>
            <p>
              Dipadukan dengan kearifan lokal masyarakat nelayan pesisir dalam menjaga kelestarian lautnya, Desa Sekunyit berdiri gagah sebagai benteng pelestari peradaban pesisir Kaur di tengah arus modernisasi. Berikut adalah pilar-pilar utamanya:
            </p>
          </div>
          
          {/* Kolom Gambar Kanan */}
          <div className="w-full md:w-2/5 flex">
            <div className="w-full h-full min-h-[300px] bg-[#3d3d3d] rounded-xl shadow-inner border border-white/10 flex items-center justify-center text-gray-400 font-medium overflow-hidden relative">
              {/* Ganti src dengan path gambar ilustrasi utama desa/pantai Anda */}
              <img 
                src="./Foto/adat_budaya_1.png" 
                alt="Pesisir Desa Sekunyit" 
                className="w-full h-full object-cover absolute inset-0 opacity-80 hover:opacity-100 transition-opacity duration-300" 
              />
              <span className="z-10 bg-black/50 px-4 py-2 rounded-lg text-white">Gambar Pesisir / Budaya Sekunyit</span>
            </div>
          </div>
        </motion.section>

        {/* --- SECTION 3: LIST DETAIL BUDAYA --- */}
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-6"
        >
          {/* Mapping dari array budayaList */}
          {budayaList.map((item) => (
            <motion.div 
              key={item.id}
              variants={itemVariants}
              className="flex flex-col md:flex-row gap-4 group"
            >
              {/* Box Gambar (Kiri) */}
              <div className="w-full md:w-1/4 bg-[#1e1e1e] rounded-2xl min-h-[200px] flex items-center justify-center text-gray-400 font-inter text-sm shadow-md overflow-hidden relative">
                {/* Ganti src dengan ilustrasi masing-masing pilar */}
                <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>

              {/* Box Teks (Kanan) */}
              <div className="w-full md:w-3/4 bg-[#e2e8f0] rounded-2xl p-6 md:p-8 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-montserrat font-bold text-gray-900 text-lg mb-3">
                  {item.title}
                </h3>
                <div className="text-gray-700 text-sm md:text-[15px] leading-relaxed text-justify space-y-3 font-medium">
                  <p>{item.desc1}</p>
                  <p>{item.desc2}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.section>

      </main>
    </div>
  );
}