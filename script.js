document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consumptionForm');
    const historyBtn = document.getElementById('historyBtn');
    const historySection = document.getElementById('historySection');
    const historyList = document.getElementById('historyList');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    const sendBtn = document.getElementById('sendBtn');
    const newBillBtn = document.getElementById('newBillBtn');
    const invoiceContainer = document.getElementById('invoiceContainer');
    
    // Variables pour stocker les données
    let currentBill = {};
    let history = JSON.parse(localStorage.getItem('electricityBills')) || [];
    
    // Initialiser l'affichage de l'historique
    updateHistoryDisplay();
    
    // Animation d'entrée pour les éléments
    function animateElements() {
        const elements = document.querySelectorAll('.animate-slide-up, .animate-slide-in');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }
    
    animateElements();
    
    // Soumission du formulaire avec animation de chargement
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const loadingDots = submitBtn.querySelector('.loading-dots');
        
        // Afficher l'état de chargement
        submitBtn.disabled = true;
        loadingDots.classList.remove('hidden');
        
        setTimeout(() => {
            // Récupérer les valeurs
            const nom = document.getElementById('nom').value;
            const prenom = document.getElementById('prenom').value;
            const whatsapp = document.getElementById('whatsapp').value;
            let ancienKw = document.getElementById('ancienKw').value.replace(',', '.');
            let nouveauKw = document.getElementById('nouveauKw').value.replace(',', '.');
            
            // Vérifier si les valeurs sont des nombres valides
            if (isNaN(ancienKw) || isNaN(nouveauKw)) {
                showNotification('Veuillez entrer des valeurs numériques valides pour les index', 'error');
                submitBtn.disabled = false;
                loadingDots.classList.add('hidden');
                return;
            }
            
            ancienKw = parseFloat(ancienKw);
            nouveauKw = parseFloat(nouveauKw);
            
            // Validation
            if (nouveauKw <= ancienKw) {
                showNotification('Le nouvel index doit être supérieur à l\'ancien index', 'error');
                submitBtn.disabled = false;
                loadingDots.classList.add('hidden');
                return;
            }
            
            // Calculs
            const consommation = nouveauKw - ancienKw;
            const montant = consommation * 300;
            
            // Formatage de la date
            const now = new Date();
            const dateStr = now.toLocaleDateString('fr-FR');
            
            // Générer un numéro de facture
            const invoiceNumber = 'FACT-' + (1000 + history.length + 1);
            
            // Sauvegarder la facture actuelle
            currentBill = {
                id: Date.now(),
                invoiceNumber: invoiceNumber,
                nom: nom,
                prenom: prenom,
                whatsapp: whatsapp,
                ancienKw: ancienKw,
                nouveauKw: nouveauKw,
                consommation: consommation,
                montant: montant,
                date: dateStr
            };
            
            // Mettre à jour l'affichage de la facture avec animation
            updateInvoiceDisplay(currentBill);
            
            // Ajouter à l'historique et sauvegarder
            history.push(currentBill);
            localStorage.setItem('electricityBills', JSON.stringify(history));
            updateHistoryDisplay();
            
            // Afficher notification de succès
            showNotification('Facture générée avec succès !', 'success');
            
            // Réinitialiser le bouton
            submitBtn.disabled = false;
            loadingDots.classList.add('hidden');
        }, 1500);
    });
    
    // Fonction pour mettre à jour l'affichage de la facture
    function updateInvoiceDisplay(bill) {
        document.getElementById('invoiceDate').textContent = bill.date;
        document.getElementById('invoiceNumber').textContent = bill.invoiceNumber;
        document.getElementById('invoiceNom').textContent = bill.nom;
        document.getElementById('invoicePrenom').textContent = bill.prenom;
        document.getElementById('invoicePhone').textContent = bill.whatsapp;
        document.getElementById('oldIndex').textContent = bill.ancienKw.toFixed(2);
        document.getElementById('newIndex').textContent = bill.nouveauKw.toFixed(2);
        document.getElementById('consumption').textContent = bill.consommation.toFixed(2);
        document.getElementById('amountDue').textContent = bill.montant.toLocaleString('fr-FR') + ' F CFA';
        
        // Animation de mise à jour
        invoiceContainer.classList.add('animate-pulse');
        setTimeout(() => {
            invoiceContainer.classList.remove('animate-pulse');
        }, 1000);
    }
    
    // Fonction de notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform translate-x-full transition-all duration-500 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-3"></i>
                <span class="font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Afficher l'historique avec animation
    historyBtn.addEventListener('click', function() {
        historySection.classList.remove('hidden');
        historySection.classList.add('animate-slide-up');
        historySection.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Fermer l'historique
    closeHistoryBtn.addEventListener('click', function() {
        historySection.classList.add('hidden');
    });
    
    // Envoyer par WhatsApp avec animation
    sendBtn.addEventListener('click', function() {
        if (!currentBill.nom) {
            showNotification('Veuillez calculer une facture d\'abord', 'error');
            return;
        }
        
        // Animation du bouton
        sendBtn.classList.add('animate-pulse');
        
        const message = ` *FACTURE D'ÉLECTRICITÉ* 

*Facture:* ${currentBill.invoiceNumber}
*Date:* ${currentBill.date}
*Client:* ${currentBill.nom} ${currentBill.prenom}

*DÉTAILS CONSOMMATION:*
Ancien kW: ${currentBill.ancienKw.toFixed(2)} kW
    Nouvel kW: ${currentBill.nouveauKw.toFixed(2)} kW
    Consommation: ${currentBill.consommation.toFixed(2)} kW

    *Montant à payer:* ${currentBill.montant.toLocaleString('fr-FR')} F CFA

Merci pour votre règlement rapide !

_Système Électricité - Gestion moderne_`;
        
        const whatsappUrl = `https://wa.me/${currentBill.whatsapp.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
        
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            sendBtn.classList.remove('animate-pulse');
            showNotification('Message WhatsApp envoyé !', 'success');
        }, 1000);
    });
    
    // Nouvelle facture avec animation
    newBillBtn.addEventListener('click', function() {
        // Animation de nettoyage
        form.classList.add('animate-pulse');
        
        setTimeout(() => {
            form.reset();
            document.getElementById('invoiceDate').textContent = '-';
            document.getElementById('invoiceNumber').textContent = '-';
            document.getElementById('invoiceNom').textContent = '-';
            document.getElementById('invoicePrenom').textContent = '-';
            document.getElementById('invoicePhone').textContent = '-';
            document.getElementById('oldIndex').textContent = '-';
            document.getElementById('newIndex').textContent = '-';
            document.getElementById('consumption').textContent = '-';
            document.getElementById('amountDue').textContent = '-';
            
            form.classList.remove('animate-pulse');
            showNotification('Nouveau formulaire prêt !', 'success');
        }, 500);
    });
    
    // Mettre à jour l'affichage de l'historique avec design amélioré
    function updateHistoryDisplay() {
        if (history.length === 0) {
            historyList.innerHTML = `
            <div class="text-center py-12">
                <div class="relative mb-6">
                    <i class="fas fa-inbox text-6xl text-gray-300 floating-element"></i>
                    <div class="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-ping"></div>
                </div>
                <p class="text-gray-500 text-lg font-medium">Aucune facture dans l'historique</p>
                <p class="text-gray-400 text-sm mt-2">Les factures générées apparaîtront ici</p>
            </div>
            `;
            return;
        }
        
        // Trier par date (plus récent en premier)
        const sortedHistory = [...history].sort((a, b) => b.id - a.id);
        
        let html = '';
        sortedHistory.forEach((bill, index) => {
            const gradientClass = index % 4 === 0 ? 'from-blue-500 to-purple-500' : 
                                 index % 4 === 1 ? 'from-green-500 to-blue-500' : 
                                 index % 4 === 2 ? 'from-purple-500 to-pink-500' : 
                                 'from-orange-500 to-red-500';
            
            html += `
            <div class="history-item-enhanced rounded-xl p-6 shadow-lg" style="animation-delay: ${index * 0.1}s;">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <i class="fas fa-user text-white"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-xl text-gray-800">${bill.nom} ${bill.prenom}</h3>
                            <p class="text-sm text-gray-600 flex items-center">
                                <i class="fas fa-file-invoice mr-2"></i>
                                ${bill.invoiceNumber} • ${bill.date}
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="bg-gradient-to-r ${gradientClass} text-white px-4 py-2 rounded-lg shadow-lg">
                            <div class="text-xs font-medium opacity-90">Consommation</div>
                            <div class="text-lg font-bold">${bill.consommation.toFixed(2)} kW</div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div class="glass-effect rounded-lg p-3">
                        <div class="flex items-center text-sm text-gray-600 mb-1">
                            <i class="fas fa-arrow-down text-red-500 mr-2"></i>
                            Ancien index
                        </div>
                        <div class="font-bold text-lg">${bill.ancienKw.toFixed(2)} kW</div>
                    </div>
                    <div class="glass-effect rounded-lg p-3">
                        <div class="flex items-center text-sm text-gray-600 mb-1">
                            <i class="fas fa-arrow-up text-green-500 mr-2"></i>
                            Nouvel index
                        </div>
                        <div class="font-bold text-lg">${bill.nouveauKw.toFixed(2)} kW</div>
                    </div>
                </div>
                
                <div class="flex justify-between items-center">
                    <div>
                        <div class="text-2xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent">
                            ${bill.montant.toLocaleString('fr-FR')} F CFA
                        </div>
                        <div class="text-xs text-gray-500 flex items-center mt-1">
                            <i class="fas fa-phone mr-1"></i>
                            ${bill.whatsapp}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="copy-btn bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg" data-id="${bill.id}">
                            <i class="fas fa-copy mr-2"></i>Copier
                        </button>
                        <button class="whatsapp-btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg" data-id="${bill.id}">
                            <i class="fab fa-whatsapp mr-2"></i>WhatsApp
                        </button>
                    </div>
                </div>
            </div>
            `;
        });
        
        historyList.innerHTML = html;
        
        // Ajouter les événements pour les boutons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const bill = history.find(b => b.id === id);
                
                if (bill) {
                    const text = `Facture ${bill.invoiceNumber} - ${bill.nom} ${bill.prenom} - ${bill.consommation.toFixed(2)} kW - ${bill.montant.toLocaleString('fr-FR')} F CFA`;
                    navigator.clipboard.writeText(text)
                        .then(() => {
                            const originalHTML = this.innerHTML;
                            this.innerHTML = '<i class="fas fa-check mr-2"></i>Copié!';
                            this.classList.add('bg-green-500');
                            setTimeout(() => {
                                this.innerHTML = originalHTML;
                                this.classList.remove('bg-green-500');
                            }, 2000);
                        })
                        .catch(err => {
                            showNotification('Erreur lors de la copie', 'error');
                        });
                }
            });
        });
        
        // Ajouter les événements pour les boutons WhatsApp
        document.querySelectorAll('.whatsapp-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const bill = history.find(b => b.id === id);
                
                if (bill) {
                    const message = ` *FACTURE D'ÉLECTRICITÉ* 

            *Facture:* ${bill.invoiceNumber}
            *Date:* ${bill.date}
            *Client:* ${bill.nom} ${bill.prenom}

            *DÉTAILS CONSOMMATION:*
            Ancien kW: ${bill.ancienKw.toFixed(2)} kW
            Nouvel kW: ${bill.nouveauKw.toFixed(2)} kW
            Consommation: ${bill.consommation.toFixed(2)} kW

            *Montant à payer:* ${bill.montant.toLocaleString('fr-FR')} F CFA

             Merci pour votre règlement rapide !

            _Système Électricité - Gestion moderne_`;
                    
                    const whatsappUrl = `https://wa.me/${bill.whatsapp.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                    showNotification('Message WhatsApp ouvert !', 'success');
                }
            });
        });
    }
    
    // Effets de survol pour les inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('transform', 'scale-105');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('transform', 'scale-105');
        });
    });
    
    // Animation de particules supplémentaires
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'fixed w-1 h-1 bg-blue-400 rounded-full opacity-60 pointer-events-none z-0';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';
        
        document.body.appendChild(particle);
        
        const duration = Math.random() * 3000 + 2000;
        particle.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 0.6 },
            { transform: `translateY(-${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'linear'
        }).onfinish = () => {
            document.body.removeChild(particle);
        };
    }
    
    // Créer des particules périodiquement
    setInterval(createParticle, 3000);
    
    // Effet de parallaxe léger
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.floating-element');
        
        parallax.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
});