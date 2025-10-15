//----------------------------------------------------------------CONTROL PANNEL -------------------------------------------------------------------------------------

// 1- DÉCLARATION DES VARIABLES GLOBALES ------------------------------------------------------------------------------------------------

const allPagesContainer = document.getElementById('all-pages-container');
const addPageBtn = document.getElementById('add-page-btn');
const deletePageBtn = document.getElementById('delete-page-btn');
const paginationStatus = document.getElementById('pagination-status');
const thumbnailContainer = document.getElementById('thumbnail-container');
const couleurCelluleSelect = document.getElementById('couleurCellule'); // 👈 Référence à la liste déroulante

// Variables d'état pour la pagination
let currentPageElement = document.getElementById('planning-container');
let currentPageNumber = 1;
let totalPages = 1;

// Variables d'état pour l'image
let selectedImageElement = null;
let selectedImageId = null; 
const imageZoomStates = {};
const ZOOM_STEP = 0.1;

// Variables d'état pour le background (Utilisez vos chemins locaux)
const vacancesBackgrounds = {
    noel: "url('background/noelBgc.jpg')", 
    hiver: "url('background/hiverBgc.jpg')",
    paques: "url('background/paquesBgc.jpg')",
    printemps: "url('background/printempsBgc.jpg')",
    ete: "url('background/eteBgc.jpg')",
};

// Mappage des couleurs HEX pour le surlignage (Basé sur vos variables CSS)
const highlightColors = {
    manual: '#D5DA31',    // Correspond à --C1
    sport: '#8DC048',     // Correspond à --C2
    art: '#00974A',       // Correspond à --C3
    coocking: '#f4c6b5',  // Correspond à --C6
};


// 2- FONCTIONS DE PAGINATION (Inclut Miniatures) -----------------------------------------------------------------------------------

/** Met à jour les états des boutons et l'affichage de la pagination. */
function updatePaginationUI() {
    if (paginationStatus) {
        paginationStatus.textContent = `Page ${currentPageNumber} / ${totalPages}`;
    }
    if (deletePageBtn) {
        deletePageBtn.disabled = totalPages === 1;
    }
}

/** Génère et met à jour les miniatures de toutes les pages. */
function renderThumbnails() {
    if (!thumbnailContainer) return; 

    thumbnailContainer.innerHTML = ''; 

    document.querySelectorAll('.a4-canvas').forEach(page => {
        const pageNum = parseInt(page.getAttribute('data-page-number'));
        const isActive = pageNum === currentPageNumber; 
        
        const wrapper = document.createElement('div');
        wrapper.className = `page-thumbnail-wrapper ${isActive ? 'active-thumbnail' : ''}`;
        wrapper.setAttribute('data-page-id', pageNum);

        const thumbnail = document.createElement('div');
        thumbnail.className = 'page-thumbnail';
        
        const contentClone = page.cloneNode(true);
        
        // Nettoyage et style pour la miniature
        contentClone.querySelectorAll('input, select, button, textarea').forEach(el => el.remove()); 
        contentClone.style.pointerEvents = 'none'; 
        contentClone.classList.remove('current-page', 'hidden-page');
        contentClone.style.boxShadow = 'none'; 
        contentClone.style.borderRadius = '0'; 

        thumbnail.appendChild(contentClone);
        
        const label = document.createElement('div');
        label.className = 'thumbnail-label';
        label.textContent = `Page ${pageNum}`;

        wrapper.appendChild(thumbnail);
        wrapper.appendChild(label);
        
        wrapper.addEventListener('click', () => switchToPage(pageNum));

        thumbnailContainer.appendChild(wrapper);
    });
}


