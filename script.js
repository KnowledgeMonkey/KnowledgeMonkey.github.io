const button = document.getElementById("button");
const clicksText = document.getElementById("clicks");
let clicks = 0;
let randomEventTriggered = false;
let lastRandomEvent = null;

function playClickSound() {
    playSound("click.mp3", 0.7);
}

function playSound(fileName, volume = 1) {
    const audio = new Audio(`assets/${fileName}`);
    audio.volume = volume;
    audio.play().catch(() => {});
    return audio;
}

function playEventSound(overlay, fileName, volume = 1, loop = false) {
    const audio = playSound(fileName, volume);
    audio.loop = loop;
    overlay.eventAudio ??= [];
    overlay.eventAudio.push(audio);

    const observer = new MutationObserver(() => {
        if (!overlay.isConnected) {
            audio.pause();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return audio;
}

button.addEventListener("click", () => {
    clicks++;
    clicksText.textContent = clicks;
    playClickSound();

    randomEventTriggered = false;

    tryRandomEvent(5, runRandomEvent);
});






// RANDOM THINGS YAY

function tryRandomEvent(chancePercent, event) {
    if (randomEventTriggered) {
        return false;
    }

    if (chancePercent < 0 || chancePercent > 100) {
        throw new RangeError("Chance must be between 0 and 100.");
    }

    if (Math.random() * 100 < chancePercent) {
        randomEventTriggered = true;
        event();
        return true;
    }

    return false;
}

function runRandomEvent() {
    const events = [
        darkScreenEvent,
        containmentBreachEvent,
        chickenEvent,
        emoglobinEvent,
        toothpasteBattleEvent,
        hydrationInspectionEvent,
        breakfastQuizEvent,
        flushThePigEvent,
        darknessHuntEvent,
        greenCreatureEvent,
        phoneCallEvent,
        sparkleCollectorEvent,
        birdExamEvent,
        reactionDuelEvent
    ];

    const availableEvents = events.filter(event => event !== lastRandomEvent);
    const chosenEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];

    lastRandomEvent = chosenEvent;
    chosenEvent();
}

function hideButtonTemporarily(durationMilliseconds) {
    button.style.display = "none";

    setTimeout(() => {
        button.style.display = "";
    }, durationMilliseconds);
}

function darkScreenEvent() {
    const overlay = document.createElement("div");
    const image = document.createElement("img");

    overlay.className = "dark-event-overlay";
    image.className = "dark-event-image";
    image.src = "assets/dark-figure.png";
    image.alt = "A figure appearing in the darkness";

    overlay.appendChild(image);
    document.body.appendChild(overlay);
    playEventSound(overlay, "dark-ambience.mp3", 0.65);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            image.classList.add("visible");
        });
    });

    setTimeout(() => {
        overlay.remove();
    }, 5000);
}

function createEventOverlay(className, duration = 5000) {
    const overlay = document.createElement("div");
    overlay.className = `random-event-overlay ${className}`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), duration);
    return overlay;
}

function addEventImage(overlay, source, alt, className = "") {
    const image = document.createElement("img");
    image.src = source;
    image.alt = alt;
    image.className = className;
    overlay.appendChild(image);
    return image;
}

function addEventText(overlay, text, className = "event-message") {
    const message = document.createElement("div");
    message.className = className;
    message.textContent = text;
    overlay.appendChild(message);
    return message;
}

function containmentBreachEvent() {
    const overlay = createEventOverlay("containment-event", 5500);
    playEventSound(overlay, "alarm.mp3", 0.55);
    setTimeout(() => {
        if (overlay.isConnected) playSound("cat-scream.mp3", 0.65);
    }, 2600);
    addEventText(overlay, "⚠ BUTTON CONTAINMENT FAILURE ⚠");
    addEventImage(overlay, "assets/containment-cat.gif", "Contained cat", "containment-cat");
    addEventText(overlay, "DO NOT MAKE EYE CONTACT", "event-submessage");
}

function chickenEvent() {
    const overlay = createEventOverlay("chicken-event", 4500);
    playEventSound(overlay, "chicken.mp3", 0.8);
    addEventImage(overlay, "assets/toothy-chicken.png", "A chicken with human teeth", "chicken-image");
    addEventText(overlay, "YOU CLUCKED AROUND.");
    addEventText(overlay, "NOW YOU FIND OUT.", "event-submessage");
}

function emoglobinEvent() {
    const overlay = createEventOverlay("emoglobin-event", 5000);
    playEventSound(overlay, "heartbeat.mp3", 0.7);
    addEventImage(overlay, "assets/emoglobin.png", "Emoglobin", "emoglobin-image");
    addEventText(overlay, "EMOGLOBIN DETECTED");
    addEventText(overlay, "blood levels: extremely emo", "event-submessage");
}

