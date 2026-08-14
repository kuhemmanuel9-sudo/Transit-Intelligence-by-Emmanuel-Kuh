const http = require("node:http");
const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fsSync.existsSync(envPath)) return;

  const lines = fsSync.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator < 1) return;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
}

loadLocalEnv();

const NYC_API_KEY = process.env.MTA_API_KEY || "f7a36175-a98f-48e7-af32-56184d5ac5c3";
const START_PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || "127.0.0.1";
const NYC_SIRI_URL = "https://bustime.mta.info/api/siri/vehicle-monitoring.json";
const TRANSITLAND_API_KEY = process.env.TRANSITLAND_API_KEY || process.env.TLV2_API_KEY || process.env.TRANSITLAND_KEY || "";
const TRANSITLAND_API_BASE = process.env.TRANSITLAND_API_BASE || "https://transit.land/api/v2/rest";
const TRANSITLAND_MARYLAND_STATIC_FEED_KEY = process.env.TRANSITLAND_MARYLAND_STATIC_FEED_KEY || "f-dq-mtamaryland~bus";
const TRANSITLAND_MARYLAND_RT_FEED_KEY = process.env.TRANSITLAND_MARYLAND_RT_FEED_KEY || "f-dq-mtamaryland~bus~rt";
const SWIFTLY_API_KEY = process.env.SWIFTLY_MARYLAND_API_KEY || process.env.SWIFTLY_API_KEY || process.env.GOSWIFTLY_API_KEY || "";
const SWIFTLY_AUTH_HEADER = process.env.SWIFTLY_AUTH_HEADER || SWIFTLY_API_KEY;
const SWIFTLY_MARYLAND_VEHICLE_POSITIONS_URL = process.env.SWIFTLY_MARYLAND_VEHICLE_POSITIONS_URL || "https://api.goswift.ly/real-time/mta-maryland/gtfs-rt-vehicle-positions";

