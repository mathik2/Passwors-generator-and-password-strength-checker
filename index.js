// index.js - Comprehensive password toolbox
const upperLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowerLetters = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const specialCharacter = "!@#$%^&*(){}[]|/<>.:-_~'";
const ambiguous = '0O1lI';
const commonPasswords = [
  '123456', 'password', '123456789', '12345678', '12345', 'qwerty', 'abc123', 'football', '111111', 'letmein'
];
let autoClearClipboard = false;

// Utilities
function $(id) { return document.getElementById(id); }
function randChoice(str) { return str.charAt(Math.floor(Math.random() * str.length)); }

// Generator
function Generate() {
  let len = parseInt($('passwordLength').value, 10) || 12;
  const includeUpper = $('optUpper').checked;
  const includeLower = $('optLower').checked;
  const includeNum = $('optNumbers').checked;
  const includeSpecial = $('optSpecial').checked;
  const avoidAmbig = $('optAvoidAmbig').checked;

  let pool = '';
  if (includeUpper) pool += upperLetters;
  if (includeLower) pool += lowerLetters;
  if (includeNum) pool += numbers;
  if (includeSpecial) pool += specialCharacter;
  if (pool.length === 0) { $('result').textContent = 'Select at least one character set'; return; }

  if (avoidAmbig) {
    pool = pool.split('').filter(c => !ambiguous.includes(c)).join('');
  }

  // Ensure at least one of each selected set
  let guaranteed = [];
  if (includeUpper) guaranteed.push(randChoice(avoidAmbig ? upperLetters.split('').filter(c => !ambiguous.includes(c)).join('') : upperLetters));
  if (includeLower) guaranteed.push(randChoice(avoidAmbig ? lowerLetters.split('').filter(c => !ambiguous.includes(c)).join('') : lowerLetters));
  if (includeNum) guaranteed.push(randChoice(numbers));
  if (includeSpecial) guaranteed.push(randChoice(specialCharacter));

  // Fill the rest
  let restLen = len - guaranteed.length;
  let out = '';
  for (let i = 0; i < restLen; i++) out += randChoice(pool);

  // Mix guaranteed chars into output
  out += guaranteed.join('');
  out = out.split('').sort(() => Math.random() - 0.5).join('');

  $('result').textContent = out;
  // auto evaluate
  $('password').value = out;
  StrengthCheckerRealtime();
}

// Passphrase generator (human-readable)
const wordlist = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima', 'mango', 'nectar', 'omega', 'panda', 'queen', 'robot', 'sunset', 'tango', 'umbrella', 'victor', 'whiskey', 'xray', 'yankee', 'zulu', 'orange', 'banana', 'river', 'mountain', 'silver', 'gold', 'crimson', 'azure'];
function generatePassphrase() {
  // pick 4 words and add number and symbol
  const w = [];
  for (let i = 0; i < 4; i++) w.push(wordlist[Math.floor(Math.random() * wordlist.length)]);
  const pass = w.join('-') + Math.floor(Math.random() * 90 + 10) + '!';
  $('result').textContent = pass;
  $('password').value = pass;
  StrengthCheckerRealtime();
}

// Copy and auto-clear
async function copyText() {
  const val = $('result').textContent || '';
  if (!val) return;
  try {
    await navigator.clipboard.writeText(val);
    $('copyFeedback').textContent = 'Copied to clipboard';
    if (autoClearClipboard) {
      setTimeout(async () => {
        try { await navigator.clipboard.writeText(''); $('copyFeedback').textContent = 'Clipboard cleared'; }
        catch (e) { $('copyFeedback').textContent = 'Clipboard clear failed (permission)'; }
      }, 30000);
    }
    setTimeout(() => { $('copyFeedback').textContent = ''; }, 2500);
  } catch (e) { $('copyFeedback').textContent = 'Copy failed'; }
}

function autoClearClipboardToggle() { autoClearClipboard = !autoClearClipboard; $('autoClearIcon').style.opacity = autoClearClipboard ? 1 : 0.4; $('copyFeedback').textContent = autoClearClipboard ? 'Auto-clear enabled' : 'Auto-clear disabled'; setTimeout(() => $('copyFeedback').textContent = '', 1500); }

