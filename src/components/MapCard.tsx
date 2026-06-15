import React, { useState } from 'react';
import { MapPin, Navigation, Eye, GraduationCap, Building } from 'lucide-react';

interface SectorInfo {
  name: string;
  address: string;
  landmarks: string[];
  type: string;
  mapEmbedUrl: string;
}

const SECTORS: SectorInfo[] = [
  {
    name: 'Sector 62 (Corporate Hub)',
    address: 'Block B, Sector 62, Noida, Uttar Pradesh 201301',
    type: 'Boys & Girls (Separate Wings)',
    landmarks: ['Sector 62 Metro Station (500m)', 'Fortis Hospital (800m)', 'MAIT & JP Institute (1km)', 'Stellar IT Park (600m)'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!1m3!1d3502.1373516091395!2d77.3627063150824!3d28.625634982420455!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ceff135555555%3A0x67db91383cd8198f!2sSector%2062%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1655189033321!5m2!1sen!2sin'
  },
  {
    name: 'Sector 126 (Amity Zone)',
    address: 'Sector 126, Noida, Uttar Pradesh 201303',
    type: 'Girls Only Premium',
    landmarks: ['Amity University Campus (Opposite)', 'Okhla Bird Sanctuary Metro (2.5km)', 'HCL Technologies (1.5km)', 'Raipur Khadar Market (400m)'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!1m3!1d3505.748348821908!2d77.33087091507983!3d28.517228882463283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce6fa15555555%3A0x53460de01efad4e3!2sAmity%20University%20Noida!5e0!3m2!1sen!2sin!4v1655189077732!5m2!1sen!2sin'
  },
  {
    name: 'Sector 135 (Tech Corridor)',
    address: 'Sector 135, Noida, Uttar Pradesh 201304',
    type: 'Luxury Co-Living',
    landmarks: ['Candor TechSpace IT Park (400m)', 'Sector 137 Metro Station (1.8km)', 'Expressway Link (300m)', 'Metlife & Genpact Offices (500m)'],
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!1m3!1d3507.9620023403815!2d77.40428311507817!3d28.49571278247547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce79717777777%3A0x9599d10c0e90c6b1!2sSector%20135%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1655189115201!5m2!1sen!2sin'
  }
];

export const MapCard: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeSector = SECTORS[selectedIndex];

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-8 bg-card rounded-2xl border border-border p-6 shadow-md transition-all duration-300">
      {/* Locations Selection Panel */}
      <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-foreground mb-1">
            Our Branches in Noida
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Select a branch to see details, landmarks, and map coordinates.
          </p>
          
          <div className="space-y-3">
            {SECTORS.map((sector, index) => (
              <button
                key={sector.name}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'border-gold-500 bg-gold-500/5 shadow-sm' 
                    : 'border-border/60 hover:border-gold-500/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`h-4.5 w-4.5 shrink-0 ${selectedIndex === index ? 'text-gold-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm font-semibold">{sector.name}</span>
                </div>
                <div className="text-[11px] text-muted-foreground pl-6 font-medium uppercase tracking-wide">
                  {sector.type}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sector Details */}
        <div className="mt-6 pt-4 border-t border-border/80 space-y-4">
          <div>
            <div className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-1">Postal Address</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{activeSector.address}</p>
          </div>
          <div>
            <div className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-2">Nearby Landmarks</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeSector.landmarks.map((l, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {i === 2 ? <GraduationCap className="h-3.5 w-3.5 text-gold-500 shrink-0" /> : i === 3 ? <Building className="h-3.5 w-3.5 text-gold-500 shrink-0" /> : <Navigation className="h-3.5 w-3.5 text-gold-500 shrink-0" />}
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Display Panel */}
      <div className="lg:col-span-3 h-[300px] lg:h-full min-h-[350px] rounded-xl overflow-hidden border border-border relative">
        <iframe
          src={activeSector.mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale dark:invert-[0.9] dark:hue-rotate-180 transition-all duration-300"
        ></iframe>
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-sm">
          <Eye className="h-4 w-4 text-gold-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">Interactive Noida Map</span>
        </div>
      </div>
    </div>
  );
};
export default MapCard;
