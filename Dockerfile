# Usa un'immagine di Node.js
FROM node:18

# Imposta la directory di lavoro nel contenitore
WORKDIR /app

# Copia i file di configurazione e di dipendenze
COPY package*.json ./
COPY tsconfig.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice dell'app
COPY . .

# Compila il TypeScript
RUN npm run build

# Esponi la porta su cui l'app gira
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["npm", "start"]