/** Change la page visible et active. */
function switchToPage(pageNumber) {
    const newPage = document.querySelector(`[data-page-number="${pageNumber}"]`);
    
    if (!newPage) return;

    if (currentPageElement) {
        currentPageElement.classList.remove('current-page');
        currentPageElement.classList.add('hidden-page');
    }

    currentPageElement = newPage;
    currentPageNumber = pageNumber;
    
    newPage.classList.remove('hidden-page');
    newPage.classList.add('current-page');

    updatePaginationUI();
    renderThumbnails(); 
    
    if (allPagesContainer && allPagesContainer.contains(newPage)) {
        newPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}


/** Clone la page active pour créer une nouvelle page, en réinitialisant les champs. */
function cloneAndAppendPage(originalPage) {
    totalPages++;
    
    const newPage = originalPage.cloneNode(true);
    
    newPage.id = `planning-container-p${totalPages}`;
    newPage.classList.remove('current-page', 'hidden-page'); 
    newPage.setAttribute('data-page-number', totalPages);

    const oldPageNumber = 1; 
    const newPageNumber = totalPages;

    function updateAttributes(element, attrName, replaceFrom, replaceTo) {
        if (element.hasAttribute(attrName)) {
            element.setAttribute(attrName, element.getAttribute(attrName).replace(new RegExp(`-page-${replaceFrom}(?!\\d)`), `-page-${replaceTo}`));
        }
    }

    // Réinitialiser les champs et mettre à jour les IDs/data-page-id
    newPage.querySelectorAll('[id], [for], [data-page-id], input, textarea, div[contenteditable="true"], .case-planning').forEach(el => {
        
        // Mise à jour des IDs et 'for'
        updateAttributes(el, 'id', oldPageNumber.toString(), newPageNumber.toString());
        updateAttributes(el, 'for', oldPageNumber.toString(), newPageNumber.toString());
        
        // Mise à jour de l'attribut data-page-id
        if (el.hasAttribute('data-page-id')) {
            el.setAttribute('data-page-id', newPageNumber.toString());
        }

        // Réinitialiser les valeurs des inputs/textareas
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
             el.value = '';
        }
        
        // Réinitialiser les zones de texte éditables
        if (el.contentEditable === 'true') {
            el.innerHTML = '';
        }
        
        // Réinitialiser les previews d'image
        if (el.classList.contains('image-preview-js')) {
            el.style.backgroundImage = 'none'; 
            let imgEl = el.querySelector('img.loaded-image');
            if (imgEl) imgEl.remove();
        }

        // 🚨 Correction: Enlever les classes de couleur de cellule sur la nouvelle page
        if (el.classList.contains('case-planning')) {
            el.classList.remove('outing', 'closed');
        }
    });
    
    const pageNumberDisplay = newPage.querySelector('.page-number-display');
    if (pageNumberDisplay) {
        pageNumberDisplay.textContent = `Page ${newPageNumber}`;
    }
    
    allPagesContainer.appendChild(newPage);
    switchToPage(totalPages);
}


/** Supprime la page active (sauf si c'est la seule). */
function deleteCurrentPage() {
    if (totalPages <= 1) return; 

    const pageToDelete = currentPageElement;
    const pageToSwitchTo = (currentPageNumber > 1) ? currentPageNumber - 1 : 1; 
    
    pageToDelete.remove();

    totalPages--;

    // Re-numérotation des pages restantes
    document.querySelectorAll('.a4-canvas').forEach((page, index) => {
        const newPageNum = index + 1;
        
        page.setAttribute('data-page-number', newPageNum);
        
        const pageNumberDisplay = page.querySelector('.page-number-display');
        if (pageNumberDisplay) pageNumberDisplay.textContent = `Page ${newPageNum}`;
    });

    switchToPage(pageToSwitchTo); 
}


// 3- FONCTIONS DE GESTION DES DATES -----------------------------------------------------------------------------------------

