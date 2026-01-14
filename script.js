// --- 0. 手机菜单逻辑 ---
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navLinksItems = document.querySelectorAll(".nav-links a");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");
});

navLinksItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active");
  });
});

// --- 1. 语言字典 ---
const translations = {
  zh: {
    nav_home: "主页",
    nav_about: "简介",
    nav_works: "作品",
    nav_awards: "获奖",
    nav_social: "社交媒体",
    nav_contact: "联系方式",
    hero_greet: "你好，我是",
    hero_role: "Sheemia",
    hero_prefix: "探索",
    section_about: "个人简介",
    about_p1: "我是韩山师范学院2025级的学生。",
    about_p2: "本人正在学习嵌入式系统，C++算法，Web前端和JS脚本。",
    stat_exp: "开发经验",
    stat_proj: "成功项目",
    section_works: "精选作品",
    // 作品
    proj_1_title: "IKUN世界",
    proj_1_desc: "Web前端网站实训作品：十分炫酷，可玩性极高的蔡徐坤应援网站。",
    proj_2_title: "51循迹小车",
    proj_2_desc:
      "基于STC89C52RC芯片设计的寻迹小车，完成了第一届602杯的所有任务，取得了不错的成绩。",
    proj_3_title: "Web前端学习日记",
    proj_3_desc: "上Web前端课所做的作品。",
    section_awards: "荣誉奖项",
    // 奖项
    award_1_year: "2025.12",
    award_1_title: "第八届传智杯程序设计挑战赛B组省赛",
    award_1_desc: "优秀奖",
    award_2_year: "2025.12",
    award_2_title: "第一届602杯大学生电子设计竞赛",
    award_2_desc: "第一名",
    award_3_year: "2025.11",
    award_3_title: "第四届韩山师范学院程序设计竞赛",
    award_3_desc: "银奖",
    award_4_year: "2025.11",
    award_4_title: "第八届传智杯AIot嵌入式系统创新大赛B组初赛",
    award_4_desc: "一等奖",
    award_5_year: "2025.11",
    award_5_title: "第八届传智杯程序设计挑战赛B组初赛",
    award_5_desc: "二等奖",
    // 社交
    section_social: "社交媒体",
    social_github: "GITHUB",
    social_bilibili: "哔哩哔哩",
    social_douyin: "抖音",
    social_csdn: "CSDN",
    section_contact: "联系方式",
    contact_msg: "如有需要，请联系我",
    typed_strings: ["嵌入式系统", "C++算法", "Web前端", "JS脚本"],
  },
  en: {
    nav_home: "HOME",
    nav_about: "ABOUT",
    nav_works: "WORKS",
    nav_awards: "AWARDS",
    nav_social: "SOCIAL MEDIA",
    nav_contact: "CONTACT",
    hero_greet: "HELLO, I AM",
    hero_role: "Sheemia",
    hero_prefix: "EXPLORE",
    section_about: "ABOUT ME",
    about_p1:
      "I am a student from the Class of 2025 at Hanshan Normal University.",
    about_p2:
      "I am currently studying Embedded Systems, C++ Algorithms, Web Frontend, and JavaScript.",
    stat_exp: "YEARS EXP",
    stat_proj: "PROJECTS",
    section_works: "SELECTED WORKS",
    // Works
    proj_1_title: "IKUN World",
    proj_1_desc:
      "Web Frontend Project: A visually stunning and highly interactive fan site for Cai Xukun.",
    proj_2_title: "51 Line Tracking Car",
    proj_2_desc:
      "Line-following robot based on the STC89C52RC chip. Completed all tasks in the 1st '602 Cup' and achieved excellent results.",
    proj_3_title: "Frontend Learning Diary",
    proj_3_desc:
      "Coursework projects created during Web Frontend development classes.",
    section_awards: "HONORS & AWARDS",
    // Awards
    award_1_year: "Dec 2025",
    award_1_title: "8th Chuanzhi Cup Programming Challenge Group B Provincial",
    award_1_desc: "Excellence Award",
    award_2_year: "Dec 2025",
    award_2_title: "1st 602 Cup University Electronic Design Contest",
    award_2_desc: "1st Place",
    award_3_year: "Nov 2025",
    award_3_title: "4th Hanshan Normal University Programming Contest",
    award_3_desc: "Silver Award",
    award_4_year: "Nov 2025",
    award_4_title:
      "8th Chuanzhi Cup AIoT Embedded System Innovation Contest Group B Prelim",
    award_4_desc: "1st Prize",
    award_5_year: "Nov 2025",
    award_5_title: "8th Chuanzhi Cup Programming Challenge Group B Prelim",
    award_5_desc: "2nd Prize",
    // Social
    section_social: "FOLLOW ME",
    social_github: "GITHUB",
    social_bilibili: "BILIBILI",
    social_douyin: "TIKTOK",
    social_csdn: "CSDN",
    section_contact: "GET IN TOUCH",
    contact_msg: "Feel free to contact me.",
    typed_strings: [
      "Embedded Systems",
      "C++ Algorithms",
      "Web Frontend",
      "JavaScript",
    ],
  },
};

