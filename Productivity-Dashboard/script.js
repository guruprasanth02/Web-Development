const app = {
    state: {
        isLoggedIn: localStorage.getItem('nx_auth') === 'true',
        tasks: JSON.parse(localStorage.getItem('nx_tasks')) || [],
        timer: { time: 1500, interval: null, running: false },
        theme: localStorage.getItem('nx_theme') || 'dark'
    },

    init() {
        this.applyTheme();
        if (!this.state.isLoggedIn) return;
        
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        this.renderTasks();
        this.loadProfile();
        this.initNotes();
        this.fetchWeather();
        this.fetchQuote();
    },

    // --- THEME LOGIC ---
    toggleTheme() {
        this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('nx_theme', this.state.theme);
        this.applyTheme();
    },

    applyTheme() {
        const root = document.documentElement;
        if (this.state.theme === 'light') {
            root.style.setProperty('--bg', '#f0f2f5');
            root.style.setProperty('--text', '#1e293b');
            root.style.setProperty('--glass', 'rgba(255, 255, 255, 0.7)');
            root.style.setProperty('--border', 'rgba(0, 0, 0, 0.1)');
        } else {
            root.style.setProperty('--bg', '#0b0f1a');
            root.style.setProperty('--text', '#e2e8f0');
            root.style.setProperty('--glass', 'rgba(255, 255, 255, 0.03)');
            root.style.setProperty('--border', 'rgba(255, 255, 255, 0.1)');
        }
    },

    // --- AUTHENTICATION ---
    toggleAuth(showRegister) {
        document.getElementById('login-form').classList.toggle('hidden', showRegister);
        document.getElementById('register-form').classList.toggle('hidden', !showRegister);
    },

    register() {
        const user = document.getElementById('reg-user').value.trim();
        const pass = document.getElementById('reg-pass').value;
        if (user && pass) {
            localStorage.setItem(`user_${user}`, pass);
            this.showToast("Account created! Please login.");
            this.toggleAuth(false);
        }
    },

    login() {
        const user = document.getElementById('user-in').value.trim();
        const pass = document.getElementById('pass-in').value;
        if (localStorage.getItem(`user_${user}`) === pass) {
            localStorage.setItem('nx_auth', 'true');
            localStorage.setItem('nx_current_user', user);
            location.reload();
        } else {
            this.showToast("Invalid credentials.");
        }
    },

    logout() {
        localStorage.removeItem('nx_auth');
        location.reload();
    },

    // --- TASK MANAGER ---
    addTask() {
        const input = document.getElementById('t-input');
        if (!input.value.trim()) return;
        this.state.tasks.push({ id: Date.now(), text: input.value, completed: false });
        localStorage.setItem('nx_tasks', JSON.stringify(this.state.tasks));
        input.value = '';
        this.renderTasks();
        this.showToast('Task added successfully!');
    },

    renderTasks() {
        const list = document.getElementById('t-list');
        list.innerHTML = this.state.tasks.map(t => `
            <li class="glass-card task-item ${t.completed ? 'completed' : ''}" style="display:flex; justify-content:space-between; margin-bottom:10px; padding:10px;">
                <input type="checkbox" ${t.completed ? 'checked' : ''} onclick="app.toggleTask(${t.id})" style="margin-right:10px;">
                <span>${t.text}</span>
                <button onclick="app.removeTask(${t.id})" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
            </li>`).join('');
        document.getElementById('task-count').innerText = this.state.tasks.length;
    },

    removeTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        localStorage.setItem('nx_tasks', JSON.stringify(this.state.tasks));
        this.renderTasks();
        this.showToast('Task removed!');
    },

    toggleTask(id) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            localStorage.setItem('nx_tasks', JSON.stringify(this.state.tasks));
            this.renderTasks();
        }
    },

    // --- FOCUS TIMER ---
    toggleTimer() {
        if (this.state.timer.running) {
            clearInterval(this.state.timer.interval);
        } else {
            this.state.timer.interval = setInterval(() => {
                if (this.state.timer.time > 0) {
                    this.state.timer.time--;
                    this.updateTimerUI();
                } else {
                    clearInterval(this.state.timer.interval);
                    alert("Focus session complete!");
                }
            }, 1000);
        }
        this.state.timer.running = !this.state.timer.running;
    },

    resetTimer() {
        clearInterval(this.state.timer.interval);
        this.state.timer.time = 1500;
        this.state.timer.running = false;
        this.updateTimerUI();
    },

    updateTimerUI() {
        const m = Math.floor(this.state.timer.time / 60);
        const s = this.state.timer.time % 60;
        document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    // --- EXTERNAL DATA ---
    async fetchWeather() {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const data = await res.json();
            document.getElementById('temp').innerText = `${Math.round(data.current_weather.temperature)}°C`;
            document.getElementById('loc').innerText = "Live Weather";
        });
    },

    async fetchQuote() {
        try {
            const res = await fetch('https://api.quotable.io/random');
            const data = await res.json();
            document.getElementById('quote').innerText = `"${data.content}" — ${data.author}`;
        } catch {
            document.getElementById('quote').innerText = "Keep pushing forward.";
        }
    },

    // --- UTILITIES ---
    loadProfile() {
        const img = localStorage.getItem('nx_pfp');
        if (img) document.getElementById('pfp').src = img;
        document.getElementById('img-up').onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                localStorage.setItem('nx_pfp', ev.target.result);
                document.getElementById('pfp').src = ev.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        };
        document.getElementById('user-name').innerText = localStorage.getItem('nx_current_user') || 'User';
    },

    initNotes() {
        const area = document.getElementById('n-area');
        area.value = localStorage.getItem('nx_notes') || '';
        area.oninput = (e) => localStorage.setItem('nx_notes', e.target.value);
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

window.onload = () => app.init();