const CATALOG = {
  locations: [
    {
      id: "md-towson-lutherville",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Towson",
      locationName: "Lutherville to Towson University",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "MDOT MTA Local Bus GTFS-RT needs a Swiftly key. This location uses realistic route tracking until that key is added.",
      center: [39.4058, -76.6114],
      zoom: 13,
      home: { name: "Lutherville Light Rail", lat: 39.4218, lng: -76.6265 },
      destination: { name: "Towson University", lat: 39.393, lng: -76.6122 },
      routeLine: [
        [39.4218, -76.6265],
        [39.4142, -76.6168],
        [39.4062, -76.6047],
        [39.3983, -76.6091],
        [39.393, -76.6122]
      ],
      routes: [
        {
          id: "MD-RD",
          label: "RED",
          shortName: "RD",
          name: "CityLink RED - Lutherville Light Rail to Towson / Downtown Baltimore",
          color: "#ef003f",
          textColor: "#ffffff",
          from: "Lutherville Light Rail",
          destinations: ["Towson University", "Towson Town Center", "Lutherville Light Rail"],
          headsign: "Towson University via York Rd",
          sample: [
            { busNumber: "1905", eta: 5, stop: "York Rd / Radnor Ave", stopsAway: 2, meters: 420, progress: 0.42, bearing: 178 },
            { busNumber: "2148", eta: 16, stop: "York Rd / Fairmount Ave", stopsAway: 6, meters: 1900, progress: 0.18, bearing: 164 },
            { busNumber: "2220", eta: 24, stop: "Lutherville Light Rail", stopsAway: 9, meters: 3100, progress: 0.03, bearing: 149 }
          ]
        },
        {
          id: "MD-52",
          label: "52",
          shortName: "52",
          name: "LocalLink 52 - Greenmount North / Stella Maris",
          color: "#7f9c89",
          textColor: "#ffffff",
          from: "York Rd / Radnor Ave",
          destinations: ["Stella Maris", "Towson", "Greenmount North"],
          headsign: "Stella Maris",
          sample: [
            { busNumber: "5207", eta: 13, stop: "York Rd / Radnor Ave", stopsAway: 4, meters: 1200, progress: 0.34, bearing: 32 }
          ]
        },
        {
          id: "MD-28",
          label: "28",
          shortName: "28",
          name: "LocalLink 28 - Moravia / Rogers Ave",
          color: "#86a394",
          textColor: "#ffffff",
          from: "Cold Spring Ln / York Rd",
          destinations: ["Moravia", "Rogers Ave Metro", "Towson"],
          headsign: "Moravia",
          sample: [
            { busNumber: "2812", eta: 12, stop: "Cold Spring Ln / York Rd", stopsAway: 5, meters: 1500, progress: 0.51, bearing: 108 }
          ]
        },
        {
          id: "MD-93",
          label: "93",
          shortName: "93",
          name: "Route 93 - Towson / Hunt Valley",
          color: "#2346a0",
          textColor: "#ffffff",
          from: "Lutherville Light Rail",
          destinations: ["Towson University", "Hunt Valley", "Towson Town Center"],
          headsign: "Towson University",
          sample: [
            { busNumber: "9316", eta: 8, stop: "Lutherville Light Rail", stopsAway: 3, meters: 870, progress: 0.27, bearing: 152 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-inner-harbor",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Inner Harbor to Johns Hopkins Hospital",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "Baltimore Local Bus previews animate on official-style corridors until a Swiftly GTFS-RT key is connected.",
      center: [39.2926, -76.6076],
      zoom: 14,
      home: { name: "Inner Harbor / Pratt St", lat: 39.2869, lng: -76.6105 },
      destination: { name: "Johns Hopkins Hospital", lat: 39.2968, lng: -76.5929 },
      routeLine: [
        [39.2869, -76.6105],
        [39.2892, -76.6064],
        [39.2918, -76.6021],
        [39.2942, -76.5978],
        [39.2968, -76.5929]
      ],
      routes: [
        {
          id: "MD-BLUE",
          label: "BLUE",
          shortName: "BLUE",
          name: "CityLink BLUE - CMS to Johns Hopkins Bayview",
          color: "#1268b3",
          textColor: "#ffffff",
          from: "Inner Harbor / Pratt St",
          destinations: ["Johns Hopkins Hospital", "Johns Hopkins Bayview", "CMS"],
          headsign: "Johns Hopkins Hospital",
          sample: [
            { busNumber: "3042", eta: 4, stop: "Pratt St / Market Pl", stopsAway: 1, meters: 260, progress: 0.52, bearing: 54 },
            { busNumber: "3116", eta: 11, stop: "Baltimore St / Gay St", stopsAway: 4, meters: 1180, progress: 0.24, bearing: 64 }
          ]
        },
        {
          id: "MD-ORANGE",
          label: "ORANGE",
          shortName: "ORANGE",
          name: "CityLink ORANGE - Essex to West Baltimore MARC",
          color: "#ec7d24",
          textColor: "#ffffff",
          from: "Downtown Baltimore",
          destinations: ["West Baltimore MARC", "Essex", "Harbor East"],
          headsign: "West Baltimore MARC",
          sample: [
            { busNumber: "4074", eta: 9, stop: "Baltimore St / Charles St", stopsAway: 3, meters: 920, progress: 0.34, bearing: 274 }
          ]
        },
        {
          id: "MD-NAVY",
          label: "NAVY",
          shortName: "NAVY",
          name: "CityLink NAVY - Mondawmin to Dundalk",
          color: "#263a82",
          textColor: "#ffffff",
          from: "Inner Harbor",
          destinations: ["Dundalk", "Mondawmin", "Bayview"],
          headsign: "Dundalk",
          sample: [
            { busNumber: "5009", eta: 14, stop: "Lombard St / Light St", stopsAway: 5, meters: 1540, progress: 0.18, bearing: 101 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-penn-station",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Penn Station to Charles Village",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "Preview buses move along the corridor every second. Add a Swiftly key for fully live MDOT MTA positions.",
      center: [39.3102, -76.6173],
      zoom: 14,
      home: { name: "Penn Station", lat: 39.3074, lng: -76.6156 },
      destination: { name: "Charles Village / Johns Hopkins University", lat: 39.3299, lng: -76.6205 },
      routeLine: [
        [39.3074, -76.6156],
        [39.3132, -76.6167],
        [39.3183, -76.6182],
        [39.3241, -76.6194],
        [39.3299, -76.6205]
      ],
      routes: [
        {
          id: "MD-PURPLE",
          label: "PURPLE",
          shortName: "PURPLE",
          name: "CityLink PURPLE - Catonsville to Towson",
          color: "#7e3fad",
          textColor: "#ffffff",
          from: "Penn Station",
          destinations: ["Towson", "Johns Hopkins University", "Catonsville"],
          headsign: "Towson via Charles Village",
          sample: [
            { busNumber: "6128", eta: 6, stop: "Charles St / Penn Station", stopsAway: 2, meters: 510, progress: 0.36, bearing: 354 },
            { busNumber: "6170", eta: 18, stop: "St Paul St / 25th St", stopsAway: 7, meters: 2050, progress: 0.12, bearing: 358 }
          ]
        },
        {
          id: "MD-SILVER",
          label: "SILVER",
          shortName: "SILVER",
          name: "CityLink SILVER - Curtis Bay to Morgan State",
          color: "#768189",
          textColor: "#ffffff",
          from: "Penn Station",
          destinations: ["Morgan State University", "Curtis Bay"],
          headsign: "Morgan State University",
          sample: [
            { busNumber: "6602", eta: 10, stop: "St Paul St / North Ave", stopsAway: 4, meters: 1250, progress: 0.44, bearing: 23 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-ummc",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "UMMC and Downtown Medical Core",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "UMMC uses live MDOT stop-arrival timing when available and animated corridor tracking until Swiftly GPS is active.",
      center: [39.2899, -76.6239],
      zoom: 15,
      home: { name: "University of Maryland Medical Center", lat: 39.2886, lng: -76.6246 },
      destination: { name: "Downtown Baltimore / UMMC", lat: 39.2899, lng: -76.6239 },
      aliases: ["UMMC", "University of Maryland Medical Center", "UMD Medical Center", "UMD Medical Centre", "Shock Trauma", "Baltimore medical center"],
      routeLine: [
        [39.2845, -76.6358],
        [39.2868, -76.6304],
        [39.2886, -76.6246],
        [39.2902, -76.6191],
        [39.2918, -76.6122],
        [39.2945, -76.6062]
      ],
      routes: [
        {
          id: "MD-ORANGE",
          label: "ORANGE",
          shortName: "ORANGE",
          name: "CityLink ORANGE - Essex to West Baltimore MARC",
          color: "#ec7d24",
          textColor: "#ffffff",
          from: "University of Maryland Medical Center",
          destinations: ["UMMC", "Downtown Baltimore", "West Baltimore MARC", "Essex", "Harbor East"],
          aliases: ["University of Maryland Medical Center", "UMD Medical Centre", "UMD Medical Center"],
          headsign: "West Baltimore MARC via UMMC",
          sample: [
            { busNumber: "4018", eta: 4, stop: "Lombard St / Greene St", stopsAway: 1, meters: 240, progress: 0.42, bearing: 268 },
            { busNumber: "4092", eta: 16, stop: "Baltimore St / Charles St", stopsAway: 5, meters: 1480, progress: 0.22, bearing: 274 }
          ]
        },
        {
          id: "MD-PURPLE",
          label: "PURPLE",
          shortName: "PURPLE",
          name: "CityLink PURPLE - City Hall to Paradise/Catonsville",
          color: "#7e3fad",
          textColor: "#ffffff",
          from: "University of Maryland Medical Center",
          destinations: ["UMMC", "Paradise", "Catonsville", "City Hall", "Towson"],
          aliases: ["University of Maryland Medical Center", "UMD Medical Centre", "UMD Medical Center"],
          headsign: "Catonsville via UMMC",
          sample: [
            { busNumber: "6163", eta: 7, stop: "Pratt St / Greene St", stopsAway: 2, meters: 510, progress: 0.48, bearing: 86 },
            { busNumber: "6198", eta: 21, stop: "Pratt St / Fulton Ave", stopsAway: 7, meters: 2260, progress: 0.18, bearing: 67 }
          ]
        },
        {
          id: "MD-YELLOW",
          label: "YELLOW",
          shortName: "YELLOW",
          name: "CityLink YELLOW - Mt Vernon to Patapsco",
          color: "#f4ca21",
          textColor: "#111827",
          from: "Downtown Baltimore",
          destinations: ["UMMC", "Mt Vernon", "Patapsco Station", "Downtown Baltimore"],
          aliases: ["University of Maryland Medical Center", "UMD Medical Centre", "Patapsco"],
          headsign: "Patapsco via UMMC",
          sample: [
            { busNumber: "9034", eta: 9, stop: "Lombard St / Greene St", stopsAway: 3, meters: 780, progress: 0.52, bearing: 176 }
          ]
        },
        {
          id: "MD-NAVY",
          label: "NAVY",
          shortName: "NAVY",
          name: "CityLink NAVY - Mondawmin to Dundalk",
          color: "#263a82",
          textColor: "#ffffff",
          from: "Downtown Baltimore",
          destinations: ["UMMC", "Dundalk", "Mondawmin", "Bayview"],
          aliases: ["University of Maryland Medical Center", "UMD Medical Centre"],
          headsign: "Dundalk via Downtown",
          sample: [
            { busNumber: "5027", eta: 12, stop: "Pratt St / Howard St", stopsAway: 4, meters: 1080, progress: 0.58, bearing: 101 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-downtown-network",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Downtown Transfer Network",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "Downtown routes use live stop-arrival timing where public MDOT stops return data, plus corridor animation for route discovery.",
      center: [39.2916, -76.6156],
      zoom: 14,
      home: { name: "Charles Center / Downtown", lat: 39.2896, lng: -76.6152 },
      destination: { name: "Downtown Baltimore", lat: 39.2916, lng: -76.6156 },
      aliases: ["Downtown", "Charles Center", "Baltimore Arena", "CFG Bank Arena", "Lexington Market"],
      routeLine: [
        [39.2838, -76.6337],
        [39.2876, -76.6246],
        [39.2896, -76.6152],
        [39.2929, -76.6076],
        [39.2968, -76.5929]
      ],
      routes: [
        {
          id: "MD-BLUE",
          label: "BLUE",
          shortName: "BLUE",
          name: "CityLink BLUE - CMS to Johns Hopkins Bayview",
          color: "#1268b3",
          textColor: "#ffffff",
          from: "Charles Center",
          destinations: ["Johns Hopkins Bayview", "Downtown Baltimore", "CMS", "UMMC"],
          headsign: "Johns Hopkins Bayview",
          sample: [
            { busNumber: "3033", eta: 5, stop: "Baltimore St / Charles St", stopsAway: 1, meters: 310, progress: 0.48, bearing: 72 }
          ]
        },
        {
          id: "MD-BROWN",
          label: "BROWN",
          shortName: "BROWN",
          name: "CityLink BROWN - Overlea to Downtown",
          color: "#8b5a2b",
          textColor: "#ffffff",
          from: "Downtown Baltimore",
          destinations: ["Overlea", "Downtown Baltimore", "City Hall", "Lexington Market"],
          headsign: "Overlea",
          sample: [
            { busNumber: "8126", eta: 10, stop: "Baltimore St / Charles St", stopsAway: 3, meters: 920, progress: 0.55, bearing: 44 }
          ]
        },
        {
          id: "MD-PINK",
          label: "PINK",
          shortName: "PINK",
          name: "CityLink PINK - Cedonia to West Baltimore MARC",
          color: "#e63acb",
          textColor: "#ffffff",
          from: "Downtown Baltimore",
          destinations: ["Cedonia", "West Baltimore MARC", "Downtown Baltimore", "UMMC"],
          headsign: "West Baltimore MARC",
          sample: [
            { busNumber: "8331", eta: 8, stop: "Baltimore St / Charles St", stopsAway: 2, meters: 650, progress: 0.39, bearing: 268 }
          ]
        },
        {
          id: "MD-YELLOW",
          label: "YELLOW",
          shortName: "YELLOW",
          name: "CityLink YELLOW - Mt Vernon to Patapsco",
          color: "#f4ca21",
          textColor: "#111827",
          from: "Downtown Baltimore",
          destinations: ["Mt Vernon", "Patapsco Station", "Downtown Baltimore", "UMMC"],
          headsign: "Mt Vernon",
          sample: [
            { busNumber: "9042", eta: 14, stop: "Howard St / Fayette St", stopsAway: 5, meters: 1540, progress: 0.3, bearing: 355 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-northwest-harbor",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Northwest Hospital to Harbor East",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "CityLink LIME corridor preview with live public stop timing where available.",
      center: [39.3332, -76.6578],
      zoom: 12,
      home: { name: "Northwest Hospital", lat: 39.3526, lng: -76.7041 },
      destination: { name: "Harbor East", lat: 39.2849, lng: -76.5994 },
      aliases: ["Northwest Hospital", "Harbor East", "Fells Point", "Mt Washington"],
      routeLine: [
        [39.3526, -76.7041],
        [39.3372, -76.6745],
        [39.3184, -76.6532],
        [39.3022, -76.6216],
        [39.2918, -76.6021],
        [39.2849, -76.5994]
      ],
      routes: [
        {
          id: "MD-LIME",
          label: "LIME",
          shortName: "LIME",
          name: "CityLink LIME - Northwest Hospital to Harbor East",
          color: "#8bd331",
          textColor: "#111827",
          from: "Northwest Hospital",
          destinations: ["Northwest Hospital", "Harbor East", "Mondawmin", "Fells Point"],
          headsign: "Harbor East",
          sample: [
            { busNumber: "8438", eta: 11, stop: "Mondawmin Metro", stopsAway: 4, meters: 1180, progress: 0.42, bearing: 132 },
            { busNumber: "8472", eta: 24, stop: "Northwest Hospital", stopsAway: 8, meters: 3240, progress: 0.09, bearing: 126 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-green-towson",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Towson",
      locationName: "Downtown to Towson Green Line",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "CityLink GREEN corridor preview with live MDOT stop timing where public arrivals are returned.",
      center: [39.3464, -76.6089],
      zoom: 12,
      home: { name: "Downtown Baltimore", lat: 39.2896, lng: -76.6152 },
      destination: { name: "Towson", lat: 39.399, lng: -76.6026 },
      aliases: ["Towson", "Goucher College", "Towson Town Center", "Downtown to Towson"],
      routeLine: [
        [39.2896, -76.6152],
        [39.3074, -76.6156],
        [39.3299, -76.6205],
        [39.3564, -76.6104],
        [39.3851, -76.6029],
        [39.399, -76.6026]
      ],
      routes: [
        {
          id: "MD-GREEN",
          label: "GREEN",
          shortName: "GREEN",
          name: "CityLink GREEN - Downtown to Towson",
          color: "#12a84a",
          textColor: "#ffffff",
          from: "Downtown Baltimore",
          destinations: ["Towson", "Downtown Baltimore", "Goucher College", "Towson Town Center"],
          headsign: "Towson",
          sample: [
            { busNumber: "8521", eta: 6, stop: "York Rd / Northern Pkwy", stopsAway: 2, meters: 520, progress: 0.62, bearing: 18 },
            { busNumber: "8578", eta: 18, stop: "Penn Station", stopsAway: 6, meters: 2010, progress: 0.28, bearing: 10 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-patapsco-local",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Patapsco, Canton, Bayview, and Woodberry",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "LocalLink discovery routes use animated corridors and public MDOT arrival timing where supported.",
      center: [39.2831, -76.6049],
      zoom: 12,
      home: { name: "Patapsco Station", lat: 39.2354, lng: -76.6142 },
      destination: { name: "Canton Crossing / Bayview", lat: 39.2818, lng: -76.5374 },
      aliases: ["Patapsco", "Canton Crossing", "Bayview", "Woodberry", "Brooklyn", "Rogers Ave"],
      routeLine: [
        [39.2354, -76.6142],
        [39.2601, -76.6149],
        [39.2818, -76.6001],
        [39.2909, -76.5716],
        [39.2818, -76.5374]
      ],
      routes: [
        {
          id: "MD-21",
          label: "21",
          shortName: "21",
          name: "LocalLink 21 - Woodberry to Canton Crossing",
          color: "#2f6f67",
          textColor: "#ffffff",
          from: "Woodberry",
          destinations: ["Canton Crossing", "Woodberry", "Downtown Baltimore"],
          headsign: "Canton Crossing",
          sample: [
            { busNumber: "2114", eta: 8, stop: "Boston St / Canton Crossing", stopsAway: 3, meters: 840, progress: 0.71, bearing: 93 }
          ]
        },
        {
          id: "MD-22",
          label: "22",
          shortName: "22",
          name: "LocalLink 22 - Mondawmin to Bayview",
          color: "#345f9e",
          textColor: "#ffffff",
          from: "Mondawmin",
          destinations: ["Bayview", "Mondawmin", "Johns Hopkins Bayview"],
          headsign: "Bayview",
          sample: [
            { busNumber: "2219", eta: 13, stop: "Eastern Ave / Bayview", stopsAway: 5, meters: 1440, progress: 0.82, bearing: 76 }
          ]
        },
        {
          id: "MD-26",
          label: "26",
          shortName: "26",
          name: "LocalLink 26 - Patapsco Station to Mondawmin",
          color: "#6b7d4b",
          textColor: "#ffffff",
          from: "Patapsco Station",
          destinations: ["Mondawmin", "Patapsco Station", "Downtown Baltimore"],
          headsign: "Mondawmin",
          sample: [
            { busNumber: "2612", eta: 17, stop: "Patapsco Station", stopsAway: 6, meters: 1860, progress: 0.16, bearing: 352 }
          ]
        },
        {
          id: "MD-29",
          label: "29",
          shortName: "29",
          name: "LocalLink 29 - Mondawmin to Brooklyn",
          color: "#7b697c",
          textColor: "#ffffff",
          from: "Mondawmin",
          destinations: ["Brooklyn", "Mondawmin", "Cherry Hill"],
          headsign: "Brooklyn",
          sample: [
            { busNumber: "2930", eta: 19, stop: "Hanover St / Patapsco Ave", stopsAway: 7, meters: 2260, progress: 0.36, bearing: 184 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-north-local",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Sinai, Security Square, White Marsh, and Rogers Ave",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "North and northwest LocalLink routes are included for destination search and preview tracking until live public timing or Swiftly GPS is available.",
      center: [39.3506, -76.6645],
      zoom: 12,
      home: { name: "Sinai Hospital", lat: 39.3525, lng: -76.6625 },
      destination: { name: "Security Square / White Marsh / Rogers Ave", lat: 39.3393, lng: -76.7332 },
      aliases: ["Sinai Hospital", "Security Square", "White Marsh", "Rogers Ave", "Hollander Ridge", "Catonsville", "Falls Road", "Greenspring"],
      routeLine: [
        [39.4126, -76.5574],
        [39.3802, -76.5891],
        [39.3525, -76.6625],
        [39.3393, -76.7332],
        [39.2922, -76.7313],
        [39.2727, -76.7314]
      ],
      routes: [
        {
          id: "MD-30",
          label: "30",
          shortName: "30",
          name: "LocalLink 30 - Rogers Ave to Hollander Ridge",
          color: "#526f8d",
          textColor: "#ffffff",
          from: "Rogers Ave Metro",
          destinations: ["Rogers Ave", "Hollander Ridge", "Sinai Hospital", "Belair Road"],
          headsign: "Hollander Ridge",
          sample: [
            { busNumber: "3019", eta: 9, stop: "Rogers Ave Metro Station", stopsAway: 3, meters: 940, progress: 0.34, bearing: 68 }
          ]
        },
        {
          id: "MD-31",
          label: "31",
          shortName: "31",
          name: "LocalLink 31 - Sinai Hospital to Security Square",
          color: "#6d7663",
          textColor: "#ffffff",
          from: "Sinai Hospital",
          destinations: ["Sinai Hospital", "Security Square", "Woodlawn", "Northwest Hospital"],
          headsign: "Security Square",
          sample: [
            { busNumber: "3138", eta: 6, stop: "Sinai Hospital", stopsAway: 1, meters: 260, progress: 0.46, bearing: 262 },
            { busNumber: "3167", eta: 20, stop: "Liberty Heights Ave / Rogers Ave", stopsAway: 7, meters: 2310, progress: 0.23, bearing: 279 }
          ]
        },
        {
          id: "MD-32",
          label: "32",
          shortName: "32",
          name: "LocalLink 32 - Catonsville to Patapsco Station",
          color: "#7b596e",
          textColor: "#ffffff",
          from: "Catonsville",
          destinations: ["Catonsville", "Patapsco Station", "Arbutus", "UMBC"],
          headsign: "Patapsco Station",
          sample: [
            { busNumber: "3234", eta: 14, stop: "Frederick Rd / Bloomsbury Ave", stopsAway: 5, meters: 1500, progress: 0.78, bearing: 154 }
          ]
        },
        {
          id: "MD-33",
          label: "33",
          shortName: "33",
          name: "LocalLink 33 - Mt Washington Station to White Marsh",
          color: "#416d7d",
          textColor: "#ffffff",
          from: "Mt Washington Station",
          destinations: ["Mt Washington", "White Marsh", "Towson", "Perring Parkway"],
          headsign: "White Marsh",
          sample: [
            { busNumber: "3320", eta: 12, stop: "Mt Washington Station", stopsAway: 4, meters: 1280, progress: 0.26, bearing: 71 }
          ]
        },
        {
          id: "MD-34",
          label: "34",
          shortName: "34",
          name: "LocalLink 34 - Falls Rd / Greenspring to Catonsville",
          color: "#7f6b45",
          textColor: "#ffffff",
          from: "Falls Rd / Greenspring",
          destinations: ["Falls Road", "Greenspring", "Catonsville", "Mount Washington"],
          headsign: "Catonsville",
          sample: [
            { busNumber: "3415", eta: 18, stop: "Falls Rd / Northern Pkwy", stopsAway: 6, meters: 2200, progress: 0.39, bearing: 204 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-mondawmin",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "Mondawmin to West Baltimore MARC",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "Preview corridor for west Baltimore bus tracking. Connect Swiftly for live MDOT MTA vehicles.",
      center: [39.3077, -76.6499],
      zoom: 13,
      home: { name: "Mondawmin Metro", lat: 39.3184, lng: -76.6532 },
      destination: { name: "West Baltimore MARC", lat: 39.2873, lng: -76.6478 },
      routeLine: [
        [39.3184, -76.6532],
        [39.3119, -76.6522],
        [39.3056, -76.6508],
        [39.2963, -76.6491],
        [39.2873, -76.6478]
      ],
      routes: [
        {
          id: "MD-GOLD",
          label: "GOLD",
          shortName: "GOLD",
          name: "CityLink GOLD - Walbrook Junction to Canton",
          color: "#d7a900",
          textColor: "#111827",
          from: "Mondawmin Metro",
          destinations: ["Canton", "Walbrook Junction", "West Baltimore MARC"],
          headsign: "Canton via Downtown",
          sample: [
            { busNumber: "7003", eta: 7, stop: "Mondawmin Metro Bay", stopsAway: 2, meters: 620, progress: 0.29, bearing: 175 },
            { busNumber: "7089", eta: 19, stop: "North Ave / Warwick Ave", stopsAway: 6, meters: 2140, progress: 0.08, bearing: 169 }
          ]
        },
        {
          id: "MD-80",
          label: "80",
          shortName: "80",
          name: "LocalLink 80 - Downtown / Security Square",
          color: "#597c64",
          textColor: "#ffffff",
          from: "West Baltimore MARC",
          destinations: ["Security Square", "Downtown Baltimore"],
          headsign: "Downtown Baltimore",
          sample: [
            { busNumber: "8044", eta: 12, stop: "Edmondson Ave / Pulaski St", stopsAway: 4, meters: 1370, progress: 0.52, bearing: 89 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-bwi",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "BWI Airport to Light Rail",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "Airport-area preview with moving vehicles. Maryland real-time requires Swiftly authorization.",
      center: [39.182, -76.6745],
      zoom: 13,
      home: { name: "BWI Airport Terminal", lat: 39.1774, lng: -76.6684 },
      destination: { name: "BWI Marshall Light Rail", lat: 39.1796, lng: -76.6689 },
      routeLine: [
        [39.1774, -76.6684],
        [39.1835, -76.6718],
        [39.1903, -76.6761],
        [39.1984, -76.6812],
        [39.2066, -76.6843]
      ],
      routes: [
        {
          id: "MD-75",
          label: "75",
          shortName: "75",
          name: "LocalLink 75 - Arundel Mills / BWI",
          color: "#528b78",
          textColor: "#ffffff",
          from: "BWI Airport Terminal",
          destinations: ["Arundel Mills", "Patapsco Light Rail", "BWI Marshall Light Rail"],
          headsign: "Arundel Mills",
          sample: [
            { busNumber: "7512", eta: 5, stop: "BWI Terminal Door 17", stopsAway: 1, meters: 280, progress: 0.25, bearing: 327 },
            { busNumber: "7581", eta: 21, stop: "BWI Business District", stopsAway: 7, meters: 2450, progress: 0.07, bearing: 315 }
          ]
        }
      ]
    },
    {
      id: "md-baltimore-umbc",
      stateCode: "MD",
      stateName: "Maryland",
      cityName: "Baltimore",
      locationName: "UMBC and Catonsville",
      agency: "MDOT Maryland Transit Administration",
      provider: "Maryland MTA",
      liveMode: "preview",
      liveNote: "Catonsville/UMBC preview with animated buses. Add Swiftly API access for official live positions.",
      center: [39.257, -76.711],
      zoom: 13,
      home: { name: "UMBC Transit Center", lat: 39.2556, lng: -76.7112 },
      destination: { name: "Catonsville Junction", lat: 39.2727, lng: -76.7314 },
      routeLine: [
        [39.2556, -76.7112],
        [39.2626, -76.7164],
        [39.2681, -76.7245],
        [39.2727, -76.7314]
      ],
      routes: [
        {
          id: "MD-77",
          label: "77",
          shortName: "77",
          name: "LocalLink 77 - Catonsville / UMBC",
          color: "#4c7c6b",
          textColor: "#ffffff",
          from: "UMBC Transit Center",
          destinations: ["Catonsville", "Patapsco Station", "Arbutus"],
          headsign: "Catonsville",
          sample: [
            { busNumber: "7718", eta: 6, stop: "UMBC Transit Center", stopsAway: 1, meters: 320, progress: 0.31, bearing: 302 },
            { busNumber: "7741", eta: 17, stop: "Wilkens Ave / Walker Ave", stopsAway: 5, meters: 1880, progress: 0.09, bearing: 294 }
          ]
        },
        {
          id: "MD-PURPLE-UMBC",
          label: "PURPLE",
          shortName: "PURPLE",
          name: "CityLink PURPLE - Catonsville to Towson",
          color: "#7e3fad",
          textColor: "#ffffff",
          from: "Catonsville",
          destinations: ["Towson", "Catonsville", "Downtown Baltimore"],
          headsign: "Towson",
          sample: [
            { busNumber: "6194", eta: 13, stop: "Frederick Rd / Bloomsbury Ave", stopsAway: 4, meters: 1340, progress: 0.46, bearing: 67 }
          ]
        }
      ]
    },
    {
      id: "ny-new-york-brooklyn",
      stateCode: "NY",
      stateName: "New York",
      cityName: "New York City",
      locationName: "Brooklyn Bridge Park and Bay Ridge",
      agency: "MTA New York City Transit",
      provider: "MTA Bus Time",
      liveMode: "nyc-siri",
      liveNote: "Live through the MTA Bus Time SIRI VehicleMonitoring feed.",
      center: [40.6709, -73.9902],
      zoom: 13,
      home: { name: "Brooklyn Bridge Park Pier 6", lat: 40.6931, lng: -74.0008 },
      destination: { name: "Bay Ridge Shore Rd", lat: 40.6332, lng: -74.0369 },
      routes: [
        {
          id: "NY-B63",
          label: "B63",
          shortName: "B63",
          name: "B63 - Bay Ridge to Brooklyn Bridge Park",
          color: "#0f7a4f",
          textColor: "#ffffff",
          operatorRef: "MTA NYCT",
          lineRef: "MTA NYCT_B63",
          from: "Brooklyn Bridge Park Pier 6",
          destinations: ["BAY RIDGE SHORE RD via 5 AV", "BROOKLYN BRIDGE PARK PIER 6"]
        },
        {
          id: "NY-B41",
          label: "B41",
          shortName: "B41",
          name: "B41 - Downtown Brooklyn to Bergen Beach",
          color: "#0a66c2",
          textColor: "#ffffff",
          operatorRef: "MTA NYCT",
          lineRef: "MTA NYCT_B41",
          from: "Downtown Brooklyn",
          destinations: ["DOWNTOWN BKLYN CADMAN PLAZA", "BERGEN BEACH VETERANS AV"]
        }
      ]
    },
    {
      id: "dc-washington-core",
      stateCode: "DC",
      stateName: "District of Columbia",
      cityName: "Washington",
      locationName: "Union Station and Downtown",
      agency: "WMATA Metrobus",
      provider: "Provider-ready preview",
      liveMode: "preview",
      liveNote: "Add a WMATA live API key to replace the preview movement.",
      center: [38.8998, -77.0199],
      zoom: 13,
      home: { name: "Union Station", lat: 38.8971, lng: -77.0063 },
      destination: { name: "Metro Center", lat: 38.8983, lng: -77.0281 },
      routeLine: [
        [38.8971, -77.0063],
        [38.898, -77.0136],
        [38.8983, -77.0281]
      ],
      routes: [
        {
          id: "DC-X2",
          label: "X2",
          shortName: "X2",
          name: "X2 - Benning Road / H Street",
          color: "#d3422f",
          textColor: "#ffffff",
          from: "Union Station",
          destinations: ["Lafayette Square", "Minnesota Ave"],
          headsign: "Lafayette Square",
          sample: [
            { busNumber: "6214", eta: 6, stop: "H St NE / 8th St", stopsAway: 2, meters: 530, progress: 0.48, bearing: 260 }
          ]
        },
        {
          id: "DC-70",
          label: "70",
          shortName: "70",
          name: "70 - Georgia Avenue / 7th Street",
          color: "#315f9f",
          textColor: "#ffffff",
          from: "Gallery Place",
          destinations: ["Silver Spring", "Archives"],
          headsign: "Silver Spring",
          sample: [
            { busNumber: "7058", eta: 14, stop: "7th St NW / H St", stopsAway: 5, meters: 1700, progress: 0.24, bearing: 12 }
          ]
        }
      ]
    },
    {
      id: "ca-los-angeles-core",
      stateCode: "CA",
      stateName: "California",
      cityName: "Los Angeles",
      locationName: "Union Station and Downtown LA",
      agency: "LA Metro",
      provider: "Provider-ready preview",
      liveMode: "preview",
      liveNote: "Add an LA Metro compatible feed to replace the preview movement.",
      center: [34.0562, -118.2365],
      zoom: 12,
      home: { name: "Union Station", lat: 34.0562, lng: -118.2365 },
      destination: { name: "7th St / Metro Center", lat: 34.0486, lng: -118.2588 },
      routeLine: [
        [34.0562, -118.2365],
        [34.0521, -118.2468],
        [34.0486, -118.2588]
      ],
      routes: [
        {
          id: "CA-720",
          label: "720",
          shortName: "720",
          name: "720 - Wilshire Rapid",
          color: "#c2382f",
          textColor: "#ffffff",
          from: "Downtown LA",
          destinations: ["Santa Monica", "Commerce Center"],
          headsign: "Santa Monica",
          sample: [
            { busNumber: "7920", eta: 7, stop: "Wilshire / Figueroa", stopsAway: 2, meters: 740, progress: 0.36, bearing: 266 }
          ]
        }
      ]
    },
    {
      id: "il-chicago-loop",
      stateCode: "IL",
      stateName: "Illinois",
      cityName: "Chicago",
      locationName: "Loop and River North",
      agency: "Chicago Transit Authority",
      provider: "Provider-ready preview",
      liveMode: "preview",
      liveNote: "Add a CTA Bus Tracker key to replace the preview movement.",
      center: [41.8837, -87.6323],
      zoom: 13,
      home: { name: "Clark/Lake", lat: 41.8857, lng: -87.6309 },
      destination: { name: "Michigan Ave", lat: 41.8882, lng: -87.6244 },
      routeLine: [
        [41.8857, -87.6309],
        [41.8851, -87.6272],
        [41.8882, -87.6244]
      ],
      routes: [
        {
          id: "IL-22",
          label: "22",
          shortName: "22",
          name: "22 - Clark",
          color: "#2c6d74",
          textColor: "#ffffff",
          from: "Loop",
          destinations: ["Howard", "Harrison"],
          headsign: "Howard",
          sample: [
            { busNumber: "2241", eta: 9, stop: "Dearborn / Lake", stopsAway: 3, meters: 880, progress: 0.4, bearing: 8 }
          ]
        }
      ]
    }
  ]
};

const cache = new Map();

const MDOT_ROUTE_IDS = {
  "MD-RD": "11743",
  "MD-BROWN": "11735",
  "MD-52": "11651",
  "MD-21": "11638",
  "MD-22": "11639",
  "MD-26": "11640",
  "MD-28": "11641",
  "MD-29": "11642",
  "MD-30": "11643",
  "MD-31": "11644",
  "MD-32": "15552",
  "MD-33": "11645",
  "MD-34": "11646",
  "MD-93": "11679",
  "MD-BLUE": "11734",
  "MD-GREEN": "11737",
  "MD-LIME": "11738",
  "MD-ORANGE": "11740",
  "MD-PINK": "11741",
  "MD-NAVY": "11739",
  "MD-PURPLE": "11742",
  "MD-SILVER": "11744",
  "MD-YELLOW": "11745",
  "MD-GOLD": "11736",
  "MD-80": "11670",
  "MD-75": "11665",
  "MD-77": "11667",
  "MD-PURPLE-UMBC": "11742"
};

const MDOT_INTERNAL_ROUTE_BY_GTFS = Object.fromEntries(
  Object.entries(MDOT_ROUTE_IDS).map(([internalId, gtfsRouteId]) => [gtfsRouteId, internalId])
);

const MDOT_OFFICIAL_ROUTE_CATALOG = [
  { route_id: "11734", route_short_name: "CityLink BLUE", route_long_name: "CMS - Johns Hopkins Bayview", route_color: "0072BC", route_text_color: "FFFFFF" },
  { route_id: "11735", route_short_name: "CityLink BROWN", route_long_name: "Overlea - Downtown", route_color: "6E4C2F", route_text_color: "FFFFFF" },
  { route_id: "11736", route_short_name: "CityLink GOLD", route_long_name: "Walbrook Junction - Canton", route_color: "8A7938", route_text_color: "FFFFFF" },
  { route_id: "11737", route_short_name: "CityLink GREEN", route_long_name: "Downtown - Towson", route_color: "008343", route_text_color: "FFFFFF" },
  { route_id: "11738", route_short_name: "CityLink LIME", route_long_name: "NW Hospital - Harbor East", route_color: "6CA043", route_text_color: "FFFFFF" },
  { route_id: "11739", route_short_name: "CityLink NAVY", route_long_name: "Mondawmin - Dundalk", route_color: "2E3192", route_text_color: "FFFFFF" },
  { route_id: "11740", route_short_name: "CityLink ORANGE", route_long_name: "Essex - West Baltimore MARC", route_color: "E7731F", route_text_color: "FFFFFF" },
  { route_id: "11741", route_short_name: "CityLink PINK", route_long_name: "Cedonia - West Baltimore MARC", route_color: "D60080", route_text_color: "FFFFFF" },
  { route_id: "11742", route_short_name: "CityLink PURPLE", route_long_name: "City Hall - Paradise/Catonsville", route_color: "851F83", route_text_color: "FFFFFF" },
  { route_id: "11743", route_short_name: "CityLink RED", route_long_name: "Downtown - Towson/Lutherville", route_color: "D71920", route_text_color: "FFFFFF" },
  { route_id: "11744", route_short_name: "CityLink SILVER", route_long_name: "Curtis Bay - Hopkins/Morgan State", route_color: "48626F", route_text_color: "FFFFFF" },
  { route_id: "11745", route_short_name: "CityLink YELLOW", route_long_name: "Mt Vernon - Patapsco", route_color: "F9E500", route_text_color: "000000" },
  { route_id: "11638", route_short_name: "21", route_long_name: "Woodberry - Canton Crossing", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11639", route_short_name: "22", route_long_name: "Mondawmin - Bayview", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11640", route_short_name: "26", route_long_name: "Patapsco Station - Mondawmin", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11641", route_short_name: "28", route_long_name: "Moravia - Rogers Ave Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11642", route_short_name: "29", route_long_name: "Mondawmin - Brooklyn", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11643", route_short_name: "30", route_long_name: "Rogers Ave - Hollander Ridge", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11644", route_short_name: "31", route_long_name: "Sinai Hospital - Security Square", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "15552", route_short_name: "32", route_long_name: "Catonsville - Patapsco Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11645", route_short_name: "33", route_long_name: "Mt Washington Station - White Marsh", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11646", route_short_name: "34", route_long_name: "Falls Rd/Greenspring - Catonsville", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11647", route_short_name: "36", route_long_name: "Towson Town Center - Fox Ridge", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11648", route_short_name: "37", route_long_name: "Old Court - UMBC/Catonsville", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "17178", route_short_name: "40", route_long_name: "CMS - Essex", route_color: "A0A0A4", route_text_color: "FFFFFF" },
  { route_id: "11650", route_short_name: "51", route_long_name: "Towson - Downtown", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11651", route_short_name: "52", route_long_name: "Greenmount North - Stella Maris", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11652", route_short_name: "53", route_long_name: "State Center - Towson", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11653", route_short_name: "54", route_long_name: "State Center - Carney/Hillendale", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11654", route_short_name: "56", route_long_name: "Downtown - White Marsh", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11655", route_short_name: "57", route_long_name: "Belair - Edison Circulator", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11656", route_short_name: "59", route_long_name: "Moravia - Whispering Woods", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11657", route_short_name: "62", route_long_name: "CCBC Essex - Turner Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11658", route_short_name: "63", route_long_name: "Gardenville - Tradepoint Atlantic", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11659", route_short_name: "65", route_long_name: "Downtown - Dundalk", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11660", route_short_name: "67", route_long_name: "Downtown - Marley Neck", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11661", route_short_name: "69", route_long_name: "Patapsco Station - Jumpers Hole", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11662", route_short_name: "70", route_long_name: "Patapsco Station - Annapolis", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11663", route_short_name: "71", route_long_name: "Downtown - Patapsco Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11664", route_short_name: "73", route_long_name: "State Center - Patapsco Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11665", route_short_name: "75", route_long_name: "Patapsco Station - Arundel Mills", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11666", route_short_name: "76", route_long_name: "CCBC - Downtown", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11667", route_short_name: "77", route_long_name: "West Baltimore MARC - Catonsville", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11668", route_short_name: "78", route_long_name: "Downtown - CMS", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11669", route_short_name: "79", route_long_name: "Mondawmin - CMS", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11670", route_short_name: "80", route_long_name: "Downtown - Rogers Ave Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11671", route_short_name: "81", route_long_name: "Deer Park - Milford Mill Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11672", route_short_name: "82", route_long_name: "Park Circle - Reisterstown Plaza", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11673", route_short_name: "83", route_long_name: "Mondawmin - Old Court Station", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11674", route_short_name: "85", route_long_name: "North Ave LR - Milford Mill", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11675", route_short_name: "87", route_long_name: "Glyndon - Owings Mills", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11676", route_short_name: "89", route_long_name: "Rogers Ave - Owings Mills", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11677", route_short_name: "91", route_long_name: "Mondawmin - Sinai Hospital", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11678", route_short_name: "92", route_long_name: "Glen - Baas & Talmudical", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11679", route_short_name: "93", route_long_name: "Towson - Hunt Valley", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11680", route_short_name: "94", route_long_name: "Fort McHenry - Sinai Hospital", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11681", route_short_name: "95", route_long_name: "Downtown - Roland Park", route_color: "808285", route_text_color: "FFFFFF" },
  { route_id: "11684", route_short_name: "103", route_long_name: "Downtown - Cromwell Bridge", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "11686", route_short_name: "105", route_long_name: "Cedonia - Downtown", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "11687", route_short_name: "115", route_long_name: "Downtown - Perry Hall", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "11688", route_short_name: "120", route_long_name: "White Marsh - Downtown/Hopkins", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "11689", route_short_name: "150", route_long_name: "Columbia - Downtown/Harbor East", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "11690", route_short_name: "154", route_long_name: "State Center - Carney/Hillendale", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "11691", route_short_name: "160", route_long_name: "Downtown/Hopkins - Essex", route_color: "262727", route_text_color: "FFFFFF" },
  { route_id: "14498", route_short_name: "163", route_long_name: "West Baltimore MARC - Tradepoint", route_color: "262727", route_text_color: "FFFFFF" }
];

const MDOT_STOP_POINTS = {
  "MD-RD": [
    { stopId: "14083", stopName: "Lutherville Light Rail Station Bay 1", progress: 0.05, from: "Lutherville Light Rail", bearing: 149 },
    { stopId: "1646", stopName: "York Rd & Radnor Ave Opp NB", progress: 0.44, from: "York Rd / Radnor Ave", bearing: 178 },
    { stopId: "14135", stopName: "Towson Town Center Bay 1", progress: 0.82, from: "Towson Town Center", bearing: 94 }
  ],
  "MD-BROWN": [
    { stopId: "66", stopName: "Baltimore St & Charles St", progress: 0.45, from: "Downtown Baltimore", bearing: 44 },
    { stopId: "3038", stopName: "Saratoga St & Charles St EB", progress: 0.38, from: "Downtown Baltimore", bearing: 56 }
  ],
  "MD-52": [
    { stopId: "1646", stopName: "York Rd & Radnor Ave Opp NB", progress: 0.42, from: "York Rd / Radnor Ave", bearing: 32 },
    { stopId: "1561", stopName: "York Rd & Radnor Rd SB", progress: 0.58, from: "York Rd / Radnor Ave", bearing: 202 }
  ],
  "MD-21": [
    { stopId: "3038", stopName: "Saratoga St & Charles St EB", progress: 0.42, from: "Downtown Baltimore", bearing: 93 },
    { stopId: "2671", stopName: "Wolfe St & Pratt St SB", progress: 0.72, from: "Canton Crossing", bearing: 144 }
  ],
  "MD-22": [
    { stopId: "13528", stopName: "Mondawmin Metro Station Bay 8", progress: 0.18, from: "Mondawmin", bearing: 82 },
    { stopId: "10764", stopName: "Bayview Blvd & Mason Lord Dr", progress: 0.86, from: "Johns Hopkins Bayview", bearing: 76 }
  ],
  "MD-26": [
    { stopId: "13528", stopName: "Mondawmin Metro Station Bay 8", progress: 0.72, from: "Mondawmin", bearing: 181 },
    { stopId: "11175", stopName: "BWI International Terminal EB Upper Level", progress: 0.12, from: "Patapsco corridor", bearing: 352 }
  ],
  "MD-28": [
    { stopId: "5605", stopName: "Cold Spring Ln & York Rd EB FS", progress: 0.51, from: "Cold Spring Ln / York Rd", bearing: 108 },
    { stopId: "5654", stopName: "Cold Spring Ln & York Rd WB", progress: 0.49, from: "Cold Spring Ln / York Rd", bearing: 287 }
  ],
  "MD-29": [
    { stopId: "13528", stopName: "Mondawmin Metro Station Bay 8", progress: 0.12, from: "Mondawmin", bearing: 184 },
    { stopId: "14107", stopName: "West Baltimore MARC Station Bay 1", progress: 0.42, from: "West Baltimore", bearing: 186 }
  ],
  "MD-93": [
    { stopId: "14084", stopName: "Lutherville Light Rail Station Bay 2", progress: 0.16, from: "Lutherville Light Rail", bearing: 152 },
    { stopId: "14135", stopName: "Towson Town Center Bay 1", progress: 0.76, from: "Towson Town Center", bearing: 103 }
  ],
  "MD-BLUE": [
    { stopId: "4351", stopName: "Highland Ave & Pratt St SB", progress: 0.34, from: "Inner Harbor / Pratt St", bearing: 54 },
    { stopId: "10764", stopName: "Bayview Blvd & Mason Lord Dr", progress: 0.88, from: "Johns Hopkins Bayview", bearing: 76 }
  ],
  "MD-ORANGE": [
    { stopId: "66", stopName: "Baltimore St & Charles St", progress: 0.31, from: "Downtown Baltimore", bearing: 274 },
    { stopId: "14109", stopName: "West Baltimore MARC Station Bay 3", progress: 0.82, from: "West Baltimore MARC", bearing: 268 }
  ],
  "MD-GREEN": [
    { stopId: "531", stopName: "Charles St & Penn Station NB", progress: 0.28, from: "Penn Station", bearing: 12 },
    { stopId: "14135", stopName: "Towson Town Center Bay 1", progress: 0.86, from: "Towson Town Center", bearing: 14 }
  ],
  "MD-LIME": [
    { stopId: "13528", stopName: "Mondawmin Metro Station Bay 8", progress: 0.44, from: "Mondawmin", bearing: 132 },
    { stopId: "1271", stopName: "Pratt St & Market Pl", progress: 0.78, from: "Harbor East", bearing: 101 }
  ],
  "MD-PINK": [
    { stopId: "66", stopName: "Baltimore St & Charles St", progress: 0.42, from: "Downtown Baltimore", bearing: 268 },
    { stopId: "14109", stopName: "West Baltimore MARC Station Bay 3", progress: 0.84, from: "West Baltimore MARC", bearing: 272 }
  ],
  "MD-NAVY": [
    { stopId: "1271", stopName: "Pratt St & Market Pl", progress: 0.39, from: "Inner Harbor", bearing: 101 },
    { stopId: "13528", stopName: "Mondawmin Metro Station Bay 8", progress: 0.07, from: "Mondawmin Metro", bearing: 166 }
  ],
  "MD-PURPLE": [
    { stopId: "66", stopName: "Baltimore St & Charles St", progress: 0.28, from: "Downtown Baltimore", bearing: 354 },
    { stopId: "272", stopName: "Pratt St & Fulton Ave EB", progress: 0.62, from: "West Baltimore", bearing: 86 }
  ],
  "MD-SILVER": [
    { stopId: "531", stopName: "Charles St & Penn Station NB", progress: 0.24, from: "Penn Station", bearing: 23 },
    { stopId: "14149", stopName: "Morgan State University", progress: 0.83, from: "Morgan State University", bearing: 72 }
  ],
  "MD-YELLOW": [
    { stopId: "66", stopName: "Baltimore St & Charles St", progress: 0.48, from: "Downtown Baltimore", bearing: 176 },
    { stopId: "3038", stopName: "Saratoga St & Charles St EB", progress: 0.36, from: "Mt Vernon", bearing: 355 }
  ],
  "MD-GOLD": [
    { stopId: "2633", stopName: "North Ave & Charles St EB", progress: 0.38, from: "North Avenue", bearing: 92 },
    { stopId: "2671", stopName: "Wolfe St & Pratt St SB", progress: 0.72, from: "Canton", bearing: 185 }
  ],
  "MD-80": [
    { stopId: "3038", stopName: "Saratoga St & Charles St EB", progress: 0.45, from: "Downtown Baltimore", bearing: 82 },
    { stopId: "7218", stopName: "Garrison Blvd & Mondawmin Ave NB", progress: 0.19, from: "Mondawmin", bearing: 12 }
  ],
  "MD-75": [
    { stopId: "11175", stopName: "BWI International Terminal EB Upper Level", progress: 0.12, from: "BWI Airport Terminal", bearing: 327 },
    { stopId: "14119", stopName: "BWI Business District Light Rail Station Bay 1", progress: 0.46, from: "BWI Business District", bearing: 318 }
  ],
  "MD-77": [
    { stopId: "14107", stopName: "West Baltimore MARC Station Bay 1", progress: 0.08, from: "West Baltimore MARC", bearing: 278 }
  ],
  "MD-PURPLE-UMBC": [
    { stopId: "272", stopName: "Pratt St & Fulton Ave EB", progress: 0.42, from: "Catonsville", bearing: 67 },
    { stopId: "66", stopName: "Baltimore St & Charles St", progress: 0.72, from: "Downtown Baltimore", bearing: 354 }
  ]
};

function transitlandHeaders() {
  return TRANSITLAND_API_KEY ? { apikey: TRANSITLAND_API_KEY } : {};
}

function transitlandUrl(pathname, params = {}) {
  const base = String(TRANSITLAND_API_BASE || "https://transit.land/api/v2/rest").replace(/\/+$/, "");
  const url = new URL(`${base}${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function routeGtfsId(route) {
  return String((route && (route.gtfsRouteId || route.routeId)) || MDOT_ROUTE_IDS[route && route.id] || "");
}

function normalizeTransitColor(value, fallback) {
  const cleaned = String(value || "").replace(/^#/, "").trim();
  return /^[0-9a-f]{6}$/i.test(cleaned) ? `#${cleaned}` : fallback;
}

function colorFromRouteText(text) {
  const palette = ["#005eb8", "#00843d", "#c8102e", "#f6a800", "#6f2da8", "#008c95", "#d45d00", "#53565a"];
  const seed = String(text || "route").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[seed % palette.length];
}

function textColorForBackground(color) {
  const cleaned = String(color || "").replace(/^#/, "");
  if (!/^[0-9a-f]{6}$/i.test(cleaned)) return "#ffffff";
  const red = parseInt(cleaned.slice(0, 2), 16);
  const green = parseInt(cleaned.slice(2, 4), 16);
  const blue = parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#09111a" : "#ffffff";
}

function routeLabelFromShortName(shortName, gtfsRouteId) {
  return String(shortName || gtfsRouteId || "Route")
    .replace(/^CityLink\s+/i, "")
    .replace(/^LocalLink\s+/i, "")
    .replace(/^QuickLink\s+/i, "")
    .replace(/^Express\s+BusLink\s+/i, "")
    .trim();
}

function routeFamilyName(label, rawShortName) {
  const raw = String(rawShortName || "");
  if (/CityLink/i.test(raw)) return "CityLink";
  if (/QuickLink/i.test(raw) || label === "40") return "QuickLink";
  if (/Express/i.test(raw) || Number(label) >= 100) return "Express BusLink";
  if (/^\d+$/.test(String(label))) return "LocalLink";
  return "MDOT MTA";
}

function compactRouteName(label, longName, rawShortName) {
  const cleanLong = String(longName || "").trim();
  const cleanLabel = String(label || "").trim();
  const family = routeFamilyName(cleanLabel, rawShortName);
  const prefix = family === "MDOT MTA" ? cleanLabel || "Route" : `${family} ${cleanLabel}`;
  if (!cleanLong) return `${prefix} - MDOT MTA`;
  return cleanLong.toLowerCase().startsWith(`${cleanLabel.toLowerCase()} -`)
    ? cleanLong
    : `${prefix} - ${cleanLong}`;
}

function routeDestinationsFromLongName(longName) {
  const text = String(longName || "").trim();
  const parts = text.split(/\s+-\s+|\s+to\s+/i).map((part) => part.trim()).filter(Boolean);
  const destinations = parts.length > 1 ? [parts[0], parts[parts.length - 1], text] : [text || "Destination not posted"];
  return Array.from(new Set(destinations));
}

function routeLineFromTransitlandGeometry(geometry) {
  if (!geometry || typeof geometry !== "object") return [];
  const coordinates = geometry.type === "LineString"
    ? geometry.coordinates
    : geometry.type === "MultiLineString"
      ? geometry.coordinates.reduce((longest, line) => (line.length > longest.length ? line : longest), [])
      : [];
  return coordinates
    .map((coord) => Array.isArray(coord) ? [Number(coord[1]), Number(coord[0])] : null)
    .filter((coord) => coord && Number.isFinite(coord[0]) && Number.isFinite(coord[1]));
}

function transitlandRouteToCatalogRoute(route, index) {
  const gtfsRouteId = String(route.route_id || route.routeId || route.id || "");
  if (!gtfsRouteId) return null;
  const rawShortName = String(route.route_short_name || route.routeShortName || route.route_id || gtfsRouteId).trim();
  const label = routeLabelFromShortName(rawShortName, gtfsRouteId);
  const longName = String(route.route_long_name || route.routeLongName || route.route_desc || "").trim();
  const fallbackColor = colorFromRouteText(label || longName || gtfsRouteId);
  const color = normalizeTransitColor(route.route_color || route.routeColor, fallbackColor);
  const destinations = routeDestinationsFromLongName(longName || label);
  const routeLine = routeLineFromTransitlandGeometry(route.geometry);
  const catalogRoute = {
    id: `MD-GTFS-${gtfsRouteId}`,
    gtfsRouteId,
    transitlandOnestopId: route.onestop_id || route.onestopId || "",
    label,
    shortName: label,
    name: compactRouteName(label, longName, rawShortName),
    color,
    textColor: normalizeTransitColor(route.route_text_color || route.routeTextColor, textColorForBackground(color)),
    from: destinations[0] || "Maryland",
    destinations,
    headsign: destinations[destinations.length > 1 ? 1 : 0] || destinations[0] || "Destination not posted",
    aliases: [
      `GTFS ${gtfsRouteId}`,
      `MDOT route ${label}`,
      `Maryland route ${label}`,
      rawShortName,
      longName
    ].filter(Boolean),
    sample: []
  };
  if (routeLine.length > 1 && index < 60) catalogRoute.routeLine = routeLine;
  return catalogRoute;
}

function mergeCatalogRoutes(baseRoutes, transitlandRoutes) {
  const merged = [];
  const seen = new Set();
  baseRoutes.forEach((route) => {
    const gtfsRouteId = routeGtfsId(route);
    const key = gtfsRouteId || route.id;
    seen.add(key);
    merged.push({ ...route });
  });
  transitlandRoutes.forEach((route) => {
    const key = routeGtfsId(route) || route.id;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(route);
  });
  return merged.sort((a, b) => {
    const aNum = Number(String(a.label).replace(/\D/g, ""));
    const bNum = Number(String(b.label).replace(/\D/g, ""));
    if (Number.isFinite(aNum) && Number.isFinite(bNum) && aNum !== bNum) return aNum - bNum;
    return String(a.label).localeCompare(String(b.label), undefined, { numeric: true });
  });
}

async function fetchTransitlandMarylandCatalogRoutes() {
  if (!TRANSITLAND_API_KEY) return [];
  const cacheKey = "transitland:maryland:routes";
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 6 * 60 * 60 * 1000) return cached.payload;

  const url = transitlandUrl("/routes", {
    feed_onestop_id: TRANSITLAND_MARYLAND_STATIC_FEED_KEY,
    route_types: "3",
    include_geometry: "true",
    include_stops: "false",
    include_alerts: "false",
    limit: 500
  });
  const data = await fetchJsonWithTimeout(url, 12000, transitlandHeaders());
  const routes = Array.isArray(data.routes) ? data.routes : [];
  const catalogRoutes = routes
    .map((route, index) => transitlandRouteToCatalogRoute(route, index))
    .filter(Boolean);
  cache.set(cacheKey, { createdAt: Date.now(), payload: catalogRoutes });
  return catalogRoutes;
}

async function catalogLocations() {
  const officialRoutes = MDOT_OFFICIAL_ROUTE_CATALOG
    .map((route, index) => transitlandRouteToCatalogRoute(route, index))
    .filter(Boolean);
  const transitlandRoutes = await fetchTransitlandMarylandCatalogRoutes().catch(() => []);
  const expandedRoutes = mergeCatalogRoutes(officialRoutes, transitlandRoutes);
  return CATALOG.locations.map((location) => {
    const cloned = { ...location, routes: location.routes.map((route) => ({ ...route })) };
    if (location.stateCode === "MD" && expandedRoutes.length) {
      cloned.routes = mergeCatalogRoutes(cloned.routes, expandedRoutes);
      cloned.provider = TRANSITLAND_API_KEY ? "Transitland + MDOT MTA" : "MDOT MTA";
      cloned.liveMode = TRANSITLAND_API_KEY ? "transitland-gtfs-rt" : "mdot-arrivals";
      cloned.liveNote = TRANSITLAND_API_KEY
        ? "Transitland GTFS-Realtime GPS is used first; MDOT MTA stop-arrival timing and clean previews fill gaps when GPS is not posted."
        : "Official MDOT MTA route catalog with public live stop-arrival timing. Add an authorized Transitland key for exact GPS vehicle positions.";
    }
    return cloned;
  });
}

function allRoutes(locations = CATALOG.locations) {
  return locations.flatMap((location) => (
    location.routes.map((route) => ({
      id: route.id,
      label: route.label,
      name: route.name,
      stateCode: location.stateCode,
      cityName: location.cityName,
      locationId: location.id,
      agency: location.agency,
      destinations: route.destinations
    }))
  ));
}

async function publicCatalog() {
  const locations = await catalogLocations();
  const stateMap = new Map();

  locations.forEach((location) => {
    if (!stateMap.has(location.stateCode)) {
      stateMap.set(location.stateCode, {
        code: location.stateCode,
        name: location.stateName,
        cities: []
      });
    }

    const state = stateMap.get(location.stateCode);
    let city = state.cities.find((item) => item.name === location.cityName);
    if (!city) {
      city = { name: location.cityName, locations: [] };
      state.cities.push(city);
    }

    city.locations.push({
      id: location.id,
      name: location.locationName,
      agency: location.agency,
      provider: location.provider,
      liveMode: location.liveMode,
      liveNote: location.liveNote,
      center: location.center,
      zoom: location.zoom,
      home: location.home,
      destination: location.destination,
      aliases: location.aliases || [],
      routes: location.routes.map((route) => ({
        id: route.id,
        label: route.label,
        shortName: route.shortName,
        name: route.name,
        color: route.color,
        textColor: route.textColor,
        from: route.from,
        destinations: route.destinations,
        aliases: route.aliases || [],
        headsign: route.headsign || route.destinations[0],
        sampleBusNumbers: (route.sample || []).map((item) => item.busNumber)
      }))
    });
  });

  return {
    states: Array.from(stateMap.values()),
    locations: locations.map((location) => ({
      id: location.id,
      stateCode: location.stateCode,
      stateName: location.stateName,
      cityName: location.cityName,
      locationName: location.locationName,
      agency: location.agency,
      provider: location.provider,
      liveMode: location.liveMode,
      liveNote: location.liveNote,
      center: location.center,
      zoom: location.zoom,
      home: location.home,
      destination: location.destination,
      aliases: location.aliases || [],
      routes: location.routes.map((route) => ({
        id: route.id,
        label: route.label,
        shortName: route.shortName,
        name: route.name,
        color: route.color,
        textColor: route.textColor,
        from: route.from,
        destinations: route.destinations,
        aliases: route.aliases || [],
        headsign: route.headsign || route.destinations[0],
        sampleBusNumbers: (route.sample || []).map((item) => item.busNumber)
      }))
    })),
    routes: allRoutes(locations)
  };
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function firstText(value, fallback = "") {
  const arr = asArray(value);
  const text = arr.length ? arr[0] : value;
  return typeof text === "string" ? text : fallback;
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanBusRef(value) {
  const text = String(value || "");
  const parts = text.split("_");
  return parts[parts.length - 1] || text || "unknown";
}

function routeById(location, routeId) {
  return location.routes.find((route) => route.id === routeId) || location.routes[0];
}

function locationById(locationId) {
  return CATALOG.locations.find((location) => location.id === locationId) || CATALOG.locations[0];
}

async function activeLocationById(locationId) {
  const locations = await catalogLocations();
  return locations.find((location) => location.id === locationId) || locations[0] || locationById(locationId);
}

function toStop(call) {
  if (!call) return null;
  const distances = call.Extensions && call.Extensions.Distances ? call.Extensions.Distances : {};
  return {
    stopId: call.StopPointRef || "",
    stopName: firstText(call.StopPointName, "Stop not published"),
    proximity: call.ArrivalProximityText || distances.PresentableDistance || "",
    expectedArrivalTime: call.ExpectedArrivalTime || call.AimedArrivalTime || "",
    expectedDepartureTime: call.ExpectedDepartureTime || call.AimedDepartureTime || "",
    distanceFromStopMeters: numberOrNull(call.DistanceFromStop || distances.DistanceFromCall),
    numberOfStopsAway: numberOrNull(call.NumberOfStopsAway || distances.StopsFromCall)
  };
}

function normalizeNycVehicle(activity, location, route) {
  const journey = activity.MonitoredVehicleJourney || {};
  const vehicleLocation = journey.VehicleLocation || {};
  const monitoredCall = toStop(journey.MonitoredCall || {});
  const onwardCalls = asArray(journey.OnwardCalls && journey.OnwardCalls.OnwardCall)
    .map(toStop)
    .filter(Boolean)
    .slice(0, 5);
  const busNumber = cleanBusRef(journey.VehicleRef);
  const destination = firstText(journey.DestinationName, route.destinations[0]);

  return {
    id: `${route.id}-${busNumber}`,
    routeId: route.id,
    routeLabel: firstText(journey.PublishedLineName, route.label),
    routeName: route.name,
    routeColor: route.color,
    textColor: route.textColor,
    busName: `${location.agency} Bus ${busNumber}`,
    busNumber,
    agency: location.agency,
    provider: location.provider,
    stateCode: location.stateCode,
    cityName: location.cityName,
    from: route.from,
    destination,
    destinationPoint: destination.toLowerCase().includes("bay ridge") ? location.destination : location.home,
    nextStop: monitoredCall,
    onwardCalls,
    latitude: numberOrNull(vehicleLocation.Latitude),
    longitude: numberOrNull(vehicleLocation.Longitude),
    bearing: numberOrNull(journey.Bearing),
    progressRate: journey.ProgressRate || "",
    progressStatus: asArray(journey.ProgressStatus).filter(Boolean),
    monitored: Boolean(journey.Monitored),
    situationRefs: asArray(journey.SituationRef)
      .map((item) => item && (item.SituationSimpleRef || item))
      .filter(Boolean),
    recordedAtTime: activity.RecordedAtTime || "",
    lineRef: journey.LineRef || route.lineRef,
    directionRef: journey.DirectionRef || "",
    isRealtime: true
  };
}

async function fetchNycRoute(location, route) {
  const cacheKey = `${location.id}:${route.id}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 15000) return cached.payload;

  const url = new URL(NYC_SIRI_URL);
  url.searchParams.set("key", NYC_API_KEY);
  url.searchParams.set("version", "2");
  url.searchParams.set("OperatorRef", route.operatorRef);
  url.searchParams.set("LineRef", route.lineRef);
  url.searchParams.set("VehicleMonitoringDetailLevel", "calls");
  url.searchParams.set("MaximumStopVisits", "10");
  url.searchParams.set("MaximumNumberOfCallsOnwards", "5");

  const controller = new AbortController();
  let timeout;

  try {
    const upstream = await Promise.race([
      fetch(url, {
        signal: controller.signal,
        headers: { "user-agent": "TransitPulse/1.0" }
      }),
      new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          controller.abort();
          reject(new Error("Live provider timed out after 10 seconds"));
        }, 10000);
      })
    ]);

    if (!upstream.ok) throw new Error(`MTA Bus Time responded ${upstream.status}`);

    const payload = await upstream.json();
    const delivery = asArray(payload && payload.Siri && payload.Siri.ServiceDelivery && payload.Siri.ServiceDelivery.VehicleMonitoringDelivery)[0] || {};
    const errorText = delivery.ErrorCondition && delivery.ErrorCondition.OtherError && delivery.ErrorCondition.OtherError.ErrorText;
    if (errorText) throw new Error(errorText);

    const vehicles = asArray(delivery.VehicleActivity)
      .map((activity) => normalizeNycVehicle(activity, location, route))
      .filter((vehicle) => Number.isFinite(vehicle.latitude) && Number.isFinite(vehicle.longitude));

    const result = {
      live: true,
      mode: "live",
      source: location.liveNote,
      responseTimestamp: delivery.ResponseTimestamp || new Date().toISOString(),
      location: publicLocation(location),
      route: publicRoute(route),
      vehicles
    };

    cache.set(cacheKey, { createdAt: Date.now(), payload: result });
    return result;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function interpolateLine(points, progress) {
  if (!points || points.length < 2) return points && points[0] ? points[0] : [0, 0];
  const clamped = Math.max(0, Math.min(1, progress));
  const scaled = clamped * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const start = points[index];
  const end = points[index + 1];
  return [
    start[0] + (end[0] - start[0]) * local,
    start[1] + (end[1] - start[1]) * local
  ];
}

function jitter(value, amount) {
  return value + Math.sin(Date.now() / 120000 + value * 100) * amount;
}

async function fetchJsonWithTimeout(url, timeoutMs = 8000, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "TransitPulse/1.0",
        accept: "application/json,*/*",
        ...headers
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchBufferWithTimeout(url, timeoutMs = 10000, headers = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "TransitPulse/1.0",
        accept: "application/x-protobuf,application/octet-stream,*/*",
        ...headers
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
}

function readProtoVarint(buffer, state) {
  let result = 0;
  let shift = 0;
  while (state.offset < buffer.length) {
    const byte = buffer[state.offset];
    state.offset += 1;
    result += (byte & 0x7f) * (2 ** shift);
    if ((byte & 0x80) === 0) return result;
    shift += 7;
  }
  return result;
}

function readProtoFields(buffer) {
  const fields = [];
  const state = { offset: 0 };

  while (state.offset < buffer.length) {
    const tag = readProtoVarint(buffer, state);
    if (!tag) break;
    const fieldNumber = Math.floor(tag / 8);
    const wireType = tag % 8;
    let value = null;

    if (wireType === 0) {
      value = readProtoVarint(buffer, state);
    } else if (wireType === 1) {
      value = buffer.readDoubleLE(state.offset);
      state.offset += 8;
    } else if (wireType === 2) {
      const length = readProtoVarint(buffer, state);
      value = buffer.subarray(state.offset, state.offset + length);
      state.offset += length;
    } else if (wireType === 5) {
      value = buffer.readFloatLE(state.offset);
      state.offset += 4;
    } else {
      break;
    }

    fields.push({ fieldNumber, wireType, value });
  }

  return fields;
}

function protoField(fields, fieldNumber) {
  return fields.find((field) => field.fieldNumber === fieldNumber);
}

function protoString(fields, fieldNumber, fallback = "") {
  const field = protoField(fields, fieldNumber);
  return field && Buffer.isBuffer(field.value) ? field.value.toString("utf8") : fallback;
}

function protoNumber(fields, fieldNumber, fallback = null) {
  const field = protoField(fields, fieldNumber);
  return field && Number.isFinite(Number(field.value)) ? Number(field.value) : fallback;
}

function protoMessage(fields, fieldNumber) {
  const field = protoField(fields, fieldNumber);
  return field && Buffer.isBuffer(field.value) ? readProtoFields(field.value) : [];
}

function parseGtfsTripDescriptor(buffer) {
  const fields = readProtoFields(buffer);
  return {
    tripId: protoString(fields, 1),
    startTime: protoString(fields, 2),
    startDate: protoString(fields, 3),
    scheduleRelationship: protoNumber(fields, 4),
    routeId: protoString(fields, 5),
    directionId: protoNumber(fields, 6)
  };
}

function parseGtfsVehicleDescriptor(buffer) {
  const fields = readProtoFields(buffer);
  return {
    id: protoString(fields, 1),
    label: protoString(fields, 2),
    licensePlate: protoString(fields, 3)
  };
}

function parseGtfsPosition(buffer) {
  const fields = readProtoFields(buffer);
  return {
    latitude: protoNumber(fields, 1),
    longitude: protoNumber(fields, 2),
    bearing: protoNumber(fields, 3),
    odometer: protoNumber(fields, 4),
    speed: protoNumber(fields, 5)
  };
}

function parseGtfsVehiclePosition(buffer) {
  const fields = readProtoFields(buffer);
  const tripBytes = protoField(fields, 1);
  const positionBytes = protoField(fields, 2);
  const vehicleBytes = protoField(fields, 8);

  return {
    trip: tripBytes && Buffer.isBuffer(tripBytes.value) ? parseGtfsTripDescriptor(tripBytes.value) : {},
    position: positionBytes && Buffer.isBuffer(positionBytes.value) ? parseGtfsPosition(positionBytes.value) : {},
    currentStopSequence: protoNumber(fields, 3),
    currentStatus: protoNumber(fields, 4),
    timestamp: protoNumber(fields, 5),
    congestionLevel: protoNumber(fields, 6),
    stopId: protoString(fields, 7),
    vehicle: vehicleBytes && Buffer.isBuffer(vehicleBytes.value) ? parseGtfsVehicleDescriptor(vehicleBytes.value) : {},
    occupancyStatus: protoNumber(fields, 9),
    occupancyPercentage: protoNumber(fields, 10)
  };
}

function parseGtfsRealtimeVehicles(buffer) {
  const fields = readProtoFields(buffer);
  const headerFields = protoMessage(fields, 1);
  const entities = fields
    .filter((field) => field.fieldNumber === 2 && Buffer.isBuffer(field.value))
    .map((field) => {
      const entityFields = readProtoFields(field.value);
      const vehicleField = protoField(entityFields, 4);
      return {
        id: protoString(entityFields, 1),
        vehicle: vehicleField && Buffer.isBuffer(vehicleField.value) ? parseGtfsVehiclePosition(vehicleField.value) : null
      };
    })
    .filter((entity) => entity.vehicle && entity.vehicle.position);

  return {
    header: {
      gtfsRealtimeVersion: protoString(headerFields, 1),
      timestamp: protoNumber(headerFields, 3)
    },
    entities
  };
}

function swiftlyRequestHeaders() {
  if (!SWIFTLY_AUTH_HEADER) return null;
  return { authorization: SWIFTLY_AUTH_HEADER };
}

async function fetchSwiftlyMarylandVehicleFeed() {
  const headers = swiftlyRequestHeaders();
  if (!headers) return null;

  const cacheKey = "swiftly:mta-maryland:vehicle-positions";
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 10000) return cached.payload;

  const buffer = await fetchBufferWithTimeout(SWIFTLY_MARYLAND_VEHICLE_POSITIONS_URL, 10000, headers);
  const payload = parseGtfsRealtimeVehicles(buffer);
  cache.set(cacheKey, { createdAt: Date.now(), payload });
  return payload;
}

function estimateLiveProgress(stopPoint, arrival) {
  const secondsLeft = Number(arrival.seconds_left);
  const minutesLeft = Number(arrival.minutes_left);
  const minutes = Number.isFinite(secondsLeft) ? secondsLeft / 60 : Number.isFinite(minutesLeft) ? minutesLeft : 10;
  const approach = Math.min(0.34, Math.max(0.015, minutes * 0.012));
  return Math.max(0.01, Math.min(0.98, stopPoint.progress - approach));
}

function mdotExpectedTime(arrival) {
  const secondsLeft = Number(arrival.seconds_left);
  if (Number.isFinite(secondsLeft)) return new Date(Date.now() + Math.max(0, secondsLeft) * 1000).toISOString();
  const minutesLeft = Number(arrival.minutes_left);
  if (Number.isFinite(minutesLeft)) return new Date(Date.now() + Math.max(0, minutesLeft) * 60000).toISOString();
  const timestamp = Number(arrival.timestamp);
  if (Number.isFinite(timestamp)) return new Date(timestamp * 1000).toISOString();
  return new Date(Date.now() + 10 * 60000).toISOString();
}

async function fetchMdotStopArrivals(route, stopPoint) {
  const routeId = routeGtfsId(route);
  if (!routeId) return [];
  const url = `https://www.mta.maryland.gov/schedule/real-time-stops/${encodeURIComponent(stopPoint.stopId)},${encodeURIComponent(routeId)}`;
  const data = await fetchJsonWithTimeout(url);
  return Array.isArray(data) ? data : [];
}

async function fetchMarylandRoute(location, route, routeLine) {
  const stopPoints = MDOT_STOP_POINTS[route.id] || [];
  const routeHash = String(route.id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const batches = await Promise.allSettled(stopPoints.map(async (stopPoint) => {
    const arrivals = await fetchMdotStopArrivals(route, stopPoint);
    return arrivals.slice(0, 3).map((arrival, index) => {
      const progress = estimateLiveProgress(stopPoint, arrival);
      const point = interpolateLine(routeLine, progress);
      const expected = mdotExpectedTime(arrival);
      const minutesLeft = Number(arrival.minutes_left);
      const secondsLeft = Number(arrival.seconds_left);
      const vehicleNumber = arrival.vehicle || `${stopPoint.stopId}-${index + 1}`;

      return {
        id: `${route.id}-${vehicleNumber}-${stopPoint.stopId}-${index}`,
        routeId: route.id,
        routeLabel: route.label,
        routeName: route.name,
        routeColor: route.color,
        textColor: route.textColor,
        busName: `${location.agency} Bus ${vehicleNumber}`,
        busNumber: vehicleNumber,
        agency: location.agency,
        provider: "MDOT MTA live stop-arrival API",
        stateCode: location.stateCode,
        cityName: location.cityName,
        from: stopPoint.from || route.from,
        destination: route.headsign || route.destinations[0],
        destinationPoint: location.destination,
        nextStop: {
          stopId: stopPoint.stopId,
          stopName: stopPoint.stopName,
          proximity: Number.isFinite(minutesLeft) ? `${minutesLeft} min` : arrival.time || "Live",
          expectedArrivalTime: expected,
          expectedDepartureTime: expected,
          distanceFromStopMeters: Number.isFinite(secondsLeft) ? Math.max(50, Math.round(secondsLeft * 4.8)) : null,
          numberOfStopsAway: Number.isFinite(minutesLeft) ? Math.max(0, Math.ceil(minutesLeft / 4)) : null
        },
        onwardCalls: [],
        latitude: point[0],
        longitude: point[1],
        bearing: stopPoint.bearing,
        routeLine,
        motionProgress: progress,
        motionSpeed: 0.00055 + ((routeHash + index) % 5) * 0.00013,
        motionStartedAt: Date.now(),
        progressRate: "liveArrivalEstimate",
        progressStatus: Number.isFinite(minutesLeft) && minutesLeft <= 5 ? ["incoming"] : [],
        monitored: true,
        situationRefs: [],
        recordedAtTime: new Date().toISOString(),
        directionRef: "",
        isRealtime: true,
        positionQuality: "estimated from MDOT live arrival countdown"
      };
    });
  }));

  return batches.flatMap((batch) => batch.status === "fulfilled" ? batch.value : []);
}

function marylandRouteForGtfs(location, gtfsRouteId) {
  const gtfsRouteIdText = String(gtfsRouteId || "");
  return location.routes.find((route) => routeGtfsId(route) === gtfsRouteIdText)
    || location.routes.find((route) => MDOT_ROUTE_IDS[route.id] === gtfsRouteIdText)
    || location.routes.find((route) => route.id === MDOT_INTERNAL_ROUTE_BY_GTFS[gtfsRouteIdText])
    || null;
}

function marylandStopLabel(route, stopId) {
  const stopIdText = String(stopId || "");
  const stop = (MDOT_STOP_POINTS[route.id] || []).find((item) => item.stopId === stopIdText);
  return stop ? stop.stopName : stopIdText ? `Stop ${stopIdText}` : "Stop not published";
}

async function fetchMarylandArrivalVehicles(location, routes, routeLine) {
  const batches = await Promise.allSettled(routes.map((route) => fetchMarylandRoute(location, route, routeLine)));
  return batches.flatMap((batch) => batch.status === "fulfilled" ? batch.value : []);
}

function indexMarylandArrivals(vehicles) {
  const byRouteAndBus = new Map();
  vehicles.forEach((vehicle) => {
    const key = `${vehicle.routeId}:${cleanBusRef(vehicle.busNumber)}`;
    const current = byRouteAndBus.get(key);
    const currentMinutes = current ? minutesFromIso(current.nextStop && current.nextStop.expectedArrivalTime) : Infinity;
    const nextMinutes = minutesFromIso(vehicle.nextStop && vehicle.nextStop.expectedArrivalTime);
    if (!current || nextMinutes < currentMinutes) byRouteAndBus.set(key, vehicle);
  });
  return byRouteAndBus;
}

function minutesFromIso(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) return Infinity;
  return Math.max(0, Math.round((time - Date.now()) / 60000));
}

function normalizeSwiftlyMarylandVehicle(entity, location, selectedRoute, arrivalByRouteAndBus, generatedAt) {
  const gtfsVehicle = entity.vehicle || {};
  const route = marylandRouteForGtfs(location, gtfsVehicle.trip && gtfsVehicle.trip.routeId);
  if (!route || (selectedRoute && route.id !== selectedRoute.id)) return null;

  const position = gtfsVehicle.position || {};
  const latitude = numberOrNull(position.latitude);
  const longitude = numberOrNull(position.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const descriptor = gtfsVehicle.vehicle || {};
  const busNumber = cleanBusRef(descriptor.id || descriptor.label || entity.id);
  const arrival = arrivalByRouteAndBus.get(`${route.id}:${cleanBusRef(busNumber)}`);
  const expectedArrivalTime = arrival && arrival.nextStop ? arrival.nextStop.expectedArrivalTime : "";
  const expectedDepartureTime = arrival && arrival.nextStop ? arrival.nextStop.expectedDepartureTime : "";
  const recordedAtTime = gtfsVehicle.timestamp
    ? new Date(gtfsVehicle.timestamp * 1000).toISOString()
    : generatedAt;
  const speed = numberOrNull(position.speed);

  return {
    id: `SWIFTLY-${route.id}-${busNumber || entity.id}`,
    routeId: route.id,
    routeLabel: route.label,
    routeName: route.name,
    routeColor: route.color,
    textColor: route.textColor,
    busName: `${location.agency} Bus ${busNumber}`,
    busNumber,
    agency: location.agency,
    provider: "Swiftly GTFS-Realtime Vehicle Positions",
    stateCode: location.stateCode,
    cityName: location.cityName,
    from: arrival ? arrival.from : route.from,
    destination: arrival ? arrival.destination : route.headsign || route.destinations[0],
    destinationPoint: arrival ? arrival.destinationPoint : location.destination,
    nextStop: {
      stopId: gtfsVehicle.stopId || (arrival && arrival.nextStop ? arrival.nextStop.stopId : ""),
      stopName: arrival && arrival.nextStop ? arrival.nextStop.stopName : marylandStopLabel(route, gtfsVehicle.stopId),
      proximity: arrival && arrival.nextStop ? arrival.nextStop.proximity : "Live GPS",
      expectedArrivalTime,
      expectedDepartureTime,
      distanceFromStopMeters: arrival && arrival.nextStop ? arrival.nextStop.distanceFromStopMeters : null,
      numberOfStopsAway: arrival && arrival.nextStop ? arrival.nextStop.numberOfStopsAway : null
    },
    onwardCalls: [],
    latitude,
    longitude,
    bearing: numberOrNull(position.bearing),
    speedMetersPerSecond: speed,
    routeLine: location.routeLine || [],
    progressRate: "gtfsRealtimeVehiclePosition",
    progressStatus: arrival && arrival.progressStatus ? arrival.progressStatus : [],
    monitored: true,
    situationRefs: [],
    recordedAtTime,
    directionRef: gtfsVehicle.trip && Number.isFinite(gtfsVehicle.trip.directionId) ? String(gtfsVehicle.trip.directionId) : "",
    tripId: gtfsVehicle.trip ? gtfsVehicle.trip.tripId : "",
    gtfsRouteId: gtfsVehicle.trip ? gtfsVehicle.trip.routeId : "",
    isRealtime: true,
    positionQuality: "exact Swiftly GTFS-RT GPS"
  };
}

function fieldValue(object, ...names) {
  if (!object || typeof object !== "object") return undefined;
  for (const name of names) {
    if (object[name] !== undefined && object[name] !== null) return object[name];
  }
  return undefined;
}

function gtfsEntities(feed) {
  return Array.isArray(feed && feed.entity)
    ? feed.entity
    : Array.isArray(feed && feed.entities)
      ? feed.entities
      : [];
}

function timestampToIso(value, fallback = new Date().toISOString()) {
  if (value === undefined || value === null || value === "") return fallback;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    const milliseconds = numeric > 9999999999 ? numeric : numeric * 1000;
    return new Date(milliseconds).toISOString();
  }
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : fallback;
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (value) => value * Math.PI / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function vehicleNearLocation(location, latitude, longitude) {
  const anchors = [location.center, location.home && [location.home.lat, location.home.lng], location.destination && [location.destination.lat, location.destination.lng]]
    .filter(Boolean);
  const radius = location.liveRadiusMeters || (location.cityName === "Baltimore" ? 26000 : 18000);
  return anchors.some((anchor) => haversineMeters(latitude, longitude, anchor[0], anchor[1]) <= radius);
}

function liveEtaFromPosition(location, route, latitude, longitude) {
  const destinationPoint = location.destination || location.home;
  if (!destinationPoint) return null;
  const distanceMeters = haversineMeters(latitude, longitude, destinationPoint.lat, destinationPoint.lng);
  const seconds = Math.max(90, Math.min(7200, (distanceMeters / 6.2) + 180));
  const minutes = Math.ceil(seconds / 60);
  return {
    iso: new Date(Date.now() + seconds * 1000).toISOString(),
    proximity: `GPS ${minutes} min`,
    distanceMeters: Math.round(distanceMeters)
  };
}

function dynamicMarylandRouteFromGtfs(gtfsRouteId) {
  const internalId = MDOT_INTERNAL_ROUTE_BY_GTFS[String(gtfsRouteId || "")];
  if (internalId) {
    const known = CATALOG.locations.flatMap((location) => location.routes).find((route) => route.id === internalId);
    if (known) return { ...known, gtfsRouteId: String(gtfsRouteId) };
  }
  const label = String(gtfsRouteId || "Route").trim();
  const color = colorFromRouteText(label);
  return {
    id: `MD-GTFS-${label}`,
    gtfsRouteId: label,
    label,
    shortName: label,
    name: `MDOT MTA Route ${label}`,
    color,
    textColor: textColorForBackground(color),
    from: "Maryland",
    destinations: ["Destination not posted"],
    headsign: "Destination not posted",
    aliases: [`GTFS ${label}`, `MDOT route ${label}`],
    sample: []
  };
}

async function fetchTransitlandMarylandVehicleFeed() {
  if (!TRANSITLAND_API_KEY) return null;
  const cacheKey = "transitland:mta-maryland:vehicle-positions";
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 10000) return cached.payload;

  const url = transitlandUrl(`/feeds/${encodeURIComponent(TRANSITLAND_MARYLAND_RT_FEED_KEY)}/download_latest_rt/vehicle_positions.json`);
  const payload = await fetchJsonWithTimeout(url, 10000, transitlandHeaders());
  cache.set(cacheKey, { createdAt: Date.now(), payload });
  return payload;
}

function normalizeTransitlandMarylandVehicle(entity, location, selectedRoute, arrivalByRouteAndBus, generatedAt) {
  const gtfsVehicle = fieldValue(entity, "vehicle") || {};
  const trip = fieldValue(gtfsVehicle, "trip", "tripDescriptor") || {};
  const position = fieldValue(gtfsVehicle, "position") || {};
  const descriptor = fieldValue(gtfsVehicle, "vehicle", "vehicleDescriptor") || {};
  const routeId = String(fieldValue(trip, "routeId", "route_id") || "");
  let route = marylandRouteForGtfs(location, routeId);
  if (!route && routeId) route = dynamicMarylandRouteFromGtfs(routeId);
  if (!route) return null;

  if (selectedRoute) {
    const selectedGtfsRouteId = routeGtfsId(selectedRoute);
    if (route.id !== selectedRoute.id && selectedGtfsRouteId !== routeId) return null;
  }

  const latitude = numberOrNull(fieldValue(position, "latitude", "lat"));
  const longitude = numberOrNull(fieldValue(position, "longitude", "lon", "lng"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (!selectedRoute && !vehicleNearLocation(location, latitude, longitude)) return null;

  const entityId = fieldValue(entity, "id") || "";
  const busNumber = cleanBusRef(fieldValue(descriptor, "id", "label", "licensePlate", "license_plate") || entityId);
  const arrival = arrivalByRouteAndBus.get(`${route.id}:${cleanBusRef(busNumber)}`);
  const estimate = arrival && arrival.nextStop ? null : liveEtaFromPosition(location, route, latitude, longitude);
  const expectedArrivalTime = arrival && arrival.nextStop
    ? arrival.nextStop.expectedArrivalTime
    : estimate ? estimate.iso : "";
  const expectedDepartureTime = arrival && arrival.nextStop
    ? arrival.nextStop.expectedDepartureTime
    : expectedArrivalTime;
  const recordedAtTime = timestampToIso(fieldValue(gtfsVehicle, "timestamp"), generatedAt);
  const routeLine = route.routeLine && route.routeLine.length > 1
    ? route.routeLine
    : location.routeLine || [];

  return {
    id: `TL-${route.id}-${busNumber || entityId}`,
    routeId: route.id,
    routeLabel: route.label,
    routeName: route.name,
    routeColor: route.color,
    textColor: route.textColor,
    busName: `${location.agency} Bus ${busNumber || entityId || "live"}`,
    busNumber: busNumber || entityId || "live",
    agency: location.agency,
    provider: "Transitland GTFS-Realtime Vehicle Positions",
    stateCode: location.stateCode,
    cityName: location.cityName,
    from: arrival ? arrival.from : route.from,
    destination: arrival ? arrival.destination : route.headsign || route.destinations[0],
    destinationPoint: arrival ? arrival.destinationPoint : location.destination,
    nextStop: {
      stopId: fieldValue(gtfsVehicle, "stopId", "stop_id") || (arrival && arrival.nextStop ? arrival.nextStop.stopId : ""),
      stopName: arrival && arrival.nextStop ? arrival.nextStop.stopName : marylandStopLabel(route, fieldValue(gtfsVehicle, "stopId", "stop_id")),
      proximity: arrival && arrival.nextStop ? arrival.nextStop.proximity : estimate ? estimate.proximity : "Live GPS",
      expectedArrivalTime,
      expectedDepartureTime,
      distanceFromStopMeters: arrival && arrival.nextStop ? arrival.nextStop.distanceFromStopMeters : estimate ? estimate.distanceMeters : null,
      numberOfStopsAway: arrival && arrival.nextStop ? arrival.nextStop.numberOfStopsAway : null
    },
    onwardCalls: [],
    latitude,
    longitude,
    bearing: numberOrNull(fieldValue(position, "bearing")),
    speedMetersPerSecond: numberOrNull(fieldValue(position, "speed")),
    routeLine,
    progressRate: "gtfsRealtimeVehiclePosition",
    progressStatus: arrival && arrival.progressStatus ? arrival.progressStatus : ["live-gps"],
    monitored: true,
    situationRefs: [],
    recordedAtTime,
    directionRef: fieldValue(trip, "directionId", "direction_id") !== undefined ? String(fieldValue(trip, "directionId", "direction_id")) : "",
    tripId: fieldValue(trip, "tripId", "trip_id") || "",
    gtfsRouteId: routeId,
    isRealtime: true,
    positionQuality: "exact Transitland GTFS-RT GPS"
  };
}

async function fetchTransitlandMarylandRealtime(location, selectedRoute) {
  if (!TRANSITLAND_API_KEY) return null;

  const cacheKey = `transitland:${location.id}:${selectedRoute ? selectedRoute.id : "all"}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 10000) return cached.payload;

  const routeLine = location.routeLine || [
    [location.home.lat, location.home.lng],
    [location.destination.lat, location.destination.lng]
  ];
  const routes = selectedRoute ? [selectedRoute] : location.routes;
  const feed = await fetchTransitlandMarylandVehicleFeed();
  if (!feed) return null;

  const generatedAt = timestampToIso(feed.header && fieldValue(feed.header, "timestamp"), new Date().toISOString());
  const arrivalVehicles = await fetchMarylandArrivalVehicles(location, routes, routeLine);
  const arrivalByRouteAndBus = indexMarylandArrivals(arrivalVehicles);
  const vehicles = gtfsEntities(feed)
    .map((entity) => normalizeTransitlandMarylandVehicle(entity, location, selectedRoute, arrivalByRouteAndBus, generatedAt))
    .filter(Boolean)
    .sort((a, b) => (minutesFromIso(a.nextStop && a.nextStop.expectedArrivalTime) - minutesFromIso(b.nextStop && b.nextStop.expectedArrivalTime))
      || String(a.routeLabel).localeCompare(String(b.routeLabel), undefined, { numeric: true }));

  const result = {
    live: vehicles.length > 0,
    mode: vehicles.length > 0 ? "live-gps-transitland" : "no-transitland-gps",
    source: vehicles.length > 0
      ? "Exact Transitland GTFS-Realtime vehicle GPS for MDOT MTA, with MDOT live stop-arrival countdowns when a public arrival matches the bus."
      : "Transitland connected, but no matching Maryland live GPS vehicles returned for this route/location right now.",
    provider: "Transitland GTFS-RT Vehicle Positions",
    generatedAt,
    responseTimestamp: generatedAt,
    location: publicLocation(location),
    route: selectedRoute ? publicRoute(selectedRoute) : { id: "all", label: "All", name: "All routes" },
    vehicles
  };

  cache.set(cacheKey, { createdAt: Date.now(), payload: result });
  return result;
}

async function fetchSwiftlyMarylandRealtime(location, selectedRoute) {
  if (!SWIFTLY_AUTH_HEADER) return null;

  const cacheKey = `swiftly:${location.id}:${selectedRoute ? selectedRoute.id : "all"}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 10000) return cached.payload;

  const routeLine = location.routeLine || [
    [location.home.lat, location.home.lng],
    [location.destination.lat, location.destination.lng]
  ];
  const routes = selectedRoute ? [selectedRoute] : location.routes;
  const feed = await fetchSwiftlyMarylandVehicleFeed();
  if (!feed) return null;

  const generatedAt = feed.header && feed.header.timestamp
    ? new Date(feed.header.timestamp * 1000).toISOString()
    : new Date().toISOString();
  const arrivalVehicles = await fetchMarylandArrivalVehicles(location, routes, routeLine);
  const arrivalByRouteAndBus = indexMarylandArrivals(arrivalVehicles);
  const vehicles = feed.entities
    .map((entity) => normalizeSwiftlyMarylandVehicle(entity, location, selectedRoute, arrivalByRouteAndBus, generatedAt))
    .filter(Boolean);

  const result = {
    live: vehicles.length > 0,
    mode: vehicles.length > 0 ? "live-gps" : "no-live-gps",
    source: vehicles.length > 0
      ? "Exact Swiftly GTFS-Realtime vehicle GPS plus MDOT MTA live stop-arrival countdowns."
      : "Swiftly connected, but no matching live GPS vehicles returned for the selected Maryland route/location.",
    provider: "Swiftly GTFS-RT Vehicle Positions",
    generatedAt,
    responseTimestamp: generatedAt,
    location: publicLocation(location),
    route: selectedRoute ? publicRoute(selectedRoute) : { id: "all", label: "All", name: "All routes" },
    vehicles
  };

  cache.set(cacheKey, { createdAt: Date.now(), payload: result });
  return result;
}

async function fetchMarylandRealtime(location, selectedRoute) {
  const cacheKey = `mdot:${location.id}:${selectedRoute ? selectedRoute.id : "all"}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < 12000) return cached.payload;

  const routeLine = location.routeLine || [
    [location.home.lat, location.home.lng],
    [location.destination.lat, location.destination.lng]
  ];
  const routes = selectedRoute ? [selectedRoute] : location.routes;
  let transitlandError = "";
  let swiftlyError = "";

  if (TRANSITLAND_API_KEY) {
    try {
      const transitlandResult = await fetchTransitlandMarylandRealtime(location, selectedRoute);
      if (transitlandResult && transitlandResult.vehicles.length > 0) {
        cache.set(cacheKey, { createdAt: Date.now(), payload: transitlandResult });
        return transitlandResult;
      }
    } catch (error) {
      transitlandError = error.message;
    }
  }

  if (SWIFTLY_AUTH_HEADER) {
    try {
      const swiftlyResult = await fetchSwiftlyMarylandRealtime(location, selectedRoute);
      if (swiftlyResult && swiftlyResult.vehicles.length > 0) {
        cache.set(cacheKey, { createdAt: Date.now(), payload: swiftlyResult });
        return swiftlyResult;
      }
    } catch (error) {
      swiftlyError = error.message;
    }
  }

  const liveVehicles = (await fetchMarylandArrivalVehicles(location, routes, routeLine))
    .filter((vehicle) => Number.isFinite(vehicle.latitude) && Number.isFinite(vehicle.longitude));
  const liveRouteIds = new Set(liveVehicles.map((vehicle) => vehicle.routeId));
  const previewMissingRoutes = routes.filter((route) => !liveRouteIds.has(route.id));
  const previewMissingVehicles = previewMissingRoutes.length
    ? previewVehicles(location, selectedRoute ? selectedRoute : null)
        .filter((vehicle) => previewMissingRoutes.some((route) => route.id === vehicle.routeId))
        .map((vehicle) => ({
          ...vehicle,
          provider: "Network preview until live stop timing returns",
          positionQuality: "animated route preview while waiting for live GPS"
        }))
    : [];
  const vehicles = liveVehicles.concat(previewMissingVehicles);

  const result = {
    live: liveVehicles.length > 0,
    mode: liveVehicles.length > 0
      ? (previewMissingVehicles.length ? "live-arrivals-plus-network" : "live-arrivals")
      : (previewMissingVehicles.length ? "network-preview" : "no-live-arrivals"),
    source: liveVehicles.length > 0
      ? `Live MDOT MTA stop-arrival API for ${liveRouteIds.size} route${liveRouteIds.size === 1 ? "" : "s"} plus ${previewMissingVehicles.length ? "network previews for routes without current public stop returns" : "arrival-based map movement"}.${transitlandError ? ` Transitland GPS fallback reason: ${transitlandError}.` : " Transitland GPS will replace estimates whenever exact vehicle positions are posted."}${swiftlyError ? ` Swiftly GPS fallback reason: ${swiftlyError}.` : ""}`
      : `No current MDOT live arrivals returned for these stops; showing clean previews until Transitland GPS or live timing returns.${transitlandError ? ` Transitland reason: ${transitlandError}.` : ""}`,
    responseTimestamp: new Date().toISOString(),
    location: publicLocation(location),
    route: selectedRoute ? publicRoute(selectedRoute) : { id: "all", label: "All", name: "All routes" },
    vehicles
  };

  cache.set(cacheKey, { createdAt: Date.now(), payload: result });
  return result;
}

function previewVehicles(location, selectedRoute) {
  const routeLine = location.routeLine || [
    [location.home.lat, location.home.lng],
    [location.destination.lat, location.destination.lng]
  ];
  const routes = selectedRoute ? [selectedRoute] : location.routes;
  const now = Date.now();

  return routes.flatMap((route) => (route.sample || []).map((sample, index) => {
    const drift = Math.sin((now / 90000) + index) * 0.025;
    const progress = Math.max(0.02, Math.min(0.96, sample.progress + drift));
    const activeRouteLine = route.routeLine && route.routeLine.length > 1 ? route.routeLine : routeLine;
    const point = interpolateLine(activeRouteLine, progress);
    const eta = Math.max(1, sample.eta);
    const expected = new Date(now + eta * 60000).toISOString();
    const routeHash = String(route.id).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const motionSpeed = 0.00065 + ((routeHash + index) % 5) * 0.00017;

    return {
      id: `${route.id}-${sample.busNumber}`,
      routeId: route.id,
      routeLabel: route.label,
      routeName: route.name,
      routeColor: route.color,
      textColor: route.textColor,
      busName: `${location.agency} Bus ${sample.busNumber}`,
      busNumber: sample.busNumber,
      agency: location.agency,
      provider: location.provider,
      stateCode: location.stateCode,
      cityName: location.cityName,
      from: route.from,
      destination: route.headsign || route.destinations[0],
      destinationPoint: location.destination,
      nextStop: {
        stopId: `${route.id}-${index}`,
        stopName: sample.stop,
        proximity: eta <= 1 ? "due now" : `${eta} min`,
        expectedArrivalTime: expected,
        expectedDepartureTime: expected,
        distanceFromStopMeters: sample.meters,
        numberOfStopsAway: sample.stopsAway
      },
      onwardCalls: [],
      latitude: jitter(point[0], 0.00025),
      longitude: jitter(point[1], 0.00025),
      bearing: sample.bearing,
      routeLine: activeRouteLine,
      motionProgress: progress,
      motionSpeed,
      motionStartedAt: now,
      progressRate: "previewProgress",
      progressStatus: eta <= 5 ? ["incoming"] : [],
      monitored: true,
      situationRefs: [],
      recordedAtTime: new Date(now).toISOString(),
      directionRef: "0",
      isRealtime: false
    };
  }));
}

function publicRoute(route) {
  return {
    id: route.id,
    label: route.label,
    shortName: route.shortName,
    name: route.name,
    color: route.color,
    textColor: route.textColor,
    from: route.from,
    destinations: route.destinations,
    aliases: route.aliases || [],
    headsign: route.headsign || route.destinations[0],
    gtfsRouteId: routeGtfsId(route),
    sampleBusNumbers: (route.sample || []).map((item) => item.busNumber)
  };
}

function publicLocation(location) {
  return {
    id: location.id,
    stateCode: location.stateCode,
    stateName: location.stateName,
    cityName: location.cityName,
    locationName: location.locationName,
    agency: location.agency,
    provider: location.provider,
    liveMode: location.liveMode,
    liveNote: location.liveNote,
    center: location.center,
    zoom: location.zoom,
    home: location.home,
    destination: location.destination,
    aliases: location.aliases || [],
    routeLine: location.routeLine || [],
    routes: location.routes.map(publicRoute)
  };
}

async function getVehicles(locationId, routeId) {
  const location = await activeLocationById(locationId);
  const selectedRoute = routeId && routeId !== "all" ? routeById(location, routeId) : null;

  if (location.stateCode === "MD") {
    return fetchMarylandRealtime(location, selectedRoute);
  }

  if (location.liveMode === "nyc-siri") {
    const route = selectedRoute || location.routes[0];
    return fetchNycRoute(location, route);
  }

  return {
    live: false,
    mode: "preview",
    source: location.liveNote,
    responseTimestamp: new Date().toISOString(),
    location: publicLocation(location),
    route: selectedRoute ? publicRoute(selectedRoute) : { id: "all", label: "All", name: "All routes" },
    vehicles: previewVehicles(location, selectedRoute)
  };
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*"
  });
  response.end(JSON.stringify(data));
}

function sendText(response, status, text) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(text);
}

async function handleApi(request, response, url) {
  if (url.pathname === "/api/catalog" || url.pathname === "/api/routes") {
    sendJson(response, 200, await publicCatalog());
    return;
  }

  if (url.pathname === "/api/vehicles") {
    const locationId = url.searchParams.get("location") || "md-towson-lutherville";
    const routeId = url.searchParams.get("route") || "all";
    try {
      sendJson(response, 200, await getVehicles(locationId, routeId));
    } catch (error) {
      const location = await activeLocationById(locationId).catch(() => locationById(locationId));
      const route = routeId && routeId !== "all" ? routeById(location, routeId) : null;
      sendJson(response, 200, {
        live: false,
        mode: "preview",
        source: error.message,
        responseTimestamp: new Date().toISOString(),
        location: publicLocation(location),
        route: route ? publicRoute(route) : { id: "all", label: "All", name: "All routes" },
        vehicles: previewVehicles(location, route)
      });
    }
    return;
  }

  sendJson(response, 404, { error: "Unknown API path" });
}

async function handleStatic(request, response, url) {
  const safePath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.join(__dirname, safePath);
  const relative = path.relative(__dirname, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml"
    }[extension] || "application/octet-stream";
    response.writeHead(200, { "content-type": type, "cache-control": "no-store" });
    response.end(data);
  } catch (error) {
    sendText(response, 404, "Not found");
  }
}

function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${START_PORT}`}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      response.end();
      return;
    }

    try {
      if (url.pathname.startsWith("/api/")) {
        await handleApi(request, response, url);
      } else {
        await handleStatic(request, response, url);
      }
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
  });
}

function listen(port) {
  const server = createServer();
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && port < START_PORT + 20) {
      listen(port + 1);
      return;
    }
    console.error(error);
    process.exitCode = 1;
  });
  server.listen(port, HOST, () => {
    console.log(`Transit Intelligence running at http://${HOST}:${port}`);
    console.log("Press Ctrl+C to stop.");
  });
}

listen(START_PORT);
