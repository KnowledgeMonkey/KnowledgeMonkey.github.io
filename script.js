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
        { event: darkScreenEvent, level: 1, name: "Darkness", image: "dark-figure.png", description: "Wait for the switch, then turn the lights back on." },
        { event: breakfastQuizEvent, level: 1, name: "Breakfast quiz", image: "breakfast-bird.png", description: "Answer one very important breakfast question." },
        { event: flushThePigEvent, level: 1, name: "Emergency flush", image: "toilet-pig.png", description: "Click fast and deal with the bathroom situation." },
        { event: containmentBreachEvent, level: 2, name: "Containment breach", image: "containment-cat.gif", description: "Read and enter the three-part lock code." },
        { event: chickenEvent, level: 2, name: "Chicken charge", image: "toothy-chicken.png", description: "Drag the gate shut before the chicken arrives." },
        { event: hydrationInspectionEvent, level: 3, name: "Hydration inspection", image: "bottle-cat.png", description: "Type the requested word to pass inspection." },
        { event: greenCreatureEvent, level: 3, name: "Creature chase", image: "green-creature.png", description: "Catch and bonk the moving creature." },
        { event: phoneCallEvent, level: 4, name: "Incoming call", image: "phone-creature.png", description: "Answer the call or try to decline it." },
        { event: sparkleCollectorEvent, level: 4, name: "Sparkle collector", image: "sparkle-mask.png", description: "Collect every sparkle before time runs out." },
        { event: darknessHuntEvent, level: 4, name: "Escape the void", image: "pure-darkness.png", description: "Find the escape button three times." },
        { event: slotMachineEvent, level: 4, name: "Image slots", image: "mr-aura.png", description: "Spin three image reels. Three matching images pay 100 XP." },
        { event: birdExamEvent, level: 5, name: "Bird exam", image: "strange-bird.png", description: "Pass an advanced bird identification test." },
        { event: reactionDuelEvent, level: 5, name: "Reaction duel", image: "parking-lot-person.png", description: "Wait for GO and test your reaction time." },
        { event: emoglobinEvent, level: 6, name: "Emoglobin", image: "emoglobin.png", description: "Click in time with four heartbeat windows." },
        { event: toothpasteBattleEvent, level: 6, name: "Toothpaste battle", image: "lacalut-dog.png", description: "Back one dental champion and see who wins." },
        { event: powerChargeEvent, level: 7, name: "Power charge", image: "electric-chair.png", description: "Alternate left and right without making a mistake." },
        { event: whatsappSwipeEvent, level: 7, name: "Wizard call", image: "whatsapp-wizard.png", description: "Slide across the screen to answer." },
        { event: cosmicMemoryEvent, level: 8, name: "Cosmic memory", image: "cosmic-king.png", description: "Watch and repeat the symbol sequence." },
        { event: bikeEscapeEvent, level: 8, name: "Bike escape", image: "apocalypse-bike.png", description: "Remember the safe lane and escape." },
        { event: bossDefenseEvent, level: 9, name: "Boss defense", image: "boss-duo.png", description: "Chase the block button through five attacks." },
        { event: characterSelectEvent, level: 9, name: "Choose a fighter", image: "mr-aura.png", description: "Pick a fighter and reveal their power." },
        { event: pancakeBalanceEvent, level: 10, name: "Pancake balance", image: "pancake-bunny.png", description: "Hold steady without letting go." },
        { event: barberTimingEvent, level: 3, name: "Cursed haircut", image: "anime-barber.png", description: "Stop the clippers inside the marked zone." },
        { event: volkscatParkingEvent, level: 4, name: "Volkscat parking", image: "volkscat.png", description: "Move the car into the highlighted parking bay." },
        { event: chickenHorseEvent, level: 5, name: "Chicken horse", image: "chicken-horse.png", description: "Correctly classify an impossible animal." },
        { event: gustavoCallEvent, level: 5, name: "Gustavo calling", image: "gustavo-call.png", description: "Answer Gustavo and determine what he wants." },
        { event: galaxyShieldEvent, level: 6, name: "Galaxy shield", image: "galaxy-cat.png", description: "Raise the shield matching each incoming laser." },
        { event: findTheCircleEvent, level: 7, name: "Find the circle", image: "circle-bunny.png", description: "Click the marked face hidden in the picture." },
        { event: saveTheCatEvent, level: 8, name: "Bomb or cat", image: "bomb-vs-cat.png", description: "Keep selecting the cat while the sides switch." },
        { event: meditationEvent, level: 9, name: "Never goon", image: "never-goon.png", description: "Follow three timed breathing prompts." },
        { event: hashBrownEvent, level: 10, name: "Hash brown", image: "hash-brown-cat.png", description: "Build the order by pressing the words in sequence." },
        { event: staticDischargeEvent, level: 11, name: "Static discharge", image: "lightning-dog.png", description: "Discharge five electrical nodes before timeout." },
        { event: sansFightEvent, level: 12, name: "Bad time", image: "sans-fight/icon-256.png", description: "The complete Sans fight. Arrow keys move; Z selects." }
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

    overlay.className = "dark-event-overlay random-event-overlay interactive-event dark-choice-event event-settling";
    image.className = "dark-event-image";
    image.src = "assets/dark-figure.png";
    image.alt = "A figure appearing in the darkness";

    addEventText(overlay, "Wait for the light switch");
    overlay.appendChild(image);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.remove("event-settling"), 650);
    playEventSound(overlay, "dark-ambience.mp3", 0.65);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            image.classList.add("visible");
        });
    });

    setTimeout(() => {
        if (!overlay.isConnected) return;
        const light = addEventButton(overlay, "TURN ON LIGHT", () => {
            playSound("success.mp3", 0.55);
            finishInteractiveEvent(overlay, "Lights on.");
        }, "event-choice light-switch");
        light.focus();
    }, 4000);

    setTimeout(() => overlay.remove(), 10000);
}

