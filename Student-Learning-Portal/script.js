/* ========= AUTH ========= */
let loginPage, portal;
// DOM elements used throughout the script (initialized on DOMContentLoaded)
let welcome, profileName, courseList, courseCount, progress, notesArea, quizResult, timer, quote;

// Auth elements
let authForm, authTitle, loginEmail, loginPassword, loginFields, registerFields, regUsername, regEmail, regPassword, authMessage, authSubmit, toggleAuthBtn;
let isRegisterMode = false;

function validateEmail(e) {
  return /\S+@\S+\.\S+/.test(e);
}

function logout() {
  localStorage.removeItem("student");
  location.reload();
}

function loadPortal() {
  if (loginPage) {
    loginPage.classList.add("hidden");
    try { loginPage.style.display = 'none'; } catch (e) {}
  }
  if (portal) {
    portal.classList.remove("hidden");
    try { portal.style.display = 'flex'; } catch (e) {}
  }
  if (welcome) welcome.textContent = `Welcome, ${localStorage.getItem("student")}`;
  if (profileName) profileName.textContent = localStorage.getItem("student");
  console.log('loadPortal: portal visible?', portal ? !portal.classList.contains('hidden') : 'no portal element');
  // Ensure the dashboard module is shown after login and force its display
  try {
    showModule('dashboard');
    const dash = document.getElementById('dashboard');
    if (dash) { dash.classList.remove('hidden'); dash.style.display = ''; }
  } catch (e) { console.warn('showModule not available yet'); }
}

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  updateAuthUI();
}

function updateAuthUI() {
  if (!authTitle) return;
  if (isRegisterMode) {
    authTitle.textContent = 'Register';
    registerFields.classList.remove('hidden');
    loginFields.classList.add('hidden');
    authSubmit.textContent = 'Register';
    toggleAuthBtn.textContent = 'Have an account? Login';
  } else {
    authTitle.textContent = 'Student Login';
    registerFields.classList.add('hidden');
    loginFields.classList.remove('hidden');
    authSubmit.textContent = 'Login';
    toggleAuthBtn.textContent = 'New user? Register';
  }
  authMessage.textContent = '';
  // Enable/disable fields so hidden required inputs don't trigger validation
  if (loginEmail) loginEmail.disabled = isRegisterMode;
  if (loginPassword) loginPassword.disabled = isRegisterMode;
  if (regUsername) regUsername.disabled = !isRegisterMode;
  if (regEmail) regEmail.disabled = !isRegisterMode;
  if (regPassword) regPassword.disabled = !isRegisterMode;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  console.log('Auth submit, register mode:', isRegisterMode);
  if (isRegisterMode) return registerUser();
  return loginUser();
}

function loginUser() {
  const email = (loginEmail && loginEmail.value || '').trim().toLowerCase();
  const pass = loginPassword && loginPassword.value || '';
  console.log('loginUser called:', { email, passLength: pass.length });
  if (!email || !pass) return authMessage.textContent = 'Enter email and password.';
  if (!validateEmail(email)) return authMessage.textContent = 'Enter a valid email.';
  const users = JSON.parse(localStorage.getItem('users')) || [];
  console.log('stored users:', users);
  const user = users.find(u => u.email === email);
  if (!user) return authMessage.textContent = 'No account found with this email.';
  if (user.password !== pass) return authMessage.textContent = 'Incorrect password.';
  localStorage.setItem('student', user.username);
  console.log('login successful for', user.username);
  loadPortal();
}

function registerUser() {
  const name = (regUsername && regUsername.value || '').trim();
  const email = (regEmail && regEmail.value || '').trim().toLowerCase();
  const pass = regPassword && regPassword.value || '';
  console.log('registerUser called:', { name, email, passLength: pass.length });
  if (!name || !email || !pass) return authMessage.textContent = 'All fields are required.';
  if (!validateEmail(email)) return authMessage.textContent = 'Enter a valid email.';
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.email === email)) return authMessage.textContent = 'An account with this email already exists.';
  const newUser = { username: name, email, password: pass };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('student', name);
  console.log('registration successful:', newUser);
  loadPortal();
}

