// ==========================================
// 帮助内容配置 (这里配置弹窗显示的文案)
// ==========================================
const helpContent = {
  algo: `
            <h4>1. XOR (基础版)</h4>
            <p>速度最快，生成的代码较短。安全性较低，主要用于绕过关键词屏蔽，适合日常闲聊。</p>
            <h4>2. RC4 (推荐)</h4>
            <p>经典的流加密算法。生成的密文分布均匀，看起来更像随机乱码，混淆效果比 XOR 好。</p>
            <h4>3. AES-GCM (最高安全)</h4>
            <p>银行级/军用级加密标准。每次加密都会生成不同的密文（带有随机IV）。如果你在传输银行卡号、密码等极其敏感的信息，请务必使用此模式。</p>
        `,
  disguise: `
            <p>微信可能会屏蔽纯乱码。使用伪装模板可以让你的密文看起来像“程序员的代码”，从而降低被屏蔽的风险。</p>
            
            <h4>🐍 Python 变量</h4>
            <pre>SECRET_KEY = "e4bda0..."</pre>
            
            <h4>📋 JSON 配置</h4>
            <pre>{ "api_token": "e4bda0...", "uid": 1001 }</pre>
            
            <h4>❌ C++ 报错</h4>
            <pre>Error: Exception at 0xe4bda0...</pre>
            
            <p><strong>注意：</strong>解密时，直接把这一整段代码复制进来即可，程序会自动提取密文。</p>
        `,
};

// ==========================================
// UI 交互逻辑
// ==========================================
function showHelp(type) {
  const titleMap = { algo: "加密算法说明", disguise: "伪装模板预览" };
  document.getElementById("modal-title").innerText = titleMap[type];
  document.getElementById("modal-body").innerHTML = helpContent[type];

  document.getElementById("modal-overlay").classList.add("active");
}

function closeModal(event) {
  // 如果是直接点击关闭按钮，或者点击了背景遮罩，则关闭
  document.getElementById("modal-overlay").classList.remove("active");
}

// 记忆设置
function saveSettings() {
  const algo = document.getElementById("algo").value;
  const disguise = document.getElementById("disguise").value;
  localStorage.setItem("chat_app_algo", algo);
  localStorage.setItem("chat_app_disguise", disguise);
}

function loadSettings() {
  const savedAlgo = localStorage.getItem("chat_app_algo");
  const savedDisguise = localStorage.getItem("chat_app_disguise");
  if (savedAlgo) document.getElementById("algo").value = savedAlgo;
  if (savedDisguise) document.getElementById("disguise").value = savedDisguise;
}

window.addEventListener("DOMContentLoaded", loadSettings);

// ==========================================
// 核心加密逻辑 (与之前版本保持一致)
// ==========================================
const textEnc = new TextEncoder();
const textDec = new TextDecoder();
function strToBytes(str) {
  return textEnc.encode(str);
}
function bytesToStr(bytes) {
  return textDec.decode(bytes);
}
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) return new Uint8Array(0);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}
function extractHex(text) {
  const matches = text.match(/[0-9a-fA-F]+/g);
  if (!matches) return "";
  matches.sort((a, b) => b.length - a.length);
  return matches[0];
}

function algoXOR(inputBytes, keyBytes) {
  const output = new Uint8Array(inputBytes.length);
  for (let i = 0; i < inputBytes.length; i++)
    output[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
  return output;
}

function algoRC4(inputBytes, keyBytes) {
  const s = [];
  let j = 0;
  let x,
    res = new Uint8Array(inputBytes.length);
  for (let i = 0; i < 256; i++) s[i] = i;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + keyBytes[i % keyBytes.length]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
  }
  let i = 0;
  j = 0;
  for (let y = 0; y < inputBytes.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    x = s[i];
    s[i] = s[j];
    s[j] = x;
    res[y] = inputBytes[y] ^ s[(s[i] + s[j]) % 256];
  }
  return res;
}

async function algoAES_Encrypt(inputBytes, password) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    strToBytes(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: strToBytes("salt_fixed_v1"),
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    inputBytes
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return combined;
}

async function algoAES_Decrypt(combinedBytes, password) {
  if (combinedBytes.length < 13) throw new Error("Data too short");
  const iv = combinedBytes.slice(0, 12);
  const data = combinedBytes.slice(12);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    strToBytes(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: strToBytes("salt_fixed_v1"),
      iterations: 1000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    data
  );
  return new Uint8Array(decrypted);
}

function applyDisguise(hex, type) {
  const r = Math.floor(Math.random() * 10000);
  switch (type) {
    case "python":
      return `SECRET_KEY = "${hex}"\n# TODO: Rotate key immediately`;
    case "json":
      return `{\n  "api_token": "${hex}",\n  "expires_in": 3600,\n  "uid": ${r}\n}`;
    case "cpp":
      return `// Core dump at 0x${hex.slice(
        0,
        8
      )}\nstd::string signature = "${hex}";`;
    case "mysql":
      return `mysql://admin:${hex}@127.0.0.1:3306/prod_db`;
    default:
      return hex;
  }
}

async function process(mode) {
  const input = document.getElementById("input").value;
  const pwd = document.getElementById("password").value;
  const algo = document.getElementById("algo").value;
  const disguise = document.getElementById("disguise").value;
  const outBox = document.getElementById("output");
  const status = document.getElementById("status-text");

  if (!input || !pwd) {
    outBox.innerText = "❌ 请输入内容和密码";
    return;
  }
  outBox.innerText = "处理中...";

  try {
    if (mode === "encrypt") {
      const rawBytes = strToBytes(input);
      let resultBytes;
      if (algo === "XOR") resultBytes = algoXOR(rawBytes, strToBytes(pwd));
      else if (algo === "RC4") resultBytes = algoRC4(rawBytes, strToBytes(pwd));
      else if (algo === "AES")
        resultBytes = await algoAES_Encrypt(rawBytes, pwd);
      const hex = bytesToHex(resultBytes);
      const finalStr = applyDisguise(hex, disguise);
      outBox.innerText = finalStr;
      status.innerText = `✅ 加密成功 | 算法: ${algo}`;
    } else {
      const hex = extractHex(input);
      if (!hex) throw new Error("未检测到有效的加密片段");
      const cipherBytes = hexToBytes(hex);
      let plainBytes;
      if (algo === "XOR") plainBytes = algoXOR(cipherBytes, strToBytes(pwd));
      else if (algo === "RC4")
        plainBytes = algoRC4(cipherBytes, strToBytes(pwd));
      else if (algo === "AES")
        plainBytes = await algoAES_Decrypt(cipherBytes, pwd);
      outBox.innerText = bytesToStr(plainBytes);
      status.innerText = `✅ 解密成功 | 算法: ${algo}`;
    }
  } catch (e) {
    console.error(e);
    outBox.innerText = "❌ 失败: 密码错误、算法不匹配或数据损坏。";
  }
}

function copyResult() {
  const t = document.getElementById("output").innerText;
  navigator.clipboard.writeText(t).then(() => alert("已复制"));
}