/** Calcule et affiche les dates des jours de la semaine pour une page spécifique. */
function updatePageDisplayedDates(pageElement, baseDateValue) {
    const dayIds = [
        { id: 'date-lundi-aff', offset: 0 },
        { id: 'date-mardi-aff', offset: 1 },
        { id: 'date-mercredi-aff', offset: 2 },
        { id: 'date-jeudi-aff', offset: 3 },
        { id: 'date-vendredi-aff', offset: 4 }
    ];

    if (!baseDateValue) {
        dayIds.forEach(item => {
            const affElement = pageElement.querySelector(`#${item.id}`);
            if (affElement) affElement.textContent = 'JJ/MM';
        });
        return;
    }

    // Ajout de 'T00:00:00' pour éviter les problèmes de fuseau horaire
    const firstMonday = new Date(baseDateValue + 'T00:00:00'); 

    dayIds.forEach(item => {
        const dateForDay = new Date(firstMonday);
        dateForDay.setDate(firstMonday.getDate() + item.offset);

        const formattedDate = dateForDay.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });

        const affElement = pageElement.querySelector(`#${item.id}`);
        if (affElement) affElement.textContent = formattedDate;
    });
}


// 4- FONCTIONS DE GESTION DES IMAGES (CORRIGÉE) ---------------------------------------------------------------------------------------

