// /js/pagination.js - Version corrigée avec Modèle Statique

// ----------------------------------------------------------------
// Déclarations (Variables d'état et Éléments du DOM)
// ----------------------------------------------------------------
// totalPages = Nombre de pages UTILISATEUR existantes (commence à 0 avant le premier addPage)
window.totalPages = 0; 
window.currentPageNumber = 0; 
const addPageBtn = document.getElementById('add-page-btn');
const deletePageBtn = document.getElementById('delete-page-btn');
const paginationStatus = document.getElementById('pagination-status');
const thumbnailContainer = document.getElementById('thumbnail-container');
const allPagesContainer = document.getElementById('all-pages-container');

const MODEL_ID = 'planning-container'; // ID du modèle statique que vous avez dans le HTML

// ----------------------------------------------------------------
// Fonctions de Gestion de l'Interface
// ----------------------------------------------------------------

function updatePaginationStatus() {
    if (paginationStatus) {
        const currentDisplay = window.currentPageNumber > 0 ? window.currentPageNumber : 1;
        paginationStatus.textContent = `Page ${currentDisplay} / ${window.totalPages}`;
    }
    if (deletePageBtn) {
        deletePageBtn.disabled = (window.totalPages <= 1);
    }
}

function createThumbnail(pageElement, pageNum) {
    const thumbnailWrapper = document.createElement('div');
    thumbnailWrapper.className = 'thumbnail-wrapper';
    thumbnailWrapper.dataset.page = pageNum;
    
    const label = document.createElement('div');
    label.className = 'thumbnail-label';
    label.textContent = `Page ${pageNum}`;
    thumbnailWrapper.appendChild(label);
    
    thumbnailWrapper.addEventListener('click', function() {
        const targetPageNumber = parseInt(this.dataset.page); 
        window.showPage(targetPageNumber);
    });

    if (thumbnailContainer) {
        thumbnailContainer.appendChild(thumbnailWrapper);
    }
}


// ----------------------------------------------------------------
// Fonctions de Navigation et de Structure
// ----------------------------------------------------------------

window.showPage = (num) => {
    if (num < 1 || num > window.totalPages) return;

    // 1. Masque toutes les pages principales (sauf le modèle)
    if (allPagesContainer) {
        allPagesContainer.querySelectorAll('.a4-canvas').forEach(page => {
            if (page.id !== MODEL_ID) { // N'affecte pas le modèle
                page.style.display = 'none'; 
                page.classList.remove('current-page'); 
            }
        });
    }

    // 2. Affiche la page demandée
    const targetPage = document.querySelector(`.a4-canvas[data-page-number="${num}"]`);
    
    if (targetPage) {
        targetPage.style.display = 'block'; 
        targetPage.classList.add('current-page'); 
        
        window.currentPageNumber = num;
        updatePaginationStatus();
        
        // Appeler la logique de mise à jour du header (Date, Lieu)
        if (typeof updateDayDisplay === 'function') {
            updateDayDisplay(); 
        }
    } 
    
    // 3. Mise en évidence du bouton actif
    document.querySelectorAll('.thumbnail-wrapper').forEach(wrapper => {
        wrapper.classList.toggle('active', parseInt(wrapper.dataset.page) === num);
    });
};


/**
 * Ajoute une nouvelle page de planning.
 */
function addPage() {
    // 🚨 CORRECTION CRITIQUE : Utilise l'ID du modèle statique pour le clonage
    const modelPage = document.getElementById(MODEL_ID); 
    
    if (!modelPage) {
        // Ce message ne devrait plus apparaître si le modèle existe
        console.error(`❌ Erreur Pagination: Impossible de trouver l'élément modèle '#${MODEL_ID}' pour le clonage.`);
        return; 
    }

    window.totalPages++;
    
    const newPage = modelPage.cloneNode(true);
    const newPageNumber = window.totalPages;
    
    // 1. Suppression des classes et styles du modèle
    newPage.classList.remove('current-page'); 
    
    // 2. Mise à jour des attributs du nouveau conteneur
    const newPageId = `planning-container-${newPageNumber}`;
    newPage.id = newPageId; // Lui donne un ID propre d'utilisateur
    newPage.setAttribute('data-page-number', newPageNumber);
    newPage.style.display = 'none'; // Masqué jusqu'à showPage()
    
    // 3. Mise à jour de tous les IDs internes pour l'unicité
    if (typeof updatePageContentIDs === 'function') {
        updatePageContentIDs(newPage, newPageNumber);
    }

    // 4. Effacer la valeur du champ de date cloné
    // 🚨 Assurez-vous que le sélecteur est correct pour votre input de date dans le planning.
    const dateInputNewPage = newPage.querySelector('[id^="date-lundi-page-"]');
    if (dateInputNewPage) {
        dateInputNewPage.value = ''; // CRITIQUE : Efface la date clonée!
    }
    
    // 5. Ajouter la nouvelle page au conteneur principal
    if (allPagesContainer) {
        allPagesContainer.appendChild(newPage);
    }
    
    // 6. Basculer l'affichage sur la nouvelle page et créer le bouton de navigation
    window.showPage(newPageNumber);
    createThumbnail(newPage, newPageNumber); 
    
    // 7. Initialisation de la logique spécifique à la nouvelle page
    if (typeof window.initializePageLogic === 'function') {
        window.initializePageLogic(newPage);
    }
}


