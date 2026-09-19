import React, { useState, useEffect, useRef } from 'react';
import { translations, Language } from '../i18n/translations';
import { api } from '../services/api';
import { CitizenReport } from '../types';
import { PlaceSuggestionService, PlaceSuggestion } from '../services/placeSuggestionService';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Mic, 
  MicOff,
  Camera, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck,
  RefreshCw,
  Eye,
  Search,
  ChevronRight,
  Building2,
  Layers,
  Smartphone,
  Navigation,
  ExternalLink,
  Map,
  X,
  Clock,
  Compass,
  FileCheck,
  Plus
} from 'lucide-react';

// Custom Pin Icon for High-Precision Citizen Location Picking
const customCitizenPin = L.divIcon({
  className: 'custom-citizen-pin',
  html: `<div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#059669;border:3px solid #ffffff;border-radius:50%;box-shadow:0 4px 14px rgba(0,0,0,0.45);color:white;cursor:grab;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  zoom?: number;
  onSelect: (lat: number, lng: number) => void;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ lat, lng, zoom = 14, onSelect }) => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.flyTo([lat, lng], zoom, { duration: 0.8 });
    }, 120);
    return () => clearTimeout(timer);
  }, [lat, lng, zoom, map]);

  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  return (
    <Marker
      position={[lat, lng]}
      icon={customCitizenPin}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          onSelect(pos.lat, pos.lng);
        }
      }}
    />
  );
};

interface CitizenPortalProps {
  lang: Language;
  onNavigateToDashboard?: () => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ lang, onNavigateToDashboard }) => {
  const t = translations[lang];

  // Navigation mode
  const [viewMode, setViewMode] = useState<'submit' | 'track'>('submit');

  // Unified issue composer state
  const [reportText, setReportText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Evidence state
  const [hasEvidence, setHasEvidence] = useState(false);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Map & Location state
  const [locationName, setLocationName] = useState('Cholapur Corridor, Varanasi');
  const [lat, setLat] = useState(25.3850);
  const [lng, setLng] = useState(83.0210);
  const [selectedDistrict, setSelectedDistrict] = useState('Varanasi');
  const [mapLayer, setMapLayer] = useState<'google-roads' | 'google-satellite' | 'osm'>('google-roads');
  const [mapZoom, setMapZoom] = useState(14);
  const [isLocating, setIsLocating] = useState(false);

  // Place Autocomplete Suggestions state
  const [placeSearchText, setPlaceSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Contact info state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<CitizenReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Presets visibility toggle
  const [showPresets, setShowPresets] = useState(false);

  // Tracking Mode state
  const [trackingIdInput, setTrackingIdInput] = useState('JNS-522971');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackedReport, setTrackedReport] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const presets = [
    {
      title: lang === 'hi' ? 'सड़क व एम्बुलेंस अवरोध (चोलापुर)' : 'Rural Road & Ambulance Blockage',
      text: lang === 'hi' 
        ? 'हमारे गांव चोलापुर की मुख्य सड़क बारिश में पूरी तरह टूट चुकी है, कीचड़ की वजह से एम्बुलेंस नहीं आ पाती और बच्चे स्कूल नहीं जा पा रहे हैं।'
        : 'Cholapur village main link road is severely flooded and washed away. Ambulances cannot reach patients and school buses are halted.',
      locName: 'Cholapur Corridor, Varanasi',
      district: 'Varanasi',
      lat: 25.3850,
      lng: 83.0210
    },
    {
      title: lang === 'hi' ? 'सीवेज मिला पीने का पानी (पिपराइच)' : 'Sewage Drinking Water Infiltration',
      text: lang === 'hi'
        ? 'पिपराइच वार्ड 4 में पीने के पानी की पाइपलाइन में सीवेज का गंदा पानी मिल रहा है, 200 से अधिक लोग डायरिया से पीड़ित हैं तुरंत सुधार चाहिए।'
        : 'Pipraich Ward 4 drinking water pipe is infiltrated with open sewage. Over 200 residents have acute diarrhea. Urgent pipeline replacement needed.',
      locName: 'Pipraich Ward 4 & Market, Gorakhpur',
      district: 'Gorakhpur',
      lat: 26.7606,
      lng: 83.3732
    },
    {
      title: lang === 'hi' ? 'खतरनाक 11kV बिजली का तार (लखनऊ)' : 'High-Voltage 11kV Dangerous Wire',
      text: lang === 'hi'
        ? 'मोहनलालगंज में प्राथमिक विद्यालय के पास 11kV हाईटेंशन तार लटक रहे हैं और शाम को चिंगारियां निकलती हैं, बच्चों की जान को भारी खतरा है।'
        : 'Mohanlalganj primary school has loose hanging 11kV high-voltage lines throwing electrical sparks every evening. Extreme life hazard for schoolchildren.',
      locName: 'Mohanlalganj Tehsil, Lucknow',
      district: 'Lucknow',
      lat: 26.8467,
      lng: 80.9462
    },
    {
      title: lang === 'hi' ? 'जलमग्न स्वास्थ्य केंद्र (प्रयागराज)' : 'Flooded Health Center Drainage Failure',
      text: lang === 'hi'
        ? 'करछना प्राथमिक स्वास्थ्य केंद्र (PHC) में बारिश का पानी भर गया है, दवाइयों का कमरा जलमग्न है और डॉक्टर नहीं पहुंच पा रहे हैं।'
        : 'Karchhana Primary Health Center ground floor is inundated due to blocked municipal drainage culvert. Emergency medical supplies are at risk.',
      locName: 'Karchhana Rural Sector, Prayagraj',
      district: 'Prayagraj',
      lat: 25.4358,
      lng: 81.8463
    }
  ];

  // Close place suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = true;
      recognizer.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognizer.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setReportText(currentTranscript);
      };

      recognizer.onerror = (e: any) => {
        console.warn('Speech recognition notice:', e);
        setIsRecording(false);
      };

      recognizer.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognizer;
    }
  }, [lang]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(lang === 'hi' 
        ? 'इस ब्राउज़र में वॉइस टाइपिंग समर्थित नहीं है। आप सीधे लिख सकते हैं!' 
        : 'Speech recognition is not supported on this browser. You can type directly!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Place Autocomplete Handler
  const handleSearchInput = (value: string) => {
    setPlaceSearchText(value);
    if (value.trim().length > 0) {
      const results = PlaceSuggestionService.getSuggestions(value, 6);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions(PlaceSuggestionService.getSuggestions('', 5));
      setShowSuggestions(true);
    }
  };

  const handleSelectPlace = (place: PlaceSuggestion) => {
    setLocationName(`${place.name}, ${place.district}`);
    setLat(place.lat);
    setLng(place.lng);
    setSelectedDistrict(place.district);
    setPlaceSearchText(place.name);
    setMapZoom(15);
    setShowSuggestions(false);
  };

  // Map pin drag and click handler
  const handleMapLocationSelect = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    const nearest = PlaceSuggestionService.findNearestLocality(newLat, newLng);
    if (nearest) {
      setLocationName(`${nearest.name}, ${nearest.district}`);
      setSelectedDistrict(nearest.district);
      setPlaceSearchText(nearest.name);
    } else {
      setLocationName(`Geotag (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'hi' ? 'आपका ब्राउज़र जियोलोकेशन समर्थित नहीं करता।' : 'Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setMapZoom(16);

        const nearest = PlaceSuggestionService.findNearestLocality(userLat, userLng);
        if (nearest) {
          setLocationName(`${nearest.name}, ${nearest.district}`);
          setSelectedDistrict(nearest.district);
          setPlaceSearchText(nearest.name);
        } else {
          setLocationName(`GPS Coordinates (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`);
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert(lang === 'hi' 
          ? 'स्थान प्राप्त नहीं हो सका। कृपया मानचित्र पर क्लिक करके स्थान चुनें।' 
          : 'Could not fetch GPS. Please select location on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHasEvidence(true);
      const url = URL.createObjectURL(file);
      setEvidencePreview(url);
    }
  };

  const removeEvidence = () => {
    setHasEvidence(false);
    setEvidencePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) {
      setErrorMsg(lang === 'hi' 
        ? 'कृपया समस्या का विवरण लिखें या माइक से बोलें।' 
        : 'Please provide a description of the issue or speak using the microphone.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.submitReport({
        original_text: reportText,
        original_language: lang === 'hi' ? 'Hindi' : 'English',
        latitude: lat,
        longitude: lng,
        location_name: locationName,
        evidence_type: hasEvidence ? 'Image' : 'None',
        evidence_url: evidencePreview || undefined,
        contact_name: contactName || undefined,
        contact_phone: contactPhone || undefined,
      });

      setSubmissionResult(res);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to submit report. Please check connection and try again.');
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (idToTrack?: string) => {
    const id = (idToTrack || trackingIdInput).trim();
    if (!id) return;
    setTrackingLoading(true);
    setTrackingError(null);
    try {
      const data = await api.trackReportStatus(id);
      setTrackedReport(data);
    } catch (err: any) {
      setTrackingError(err.message || 'Report not found. Please check tracking ID.');
      setTrackedReport(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const resetForm = () => {
    setReportText('');
    setSubmissionResult(null);
    setHasEvidence(false);
    setEvidencePreview(null);
    setErrorMsg(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'road': return '🛣️';
      case 'water': return '🚰';
      case 'healthcare': return '🏥';
      case 'village': return '🏡';
      default: return '🏛️';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-3 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>JanSetu Citizen Services • जनसेतु नागरिक सेवा</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>

        {/* View Mode Toggle: Submit vs Track */}
        <div className="flex justify-center">
          <div className="bg-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-inner border border-slate-300/80">
            <button
              type="button"
              onClick={() => setViewMode('submit')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'submit'
                  ? 'bg-white text-emerald-800 shadow-md ring-1 ring-emerald-400/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-4 h-4 text-emerald-600" />
              {t.reportProblem}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('track');
                if (!trackedReport) handleTrack('JNS-522971');
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'track'
                  ? 'bg-white text-blue-800 shadow-md ring-1 ring-blue-400/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4 text-blue-600" />
              {t.trackReport}
            </button>
          </div>
        </div>

        {/* ===================== VIEW MODE 1: TRACK REPORT ===================== */}
        {viewMode === 'track' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {t.enterTrackingId}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={trackingIdInput}
                    onChange={(e) => setTrackingIdInput(e.target.value)}
                    placeholder="JNS-XXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono uppercase bg-white text-slate-900"
                  />
                </div>
                <button
                  onClick={() => handleTrack()}
                  disabled={trackingLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition flex items-center gap-2 shadow-md shadow-blue-700/20 cursor-pointer disabled:opacity-50"
                >
                  {trackingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {t.trackBtn}
                </button>
              </div>

              {/* Demo IDs */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400">{t.recentDemoIds}:</span>
                {['JNS-522971', 'JNS-LIVE-78326', 'JNS-LIVE-15263'].map((demoId) => (
                  <button
                    key={demoId}
                    type="button"
                    onClick={() => {
                      setTrackingIdInput(demoId);
                      handleTrack(demoId);
                    }}
                    className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition cursor-pointer"
                  >
                    {demoId}
                  </button>
                ))}
              </div>
            </div>

            {trackingError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {trackedReport && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-extrabold text-blue-700">{trackedReport.tracking_id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {trackedReport.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {trackedReport.location_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold">
                      {trackedReport.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                      Severity: {trackedReport.severity}/10
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 italic">
                  "{trackedReport.original_text}"
                </div>

                {trackedReport.cluster && (
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                        <Layers className="w-4 h-4 text-amber-600" />
                        Aggregated Hotspot: {trackedReport.cluster.cluster_code}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 text-xs font-bold font-mono">
                        Priority: {trackedReport.cluster.priority_score} / 100
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{trackedReport.cluster.title}</h4>
                    <p className="text-xs text-slate-600 mb-2">
                      Consolidated <strong>{trackedReport.cluster.report_count} citizen complaints</strong> representing <strong>~{trackedReport.cluster.estimated_population?.toLocaleString()} residents</strong> in {trackedReport.cluster.district}.
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>SMS / WhatsApp Tracking Active:</strong> Updates on administrative progress are dispatched automatically to registered locality residents.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW MODE 2: SUBMIT REPORT ===================== */}
        {viewMode === 'submit' && (
          <>
            {submissionResult ? (
              <div className="bg-white rounded-2xl border border-emerald-200 p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.reportSubmittedTitle}</h2>
                    <p className="text-xs text-slate-500">
                      {t.trackingNumber}: <span className="font-mono font-bold text-emerald-700">{submissionResult.tracking_id}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-xs">{t.category}:</span>
                    <span className="font-bold text-slate-900">{submissionResult.category}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-xs">{t.severity}:</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-xs">
                      {submissionResult.severity} / 10
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 text-xs">{t.affectedServices}:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {submissionResult.affected_services.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-xs">{t.location}:</span>
                    <span className="text-slate-800 text-xs font-medium">{submissionResult.location_name}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      setTrackingIdInput(submissionResult.tracking_id);
                      setViewMode('track');
                      handleTrack(submissionResult.tracking_id);
                    }}
                    className="w-full sm:w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {lang === 'hi' ? 'रिपोर्ट लाइव ट्रैक करें' : 'Track Status in Real-Time'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="w-full sm:w-1/2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
                  >
                    {t.submitAnother}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Quick Presets Bar (Collapsible / Compact) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2.5">
                    <button
                      type="button"
                      onClick={() => setShowPresets(!showPresets)}
                      className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'hi' ? 'त्वरित उदाहरण (1-क्लिक प्रीसेट्स)' : 'Quick Issue Examples (1-Click Fill)'}</span>
                      <span className="text-[10px] text-slate-400 underline ml-1">
                        {showPresets ? (lang === 'hi' ? '[छुपाएं]' : '[Hide]') : (lang === 'hi' ? '[दिखाएं]' : '[Show]')}
                      </span>
                    </button>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      AI Categorized
                    </span>
                  </div>

                  {showPresets && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fade-in">
                      {presets.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setReportText(p.text);
                            setLocationName(p.locName);
                            setSelectedDistrict(p.district);
                            setLat(p.lat);
                            setLng(p.lng);
                            setMapZoom(15);
                            setShowPresets(false);
                          }}
                          className="text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 text-xs text-slate-800 transition cursor-pointer flex flex-col justify-between group"
                        >
                          <span className="font-semibold text-slate-900 group-hover:text-emerald-800">{p.title}</span>
                          <span className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                            {p.locName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Unified Report Composer (Text + Speech Dictation + Evidence Upload) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      {lang === 'hi' ? 'समस्या का विवरण (बोलें या लिखें)' : 'Issue Description (Type or Speak)'}
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {reportText.length} characters
                    </span>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={4}
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder={lang === 'hi'
                        ? 'अपनी समस्या विस्तार से लिखें, जैसे: टूटी हुई सड़क, पाइपलाइन रिसाव, जलभराव, लटकते बिजली के तार...'
                        : 'Describe your grievance in detail: e.g. damaged culvert, broken drinking water pipe, open sewage flood, hanging 11kV wires...'}
                      className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-900 placeholder:text-slate-400 resize-none transition bg-white"
                    />

                    {isRecording && (
                      <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                        <span>{lang === 'hi' ? 'माइक सक्रिय है... बोलिए' : 'Listening... speak now'}</span>
                      </div>
                    )}
                  </div>

                  {/* Composer Action Toolbar (Mic + Camera in one row) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Speech Recognition Button */}
                      <button
                        type="button"
                        onClick={toggleRecording}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isRecording 
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                        title="Speak to dictate in Hindi or English"
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                        <span>{isRecording ? (lang === 'hi' ? 'बोलना बंद करें' : 'Stop Recording') : (lang === 'hi' ? 'माइक से बोलें' : 'Voice Dictate')}</span>
                      </button>

                      {/* Photo Attachment Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                        title="Upload photograph of damaged infrastructure"
                      >
                        <Camera className="w-4 h-4 text-slate-600" />
                        <span>{lang === 'hi' ? 'फोटो संलग्न करें' : 'Attach Photo'}</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Supports English & हिन्दी
                    </span>
                  </div>

                  {/* Attached Evidence Preview */}
                  {evidencePreview && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={evidencePreview} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-emerald-300 shadow-sm" />
                        <div>
                          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {lang === 'hi' ? 'फोटो प्रमाण संलग्न है' : 'Photo Evidence Attached'}
                          </div>
                          <span className="text-[10px] text-slate-500">Ready for AI Vision Defect Extraction</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeEvidence}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Location & Google Map with Type-Ahead Place Suggestions */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        {lang === 'hi' ? 'सटीक स्थान चयन व गूगल मैप्स' : 'Location & Google Map Pinpoint'}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {lang === 'hi' ? 'नाम टाइप करें या मैप पर सीधे पिन लगाएं' : 'Type locality name or click on map for sub-meter accuracy'}
                      </p>
                    </div>

                    {/* Google Map Layer Switcher & External Link */}
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setMapLayer('google-roads')}
                          className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                            mapLayer === 'google-roads' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Official Google Roadmap"
                        >
                          🗺️ Google Maps
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapLayer('google-satellite')}
                          className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                            mapLayer === 'google-satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="Google Satellite Hybrid"
                        >
                          🛰️ Satellite
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapLayer('osm')}
                          className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                            mapLayer === 'osm' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                          title="OpenStreetMap"
                        >
                          🌐 OSM
                        </button>
                      </div>

                      {/* View in Google Maps External Link */}
                      <a
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                        title="Open this location in Google Maps app"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Google Maps</span>
                      </a>
                    </div>
                  </div>

                  {/* Search Place with Autocomplete Dropdown */}
                  <div ref={searchContainerRef} className="relative">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {lang === 'hi' ? 'स्थान / गांव / वार्ड का नाम खोजें:' : 'Search Locality, Ward, Road, or Landmark:'}
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={placeSearchText || locationName}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => handleSearchInput(placeSearchText)}
                        placeholder={lang === 'hi' ? 'उदा. सिगरा, दशाश्वमेध, पिपराइच, सिविल लाइंस...' : 'Type locality (e.g. Sigra, Pipraich, Civil Lines, Danapur)...'}
                        className="w-full pl-10 pr-24 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-900 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleUseLocation}
                        disabled={isLocating}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold transition cursor-pointer disabled:opacity-50"
                        title="Use device GPS location"
                      >
                        <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                        <span>{isLocating ? 'GPS...' : 'GPS'}</span>
                      </button>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                        <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                          Suggested Localities & Wards ({suggestions.length})
                        </div>
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleSelectPlace(item)}
                            className="p-3 hover:bg-emerald-50/70 transition cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-base">{getTypeIcon(item.type)}</span>
                              <div>
                                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 flex items-center gap-1.5">
                                  <span>{item.name}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                    {item.district}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-emerald-700 shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
                              Select &rarr;
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* District Quick Select Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">Districts:</span>
                    {[
                      { name: 'Varanasi', label: 'Varanasi', lat: 25.3176, lng: 82.9739, loc: 'Sigra & Chowk, Varanasi' },
                      { name: 'Gorakhpur', label: 'Gorakhpur', lat: 26.7606, lng: 83.3732, loc: 'Pipraich & Golghar, Gorakhpur' },
                      { name: 'Prayagraj', label: 'Prayagraj', lat: 25.4358, lng: 81.8463, loc: 'Civil Lines & Karchhana, Prayagraj' },
                      { name: 'Patna', label: 'Patna', lat: 25.5941, lng: 85.1376, loc: 'Danapur & Boring Rd, Patna' },
                      { name: 'Ranchi', label: 'Ranchi', lat: 23.3441, lng: 85.3096, loc: 'Kanke & Morabadi, Ranchi' },
                      { name: 'Lucknow', label: 'Lucknow', lat: 26.8467, lng: 80.9462, loc: 'Mohanlalganj, Lucknow' }
                    ].map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => {
                          setLat(d.lat);
                          setLng(d.lng);
                          setSelectedDistrict(d.name);
                          setLocationName(d.loc);
                          setPlaceSearchText(d.name);
                          setMapZoom(13);
                        }}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                          selectedDistrict === d.name
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Google Map Container */}
                  <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-md h-[270px] relative z-0">
                    <MapContainer
                      center={[lat, lng]}
                      zoom={mapZoom}
                      maxZoom={20}
                      style={{ height: '100%', width: '100%' }}
                    >
                      {mapLayer === 'google-roads' && (
                        <TileLayer
                          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
                          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                          maxZoom={20}
                        />
                      )}
                      {mapLayer === 'google-satellite' && (
                        <TileLayer
                          attribution='&copy; <a href="https://maps.google.com">Google Maps Satellite</a>'
                          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                          maxZoom={20}
                        />
                      )}
                      {mapLayer === 'osm' && (
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          maxZoom={19}
                        />
                      )}
                      <MapLocationPicker
                        lat={lat}
                        lng={lng}
                        zoom={mapZoom}
                        onSelect={handleMapLocationSelect}
                      />
                    </MapContainer>

                    {/* Coordinates & Google Precision Badge */}
                    <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-mono text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{lat.toFixed(5)}° N, {lng.toFixed(5)}° E</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-sans">
                        Sub-meter Accuracy
                      </span>
                    </div>

                    {/* Hint overlay */}
                    <div className="absolute top-2.5 right-2.5 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-medium shadow pointer-events-none">
                      Drag pin to exact spot
                    </div>
                  </div>
                </div>

                {/* 4. Optional Citizen Notification Details Strip */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lang === 'hi' ? 'नागरिक सूचना (वैकल्पिक - एसएमएस/व्हाट्सएप ट्रैकिंग हेतु)' : 'Citizen Updates (Optional - for SMS / WhatsApp Tracking)'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder={lang === 'hi' ? 'आपका नाम (वैकल्पिक)' : 'Your Name (Optional)'}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">
                    {t.anonymousNotice}
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Primary CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t.submitReport}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
