#!/bin/bash

# Script di avvio per Analisi Estratti Bancari
# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏦 Avvio Analisi Estratti Bancari${NC}"
echo "=================================="

# Controlla se le directory esistono
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Directory backend o frontend non trovate. Esegui prima ./setup.sh${NC}"
    exit 1
fi

# Controlla se l'ambiente virtuale esiste
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠️  Ambiente virtuale Python non trovato. Esegui prima ./setup.sh${NC}"
    exit 1
fi

# Controlla se node_modules esiste
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dipendenze Node.js non installate. Esegui prima ./setup.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisiti verificati${NC}"

# Crea directory uploads se non esiste
mkdir -p uploads

# Funzione per cleanup al termine
cleanup() {
    echo -e "\n${YELLOW}🛑 Arresto applicazione...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Applicazione arrestata${NC}"
    exit 0
}

# Gestisce segnali di terminazione
trap cleanup SIGINT SIGTERM

echo -e "\n${BLUE}🚀 Avvio Backend Python...${NC}"
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Attendi che il backend sia pronto
echo "Attendo che il backend sia pronto..."
sleep 5

# Controlla se il backend è attivo
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${RED}❌ Backend non risponde. Controlla i log per errori.${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}✅ Backend avviato (PID: $BACKEND_PID)${NC}"

echo -e "\n${BLUE}🚀 Avvio Frontend React...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✅ Frontend avviato (PID: $FRONTEND_PID)${NC}"

echo -e "\n${GREEN}🎉 Applicazione avviata con successo!${NC}"
echo ""
echo -e "${BLUE}🌐 URL disponibili:${NC}"
echo "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo "   Backend API: ${GREEN}http://localhost:8000${NC}"
echo "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}💡 Premi Ctrl+C per arrestare l'applicazione${NC}"
echo ""

# Attendi che uno dei processi termini
wait $BACKEND_PID $FRONTEND_PID

cleanup
