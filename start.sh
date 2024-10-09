#!/bin/bash

# Carica le variabili dal file .env
export $(grep -v '^#' .env | xargs)

# Funzione per attendere che il database sia pronto
wait_for_db() {
  echo "Waiting for PostgreSQL to be available..."
  until PGPASSWORD=$DB_PASS psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
    >&2 echo "Postgres is unavailable - sleeping"
    sleep 1
  done
  >&2 echo "Postgres is up - executing commands"
}

# Funzione per eseguire le migrazioni e il seeding condizionale
run_migrations_and_seed() {
  # Controlla se ci sono dati nella tabella 'users'
  CHECK_SEED=$(PGPASSWORD=$DB_PASS psql -h $DB_HOST -U $DB_USER -d $DB_NAME -tAc "SELECT COUNT(*) FROM users;")

  if [ "$CHECK_SEED" -eq "0" ]; then
    echo "Running migrations and seeds..."
    # Esegui le migrazioni
    npx sequelize-cli db:migrate

    # Esegui il seeding
    npx sequelize-cli db:seed:all
  else
    echo "Data already present, skipping migrations and seeds..."
  fi
}

# Avvio dello script
wait_for_db
run_migrations_and_seed

# Avvia l'applicazione
echo "Starting the application..."
npm start
