// /js/tools.js - CORRIGÉ POUR SUPPORT MULTI-PAGE

// ----------------------------------------------------------------
// 1. Déclaration des Constantes et Fonctions de Base
// ----------------------------------------------------------------

// Mappage des couleurs HEX pour le surlignage
const highlightColors = {
    // 🚨 Assurez-vous que ces couleurs correspondent à votre design
    manual: '#ffff00', 
    sport: '#00ffff',
    art: '#00ff00',
    coocking: '#ff00ff',
    // ... Ajoutez toutes vos autres couleurs ici
    transparent: 'transparent' // Ajout pour retirer le surlignage
};

// Liste complète des classes de couleur de fond (utilisée par stateManager et ici)
const ALL_COLOR_CLASSES = ['bgc1', 'bgc2', 'bgc3', 'bgc4', 'bgc5', 'bgc6', 'bgc7', 'bgc8', 'bgc9', 'bgc10', 'bgc11', 'outing', 'closed'];


// Fonctions d'édition de texte (Gras/Surlignage)
function applyBold() {
    document.execCommand('bold', false, null);
}

function applyHighlight(colorValue) {
    document.execCommand('backColor', false, colorValue);
}


// ----------------------------------------------------------------
// 2. Fonction d'Application de Couleur de Cellule (FIX CRITIQUE)
// ----------------------------------------------------------------

/**
 * Applique la couleur de fond de cellule sélectionnée au conteneur DIV de grille parent (.cellule).
 */
function applyCellColor() {
    const couleurCelluleSelect = document.getElementById('couleurCellule'); 
    if (!couleurCelluleSelect) return;
    
    const bgcClass = couleurCelluleSelect.value; 
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return; 
    
    // 🚨 C'est la ligne CRITIQUE qui trouve le parent .cellule
    let currentNode = selection.getRangeAt(0).startContainer;
    const targetCell = currentNode.closest('.cellule');
    
    if (!targetCell) {
        console.error("❌ ERREUR COULEUR CELLULE: Le parent avec la classe '.cellule' est introuvable. Avez-vous cliqué dans une cellule ?");
        return;
    }
    
    // (Le reste de la logique pour enlever/ajouter les classes bgcX)
    ALL_COLOR_CLASSES.forEach(className => targetCell.classList.remove(className));
    if (bgcClass && bgcClass !== 'none') {
        targetCell.classList.add(bgcClass);
    }
}


// ----------------------------------------------------------------
// 3. Fonctions Requises par appLogic.js (FIX : Images et Redimensionnement)
// ----------------------------------------------------------------

/**
 * Définit la logique d'upload et d'affichage d'une image pour une paire input/preview donnée.
 * Rends la fonction globale pour qu'elle soit appelée par initializePageLogic.
 */
window.setupImageUploader = (imageInput, imagePreview, uploadIcon) => {
    
    // Supprime l'ancien écouteur s'il existe (pour le clonage)
    imageInput.removeEventListener('change', imageInput._tempListener); 

    const listener = function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Créer l'image et la définir en tant que fond pour garder la div propre
                imagePreview.style.backgroundImage = `url(${e.target.result})`;
                imagePreview.style.backgroundSize = 'contain';
                imagePreview.style.backgroundRepeat = 'no-repeat';
                imagePreview.style.backgroundPosition = 'center';
                uploadIcon.style.display = 'none'; // Cacher l'icône
            };
            reader.readAsDataURL(this.files[0]);
        }
    };
    
    // Attache le nouvel écouteur et le stocke pour le nettoyage futur
    imageInput.addEventListener('change', listener);
    imageInput._tempListener = listener; // Stockage de la référence
};

/**
 * Fonction de redimensionnement de base (à adapter si vous utilisez une librairie)
 * Rends la fonction globale pour qu'elle soit appelée par initializePageLogic.
 */
window.applyResizableLogic = (element) => {
    // 🚨 Si vous utilisez jQuery UI ou une autre librairie, adaptez ce code pour réinitialiser le 'resizable'
    // Ex: if (typeof jQuery !== 'undefined' && element.jquery) { element.resizable('destroy').resizable(); }
    
    // Si c'est une logique CSS/JS pure :
    console.log(`✅ Redimensionnement appliqué/réinitialisé au champ : ${element.id}`);
    // Le redimensionnement pour contenteditable est souvent géré par CSS (`resize: both; overflow: auto;`)
    // ou nécessite un wrapper/une librairie. Si c'est en CSS, il n'y a rien à faire ici.
};


// ----------------------------------------------------------------
// 4. Initialisation du DOM (Écouteurs STATIQUES)
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Bouton Gras et Surlignage (Déjà corrigé, on s'assure qu'ils sont toujours là)
    const boldToggle = document.getElementById('boldToggle');
    if (boldToggle) {
        boldToggle.addEventListener('mousedown', (e) => e.preventDefault()); 
        boldToggle.addEventListener('click', applyBold); 
    }
    document.querySelectorAll('.highlight-btn').forEach(btn => {
        btn.addEventListener('mousedown', (e) => e.preventDefault());
        btn.addEventListener('click', function() {
            const colorKey = this.getAttribute('data-color'); 
            const colorValue = highlightColors[colorKey] || 'transparent'; // Fallback pour 'remove'
            applyHighlight(colorValue);
        });
    });
    
    
    // 🚨 2. FIX CRITIQUE : Application de couleur de cellule
    const couleurCelluleSelect = document.getElementById('couleurCellule'); 
    
    if (couleurCelluleSelect) {
        // Option A: Écouteur sur la liste déroulante elle-même (le plus fiable et rapide)
        couleurCelluleSelect.addEventListener('change', applyCellColor);
        console.log("✅ tools.js: Couleur Cellule appliquée sur le changement de sélection.");
    } else {
        // Option B: Si vous avez un bouton d'application (#color-apply-btn), remettez la logique précédente :
        const colorApplyBtn = document.getElementById('color-apply-btn'); 
        if (colorApplyBtn) {
            colorApplyBtn.addEventListener('click', applyCellColor);
            console.log("✅ tools.js: Couleur Cellule initialisée sur bouton d'application.");
        } else {
             console.error("❌ tools.js: Le sélecteur de couleur (#couleurCellule) est introuvable. Vérifiez votre HTML.");
        }
    }

    // 3. Logique de Couleur/Contraste initiale
     document.querySelectorAll('.zoneTexte, .upload-text, .upload-icon').forEach(el => {
        el.classList.add('text-black');
    });
});