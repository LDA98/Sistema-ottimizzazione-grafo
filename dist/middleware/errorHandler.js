"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// Middleware di gestione degli errori
const errorHandler = (err, req, res, next) => {
    console.error('Errore:', err.stack); // Log dell'errore per debugging
    // Gestione degli errori Sequelize
    if (err instanceof sequelize_1.ValidationError || err instanceof sequelize_1.UniqueConstraintError) {
        return res.status(400).json({
            error: err.errors.map((e) => e.message),
        });
    }
    if (err.name === 'Not_found') {
        return res.status(400).json({ error: err.message });
    }
    if (err.name === 'Unauthorized') {
        return res.status(401).json({ error: err.message });
    }
    if (err.name === 'Insufficient_credit') {
        return res.status(402).json({ error: err.message });
    }
    if (err.name === 'Forbidden') {
        return res.status(403).json({ error: err.message });
    }
    if (err.name === 'Not_valid') {
        return res.status(422).json({ error: err.message });
    }
    // Risposta di default per altri errori interni
    return res.status(500).json({
        error: 'Errore interno del server',
    });
};
exports.default = errorHandler;
