/**
 * JanSetu Place Suggestion & Geocoding Service
 * Provides instant type-ahead place name suggestions according to word/prefix typed,
 * locality type classification, and reverse geocoding.
 */

export interface PlaceSuggestion {
  id: string;
  name: string;
  district: string;
  state: string;
  type: 'landmark' | 'road' | 'village' | 'healthcare' | 'water';
  typeLabel: string;
  lat: number;
  lng: number;
  description?: string;
}

// Curated high-precision locality database across core administrative districts
export const LOCALITY_DATABASE: PlaceSuggestion[] = [
  // --- VARANASI (काशी / बनारस) ---
  {
    id: 'vns-01',
    name: 'Cholapur Corridor',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'Rural Highway Corridor',
    lat: 25.3850,
    lng: 83.0210,
    description: 'Key rural arterial route connecting Harahua & Phulpur'
  },
  {
    id: 'vns-02',
    name: 'Harahua Block',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'village',
    typeLabel: 'Gram Panchayat & Village Cluster',
    lat: 25.3980,
    lng: 82.9550,
    description: 'Dense rural residential sector, Babatpur airport corridor'
  },
  {
    id: 'vns-03',
    name: 'Dashashwamedh Ghat & Chowk',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Heritage Municipal Ward',
    lat: 25.3076,
    lng: 83.0107,
    description: 'Central cultural & civic corridor along river Ganga'
  },
  {
    id: 'vns-04',
    name: 'Sigra & Vidyapeeth Road',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Urban Commercial Ward',
    lat: 25.3180,
    lng: 82.9860,
    description: 'Municipal transit junction and civic complex'
  },
  {
    id: 'vns-05',
    name: 'BHU Lanka Sector',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'healthcare',
    typeLabel: 'Healthcare & University Hub',
    lat: 25.2798,
    lng: 82.9995,
    description: 'Sir Sunderlal Hospital, IMS BHU and surrounding residential wards'
  },
  {
    id: 'vns-06',
    name: 'Pandeypur & Orderly Bazar',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'water',
    typeLabel: 'Urban Ward & Drainage Sector',
    lat: 25.3420,
    lng: 82.9980,
    description: 'Major stormwater drainage basin in northern Varanasi'
  },
  {
    id: 'vns-07',
    name: 'Sarnath Heritage Zone',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Archaeological & Tourism Ward',
    lat: 25.3811,
    lng: 83.0214,
    description: 'UNESCO tentative site and suburban residential blocks'
  },
  {
    id: 'vns-08',
    name: 'Shivpur Industrial Area',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'Industrial & Freight Corridor',
    lat: 25.3612,
    lng: 82.9645,
    description: 'Heavy transport logistics corridor on NH-31'
  },
  {
    id: 'vns-09',
    name: 'Ramnagar Fort & Industrial Estate',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'village',
    typeLabel: 'Suburban Municipal Board',
    lat: 25.2685,
    lng: 83.0285,
    description: 'Eastern bank municipal ward and industrial hub'
  },
  {
    id: 'vns-10',
    name: 'Babatpur Airport Road',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'State Highway Corridor',
    lat: 25.4490,
    lng: 82.8590,
    description: 'Airport express highway and peripheral villages'
  },

  // --- GORAKHPUR (गोरखपुर) ---
  {
    id: 'gkp-01',
    name: 'Pipraich Ward 4 & Market',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'water',
    typeLabel: 'Drinking Water & Municipal Town',
    lat: 26.7606,
    lng: 83.3732,
    description: 'Nagar Panchayat residential blocks and water supply lines'
  },
  {
    id: 'gkp-02',
    name: 'Gorakhnath Temple Road',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Heritage Civic Ward',
    lat: 26.7865,
    lng: 83.3512,
    description: 'High-density urban residential and commercial street'
  },
  {
    id: 'gkp-03',
    name: 'Golghar City Center',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Central Business District',
    lat: 26.7554,
    lng: 83.3735,
    description: 'Central municipal administrative and commercial core'
  },
  {
    id: 'gkp-04',
    name: 'BRD Medical College & Asuran',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'healthcare',
    typeLabel: 'Tertiary Healthcare Hub',
    lat: 26.7928,
    lng: 83.3915,
    description: 'Regional trauma and encephalitis healthcare emergency center'
  },
  {
    id: 'gkp-05',
    name: 'Mohaddipur Transit Junction',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'Arterial Transport Hub',
    lat: 26.7420,
    lng: 83.3920,
    description: 'East-west logistics corridor connecting Deoria highway'
  },
  {
    id: 'gkp-06',
    name: 'Rapti Nagar Phase 4',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'water',
    typeLabel: 'Stormwater & Drainage Ward',
    lat: 26.7725,
    lng: 83.3640,
    description: 'Low-lying residential basin prone to waterlogging'
  },
  {
    id: 'gkp-07',
    name: 'Sahjanwa Industrial Area',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'village',
    typeLabel: 'Industrial Sub-district',
    lat: 26.7540,
    lng: 83.1890,
    description: 'GIDA industrial sector and manufacturing belt'
  },
  {
    id: 'gkp-08',
    name: 'Taramandal & Ramgarh Taal',
    district: 'Gorakhpur',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Waterfront Development Zone',
    lat: 26.7280,
    lng: 83.3850,
    description: 'Civic lakefront corridor and eco-tourism zone'
  },

  // --- PRAYAGRAJ (प्रयागराज) ---
  {
    id: 'pry-01',
    name: 'Karchhana Rural Sector',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'village',
    typeLabel: 'Rural Block & Primary Health Center',
    lat: 25.4358,
    lng: 81.8463,
    description: 'Trans-Yamuna agricultural tehsil and community health block'
  },
  {
    id: 'pry-02',
    name: 'Civil Lines MG Marg',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Administrative & Commercial Hub',
    lat: 25.4520,
    lng: 81.8340,
    description: 'District collectorate, high court, and municipal secretariat'
  },
  {
    id: 'pry-03',
    name: 'Naini Industrial Corridor',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'Industrial & Rail Freight Corridor',
    lat: 25.3890,
    lng: 81.8690,
    description: 'Heavy industrial zone and Yamuna bridge approach'
  },
  {
    id: 'pry-04',
    name: 'Katra University Ward',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Academic & Civic Ward',
    lat: 25.4600,
    lng: 81.8540,
    description: 'Allahabad University campus and historic residential blocks'
  },
  {
    id: 'pry-05',
    name: 'Sangam Kumbh Mela Grounds',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Ganga-Yamuna Confluence Sector',
    lat: 25.4290,
    lng: 81.8840,
    description: 'National pilgrimage grounds with dynamic pontoon infrastructure'
  },
  {
    id: 'pry-06',
    name: 'Phaphamau Bridge Corridor',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'Northern River Crossing',
    lat: 25.5120,
    lng: 81.8610,
    description: 'Ganga river bridge gateway to Pratapgarh and Lucknow'
  },
  {
    id: 'pry-07',
    name: 'Jhalwa IIIT IT Hub',
    district: 'Prayagraj',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Technology & Housing Ward',
    lat: 25.4310,
    lng: 81.7710,
    description: 'Western educational cluster and growing residential townships'
  },

  // --- PATNA (पटना) ---
  {
    id: 'pat-01',
    name: 'Danapur Cantonment & Station Road',
    district: 'Patna',
    state: 'Bihar',
    type: 'road',
    typeLabel: 'Railway & Defense Corridor',
    lat: 25.5941,
    lng: 85.1376,
    description: 'Suburban railway junction and congested link road'
  },
  {
    id: 'pat-02',
    name: 'Boring Road & Anandpuri',
    district: 'Patna',
    state: 'Bihar',
    type: 'water',
    typeLabel: 'Commercial & Urban Drainage Ward',
    lat: 25.6185,
    lng: 85.1180,
    description: 'High-density commercial avenue with complex drainage bottlenecks'
  },
  {
    id: 'pat-03',
    name: 'Gandhi Maidan & Ashok Rajpath',
    district: 'Patna',
    state: 'Bihar',
    type: 'landmark',
    typeLabel: 'Historic Civic Core',
    lat: 25.6178,
    lng: 85.1435,
    description: 'Central public square, PMCH hospital zone, and riverfront'
  },
  {
    id: 'pat-04',
    name: 'Kankarbagh Colony (Ward 45)',
    district: 'Patna',
    state: 'Bihar',
    type: 'village',
    typeLabel: 'Large Residential Township',
    lat: 25.5980,
    lng: 85.1610,
    description: 'One of Asia’s largest residential colonies with sewer maintenance'
  },
  {
    id: 'pat-05',
    name: 'Patna Medical College (PMCH)',
    district: 'Patna',
    state: 'Bihar',
    type: 'healthcare',
    typeLabel: 'Apex Healthcare Hospital',
    lat: 25.6210,
    lng: 85.1560,
    description: 'Super-specialty medical center serving eastern Uttar Pradesh & Bihar'
  },
  {
    id: 'pat-06',
    name: 'Bailey Road & Saguna More',
    district: 'Patna',
    state: 'Bihar',
    type: 'road',
    typeLabel: 'East-West Expressway',
    lat: 25.6140,
    lng: 85.0680,
    description: 'Major arterial corridor connecting western suburbs to AIIMS'
  },

  // --- RANCHI (रांची) ---
  {
    id: 'ran-01',
    name: 'Kanke Block & Dam Basin',
    district: 'Ranchi',
    state: 'Jharkhand',
    type: 'water',
    typeLabel: 'Water Supply Reservoir & Rural Tehsil',
    lat: 23.3441,
    lng: 85.3096,
    description: 'Primary reservoir watershed supplying drinking water to Ranchi'
  },
  {
    id: 'ran-02',
    name: 'Doranda & Hinoo Bypass',
    district: 'Ranchi',
    state: 'Jharkhand',
    type: 'road',
    typeLabel: 'Airport Highway & Municipal Ward',
    lat: 23.3320,
    lng: 85.3210,
    description: 'Birsa Munda Airport road with high commuter traffic'
  },
  {
    id: 'ran-03',
    name: 'Morabadi Grounds & University',
    district: 'Ranchi',
    state: 'Jharkhand',
    type: 'landmark',
    typeLabel: 'Civic Cultural & Educational Sector',
    lat: 23.3870,
    lng: 85.3340,
    description: 'Public recreation grounds and tribal research institutes'
  },
  {
    id: 'ran-04',
    name: 'RIMS Hospital Bariatu',
    district: 'Ranchi',
    state: 'Jharkhand',
    type: 'healthcare',
    typeLabel: 'Rajendra Institute of Medical Sciences',
    lat: 23.3980,
    lng: 85.3610,
    description: 'Apex state referral hospital and medical emergency corridor'
  },
  {
    id: 'ran-05',
    name: 'Lalpur Chowk & Circular Road',
    district: 'Ranchi',
    state: 'Jharkhand',
    type: 'landmark',
    typeLabel: 'Commercial Core & Market',
    lat: 23.3710,
    lng: 85.3360,
    description: 'Busy commercial junction connecting eastern & northern Ranchi'
  },
  {
    id: 'ran-06',
    name: 'Namkum Industrial Cluster',
    district: 'Ranchi',
    state: 'Jharkhand',
    type: 'village',
    typeLabel: 'Suburban Industrial & Rural Block',
    lat: 23.3270,
    lng: 85.3980,
    description: 'Tatas and defense establishments with rural road interfaces'
  },

  // --- LUCKNOW (लखनऊ) ---
  {
    id: 'lko-01',
    name: 'Mohanlalganj Tehsil',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'village',
    typeLabel: 'Rural Tehsil & Primary School Zone',
    lat: 26.8467,
    lng: 80.9462,
    description: 'Southern agricultural block with PMGSY road connectivity'
  },
  {
    id: 'lko-02',
    name: 'Gomti Nagar Extension',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Planned Urban Sub-City',
    lat: 26.8520,
    lng: 81.0110,
    description: 'Modern residential and commercial IT hub along Shaheed Path'
  },
  {
    id: 'lko-03',
    name: 'Hazratganj Commercial Core',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'landmark',
    typeLabel: 'Historic City Heart',
    lat: 26.8500,
    lng: 80.9450,
    description: 'Legislative assembly, secretariat, and heritage pedestrian arcade'
  },
  {
    id: 'lko-04',
    name: 'Alambagh Bus Terminal & Metro',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'road',
    typeLabel: 'Inter-State Multi-modal Hub',
    lat: 26.8120,
    lng: 80.9010,
    description: 'Interstate transport hub and western gateway on Kanpur road'
  },
  {
    id: 'lko-05',
    name: 'SGPGI Hospital Corridor (Raebareli Rd)',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    type: 'healthcare',
    typeLabel: 'Super-Specialty Medical Zone',
    lat: 26.7580,
    lng: 80.9410,
    description: 'Sanjay Gandhi Postgraduate Institute of Medical Sciences'
  }
];

