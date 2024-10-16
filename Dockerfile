# Usa un'immagine di Node.js
FROM node:18

# Installa netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd postgresql-client

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

# Esegui un'attesa per il DB prima delle migrazioni e del seeding
CMD ["npm", "start"]

# Esponi la porta su cui l'app gira
EXPOSE 3000
