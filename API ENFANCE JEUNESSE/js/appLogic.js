// /js/appLogic.js - Logique d'Application pour Support Multi-Page

// ----------------------------------------------------------------
// 1. Mise à Jour de l'Affichage de la Date (Résout le décalage)
// ----------------------------------------------------------------

/**
 * Lit la date de la page actuellement VISIBLE (.current-page) et met à jour l'affichage de la date du planning (header).
 */
function updateDayDisplay() {
    // 🚨 Trouve la page active. C'est la solution au problème de date décalée.
    const currentPage = document.querySelector('.a4-canvas.current-page');
    if (!currentPage) return;
    
    // Trouve le champ de date DANS la page active
    const dateInput = currentPage.querySelector('[id^="date-lundi-page-"]');
    
    // Si la page est visible mais n'a pas de date (nouvelle page), on efface l'affichage
    if (!dateInput || !dateInput.value) {
        const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
        days.forEach(day => {
            const displayElement = document.getElementById(`date-${day}-aff`);
            if (displayElement) {
                displayElement.textContent = '—/—'; 
            }
        });
        return;
    }

    const baseDate = new Date(dateInput.value);
    const days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
    
    days.forEach((day, index) => {
        const currentDate = new Date(baseDate);
        currentDate.setDate(baseDate.getDate() + index);

        const displayElement = document.getElementById(`date-${day}-aff`);
        if (displayElement) {
            const dayStr = String(currentDate.getDate()).padStart(2, '0');
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            displayElement.textContent = `${dayStr}/${monthStr}`;
        }
    });
}
window.updateDayDisplay = updateDayDisplay; // Rendre la fonction globale

// ----------------------------------------------------------------
// 2. Initialisation des Écouteurs pour une Page Spécifique
// ----------------------------------------------------------------

/**
 * Initialise ou réinitialise TOUS les écouteurs pour une page spécifique.
 */
function initializePageLogic(pageElement) {
    
    // 1. GESTION DE LA DATE (Réattache l'écouteur 'change')
    const dateInput = pageElement.querySelector('[id^="date-lundi-page-"]');
    if (dateInput) {
        dateInput.removeEventListener('change', window.updateDayDisplay);
        dateInput.addEventListener('change', window.updateDayDisplay); 
        window.updateDayDisplay(); 
    }

    // 2. RESIZING DU CHAMP LIEU (Réactive le redimensionnement)
    // Assurez-vous que l'ID est bien "zoneTexte1" suivi d'un suffixe.
    const lieuInput = pageElement.querySelector('[id^="zoneTexte1_"]'); 
    if (lieuInput && typeof window.applyResizableLogic === 'function') {
        window.applyResizableLogic(lieuInput); 
    }
    // 🚨 Si votre redimensionnement ne fonctionne toujours pas, il se peut que 
    // l'ID pour le champ Lieu soit juste "zoneTexte1" sans suffixe sur le modèle.
    
    // 3. FIX POUR LES OUTILS (Gras/Surlignage - Résout l'instabilité)
    // Forcer le focus sur la zone editable lors du mousedown empêche la perte de sélection.
    pageElement.querySelectorAll('.editable').forEach(editableCell => {
        editableCell.removeEventListener('mousedown', editableCell.focus); // Nettoyage
        editableCell.addEventListener('mousedown', (e) => {
             // Empêche la perte de la sélection pour document.execCommand
             // (Le e.preventDefault dans tools.js est déjà là, mais ceci est un fix supplémentaire de focus)
             editableCell.focus();
        });
    });

    // 4. LOGIQUE D'IMPORTATION D'IMAGE (Réactive l'importation)
    pageElement.querySelectorAll('input[type="file"][id^="imageInput"]').forEach(imageInput => {
        const baseIdMatch = imageInput.id.match(/imageInput_(.+)/);
        if (!baseIdMatch) return;
        
        const baseId = baseIdMatch[1]; 
        const previewId = `image-preview-${baseId}`;
        const iconId = `upload-icon-${baseId}`;

        const imagePreview = document.getElementById(previewId);
        const uploadIcon = document.getElementById(iconId);

        if (imagePreview && uploadIcon && typeof window.setupImageUploader === 'function') {
            // 🚨 CRITIQUE : Cette fonction doit exister dans tools.js ou ailleurs.
            window.setupImageUploader(imageInput, imagePreview, uploadIcon);
        }
    });
    
    console.log(`✅ Logique spécifique ré-initialisée pour la page ${pageElement.getAttribute('data-page-number')}.`);
};
window.initializePageLogic = initializePageLogic; // Rendre la fonction globale

// ----------------------------------------------------------------
// 3. Initialisation Globale (Démarrage)
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // La page 1 est initialisée par pagination.js après le clonage.
    console.log("AppLogic: Logique de base (Dates, Lieu) initialisée.");
    window.updateDayDisplay(); // Afficher la date par défaut au démarrage
});