// History (localStorage)
function loadHistory() {
  const raw = localStorage.getItem('pw_history');
  const arr = raw ? JSON.parse(raw) : [];
  const list = $('historyList'); list.innerHTML = '';
  arr.slice().reverse().forEach((it, idx) => {
    const div = document.createElement('div'); div.className = 'history-item';
    const left = document.createElement('div'); left.textContent = it.label ? (it.label + ' — ' + it.value) : it.value;
    const right = document.createElement('div');
    const copyBtn = document.createElement('button'); copyBtn.className = 'btn btn-sm btn-outline-secondary me-1'; copyBtn.textContent = 'Copy'; copyBtn.onclick = () => { navigator.clipboard.writeText(it.value); };
    const delBtn = document.createElement('button'); delBtn.className = 'btn btn-sm btn-outline-danger'; delBtn.textContent = 'Delete'; delBtn.onclick = () => { removeHistoryItem(arr.length - 1 - idx); };
    right.appendChild(copyBtn); right.appendChild(delBtn);
    div.appendChild(left); div.appendChild(right);
    list.appendChild(div);
  });
}

function saveToHistory() {
  const val = $('result').textContent;
  if (!val) return;
  const raw = localStorage.getItem('pw_history');
  const arr = raw ? JSON.parse(raw) : [];
  arr.push({ value: val, label: 'generated', created: Date.now() });
  localStorage.setItem('pw_history', JSON.stringify(arr));
  loadHistory();
}

function removeHistoryItem(index) {
  const raw = localStorage.getItem('pw_history');
  const arr = raw ? JSON.parse(raw) : [];
  arr.splice(index, 1);
  localStorage.setItem('pw_history', JSON.stringify(arr));
  loadHistory();
}

function clearHistory() { localStorage.removeItem('pw_history'); loadHistory(); }

// Expiry
function setExpiry() {
  const days = parseInt($('expiryDays').value, 10);
  if (!days || days < 1) { $('expiryInfo').textContent = 'Enter a valid number of days.'; return; }
  localStorage.setItem('pw_expiry_days', days);
  $('expiryInfo').textContent = 'Passwords saved will be marked to expire in ' + days + ' days.';
}

// Export current password as file
function exportCurrent() {
  const val = $('result').textContent;
  if (!val) return alert('No password to export');
  const blob = new Blob([val], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'password.txt'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// Save current with label (localStorage). Optional simple encryption using passphrase prompt
async function saveCurrent() {
  const label = $('saveLabel').value || 'saved';
  const val = $('password').value || $('result').textContent;
  if (!val) return alert('Nothing to save');
  const useEnc = confirm('Do you want to encrypt this saved entry with a passphrase? (recommended on shared devices)');
  let payload = { label: label, value: val, created: Date.now() };
  if (useEnc) {
    const passphrase = prompt('Enter a passphrase to encrypt this entry (remember it!).');
    if (!passphrase) return alert('Encryption cancelled');
    try {
      const encrypted = await encryptString(JSON.stringify(payload), passphrase);
      // save encrypted as base64 + salt + iv in localStorage 'pw_saved_enc' array
      const raw = localStorage.getItem('pw_saved_enc');
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(encrypted);
      localStorage.setItem('pw_saved_enc', JSON.stringify(arr));
      alert('Saved encrypted entry locally.');
    } catch (e) { alert('Encryption failed: ' + e); }
  } else {
    const raw = localStorage.getItem('pw_saved');
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(payload);
    localStorage.setItem('pw_saved', JSON.stringify(arr));
    alert('Saved entry locally (unencrypted).');
  }
}

// Simple Web Crypto helpers for AES-GCM encryption with passphrase (PBKDF2)
async function getKeyFromPassphrase(passphrase, salt) {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode(salt || 'salt1234'), iterations: 100000, hash: 'SHA-256' }, passKey, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  return key;
}

async function encryptString(plaintext, passphrase) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(8));
  const saltStr = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const key = await getKeyFromPassphrase(passphrase, saltStr);
  const enc = new TextEncoder();
  const data = enc.encode(plaintext);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data);
  return { v: 1, salt: saltStr, iv: Array.from(iv), data: Array.from(new Uint8Array(cipher)) };
}

async function decryptObject(obj, passphrase) {
  const key = await getKeyFromPassphrase(passphrase, obj.salt);
  const iv = new Uint8Array(obj.iv);
  const data = new Uint8Array(obj.data);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
  return new TextDecoder().decode(plain);
}

