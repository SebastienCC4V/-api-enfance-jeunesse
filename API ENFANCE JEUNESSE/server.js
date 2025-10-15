// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // <--- NOUVEAU : Module pour la gestion de fichiers

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json'); // Chemin vers notre fichier de stockage

// --- FONCTIONS DE GESTION DE FICHIERS ---

/**
 * Lit le fichier JSON pour charger l'état de la "base de données".
 */
function loadData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Le fichier n'existe pas ou est vide, on retourne un objet vide.
        return {};
    }
}

/**
 * Écrit l'état actuel de la "base de données" dans le fichier JSON.
 */
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Erreur lors de l\'écriture du fichier de données:', error);
    }
}


// --- BASE DE DONNÉES EN MÉMOIRE (Initialisée par le fichier) ---
let savedPlanningData = loadData(); // <--- CHARGEMENT INITIAL
let currentId = Object.keys(savedPlanningData).length + 1; 

// --- CONFIGURATION ET MIDDLEWARES (Le même qu'avant) ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); 


// --- ROUTES DE L'API ---

app.post('/api/planning/save', (req, res) => {
    const data = req.body;
    let planningId = data.id || `planning-${currentId}`;

    if (!data.id) {
        data.id = planningId; 
        currentId++;
    }
    
    // 1. Sauvegarde en mémoire
    savedPlanningData[planningId] = data; 
    
    // 2. 🚨 PERSISTANCE : Écrire sur le disque
    saveData(savedPlanningData); 

    console.log(`Planning sauvegardé avec l'ID: ${planningId}`);
    
    res.status(200).json({ 
        message: 'Sauvegarde réussie', 
        planningId: planningId 
    });
});

app.get('/api/planning/:id', (req, res) => {
    const planningId = req.params.id;
    const data = savedPlanningData[planningId]; // Lit la donnée de la mémoire

    if (data) {
        console.log(`Chargement du planning ID: ${planningId}`);
        res.status(200).json(data);
    } else {
        console.log(`Planning ID: ${planningId} non trouvé`);
        res.status(404).json({ message: 'Planning non trouvé' });
    }
});


// --- DÉMARRAGE DU SERVEUR ---
app.listen(PORT, () => {
    console.log(`🚀 Serveur Node.js en écoute sur http://localhost:${PORT}`);
    console.log(`Accédez au portail via : http://localhost:${PORT}/`); 
});