/**
 * Met à jour tous les IDs des éléments d'une page clonée/renumérotée.
 * Cette fonction doit être définie (dans tools.js ou appLogic.js si elle n'est pas déjà dans pagination.js)
 */
function updatePageContentIDs(newPage, newPageNumber) {
    const selectors = [
        '[id^="cellule"]', 
        '[id^="zoneTexte"]', 
        '[id^="imageInput"]', 
        '[id^="image-preview-"]', 
        '[id^="date-lundi-page-"]'
    ];

    selectors.forEach(selector => {
        // Sélecteur qui ne trouve pas le conteneur principal (il est déjà géré)
        newPage.querySelectorAll(selector).forEach(element => {
            const originalId = element.id;
            // Utilise une regex pour trouver le numéro final (ex: zoneTexte10)
            const match = originalId.match(/[a-zA-Z-]+?(\d+)$/);
            
            if (match) {
                const baseName = originalId.substring(0, originalId.length - match[1].length);
                const originalNumber = parseInt(match[1]);
                
                // Ex: zoneTexte1_p2
                const newId = `${baseName}${originalNumber}_p${newPageNumber}`;
                
                element.id = newId;

                // Mettre à jour les labels 'for' et autres attributs liés à l'ID
                const label = newPage.querySelector(`label[for="${originalId}"]`);
                if (label) {
                    label.setAttribute('for', newId);
                }
            } else if (originalId) { // Gère les IDs sans numéro final
                 // On ne modifie pas les IDs du modèle.
            }
        });
    });
    
    const pageNumberDisplay = newPage.querySelector('.page-number-display');
    if (pageNumberDisplay) {
        pageNumberDisplay.textContent = `Page ${newPageNumber}`;
    }
}


function deletePage() {
    if (window.totalPages <= 1) return;

    const pageNumberToDelete = window.currentPageNumber;
    // ... (Logique de suppression et renumérotation) ...
    
    const pageToDelete = document.querySelector(`.a4-canvas[data-page-number="${pageNumberToDelete}"]`);
    const thumbnailToDelete = document.querySelector(`.thumbnail-wrapper[data-page="${pageNumberToDelete}"]`);
    
    if (pageToDelete && allPagesContainer) {
        allPagesContainer.removeChild(pageToDelete);
    }
    if (thumbnailToDelete && thumbnailContainer) {
        thumbnailContainer.removeChild(thumbnailToDelete);
    }

    window.totalPages--;

    // 2. Renumérotation
    const pages = allPagesContainer.querySelectorAll(`.a4-canvas:not(#${MODEL_ID})`); 
    const thumbnails = thumbnailContainer.querySelectorAll('.thumbnail-wrapper');
    let newIndex = 1;

    pages.forEach(page => {
        page.setAttribute('data-page-number', newIndex);
        page.id = `planning-container-${newIndex}`; 
        
        updatePageContentIDs(page, newIndex);

        if (typeof window.initializePageLogic === 'function') {
            window.initializePageLogic(page);
        }

        newIndex++;
    });
    
    newIndex = 1;
    thumbnails.forEach(wrapper => {
        wrapper.dataset.page = newIndex;
        const label = wrapper.querySelector('.thumbnail-label');
        if (label) {
            label.textContent = `Page ${newIndex}`;
        }
        newIndex++;
    });
    
    // 3. Affichage de la nouvelle page active
    const newPageToShow = Math.min(pageNumberToDelete, window.totalPages);
    
    window.showPage(newPageToShow);
    updatePaginationStatus();
}


// ----------------------------------------------------------------
// Initialisation
// ----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Identifier et masquer le modèle (Page 0)
    const pageModel = document.getElementById(MODEL_ID); 
    
    if (pageModel) {
        // 🚨 CRITIQUE : Transformer cette page en modèle caché
        pageModel.style.display = 'none'; 
        pageModel.classList.remove('current-page');
        pageModel.removeAttribute('data-page-number'); // Retrait de l'attribut qui posait problème
        
        // window.totalPages commence à 0. Le premier appel à addPage() crée la Page 1.
        addPage(); 
        
        console.log("✅ Pagination: Logique de pagination par modèle statique initialisée.");
    } else {
        console.error(`❌ Pagination: Conteneur modèle '#${MODEL_ID}' introuvable.`);
    }

    updatePaginationStatus();
    
    if (addPageBtn) {
        addPageBtn.addEventListener('click', addPage);
    }
    if (deletePageBtn) {
        deletePageBtn.addEventListener('click', deletePage);
    }
});