function createEventOverlay(className, duration = 5000) {
    const overlay = document.createElement("div");
    overlay.className = `random-event-overlay event-settling ${className}`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.remove("event-settling"), 650);
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
    const overlay = createEventOverlay("random-event-overlay interactive-event containment-event", 14000);
    playEventSound(overlay, "alarm.mp3", 0.55);
    setTimeout(() => {
        if (overlay.isConnected) playSound("cat-scream.mp3", 0.65);
    }, 2600);
    const code = Array.from({ length: 3 }, () => 1 + Math.floor(Math.random() * 3));
    addEventText(overlay, `Lock code: ${code.join(" · ")}`);
    addEventImage(overlay, "assets/containment-cat.gif", "Contained cat", "containment-cat");
    addEventText(overlay, "Enter the code before containment fails", "event-submessage");
    const controls = document.createElement("div");
    controls.className = "event-choices";
    overlay.appendChild(controls);
    let position = 0;
    [1, 2, 3].forEach(number => {
        addEventButton(controls, String(number), () => {
            if (code[position] !== number) {
                position = 0;
                playSound("fail.mp3", 0.5);
                overlay.querySelector(".event-submessage").textContent = "Wrong. Start again.";
                return;
            }
            position++;
            playSound("pop.mp3", 0.4);
            overlay.querySelector(".event-submessage").textContent = `${position}/3 entered`;
            if (position === code.length) finishInteractiveEvent(overlay, "Containment restored.");
        });
    });
}

function chickenEvent() {
    const overlay = createEventOverlay("random-event-overlay interactive-event chicken-event", 10000);
    playEventSound(overlay, "chicken.mp3", 0.8);
    addEventImage(overlay, "assets/toothy-chicken.png", "A chicken with human teeth", "chicken-image");
    addEventText(overlay, "Close the gate");
    const gate = document.createElement("input");
    gate.type = "range";
    gate.min = "0";
    gate.max = "100";
    gate.value = "0";
    gate.className = "gate-slider";
    overlay.appendChild(gate);
    addEventText(overlay, "Drag the gate shut before the chicken arrives", "event-submessage");
    gate.addEventListener("input", () => {
        if (Number(gate.value) >= 98) finishInteractiveEvent(overlay, "Gate closed.");
    });
}

