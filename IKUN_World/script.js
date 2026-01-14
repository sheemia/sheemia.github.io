const playlist = [
  { name: "情人", file: "Music/情人.mp3" },
  { name: "只因你太美", file: "Music/只因你太美.mp3" },
  { name: "Deadmen", file: "Music/Deadmen.mp3" },
  { name: "Hug_me", file: "Music/Hug_me.mp3" },
  { name: "Wait_wait_wait", file: "Music/Wait_wait_wait.mp3" },
  { name: "What_a_day", file: "Music/What_a_day.mp3" },
];

const quotes = [
  "黄昏见证虔诚的信徒，巅峰诞生虚伪的拥护",
  "披金成王，伴坤远航",
  "向阳花木易为春，听说你爱蔡徐坤",
  "待我IKUN更强大，定帮坤哥赢天下",
  "狮子座为王",
  "千军万马是 ikun，ikun 永远爱坤坤",
  "IKUN forever",
  "追梦的路上不拥挤",
  "哪有那么多一夜成名，其实都是百炼成钢",
  "既然选择了远方，便只顾风雨兼程",
  "厉不厉害你坤哥",
  "只因你太美",
  "鸡你太美",
  "农夫山泉有点甜，不爱坤坤有点儿悬",
  "山外青山楼外楼，唱跳rap打篮球",
  "你干嘛~~哈哈~哎呦",
];

let currentTrackIndex = 0;
let isPlaying = false;
let score = localStorage.getItem("kun_score")
  ? parseInt(localStorage.getItem("kun_score"))
  : 0;

let autoScoreRate = 0;
let clickMultiplier = 1;
let collisionReward = 100;

let shopItems = {
  ball: { cost: 50, count: 0, add: 1 },
  suspender: { cost: 500, count: 0, add: 10 },
  trainee: { cost: 1000, count: 0, multi: 2 },
  collision: { cost: 3000, count: 0, add: 100 },
};

let lastClickTime = 0;
let comboCount = 0;
let comboTimer = null;

const rarityConfig = {
  D: { score: 10, prob: 0.3 },
  C: { score: 50, prob: 0.2 },
  B: { score: 100, prob: 0.15 },
  A: { score: 500, prob: 0.12 },
  S: { score: 1000, prob: 0.1 },
  SR: { score: 2000, prob: 0.07 },
  SS: { score: 3000, prob: 0.04 },
  SSR: { score: 4000, prob: 0.015 },
  SSS: { score: 5000, prob: 0.005 },
};

let ownedCards = [
  { id: 1, rarity: "D" },
  { id: 2, rarity: "D" },
  { id: 3, rarity: "D" },
];

let gachaTimer = null;
let pendingCard = null;
let gmClickCount = 0;

const chickenSound = new Audio("Sound/只因.mp3");
chickenSound.volume = 1.0;
const audio = document.getElementById("main-audio");
const bgContainer = document.getElementById("bg-container");
const playBtn = document.getElementById("play-btn");
const vinylWrapper = document.getElementById("vinyl-wrapper");
const progressBar = document.getElementById("progress-bar");
const mvPlayer = document.getElementById("mv-player");
const basketball = document.getElementById("basketball");
const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo-text");
const chickenEl = document.getElementById("chicken-img");
const fireEffect = document.getElementById("fire-effect");
const collectionEl = document.getElementById("card-collection");
const cardCountEl = document.getElementById("card-count");
const cardTotalScoreEl = document.getElementById("card-total-score");

scoreEl.innerText = score;
updateStatsDisplay();
updateCardScore();
checkBadges();
renderCollection();

for (let i = 1; i <= 15; i++) {
  let div = document.createElement("div");
  div.className = "bg-img";
  div.style.backgroundImage = `url('Background/背景${i}.jpg')`;
  bgContainer.appendChild(div);
}

function startSite(e) {
  // 强制移除遮罩
  if (e && e.stopPropagation) e.stopPropagation();
  document.getElementById("start-overlay").style.display = "none";
  basketball.style.visibility = "visible";

  // 简单播放逻辑
  loadTrack(currentTrackIndex);
  audio
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayBtn();
      vinylWrapper.classList.add("vinyl-playing");
    })
    .catch((e) => {
      console.log("Auto-play blocked, wait for interaction");
      isPlaying = false;
      updatePlayBtn();
    });

  chickenSound
    .play()
    .then(() => {
      chickenSound.pause();
      chickenSound.currentTime = 0;
    })
    .catch(() => {});

  startBgSlideshow();
  startQuotes();
  initBasketball();
  initGlobalClick();
  initParticles();
  initKeys();
  initGM();

  setInterval(() => {
    if (autoScoreRate > 0) addScore(autoScoreRate, null, false);
  }, 1000);
}