// Download saved (unencrypted) entries as JSON
function downloadAll() {
  const saved = localStorage.getItem('pw_saved') || '[]';
  const savedEnc = localStorage.getItem('pw_saved_enc') || '[]';
  const history = localStorage.getItem('pw_history') || '[]';
  const blob = new Blob(['{"saved":' + saved + ',"savedEnc":' + savedEnc + ',"history":' + history + '}'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'password_backup.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

// Strength & Breach checks
let lastPwnPrefix = null;
async function StrengthCheckerRealtime() {
  const passcode = $('password').value || '';
  // Basic checks
  let score = 0;
  $('Uppercase').style.color = passcode.match(/[A-Z]/) ? 'green' : 'red';
  if (passcode.match(/[A-Z]/)) score++;
  $('Lowercase').style.color = passcode.match(/[a-z]/) ? 'green' : 'red';
  if (passcode.match(/[a-z]/)) score++;
  $('Number').style.color = passcode.match(/[0-9]/) ? 'green' : 'red';
  if (passcode.match(/[0-9]/)) score++;
  $('SpecialCharacter').style.color = passcode.match(/[!@#$%^&*(){}[\]|\/<>.:\-_~']/) ? 'green' : 'red';
  if (passcode.match(/[!@#$%^&*(){}[\]|\/<>.:\-_~']/)) score++;
  $('Length').style.color = passcode.length >= 8 ? 'green' : 'red';
  if (passcode.length >= 8) score++;

  updateStrengthMeter(score);
  updateInputBorder(score);

  // Entropy estimation (bits): length * log2(charset)
  let charset = 0;
  if (passcode.match(/[A-Z]/)) charset += 26;
  if (passcode.match(/[a-z]/)) charset += 26;
  if (passcode.match(/[0-9]/)) charset += 10;
  if (passcode.match(/[!@#$%^&*(){}[\]|\/<>.:\-_~']/)) charset += 32;
  const bits = passcode.length > 0 && charset > 0 ? Math.round(passcode.length * Math.log2(charset)) : 0;
  $('entropyBits').textContent = bits;

  // Common password quick check
  $('commonCheck').textContent = commonPasswords.includes(passcode) ? 'Yes' : 'No';

  // Suggestions
  const suggestions = [];
  if (passcode.length < 12) suggestions.push('Make it longer (12+ chars)');
  if (!passcode.match(/[0-9]/)) suggestions.push('Add numbers');
  if (!passcode.match(/[A-Z]/)) suggestions.push('Add uppercase letters');
  if (!passcode.match(/[!@#$%^&*(){}[\]|\/<>.:\-_~']/)) suggestions.push('Add symbols (e.g. @#$)');
  $('suggestions').textContent = suggestions.join(' • ') || 'Good job!';

  // Pwned check (k-anonymity) - only if auto enabled and non-empty
  if ($('autoPwn').checked && passcode.length > 0) {
    // hash and query
    await checkPwnedPassword(passcode);
  } else if (passcode.length === 0) {
    $('pwnedFeedback').textContent = '';
  }
}

// Update meter
function updateStrengthMeter(score) {
  const meter = $('strengthMeter');
  const percent = Math.min(100, (score / 5) * 100);
  meter.style.width = percent + '%';
  meter.setAttribute('aria-valuenow', percent);
  if (score <= 2) { meter.className = 'progress-bar bg-danger'; meter.textContent = 'Weak'; }
  else if (score <= 4) { meter.className = 'progress-bar bg-warning'; meter.textContent = 'Medium'; }
  else { meter.className = 'progress-bar bg-success'; meter.textContent = 'Strong'; }
}

// Color input border
function updateInputBorder(score) {
  const input = $('password');
  input.classList.remove('pw-border-weak', 'pw-border-med', 'pw-border-strong');
  if (score <= 2) input.classList.add('pw-border-weak');
  else if (score <= 4) input.classList.add('pw-border-med');
  else input.classList.add('pw-border-strong');
}

// Show/hide toggle
function toggleShow() {
  const p = $('password'); const icon = $('eyeIcon');
  if (p.type === 'password') { p.type = 'text'; icon.textContent = 'visibility_off'; }
  else { p.type = 'password'; icon.textContent = 'visibility'; }
}

// HIBP k-anonymity check
async function checkPwnedPassword(password) {
  if (!password) return;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-1', encoder.encode(password));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  const prefix = hashHex.slice(0, 5);
  const suffix = hashHex.slice(5);

  try {
    const res = await fetch('https://api.pwnedpasswords.com/range/' + prefix);
    const text = await res.text();
    const lines = text.split('\n');
    let found = 0;
    for (const line of lines) {
      const [s, c] = line.trim().split(':');
      if (s === suffix) { found = parseInt(c, 10); break; }
    }
    const el = $('pwnedFeedback');
    if (found > 0) {
      el.textContent = `⚠️ Seen ${found.toLocaleString()} times in breaches`;
      el.style.color = 'red';
    } else {
      el.textContent = '✅ Not found in known breaches';
      el.style.color = 'green';
    }
  } catch (e) {
    $('pwnedFeedback').textContent = 'HIBP check failed';
    $('pwnedFeedback').style.color = '#666';
  }
}

// Export / download helpers already above... (downloadAll)

// Init
(function init() {
  // dark mode from prefers-color-scheme + saved pref
  try {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true' || (saved === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
      $('darkModeSwitch').checked = true;
    }
  } catch (e) { }
  loadHistory();
  // wire autoPwn default true
  if ($('autoPwn')) $('autoPwn').checked = true;
})();
