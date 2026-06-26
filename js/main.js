/**
 * Webify NL - Main JavaScript
 * Interacciones, animaciones de scroll y validaciones
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENU MOVIL ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    function toggleMobileMenu() {
        menuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden'); // Evita scroll al estar abierto
    }
    
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Cerrar menú al hacer clic en un enlace móvil
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // --- 2. HEADER SCROLL Y ENLACE ACTIVO ---
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        // Estilo reducido de header al hacer scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Detección de sección activa para colorear menú
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120; // Compensación por header
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(currentSectionId)) {
                link.classList.add('active');
            }
        });
    });

    // --- 3. ANIMACION REVEAL ON SCROLL (Intersection Observer) ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Dejar de observar una vez animado
                observer.unobserve(entry.target);
            }
        });
    };
    
    const revealOptions = {
        root: null, // viewport
        threshold: 0.15, // 15% del elemento visible
        rootMargin: '0px 0px -50px 0px' // Disparar ligeramente antes
    };
    
    const observer = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(element => {
        observer.observe(element);
    });

    // --- 4. VALIDACION DE FORMULARIO DE CONTACTO ---
    const contactForm = document.getElementById('contact-form');
    const successOverlay = document.getElementById('form-success');
    const resetBtn = document.getElementById('form-reset-btn');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;
            
            // Campos a validar
            const nameInput = document.getElementById('form-name');
            const emailInput = document.getElementById('form-email');
            const messageInput = document.getElementById('form-message');
            
            // Validar Nombre
            if (!nameInput.value.trim()) {
                showError(nameInput, 'error-name');
                isValid = false;
            } else {
                clearError(nameInput, 'error-name');
            }
            
            // Validar Email
            if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
                showError(emailInput, 'error-email');
                isValid = false;
            } else {
                clearError(emailInput, 'error-email');
            }
            
            // Validar Mensaje
            if (!messageInput.value.trim()) {
                showError(messageInput, 'error-message');
                isValid = false;
            } else {
                clearError(messageInput, 'error-message');
            }
            
            // Si el formulario es válido, procedemos con el envío
            if (isValid) {
                const submitBtn = document.getElementById('form-submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerText = 'Enviando...';
                
                const action = contactForm.getAttribute('action');
                if (action && action.includes('formspree.io') && !action.includes('TUCODIGO')) {
                    // Envío real a Formspree vía AJAX
                    fetch(action, {
                        method: 'POST',
                        body: new FormData(contactForm),
                        headers: {
                            'Accept': 'application/json'
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            successOverlay.classList.add('active');
                        } else {
                            response.json().then(data => {
                                console.error('Formspree error details:', data);
                            }).catch(() => {});
                            alert('Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente o escríbenos directamente por WhatsApp.');
                        }
                    })
                    .catch(error => {
                        alert('Hubo un error de conexión al enviar el formulario.');
                    })
                    .finally(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Enviar Mensaje';
                    });
                } else {
                    // Simulación local si no se ha configurado Formspree
                    setTimeout(() => {
                        successOverlay.classList.add('active');
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Enviar Mensaje';
                    }, 1200);
                }
            }
        });
    }
    
    // Botón de reset en el mensaje de éxito
    if (resetBtn && contactForm && successOverlay) {
        resetBtn.addEventListener('click', () => {
            contactForm.reset();
            successOverlay.classList.remove('active');
            
            // Limpiar posibles estilos de error previos
            const formGroups = document.querySelectorAll('.form-group');
            formGroups.forEach(group => group.classList.remove('invalid'));
        });
    }
    
    // Funciones auxiliares de validación
    function showError(inputElement, errorId) {
        const group = inputElement.parentElement;
        group.classList.add('invalid');
    }
    
    function clearError(inputElement, errorId) {
        const group = inputElement.parentElement;
        group.classList.remove('invalid');
    }
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Agregar validación en tiempo real cuando el usuario escribe
    const inputsToValidate = document.querySelectorAll('.form-control[required]');
    inputsToValidate.forEach(input => {
        input.addEventListener('input', () => {
            const group = input.parentElement;
            if (group.classList.contains('invalid')) {
                if (input.type === 'email') {
                    if (input.value.trim() && validateEmail(input.value)) {
                        clearError(input);
                    }
                } else {
                    if (input.value.trim()) {
                        clearError(input);
                    }
                }
            }
        });
    });
});