function openSaveLoad() {
  document.getElementById("save-modal").style.display = "flex";
}
function exportSave() {
  const data = {
    score: score,
    ownedCards: ownedCards,
    shopItems: shopItems,
    autoScoreRate: autoScoreRate,
    clickMultiplier: clickMultiplier,
    collisionReward: collisionReward,
  };
  const json = JSON.stringify(data);
  const encoded = btoa(encodeURIComponent(json));
  document.getElementById("save-code").value = encoded;
  alert("存档码已生成！请复制保存。");
}
function importSave() {
  try {
    const encoded = document.getElementById("save-code").value.trim();
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    score = data.score || 0;
    ownedCards = data.ownedCards || [];
    shopItems = data.shopItems || shopItems;
    autoScoreRate = data.autoScoreRate || 0;
    clickMultiplier = data.clickMultiplier || 1;
    collisionReward = data.collisionReward || 100;
    scoreEl.innerText = score;
    document.getElementById("count-ball").innerText = shopItems.ball.count;
    document.getElementById("cost-ball").innerText =
      "💰 " + shopItems.ball.cost;
    document.getElementById("count-suspender").innerText =
      shopItems.suspender.count;
    document.getElementById("cost-suspender").innerText =
      "💰 " + shopItems.suspender.cost;
    document.getElementById("count-trainee").innerText =
      shopItems.trainee.count;
    document.getElementById("cost-trainee").innerText =
      "💰 " + shopItems.trainee.cost;
    document.getElementById("count-collision").innerText =
      shopItems.collision.count;
    document.getElementById("cost-collision").innerText =
      "💰 " + shopItems.collision.cost;
    updateStatsDisplay();
    updateCardScore();
    checkBadges();
    renderCollection();
    alert("存档读取成功！");
    document.getElementById("save-modal").style.display = "none";
  } catch (e) {
    alert("存档码无效！");
  }
}

function openLeaderboard() {
  document.getElementById("leaderboard-modal").style.display = "flex";
  renderLeaderboard();
}
function renderLeaderboard() {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  let fakeData = [
    { name: "虚空之主", score: 99999999 },
    { name: "练习生2.5年", score: 5000000 },
    { name: "油饼食不食", score: 2500000 },
    { name: "荔枝大王", score: 1000000 },
    { name: "黑粉头子", score: 500000 },
  ];
  fakeData.push({ name: "我 (IKUN)", score: score });
  fakeData.sort((a, b) => b.score - a.score);
  fakeData.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "rank-item";
    if (item.name.includes("IKUN")) div.classList.add("rank-me");
    if (index < 3) div.classList.add("rank-top");
    div.innerHTML = `<span>#${index + 1} ${
      item.name
    }</span><span>${item.score.toLocaleString()}</span>`;
    list.appendChild(div);
  });
}

function initGM() {
  document.getElementById("site-title").addEventListener("click", () => {
    gmClickCount++;
    if (gmClickCount === 5) {
      document.getElementById("gm-panel").style.display = "flex";
      gmClickCount = 0;
    }
  });
}
function gmAddScore() {
  addScore(1000000, null, false);
}
function gmClearBag() {
  ownedCards = [];
  renderCollection();
  updateCardScore();
}
function gmUnlockCards() {
  ownedCards = [];
  for (let i = 1; i <= 50; i++) {
    ownedCards.push({ id: i, rarity: "SSS" });
  }
  renderCollection();
  updateCardScore();
  checkBadges();
}

function loadTrack(index) {
  if (index < 0) index = playlist.length - 1;
  if (index >= playlist.length) index = 0;
  currentTrackIndex = index;
  audio.src = playlist[index].file;
  document.getElementById("current-song-name").innerText =
    "正在播放: " + playlist[index].name;
}
function togglePlay() {
  if (audio.paused) {
    audio.play();
    isPlaying = true;
    vinylWrapper.classList.add("vinyl-playing");
  } else {
    audio.pause();
    isPlaying = false;
    vinylWrapper.classList.remove("vinyl-playing");
  }
  updatePlayBtn();
}
function updatePlayBtn() {
  playBtn.innerText = isPlaying ? "⏸ 暂停" : "▶ 播放";
}
function nextTrack() {
  loadTrack(currentTrackIndex + 1);
  if (isPlaying) {
    audio.play();
    vinylWrapper.classList.add("vinyl-playing");
  }
}
function prevTrack() {
  loadTrack(currentTrackIndex - 1);
  if (isPlaying) {
    audio.play();
    vinylWrapper.classList.add("vinyl-playing");
  }
}

