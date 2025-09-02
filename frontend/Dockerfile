FROM node:18-alpine

# Imposta variabili d'ambiente
ENV NODE_ENV=development
ENV PORT=3000

# Crea directory di lavoro
WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm ci

# Copia codice sorgente
COPY . .

# Espone porta
EXPOSE 3000

# Comando di avvio
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
