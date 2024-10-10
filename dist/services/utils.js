"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDates = exports.areValidCoordinates = exports.isValidGraph = void 0;
// Funzione per verificare la validità del grafo
const isValidGraph = (graph) => {
    // Controlla se è un array e se non è vuoto
    if (!Array.isArray(graph) || graph.length === 0) {
        return false;
    }
    // Salva la lunghezza della prima riga per confrontare le altre
    const firstRowLength = graph[0].length;
    // Controlla che tutte le righe siano array, abbiano la stessa lunghezza e che tutte le colonne abbiano valori 0 o 1
    return graph.every(row => Array.isArray(row) &&
        row.length === firstRowLength && // Verifica che la lunghezza sia la stessa della prima riga
        row.every(cell => cell === 0 || cell === 1));
};
exports.isValidGraph = isValidGraph;
// Funzione per verificare la validità delle coordinate
const areValidCoordinates = (graph, coordinates) => {
    return coordinates.every(({ x, y }) => Array.isArray(graph) &&
        Array.isArray(graph[x]) &&
        graph[x][y] !== undefined);
};
exports.areValidCoordinates = areValidCoordinates;
// Funzione per verificare la validità delle date se fornite
const validateDates = (startDate, endDate) => {
    if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            const err = new Error('La data di inizio non è valida. Assicurati di usare il formato YYYY-MM-DD.');
            err.name = 'Not_valid';
            throw err;
        }
    }
    if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
            const err = new Error('La data di fine non è valida. Assicurati di usare il formato YYYY-MM-DD.');
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
exports.validateDates = validateDates;
