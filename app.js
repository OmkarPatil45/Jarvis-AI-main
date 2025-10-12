const talkBtn = document.querySelector('.talk');
const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const status = document.getElementById('status');

let isListening = false;

// Particles background
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(185, 212, 29, 0.1)';
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 0.9;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    const day = new Date();
    const hour = day.getHours();
    let greeting = '';
    if (hour >= 0 && hour < 12) {
        greeting = "Good Morning Boss...";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon Master...";
    } else {
        greeting = "Good Evening Sir...";
    }
    speak(greeting);
    return greeting;
}

function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'assistant-message');
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Ensures auto-scroll to bottom
}

async function getWeather(city) {
    try {
        const response = await fetch(`https://wttr.in/${city}?format=j1`);
        const data = await response.json();
        const weather = data.current_condition[0];
        return `${weather.temp_C}°C, ${weather.weatherDesc[0].value} in ${city}. Feels like ${weather.FeelsLikeC}°C.`;
    } catch (error) {
        return `Sorry, couldn't fetch weather for ${city}. Check your connection.`;
    }
}

async function takeCommand(message) {
    status.textContent = 'Processing command...';
    const loadingMsg = 'Executing...';
    addMessage('assistant', loadingMsg);

    let responseText = '';
    let spokenText = '';

    if (message.includes('hey') || message.includes('hello') || message.includes('jarvis')) {
        responseText = 'Hello Sir, How May I Help You?';
        spokenText = responseText;
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        responseText = 'Opening Google...';
        spokenText = responseText;
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        responseText = 'Opening Youtube...';
        spokenText = responseText;
    } else if (message.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        responseText = 'Opening Facebook...';
        spokenText = responseText;
    } else if (message.includes('what is') || message.includes('who is') || message.includes('what are')) {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        responseText = `This is what I found on the internet regarding "${message}".`;
        spokenText = `This is what I found on the internet regarding ${message}.`;
    } else if (message.includes('wikipedia')) {
        const query = message.replace("wikipedia", "").trim();
        window.open(`https://en.wikipedia.org/wiki/${query.replace(" ", "_")}`, "_blank");
        responseText = `This is what I found on Wikipedia regarding "${query}".`;
        spokenText = `This is what I found on Wikipedia regarding ${query}.`;
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        responseText = `The current time is ${time}.`;
        spokenText = `The current time is ${time}.`;
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "long", day: "numeric", year: "numeric" });
        responseText = `Today's date is ${date}.`;
        spokenText = `Today's date is ${date}.`;
    } else if (message.includes('weather') || message.includes('forecast')) {
        const cityMatch = message.match(/in\s+([a-zA-Z\s]+)/i);
        const city = cityMatch ? cityMatch[1].trim() : 'London';
        const weather = await getWeather(city);
        responseText = `Weather in ${city}: ${weather}`;
        spokenText = responseText;
    } else if (message.includes('news')) {
        // Simple placeholder for news; in production, fetch from RSS API
        responseText = 'Fetching top news headlines... For now, check Google News!';
        spokenText = 'Fetching top news headlines. For now, check Google News.';
        window.open('https://news.google.com', '_blank');
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        responseText = 'Opening Calculator...';
        spokenText = responseText;
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        responseText = `I found some information for "${message}" on Google.`;
        spokenText = `I found some information for ${message} on Google.`;
    }

    // Update chat
    chatContainer.removeChild(chatContainer.lastElementChild); // Remove loading
    addMessage('user', message);
    addMessage('assistant', responseText);
    speak(spokenText);

    setTimeout(() => {
        status.textContent = 'Ready for your next command.';
    }, 1000);
}

// Initialization
window.addEventListener('load', () => {
    initParticles();
    addMessage('assistant', 'Initializing JARVIS...');
    speak("Initializing JARVIS...");
    setTimeout(async () => {
        const greeting = await wishMe();
        addMessage('assistant', greeting);
        addMessage('assistant', 'Systems online. Voice or text commands accepted. Try "weather in New York" or "tell me a joke".');
        status.textContent = 'Ready for your next command.';
    }, 1500);
});

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isListening = true;
        talkBtn.classList.add('listening');
        status.textContent = 'Listening... Speak now!';
        addMessage('assistant', 'Listening for command...');
    };

    recognition.onresult = async (event) => {
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript;
        userInput.value = transcript;
        await takeCommand(transcript.toLowerCase());
    };

    recognition.onend = () => {
        isListening = false;
        talkBtn.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        status.textContent = 'Recognition error. Try typing or speaking again.';
        isListening = false;
        talkBtn.classList.remove('listening');
    };

    talkBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
} else {
    talkBtn.innerHTML = '<i class="fas fa-keyboard"></i>'; // Fallback icon
    status.textContent += ' Speech not supported—use text.';
}

// Text Input Handling
userInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const message = userInput.value.trim();
        if (message) {
            await takeCommand(message.toLowerCase());
            userInput.value = '';
        }
    }
});