function toothpasteBattleEvent() {
    const overlay = createEventOverlay("toothpaste-event", 6000);
    playEventSound(overlay, "fight-bell.mp3", 0.75);
    setTimeout(() => {
        if (overlay.isConnected) playSound("punch.mp3", 0.65);
    }, 1800);
    addEventText(overlay, "TOOTHPASTE BATTLE");

    const arena = document.createElement("div");
    arena.className = "toothpaste-arena";
    overlay.appendChild(arena);
    addEventImage(arena, "assets/lacalut-dog.png", "Lacalut dog", "toothpaste-fighter fighter-left");
    addEventText(arena, "VS", "versus");
    addEventImage(arena, "assets/colgate-dog.png", "Colgate dog", "toothpaste-fighter fighter-right");

    setTimeout(() => {
        if (!overlay.isConnected) return;
        const winner = Math.random() < 0.5 ? "LACALUT WINS!" : "COLGATE WINS!";
        addEventText(overlay, winner, "toothpaste-winner");
        playSound("victory.mp3", 0.7);
    }, 3500);
}

function hydrationInspectionEvent() {
    const overlay = createEventOverlay("hydration-event", 5000);
    playEventSound(overlay, "water-bubble.mp3", 0.65);
    addEventText(overlay, "HYDRATION INSPECTION");
    addEventImage(overlay, "assets/bottle-cat.png", "Cat inside a water bottle", "bottle-cat");
    addEventText(overlay, "drink water. the cat is watching.", "event-submessage");
}

function addEventButton(overlay, text, onClick, className = "event-choice") {
    const choice = document.createElement("button");
    choice.className = className;
    choice.textContent = text;
    choice.addEventListener("click", onClick);
    overlay.appendChild(choice);
    return choice;
}

function finishInteractiveEvent(overlay, message) {
    overlay.eventAudio?.forEach(audio => audio.pause());
    overlay.innerHTML = "";
    addEventText(overlay, message);
    setTimeout(() => overlay.remove(), 900);
}

function moveTarget(target) {
    target.classList.add("loose-target");
    target.style.left = `${10 + Math.random() * 70}%`;
    target.style.top = `${15 + Math.random() * 65}%`;
}

function breakfastQuizEvent() {
    const overlay = createEventOverlay("interactive-event breakfast-event", 12000);
    playEventSound(overlay, "event-start.mp3", 0.5);
    addEventText(overlay, "Quick question");
    addEventImage(overlay, "assets/breakfast-bird.png", "Bird with an egg on its head", "challenge-image");
    addEventText(overlay, "What's on the bird's head?", "event-submessage");
    const choices = document.createElement("div");
    choices.className = "event-choices";
    overlay.appendChild(choices);
    addEventButton(choices, "An egg", () => {
        playSound("correct.mp3", 0.7);
        finishInteractiveEvent(overlay, "Correct.");
    });
    addEventButton(choices, "A hat", event => {
        playSound("whoosh.mp3", 0.55);
        moveTarget(event.currentTarget);
    });
    addEventButton(choices, "Regret", event => {
        playSound("whoosh.mp3", 0.55);
        moveTarget(event.currentTarget);
    });
}

function flushThePigEvent() {
    const overlay = createEventOverlay("interactive-event pig-event", 12000);
    addEventText(overlay, "Click the pig 5 times — 0/5");
    const pig = addEventImage(overlay, "assets/toilet-pig.png", "Pig sitting on a toilet", "challenge-image clickable-image");
    let flushes = 0;
    pig.addEventListener("click", () => {
        flushes++;
        playSound(flushes === 5 ? "toilet-flush.mp3" : "pop.mp3", 0.65);
        overlay.querySelector(".event-message").textContent = `Click the pig 5 times — ${flushes}/5`;
        pig.style.transform = `rotate(${flushes * 72}deg) scale(${1 - flushes * 0.08})`;
        if (flushes === 5) finishInteractiveEvent(overlay, "Done.");
    });
}

function darknessHuntEvent() {
    const overlay = createEventOverlay("interactive-event darkness-hunt", 14000);
    overlay.style.backgroundImage = "url('assets/pure-darkness.png')";
    addEventText(overlay, "Find Escape — 0/3");
    let finds = 0;
    const escape = addEventButton(overlay, "ESCAPE", () => {
        finds++;
        playSound(finds === 3 ? "success.mp3" : "whoosh.mp3", 0.6);
        overlay.querySelector(".event-message").textContent = `Find Escape — ${finds}/3`;
        if (finds === 3) finishInteractiveEvent(overlay, "You found the way out.");
        else moveTarget(escape);
    }, "event-choice moving-target");
    moveTarget(escape);
}