audio.addEventListener("ended", nextTrack);

let isDraggingProgress = false;
progressBar.addEventListener("mousedown", () => (isDraggingProgress = true));
progressBar.addEventListener("mouseup", () => (isDraggingProgress = false));
progressBar.addEventListener("touchstart", () => (isDraggingProgress = true));
progressBar.addEventListener("touchend", () => (isDraggingProgress = false));
progressBar.addEventListener("input", () => {
  audio.currentTime = progressBar.value;
});

audio.addEventListener("timeupdate", () => {
  if (!isDraggingProgress && audio.duration) {
    progressBar.max = audio.duration;
    progressBar.value = audio.currentTime;
  }
});
document.getElementById("volume-bar").addEventListener("input", (e) => {
  audio.volume = e.target.value;
});
mvPlayer.addEventListener("play", () => {
  if (!audio.paused) {
    audio.pause();
    isPlaying = false;
    vinylWrapper.classList.remove("vinyl-playing");
    updatePlayBtn();
  }
});

function addScore(amount, e, showEffect = true) {
  score += Math.floor(amount);
  scoreEl.innerText = score;
  localStorage.setItem("kun_score", score);
  checkBadges();
  if (showEffect && e) {
    const plusOne = document.createElement("div");
    plusOne.className = "click-effect";
    plusOne.innerText = "+" + Math.floor(amount);
    let x = e.clientX || window.innerWidth / 2;
    let y = e.clientY || window.innerHeight / 2;
    plusOne.style.left = x + "px";
    plusOne.style.top = y + "px";
    document.body.appendChild(plusOne);
    setTimeout(() => plusOne.remove(), 600);
  }
}

function updateStatsDisplay() {
  document.getElementById("stat-auto").innerText = autoScoreRate;
  document.getElementById("stat-click").innerText = clickMultiplier;
  document.getElementById("stat-collision").innerText = collisionReward;
}

function getCardScore() {
  return ownedCards.reduce(
    (acc, card) => acc + rarityConfig[card.rarity].score,
    0
  );
}
function updateCardScore() {
  const s = getCardScore();
  cardTotalScoreEl.innerText = s.toLocaleString();
}

function checkBadges() {
  if (score >= 1000) unlockBadge(1);
  if (score >= 10000) unlockBadge(2);
  if (score >= 100000) unlockBadge(3);

  const uniqueIds = new Set(ownedCards.map((c) => c.id)).size;
  if (uniqueIds >= 10) unlockBadge("c1");
  if (uniqueIds >= 25) unlockBadge("c2");
  if (uniqueIds >= 50) unlockBadge("c3");

  const cScore = getCardScore();
  if (cScore >= 10000) unlockBadge("r1");
  if (cScore >= 100000) unlockBadge("r2");
  if (cScore >= 250000) unlockBadge("r3");

  if (uniqueIds === 50 && cScore >= 250000) {
    unlockBadge("god");
  }
}

function unlockBadge(id) {
  const badge = document.getElementById("badge-" + id);
  if (badge && !badge.classList.contains("unlocked")) {
    badge.classList.add("unlocked");
    showGiantText("解锁新成就！");
  }
}

function showBadgeDetails(id) {
  const badgeData = {
    1: { title: "黑粉头子", desc: "累计应援值达到 1,000" },
    2: { title: "真爱粉", desc: "累计应援值达到 10,000" },
    3: { title: "披金成王", desc: "累计应援值达到 100,000" },
    c1: { title: "萌新收藏家", desc: "收集 10 种不同的卡牌图片" },
    c2: { title: "资深收藏家", desc: "收集 25 种不同的卡牌图片" },
    c3: { title: "全图鉴霸主", desc: "集齐全部 50 种不同的卡牌图片" },
    r1: { title: "欧气爆发", desc: "卡组总战力达到 10,000" },
    r2: { title: "天选之子", desc: "卡组总战力达到 100,000" },
    r3: { title: "虚空之主", desc: "卡组总战力达到 250,000" },
    god: {
      title: "IKUN之神",
      desc: "【终极成就】同时达成【全图鉴霸主】和【虚空之主】成就！",
    },
  };
  const info = badgeData[id];
  if (info) alert(`🏆 成就：${info.title}\n\n📝 获取条件：${info.desc}`);
}

