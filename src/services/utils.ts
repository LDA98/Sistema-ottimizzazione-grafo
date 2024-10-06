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
  