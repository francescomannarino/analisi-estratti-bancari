#!/bin/bash

# Script di setup per Analisi Estratti Bancari
# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏦 Setup Analisi Estratti Bancari${NC}"
echo "=================================="

# Controlla se Python è installato
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 non è installato. Installa Python 3.8+ e riprova.${NC}"
    exit 1
fi

# Controlla se Node.js è installato
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non è installato. Installa Node.js 16+ e riprova.${NC}"
    exit 1
fi

# Controlla se pip è installato
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 non è installato. Installa pip e riprova.${NC}"
    exit 1
fi

# Controlla se npm è installato
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm non è installato. Installa npm e riprova.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisiti verificati${NC}"

# Crea directory uploads se non esiste
mkdir -p uploads

# Setup Backend
echo -e "\n${BLUE}🐍 Setup Backend Python...${NC}"
cd backend

# Crea ambiente virtuale se non esiste
if [ ! -d "venv" ]; then
    echo "Creazione ambiente virtuale Python..."
    python3 -m venv venv
fi

# Attiva ambiente virtuale
source venv/bin/activate

# Installa dipendenze
echo "Installazione dipendenze Python..."
pip install -r requirements.txt

# Torna alla directory root
cd ..

# Setup Frontend
echo -e "\n${BLUE}⚛️  Setup Frontend React...${NC}"
cd frontend

# Installa dipendenze Node.js
echo "Installazione dipendenze Node.js..."
npm install

# Torna alla directory root
cd ..

echo -e "\n${GREEN}✅ Setup completato con successo!${NC}"

# Menu di avvio
echo -e "\n${YELLOW}🚀 Come avviare l'applicazione:${NC}"
echo ""
echo "1. ${BLUE}Avvio Manuale:${NC}"
echo "   Terminal 1 (Backend):"
echo "     cd backend && source venv/bin/activate && python main.py"
echo ""
echo "   Terminal 2 (Frontend):"
echo "     cd frontend && npm run dev"
echo ""
echo "2. ${BLUE}Avvio con Docker:${NC}"
echo "     docker-compose up --build"
echo ""
echo "3. ${BLUE}Avvio Backend solo:${NC}"
echo "     cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "4. ${BLUE}Avvio Frontend solo:${NC}"
echo "     cd frontend && npm run dev"
echo ""

echo -e "${GREEN}🌐 L'applicazione sarà disponibile su:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

echo -e "${YELLOW}📝 Note:${NC}"
echo "   - Assicurati che le porte 3000 e 8000 siano libere"
echo "   - Il backend creerà automaticamente la cartella 'uploads'"
echo "   - I dati sono temporanei e vengono persi al riavvio"
echo ""

echo -e "${BLUE}🎯 Per iniziare subito, esegui:${NC}"
echo "   ./start.sh"
echo ""

# Rendi eseguibile lo script di avvio
chmod +x start.sh

echo -e "${GREEN}✨ Setup completato! Buon lavoro! 🚀${NC}"
