# Transit Intelligence

**BY EMMANUEL KUH**

Transit Intelligence is a premium, mobile-first bus tracking interface for Baltimore, Towson, Maryland, New York, and other configured city views. It combines a map-first rider experience, state/city/location search, destination and route discovery, live-style arrival countdowns, moving bus markers, route trails, follow mode, and rider alerts.

## Live Site

Open the public GitHub Pages site here:

https://kuhemmanuel9-sudo.github.io/Transit-Intelligence-by-Emmanuel-Kuh/

Do not use `http://127.0.0.1:4173` for the public site. That link only works on the laptop running the local server.

## Features

- Mobile-first map and arrival board designed for quick reading on phones.
- State, city, location, route, destination, and bus-number search.
- Rich moving bus markers that show route, bus number, and ETA on the map.
- Tap an arrival or ETA row to jump directly to that bus on the map.
- Maryland route catalog includes MDOT MTA local-bus routes and major Baltimore/Towson destinations.
- New York support is designed for MTA Bus Time data when a backend API key is connected.
- Static GitHub Pages version includes embedded route data and moving preview buses so the site loads without a server.



https://kuhemmanuel9-sudo.github.io/Transit-Intelligence-by-Emmanuel-Kuh/

## Live Backend Note

GitHub Pages can display the front-end, but it cannot run `server.js` or securely store private API keys. For true live transit feeds, deploy the Node backend separately on Render, Railway, Vercel, or another server, then connect this front-end to that backend URL.

## Data Notes

- Maryland timing can use public MDOT MTA stop-arrival data.
- Transitland GTFS-Realtime can support exact vehicle positions when the API key is authorized.
- New York live tracking can use `MTA_API_KEY` through a backend proxy.
- If no backend is connected, the GitHub Pages version still opens and shows embedded route data with animated bus movement.

## Credit

Transit Intelligence  
**BY EMMANUEL KUH**
