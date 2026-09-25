const button = document.getElementById("button");
const clicksText = document.getElementById("clicks");
const levelText = document.getElementById("level-text");
const comboText = document.getElementById("combo-text");
const xpFill = document.getElementById("xp-fill");
const rankText = document.getElementById("rank-text");
const nextUnlockText = document.getElementById("next-unlock");
const indexButton = document.getElementById("index-button");
const savedProgress = JSON.parse(localStorage.getItem("buttonGameProgress") || "{}");
let clicks = Number(savedProgress.clicks) || 0;
let totalXP = Number(savedProgress.totalXP) || 0;
let achievements = Array.isArray(savedProgress.achievements) ? savedProgress.achievements : [];
let combo = 0;
let lastClickTime = 0;
let comboTimer;
let randomEventTriggered = false;
let lastRandomEvent = null;

function getLevelProgress(xp = totalXP) {
    let level = 1;
    let remaining = xp;
    let needed = 30;

    while (remaining >= needed) {
        remaining -= needed;
        level++;
        needed = 20 + level * 10;
    }

    return { level, currentXP: remaining, neededXP: needed };
}

function saveProgress() {
    localStorage.setItem("buttonGameProgress", JSON.stringify({ clicks, totalXP, achievements }));
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "game-toast";
    toast.textContent = message;
    toast.style.bottom = `${24 + document.querySelectorAll(".game-toast").length * 58}px`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 250);
    }, 2200);
}

function awardXP(amount) {
    const oldLevel = getLevelProgress().level;
    totalXP += amount;
    const newLevel = getLevelProgress().level;

    if (newLevel > oldLevel) {
        playSound("success.mp3", 0.6);
        const unlocked = getEventDefinitions().filter(definition => definition.level === newLevel).length;
        showToast(unlocked ? `level ${newLevel} · ${unlocked} new event${unlocked === 1 ? "" : "s"}` : `level ${newLevel}`);
    }

    saveProgress();
    updateProgressUI();
}

function checkClickAchievements() {
    const milestones = [
        { clicks: 10, name: "Warm-up", reward: 10 },
        { clicks: 50, name: "Still pressing", reward: 20 },
        { clicks: 100, name: "Triple digits", reward: 30 },
        { clicks: 250, name: "Button problem", reward: 50 },
        { clicks: 500, name: "No self-control", reward: 75 },
        { clicks: 1000, name: "Button legend", reward: 150 }
    ];

    milestones.forEach(milestone => {
        if (clicks >= milestone.clicks && !achievements.includes(milestone.name)) {
            achievements.push(milestone.name);
            showToast(`${milestone.name} — +${milestone.reward} XP`);
            awardXP(milestone.reward);
        }
    });
}

function updateProgressUI() {
    const progress = getLevelProgress();
    const definitions = getEventDefinitions();
    const nextUnlock = definitions.find(definition => definition.level > progress.level);
    const unlockedCount = definitions.filter(definition => definition.level <= progress.level).length;

    clicksText.textContent = clicks;
    levelText.textContent = `LV ${String(progress.level).padStart(2, "0")}`;
    comboText.textContent = `x${Math.max(1, combo)}`;
    xpFill.style.width = `${(progress.currentXP / progress.neededXP) * 100}%`;
    rankText.textContent = `${unlockedCount}/${definitions.length} events`;
    nextUnlockText.textContent = nextUnlock
        ? `${progress.currentXP}/${progress.neededXP} xp · next: ${nextUnlock.name}`
        : `${progress.currentXP}/${progress.neededXP} xp · all unlocked`;
}

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
    const now = performance.now();
    combo = now - lastClickTime < 1100 ? Math.min(combo + 1, 20) : 1;
    lastClickTime = now;
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
        combo = 0;
        updateProgressUI();
    }, 1400);

    clicks++;
    playClickSound();
    awardXP(1 + Math.floor((combo - 1) / 5));
    checkClickAchievements();

    randomEventTriggered = false;

    tryRandomEvent(5, runRandomEvent);
});

updateProgressUI();






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

