import { supabase } from "./supabase.js";
import { register, login, logout, getCurrentUser } from "./auth.js";
import { loadDashboard, saveGoal, addWaterLog } from "./dashboard.js";

const $ = (id) => document.getElementById(id);
let currentUser = null;
let currentGoal = 2000;
let currentGlass = 250;

function showMessage(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle("success", success);
}

function showAuth(tab = "login") {
  $("authView").classList.remove("hidden");
  $("dashboardView").classList.add("hidden");
  $("loginForm").classList.toggle("hidden", tab !== "login");
  $("registerForm").classList.toggle("hidden", tab !== "register");
  $("loginTab").classList.toggle("active", tab === "login");
  $("registerTab").classList.toggle("active", tab === "register");
  showMessage($("authMessage"), "");
}

function showDashboard() {
  $("authView").classList.add("hidden");
  $("dashboardView").classList.remove("hidden");
}

function renderDashboard(data) {
  const name = data.profile?.full_name || data.profile?.username || "teman";
  $("userName").textContent = name.split(" ")[0];
  $("todayLabel").textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).format(new Date());

  currentGoal = Number(data.goal.target_ml);
  currentGlass = Number(data.goal.glass_size_ml);
  $("goalInput").value = currentGoal;
  $("glassInput").value = currentGlass;
  $("amountInput").value = currentGlass;

  const consumed = data.logs.reduce((sum, log) => sum + Number(log.amount_ml), 0);
  const percent = currentGoal > 0 ? Math.min(100, Math.round(consumed / currentGoal * 100)) : 0;
  const remaining = Math.max(0, currentGoal - consumed);

  $("consumedValue").textContent = consumed.toLocaleString("id-ID");
  $("targetValue").textContent = currentGoal.toLocaleString("id-ID");
  $("percentValue").textContent = `${percent}%`;
  $("remainingText").textContent = remaining > 0
    ? `Sisa ${remaining.toLocaleString("id-ID")} ml untuk mencapai target.`
    : "Target harian tercapai. Pertahankan kebiasaan baikmu!";
  $("progressBar").style.width = `${percent}%`;
  $("progressRing").style.background = `conic-gradient(#168bd2 ${percent}%, #e8f3fa ${percent}%)`;
  $("targetFoot").textContent = `Target ${currentGoal.toLocaleString("id-ID")} ml`;
  $("logCount").textContent = `${data.logs.length} catatan`;

  const history = $("historyList");
  history.innerHTML = "";
  if (!data.logs.length) {
    history.innerHTML = '<p class="muted">Belum ada catatan hari ini.</p>';
  } else {
    data.logs.forEach((log) => {
      const item = document.createElement("div");
      item.className = "history-item";
      const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" })
        .format(new Date(log.consumed_at));
      const amount = document.createElement("strong");
      amount.textContent = `+${Number(log.amount_ml).toLocaleString("id-ID")} ml`;
      const timestamp = document.createElement("span");
      timestamp.textContent = time;
      item.append(amount, timestamp);
      history.append(item);
    });
  }
}

async function refreshDashboard() {
  const data = await loadDashboard(currentUser.id);
  renderDashboard(data);
}

$("loginTab").addEventListener("click", () => showAuth("login"));
$("registerTab").addEventListener("click", () => showAuth("register"));

$("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("loginForm").querySelector("button[type=submit]");
  button.disabled = true;
  showMessage($("authMessage"), "Sedang masuk...");
  try {
    await login($("loginEmail").value, $("loginPassword").value);
    await initialize();
  } catch (error) {
    showMessage($("authMessage"), error.message || "Login gagal.");
  } finally {
    button.disabled = false;
  }
});

$("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("registerForm").querySelector("button[type=submit]");
  button.disabled = true;
  showMessage($("authMessage"), "Sedang membuat akun...");
  try {
    const result = await register({
      fullName: $("registerName").value,
      username: $("registerUsername").value,
      email: $("registerEmail").value,
      password: $("registerPassword").value
    });
    if (!result.session) {
      showMessage($("authMessage"), "Pendaftaran berhasil. Cek email untuk verifikasi, lalu login.", true);
      showAuth("login");
      showMessage($("authMessage"), "Akun dibuat. Verifikasi email jika diminta, lalu login.", true);
    } else {
      await initialize();
    }
  } catch (error) {
    showMessage($("authMessage"), error.message || "Pendaftaran gagal.");
  } finally {
    button.disabled = false;
  }
});

$("goalForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const target = Number($("goalInput").value);
  const glass = Number($("glassInput").value);
  if (!Number.isInteger(target) || target < 250 || target > 6000 ||
      !Number.isInteger(glass) || glass < 50 || glass > 1000) {
    showMessage($("logMessage"), "Periksa target dan ukuran gelas (target 250–6000 ml, gelas 50–1000 ml).");
    return;
  }
  try {
    await saveGoal(currentUser.id, target, glass);
    await refreshDashboard();
    showMessage($("logMessage"), "Target harian berhasil disimpan.", true);
  } catch (error) {
    showMessage($("logMessage"), error.message || "Gagal menyimpan target.");
  }
});

$("logForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = Number($("amountInput").value);
  if (!Number.isInteger(amount) || amount < 1 || amount > 2000) {
    showMessage($("logMessage"), "Masukkan jumlah antara 1 sampai 2000 ml.");
    return;
  }
  try {
    await addWaterLog(currentUser.id, amount);
    await refreshDashboard();
    showMessage($("logMessage"), `${amount} ml berhasil dicatat.`, true);
  } catch (error) {
    showMessage($("logMessage"), error.message || "Gagal mencatat konsumsi.");
  }
});

$("logoutBtn").addEventListener("click", async () => {
  try {
    await logout();
    currentUser = null;
    showAuth("login");
  } catch (error) {
    alert(error.message || "Gagal keluar.");
  }
});

async function initialize() {
  try {
    currentUser = await getCurrentUser();
    if (!currentUser) {
      showAuth("login");
      return;
    }
    showDashboard();
    await refreshDashboard();
  } catch (error) {
    console.error(error);
    showAuth("login");
    showMessage($("authMessage"), "Tidak dapat memuat data. Periksa koneksi dan konfigurasi Supabase.");
  }
}

$("year").textContent = new Date().getFullYear();
initialize();