/** 🟢 Gère le changement de fichier dans l'input (CORRIGÉE : Implémentation simplifiée et robuste). */
function handleFileInput(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // 🚨 Correction: Trouver le preview en remontant depuis l'input file.
    const container = e.target.closest('.image-upload-container'); 
    const preview = container ? container.querySelector('.image-preview-js') : null;
    
    if (!preview) {
        console.error("Image de prévisualisation introuvable.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e_reader) {
        let img = preview.querySelector('.loaded-image');
        if (!img) {
            img = document.createElement('img');
            img.className = 'loaded-image';
            preview.appendChild(img);
        }
        
        img.src = e_reader.target.result;
        img.style.objectFit = 'cover';
        img.style.objectPosition = '50% 50%';
        img.style.transform = 'scale(1.0)';
        
        // Initialiser l'état du zoom
        imageZoomStates[preview.id || preview.className] = 1.0;
        
        const controls = container.querySelector('.image-controls');
        if (controls) controls.style.display = 'block';
    }
    reader.readAsDataURL(file);
}

/** Gère le clic sur la zone d'image pour l'activer (permettant les contrôles). */
function handleImageClick(e) {
    document.querySelectorAll('.loaded-image').forEach(i => i.classList.remove('selected-image'));

    const preview = e.currentTarget;
    const img = preview.querySelector('.loaded-image');
    
    if (img) {
        img.classList.add('selected-image');
        selectedImageElement = img;
        selectedImageId = preview.id || preview.className;
    } else {
        selectedImageElement = null;
        selectedImageId = null;
    }
}

/** Gère les contrôles (zoom, fit, position). */
function handleImageControl(controlType, value) {
    if (!selectedImageElement) return;

    const imageId = selectedImageId;

    if (controlType === 'zoom') {
        if (imageZoomStates[imageId] === undefined) {
            imageZoomStates[imageId] = 1.0;
        }

        let newScale = imageZoomStates[imageId];

        if (value === 'in') {
            newScale += ZOOM_STEP;
        } else if (value === 'out') {
            newScale = Math.max(1.0, newScale - ZOOM_STEP); 
        }
        
        imageZoomStates[imageId] = newScale;
        selectedImageElement.style.transform = `scale(${newScale})`;
        
    } else if (controlType === 'fit') {
        selectedImageElement.style.objectFit = value;
        selectedImageElement.style.objectPosition = '50% 50%'; 
        selectedImageElement.style.transform = 'scale(1.0)';
        imageZoomStates[imageId] = 1.0;

    } else if (controlType === 'position') {
        selectedImageElement.style.objectPosition = value;
    }
}


// NOUVEAU: 3- GESTION DE LA COULEUR DES CELLULES PAR SÉLECTION ET BOUTON -------------------------------------------

// Assurez-vous que cette variable est définie au début de votre fichier JS:
// const allPagesContainer = document.getElementById('all-pages-container');

// Déclaration de la variable activeColorClass (Gardez ce code)
let activeColorClass = document.getElementById('couleurCellule').value || 'celluleColor';

// A. Mise à jour de la couleur active lors du changement du select (Gardez ce code)
document.getElementById('couleurCellule').addEventListener('change', function() {
    activeColorClass = this.value;
});

// ------------------------------------------------------------------------------------------------------
// NOUVELLE LOGIQUE B : Utilisation de la délégation d'événements (REMPLACEZ VOTRE ANCIEN BLOCK B)
// ------------------------------------------------------------------------------------------------------

allPagesContainer.addEventListener('click', function(e) {
    // Vérifie si l'élément cliqué correspond à notre bouton de couleur, même s'il est cloné
    if (e.target.matches('.color-apply-btn')) {
        
        const applyBtn = e.target;
        const cell = applyBtn.closest('.cellule'); 
        if (!cell) return;

        // Début de votre logique d'application de couleur :
        const allColorClasses = [
 'celluleColor', 'outing', 'closed' // Doit correspondre à vos états de couleur
 ];
        
 // Réinitialiser toutes les classes de couleur existantes 
 allColorClasses.forEach(className => cell.classList.remove(className));
 
 // Appliquer la nouvelle classe de couleur sélectionnée
 cell.classList.add(activeColorClass);

 // Mettre à jour la couleur du texte pour le contraste (Appel à la fonction C)
 updateTextColorForSelect(cell, activeColorClass);
    }
});

// C. Fonction de mise à jour du contraste (spécifique aux choix "Sortie", "Fermé", "Effacer")
function updateTextColorForSelect(cellElement, colorClass) {
    // Cibler les éléments de texte dans la cellule
    const textElements = cellElement.querySelectorAll('.zoneTexte, .upload-text, .upload-icon');
    
    // Si la couleur est 'outing' ou 'closed', le texte DOIT être blanc
    const mustBeWhite = (colorClass === 'outing' || colorClass === 'closed');
    
    textElements.forEach(el => {
        // Supprimez TOUJOURS les deux classes de contraste avant d'en appliquer une nouvelle
        el.classList.remove('text-white', 'text-black');

        if (mustBeWhite) {
            // Pour les fonds foncés (Sortie/Fermé), on force le texte en blanc
            el.classList.add('text-white');
        } else {
            // Pour les fonds clairs (Effacer/celluleColor), on force le texte en noir
            el.classList.add('text-black');
        }
    });
}

// Initialisation au chargement de la page pour assurer que le texte de base est noir
document.addEventListener('DOMContentLoaded', () => {
    // S'assurer que le texte des zones éditables est noir par défaut (si non coloré)
    document.querySelectorAll('.zoneTexte, .upload-text, .upload-icon').forEach(el => {
         el.classList.add('text-black');
    });
});


// 6- FONCTIONS DE GESTION DU TEXTE ET DES CELLULES (CORRIGÉES) --------------------------------------------------------

/** Gère l'application des couleurs de surlignage. */
function applyHighlight(colorValue) {
    document.execCommand('backColor', false, colorValue);
}

/** Gère l'application du style Gras. */
function applyBold() {
    document.execCommand('bold', false, null);
}

/** 🟢 Gère le clic sur une cellule du planning pour lui appliquer la couleur de fond sélectionnée. */
function handlePlanningCellClick(e) {
    // Cibler uniquement les cellules de planning éditables pour éviter le conflit avec les autres clics
    if (!e.target.closest('.case-planning')) return;

    const cell = e.target.closest('.case-planning');
    
    // Si la cible cliquée est la zone de texte éditable à l'intérieur de la cellule, on n'agit pas (pour ne pas interférer avec l'édition)
    if (e.target.matches('.case-planning')) {
         
        // 1. Récupérer la valeur sélectionnée dans la liste déroulante
        if (!couleurCelluleSelect) return; 
        const selectedOption = couleurCelluleSelect.value;
        const classesToRemove = ['outing', 'closed']; // Les classes de couleur que vous utilisez

        // 2. Supprimer toutes les classes de couleur existantes
        cell.classList.remove(...classesToRemove);

        // 3. Appliquer la nouvelle classe, sauf si l'option est 'celluleColor' (qui signifie 'Effacer/Neutre' ou 'Sélectionner')
        if (selectedOption !== 'celluleColor') {
            cell.classList.add(selectedOption);
        }

        // Empêche la perte de focus si la cellule était éditable
        e.preventDefault();
        
        // Si le contenu de la cellule est éditable, forcer le focus pour reprendre la saisie
        if (cell.contentEditable === 'true') {
             cell.focus();
        }
    }
}


// 7- INITIALISATION ET ÉCOUTEURS D'ÉVÉNEMENTS --------------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // A. INITIALISATION DE L'ÉTAT INITIAL
    currentPageElement = document.querySelector('.a4-canvas[data-page-number="1"]') || document.getElementById('planning-container');
    currentPageNumber = parseInt(currentPageElement.getAttribute('data-page-number')) || 1;
    totalPages = document.querySelectorAll('.a4-canvas').length;
    
    updatePaginationUI();
    renderThumbnails(); 
    //adjustLieuWidth();
    
    // B. MISE EN PLACE DES ÉCOUTEURS

    // Écouteurs Pagination 
    if (addPageBtn) {
        const modelPage = document.getElementById('planning-container');
        addPageBtn.addEventListener('click', () => cloneAndAppendPage(modelPage));
    }
    if (deletePageBtn) {
        deletePageBtn.addEventListener('click', deleteCurrentPage);
    }
    if (paginationStatus) {
        paginationStatus.addEventListener('click', () => {
            let nextPage = currentPageNumber + 1;
            if (nextPage > totalPages) { nextPage = 1; }
            switchToPage(nextPage);
        });
    }

    // Écouteurs Header (Lieu & Background)
    const lieuSelect = document.getElementById('lieu');
    if (lieuSelect) {
        lieuSelect.addEventListener('change', adjustLieuWidth);
        
        const backgroundSelect = document.getElementById('background-select'); 
        if (backgroundSelect) {
            backgroundSelect.addEventListener('change', updateHeaderBackground);
        }
    }
    
    // Écouteurs Dates 
    if (allPagesContainer) {
        allPagesContainer.addEventListener('input', function(e) {
            if (e.target.matches('.date-input-per-page')) {
                const input = e.target;
                const pageElement = input.closest('.a4-canvas');
                updatePageDisplayedDates(pageElement, input.value);
            }
        });
        
        // 🟢 Écouteur pour la couleur de cellule (Délégation sur les cellules du planning)
        allPagesContainer.addEventListener('click', handlePlanningCellClick);
    }
    
    // Écouteurs Images
    document.querySelectorAll('.file-input-js').forEach(input => {
        input.addEventListener('change', handleFileInput);
    });
    document.querySelectorAll('.image-preview-js').forEach(preview => {
        // Le handleImageClick est essentiel pour activer les contrôles
        preview.addEventListener('click', handleImageClick);
    });
    document.querySelectorAll('.img-control-btn').forEach(button => {
        button.addEventListener('click', function() {
            const controlType = this.getAttribute('data-control');
            const value = this.getAttribute('data-value');
            handleImageControl(controlType, value);
        });
    });
    
    // Écouteurs Texte (Gras & Surlignage)
    const boldToggle = document.getElementById('boldToggle');
    if (boldToggle) {
        // Empêche la perte de la sélection de texte.
        boldToggle.addEventListener('mousedown', (e) => e.preventDefault()); 
        boldToggle.addEventListener('click', applyBold); 
    }
    
    // 🚨 Correction du Surlignage (cible maintenant la classe '.highlight-btn' comme dans votre HTML)
    document.querySelectorAll('.highlight-btn').forEach(btn => {
        // Empêche la perte de la sélection de texte.
        btn.addEventListener('mousedown', (e) => e.preventDefault()); 
        
        btn.addEventListener('click', function() {
            const colorKey = this.getAttribute('data-color'); 
            const colorValue = highlightColors[colorKey];
            
            if (colorValue) {
                applyHighlight(colorValue);
            } else if (colorKey === 'manual') {
                // Si "Effacer/Manuel" est sélectionné, on retire le surlignage
                document.execCommand('backColor', false, 'transparent');
            }
        });
    });
    
    console.log("Application planning.js chargée et corrigée. Surlignage, couleur de cellule et image sont fonctionnels.");
});

