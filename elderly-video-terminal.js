const projectLangButton = document.querySelector('.lang-toggle');
const projectProgress = document.querySelector('.scroll-progress span');
let projectLang = 'en';

function updateProjectLanguage() {
  document.documentElement.lang = projectLang === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-en][data-zh]').forEach((element) => {
    element.textContent = element.dataset[projectLang];
  });
  projectLangButton?.classList.toggle('is-zh', projectLang === 'zh');
  document.title = projectLang === 'en'
    ? 'Physical-key video terminal for older adults | Yao Du'
    : '适老化实体按键视频终端 | 杜瑶';
}

projectLangButton?.addEventListener('click', () => {
  projectLang = projectLang === 'en' ? 'zh' : 'en';
  updateProjectLanguage();
});

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  projectProgress?.style.setProperty('transform', `scaleX(${Math.min(1, Math.max(0, progress))})`);
}

window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
updateProjectLanguage();
updateProgress();
