// /js/stateManager.js - VERSION FINALE CORRIGÉE ET STABILISÉE

// ----------------------------------------------------------------------
// 1. DÉCLARATION DES VARIABLES GLOBALES et CONSTANTES
// ----------------------------------------------------------------------

// Déclarations Minimalistes si elles ne sont pas déjà dans d'autres fichiers
window.totalPages = 1;
window.currentPageNumber = 1;
window.imageZoomStates = {};
window.couleurCelluleSelect = document.getElementById('couleurCellule'); 
window.showPage = (num) => { console.log(`Navigation vers la page ${num} simulée.`); }; 

// Constantes pour la logique de sauvegarde
const ALL_COLOR_CLASSES = ['bgc1', 'bgc2', 'bgc3', 'bgc4', 'bgc5', 'bgc6', 'bgc7', 'bgc8', 'bgc9', 'bgc10', 'bgc11'];
const MODEL_ID = 'planning-container'; // ID du modèle statique à exclure de la sauvegarde

// Fonction utilitaire pour obtenir le paramètre 'type' de l'URL
function getPlanningTypeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('type') || 'default'; 
}

// ----------------------------------------------------------------------
// 2. SAUVEGARDE (Sérialisation)
// ----------------------------------------------------------------------
export function serializePlanningData() {
    const cellsContent = {};
    const cellColors = {}; 
    
    // 🚨 CORRECTION CRITIQUE : EXCLURE LE MODÈLE (#planning-container)
    // On sélectionne TOUS les conteneurs de page SAUF celui avec l'ID du MODÈLE
    document.querySelectorAll(`.a4-canvas:not(#${MODEL_ID})`).forEach(page => { 
        
        // 1. Sauvegarde du Contenu (.editable contient le texte)
        page.querySelectorAll('.editable').forEach(cell => { 
            if (cell.id) { 
                cellsContent[cell.id] = cell.innerHTML; 
            }
        });

        // 2. Sauvegarde des Couleurs (.cellule contient la classe de couleur)
        page.querySelectorAll('.cellule[id]').forEach(cell => {
            const activeColor = ALL_COLOR_CLASSES.find(className => cell.classList.contains(className));
            if (activeColor) {
                cellColors[cell.id] = activeColor;
            }
        });
    });

    return {
        id: localStorage.getItem('currentPlanningId') || null,
        type: getPlanningTypeFromURL(),
        cellsContent: cellsContent,
        cellColors: cellColors, // Inclus les couleurs
        totalPages: window.totalPages, 
        currentPageNumber: window.currentPageNumber,
    };
}

// ----------------------------------------------------------------------
// 3. CHARGEMENT (Désérialisation)
// ----------------------------------------------------------------------
export function deserializePlanningData(data) {
    console.log("--- DÉSERIALISATION COMMENCÉE ---");
    
    // 1. Remplir le contenu des cellules
    if (data.cellsContent) {
        for (const [cellId, content] of Object.entries(data.cellsContent)) {
             const cell = document.getElementById(cellId);
             if (cell) {
                 cell.innerHTML = content; 
             } else {
                 console.warn(`❌ Échec : Cellule ID "${cellId}" non trouvée. (Probablement une ancienne donnée ou le modèle)`);
             }
        }
    }
    
    // 2. Restauration des Couleurs de Cellule
    if (data.cellColors) {
        for (const cellId in data.cellColors) {
            const cell = document.getElementById(cellId);
            if (cell) {
                // Supprimer toutes les anciennes classes et appliquer la nouvelle
                ALL_COLOR_CLASSES.forEach(className => cell.classList.remove(className));
                cell.classList.add(data.cellColors[cellId]);
                console.log(`Restauration: Couleur "${data.cellColors[cellId]}" appliquée à l'ID "${cellId}"`); 
            }
        }
    }
    
    // 3. Restauration de l'état global
    window.totalPages = data.totalPages || 1;
    window.currentPageNumber = data.currentPageNumber || 1;
    
    // 4. Finalisation : Réinitialiser la logique sur TOUTES les pages (hors modèle)
    // C'est essentiel pour réattacher les écouteurs de date, d'images, etc. sur les pages clonées.
    document.querySelectorAll(`.a4-canvas:not(#${MODEL_ID})`).forEach(page => {
         // On s'assure que initializePageLogic existe dans appLogic.js
         if (typeof window.initializePageLogic === 'function') {
            window.initializePageLogic(page);
        }
    });

    console.log("--- DÉSERIALISATION TERMINÉE ---");
}


// ----------------------------------------------------------------------
// 4. VOS AUTRES FONCTIONS (handleZoom, handleImage, etc.)
// ----------------------------------------------------------------------
// 🚨 Assurez-vous de coller ici toutes les autres fonctions 
// spécifiques à la gestion d'état ou aux écouteurs d'images/zoom/etc.
// qui étaient présentes dans votre ancien fichier stateManager.js.