function getEventDefinitions() {
    return [
        { event: darkScreenEvent, level: 1, name: "Darkness", image: "dark-figure.png", description: "Something slowly appears in the dark." },
        { event: breakfastQuizEvent, level: 1, name: "Breakfast quiz", image: "breakfast-bird.png", description: "Answer one very important breakfast question." },
        { event: flushThePigEvent, level: 1, name: "Emergency flush", image: "toilet-pig.png", description: "Click fast and deal with the bathroom situation." },
        { event: containmentBreachEvent, level: 2, name: "Containment breach", image: "containment-cat.gif", description: "The contained cat is no longer contained." },
        { event: chickenEvent, level: 2, name: "Chicken charge", image: "toothy-chicken.png", description: "A deeply upsetting chicken approaches." },
        { event: hydrationInspectionEvent, level: 3, name: "Hydration inspection", image: "bottle-cat.png", description: "The bottle cat checks your water intake." },
        { event: greenCreatureEvent, level: 3, name: "Creature chase", image: "green-creature.png", description: "Catch and bonk the moving creature." },
        { event: phoneCallEvent, level: 4, name: "Incoming call", image: "phone-creature.png", description: "Answer the call or try to decline it." },
        { event: sparkleCollectorEvent, level: 4, name: "Sparkle collector", image: "sparkle-mask.png", description: "Collect every sparkle before time runs out." },
        { event: darknessHuntEvent, level: 4, name: "Escape the void", image: "pure-darkness.png", description: "Find the escape button three times." },
        { event: birdExamEvent, level: 5, name: "Bird exam", image: "strange-bird.png", description: "Pass an advanced bird identification test." },
        { event: reactionDuelEvent, level: 5, name: "Reaction duel", image: "parking-lot-person.png", description: "Wait for GO and test your reaction time." },
        { event: emoglobinEvent, level: 6, name: "Emoglobin", image: "emoglobin.png", description: "Blood levels become extremely emo." },
        { event: toothpasteBattleEvent, level: 6, name: "Toothpaste battle", image: "lacalut-dog.png", description: "Two dental champions fight for dominance." },
        { event: powerChargeEvent, level: 7, name: "Power charge", image: "electric-chair.png", description: "Mash Charge until the meter hits 100%." },
        { event: whatsappSwipeEvent, level: 7, name: "Wizard call", image: "whatsapp-wizard.png", description: "Slide across the screen to answer." },
        { event: cosmicMemoryEvent, level: 8, name: "Cosmic memory", image: "cosmic-king.png", description: "Watch and repeat the symbol sequence." },
        { event: bikeEscapeEvent, level: 8, name: "Bike escape", image: "apocalypse-bike.png", description: "Remember the safe lane and escape." },
        { event: bossDefenseEvent, level: 9, name: "Boss defense", image: "boss-duo.png", description: "Chase the block button through five attacks." },
        { event: characterSelectEvent, level: 9, name: "Choose a fighter", image: "mr-aura.png", description: "Pick a fighter and reveal their power." },
        { event: pancakeBalanceEvent, level: 10, name: "Pancake balance", image: "pancake-bunny.png", description: "Hold steady without letting go." }
    ];
}

function openEventIndex() {
    const level = getLevelProgress().level;
    const index = document.createElement("div");
    index.className = "event-index";

    const header = document.createElement("header");
    header.className = "event-index-header";
    header.innerHTML = `<div><h2>EVENT INDEX</h2><span>${getEventDefinitions().filter(item => item.level <= level).length}/${getEventDefinitions().length} unlocked</span></div>`;
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "CLOSE";
    close.addEventListener("click", () => index.remove());
    header.appendChild(close);
    index.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "event-index-grid";
    getEventDefinitions().forEach((definition, position) => {
        const unlocked = definition.level <= level;
        const card = document.createElement("article");
        card.className = `event-index-card${unlocked ? "" : " locked"}`;
        card.innerHTML = `
            <div class="event-index-number">${String(position + 1).padStart(2, "0")}</div>
            <img src="assets/${definition.image}" alt="${unlocked ? definition.name : "Locked event"}">
            <div class="event-index-copy">
                <h3>${unlocked ? definition.name : "???"}</h3>
                <p>${unlocked ? definition.description : "???"}</p>
            </div>`;
        grid.appendChild(card);
    });
    index.appendChild(grid);
    document.body.appendChild(index);
}

indexButton.addEventListener("click", openEventIndex);