export class PlaceSuggestionService {
  /**
   * Search places based on user typing (matches words, prefixes, districts, types)
   */
  static getSuggestions(query: string, limit = 6): PlaceSuggestion[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: Return diverse sample across districts
      return LOCALITY_DATABASE.slice(0, limit);
    }

    const words = q.split(/\s+/).filter(Boolean);

    // Score places based on relevance
    const scored = LOCALITY_DATABASE.map((place) => {
      const name = place.name.toLowerCase();
      const dist = place.district.toLowerCase();
      const type = place.typeLabel.toLowerCase();
      const desc = (place.description || '').toLowerCase();

      let score = 0;

      // Exact substring match in name gets highest priority
      if (name.includes(q)) score += 50;
      if (name.startsWith(q)) score += 30;

      // District match
      if (dist.includes(q) || q.includes(dist)) score += 20;

      // Word-by-word token matching
      for (const w of words) {
        if (name.includes(w)) score += 15;
        if (dist.includes(w)) score += 10;
        if (type.includes(w)) score += 8;
        if (desc.includes(w)) score += 4;
      }

      return { place, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.place);
  }

  /**
   * Approximate reverse geocode: find the nearest known locality given lat & lng
   */
  static findNearestLocality(lat: number, lng: number): PlaceSuggestion | null {
    let nearest: PlaceSuggestion | null = null;
    let minDistance = Infinity;

    for (const p of LOCALITY_DATABASE) {
      // Euclidean approximation for small distances
      const dLat = p.lat - lat;
      const dLng = p.lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < minDistance) {
        minDistance = dist;
        nearest = p;
      }
    }

    return nearest;
  }

  /**
   * Returns a friendly formatted place label
   */
  static formatLocation(place: PlaceSuggestion): string {
    return `${place.name}, ${place.district}`;
  }
}