function clickChicken(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  chickenSound.currentTime = 0;
  chickenSound.play();
  const now = Date.now();
  if (now - lastClickTime < 500) {
    comboCount++;
    clearTimeout(comboTimer);
    comboEl.innerText = "COMBO x" + comboCount;
    comboEl.classList.add("combo-active");
    let comboBonus = 1 + comboCount / 10;
    let finalScore = 1 * clickMultiplier * comboBonus;
    addScore(finalScore, e);
    if (comboCount >= 3) {
      fireEffect.style.opacity = Math.min(1, comboCount * 0.1);
      let scale = 1 + comboCount * 0.05;
      fireEffect.style.transform = `translateX(-50%) scale(${scale})`;
      chickenEl.classList.add("combo-shake");
    }
  } else {
    comboCount = 1;
    addScore(1 * clickMultiplier, e);
    fireEffect.style.opacity = 0;
    fireEffect.style.transform = `translateX(-50%) scale(1)`;
    chickenEl.classList.remove("combo-shake");
  }
  lastClickTime = now;
  comboTimer = setTimeout(() => {
    comboCount = 0;
    comboEl.classList.remove("combo-active");
    fireEffect.style.opacity = 0;
    fireEffect.style.transform = `translateX(-50%) scale(1)`;
    chickenEl.classList.remove("combo-shake");
  }, 500);
}

function buyItem(type) {
  const item = shopItems[type];
  if (score >= item.cost) {
    addScore(-item.cost, null, false);
    item.count++;
    if (type === "ball") autoScoreRate += item.add;
    if (type === "suspender") autoScoreRate += item.add;
    if (type === "trainee") clickMultiplier *= item.multi;
    if (type === "collision") collisionReward += item.add;
    item.cost = Math.floor(item.cost * 1.5);
    document.getElementById("count-" + type).innerText = item.count;
    document.getElementById("cost-" + type).innerText = "💰 " + item.cost;
    updateStatsDisplay();
    chickenSound.currentTime = 0;
    chickenSound.play();
  } else {
    alert("应援值不足！");
  }
}

function buyGacha() {
  if (ownedCards.length >= 50) {
    if (!confirm("⚠️ 背包已满！继续抽卡将遗弃新卡牌！")) return;
  }
  if (score >= 2000) {
    addScore(-2000, null, false);
    const rand = Math.random();
    let rarity = "D";
    if (rand > 0.995) rarity = "SSS";
    else if (rand > 0.98) rarity = "SSR";
    else if (rand > 0.94) rarity = "SS";
    else if (rand > 0.87) rarity = "SR";
    else if (rand > 0.77) rarity = "S";
    else if (rand > 0.65) rarity = "A";
    else if (rand > 0.5) rarity = "B";
    else if (rand > 0.3) rarity = "C";
    // 确保随机数是 1-50
    const randomId = Math.floor(Math.random() * 50) + 1;
    pendingCard = { id: randomId, rarity: rarity };

    // 强制显示遮罩 (Flex居中)
    const overlay = document.getElementById("gacha-overlay");
    overlay.style.display = "flex";

    const box = document.getElementById("gacha-box");
    const result = document.getElementById("gacha-result");
    box.style.display = "block";
    result.style.display = "none";
    gachaTimer = setTimeout(() => {
      showGachaResult();
    }, 2000);
  } else {
    alert("应援值不足 2000！");
  }
}

function skipGacha(e) {
  if (e) e.stopPropagation();
  if (gachaTimer) {
    clearTimeout(gachaTimer);
    showGachaResult();
  }
}

function showGachaResult() {
  gachaTimer = null;
  const box = document.getElementById("gacha-box");
  const result = document.getElementById("gacha-result");
  const img = document.getElementById("ssr-img");
  const title = document.getElementById("card-rarity-title");
  box.style.display = "none";
  result.style.display = "flex";
  // 路径指向 CXK_Photo
  const imgIndex = pendingCard.id;
  img.src = `CXK_Photo/照片${imgIndex}.jpg`;
  img.className = `ssr-card rarity-${pendingCard.rarity}`;
  title.className = `ssr-title title-${pendingCard.rarity}`;
  title.innerText = `✨ ${pendingCard.rarity} 级卡牌 ✨`;
  if (ownedCards.length < 50) {
    ownedCards.push(pendingCard);
    updateCardScore();
    renderCollection();
    checkBadges();
  }
  chickenSound.currentTime = 0;
  chickenSound.play();
}

