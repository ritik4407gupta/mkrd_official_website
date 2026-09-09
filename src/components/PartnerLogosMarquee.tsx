import React from 'react';

const PARTNER_LOGOS = [
  "https://static.wixstatic.com/media/f32f12_4d2d6b7239a94ec782af0d187c9a1857~mv2.png/v1/fill/w_134,h_76,al_c,q_85/Screenshot.png",
  "https://static.wixstatic.com/media/f32f12_75834f48d5f347f880d2d609991bc092~mv2.png/v1/fill/w_98,h_174,al_c,q_85/product.png",
  "https://static.wixstatic.com/media/f32f12_40b6428e42ae47ed88bfea6bf1fb10dc~mv2.webp/v1/fill/w_288,h_216,al_c,q_80/Panasonic.webp",
  "https://static.wixstatic.com/media/f32f12_4fdbb24c752d45249f78bcaa14c50867~mv2.png/v1/fill/w_228,h_128,al_c,q_85/god.png",
  "https://static.wixstatic.com/media/f32f12_fb590aa8fd8e411097873444fc741e2b~mv2.png/v1/crop/x_0,y_0,w_1772,h_788/fill/w_96,h_42,al_c,q_85/Screen.png",
  "https://static.wixstatic.com/media/f32f12_87d4efb8e9684b339a27f71050261a80~mv2.jpeg/v1/fill/w_126,h_100,al_c,q_80/images.jpeg",
  "https://static.wixstatic.com/media/f32f12_9f7b5d2d043f43de8789ce86995a52a3~mv2.png/v1/crop/x_26,y_0,w_255,h_170/fill/w_128,h_86,al_c,q_85/alp.png",
  "https://static.wixstatic.com/media/f32f12_7da8c4d433eb4f3fadd8b82e9ed51717~mv2.jpg/v1/fill/w_292,h_164,al_c,q_80/PHOTO.jpg",
  "https://static.wixstatic.com/media/f32f12_052a355706ce45259198de967e3524fa~mv2.png/v1/fill/w_126,h_100,al_c,q_85/images.png",
  "https://static.wixstatic.com/media/f32f12_d0cbbca742e343b9bcac993535f89719~mv2.png/v1/fill/w_150,h_76,al_c,q_85/logo.png",
  "https://static.wixstatic.com/media/f32f12_7b2c58effafd4d5aafd1850444e1564e~mv2.png/v1/fill/w_122,h_68,al_c,q_85/Screen.png",
  "https://static.wixstatic.com/media/f32f12_a62b699f104d469b84e46c78999dec33~mv2.png/v1/fill/w_216,h_110,al_c,q_85/Screen.png"
];

// Split the logos into two halves for the two sliders
const ROW_1 = PARTNER_LOGOS.slice(0, 6);
const ROW_2 = PARTNER_LOGOS.slice(6, 12);

export const PartnerLogosMarquee: React.FC = () => {
  return (
    <div className="w-full overflow-hidden bg-transparent py-10 sm:py-16 flex flex-col gap-10 relative z-10">
      
      {/* Title */}
      <div className="text-center mb-6 relative z-30">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-500">
          Trusted By Industry Leaders
        </h2>
        <div className="w-16 h-1 bg-cyan-500/50 mx-auto mt-4 rounded-full" />
      </div>

      {/* CSS Animation defined inline for portability */}
      <style>{`
        @keyframes scrollLogosLeft {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollLogosRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-logos-left {
          animation: scrollLogosLeft 25s linear infinite;
        }
        .animate-logos-right {
          animation: scrollLogosRight 25s linear infinite;
        }
        .animate-logos-left:hover,
        .animate-logos-right:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      {/* Dark gradient fade masks for seamless edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-20 pointer-events-none" />
      
      {/* Row 1 (Left to Right, so animation is scrollLogosRight) */}
      <div className="flex gap-40 sm:gap-64 px-10 items-center animate-logos-right" style={{ width: 'max-content' }}>
        {[...ROW_1, ...ROW_1, ...ROW_1, ...ROW_1].map((logo, idx) => (
          <div key={idx} className="flex items-center justify-center w-32 h-16 opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer grayscale hover:grayscale-0">
            <img src={logo} alt="Partner Logo" className="max-w-full max-h-full object-contain" />
          </div>
        ))}
      </div>

      {/* Row 2 (Right to Left, so animation is scrollLogosLeft) */}
      <div className="flex gap-40 sm:gap-64 px-10 items-center animate-logos-left" style={{ width: 'max-content' }}>
        {[...ROW_2, ...ROW_2, ...ROW_2, ...ROW_2].map((logo, idx) => (
          <div key={idx} className="flex items-center justify-center w-32 h-16 opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 cursor-pointer grayscale hover:grayscale-0">
            <img src={logo} alt="Partner Logo" className="max-w-full max-h-full object-contain" />
          </div>
        ))}
      </div>

    </div>
  );
};
