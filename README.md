# 🏦 Analisi Estratti Bancari - Webapp

Una webapp moderna e professionale per l'analisi di estratti conto bancari con supporto per file CSV e Excel.

## ✨ Caratteristiche

- **Upload intelligente**: Supporta CSV, XLS/XLSX con parsing automatico delle intestazioni
- **Interfaccia moderna**: Design responsive con dark/light mode
- **Performance elevate**: Gestisce dataset di grandi dimensioni (100k+ righe)
- **Filtri avanzati**: Ricerca globale, filtri temporali, ordinamento colonne
- **Visualizzazione professionale**: Tabella interattiva con virtualizzazione
- **Export dati**: Esporta risultati filtrati in CSV

## 🚀 Quick Start

### Prerequisiti
- Python 3.8+
- Node.js 16+
- pip
- npm

### Backend (Python/FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### Docker (opzionale)
```bash
docker-compose up --build
```

## 📁 Struttura Progetto

```
├── backend/                 # API Python FastAPI
│   ├── app/
│   │   ├── api/           # Endpoints API
│   │   ├── core/          # Configurazione e utilities
│   │   ├── models/        # Modelli dati
│   │   └── services/      # Logica business
│   ├── requirements.txt
│   └── main.py
├── frontend/               # App React
│   ├── src/
│   │   ├── components/    # Componenti UI
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API calls
│   │   └── utils/         # Utilities
│   ├── package.json
│   └── index.html
├── docker-compose.yml
└── README.md
```

## 🔧 Tecnologie

**Backend:**
- FastAPI (Python web framework)
- Pandas (manipolazione dati)
- SQLite (database temporaneo)
- Pydantic (validazione dati)

**Frontend:**
- React 18 (UI framework)
- Tailwind CSS (styling)
- Axios (HTTP client)
- React Query (state management)

## 📊 API Endpoints

- `POST /upload` - Caricamento file
- `GET /data` - Recupero dati con filtri
- `GET /columns` - Metadati colonne
- `GET /export` - Export dati filtrati

## 🎨 Features UI

- Design responsive e mobile-first
- Dark/Light mode toggle
- Animazioni fluide e micro-interazioni
- Loading states eleganti
- Toast notifications
- Drag & drop per upload file
- Tabella virtualizzata per performance
- Filtri sempre visibili
- Export risultati

## 📱 Responsive Design

- **Desktop**: Layout completo con sidebar filtri
- **Tablet**: Layout adattato con filtri collassabili
- **Mobile**: Interfaccia ottimizzata per touch con filtri a scomparsa

## 🚀 Performance

- Backend: Pandas per processing veloce
- API: Paginazione server-side
- Frontend: Virtual scrolling, debounced search
- Caching: Risultati filtri in memoria
- Compressione: Gzip per payload grandi

## 🔒 Sicurezza

- Validazione file upload
- Sanitizzazione input
- Rate limiting
- CORS configurato
- Gestione errori graceful

## 📈 Roadmap

- [ ] Supporto per più formati file
- [ ] Analisi statistiche avanzate
- [ ] Grafici e dashboard
- [ ] Autenticazione utenti
- [ ] Salvataggio filtri personalizzati
- [ ] Integrazione database persistente
