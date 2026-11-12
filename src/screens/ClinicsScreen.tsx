import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star, Clock, Phone, Navigation, LocateFixed, Loader2, AlertTriangle } from 'lucide-react';
import { clinics } from '@/data';
import type { Clinic } from '@/types';
import { AppHeader } from '@/components/AppHeader';

const FALLBACK_CENTER: [number, number] = [-30.0346, -51.1144]; // Porto Alegre, RS

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px">
    <div style="position:absolute;inset:-6px;border-radius:9999px;background:rgba(20,184,166,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite"></div>
    <div style="position:absolute;inset:0;border-radius:9999px;background:#0d9488;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const clinicIcon = (active: boolean) =>
  L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:${active ? '#b45309' : 'white'};border:2px solid ${active ? '#b45309' : '#d6c3a9'};box-shadow:0 2px 6px rgba(0,0,0,0.25)">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${active ? 'white' : '#b45309'}" stroke="${active ? 'white' : '#b45309'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3" fill="${active ? '#b45309' : 'white'}" stroke="none"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function ClinicsScreen() {
  const [selected, setSelected] = useState<Clinic | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Seu aparelho não oferece suporte a GPS.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setLocationError('Não foi possível obter sua localização. Verifique se o GPS está ativado e a permissão concedida.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  useEffect(() => {
    locate();
  }, []);

  const center = position ?? FALLBACK_CENTER;

  const clinicsWithDistance = useMemo(
    () =>
      clinics
        .map((c) => ({
          clinic: c,
          distance: position ? haversineKm({ lat: center[0], lng: center[1] }, c) : null,
        }))
        .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)),
    [position, center[0], center[1]]
  );

  const openDirections = (c: Clinic) => {
    const dest = `${c.lat},${c.lng}`;
    const origin = position ? `${position[0]},${position[1]}` : '';
    const url = origin
      ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="min-h-screen pb-24">
      <AppHeader title="Guia de Clínicas" subtitle="Veterinários próximos de você" />

      <div className="px-4 pt-4">
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-secondary-200 mb-4 h-72 z-0">
          <MapContainer center={center} zoom={position ? 14 : 13} className="h-full w-full" zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter center={center} zoom={position ? 14 : 13} />
            {position && (
              <>
                <Circle center={position} radius={120} pathOptions={{ color: '#0d9488', weight: 0, fillColor: '#0d9488', fillOpacity: 0.12 }} />
                <Marker position={position} icon={userIcon}>
                  <Popup>Você está aqui</Popup>
                </Marker>
              </>
            )}
            {clinics.map((c) => (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={clinicIcon(selected?.id === c.id)}
                eventHandlers={{ click: () => setSelected(c) }}
              >
                <Popup>
                  <strong>{c.name}</strong>
                  <br />
                  {c.address}
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          <button
            onClick={locate}
            className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2.5 shadow-lg border border-secondary-200 active:scale-95 transition-transform"
          >
            {locating ? (
              <Loader2 size={16} className="animate-spin text-primary-600" />
            ) : (
              <LocateFixed size={16} className="text-primary-600" />
            )}
            <span className="text-xs font-semibold text-primary-700">{locating ? 'Localizando...' : 'Meu GPS'}</span>
          </button>
        </div>

        {locationError && (
          <div className="flex items-start gap-2 mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">{locationError}</p>
          </div>
        )}

        {!position && !locationError && (
          <div className="flex items-start gap-2 mb-3 rounded-xl bg-secondary-100 border border-secondary-200 px-3.5 py-2.5">
            <Loader2 size={16} className="animate-spin text-primary-500 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600 leading-relaxed">Obtendo sua localização pelo GPS...</p>
          </div>
        )}

        <div className="space-y-3">
          {clinicsWithDistance.map(({ clinic: c, distance }, i) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left bg-primary-100 rounded-2xl shadow-sm border p-4 transition-all duration-200 ${
                selected?.id === c.id ? 'border-accent-500 ring-2 ring-accent-200' : 'border-primary-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {position && i === 0 && (
                    <span className="text-[10px] font-bold text-white bg-primary-700 px-2 py-0.5 rounded-full">
                      MAIS PRÓXIMA
                    </span>
                  )}
                  <h3 className="text-base font-bold text-primary-900">{c.name}</h3>
                </div>
                <div className="flex items-center gap-1 bg-accent-100 px-2 py-1 rounded-lg">
                  <Star size={14} className="text-accent-600" fill="currentColor" />
                  <span className="text-xs font-semibold text-accent-800">{c.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <MapPin size={14} className="text-gray-500 flex-shrink-0" />
                <p className="text-sm text-gray-500">{c.address}</p>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Navigation size={13} />
                    {distance !== null ? (
                      <span className="font-medium text-primary-600">{formatKm(distance)}</span>
                    ) : (
                      <span>sem GPS</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={13} />
                    {c.hours}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone size={13} />
                  {c.phone}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-primary-900">{selected.name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={16} className="text-amber-400" fill="currentColor" />
                  <span className="text-sm font-semibold text-amber-600">{selected.rating}</span>
                  {position && (
                    <span className="text-sm text-gray-500">
                      · {formatKm(haversineKm({ lat: position[0], lng: position[1] }, selected))} de distância
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full bg-gray-100">
                <span className="text-gray-500 text-sm">✕</span>
              </button>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-primary-500" />
                {selected.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-primary-500" />
                {selected.hours}
              </div>
              <a
                href={`tel:${selected.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Phone size={16} className="text-primary-500" />
                {selected.phone}
              </a>
            </div>
            <button
              onClick={() => openDirections(selected)}
              className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm shadow-md shadow-primary-200 hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Como Chegar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
