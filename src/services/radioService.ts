import { Howl } from 'howler';

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  fallbackUrls?: string[];
  logo?: string;
  genre: string;
  language: string;
  country: string;
  bitrate?: number;
  format: string;
}

export interface RadioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentStation: RadioStation | null;
  volume: number;
  error: string | null;
}

class RadioService {
  private howl: Howl | null = null;
  private currentStation: RadioStation | null = null;
  private volume: number = 0.7;
  private listeners: ((state: RadioPlayerState) => void)[] = [];

  // Global radio stations database with location-based support
  private stations: RadioStation[] = [
    // ====== INDIA ======
    {
      id: 'air-fm-gold',
      name: 'AIR FM Gold',
      description: 'All India Radio FM Gold - Hindi Music',
      streamUrl: 'https://stream.zeno.fm/radiocity',
      fallbackUrls: [
        'https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8',
        'https://airfm.stream'
      ],
      genre: 'Hindi Music',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'air-vividh-bharti',
      name: 'Vividh Bharati',
      description: 'All India Radio Vividh Bharati - Hindi Music',
      streamUrl: 'https://stream.zeno.fm/bigfm',
      fallbackUrls: [
        'https://air.pc.cdn.bitgravity.com/air/live/pbaudio003/playlist.m3u8',
        'https://vividhbharati.stream'
      ],
      genre: 'Hindi Music',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'air-urdu',
      name: 'AIR Urdu',
      description: 'All India Radio Urdu Service',
      streamUrl: 'https://stream.zeno.fm/mirchi',
      fallbackUrls: [
        'https://air.pc.cdn.bitgravity.com/air/live/pbaudio004/playlist.m3u8',
        'https://airurdu.stream'
      ],
      genre: 'Urdu Music',
      language: 'Urdu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'air-telugu',
      name: 'AIR Telugu',
      description: 'All India Radio Telugu Service',
      streamUrl: 'https://stream.zeno.fm/redfm',
      fallbackUrls: [
        'https://air.pc.cdn.bitgravity.com/air/live/pbaudio005/playlist.m3u8',
        'https://airtelugu.stream'
      ],
      genre: 'Telugu Music',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'air-telugu-fm',
      name: 'AIR Telugu FM',
      description: 'All India Radio Telugu FM - Telugu Music',
      streamUrl: 'https://stream.zeno.fm/feverfm',
      fallbackUrls: [
        'https://air.pc.cdn.bitgravity.com/air/live/pbaudio006/playlist.m3u8',
        'https://airtelugufm.stream'
      ],
      genre: 'Telugu Music',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'radio-city',
      name: 'Radio City',
      description: 'Radio City - Bollywood Hits',
      streamUrl: 'https://prclive1.listenon.in:9960/stream',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://radio-city.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'radio-city-telugu',
      name: 'Radio City Telugu',
      description: 'Radio City Telugu - Tollywood Hits',
      streamUrl: 'https://stream.zeno.fm/telugufm',
      fallbackUrls: [
        'https://radiocitytelugu.stream',
        'https://radio-city-telugu.stream'
      ],
      genre: 'Tollywood',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'big-fm',
      name: 'Big FM',
      description: 'Big FM - Bollywood Music',
      streamUrl: 'https://bigfmindia.scdn.arkaudio.in/stream/1/',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://bigfm.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'big-fm-telugu',
      name: 'Big FM Telugu',
      description: 'Big FM Telugu - Tollywood Music',
      streamUrl: 'https://stream.zeno.fm/teluguhits',
      fallbackUrls: [
        'https://bigfmtelugu.stream',
        'https://bigfm-telugu.stream'
      ],
      genre: 'Tollywood',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'mirchi',
      name: 'Radio Mirchi',
      description: 'Radio Mirchi - Bollywood & Regional',
      streamUrl: 'https://mirchifm.scdn.arkaudio.in/stream/1/',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://mirchi.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'mirchi-telugu',
      name: 'Radio Mirchi Telugu',
      description: 'Radio Mirchi Telugu - Tollywood Hits',
      streamUrl: 'https://stream.zeno.fm/mirchitelugu',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://mirchi-telugu.stream'
      ],
      genre: 'Tollywood',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'telugu-fm',
      name: 'Telugu FM',
      description: 'Telugu FM - Telugu Music & Tollywood',
      streamUrl: 'https://stream.zeno.fm/telugufm96',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://telugu-fm.stream'
      ],
      genre: 'Tollywood',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'andhra-fm',
      name: 'Andhra FM',
      description: 'Andhra FM - Telugu Music',
      streamUrl: 'https://stream.zeno.fm/andhrafm',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://andhra-fm.stream'
      ],
      genre: 'Telugu Music',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'telugu-classic',
      name: 'Telugu Classic',
      description: 'Telugu Classic Hits - Old Tollywood Songs',
      streamUrl: 'https://stream.zeno.fm/teluguclasic',
      genre: 'Tollywood',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'telugu-devotional',
      name: 'Telugu Devotional',
      description: 'Telugu Devotional & Bhakti Songs',
      streamUrl: 'https://stream.zeno.fm/telugubhakti',
      genre: 'Telugu Music',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'telugu-hits',
      name: 'Telugu Hits',
      description: 'Latest Telugu Movie Songs & Tollywood Hits',
      streamUrl: 'https://stream.zeno.fm/teluguhits',
      genre: 'Tollywood',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'telugu-melody',
      name: 'Telugu Melody',
      description: 'Telugu Melody Songs & Soft Music',
      streamUrl: 'https://stream.zeno.fm/telugumelody',
      genre: 'Telugu Music',
      language: 'Telugu',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'red-fm',
      name: 'Red FM',
      description: 'Red FM - Bollywood Music',
      streamUrl: 'https://redfmindia.scdn.arkaudio.in/stream/1/',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://redfm.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'fever-fm',
      name: 'Fever FM',
      description: 'Fever FM - Bollywood Hits',
      streamUrl: 'https://feverfm.scdn.arkaudio.in/stream/1/',
      fallbackUrls: [
        'https://stream.zeno.fm/0r0xa792kwzuv',
        'https://feverfm.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'sunrise-radio',
      name: 'Sunrise Radio',
      description: 'Sunrise Radio - UK Asian Music',
      streamUrl: 'https://streaming.radio.co/s8b8a0b8b8/listen',
      genre: 'Asian',
      language: 'English',
      country: 'UK',
      bitrate: 128,
      format: 'mp3'
    },
    // Additional working stations with reliable URLs
    {
      id: 'radio-one',
      name: 'Radio One',
      description: 'Radio One - Bollywood Music',
      streamUrl: 'https://stream.zeno.fm/radioone',
      fallbackUrls: [
        'https://radiooneindia.scdn.arkaudio.in/stream/1/',
        'https://radioone.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'hit-95',
      name: 'Hit 95',
      description: 'Hit 95 - Bollywood Hits',
      streamUrl: 'https://stream.zeno.fm/hit95',
      fallbackUrls: [
        'https://hit95.scdn.arkaudio.in/stream/1/',
        'https://hit95.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'my-fm',
      name: 'My FM',
      description: 'My FM - Bollywood Music',
      streamUrl: 'https://stream.zeno.fm/myfm',
      fallbackUrls: [
        'https://myfmindia.scdn.arkaudio.in/stream/1/',
        'https://myfm.stream'
      ],
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'indian-radio-1',
      name: 'Indian Radio 1',
      description: 'Indian Radio 1 - Bollywood Hits',
      streamUrl: 'https://stream.zeno.fm/indianradio1',
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'indian-radio-2',
      name: 'Indian Radio 2',
      description: 'Indian Radio 2 - Bollywood Music',
      streamUrl: 'https://stream.zeno.fm/indianradio2',
      genre: 'Bollywood',
      language: 'Hindi',
      country: 'India',
      bitrate: 128,
      format: 'mp3'
    },
    // ====== GLOBAL STATIONS ======
    {
      id: 'bbc-asian',
      name: 'BBC Asian Network',
      description: 'BBC Asian Network - UK Asian Music',
      streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_asian_network',
      genre: 'Asian',
      language: 'English',
      country: 'United Kingdom',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'bbc-radio-1',
      name: 'BBC Radio 1',
      description: 'BBC Radio 1 - UK Pop Music',
      streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
      genre: 'Pop',
      language: 'English',
      country: 'United Kingdom',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'npr-music',
      name: 'NPR Music',
      description: 'NPR Music - US Public Radio',
      streamUrl: 'https://npr-ice.streamguys1.com/live.mp3',
      genre: 'Public Radio',
      language: 'English',
      country: 'United States',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'triple-j',
      name: 'Triple J',
      description: 'Triple J - Australian Alternative Music',
      streamUrl: 'https://live-radio01.mediahubaustralia.com/2TJW/mp3/',
      genre: 'Alternative',
      language: 'English',
      country: 'Australia',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'france-inter',
      name: 'France Inter',
      description: 'France Inter - French Public Radio',
      streamUrl: 'https://icecast.radiofrance.fr/franceinter-midfi.mp3',
      genre: 'Public Radio',
      language: 'French',
      country: 'France',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'deutschlandfunk',
      name: 'Deutschlandfunk',
      description: 'Deutschlandfunk - German Public Radio',
      streamUrl: 'https://st01.sslstream.dlf.de/dlf/01/128/mp3/stream.mp3',
      genre: 'Public Radio',
      language: 'German',
      country: 'Germany',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'rai-radio-1',
      name: 'RAI Radio 1',
      description: 'RAI Radio 1 - Italian Public Radio',
      streamUrl: 'https://icestreaming.rai.it/1.mp3',
      genre: 'Public Radio',
      language: 'Italian',
      country: 'Italy',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'rtve-radio-1',
      name: 'RTVE Radio 1',
      description: 'RTVE Radio 1 - Spanish Public Radio',
      streamUrl: 'https://radio3.rtveradio.cires21.com/radio3/mp3/icecast.audio',
      genre: 'Public Radio',
      language: 'Spanish',
      country: 'Spain',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'nhk-radio-1',
      name: 'NHK Radio 1',
      description: 'NHK Radio 1 - Japanese Public Radio',
      streamUrl: 'https://nhkradioakr1-i.akamaihd.net/hls/live/512326/1-r1/1-r1-01.m3u8',
      genre: 'Public Radio',
      language: 'Japanese',
      country: 'Japan',
      bitrate: 128,
      format: 'm3u8'
    },
    {
      id: 'kbs-radio-1',
      name: 'KBS Radio 1',
      description: 'KBS Radio 1 - Korean Public Radio',
      streamUrl: 'https://rki-live.kbs.co.kr/live_2fm/playlist.m3u8',
      genre: 'Public Radio',
      language: 'Korean',
      country: 'South Korea',
      bitrate: 128,
      format: 'm3u8'
    },
    {
      id: 'cctv-radio',
      name: 'CCTV Radio',
      description: 'CCTV Radio - Chinese Public Radio',
      streamUrl: 'https://live.cctv.cn/live1/index.m3u8',
      genre: 'Public Radio',
      language: 'Chinese',
      country: 'China',
      bitrate: 128,
      format: 'm3u8'
    },
    {
      id: 'radio-pakistan',
      name: 'Radio Pakistan',
      description: 'Radio Pakistan - Pakistani Public Radio',
      streamUrl: 'https://stream.zeno.fm/radiopakistan',
      genre: 'Public Radio',
      language: 'Urdu',
      country: 'Pakistan',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'bangladesh-betar',
      name: 'Bangladesh Betar',
      description: 'Bangladesh Betar - Bangladeshi Public Radio',
      streamUrl: 'https://stream.zeno.fm/bangladeshbetar',
      genre: 'Public Radio',
      language: 'Bengali',
      country: 'Bangladesh',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'sri-lanka-broadcasting',
      name: 'Sri Lanka Broadcasting',
      description: 'Sri Lanka Broadcasting Corporation',
      streamUrl: 'https://stream.zeno.fm/slbc',
      genre: 'Public Radio',
      language: 'Sinhala',
      country: 'Sri Lanka',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'nepal-radio',
      name: 'Nepal Radio',
      description: 'Nepal Radio - Nepalese Public Radio',
      streamUrl: 'https://stream.zeno.fm/nepalradio',
      genre: 'Public Radio',
      language: 'Nepali',
      country: 'Nepal',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'thai-pbs',
      name: 'Thai PBS',
      description: 'Thai PBS - Thai Public Radio',
      streamUrl: 'https://stream.zeno.fm/thaipbs',
      genre: 'Public Radio',
      language: 'Thai',
      country: 'Thailand',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'vietnam-radio',
      name: 'Vietnam Radio',
      description: 'Vietnam Radio - Vietnamese Public Radio',
      streamUrl: 'https://stream.zeno.fm/vietnamradio',
      genre: 'Public Radio',
      language: 'Vietnamese',
      country: 'Vietnam',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'malaysia-radio',
      name: 'Malaysia Radio',
      description: 'Malaysia Radio - Malaysian Public Radio',
      streamUrl: 'https://stream.zeno.fm/malaysiaradio',
      genre: 'Public Radio',
      language: 'Malay',
      country: 'Malaysia',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'singapore-radio',
      name: 'Singapore Radio',
      description: 'Singapore Radio - Singaporean Public Radio',
      streamUrl: 'https://stream.zeno.fm/singaporeradio',
      genre: 'Public Radio',
      language: 'English',
      country: 'Singapore',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'indonesia-radio',
      name: 'Indonesia Radio',
      description: 'Indonesia Radio - Indonesian Public Radio',
      streamUrl: 'https://stream.zeno.fm/indonesiaradio',
      genre: 'Public Radio',
      language: 'Indonesian',
      country: 'Indonesia',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'philippines-radio',
      name: 'Philippines Radio',
      description: 'Philippines Radio - Filipino Public Radio',
      streamUrl: 'https://stream.zeno.fm/philippinesradio',
      genre: 'Public Radio',
      language: 'Filipino',
      country: 'Philippines',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'brazil-radio',
      name: 'Brazil Radio',
      description: 'Brazil Radio - Brazilian Public Radio',
      streamUrl: 'https://stream.zeno.fm/brazilradio',
      genre: 'Public Radio',
      language: 'Portuguese',
      country: 'Brazil',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'argentina-radio',
      name: 'Argentina Radio',
      description: 'Argentina Radio - Argentine Public Radio',
      streamUrl: 'https://stream.zeno.fm/argentinradio',
      genre: 'Public Radio',
      language: 'Spanish',
      country: 'Argentina',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'mexico-radio',
      name: 'Mexico Radio',
      description: 'Mexico Radio - Mexican Public Radio',
      streamUrl: 'https://stream.zeno.fm/mexicoradio',
      genre: 'Public Radio',
      language: 'Spanish',
      country: 'Mexico',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'south-africa-radio',
      name: 'South Africa Radio',
      description: 'South Africa Radio - South African Public Radio',
      streamUrl: 'https://stream.zeno.fm/southafricaradio',
      genre: 'Public Radio',
      language: 'English',
      country: 'South Africa',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'nigeria-radio',
      name: 'Nigeria Radio',
      description: 'Nigeria Radio - Nigerian Public Radio',
      streamUrl: 'https://stream.zeno.fm/nigeriaradio',
      genre: 'Public Radio',
      language: 'English',
      country: 'Nigeria',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'kenya-radio',
      name: 'Kenya Radio',
      description: 'Kenya Radio - Kenyan Public Radio',
      streamUrl: 'https://stream.zeno.fm/kenyaradio',
      genre: 'Public Radio',
      language: 'English',
      country: 'Kenya',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'egypt-radio',
      name: 'Egypt Radio',
      description: 'Egypt Radio - Egyptian Public Radio',
      streamUrl: 'https://stream.zeno.fm/egyptradio',
      genre: 'Public Radio',
      language: 'Arabic',
      country: 'Egypt',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'morocco-radio',
      name: 'Morocco Radio',
      description: 'Morocco Radio - Moroccan Public Radio',
      streamUrl: 'https://stream.zeno.fm/moroccoradio',
      genre: 'Public Radio',
      language: 'Arabic',
      country: 'Morocco',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'saudi-radio',
      name: 'Saudi Radio',
      description: 'Saudi Radio - Saudi Public Radio',
      streamUrl: 'https://stream.zeno.fm/saudiradio',
      genre: 'Public Radio',
      language: 'Arabic',
      country: 'Saudi Arabia',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'uae-radio',
      name: 'UAE Radio',
      description: 'UAE Radio - UAE Public Radio',
      streamUrl: 'https://stream.zeno.fm/uaeradio',
      genre: 'Public Radio',
      language: 'Arabic',
      country: 'United Arab Emirates',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'israel-radio',
      name: 'Israel Radio',
      description: 'Israel Radio - Israeli Public Radio',
      streamUrl: 'https://stream.zeno.fm/israelradio',
      genre: 'Public Radio',
      language: 'Hebrew',
      country: 'Israel',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'russia-radio',
      name: 'Russia Radio',
      description: 'Russia Radio - Russian Public Radio',
      streamUrl: 'https://stream.zeno.fm/russiaradio',
      genre: 'Public Radio',
      language: 'Russian',
      country: 'Russia',
      bitrate: 128,
      format: 'mp3'
    },
    {
      id: 'ukraine-radio',
      name: 'Ukraine Radio',
      description: 'Ukraine Radio - Ukrainian Public Radio',
      streamUrl: 'https://stream.zeno.fm/ukraineradio',
      genre: 'Public Radio',
      language: 'Ukrainian',
      country: 'Ukraine',
      bitrate: 128,
      format: 'mp3'
    }
  ];

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Set up global error handling
    // Note: Howler.js global error handling is handled per-instance
    // Note: Some radio stream URLs may return 404 errors if the stream is not available
    // Users should be aware that some stations may not work due to URL changes or availability
  }

  // Country to preferred languages mapping
  private countryLanguageMap: Record<string, string[]> = {
    'India': ['Hindi', 'Telugu', 'Tamil', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'English'],
    'Pakistan': ['Urdu', 'Punjabi', 'Sindhi', 'Pashto', 'English'],
    'Bangladesh': ['Bengali', 'English'],
    'Sri Lanka': ['Sinhala', 'Tamil', 'English'],
    'Nepal': ['Nepali', 'Hindi', 'English'],
    'Bhutan': ['Dzongkha', 'English'],
    'Maldives': ['Dhivehi', 'English'],
    'Afghanistan': ['Pashto', 'Dari', 'English'],
    'United States': ['English', 'Spanish', 'Hindi', 'Chinese'],
    'United Kingdom': ['English', 'Hindi', 'Punjabi', 'Urdu'],
    'Canada': ['English', 'French', 'Hindi', 'Punjabi'],
    'Australia': ['English', 'Hindi', 'Chinese'],
    'Germany': ['German', 'English', 'Turkish'],
    'France': ['French', 'English', 'Arabic'],
    'Italy': ['Italian', 'English'],
    'Spain': ['Spanish', 'English'],
    'Netherlands': ['Dutch', 'English'],
    'Belgium': ['Dutch', 'French', 'English'],
    'Switzerland': ['German', 'French', 'Italian', 'English'],
    'Austria': ['German', 'English'],
    'Sweden': ['Swedish', 'English'],
    'Norway': ['Norwegian', 'English'],
    'Denmark': ['Danish', 'English'],
    'Finland': ['Finnish', 'English'],
    'Poland': ['Polish', 'English'],
    'Czech Republic': ['Czech', 'English'],
    'Hungary': ['Hungarian', 'English'],
    'Romania': ['Romanian', 'English'],
    'Bulgaria': ['Bulgarian', 'English'],
    'Greece': ['Greek', 'English'],
    'Turkey': ['Turkish', 'English'],
    'Russia': ['Russian', 'English'],
    'Ukraine': ['Ukrainian', 'Russian', 'English'],
    'China': ['Chinese', 'English'],
    'Japan': ['Japanese', 'English'],
    'South Korea': ['Korean', 'English'],
    'Thailand': ['Thai', 'English'],
    'Vietnam': ['Vietnamese', 'English'],
    'Malaysia': ['Malay', 'English', 'Chinese', 'Tamil'],
    'Singapore': ['English', 'Chinese', 'Malay', 'Tamil'],
    'Indonesia': ['Indonesian', 'English'],
    'Philippines': ['Filipino', 'English'],
    'Myanmar': ['Burmese', 'English'],
    'Cambodia': ['Khmer', 'English'],
    'Laos': ['Lao', 'English'],
    'Brazil': ['Portuguese', 'English'],
    'Argentina': ['Spanish', 'English'],
    'Mexico': ['Spanish', 'English'],
    'Chile': ['Spanish', 'English'],
    'Colombia': ['Spanish', 'English'],
    'Peru': ['Spanish', 'English'],
    'Venezuela': ['Spanish', 'English'],
    'Ecuador': ['Spanish', 'English'],
    'Bolivia': ['Spanish', 'English'],
    'Paraguay': ['Spanish', 'English'],
    'Uruguay': ['Spanish', 'English'],
    'South Africa': ['English', 'Afrikaans', 'Zulu', 'Xhosa'],
    'Nigeria': ['English', 'Hausa', 'Yoruba', 'Igbo'],
    'Kenya': ['English', 'Swahili'],
    'Egypt': ['Arabic', 'English'],
    'Morocco': ['Arabic', 'French', 'English'],
    'Algeria': ['Arabic', 'French', 'English'],
    'Tunisia': ['Arabic', 'French', 'English'],
    'Libya': ['Arabic', 'English'],
    'Sudan': ['Arabic', 'English'],
    'Ethiopia': ['Amharic', 'English'],
    'Ghana': ['English', 'Akan'],
    'Senegal': ['French', 'Wolof', 'English'],
    'Ivory Coast': ['French', 'English'],
    'Cameroon': ['French', 'English'],
    'Democratic Republic of Congo': ['French', 'English'],
    'Angola': ['Portuguese', 'English'],
    'Mozambique': ['Portuguese', 'English'],
    'Zimbabwe': ['English', 'Shona', 'Ndebele'],
    'Zambia': ['English', 'Bemba'],
    'Botswana': ['English', 'Setswana'],
    'Namibia': ['English', 'Afrikaans'],
    'Madagascar': ['Malagasy', 'French', 'English'],
    'Mauritius': ['English', 'French', 'Creole'],
    'Seychelles': ['English', 'French', 'Creole'],
    'Israel': ['Hebrew', 'Arabic', 'English'],
    'Palestine': ['Arabic', 'English'],
    'Jordan': ['Arabic', 'English'],
    'Lebanon': ['Arabic', 'French', 'English'],
    'Syria': ['Arabic', 'English'],
    'Iraq': ['Arabic', 'Kurdish', 'English'],
    'Iran': ['Persian', 'English'],
    'Saudi Arabia': ['Arabic', 'English'],
    'United Arab Emirates': ['Arabic', 'English', 'Hindi', 'Urdu'],
    'Qatar': ['Arabic', 'English', 'Hindi', 'Urdu'],
    'Kuwait': ['Arabic', 'English', 'Hindi', 'Urdu'],
    'Bahrain': ['Arabic', 'English', 'Hindi', 'Urdu'],
    'Oman': ['Arabic', 'English', 'Hindi', 'Urdu'],
    'Yemen': ['Arabic', 'English'],
    'Iceland': ['Icelandic', 'English'],
    'Ireland': ['English', 'Irish'],
    'Portugal': ['Portuguese', 'English'],
    'Luxembourg': ['Luxembourgish', 'French', 'German', 'English'],
    'Malta': ['Maltese', 'English'],
    'Cyprus': ['Greek', 'Turkish', 'English'],
    'Croatia': ['Croatian', 'English'],
    'Serbia': ['Serbian', 'English'],
    'Bosnia and Herzegovina': ['Bosnian', 'Serbian', 'Croatian', 'English'],
    'Montenegro': ['Montenegrin', 'English'],
    'North Macedonia': ['Macedonian', 'English'],
    'Albania': ['Albanian', 'English'],
    'Slovenia': ['Slovenian', 'English'],
    'Slovakia': ['Slovak', 'English'],
    'Lithuania': ['Lithuanian', 'English'],
    'Latvia': ['Latvian', 'English'],
    'Estonia': ['Estonian', 'English'],
    'Belarus': ['Belarusian', 'Russian', 'English'],
    'Moldova': ['Romanian', 'Russian', 'English'],
    'Georgia': ['Georgian', 'English'],
    'Armenia': ['Armenian', 'English'],
    'Azerbaijan': ['Azerbaijani', 'English'],
    'Kazakhstan': ['Kazakh', 'Russian', 'English'],
    'Uzbekistan': ['Uzbek', 'Russian', 'English'],
    'Kyrgyzstan': ['Kyrgyz', 'Russian', 'English'],
    'Tajikistan': ['Tajik', 'Russian', 'English'],
    'Turkmenistan': ['Turkmen', 'Russian', 'English'],
    'Mongolia': ['Mongolian', 'English'],
    'North Korea': ['Korean', 'English'],
    'Taiwan': ['Chinese', 'English'],
    'Hong Kong': ['Chinese', 'English'],
    'Macau': ['Chinese', 'Portuguese', 'English'],
    'Brunei': ['Malay', 'English', 'Chinese'],
    'East Timor': ['Tetum', 'Portuguese', 'English'],
    'Papua New Guinea': ['English', 'Tok Pisin'],
    'Fiji': ['English', 'Fijian', 'Hindi'],
    'New Zealand': ['English', 'Maori'],
    'Samoa': ['Samoan', 'English'],
    'Tonga': ['Tongan', 'English'],
    'Vanuatu': ['Bislama', 'English', 'French'],
    'Solomon Islands': ['English', 'Pijin'],
    'Palau': ['Palauan', 'English'],
    'Marshall Islands': ['Marshallese', 'English'],
    'Micronesia': ['English', 'Chuukese'],
    'Kiribati': ['Gilbertese', 'English'],
    'Nauru': ['Nauruan', 'English'],
    'Tuvalu': ['Tuvaluan', 'English'],
    'Cook Islands': ['Cook Islands Maori', 'English'],
    'Niue': ['Niuean', 'English'],
    'Tokelau': ['Tokelauan', 'English'],
    'American Samoa': ['Samoan', 'English'],
    'Guam': ['Chamorro', 'English'],
    'Northern Mariana Islands': ['Chamorro', 'English'],
    'Puerto Rico': ['Spanish', 'English'],
    'Dominican Republic': ['Spanish', 'English'],
    'Cuba': ['Spanish', 'English'],
    'Jamaica': ['English', 'Jamaican Patois'],
    'Haiti': ['French', 'Haitian Creole', 'English'],
    'Trinidad and Tobago': ['English', 'Hindi', 'Spanish'],
    'Barbados': ['English'],
    'Guyana': ['English', 'Hindi', 'Urdu'],
    'Suriname': ['Dutch', 'English', 'Hindi'],
    'Belize': ['English', 'Spanish'],
    'Costa Rica': ['Spanish', 'English'],
    'Panama': ['Spanish', 'English'],
    'Nicaragua': ['Spanish', 'English'],
    'Honduras': ['Spanish', 'English'],
    'El Salvador': ['Spanish', 'English'],
    'Guatemala': ['Spanish', 'English'],
    'Bahamas': ['English'],
    'Cayman Islands': ['English'],
    'Bermuda': ['English'],
    'Greenland': ['Greenlandic', 'Danish', 'English'],
    'Faroe Islands': ['Faroese', 'Danish', 'English']
  };

  // Get preferred languages for a country
  public getPreferredLanguages(country: string): string[] {
    return this.countryLanguageMap[country] || ['English'];
  }

  // Detect user's country based on location
  public async detectUserCountry(): Promise<string> {
    try {
      // Try to get location from browser
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Use reverse geocoding to get country
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                const data = await response.json();
                resolve(data.countryName || 'India');
              } catch (error) {
                console.log('Geocoding failed, using default country');
                resolve('India');
              }
            },
            () => {
              console.log('Geolocation failed, using default country');
              resolve('India');
            },
            { timeout: 5000 }
          );
        });
      }
    } catch (error) {
      console.log('Location detection failed, using default country');
    }
    return 'India'; // Default fallback
  }

  public getStations(): RadioStation[] {
    return [...this.stations];
  }

  public getStationById(id: string): RadioStation | undefined {
    return this.stations.find(station => station.id === id);
  }

  public getStationsByGenre(genre: string): RadioStation[] {
    return this.stations.filter(station => 
      station.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  public getStationsByLanguage(language: string): RadioStation[] {
    return this.stations.filter(station => 
      station.language.toLowerCase().includes(language.toLowerCase())
    );
  }

  public getStationsByCountry(country: string): RadioStation[] {
    return this.stations.filter(station => 
      station.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  public getAvailableCountries(): string[] {
    const countries = [...new Set(this.stations.map(station => station.country))];
    return countries.sort();
  }

  public getAvailableLanguages(): string[] {
    const languages = [...new Set(this.stations.map(station => station.language))];
    return languages.sort();
  }

  public getAvailableGenres(): string[] {
    const genres = [...new Set(this.stations.map(station => station.genre))];
    return genres.sort();
  }

  public getRecommendedStations(country?: string, language?: string): RadioStation[] {
    let recommended = this.stations;

    if (country) {
      recommended = recommended.filter(station => 
        station.country.toLowerCase() === country.toLowerCase()
      );
    }

    if (language) {
      recommended = recommended.filter(station => 
        station.language.toLowerCase() === language.toLowerCase()
      );
    }

    return recommended;
  }

  public async playStation(station: RadioStation): Promise<void> {
    try {
      // If the same station is already playing, just resume
      if (this.currentStation?.id === station.id && this.howl) {
        if (this.howl.playing()) {
          this.howl.pause();
        } else {
          this.howl.play();
        }
        return;
      }

      // Stop current playback completely
      this.stop();

      // Set current station immediately to prevent double-click issues
      this.currentStation = station;

      // Start loading
      this.notifyListeners({
        isPlaying: false,
        isLoading: true,
        currentStation: station,
        volume: this.volume,
        error: null
      });

      // Try to play the station
      await this.attemptPlayStation(station);

    } catch (error) {
      this.notifyListeners({
        isPlaying: false,
        isLoading: false,
        currentStation: null,
        volume: this.volume,
        error: 'Failed to start radio stream. Please try again.'
      });
    }
  }

  private async attemptPlayStation(station: RadioStation): Promise<void> {
    // Create new Howl instance
    this.howl = new Howl({
      src: [station.streamUrl],
      html5: true,
      format: [station.format],
      volume: this.volume,
      onload: () => {
        this.notifyListeners({
          isPlaying: false,
          isLoading: false,
          currentStation: station,
          volume: this.volume,
          error: null
        });
      },
      onloaderror: () => {
        console.error('Failed to load radio stream:', station.streamUrl);
        this.notifyListeners({
          isPlaying: false,
          isLoading: false,
          currentStation: null,
          volume: this.volume,
          error: null
        });
      },
      onplay: () => {
        console.log('Successfully playing:', station.name);
        this.notifyListeners({
          isPlaying: true,
          isLoading: false,
          currentStation: station,
          volume: this.volume,
          error: null
        });
      },
      onpause: () => {
        this.notifyListeners({
          isPlaying: false,
          isLoading: false,
          currentStation: this.currentStation,
          volume: this.volume,
          error: null
        });
      },
      onstop: () => {
        this.notifyListeners({
          isPlaying: false,
          isLoading: false,
          currentStation: null,
          volume: this.volume,
          error: null
        });
      }
    });

    // Play the stream immediately
    this.howl.play();
  }

  public pause(): void {
    if (this.howl) {
      this.howl.pause();
    }
  }

  public resume(): void {
    if (this.howl) {
      this.howl.play();
    }
  }

  public stop(): void {
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    this.currentStation = null;
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.howl) {
      this.howl.volume(this.volume);
    }
    this.notifyListeners({
      isPlaying: this.howl ? this.howl.playing() : false,
      isLoading: false,
      currentStation: this.currentStation,
      volume: this.volume,
      error: null
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentStation(): RadioStation | null {
    return this.currentStation;
  }

  public isPlaying(): boolean {
    return this.howl ? this.howl.playing() : false;
  }

  public subscribe(listener: (state: RadioPlayerState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(state: RadioPlayerState): void {
    this.listeners.forEach(listener => listener(state));
  }

  public cleanup(): void {
    this.stop();
    this.listeners = [];
  }
}

// Export singleton instance
export const radioService = new RadioService();
