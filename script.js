
"use strict";

// ======================================
// 1. REFERENCIAS A LOS ELEMENTOS
// ======================================

const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

const beginBtn = document.getElementById("beginBtn");
const bloomBtn = document.getElementById("bloomBtn");
const flower = document.getElementById("flower");
const flowerMessage = document.getElementById("flowerMessage");

const letterBtn = document.getElementById("letterBtn");
const letterContent = document.getElementById("letterContent");

const secretStars = document.querySelectorAll(".secret-star");
const starMessage = document.getElementById("starMessage");
const discoveryCount = document.getElementById("discoveryCount");

const finalBtn = document.getElementById("finalBtn");
const finalMessage = document.getElementById("finalMessage");

const soundToggle = document.getElementById("soundToggle");
const soundLabel = document.getElementById("soundLabel");
const toast = document.getElementById("toast");

// ======================================
// 2. CIELO ANIMADO
// ======================================

let stars = [];
let animationFrame;
let width = 0;
let height = 0;

function createStars() {
    const density = Math.min(
        160,
        Math.floor((width * height) / 8000)
    );

    stars = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 0.004 + 0.001,
        phase: Math.random() * Math.PI * 2
    }));
}

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();
}

function drawStars(time = 0) {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
        const opacity =
            star.alpha +
            Math.sin(time * star.speed + star.phase) * 0.2;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(230, 220, 255, ${Math.max(0.1, Math.min(1, opacity))
            })`;

        ctx.fill();
    });

    animationFrame = requestAnimationFrame(drawStars);
}

resizeCanvas();
drawStars();

window.addEventListener("resize", resizeCanvas);

// ======================================
// 3. SONIDO OPCIONAL
// ======================================

let soundEnabled = false;
let audioContext = null;

soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundLabel.textContent = soundEnabled
        ? "Sonido: encendido"
        : "Sonido: apagado";

    soundToggle.setAttribute(
        "aria-pressed",
        String(soundEnabled)
    );

    if (soundEnabled) {
        playChime();
    }
});

function playChime() {
    if (!soundEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        audioContext ??= new AudioContextClass();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
            660,
            audioContext.currentTime
        );

        oscillator.frequency.exponentialRampToValueAtTime(
            880,
            audioContext.currentTime + 0.16
        );

        gain.gain.setValueAtTime(
            0.0001,
            audioContext.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.08,
            audioContext.currentTime + 0.025
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            audioContext.currentTime + 0.35
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.36);
    } catch (error) {
        console.warn("No se pudo reproducir el sonido.", error);
    }
}

// ======================================
// 4. MENSAJES EMERGENTES
// ======================================

let toastTimeout;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

// ======================================
// 5. ENTRAR A LA EXPERIENCIA
// ======================================

beginBtn.addEventListener("click", () => {
    document.getElementById("mensaje").scrollIntoView({
        behavior: "smooth"
    });

    playChime();
    showToast("Bienvenida a tu pequeño universo ✦");
});

// ======================================
// 6. HACER FLORECER LA FLOR
// ======================================

let flowerBloomed = false;

bloomBtn.addEventListener("click", () => {
    flowerBloomed = !flowerBloomed;

    flower.classList.toggle("bloomed", flowerBloomed);

    if (flowerBloomed) {
        flowerMessage.textContent =
            "Así como esta flor se abre, espero que la vida te regale muchos motivos para florecer. ♥";

        bloomBtn.textContent = "Volver a cerrar la flor ✿";
        playChime();
    } else {
        flowerMessage.textContent = "";
        bloomBtn.textContent = "Haz florecer la sorpresa ✿";
    }
});

// ======================================
// 7. ABRIR Y CERRAR LA CARTA
// ======================================

letterBtn.addEventListener("click", () => {
    const isOpen = letterBtn.getAttribute("aria-expanded") === "true";
    const willOpen = !isOpen;

    letterBtn.setAttribute("aria-expanded", String(willOpen));
    letterBtn.classList.toggle("open", willOpen);

    letterContent.hidden = !willOpen;

    const hint = letterBtn.querySelector(".envelope-hint");

    hint.textContent = willOpen
        ? "Pulsa para cerrar"
        : "Pulsa para abrir";

    playChime();

    if (willOpen) {
        setTimeout(() => {
            letterContent.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 150);
    }
});

// ======================================
// 8. DESCUBRIR ESTRELLAS SECRETAS
// ======================================

const discovered = new Set();

secretStars.forEach((star, index) => {
    star.addEventListener("click", () => {
        const message = star.dataset.message;

        starMessage.innerHTML = "";

        const icon = document.createElement("span");
        icon.className = "message-icon";
        icon.textContent = "✧";

        const paragraph = document.createElement("p");
        paragraph.textContent = message;

        starMessage.append(icon, paragraph);

        star.classList.add("found");
        star.setAttribute("aria-pressed", "true");

        if (!discovered.has(index)) {
            discovered.add(index);
            playChime();
        } else {
            showToast("Puedes volver a leer este mensaje cuando quieras.");
        }

        discoveryCount.textContent =
            `${discovered.size} de ${secretStars.length} estrellas descubiertas`;

        if (discovered.size === secretStars.length) {
            showToast("¡Encontraste todas las estrellas! ✨");
        }
    });
});

// ======================================
// 9. SORPRESA FINAL
// ======================================

finalBtn.addEventListener("click", () => {
    const willShow = finalMessage.hidden;

    finalMessage.hidden = !willShow;

    finalBtn.textContent = willShow
        ? "Guardar este momento ♥"
        : "Una última sorpresa ♥";

    playChime();

    if (willShow) {
        finalMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
});

// ======================================
// 10. LIMPIEZA AL SALIR
// ======================================

window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);

    if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
    }
});

