// /js/main.js

import { savePlanning, loadPlanning } from './api.js';
import { serializePlanningData, deserializePlanningData } from './stateManager.js'; 
import './appLogic.js';
import './tools.js'; //
import './pagination.js'; // 🚨 NOUVEAU

// !!! PAS d'import vers l'ancien planning.js qui pourrait causer des erreurs !!!

// 1. RÉFÉRENCES UI
const saveButton = document.getElementById('save-btn');
const loadButton = document.getElementById('load-btn');
const displayId = document.getElementById('current-planning-id');


// 2. GESTION DE LA SAUVEGARDE 
async function handleSave() {
    const dataToSave = serializePlanningData(); 
    
    try {
        saveButton.textContent = 'Sauvegarde en cours...';
        const planningId = await savePlanning(dataToSave); 
        
        localStorage.setItem('currentPlanningId', planningId);
        displayId.textContent = planningId; 
        saveButton.textContent = '✅ Sauvegarde réussie !';
        
    } catch (error) {
        saveButton.textContent = `❌ ${error.message}`;
        console.error(error);
    } finally {
        setTimeout(() => {
            saveButton.textContent = 'Sauvegarder en ligne';
        }, 3000); 
    }
}

// 3. GESTION DU CHARGEMENT
async function handleLoad() {
    const inputId = prompt("Entrez l'ID du planning à charger (ex: planning-1) :");
    if (!inputId) return;

    try {
        loadButton.textContent = 'Chargement en cours...';
        const data = await loadPlanning(inputId);
        
        // VÉRIFICATION DU TYPE (Sécurité)
        const currentType = new URLSearchParams(window.location.search).get('type');
        if (data.type !== currentType) {
             alert(`Erreur: Ce planning est de type "${data.type}" et non "${currentType}".`);
             throw new Error('Incompatibilité de type');
        }

        // 🚨 CRITIQUE : Créer les pages manquantes
        // data.totalPages contient le nombre de pages sauvegardées.
        // window.totalPages contient le nombre de pages actuellement affichées (1 après l'initialisation).
        if (data.totalPages > window.totalPages) {
            // addPage() est dans pagination.js
            for (let i = window.totalPages; i < data.totalPages; i++) {
                if (typeof addPage === 'function') {
                    addPage(); 
                }
            }
        }
        // Mettre à jour l'état global et désérialiser
        window.totalPages = data.totalPages;
        window.currentPageNumber = data.currentPageNumber || 1;
        deserializePlanningData(data); // Applique les données à la page

        // Afficher la page correcte
        window.showPage(data.currentPageNumber || 1); 

        
        // Mise à jour de l'affichage
        localStorage.setItem('currentPlanningId', inputId);
        displayId.textContent = inputId;
        loadButton.textContent = '✅ Chargement réussi !';

    } catch (error) {
        alert(error.message);
        loadButton.textContent = '❌ Erreur de chargement';
    } finally {
        setTimeout(() => {
            loadButton.textContent = 'Charger un planning par ID';
        }, 3000); 
    }
}


// 4. INITIALISATION (Lancement des Écouteurs)
document.addEventListener('DOMContentLoaded', () => {
    // 🚨 IMPORTANT : Lier les fonctions aux boutons
    if (saveButton) saveButton.addEventListener('click', handleSave);
    if (loadButton) loadButton.addEventListener('click', handleLoad);
    
    // Charger l'ID existant au démarrage
    const storedId = localStorage.getItem('currentPlanningId');
    if (storedId) {
        displayId.textContent = storedId;
    }
});