(() => {
  const websiteId = document
    .querySelector('meta[name="analytics-website-id"]')
    ?.content.trim();

  // Analytics stays fully disabled until an Umami website ID is configured.
  if (!websiteId) return;

  const tracker = document.createElement('script');
  tracker.defer = true;
  tracker.src = 'https://cloud.umami.is/script.js';
  tracker.dataset.websiteId = websiteId;
  document.head.appendChild(tracker);

  const privacyLabel = document.querySelector('.yaobot-privacy [data-en][data-zh]');
  if (privacyLabel) {
    privacyLabel.dataset.en = 'Anonymous usage statistics · no personal data collected';
    privacyLabel.dataset.zh = '仅收集匿名使用统计 · 不收集个人信息';
    privacyLabel.textContent = document.documentElement.lang === 'zh'
      ? privacyLabel.dataset.zh
      : privacyLabel.dataset.en;
  }

  document.addEventListener('click', (event) => {
    const caseTrigger = event.target.closest('[data-case]');
    if (caseTrigger) {
      window.umami?.track('case-open', {
        case: caseTrigger.dataset.case,
      });
      return;
    }

    const cvLink = event.target.closest('a[href$=".pdf"]');
    if (cvLink) {
      window.umami?.track('cv-open', {
        file: cvLink.getAttribute('href').split('/').pop(),
      });
    }
  });
})();