function closeGacha() {
  document.getElementById("gacha-overlay").style.display = "none";
}

function renderCollection() {
  collectionEl.innerHTML = "";
  cardCountEl.innerText = ownedCards.length;
  const rarityOrder = {
    SSS: 9,
    SSR: 8,
    SS: 7,
    SR: 6,
    S: 5,
    A: 4,
    B: 3,
    C: 2,
    D: 1,
  };
  const sortedCards = [...ownedCards].sort(
    (a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]
  );
  sortedCards.forEach((card, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "card-wrapper";
    // 路径指向 CXK_Photo
    const imgIndex = card.id;
    const img = document.createElement("img");
    img.src = `CXK_Photo/照片${imgIndex}.jpg`;
    img.className = `collection-card border-${card.rarity}`;
    wrapper.appendChild(img);
    const tag = document.createElement("div");
    tag.className = `card-tag tag-${card.rarity}`;
    tag.innerText = card.rarity;
    wrapper.appendChild(tag);
    const delBtn = document.createElement("div");
    delBtn.className = "card-delete-btn";
    delBtn.innerText = "✕";
    delBtn.onclick = (e) => removeCard(card, e);
    wrapper.appendChild(delBtn);
    collectionEl.appendChild(wrapper);
  });
}

function removeCard(cardObj, e) {
  if (e) e.stopPropagation();
  if (confirm(`真的要遗弃这张 ${cardObj.rarity} 卡牌吗？`)) {
    const idx = ownedCards.indexOf(cardObj);
    if (idx > -1) ownedCards.splice(idx, 1);
    updateCardScore();
    renderCollection();
    checkBadges();
  }
}

function initBasketball() {
  let posX = Math.random() * (window.innerWidth - 100);
  let posY = Math.random() * (window.innerHeight - 100);
  let velX = (Math.random() > 0.5 ? 1 : -1) * 1.5;
  let velY = (Math.random() > 0.5 ? 1 : -1) * 1.5;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function animate() {
    if (!isDragging) {
      const ball = document.getElementById("basketball");
      const ballW = ball.offsetWidth;
      const ballH = ball.offsetHeight;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      posX += velX;
      posY += velY;
      if (posX <= 0) {
        posX = 0;
        velX = Math.abs(velX);
      } else if (posX >= screenW - ballW) {
        posX = screenW - ballW;
        velX = -Math.abs(velX);
      }
      if (posY <= 0) {
        posY = 0;
        velY = Math.abs(velY);
      } else if (posY >= screenH - ballH) {
        posY = screenH - ballH;
        velY = -Math.abs(velY);
      }

      const chicken = document.getElementById("chicken-img");
      if (
        chicken &&
        !document
          .getElementById("main-container")
          .classList.contains("content-hidden")
      ) {
        const bRect = ball.getBoundingClientRect();
        const cRect = chicken.getBoundingClientRect();
        const dist = Math.sqrt(
          Math.pow(
            bRect.left + bRect.width / 2 - (cRect.left + cRect.width / 2),
            2
          ) +
            Math.pow(
              bRect.top + bRect.height / 2 - (cRect.top + cRect.height / 2),
              2
            )
        );
        if (dist < bRect.width / 2 + cRect.width / 2 - 20) {
          chickenSound.play();
          addScore(collisionReward, {
            clientX: cRect.left + cRect.width / 2,
            clientY: cRect.top + cRect.height / 2,
          });
          chicken.classList.add("collision-shake");
          setTimeout(() => chicken.classList.remove("collision-shake"), 500);
          velX = (bRect.left < cRect.left ? -1 : 1) * 4;
          velY = (bRect.top < cRect.top ? -1 : 1) * 4;
        }
      }
    }
    basketball.style.transform = `translate(${posX}px, ${posY}px)`;
    requestAnimationFrame(animate);
  }
  animate();

  basketball.addEventListener("mousedown", (e) => {
    isDragging = true;
    e.preventDefault();
    const rect = basketball.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    basketball.style.transition = "none";
  });
  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      posX = e.clientX - dragOffset.x;
      posY = e.clientY - dragOffset.y;
      const ballW = basketball.offsetWidth;
      const ballH = basketball.offsetHeight;
      posX = Math.max(0, Math.min(window.innerWidth - ballW, posX));
      posY = Math.max(0, Math.min(window.innerHeight - ballH, posY));
    }
  });
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      basketball.style.transition = "transform 0.1s linear";
      velX = (Math.random() - 0.5) * 5;
      velY = (Math.random() - 0.5) * 5;
    }
  });

  basketball.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      const rect = basketball.getBoundingClientRect();
      const touch = e.touches[0];
      dragOffset.x = touch.clientX - rect.left;
      dragOffset.y = touch.clientY - rect.top;
      basketball.style.transition = "none";
    },
    { passive: false }
  );
  document.addEventListener(
    "touchmove",
    (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        posX = touch.clientX - dragOffset.x;
        posY = touch.clientY - dragOffset.y;
        const ballW = basketball.offsetWidth;
        const ballH = basketball.offsetHeight;
        posX = Math.max(0, Math.min(window.innerWidth - ballW, posX));
        posY = Math.max(0, Math.min(window.innerHeight - ballH, posY));
      }
    },
    { passive: false }
  );
  document.addEventListener("touchend", () => {
    if (isDragging) {
      isDragging = false;
      basketball.style.transition = "transform 0.1s linear";
      velX = (Math.random() - 0.5) * 5;
      velY = (Math.random() - 0.5) * 5;
    }
  });
}