function runRandomEvent() {
    const level = getLevelProgress().level;
    const availableEvents = getEventDefinitions()
        .filter(definition => definition.level <= level && definition.event !== lastRandomEvent);
    const chosen = availableEvents[Math.floor(Math.random() * availableEvents.length)];

    lastRandomEvent = chosen.event;
    chosen.event();
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
    if (!overlay.progressRewarded) {
        overlay.progressRewarded = true;
        awardXP(15);
        showToast("Event completed — +15 XP");
    }
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

function powerChargeEvent() {
    const overlay = createEventOverlay("interactive-event power-event", 14000);
    addEventText(overlay, "Charge the chair — 0%");
    addEventImage(overlay, "assets/electric-chair.png", "Electric chair", "challenge-image");
    const meter = document.createElement("div");
    meter.className = "charge-meter";
    meter.innerHTML = "<div></div>";
    overlay.appendChild(meter);
    let charge = 0;
    addEventButton(overlay, "Charge", () => {
        charge = Math.min(100, charge + 10);
        playSound("punch.mp3", 0.35);
        meter.firstElementChild.style.width = `${charge}%`;
        overlay.querySelector(".event-message").textContent = `Charge the chair — ${charge}%`;
        if (charge === 100) {
            playSound("success.mp3", 0.65);
            finishInteractiveEvent(overlay, "Fully charged.");
        }
    });
}

function whatsappSwipeEvent() {
    const overlay = createEventOverlay("interactive-event whatsapp-event", 14000);
    addEventText(overlay, "Slide to answer");
    addEventImage(overlay, "assets/whatsapp-wizard.png", "WhatsApp wizard", "challenge-image");
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = "0";
    slider.className = "answer-slider";
    overlay.appendChild(slider);
    addEventText(overlay, "Drag all the way right", "event-submessage");
    slider.addEventListener("input", () => {
        if (Number(slider.value) >= 98) {
            playSound("monkey.mp3", 0.65);
            finishInteractiveEvent(overlay, "The wizard answered.");
        }
    });
}

function cosmicMemoryEvent() {
    const overlay = createEventOverlay("interactive-event cosmic-event", 16000);
    addEventText(overlay, "Remember the sequence");
    addEventImage(overlay, "assets/cosmic-king.png", "Cosmic king", "cosmic-background");
    const symbols = ["☀", "★", "☾", "◆"];
    const sequence = Array.from({ length: 4 }, () => Math.floor(Math.random() * symbols.length));
    const controls = document.createElement("div");
    controls.className = "memory-controls";
    overlay.appendChild(controls);
    let position = 0;
    const memoryButtons = symbols.map((symbol, index) => {
        const memoryButton = addEventButton(controls, symbol, () => {
            if (memoryButton.disabled) return;
            playSound("pop.mp3", 0.4);
            if (sequence[position] !== index) {
                playSound("fail.mp3", 0.65);
                finishInteractiveEvent(overlay, "Wrong sequence.");
                return;
            }
            position++;
            if (position === sequence.length) {
                playSound("success.mp3", 0.65);
                finishInteractiveEvent(overlay, "Sequence complete.");
            }
        }, "event-choice memory-button");
        memoryButton.disabled = true;
        return memoryButton;
    });

    sequence.forEach((buttonIndex, sequenceIndex) => {
        setTimeout(() => {
            if (!overlay.isConnected) return;
            const memoryButton = memoryButtons[buttonIndex];
            memoryButton.classList.add("memory-flash");
            playSound("pop.mp3", 0.3);
            setTimeout(() => memoryButton.classList.remove("memory-flash"), 450);
        }, 900 + sequenceIndex * 750);
    });

    setTimeout(() => {
        if (!overlay.isConnected) return;
        overlay.querySelector(".event-message").textContent = "Repeat it";
        memoryButtons.forEach(memoryButton => memoryButton.disabled = false);
    }, 900 + sequence.length * 750);
}

function bikeEscapeEvent() {
    const overlay = createEventOverlay("interactive-event bike-event", 15000);
    addEventText(overlay, "Watch the safe lane — round 1/3");
    addEventImage(overlay, "assets/apocalypse-bike.png", "Bicycle escaping an explosion", "challenge-image");
    const lanes = document.createElement("div");
    lanes.className = "event-choices";
    overlay.appendChild(lanes);
    let round = 1;
    let safeLane = Math.floor(Math.random() * 3);
    const laneButtons = ["Left", "Middle", "Right"].map((label, index) => {
        return addEventButton(lanes, label, () => {
            if (index !== safeLane) {
                playSound("fail.mp3", 0.65);
                finishInteractiveEvent(overlay, "Meteor. Wrong lane.");
                return;
            }
            playSound("whoosh.mp3", 0.55);
            if (round === 3) {
                finishInteractiveEvent(overlay, "You made it out.");
                return;
            }
            round++;
            safeLane = Math.floor(Math.random() * 3);
            overlay.querySelector(".event-message").textContent = `Watch the safe lane — round ${round}/3`;
            showSafeLane();
        });
    });

    function showSafeLane() {
        laneButtons.forEach(laneButton => laneButton.disabled = true);
        laneButtons[safeLane].classList.add("safe-lane");
        setTimeout(() => {
            if (!overlay.isConnected) return;
            laneButtons[safeLane].classList.remove("safe-lane");
            laneButtons.forEach(laneButton => laneButton.disabled = false);
            overlay.querySelector(".event-message").textContent = `Pick the safe lane — round ${round}/3`;
        }, 700);
    }

    showSafeLane();
}

function bossDefenseEvent() {
    const overlay = createEventOverlay("interactive-event boss-event", 14000);
    addEventText(overlay, "Block 5 attacks — 0/5");
    addEventImage(overlay, "assets/boss-duo.png", "Two giant bosses", "boss-background");
    let blocks = 0;
    const block = addEventButton(overlay, "Block", () => {
        blocks++;
        playSound("punch.mp3", 0.55);
        if (blocks === 5) {
            finishInteractiveEvent(overlay, "Perfect defense.");
            return;
        }
        overlay.querySelector(".event-message").textContent = `Block 5 attacks — ${blocks}/5`;
        moveTarget(block);
    }, "event-choice boss-block");
    moveTarget(block);
}

function characterSelectEvent() {
    const overlay = createEventOverlay("interactive-event select-event", 15000);
    addEventText(overlay, "Choose your fighter");
    const roster = document.createElement("div");
    roster.className = "fighter-roster";
    overlay.appendChild(roster);
    const fighters = [
        ["assets/mr-penis.png", "Mr. Penis", 72],
        ["assets/mr-aura.png", "Mr. Aura", 98],
        ["assets/mrs-boobs.png", "Mrs. Boobs", 84]
    ];
    fighters.forEach(([source, name, power]) => {
        const card = document.createElement("button");
        card.className = "fighter-card";
        card.innerHTML = `<img src="${source}" alt="${name}"><span>${name}</span>`;
        card.addEventListener("click", () => {
            playSound("fight-bell.mp3", 0.6);
            finishInteractiveEvent(overlay, `${name} selected — power ${power}`);
        });
        roster.appendChild(card);
    });
}

function pancakeBalanceEvent() {
    const overlay = createEventOverlay("interactive-event pancake-event", 15000);
    addEventText(overlay, "Hold steady for 3 seconds");
    addEventImage(overlay, "assets/pancake-bunny.png", "Bunny balancing a pancake", "challenge-image pancake-image");
    const hold = addEventButton(overlay, "Hold", () => {}, "event-choice hold-button");
    let holdTimer;
    let progressTimer;
    let elapsed = 0;
    let completed = false;
    const stopHolding = () => {
        if (!overlay.isConnected || completed) return;
        clearTimeout(holdTimer);
        clearInterval(progressTimer);
        elapsed = 0;
        hold.textContent = "Hold";
        const message = overlay.querySelector(".event-message");
        if (message) message.textContent = "Hold steady for 3 seconds";
    };
    hold.addEventListener("pointerdown", () => {
        elapsed = 0;
        progressTimer = setInterval(() => {
            elapsed += 100;
            hold.textContent = `${(elapsed / 1000).toFixed(1)}s`;
        }, 100);
        holdTimer = setTimeout(() => {
            completed = true;
            clearInterval(progressTimer);
            playSound("success.mp3", 0.6);
            finishInteractiveEvent(overlay, "Perfectly balanced.");
        }, 3000);
    });
    hold.addEventListener("pointerup", stopHolding);
    hold.addEventListener("pointerleave", stopHolding);
}