function greenCreatureEvent() {
    const overlay = createEventOverlay("interactive-event green-event", 12000);
    addEventText(overlay, "Catch it — 0/4");
    const creature = addEventImage(overlay, "assets/green-creature.png", "Green creature", "moving-image");
    let bonks = 0;
    moveTarget(creature);
    creature.addEventListener("click", () => {
        bonks++;
        playSound("bonk.mp3", 0.75);
        overlay.querySelector(".event-message").textContent = `Catch it — ${bonks}/4`;
        if (bonks === 4) finishInteractiveEvent(overlay, "Got it.");
        else moveTarget(creature);
    });
}

function phoneCallEvent() {
    const overlay = createEventOverlay("interactive-event phone-event", 14000);
    playEventSound(overlay, "phone-ring.mp3", 0.65, true);
    addEventText(overlay, "Incoming call");
    addEventImage(overlay, "assets/phone-creature.png", "Creature using a phone", "challenge-image");
    const choices = document.createElement("div");
    choices.className = "event-choices";
    overlay.appendChild(choices);
    addEventButton(choices, "Accept", () => {
        playSound("monkey.mp3", 0.7);
        finishInteractiveEvent(overlay, "He said: ooh ooh aah aah.");
    }, "event-choice accept-call");
    const decline = addEventButton(choices, "Decline", () => {
        playSound("decline.mp3", 0.7);
        finishInteractiveEvent(overlay, "Call declined.");
    }, "event-choice decline-call");
    let escapes = 0;
    decline.addEventListener("pointerenter", () => {
        if (escapes++ < 3) moveTarget(decline);
    });
}

function sparkleCollectorEvent() {
    const overlay = createEventOverlay("interactive-event sparkle-event", 15000);
    playEventSound(overlay, "sparkle.mp3", 0.5);
    addEventImage(overlay, "assets/sparkle-mask.png", "Sparkling smiling mask", "sparkle-background");
    addEventText(overlay, "Collect the sparkles — 0/7");
    let collected = 0;
    for (let index = 0; index < 7; index++) {
        const sparkle = addEventButton(overlay, "✦", event => {
            event.currentTarget.remove();
            collected++;
            playSound("pop.mp3", 0.45);
            overlay.querySelector(".event-message").textContent = `Collect the sparkles — ${collected}/7`;
            if (collected === 7) {
                playSound("success.mp3", 0.65);
                finishInteractiveEvent(overlay, "All seven. Nice.");
            }
        }, "sparkle-button");
        moveTarget(sparkle);
    }
}

function birdExamEvent() {
    const overlay = createEventOverlay("interactive-event bird-exam", 12000);
    addEventText(overlay, "Bird identification test");
    addEventImage(overlay, "assets/strange-bird.png", "An unusual bird", "challenge-image");
    addEventText(overlay, "Is this a bird?", "event-submessage");
    const choices = document.createElement("div");
    choices.className = "event-choices";
    overlay.appendChild(choices);
    addEventButton(choices, "Yes", () => {
        playSound("correct.mp3", 0.7);
        finishInteractiveEvent(overlay, "Technically correct.");
    });
    addEventButton(choices, "I don't know", event => {
        playSound("whoosh.mp3", 0.55);
        event.currentTarget.textContent = "Take a guess";
        moveTarget(event.currentTarget);
    });
}

function reactionDuelEvent() {
    const overlay = createEventOverlay("interactive-event duel-event", 12000);
    playEventSound(overlay, "countdown.mp3", 0.55);
    addEventImage(overlay, "assets/parking-lot-person.png", "Opponent in a parking lot", "duel-background");
    addEventText(overlay, "Wait for GO, then click the button");
    const startedAt = performance.now() + 1500 + Math.random() * 2200;
    const duelButton = addEventButton(overlay, "Wait…", () => {
        const reaction = performance.now() - startedAt;
        if (reaction < 0) {
            playSound("fail.mp3", 0.7);
            finishInteractiveEvent(overlay, "Too early.");
        } else {
            playSound("success.mp3", 0.65);
            finishInteractiveEvent(overlay, `${Math.round(reaction)} ms`);
        }
    }, "event-choice duel-button");

    setTimeout(() => {
        if (!overlay.isConnected) return;
        overlay.querySelector(".event-message").textContent = "GO";
        duelButton.textContent = "Click";
        duelButton.classList.add("ready");
    }, startedAt - performance.now());
}
