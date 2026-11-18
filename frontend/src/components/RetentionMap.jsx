import React, { useEffect, useRef, useState } from "react";
import { MapPin, RotateCcw, Layers, Loader2 } from "lucide-react";


const COORDENADAS_FIXAS = {
  "CRATEUS": [-5.1783, -40.6692],
  "INDEPENDENCIA": [-5.3964, -40.3086],
  "IPUEIRAS": [-4.5422, -40.7189],
  "NOVO ORIENTE": [-5.5344, -40.7742],
  "FORTALEZA": [-3.7172, -38.5433],
  "NOVA RUSSAS": [-4.7067, -40.5631],
  "IPU": [-4.3222, -40.7108],
  "TAMBORIL": [-4.8322, -40.3206],
  "IPAPORANGA": [-4.9003, -40.7558],
  "ARARENDA": [-4.7514, -40.8358],
  "HIDROLANDIA": [-4.4078, -40.4378],
  "GUARACIABA DO NORTE": [-4.1669, -40.7475],
  "PORANGA": [-4.7450, -40.9256],
  "CATUNDA": [-4.6475, -40.2011],
  "CROATA": [-4.4119, -40.9039],
  "SAO BENEDITO": [-4.0486, -40.8650],
  "QUITERIANOPOLIS": [-5.8428, -40.7008],
  "SANTA QUITERIA": [-4.3319, -40.1569],
  "MONSENHOR TABOSA": [-4.7928, -40.0639],
  "RERIUTABA": [-4.1417, -40.5822],
  "PEDRA BRANCA": [-5.4542, -39.7172],
  "BURITI DOS MONTES": [-5.3111, -41.0989],
  "CARNAUBAL": [-4.1667, -40.9419],
  "SOBRAL": [-3.6861, -40.3497],
  "CASTELO DO PIAUI": [-5.3222, -41.5581],
  "ACOPIARA": [-6.0953, -39.4525],
  "TERESINA": [-5.0892, -42.8019],
  "BOA VIAGEM": [-5.1275, -39.7322],
  "TAUA": [-6.0025, -40.2928],
  "PEDRO II": [-4.4247, -41.4586],
  "CAUCAIA": [-3.7361, -38.6531],
  "PARNAIBA": [-2.9047, -41.7767],
  "VARJOTA": [-4.1939, -40.4764],
  "UBAJARA": [-3.8544, -40.9211],
  "PIRES FERREIRA": [-4.2464, -40.5892],
  "CAMOCIM": [-2.9022, -40.8411],
  "EUSEBIO": [-3.8900, -38.4506],
  "IBIAPINA": [-3.9233, -40.8894],
};

const CENTRO_PADRAO = [-4.95, -40.45];
const CACHE_STORAGE_KEY = "retention_map_coords_cache_v1";

const TILES_GOOGLE = {
  ruas: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
  satelite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
};

const normalizarChave = (texto = "") =>
  String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();


