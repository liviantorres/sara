import React, { useEffect, useRef, useState } from "react";
import { MapPin, RotateCcw, Layers } from "lucide-react";


const COORDENADAS = {
  "CRATEÚS": [-5.1783, -40.6692],
  "CRATEUS": [-5.1783, -40.6692],
  "INDEPENDÊNCIA": [-5.3964, -40.3086],
  "INDEPENDENCIA": [-5.3964, -40.3086],
  "IPUEIRAS": [-4.5422, -40.7189],
  "NOVO ORIENTE": [-5.5344, -40.7742],
  "FORTALEZA": [-3.7172, -38.5433],
  "NOVA RUSSAS": [-4.7067, -40.5631],
  "IPU": [-4.3222, -40.7108],
  "TAMBORIL": [-4.8322, -40.3206],
  "IPAPORANGA": [-4.9003, -40.7558],
  "ARARENDÁ": [-4.7514, -40.8358],
  "ARARENDA": [-4.7514, -40.8358],
  "HIDROLÂNDIA": [-4.4078, -40.4378],
  "HIDROLANDIA": [-4.4078, -40.4378],
  "GUARACIABA DO NORTE": [-4.1669, -40.7475],
  "PORANGA": [-4.7450, -40.9256],
  "CATUNDA": [-4.6475, -40.2011],
  "CROATÁ": [-4.4119, -40.9039],
  "CROATA": [-4.4119, -40.9039],
  "SÃO BENEDITO": [-4.0486, -40.8650],
  "SAO BENEDITO": [-4.0486, -40.8650],
  "QUITERIANÓPOLIS": [-5.8428, -40.7008],
  "QUITERIANOPOLIS": [-5.8428, -40.7008],
  "SANTA QUITÉRIA": [-4.3319, -40.1569],
  "SANTA QUITERIA": [-4.3319, -40.1569],
  "MONSENHOR TABOSA": [-4.7928, -40.0639],
  "RERIUTABA": [-4.1417, -40.5822],
  "PEDRA BRANCA": [-5.4542, -39.7172],
  "BURITI DOS MONTES": [-5.3111, -41.0989],
  "CARNAUBAL": [-4.1667, -40.9419],
  "SOBRAL": [-3.6861, -40.3497],
  "CASTELO DO PIAUÍ": [-5.3222, -41.5581],
  "ACOPIARA": [-6.0953, -39.4525],
  "TERESINA": [-5.0892, -42.8019],
  "BOA VIAGEM": [-5.1275, -39.7322],
  "TAUÁ": [-6.0025, -40.2928],
  "TAUA": [-6.0025, -40.2928],
  "PEDRO II": [-4.4247, -41.4586],
  "CAUCAIA": [-3.7361, -38.6531],
  "PARNAÍBA": [-2.9047, -41.7767],
  "VARJOTA": [-4.1939, -40.4764],
  "UBAJARA": [-3.8544, -40.9211],
  "PIRES FERREIRA": [-4.2464, -40.5892],
  "CAMOCIM": [-2.9022, -40.8411],
  "EUSÉBIO": [-3.8900, -38.4506],
  "IBIAPINA": [-3.9233, -40.8894],
};

const CENTRO_PADRAO = [-4.95, -40.45]; 

const TILES_GOOGLE = {
  ruas: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  satelite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
};

export default function RetentionMap({ dados = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});
  const [leafletPronto, setLeafletPronto] = useState(!!window.L);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [modoMapa, setModoMapa] = useState("ruas"); 

  useEffect(() => {
    if (window.L) {
      setLeafletPronto(true);
      return;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletPronto(true);
    document.body.appendChild(script);
  }, []);


  useEffect(() => {
    if (!leafletPronto || !mapContainerRef.current) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current, {
        center: CENTRO_PADRAO,
        zoom: 8,
        scrollWheelZoom: true,
      });

      tileLayerRef.current = L.tileLayer(TILES_GOOGLE[modoMapa], {
        attribution: "&copy; Google Maps",
        maxZoom: 20,
      }).addTo(mapInstanceRef.current);

      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }

    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach((m) => map.removeLayer(m.marker));
    markersRef.current = {};

    dados.forEach((item) => {
      const coords = COORDENADAS[item.key];
      if (!coords) return;

      const critico = item.taxa >= 35;
      const cor = critico ? "#C2413B" : "#005386";
      const raio = Math.min(30, Math.max(8, Math.sqrt(item.total) * 2.3));

      const circle = L.circleMarker(coords, {
        radius: raio,
        fillColor: cor,
        color: "#ffffff",
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: 'Figtree', sans-serif; min-width: 155px;">
          <p style="font-weight: 700; font-size: 13px; color: #111827; margin: 0 0 4px 0;">
            ${item.municipio}
          </p>
          <p style="font-size: 12px; color: #4B5563; margin: 2px 0;">
            Matriculados: <strong>${item.total}</strong>
          </p>
          <p style="font-size: 12px; color: #C2413B; margin: 2px 0;">
            Retidos: <strong>${item.retidos}</strong> (${item.taxa}%)
          </p>
        </div>
      `;

      circle.bindPopup(popupHtml);
      markersRef.current[item.key] = { marker: circle, coords };
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletPronto, dados]);

  // Troca entre Google Mapa de Ruas e Google Satélite
  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(TILES_GOOGLE[modoMapa]);
    }
  }, [modoMapa]);

  const focarCidade = (item) => {
    setCidadeSelecionada(item.key);
    const registro = markersRef.current[item.key];
    if (registro && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(registro.coords, 11, { duration: 0.8 });
      registro.marker.openPopup();
    }
  };

  const resetarVisao = () => {
    setCidadeSelecionada(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(CENTRO_PADRAO, 8, { duration: 0.8 });
      mapInstanceRef.current.closePopup();
    }
  };

  return (
    <section className="rounded-md border border-gray-200 bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-[18px] font-semibold tracking-tight text-gray-900">
            Mapeamento Geográfico da Retenção (Google Maps)
          </h3>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Distribuição regional dos alunos por município de residência e taxa de retenção.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-600 mr-1">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#005386]" />
              {"< 35% retidos"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#C2413B]" />
              {"≥ 35% retidos"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setModoMapa(modoMapa === "ruas" ? "satelite" : "ruas")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Layers size={13} className="text-[#005386]" />
            {modoMapa === "ruas" ? "Ver Satélite" : "Ver Mapa"}
          </button>

          <button
            type="button"
            onClick={resetarVisao}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <RotateCcw size={13} />
            Região de Crateús
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Mapa Interativo com Google Maps */}
        <div className="relative h-[380px] w-full lg:col-span-2">
          <div ref={mapContainerRef} className="h-full w-full z-0" />
        </div>

        {/* Ranking Lateral de Municípios */}
        <div className="flex h-[380px] flex-col border-t border-gray-100 lg:border-t-0 lg:border-l">
          <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Municípios com mais alunos ({dados.length})
          </div>

          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
            {dados.map((item) => {
              const ativo = cidadeSelecionada === item.key;
              const critico = item.taxa >= 35;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => focarCidade(item)}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    ativo ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        size={13}
                        className={critico ? "text-[#C2413B]" : "text-[#005386]"}
                      />
                      <span className="truncate text-sm font-medium text-gray-900">
                        {item.municipio}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.total} cursando • {item.retidos} retidos
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      critico
                        ? "bg-red-50 text-[#C2413B] border border-red-200"
                        : "bg-blue-50 text-[#005386] border border-blue-200"
                    }`}
                  >
                    {item.taxa}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}