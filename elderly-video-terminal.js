const toggle = document.querySelector('.lang-toggle');
const progress = document.querySelector('.progress span');
let lang = 'zh';

function applyLanguage(next) {
  lang = next;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-zh][data-en]').forEach((el) => {
    el.textContent = el.dataset[lang];
  });
  toggle.innerHTML = lang === 'zh' ? '<b>中</b><span>/</span><em>EN</em>' : '<b>EN</b><span>/</span><em>中</em>';
  document.title = lang === 'zh' ? '适老化实体按键视频终端｜Yao Du' : 'Physical-key video terminal | Yao Du';
}

toggle.addEventListener('click', () => applyLanguage(lang === 'zh' ? 'en' : 'zh'));
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
}, { passive: true });

applyLanguage('zh');