// ... Votre ancien code de planning.js est au-dessus ...

// Fonction utilitaire pour obtenir le paramètre 'type'
function getPlanningTypeFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('type') || 'default'; // Retourne 'default' si pas de paramètre
}

/**
 * Collecte toutes les données nécessaires pour reconstruire l'état complet du planning.
 * Doit être exportée.
 */
export function serializePlanningData() {
    
    // 1. Contenu et styles des cellules éditables
    const cellsContent = {};
    // Assurez-vous que .editable est la classe de toutes vos zones modifiables
    document.querySelectorAll('.editable').forEach(cell => {
        cellsContent[cell.id] = cell.innerHTML; 
    });

    // 2. État du planning
    const currentPlanningId = localStorage.getItem('currentPlanningId') || null;
    const planningType = getPlanningTypeFromURL(); // 🚨 IMPORTANT : Stocker le type

    // 3. Collecte des données des pages
    const allPagesData = [];
    document.querySelectorAll('.planning-page').forEach(page => {
        const pageCellsContent = {};
        page.querySelectorAll('.editable').forEach(cell => {
             // Il est plus sûr de sérialiser par page si l'ID des cellules n'est pas unique globalement
             // mais si vos IDs sont uniques (ex: 'cell-lundi-matin'), le point 1 suffit.
             // On utilise le point 1 pour simplifier ici.
        });

        // Récupérer les classes de fond si vous les utilisez pour les thèmes/vacances
        const pageBackgroundClass = page.className.match(/\b(bgc\d+)\b/g) ? page.className.match(/\b(bgc\d+)\b/g)[0] : '';

        allPagesData.push({
            // ... autres données spécifiques à la page ...
            backgroundClass: pageBackgroundClass
        });
    });

    // 4. L'objet complet de sauvegarde
    return {
        id: currentPlanningId,
        type: planningType, // 🚨 ESSENTIEL : Pour charger le bon type plus tard
        // Assurez-vous que les variables globales sont définies dans planning.js ou passées en argument
        totalPages: window.totalPages || 1, // Supposons que c'est global
        currentPageNumber: window.currentPageNumber || 1,
        cellsContent: cellsContent,
        imageZoomStates: window.imageZoomStates || {},
        couleurCellule: window.couleurCelluleSelect ? window.couleurCelluleSelect.value : '', 
        // ... ajoutez toute autre variable d'état global
    };
}

/**
 * Fonction inverse pour appliquer les données chargées.
 * Doit être exportée.
 */
/**
 * Applique les données chargées du serveur pour reconstruire l'état de la page.
 */
// /js/stateManager.js (dans la fonction deserializePlanningData)

export function deserializePlanningData(data) {
    console.log("Données reçues du serveur pour désérialisation:", data); // Log du contenu total
    
    // 1. Remplir le contenu des cellules
    if (data.cellsContent) {
        for (const [cellId, content] of Object.entries(data.cellsContent)) {
             
             // 🚨 LOG CRITIQUE : Vérifiez l'ID et le contenu
             console.log(`Restauration: ID=${cellId}, Contenu="${content.substring(0, 30)}..."`); // Affiche les 30 premiers caractères
             
             const cell = document.getElementById(cellId);
             if (cell) {
                 cell.innerHTML = content; // <-- LIGNE QUI FAIT LE TRAVAIL
             } else {
                 console.warn(`Cellule ID "${cellId}" non trouvée sur la page.`);
             }
        }
    } else {
         console.error("L'objet de données ne contient pas la propriété 'cellsContent'. La sauvegarde a échoué en amont.");
    }
    
    // ... Reste de la fonction ...
    console.log("Planning chargé et désérialisé.");
}