function emoglobinEvent() {
    const overlay = createEventOverlay("random-event-overlay interactive-event emoglobin-event", 15000);
    playEventSound(overlay, "heartbeat.mp3", 0.7);
    addEventImage(overlay, "assets/emoglobin.png", "Emoglobin", "emoglobin-image");
    addEventText(overlay, "Match 4 heartbeats — 0/4");
    const beatButton = addEventButton(overlay, "WAIT", () => {
        if (!beatButton.classList.contains("beat-now")) {
            playSound("fail.mp3", 0.5);
            finishInteractiveEvent(overlay, "Missed the beat.", false);
            return;
        }
        hits++;
        beatButton.classList.remove("beat-now");
        beatButton.textContent = "WAIT";
        overlay.querySelector(".event-message").textContent = `Match 4 heartbeats — ${hits}/4`;
        if (hits === 4) finishInteractiveEvent(overlay, "Perfect rhythm.");
    }, "event-choice heartbeat-button");
    let hits = 0;
    let beat = 0;
    const pulse = setInterval(() => {
        if (!overlay.isConnected || hits === 4) {
            clearInterval(pulse);
            return;
        }
        beat++;
        beatButton.classList.add("beat-now");
        beatButton.textContent = "BEAT";
        setTimeout(() => {
            beatButton.classList.remove("beat-now");
            beatButton.textContent = "WAIT";
        }, 420);
        if (beat > 8 && hits < 4) {
            clearInterval(pulse);
            finishInteractiveEvent(overlay, "Rhythm lost.", false);
        }
    }, 1050);
}

function toothpasteBattleEvent() {
    const overlay = createEventOverlay("random-event-overlay interactive-event toothpaste-event", 14000);
    playEventSound(overlay, "fight-bell.mp3", 0.75);
    addEventText(overlay, "Pick the winner");

    const arena = document.createElement("div");
    arena.className = "toothpaste-arena";
    overlay.appendChild(arena);
    addEventImage(arena, "assets/lacalut-dog.png", "Lacalut dog", "toothpaste-fighter fighter-left");
    addEventText(arena, "VS", "versus");
    addEventImage(arena, "assets/colgate-dog.png", "Colgate dog", "toothpaste-fighter fighter-right");

    const picks = document.createElement("div");
    picks.className = "event-choices";
    overlay.appendChild(picks);
    [["Lacalut", 0], ["Colgate", 1]].forEach(([name, pick]) => {
        addEventButton(picks, name, () => {
            const winner = Math.random() < 0.5 ? 0 : 1;
            playSound("punch.mp3", 0.65);
            setTimeout(() => {
                if (!overlay.isConnected) return;
                playSound(pick === winner ? "victory.mp3" : "fail.mp3", 0.65);
                finishInteractiveEvent(overlay, pick === winner ? `${name} wins. Good call.` : `${winner === 0 ? "Lacalut" : "Colgate"} wins.`, pick === winner);
            }, 700);
            picks.querySelectorAll("button").forEach(choice => choice.disabled = true);
        });
    });
}

function hydrationInspectionEvent() {
    const overlay = createEventOverlay("random-event-overlay interactive-event hydration-event", 14000);
    playEventSound(overlay, "water-bubble.mp3", 0.65);
    addEventText(overlay, "Hydration check");
    addEventImage(overlay, "assets/bottle-cat.png", "Cat inside a water bottle", "bottle-cat");
    addEventText(overlay, "Type WATER and press Enter", "event-submessage");
    const answer = document.createElement("input");
    answer.className = "hydration-input";
    answer.placeholder = "type here";
    answer.autocomplete = "off";
    overlay.appendChild(answer);
    answer.focus();
    answer.addEventListener("keydown", event => {
        if (event.key !== "Enter") return;
        if (answer.value.trim().toLowerCase() === "water") {
            finishInteractiveEvent(overlay, "Hydration approved.");
        } else {
            playSound("fail.mp3", 0.5);
            answer.value = "";
            answer.placeholder = "try again";
        }
    });
}

function addEventButton(overlay, text, onClick, className = "event-choice") {
    const choice = document.createElement("button");
    choice.className = className;
    choice.textContent = text;
    choice.addEventListener("click", onClick);
    overlay.appendChild(choice);
    return choice;
}