// --- 2. 语言切换 ---
let currentLang = localStorage.getItem("site_lang") || "zh";
let typedInstance = null;

const updateLanguage = () => {
  document.querySelectorAll("[data-key]").forEach((el) => {
    const key = el.getAttribute("data-key");
    if (translations[currentLang][key]) {
      el.style.opacity = 0;
      setTimeout(() => {
        el.textContent = translations[currentLang][key];
        el.style.opacity = 1;
      }, 200);
    }
  });

  if (typedInstance) typedInstance.destroy();
  typedInstance = new Typed("#typed-text", {
    strings: translations[currentLang].typed_strings,
    typeSpeed: 60,
    backSpeed: 40,
    backDelay: 2000,
    loop: true,
  });

  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  localStorage.setItem("site_lang", currentLang);
};

// 绑定所有的翻译按钮
document.querySelectorAll(".nav-lang-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = currentLang === "zh" ? "en" : "zh";
    updateLanguage();
  });
});

updateLanguage();

// --- 3. 光标逻辑 (仅 PC) ---
const dot = document.querySelector(".cursor-dot");
const circle = document.querySelector(".cursor-circle");

if (window.matchMedia("(hover: hover)").matches) {
  window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    dot.style.left = `${posX}px`;
    dot.style.top = `${posY}px`;
    circle.animate(
      { left: `${posX}px`, top: `${posY}px` },
      { duration: 500, fill: "forwards" }
    );
  });
  const hoverTargets = document.querySelectorAll(
    "a, .project-card, .social-btn, .email-text, button"
  );
  hoverTargets.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      circle.style.width = "60px";
      circle.style.height = "60px";
      circle.style.backgroundColor = "rgba(0, 242, 255, 0.1)";
      circle.style.borderColor = "transparent";
    });
    el.addEventListener("mouseleave", () => {
      circle.style.width = "40px";
      circle.style.height = "40px";
      circle.style.backgroundColor = "transparent";
      circle.style.borderColor = "#00f2ff";
    });
  });
}

// --- 4. Three.js 星空 ---
const initThree = () => {
  const container = document.getElementById("canvas-container");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 2;
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const particlesCount = 1800;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++)
    posArray[i] = (Math.random() - 0.5) * 6;
  geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

  const material = new THREE.PointsMaterial({
    size: 0.005,
    color: 0x00f2ff,
    transparent: true,
    opacity: 0.8,
  });
  const particlesMesh = new THREE.Points(geometry, material);
  scene.add(particlesMesh);

  let mouseX = 0;
  let mouseY = 0;
  const rotationSpeed = 0.006;

  document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = (event.clientY / window.innerHeight) * 2 - 1;
  });

  const animate = () => {
    requestAnimationFrame(animate);
    particlesMesh.rotation.y += 0.001;
    particlesMesh.rotation.y -= mouseX * rotationSpeed;
    particlesMesh.rotation.x -= mouseY * rotationSpeed;
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
initThree();

// --- 5. GSAP ---
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray(".gs-reveal").forEach((elem) => {
  gsap.to(elem, {
    scrollTrigger: { trigger: elem, start: "top 85%" },
    y: 0,
    opacity: 1,
    duration: 1,
    ease: "power3.out",
  });
});
gsap.to(".gs-card", {
  scrollTrigger: { trigger: "#works", start: "top 75%" },
  y: 0,
  opacity: 1,
  duration: 0.8,
  stagger: 0.2,
});
gsap.to(".gs-award", {
  scrollTrigger: { trigger: "#awards", start: "top 80%" },
  x: 0,
  opacity: 1,
  duration: 0.8,
  stagger: 0.15,
});
gsap.to(".gs-social", {
  scrollTrigger: { trigger: "#social", start: "top 85%" },
  scale: 1,
  opacity: 1,
  duration: 0.5,
  stagger: 0.1,
  ease: "back.out(1.7)",
});
