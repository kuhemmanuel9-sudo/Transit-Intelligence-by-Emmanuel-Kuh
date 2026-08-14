# Transit Intelligence

**BY EMMANUEL KUH**

Transit Intelligence is a premium, mobile-first live bus tracking interface for Baltimore, Towson, Maryland, New York, and other configured city demos. It combines a map-first rider view, state/city/location search, full MDOT MTA local-bus route discovery, live arrival countdowns, moving bus markers, route trails, follow mode, and browser voice alerts.

## Features

- Mobile-first map and arrival board designed for quick reading on phones.
- State, city, location, route, destination, and bus-number search.
- Rich moving bus markers that show route, bus number, and ETA on the map.
- Tap an arrival or ETA row to jump directly to that bus on the map.
- Voice alerts for incoming buses after the rider turns on voice.
- Maryland route catalog includes the official MDOT MTA local-bus network.
- Maryland live timing uses public MDOT MTA stop-arrival data, with Transitland GTFS-Realtime VehiclePosition support when an authorized key is available.
- New York live tracking still supports `MTA_API_KEY` for MTA Bus Time SIRI VehicleMonitoring.

## Project Files

- `index.html` - front-end app, map UI, search, arrivals, voice alerts.
- `server.js` - local Node API server and realtime data proxy.
- `build-site.js` - builds the hosted Sites Worker version.
- `build-github-pages.js` - builds a static `docs/` folder for GitHub Pages.
- `.env.example` - environment variable template for local development.




You can highlight the link below and open it live 

http://127.0.0.1:4173


## Environment Variables

```env
MTA_API_KEY=YOUR_NEW_YORK_MTA_BUS_TIME_KEY
TRANSITLAND_API_KEY=YOUR_TRANSITLAND_KEY
TRANSITLAND_MARYLAND_STATIC_FEED_KEY=f-dq-mtamaryland~bus
TRANSITLAND_MARYLAND_RT_FEED_KEY=f-dq-mtamaryland~bus~rt
SWIFTLY_MARYLAND_API_KEY=YOUR_SWIFTLY_KEY
```

`MTA_API_KEY` is for New York. Transitland and Swiftly are used for Maryland exact GPS when those keys are authorized. Without exact GPS, Maryland still shows live countdown-backed movement from MDOT MTA public stop-arrival data.




## Data Notes

- MDOT MTA publishes local-bus route and schedule resources.
- MDOT MTA says GTFS-Realtime feeds are updated approximately every 30 seconds.
- Transitland REST API keys may be sent as the `apikey` header or query parameter.
- Transitland GTFS-Realtime downloads use the feed path `download_latest_rt/vehicle_positions.json`.

## Credit

Transit Intelligence  
**BY EMMANUEL KUH**
