'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft, X, Check, Loader2 } from 'lucide-react';

interface Location {
  slug: string;
  name: string;
  lgas?: string[];
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stateId: number, stateName: string, lga: string, fullLocation: string) => void;
  selectedStateId?: number | null;
  selectedLga?: string | null;
  selectedFullLocation?: string | null;
}

const nigeriaLocations: Location[] = [
  { slug: 'abia', name: 'Abia', lgas: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Mbaise', 'Ngor Okpala', 'Ohafia', 'Osisioma', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'] },
  { slug: 'abuja', name: 'Abuja', lgas: ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council'] },
  { slug: 'adamawa', name: 'Adamawa', lgas: ['Demsa', 'Fufore', 'Ganye', 'Girei', 'Gombi', 'Hong', 'Jada', 'Larmurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola'] },
  { slug: 'akwa-ibom', name: 'Akwa Ibom', lgas: ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat Enin', 'Nsit Atai', 'Nsit Ibom', 'Nsit Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Ukanafun', 'Udung Uko', 'Uyo'] },
  { slug: 'anambra', name: 'Anambra', lgas: ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'] },
  { slug: 'bauchi', name: 'Bauchi', lgas: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darako', 'Doguwa', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'] },
  { slug: 'bayelsa', name: 'Bayelsa', lgas: ['Brass', 'Ekeremor', 'Kolokuma Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'] },
  { slug: 'benue', name: 'Benue', lgas: ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'] },
  { slug: 'borno', name: 'Borno', lgas: ['Abadam', 'Askira Uba', 'Bama', 'Bayo', 'Birom', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Huye', 'Jere', 'Kaga', 'Kala Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'] },
  { slug: 'cross-river', name: 'Cross River', lgas: ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakurr', 'Yala'] },
  { slug: 'delta', name: 'Delta', lgas: ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'] },
  { slug: 'ebonyi', name: 'Ebonyi', lgas: ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', ' Ivo', 'Ohaozara', 'Ohaukwu', 'Onicha'] },
  { slug: 'edo', name: 'Edo', lgas: ['Agenebode', 'Akoko-Edo', 'Egor', 'Esan Central', 'Esan North East', 'Esan South East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oredo', 'Orhionmwon', 'Ovia North East', 'Ovia South West', 'Owan East', 'Owan West', 'Uhunmwonde'] },
  { slug: 'ekiti', name: 'Ekiti', lgas: ['Ado Ekiti', 'Aiyekire', 'Efon', 'Ekiti East', 'Ekiti South West', 'Ekiti West', 'Emure', 'Ido Osi', 'Igbara Oke', 'Ijeru', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun', 'Ise Orun', 'Moba', 'Oye'] },
  { slug: 'enugu', name: 'Enugu', lgas: ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi Agwu'] },
  { slug: 'gombe', name: 'Gombe', lgas: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu Deba'] },
  { slug: 'imo', name: 'Imo', lgas: ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezeagbogwu', 'Ideato North', 'Ideato South', 'Ihitte Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Obowo', 'Oguta', 'Ohaji Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West'] },
  { slug: 'jigawa', name: 'Jigawa', lgas: ['Auyo', 'Babura', 'Birnin Kudu', 'Birniwa', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasamma', 'Kiyawa', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sagu', 'Sule Tankarkar', 'Yankwashi'] },
  { slug: 'kaduna', name: 'Kaduna', lgas: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'] },
  { slug: 'kano', name: 'Kano', lgas: ['Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Wudil'] },
  { slug: 'katsina', name: 'Katsina', lgas: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandife', 'Dankama', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'] },
  { slug: 'kebbi', name: 'Kebbi', lgas: ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu Danko', 'Yauri', 'Zuru'] },
  { slug: 'kogi', name: 'Kogi', lgas: ['Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba Bunu', 'Kogi', 'Lokoja', 'Mopamuro', 'Ofu', 'Ogori Mangongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'] },
  { slug: 'kwara', name: 'Kwara', lgas: ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'] },
  { slug: 'lagos', name: 'Lagos', lgas: ['Agege', 'Ajeromi Ifelodun', 'Alimosho', 'Amuwo Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju Lekki', 'Ifako Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi Isolo', 'Shomolu', 'Surulere'] },
  { slug: 'nasarawa', name: 'Nasarawa', lgas: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Eggon', 'Obi', 'Toto', 'Wamba'] },
  { slug: 'niger', name: 'Niger', lgas: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'] },
  { slug: 'ogun', name: 'Ogun', lgas: ['Abeokuta North', 'Abeokuta South', 'Ado Odo Ota', 'Ewekoro', 'Ibadan North', 'Ibadan South West', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Remo South', 'Shagamu', 'Yewa North', 'Yewa South'] },
  { slug: 'ondo', name: 'Ondo', lgas: ['Akoko North East', 'Akoko North West', 'Akoko South East', 'Akoko South West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji Okeigbo', 'Irele', 'Odigbo', 'Okeigbo', 'Okitipupa', 'Ondo', 'Ondo West', 'Ose', 'Owo'] },
  { slug: 'osun', name: 'Osun', lgas: ['Aiyedaade', 'Aiyegunle', 'Atakunmosa East', 'Atakunmosa West', 'Atela', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ilesha East', 'Ilesha West', 'Ilorin East', 'Ilorin West', 'Irepodun', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'] },
  { slug: 'oyo', name: 'Oyo', lgas: ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North East', 'Ibadan North West', 'Ibadan South East', 'Ibadan South West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyade', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere'] },
  { slug: 'plateau', name: 'Plateau', lgas: ['Barkin Ladi', 'Bassa', 'Bukuru', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'] },
  { slug: 'rivers', name: 'Rivers', lgas: ['Abua Odual', 'Ahoada East', 'Ahoada West', 'Akuku Toru', 'Andoni', 'Asari Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio Akpor', 'Ogba Egbema Ndoni', 'Ogoni', 'Okrika', 'Omuma', 'Opobo Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'] },
  { slug: 'sokoto', name: 'Sokoto', lgas: ['Binji', 'Bodinga', 'Dange', 'Gada', 'Goronyo', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'] },
  { slug: 'taraba', name: 'Taraba', lgas: ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karaye', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'] },
  { slug: 'yobe', name: 'Yobe', lgas: ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Kafin Madaki', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'] },
  { slug: 'zamfara', name: 'Zamfara', lgas: ['Anka', 'Bakura', 'Birnin Magaji Kiyaw', 'Bukkuyum', 'Bungudu', 'Chafe', 'Dangaji', 'Danja', 'Doka', 'Gummi', 'Gusau', 'Kaura Namoda', 'Kiyawa', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi'] },
];

const stateSlugToId: Record<string, number> = {};
nigeriaLocations.forEach((state, index) => {
  stateSlugToId[state.slug] = index + 1;
});

export default function LocationSelector({ isOpen, onClose, onSelect, selectedStateId, selectedLga, selectedFullLocation }: LocationSelectorProps) {
  const [currentLevel, setCurrentLevel] = useState<'state' | 'lga'>('state');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<Location | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setCurrentLevel('state');
      setSelectedState(null);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return nigeriaLocations;
    const query = searchQuery.toLowerCase();
    return nigeriaLocations.filter(state => 
      state.name.toLowerCase().includes(query) ||
      state.lgas?.some(lga => lga.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleStateClick = (state: Location) => {
    if (state.lgas && state.lgas.length > 0) {
      setSelectedState(state);
      setCurrentLevel('lga');
    } else {
      handleSelect(state);
    }
  };

  const handleLgaClick = (lga: string) => {
    if (selectedState) {
      handleSelect(selectedState, lga);
    }
  };

  const handleSelect = (state: Location, lga?: string) => {
    const fullLocation = lga ? `${state.name} > ${lga}` : state.name;
    onSelect(state.slug as any, state.name, lga || '', fullLocation);
    onClose();
  };

  const handleBack = () => {
    setCurrentLevel('state');
    setSelectedState(null);
  };

  const handleClose = () => {
    onClose();
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentLevel === 'lga' && (
                <button 
                  onClick={handleBack}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {currentLevel === 'state' ? 'Select State' : selectedState?.name}
                </h3>
                {selectedFullLocation && currentLevel === 'lga' && (
                  <p className="text-sm text-white/80">{selectedFullLocation}</p>
                )}
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={currentLevel === 'state' ? 'Search states...' : 'Search LGAs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        {currentLevel === 'lga' && selectedState && (
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center gap-2 text-sm">
            <button 
              onClick={handleBack}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              All States
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{selectedState.name}</span>
            {selectedLga && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">{selectedLga}</span>
              </>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {currentLevel === 'state' ? (
            <div className="space-y-1">
              {filteredLocations.map((state) => (
                <button
                  key={state.slug}
                  onClick={() => handleStateClick(state)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                >
                  <span className="font-medium text-gray-900">{state.name}</span>
                  {state.lgas && state.lgas.length > 0 ? (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  ) : (
                    <Check className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Select entire state option */}
              <button
                onClick={() => handleSelect(selectedState!)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left mb-2"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="flex-1 font-medium text-primary-700">All {selectedState?.name}</span>
                <Check className="w-5 h-5 text-primary-600" />
              </button>
              
              <div className="border-t my-2"></div>
              
              <p className="px-4 py-2 text-sm text-gray-500 font-medium">Select LGA</p>
              
              {selectedState?.lgas?.map((lga) => (
                <button
                  key={lga}
                  onClick={() => handleLgaClick(lga)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left ${
                    selectedLga === lga ? 'bg-primary-50 border border-primary-200' : ''
                  }`}
                >
                  <span className="flex-1 font-medium text-gray-900">{lga}</span>
                  {selectedLga === lga && (
                    <Check className="w-5 h-5 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {currentLevel === 'state' 
                ? `${filteredLocations.length} states` 
                : `${selectedState?.lgas?.length || 0} LGAs`
              }
            </span>
            {selectedFullLocation && (
              <span className="text-primary-600 font-medium">{selectedFullLocation}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
