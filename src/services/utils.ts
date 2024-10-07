// Funzione per verificare la validità del grafo
export const isValidGraph = (graph: any): boolean => {
  // Controlla se è un array e se non è vuoto
  if (!Array.isArray(graph) || graph.length === 0) {
      return false;
  }

  // Salva la lunghezza della prima riga per confrontare le altre
  const firstRowLength = graph[0].length;

  // Controlla che tutte le righe siano array, abbiano la stessa lunghezza e che tutte le colonne abbiano valori 0 o 1
  return graph.every(row => 
      Array.isArray(row) && 
      row.length === firstRowLength && // Verifica che la lunghezza sia la stessa della prima riga
      row.every(cell => cell === 0 || cell === 1)
  );
};

// Funzione per verificare la validità delle coordinate
export const areValidCoordinates = (graph: any, coordinates: { x: number, y: number }[]): boolean => {
    return coordinates.every(({ x, y }) => 
      Array.isArray(graph) && 
      Array.isArray(graph[x]) && 
      graph[x][y] !== undefined
    );
  };

// Funzione per verificare la validità delle date se fornite
export const validateDates = (startDate?: string, endDate?: string): void => {
  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      const err = new Error('startDate non è valido. Assicurati di usare il formato YYYY-MM-DD.');
      err.name = 'Not_valid';
      throw err;
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      const err = new Error('endDate non è valido. Assicurati di usare il formato YYYY-MM-DD.');
      err.name = 'Not_valid';
      throw err;
    }
  }

  // Se entrambe le date sono presenti, verifica che startDate sia precedente a endDate
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      const err = new Error(`Intervallo di date non valido. Data inizio ${startDate} e data fine ${endDate}.`);
      err.name = 'Not_valid';
      throw err;
      }
  }
};
  
  