/* ========= MODULE NAV ========= */
function showModule(id) {
  document.querySelectorAll(".module").forEach(m => m.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

/* ========= COURSES ========= */
let courses = JSON.parse(localStorage.getItem("courses")) || [];

function addCourse() {
  const name = prompt("Enter course name");
  if (!name) return;
  courses.push(name);
  localStorage.setItem("courses", JSON.stringify(courses));
  renderCourses();
}

function renderCourses() {
  courseList.innerHTML = "";
  courses.forEach(c => {
    courseList.innerHTML += `<li>${c}</li>`;
  });
  courseCount.textContent = courses.length;
  progress.textContent = courses.length ? "50%" : "0%";
}
// renderCourses will be called after DOM is ready

/* ========= NOTES ========= */
// notesArea handlers will be attached after DOM is ready
function saveNotes() {
  if (notesArea) {
    localStorage.setItem("notes", notesArea.value);
    alert("Notes saved!");
  }
}

/* ========= QUIZ ========= */
function checkQuiz(ans) {
  quizResult.textContent =
    ans === "correct" ? "✅ Correct!" : "❌ Wrong answer";
}

/* ========= TIMER ========= */
let time = 1500;
let interval;

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (time <= 0) return clearInterval(interval);
    time--;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}

function resetTimer() {
  time = 1500;
  updateTimer();
}

function updateTimer() {
  timer.textContent =
    String(Math.floor(time / 60)).padStart(2, "0") +
    ":" +
    String(time % 60).padStart(2, "0");
}
// updateTimer will be called after DOM is ready

/* ========= FETCH API ========= */
// Load a learning quote: try remote API, fall back to local quotes on failure
async function loadQuote() {
  const localQuotes = [
    "Keep learning every day!",
    "Study a little every day and you'll go far.",
    "Small progress is still progress.",
    "Consistency beats intensity.",
    "Ask questions — that's how you learn."
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://api.quotable.io/random", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("Network response was not ok");
    const d = await res.json();
    quote.textContent = "📘 " + d.content;
  } catch (e) {
    const q = localQuotes[Math.floor(Math.random() * localQuotes.length)];
    quote.textContent = "📘 " + q;
  }
}

// Initialize DOM references and attach handlers after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loginPage = document.getElementById("loginPage");
  portal = document.getElementById("portal");
  // Auth elements
  authForm = document.getElementById('authForm');
  authTitle = document.getElementById('authTitle');
  loginFields = document.getElementById('loginFields');
  registerFields = document.getElementById('registerFields');
  loginEmail = document.getElementById('loginEmail');
  loginPassword = document.getElementById('loginPassword');
  regUsername = document.getElementById('regUsername');
  regEmail = document.getElementById('regEmail');
  regPassword = document.getElementById('regPassword');
  authMessage = document.getElementById('authMessage');
  authSubmit = document.getElementById('authSubmit');
  toggleAuthBtn = document.getElementById('toggleAuth');
  welcome = document.getElementById("welcome");
  profileName = document.getElementById("profileName");
  courseList = document.getElementById("courseList");
  courseCount = document.getElementById("courseCount");
  progress = document.getElementById("progress");
  notesArea = document.getElementById("notesArea");
  quizResult = document.getElementById("quizResult");
  timer = document.getElementById("timer");
  quote = document.getElementById("quote");

  // Attach notes handler
  if (notesArea) {
    notesArea.value = localStorage.getItem("notes") || "";
    notesArea.oninput = () => localStorage.setItem("notes", notesArea.value);
  }

  // Auth handlers
  if (authForm) {
    authForm.onsubmit = handleAuthSubmit;
  }
  if (toggleAuthBtn) toggleAuthBtn.addEventListener('click', toggleAuthMode);
  updateAuthUI();

  // Initial renders
  renderCourses();
  updateTimer();
  loadQuote();

  // Auto login if student saved
  if (localStorage.getItem("student")) loadPortal();
});
