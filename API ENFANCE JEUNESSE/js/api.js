// /js/api.js

const SERVER_URL = 'http://localhost:3000'; 

/**
 * Envoie les données au serveur (POST) pour la sauvegarde ou la mise à jour.
 */
export async function savePlanning(dataToSave) {
    try {
        const response = await fetch(`${SERVER_URL}/api/planning/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        });

        const result = await response.json();

        if (response.ok) {
            return result.planningId;
        } else {
            throw new Error(result.message || 'Erreur serveur.');
        }

    } catch (error) {
        console.error('Erreur réseau lors de la sauvegarde:', error);
        throw new Error('Impossible de se connecter au serveur (vérifiez que node server.js est lancé).');
    }
}

/**
 * Récupère un planning par son ID (GET).
 */
export async function loadPlanning(planningId) {
    const url = `${SERVER_URL}/api/planning/${planningId}`;
    try {
        const response = await fetch(url);
        const result = await response.json();
        
        if (response.ok) {
            return result;
        } else {
            throw new Error(result.message || `Erreur de chargement: ${response.status}`);
        }
    } catch (error) {
        throw new Error('Erreur de chargement du planning.');
    }
}