function initParticles() {
  document.addEventListener("mousemove", (e) => {
    const p = document.createElement("div");
    p.className = "cursor-particle";
    p.style.left = e.clientX + "px";
    p.style.top = e.clientY + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  });
}

function initKeys() {
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "j") {
      showGiantText("鸡你太美");
      chickenSound.play();
    } else if (key === "n") {
      nextTrack();
      showGiantText("切歌!");
    } else if (key === "g") {
      const b = document.getElementById("basketball");
      b.style.width = b.style.width === "300px" ? "100px" : "300px";
    }
  });
}

function showGiantText(text) {
  const div = document.createElement("div");
  div.className = "giant-text";
  div.innerText = text;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 1500);
}

function startBgSlideshow() {
  const bgs = document.querySelectorAll(".bg-img");
  if (bgs.length === 0) return;
  let activeIndex = 0;
  bgs[activeIndex].classList.add("active");
  setInterval(() => {
    bgs[activeIndex].classList.remove("active");
    activeIndex = (activeIndex + 1) % bgs.length;
    bgs[activeIndex].classList.add("active");
  }, 5000);
}

function startQuotes() {
  setInterval(() => {
    createQuote(quotes[Math.floor(Math.random() * quotes.length)], false);
  }, 1500);
}

function createQuote(text, isUser) {
  const q = document.createElement("div");
  q.className = "floating-quote";
  if (isUser) q.classList.add("user-quote");
  q.innerText = text;
  q.style.top = Math.random() * 80 + "vh";
  q.style.animationDuration = isUser ? "10s" : Math.random() * 10 + 15 + "s";
  q.onclick = function (e) {
    e.stopPropagation();
    this.classList.toggle("quote-highlight");
  };
  document.getElementById("quotes-layer").appendChild(q);
  setTimeout(() => {
    if (!q.classList.contains("quote-highlight")) q.remove();
  }, 30000);
}

function sendDanmaku() {
  const input = document.getElementById("danmaku-input");
  const text = input.value.trim();
  if (text) {
    createQuote(text, true);
    input.value = "";
    const btn = document.querySelector(".danmaku-bar button");
    const originalText = btn.innerText;
    btn.innerText = "✅";
    setTimeout(() => (btn.innerText = originalText), 1000);
  }
}

function initGlobalClick() {
  document.addEventListener("click", (e) => {
    if (
      e.target.closest(".glass-panel") ||
      e.target.closest("#basketball") ||
      e.target.closest(".danmaku-bar") ||
      e.target.closest(".keyboard-tips") ||
      e.target.closest("#gacha-overlay") ||
      e.target.closest("#save-modal") ||
      e.target.closest("#leaderboard-modal") ||
      e.target.closest("#left-controls") ||
      e.target.closest(".gm-panel") ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.closest(".card-delete-btn")
    )
      return;
    if (
      e.target.classList.contains("floating-quote") ||
      e.target.classList.contains("quote-highlight")
    )
      return;
    document
      .getElementById("main-container")
      .classList.toggle("content-hidden");
    document.getElementById("danmaku-bar").classList.toggle("bar-hidden");
    document.getElementById("keyboard-tips").classList.toggle("tips-hidden");
    document.getElementById("left-controls").classList.toggle("left-hidden");
  });
}