const buscarCoordenadaAPI = async (nomeMunicipio) => {
  const tentativas = [
    `${nomeMunicipio}, Ceará, Brasil`,
    `${nomeMunicipio}, Piauí, Brasil`,
    `${nomeMunicipio}, Brasil`,
  ];

  for (const query of tentativas) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1&countrycodes=br`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "pt-BR" },
      });
      if (!res.ok) continue;

      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        return [parseFloat(json[0].lat), parseFloat(json[0].lon)];
      }
    } catch (err) {
      console.warn(`Erro ao geocodificar "${query}":`, err);
    }
  }
  return null;
};

export default function RetentionMap({ dados = [] }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef({});

  const [leafletPronto, setLeafletPronto] = useState(!!window.L);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [modoMapa, setModoMapa] = useState("ruas");
  const [buscandoCidades, setBuscandoCidades] = useState(false);

  const [coordenadas, setCoordenadas] = useState(() => {
    try {
      const salvo = localStorage.getItem(CACHE_STORAGE_KEY);
      const cacheParsed = salvo ? JSON.parse(salvo) : {};
      return { ...COORDENADAS_FIXAS, ...cacheParsed };
    } catch {
      return COORDENADAS_FIXAS;
    }
  });

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
    if (!leafletPronto || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;

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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletPronto]);

  useEffect(() => {
    if (!dados || dados.length === 0) return;
    let cancelado = false;

    const resolverCidadesFaltantes = async () => {
      const faltantes = dados.filter((item) => {
        const chave = normalizarChave(item.key || item.municipio);
        return chave && !coordenadas[chave];
      });

      if (faltantes.length === 0) return;

      setBuscandoCidades(true);
      const novasCoords = {};

      for (const item of faltantes) {
        if (cancelado) break;
        const chave = normalizarChave(item.key || item.municipio);
        const nomeBusca = item.municipio || item.key;

        const resultado = await buscarCoordenadaAPI(nomeBusca);
        if (resultado) {
          novasCoords[chave] = resultado;
        } else {
          console.warn(`Coordenada não encontrada para o município: ${nomeBusca}`);
        }

        await new Promise((r) => setTimeout(r, 1000));
      }

      if (!cancelado && Object.keys(novasCoords).length > 0) {
        setCoordenadas((prev) => {
          const atualizado = { ...prev, ...novasCoords };
          try {
            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(atualizado));
          } catch {

          }
          return atualizado;
        });
      }

      if (!cancelado) setBuscandoCidades(false);
    };

    resolverCidadesFaltantes();

    return () => {
      cancelado = true;
    };
  }, [dados, coordenadas]);

  useEffect(() => {
    if (!leafletPronto || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;


    Object.values(markersRef.current).forEach((m) => map.removeLayer(m.marker));
    markersRef.current = {};

    dados.forEach((item) => {
      const chave = normalizarChave(item.key || item.municipio);
      const coords = coordenadas[chave];
      if (!coords) return;

      const critico = item.taxa >= 35;
      const cor = critico ? "#EF4444" : "#1D4ED8";
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
          <p style="font-size: 12px; color: #EF4444; margin: 2px 0;">
            Retidos: <strong>${item.retidos}</strong> (${item.taxa}%)
          </p>
        </div>
      `;

      circle.bindPopup(popupHtml);
      markersRef.current[chave] = { marker: circle, coords };
    });
  }, [leafletPronto, dados, coordenadas]);

  useEffect(() => {
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(TILES_GOOGLE[modoMapa]);
    }
  }, [modoMapa]);

  const focarCidade = (item) => {
    const chave = normalizarChave(item.key || item.municipio);
    setCidadeSelecionada(chave);

    const registro = markersRef.current[chave];
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
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-semibold tracking-tight text-gray-900">
              Mapeamento Geográfico da Retenção
            </h3>
            {buscandoCidades && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-[#1D4ED8]">
                <Loader2 size={12} className="animate-spin" />
                Localizando municípios...
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Distribuição regional dos alunos por município de residência e taxa de retenção.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-1 flex items-center gap-3 text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1D4ED8]" />
              {"< 35% retidos"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              {"≥ 35% retidos"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setModoMapa(modoMapa === "ruas" ? "satelite" : "ruas")}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Layers size={13} className="text-[#1D4ED8]" />
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
        <div className="relative h-[380px] w-full lg:col-span-2">
          <div ref={mapContainerRef} className="z-0 h-full w-full" />
        </div>

        <div className="flex h-[380px] flex-col border-t border-gray-100 lg:border-t-0 lg:border-l">
          <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Municípios com mais alunos ({dados.length})
          </div>

          <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
            {dados.map((item) => {
              const chave = normalizarChave(item.key || item.municipio);
              const temCoordenada = Boolean(coordenadas[chave]);
              const ativo = cidadeSelecionada === chave;
              const critico = item.taxa >= 35;

              return (
                <button
                  key={item.key || item.municipio}
                  type="button"
                  disabled={!temCoordenada}
                  onClick={() => temCoordenada && focarCidade(item)}
                  title={
                    !temCoordenada
                      ? buscandoCidades
                        ? "Buscando localização..."
                        : "Localização não encontrada"
                      : `Focar em ${item.municipio}`
                  }
                  className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
                    !temCoordenada
                      ? "cursor-not-allowed bg-gray-50/40 opacity-60"
                      : "cursor-pointer hover:bg-gray-50"
                  } ${ativo ? "bg-blue-50/50" : ""}`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin
                        size={13}
                        className={
                          !temCoordenada
                            ? "text-gray-400"
                            : critico
                            ? "text-[#EF4444]"
                            : "text-[#1D4ED8]"
                        }
                      />
                      <span className="truncate text-sm font-medium text-gray-900">
                        {item.municipio}
                      </span>
                      {!temCoordenada && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-gray-500">
                          {buscandoCidades ? "Buscando..." : "Sem mapa"}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {item.total} cursando • {item.retidos} retidos
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      critico
                        ? "border border-red-200 bg-red-50 text-[#EF4444]"
                        : "border border-blue-200 bg-blue-50 text-[#1D4ED8]"
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