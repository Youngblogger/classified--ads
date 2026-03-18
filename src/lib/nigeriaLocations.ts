export interface NigeriaLocation {
  id: string;
  name: string;
  slug: string;
  lgas?: string[];
}

export const nigeriaLocations: NigeriaLocation[] = [
  {
    id: 'abia',
    name: 'Abia',
    slug: 'abia',
    lgas: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala-Ngwa North', 'Isiala-Ngwa South', 'Isuikwuato', 'Nbaise', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu-Nneochi']
  },
  {
    id: 'adamawa',
    name: 'Adamawa',
    slug: 'adamawa',
    lgas: ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Honga', 'Jada', 'Larmurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South']
  },
  {
    id: 'akwa-ibom',
    name: 'Akwa Ibom',
    slug: 'akwa-ibom',
    lgas: ['Abak', 'Eastern Obolo', 'Eket', 'Esit-Eket', 'Essien Udim', 'Etim-Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo-Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Uruan', 'Obot-Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Ukanafun', 'Udung-Uko', 'Uruan', 'Uyo']
  },
  {
    id: 'anambra',
    name: 'Anambra',
    slug: 'anambra',
    lgas: ['Awka North', 'Awka South', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi']
  },
  {
    id: 'bauchi',
    name: 'Bauchi',
    slug: 'bauchi',
    lgas: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darako', 'Dausu', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas-Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa-Balewa', 'Toro', 'Warji', 'Zaki']
  },
  {
    id: 'bayelsa',
    name: 'Bayelsa',
    slug: 'bayelsa',
    lgas: ['Brass', 'Ekeremor', 'Kolokuma-Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa']
  },
  {
    id: 'benue',
    name: 'Benue',
    slug: 'benue',
    lgas: ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya']
  },
  {
    id: 'borno',
    name: 'Borno',
    slug: 'borno',
    lgas: ['Abadam', 'Askira-Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala-Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani']
  },
  {
    id: 'cross-river',
    name: 'Cross River',
    slug: 'cross-river',
    lgas: ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala']
  },
  {
    id: 'delta',
    name: 'Delta',
    slug: 'delta',
    lgas: ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Delta', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Warri North', 'Warri South', 'Warri South West']
  },
  {
    id: 'ebonyi',
    name: 'Ebonyi',
    slug: 'ebonyi',
    lgas: ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha']
  },
  {
    id: 'edo',
    name: 'Edo',
    slug: 'edo',
    lgas: ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba-Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Uhunmwonde']
  },
  {
    id: 'ekiti',
    name: 'Ekiti',
    slug: 'ekiti',
    lgas: ['Ado-Ekiti', 'Efon', 'Ekiti-East', 'Ekiti-South-West', 'Ekiti-West', 'Emure', 'Gbonyin', 'Ido-Osi', 'Ijekun', 'Ilorin-East', 'Ilorin-West', 'Irepodun', 'Ise-Orun', 'Oye']
  },
  {
    id: 'enugu',
    name: 'Enugu',
    slug: 'enugu',
    lgas: ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo-Ekiti', 'Igbo-Eze North', 'Igbo-Eze South', 'Isi-Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Orji-River', 'Udenu', 'Udi-Agwu']
  },
  {
    id: 'gombe',
    name: 'Gombe',
    slug: 'gombe',
    lgas: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu-Deba']
  },
  {
    id: 'imo',
    name: 'Imo',
    slug: 'imo',
    lgas: ['Aboh-Mbaise', 'Ahiazu-Mbaise', 'Ehime-Mbano', 'Ezeduma', 'Ideato North', 'Ideato South', 'Ihitte-Uboma', 'Ikeduru', 'Isiala-Mbano', 'Isu', 'Mbaitoli', 'Ngor-Okpala', 'Njaba', 'Nkwerre', 'Obowo', 'Oguta', 'Ohaji-Egbema', 'Okigwe', 'Onuimo', 'Orlu', 'Orsu', 'Oru-East', 'Oru-West', 'Owerri-Municipal', 'Owerri North', 'Owerri West']
  },
  {
    id: 'jigawa',
    name: 'Jigawa',
    slug: 'jigawa',
    lgas: ['Auyo', 'Babura', 'Birnin-Kudu', 'Birniwa', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin-Madaki', 'Kaugama', 'Kazaure', 'Kiri-Kasamma', 'Kiyawa', 'Kokin-Hausa', 'Maigatari', 'Malam-Madori', 'Miga', 'Ringim', 'Roni', 'Sule-Tankarkar', 'Taura', 'Yankwashi']
  },
  {
    id: 'kaduna',
    name: 'Kaduna',
    slug: 'kaduna',
    lgas: ['Birnin-Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kudan', 'Lere', 'Makarfi', 'Sabon-Gari', 'Sanga', 'Soba', 'Zangon-Kataf', 'Zaria']
  },
  {
    id: 'kano',
    name: 'Kano',
    slug: 'kano',
    lgas: ['Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin-Kudu', 'Dawakin-Tofa', 'Doguwa', 'Fagge', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin-Gado', 'Ringim', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun-Wada', 'Ungogo', 'Warawa', 'Wudil']
  },
  {
    id: 'katsina',
    name: 'Katsina',
    slug: 'katsina',
    lgas: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan-Musa', 'Daura', 'Dutsi', 'Dutsin-Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai\'adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango']
  },
  {
    id: 'kebbi',
    name: 'Kebbi',
    slug: 'kebbi',
    lgas: ['Aleiro', 'Arewa-Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin-Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko-Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu-Danko', 'Yauri', 'Zuru']
  },
  {
    id: 'kogi',
    name: 'Kogi',
    slug: 'kogi',
    lgas: ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba-Bunu', 'Kogi', 'Lokoja', 'Mopamuro', 'Ofu', 'Ogori-Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West']
  },
  {
    id: 'kwara',
    name: 'Kwara',
    slug: 'kwara',
    lgas: ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke-Ero', 'Oyun', 'Pategi']
  },
  {
    id: 'lagos',
    name: 'Lagos',
    slug: 'lagos',
    lgas: ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere']
  },
  {
    id: 'nasarawa',
    name: 'Nasarawa',
    slug: 'nasarawa',
    lgas: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa-Eggon', 'Obi', 'Toto', 'Wamba']
  },
  {
    id: 'niger',
    name: 'Niger',
    slug: 'niger',
    lgas: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi']
  },
  {
    id: 'ogun',
    name: 'Ogun',
    slug: 'ogun',
    lgas: ['Abeokuta North', 'Abeokuta South', 'Ado-Odo-Ota', 'Ewekoro', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ifo', 'Ijebu-East', 'Ijebu-North', 'Ijebu-North-East', 'Ijebu-Ode', 'Ikenne', 'Imeko-Afon', 'Ipokia', 'Obafemi-Owode', 'Odeda', 'Odogbolu', 'Ogun-Waterside', 'Remo North', 'Remo South', 'Sagamu']
  },
  {
    id: 'ondo',
    name: 'Ondo',
    slug: 'ondo',
    lgas: ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Odigbo', 'Okeigbo', 'Okitipupa', 'Ondo', 'Ondo East', 'Ose', 'Owo']
  },
  {
    id: 'osun',
    name: 'Osun',
    slug: 'osun',
    lgas: ['Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyegunle', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo-Otin', 'Ola-Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo']
  },
  {
    id: 'oyo',
    name: 'Oyo',
    slug: 'oyo',
    lgas: ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itisi', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo-Oluwa', 'Olorunsogo', 'Oluyole', 'Ona-Ara', 'Oorelope', 'Oyos', 'Saki East', 'Saki West', 'Surulere']
  },
  {
    id: 'plateau',
    name: 'Plateau',
    slug: 'plateau',
    lgas: ['Barkin-Ladi', 'Bassa', 'Bokkos', 'Jos-East', 'Jos-North', 'Jos-South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua\'an-Pan', 'Riyom', 'Shendam', 'Wase']
  },
  {
    id: 'rivers',
    name: 'Rivers',
    slug: 'rivers',
    lgas: ['Akuku-Toru', 'Asari-Toru', 'Bonny', 'Degema', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio-Akpor', 'Ogba-Egbema-Ndoni', 'Ogu-Bolo', 'Okrika', 'Omuma', 'Opobo-Nkoro', 'Port Harcourt', 'Tai']
  },
  {
    id: 'sokoto',
    name: 'Sokoto',
    slug: 'sokoto',
    lgas: ['Bodinga', 'Dange-Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabo', 'Sabon-Birni', 'Shagari', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo']
  },
  {
    id: 'taraba',
    name: 'Taraba',
    slug: 'taraba',
    lgas: ['Ardo-Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karaye', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Zing']
  },
  {
    id: 'yobe',
    name: 'Yobe',
    slug: 'yobe',
    lgas: ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yusufari']
  },
  {
    id: 'zamfara',
    name: 'Zamfara',
    slug: 'zamfara',
    lgas: ['Anka', 'Bakura', 'Birnin-Magaji', 'Bukkuyum', 'Bungudu', 'Chafe', 'Gummi', 'Gusau', 'Kaura-Namoda', 'Kiyawa', 'Maradun', 'Maru', 'Shinkafi', 'Talata-Mafara', 'Zurmi']
  },
  {
    id: 'fct',
    name: 'Federal Capital Territory (Abuja)',
    slug: 'fct',
    lgas: ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali']
  }
];

export const getLocationBySlug = (slug: string): NigeriaLocation | undefined => {
  return nigeriaLocations.find(loc => loc.slug === slug);
};

export const getLGAByState = (stateSlug: string): string[] | undefined => {
  const state = getLocationBySlug(stateSlug);
  return state?.lgas;
};