function finishInteractiveEvent(overlay, message, reward = true) {
    if (reward && !overlay.progressRewarded) {
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
            finishInteractiveEvent(overlay, "Too early.", false);
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
    addEventText(overlay, "Alternate controls — LEFT first");
    addEventImage(overlay, "assets/electric-chair.png", "Electric chair", "challenge-image");
    const meter = document.createElement("div");
    meter.className = "charge-meter";
    meter.innerHTML = "<div></div>";
    overlay.appendChild(meter);
    let charge = 0;
    let expectedSide = "LEFT";
    const controls = document.createElement("div");
    controls.className = "event-choices charge-controls";
    overlay.appendChild(controls);
    ["LEFT", "RIGHT"].forEach(side => {
        addEventButton(controls, side, () => {
            if (side !== expectedSide) {
                charge = Math.max(0, charge - 20);
                playSound("fail.mp3", 0.45);
            } else {
                charge = Math.min(100, charge + 20);
                expectedSide = expectedSide === "LEFT" ? "RIGHT" : "LEFT";
                playSound("punch.mp3", 0.35);
            }
            meter.firstElementChild.style.width = `${charge}%`;
            overlay.querySelector(".event-message").textContent = `${charge}% — press ${expectedSide}`;
            if (charge === 100) {
                playSound("success.mp3", 0.65);
                finishInteractiveEvent(overlay, "Fully charged.");
            }
        });
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
                finishInteractiveEvent(overlay, "Wrong sequence.", false);
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
                finishInteractiveEvent(overlay, "Meteor. Wrong lane.", false);
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
    const challenge = ["strength", "speed", "luck"][Math.floor(Math.random() * 3)];
    addEventText(overlay, `Choose for ${challenge}`);
    const roster = document.createElement("div");
    roster.className = "fighter-roster";
    overlay.appendChild(roster);
    const fighters = [
        { source: "assets/mr-penis.png", name: "Mr. Penis", strength: 9, speed: 4, luck: 5 },
        { source: "assets/mr-aura.png", name: "Mr. Aura", strength: 6, speed: 7, luck: 10 },
        { source: "assets/mrs-boobs.png", name: "Mrs. Boobs", strength: 5, speed: 10, luck: 7 }
    ];
    const bestScore = Math.max(...fighters.map(fighter => fighter[challenge]));
    fighters.forEach(fighter => {
        const card = document.createElement("button");
        card.className = "fighter-card";
        card.innerHTML = `<img src="${fighter.source}" alt="${fighter.name}"><span>${fighter.name}</span><small>STR ${fighter.strength} · SPD ${fighter.speed} · LCK ${fighter.luck}</small>`;
        card.addEventListener("click", () => {
            playSound("fight-bell.mp3", 0.6);
            const won = fighter[challenge] === bestScore;
            playSound(won ? "success.mp3" : "fail.mp3", 0.55);
            finishInteractiveEvent(overlay, won ? `${fighter.name} wins on ${challenge}.` : `${fighter.name} wasn't the best pick.`, won);
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

function slotMachineEvent() {
    const overlay = createEventOverlay("interactive-event slots-event", 20000);
    addEventText(overlay, "Image slots");
    addEventText(overlay, "Three matching images pay 100 XP", "event-submessage");

    const imagePool = getEventDefinitions()
        .filter(definition => definition.event !== slotMachineEvent)
        .map(definition => definition.image);
    const machine = document.createElement("div");
    machine.className = "slot-machine";
    overlay.appendChild(machine);
    const reels = Array.from({ length: 3 }, () => {
        const reel = document.createElement("div");
        reel.className = "slot-reel";
        const image = document.createElement("img");
        image.src = `assets/${imagePool[Math.floor(Math.random() * imagePool.length)]}`;
        image.alt = "Slot reel";
        reel.appendChild(image);
        machine.appendChild(reel);
        return image;
    });

    const spin = addEventButton(overlay, "SPIN", () => {
        spin.disabled = true;
        playSound("event-start.mp3", 0.55);
        const jackpot = Math.random() < 0.2;
        const winningImage = imagePool[Math.floor(Math.random() * imagePool.length)];
        const results = jackpot
            ? [winningImage, winningImage, winningImage]
            : pickLosingSlotResult(imagePool);

        reels.forEach((reel, index) => {
            let changes = 0;
            const interval = setInterval(() => {
                reel.src = `assets/${imagePool[Math.floor(Math.random() * imagePool.length)]}`;
                changes++;
                if (changes % 4 === 0) playSound("pop.mp3", 0.18);
                if (changes >= 9 + index * 4) {
                    clearInterval(interval);
                    reel.src = `assets/${results[index]}`;
                    reel.closest(".slot-reel").classList.add("stopped");
                    if (index === 2) {
                        setTimeout(() => {
                            if (!overlay.isConnected) return;
                            if (jackpot) {
                                awardXP(100);
                                playSound("victory.mp3", 0.75);
                                showToast("jackpot · +100 xp");
                                finishInteractiveEvent(overlay, "JACKPOT — +100 XP", false);
                            } else {
                                playSound("fail.mp3", 0.45);
                                finishInteractiveEvent(overlay, "No match.", false);
                            }
                        }, 450);
                    }
                }
            }, 90);
        });
    }, "event-choice slot-spin");
}

function pickLosingSlotResult(imagePool) {
    const results = Array.from({ length: 3 }, () => imagePool[Math.floor(Math.random() * imagePool.length)]);
    if (results[0] === results[1] && results[1] === results[2]) {
        results[2] = imagePool.find(image => image !== results[0]);
    }
    return results;
}

function createImageGame(title, imageName, className, duration = 15000) {
    const overlay = createEventOverlay(`interactive-event ${className}`, duration);
    addEventText(overlay, title);
    addEventImage(overlay, `assets/${imageName}`, title, "challenge-image");
    return overlay;
}

function barberTimingEvent() {
    const overlay = createImageGame("Stop the clippers in the zone", "anime-barber.png", "barber-event");
    playEventSound(overlay, "event-start.mp3", 0.35);
    const track = document.createElement("div");
    track.className = "timing-track";
    const target = document.createElement("div");
    target.className = "timing-target";
    const marker = document.createElement("div");
    marker.className = "timing-marker";
    const targetPosition = 20 + Math.random() * 60;
    target.style.left = `${targetPosition}%`;
    track.append(target, marker);
    overlay.appendChild(track);
    const started = performance.now();
    addEventButton(overlay, "STOP", () => {
        const phase = ((performance.now() - started) % 3600) / 1800;
        const markerPosition = phase <= 1 ? phase * 100 : (2 - phase) * 100;
        const won = Math.abs(markerPosition - targetPosition) <= 8;
        playSound(won ? "success.mp3" : "haircut-fail.mp3", 0.6);
        finishInteractiveEvent(overlay, won ? "Clean cut." : "Bad haircut.", won);
    });
}

function volkscatParkingEvent() {
    const overlay = createImageGame("Park in the highlighted bay", "volkscat.png", "parking-event");
    playEventSound(overlay, "car-engine.mp3", 0.3, true);
    const parking = document.createElement("div");
    parking.className = "parking-grid";
    const target = Math.random() < 0.5 ? 0 : 2;
    let position = 1;
    const bays = Array.from({ length: 3 }, (_, index) => {
        const bay = document.createElement("div");
        bay.className = `parking-bay${index === target ? " parking-target" : ""}`;
        parking.appendChild(bay);
        return bay;
    });
    const car = document.createElement("div");
    car.className = "parking-car";
    car.textContent = "🚗";
    parking.appendChild(car);
    overlay.appendChild(parking);
    const controls = document.createElement("div");
    controls.className = "event-choices";
    overlay.appendChild(controls);
    const updateCar = () => car.style.left = `${16.67 + position * 33.33}%`;
    addEventButton(controls, "←", () => { position = Math.max(0, position - 1); playSound("car-move.mp3", 0.25); updateCar(); });
    addEventButton(controls, "PARK", () => {
        const won = position === target;
        playSound(won ? "car-horn.mp3" : "fail.mp3", 0.55);
        finishInteractiveEvent(overlay, won ? "Parked." : "Wrong bay.", won);
    });
    addEventButton(controls, "→", () => { position = Math.min(2, position + 1); playSound("car-move.mp3", 0.25); updateCar(); });
    updateCar();
}

function chickenHorseEvent() {
    const overlay = createImageGame("What is this?", "chicken-horse.png", "hybrid-event");
    playEventSound(overlay, "horse-neigh.mp3", 0.55);
    const controls = document.createElement("div");
    controls.className = "event-choices";
    overlay.appendChild(controls);
    ["CHICKEN", "HORSE", "BOTH"].forEach(answer => {
        addEventButton(controls, answer, () => finishInteractiveEvent(overlay, answer === "BOTH" ? "Correct enough." : "Look again.", answer === "BOTH"));
    });
}

function gustavoCallEvent() {
    const overlay = createImageGame("Gustavo is calling", "gustavo-call.png", "gustavo-event");
    playEventSound(overlay, "gustavo-ringtone.mp3", 0.5, true);
    const controls = document.createElement("div");
    controls.className = "event-choices";
    overlay.appendChild(controls);
    addEventButton(controls, "ANSWER", () => {
        overlay.eventAudio?.forEach(audio => audio.pause());
        playSound("dog-bark.mp3", 0.65);
        controls.innerHTML = "";
        overlay.querySelector(".event-message").textContent = "Gustavo says: WOOF WOOF?";
        ["TREAT", "TAXES", "WRONG NUMBER"].forEach(answer => {
            addEventButton(controls, answer, () => finishInteractiveEvent(overlay, answer === "TREAT" ? "Correct. Gustavo wanted a treat." : "Gustavo hung up.", answer === "TREAT"));
        });
    }, "event-choice accept-call");
    addEventButton(controls, "DECLINE", () => finishInteractiveEvent(overlay, "Gustavo will remember this.", false), "event-choice decline-call");
}

function galaxyShieldEvent() {
    const overlay = createImageGame("Raise the correct shield", "galaxy-cat.png", "galaxy-event", 18000);
    playEventSound(overlay, "laser-charge.mp3", 0.45);
    const directions = ["LEFT", "UP", "RIGHT"];
    let round = 0;
    let expected = directions[Math.floor(Math.random() * directions.length)];
    const controls = document.createElement("div");
    controls.className = "event-choices shield-controls";
    overlay.appendChild(controls);
    const updatePrompt = () => overlay.querySelector(".event-message").textContent = `LASER: ${expected} · ${round}/5`;
    directions.forEach(direction => addEventButton(controls, direction, () => {
        if (direction !== expected) {
            playSound("laser-hit.mp3", 0.65);
            return finishInteractiveEvent(overlay, "Shield missed.", false);
        }
        round++;
        playSound("laser-block.mp3", 0.55);
        if (round === 5) return finishInteractiveEvent(overlay, "All lasers blocked.");
        expected = directions[Math.floor(Math.random() * directions.length)];
        playSound("laser-charge.mp3", 0.4);
        updatePrompt();
    }));
    updatePrompt();
}

function findTheCircleEvent() {
    const overlay = createEventOverlay("interactive-event circle-event", 15000);
    addEventText(overlay, "Click the red face");
    const stage = document.createElement("div");
    stage.className = "hotspot-stage";
    stage.innerHTML = '<img src="assets/circle-bunny.png" alt="Bunny with a marked face">';
    const hotspot = document.createElement("button");
    hotspot.className = "image-hotspot";
    hotspot.setAttribute("aria-label", "Red face");
    hotspot.addEventListener("click", () => {
        playSound("target-found.mp3", 0.6);
        finishInteractiveEvent(overlay, "Found it.");
    });
    stage.appendChild(hotspot);
    overlay.appendChild(stage);
}

function saveTheCatEvent() {
    const overlay = createImageGame("Click CAT four times", "bomb-vs-cat.png", "bomb-cat-event");
    playEventSound(overlay, "bomb-ticking.mp3", 0.4, true);
    const controls = document.createElement("div");
    controls.className = "event-choices swapping-controls";
    overlay.appendChild(controls);
    let saves = 0;
    const render = () => {
        controls.innerHTML = "";
        const options = Math.random() < 0.5 ? ["BOMB", "CAT"] : ["CAT", "BOMB"];
        options.forEach(option => addEventButton(controls, option, () => {
            if (option === "BOMB") {
                playSound("explosion.mp3", 0.7);
                return finishInteractiveEvent(overlay, "Wrong one.", false);
            }
            saves++;
            playSound("cat-meow.mp3", 0.5);
            if (saves === 4) return finishInteractiveEvent(overlay, "Cat saved.");
            overlay.querySelector(".event-message").textContent = `Click CAT four times · ${saves}/4`;
            render();
        }));
    };
    render();
}

function meditationEvent() {
    const overlay = createImageGame("Breathe in...", "never-goon.png", "meditation-event", 18000);
    playEventSound(overlay, "meditation-hum.mp3", 0.35, true);
    playSound("inhale.mp3", 0.5);
    const breathe = addEventButton(overlay, "WAIT", () => {
        if (breathe.textContent !== "EXHALE") return finishInteractiveEvent(overlay, "Broke focus.", false);
        playSound("exhale.mp3", 0.5);
        rounds++;
        if (rounds === 3) return finishInteractiveEvent(overlay, "Focus complete.");
        breathe.textContent = "WAIT";
        overlay.querySelector(".event-message").textContent = "Breathe in...";
        playSound("inhale.mp3", 0.5);
    });
    let rounds = 0;
    const breathing = setInterval(() => {
        if (!overlay.isConnected || rounds === 3) return clearInterval(breathing);
        breathe.textContent = "EXHALE";
        overlay.querySelector(".event-message").textContent = "Breathe out — click EXHALE";
        setTimeout(() => {
            if (!overlay.isConnected || breathe.textContent !== "EXHALE") return;
            finishInteractiveEvent(overlay, "Missed the breath.", false);
        }, 1100);
    }, 2800);
}

function hashBrownEvent() {
    const overlay = createImageGame("Build: HASH BROWN HASH BROWN", "hash-brown-cat.png", "hash-event");
    const sequence = ["HASH", "BROWN", "HASH", "BROWN"];
    let position = 0;
    const controls = document.createElement("div");
    controls.className = "event-choices";
    overlay.appendChild(controls);
    ["BROWN", "HASH"].forEach(word => addEventButton(controls, word, () => {
        if (sequence[position] !== word) return finishInteractiveEvent(overlay, "Order ruined.", false);
        position++;
        playSound("pop.mp3", 0.4);
        overlay.querySelector(".event-message").textContent = `${sequence.slice(0, position).join(" ")} _`;
        if (position === sequence.length) {
            playSound("service-bell.mp3", 0.65);
            finishInteractiveEvent(overlay, "Order complete.");
        }
    }));
}

function staticDischargeEvent() {
    const overlay = createImageGame("Discharge the nodes — 0/5", "lightning-dog.png", "static-event", 16000);
    let cleared = 0;
    const spawnNode = () => {
        playSound("laser-charge.mp3", 0.25);
        const node = document.createElement("button");
        node.className = "electric-node";
        node.textContent = "⚡";
        node.style.left = `${12 + Math.random() * 76}%`;
        node.style.top = `${18 + Math.random() * 65}%`;
        node.addEventListener("click", () => {
            node.remove();
            cleared++;
            playSound("laser-hit.mp3", 0.5);
            overlay.querySelector(".event-message").textContent = `Discharge the nodes — ${cleared}/5`;
            if (cleared === 5) finishInteractiveEvent(overlay, "Static cleared.");
            else spawnNode();
        });
        overlay.appendChild(node);
    };
    spawnNode();
}

function sansFightEvent() {
    const overlay = createEventOverlay("sans-fight-event", 600000);
    const iframe = document.createElement("iframe");
    iframe.className = "sans-fight-frame";
    iframe.src = "assets/sans-fight/index.html";
    iframe.title = "Sans fight";

    const controls = document.createElement("div");
    controls.className = "sans-fight-controls";
    controls.textContent = "ARROWS: MOVE  ·  Z: SELECT  ·  X: CANCEL";
    const exit = document.createElement("button");
    exit.type = "button";
    exit.textContent = "EXIT FIGHT";
    exit.addEventListener("click", () => overlay.remove());
    controls.appendChild(exit);

    overlay.append(iframe, controls);
    iframe.addEventListener("load", () => iframe.contentWindow.focus());
}
