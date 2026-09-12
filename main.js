const body = document.body;
const langButton = document.querySelector('.lang-toggle');
const overlay = document.getElementById('case-overlay');
const modalContent = document.getElementById('modal-content');
const caseModal = overlay?.querySelector('.case-modal');
const modalCursorLight = caseModal?.querySelector('.modal-cursor-light');
const atlasStage = document.getElementById('atlas-stage');
const atlasCanvas = document.getElementById('atlas-canvas');
const atlasReadout = document.getElementById('atlas-readout');
const scrollProgress = document.querySelector('.scroll-progress span');
const yaoBot = document.getElementById('yaobot');
const yaoBotTrigger = document.getElementById('yaobot-trigger');
const yaoBotPanel = document.getElementById('yaobot-panel');
const yaoBotFace = document.querySelector('.yaobot-face');
const yaoBotStatus = document.querySelector('[data-bot-status]');
const yaoBotLabel = document.querySelector('[data-bot-label]');
const petName = document.querySelector('[data-pet-name]');
const petTriggerName = document.querySelector('[data-pet-trigger-name]');
const petNote = document.querySelector('[data-pet-note]');
const petAvatars = [...document.querySelectorAll('.yaobot-avatar')];
let currentLang = 'en';
let currentCase = null;
let lastFocused = null;
let currentBotSection = 'top';
let botPoseTimer = null;
let botSleepTimer = null;
let botMicroExpressionTimer = null;

const copy = (en, zh) => ({ en, zh });

const botSectionCopy = {
  top: copy('Hello. I can help you browse Yao’s research story.', '你好，我可以帮你快速浏览杜瑶的研究主线。'),
  research: copy('You are following the research thread: layout → understanding → feedback data.', '你正在浏览研究主线：布局 → 共享理解 → 反馈数据。'),
  work: copy('These cards open into full case reports. Pick one to inspect.', '这些卡片都可以打开完整研究报告，选一个看看吧。'),
  profile: copy('This section condenses education, publications, methods, work, and recognition.', '这一部分汇总教育、论文、方法、工作与荣誉。'),
  contact: copy('You reached the end. Email is the best way to get in touch.', '你已经浏览到底部，邮件是最合适的联系方式。')
};

const botLabelCopy = {
  idle: copy('Website assistant', '网页小助手'),
  curious: copy('Following your cursor', '正在跟随光标'),
  thinking: copy('Opening the case', '正在打开案例'),
  happy: copy('Case ready', '案例已打开'),
  sleeping: copy('Taking a short pause', '暂时休息一下')
};

const petGuardians = {
  oreo: {
    name: 'Oreo',
    note: copy('Oreo is today\'s website assistant: quiet, observant, and ready to help.', '今天由奥利奥担任网页小助手：安静、敏锐，随时准备帮忙。')
  },
  qiuqiu: {
    name: 'Qiuqiu',
    note: copy('Qiuqiu is today\'s website assistant: warm, curious, and ready to help.', '今天由球球担任网页小助手：热情、好奇，随时准备帮忙。')
  }
};

function chooseGuardian() {
  if (!yaoBot) return;
  let previous = '';
  try { previous = localStorage.getItem('yao-portfolio-guardian') || ''; } catch (error) { previous = ''; }
  const key = previous === 'oreo' ? 'qiuqiu' : previous === 'qiuqiu' ? 'oreo' : (Math.random() < .5 ? 'oreo' : 'qiuqiu');
  const guardian = petGuardians[key];
  yaoBot.dataset.pet = key;
  if (petName) petName.textContent = guardian.name;
  if (petTriggerName) petTriggerName.textContent = guardian.name;
  if (petNote) {
    petNote.dataset.en = guardian.note.en;
    petNote.dataset.zh = guardian.note.zh;
  }
  if (yaoBotTrigger) yaoBotTrigger.setAttribute('aria-label', `Open ${guardian.name}, the website assistant`);
  try { localStorage.setItem('yao-portfolio-guardian', key); } catch (error) { /* Rotation still works for this visit. */ }
}

petAvatars.forEach((avatar) => {
  const useFallback = () => yaoBot?.classList.add('use-svg-fallback');
  avatar.addEventListener('error', useFallback);
  if (avatar.complete && !avatar.naturalWidth) useFallback();
});

const reports = {
  tochi: {
    meta: 'ACM TOCHI / FIRST AUTHOR / SUBMITTED AUGUST 2026',
    title: copy('Designing Corrective Feedback', '纠正性反馈界面设计'),
    deck: copy('How interface structure shapes user review, training data, and model outputs.', '界面结构如何塑造用户审查、训练数据与模型输出。'),
    facts: [
      ['ROLE', copy('First author / Research / Interface design / Evaluation', '第一作者 / 研究 / 界面设计 / 评估')],
      ['METHODS', copy('Behavior / Eye tracking / Record audit / Single-blind choice', '行为 / 眼动 / 记录审计 / 单盲选择')],
      ['STATUS', copy('Submitted to ACM TOCHI / manuscript available upon request', '已投稿 ACM TOCHI / 稿件可按需提供')]
    ],
    blocks: [
      { type: 'section', index: 'RESEARCH QUESTION', title: copy('Human feedback is not a ready-made signal. The interface helps produce it.', '人类反馈不是现成的信号，界面参与了它的产生。'), text: copy('Before feedback can become training data, a person must inspect an output, relate it to a goal, locate what failed, and decide how to repair it. This work asks what interface functions support that review and what remains in the resulting records.', '反馈成为训练数据之前，用户需要检查输出、关联任务目标、定位失败并决定如何修正。本研究关注界面功能如何支持这一过程，以及最终记录中保留了什么。') },
      { type: 'figure', src: 'assets/v2/tochi/fig1.png', alt: 'Interface, data, and model research chain', caption: copy('The interface-data-model chain examined across bounded study phases.', '在相互区分的研究阶段中考察界面-数据-模型链条。') },
      { type: 'section', index: 'INTERFACE DESIGN', title: copy('Support a progression from judgment to diagnosis to repair.', '支持从判断、诊断到修正的连续过程。'), text: copy('Ratings lower the entry cost. Labels make failure categories visible. Suggestions and direct editing support targeted correction. Persistent task criteria and uncertainty cues help reviewers compare an output with the intended goal.', '评分降低反馈门槛，标签使错误类别可见，建议与直接编辑支持针对性修正；持续可见的任务标准和不确定性提示帮助用户将输出与目标进行比较。') },
      { type: 'gallery', figures: [
        ['assets/v2/tochi/fig3.png', copy('Function-level feedback interface and eye-tracking areas of interest.', '功能级反馈界面与眼动兴趣区。')],
        ['assets/v2/tochi/fig4.png', copy('Observed review paths and the complementary roles of rating, labeling, and revision.', '实际反馈路径，以及评分、标签与修正的互补作用。')],
        ['assets/v2/tochi/fig5.png', copy('Visual attention remained centered on task content while feedback controls played a supporting role.', '视觉注意主要集中于任务内容，反馈控件发挥支持作用。')]
      ]},
      { type: 'stats', items: [
        ['1,026', copy('valid review records', '有效反馈记录')],
        ['80.7%', copy('with explicit confirmation, localization, or revision', '包含明确确认、定位或实质修正')],
        ['3,740', copy('tagged spans linked to source outputs', '与原始输出关联的标注片段')],
        ['924', copy('aligned records for matched LoRA adapters', '用于匹配 LoRA 适配器的对齐记录')]
      ]},
      { type: 'section', index: 'OUTPUT EVALUATION', title: copy('Reviewed-target outputs were chosen in 68.7% of trials.', '基于审查后目标训练的输出在 68.7% 的试次中更受偏好。'), text: copy('Thirty-one participants made 620 single-blind choices and gave higher ratings on target object, scene, constraint adherence, and style. This evidence applies to the tested task and targets; it is not a universal claim about fine-tuning methods.', '31 名参与者完成了 620 次单盲选择，并在目标物体、场景、约束遵循和风格维度给出更高评分。该结果针对本任务及其训练目标，不被扩展为对所有微调方法的普遍结论。') },
      { type: 'gallery', figures: [
        ['assets/v2/tochi/fig6.png', copy('Structured workflow for producing traceable review records.', '用于生成可追溯审查记录的结构化流程。')],
        ['assets/v2/tochi/fig7.png', copy('Full-corpus signal audit and aligned target-set construction.', '全语料信号审计与对齐目标集构建。')],
        ['assets/v2/tochi/fig9.png', copy('Output preference and dimensional evaluation from the submitted manuscript.', '投稿稿件中的输出偏好与分维度评价结果。')]
      ]},
      { type: 'contribution', title: copy('This study suggests that feedback interfaces can be examined through both immediate usability and the structure of the records they produce.', '这项研究提示，反馈界面既可以从即时可用性出发，也可以从其产生的记录结构进行考察。') }
    ]
  },
  thesis: {
    meta: 'MASTER\'S RESEARCH JOURNEY / SOUTHEAST UNIVERSITY / 2023-2026 / COMPLETED',
    title: copy('Interface Design and Interaction Optimization for RLHF', '面向 RLHF 的界面设计与交互优化'),
    deck: copy('One evolving research journey from large-screen cognitive load to shared mental models, feedback-interface evaluation, dataset construction, and model adaptation.', '一条持续演进的研究主线：从大屏认知负荷，到共享心智模型、反馈界面评估、数据集构建与模型适配。'),
    facts: [
      ['ROLE', copy('Research / Interface design / Experiment / Data analysis', '研究 / 界面设计 / 实验 / 数据分析')],
      ['METHODS', copy('Controlled study / Eye tracking / Behavior / NASA-TLX / SUS', '控制实验 / 眼动 / 行为 / NASA-TLX / SUS')],
      ['OUTPUTS', copy('Framework / Interface system / Dataset / LoRA comparison', '设计框架 / 界面系统 / 数据集 / LoRA 比较')]
    ],
    blocks: [
      { type: 'section', index: 'STARTING POINT', title: copy('The journey began with large-screen interfaces and cognitive load.', '这条研究主线始于大屏界面与认知负荷。'), text: copy('My early work examined how information quantity, visual boundaries, and layout affect search and workload. That experience led me from asking how people read complex interfaces to asking how interfaces help people understand, evaluate, and correct AI systems.', '早期研究考察信息数量、视觉边界和布局如何影响搜索与认知负荷。这段经历使我的问题从“人如何阅读复杂界面”逐步转向“界面如何帮助人理解、评价并修正 AI 系统”。') },
      { type: 'section', index: 'THE PROBLEM', title: copy('Preference identifies the better output, but often not what failed or how to repair it.', '偏好能够告诉模型哪个输出更好，却往往无法说明哪里失败、如何修正。'), text: copy('The thesis investigates whether interfaces grounded in shared mental models can make feedback more specific, traceable, and useful for later model adaptation. It treats the interface as part of the feedback-production system rather than a neutral wrapper.', '论文考察以共享心智模型为基础的界面，是否能让反馈更具体、更可追溯，并服务于后续模型适配。界面因此被视为反馈生产系统的一部分，而不是中性的外壳。') },
      { type: 'figure', src: 'assets/v4/research-framework-readable-en.svg', alt: 'Readable English master thesis research framework', caption: copy('Readable English redraw of the thesis framework. The conceptual relationships are preserved while every label follows a horizontal reading path.', '硕士论文研究框架的英文易读重绘版：保留概念关系，所有文字均按水平阅读路径呈现。') },
      { type: 'section', index: 'THEORY TO DESIGN', title: copy('Translate shared understanding into visible interface support.', '把共享理解转化为可见的界面支持。'), text: copy('Visible criteria, comparison, uncertainty cues, problem labels, and direct correction help align the user’s task model with system behavior. The design framework turns theoretical relationships into testable interface functions.', '可见任务标准、结果比较、不确定性提示、问题标签与直接修正，帮助用户任务模型与系统行为对齐；设计框架将理论关系转化为可测试的界面功能。') },
      { type: 'figure', src: 'assets/v3/english-figures/design-principles-en.png', alt: 'Seven English design principles for SMM-supported feedback interfaces', caption: copy('Seven principles translate the shared-mental-model framework into three interface-design modules.', '七项原则将共享心智模型框架转化为三个界面设计模块。') },
      { type: 'gallery', figures: [
        ['assets/v4/ijie/smm-framework-official.png', copy('Published high-resolution framework comparing baseline and SMM-supported interfaces.', '已发表论文中的高清框架图：对比基线界面与共享心智模型支持界面。')],
        ['assets/v2/tochi/fig3.png', copy('Feedback interface and eye-tracking areas of interest used in the later evaluation.', '后续评估所使用的反馈界面与眼动兴趣区。')],
        ['assets/v4/heatmap-comparison-readable-en.svg', copy('Readable schematic of the attention pattern; the quantitative eye-tracking results are presented separately.', '用于说明注意分布的易读示意图；定量眼动结果另行呈现。')],
        ['assets/v3/english-figures/eye-metrics-en.png', copy('Fixation duration and attention distribution across interface areas.', '不同界面区域的注视时长与注意分布。')]
      ]},
      { type: 'section', index: 'FROM INTERACTION TO DATA', title: copy('Keep the source, diagnosis, and correction connected.', '让原始输出、问题诊断与修正结果保持关联。'), text: copy('The deployed workflow combined candidate comparison, uncertainty highlighting, problem labels, and direct correction. Each record retained enough context to audit how a final target related to the original output and participant actions.', '实际工作流结合候选项比较、不确定性高亮、问题标签和直接修正。每条记录保留足够上下文，以审计最终目标与原始输出、参与者操作之间的关系。') },
      { type: 'figure', src: 'assets/v4/dataset-pipeline-readable-en.svg', alt: 'Readable English interface-mediated feedback dataset pipeline', caption: copy('Readable vector reconstruction of the pipeline connecting AI output, structured human review, and model adaptation.', '以易读矢量图重绘数据流程，连接 AI 输出、结构化人工审查与模型适配。') },
      { type: 'gallery', figures: [
        ['assets/v3/english-figures/collection-flow-en.png', copy('Formal collection flow linking review and saved targets.', '连接审查过程与保存目标的正式采集流程。')],
        ['assets/v3/english-figures/label-feedback-en.png', copy('Label feedback and alternative revision module.', '标签反馈与备选方案修正模块。')],
        ['assets/v3/english-figures/data-quality-en.png', copy('Cleaning and supervision-strength audit.', '清洗与监督强度审计。')]
      ]},
      { type: 'stats', items: [
        ['1,026', copy('valid feedback records', '有效反馈记录')],
        ['828', copy('strong-signal records in thesis analysis', '论文分析中的强信号记录')],
        ['2×3', copy('controlled interface study', '界面控制实验')],
        ['Qwen2.5-7B', copy('LoRA model adaptation', 'LoRA 模型适配')]
      ]},
      { type: 'section', index: 'OUTCOME', title: copy('The project led me to treat the interface as part of the research object.', '这项研究使我开始把界面本身视为研究对象的一部分。'), text: copy('The thesis connects theory, interaction design, multimethod evaluation, dataset construction, and model-level comparison. Through this process, I developed a more complete way to study how feedback interfaces shape human review and the records produced afterward.', '论文连接理论、交互设计、多方法评估、数据集构建与模型层比较。通过这一过程，我逐步形成了研究反馈界面如何影响人类审查及后续数据记录的完整思路。') },
      { type: 'gallery', figures: [
        ['assets/v3/english-figures/preference-en.png', copy('Overall output preference.', '总体输出偏好。')],
        ['assets/v3/english-figures/dimension-scores-en.png', copy('Ratings across evaluation dimensions.', '不同评价维度的评分。')]
      ]},
      { type: 'contribution', title: copy('The thesis provides an initial theory-informed framework for designing and evaluating structured human-feedback interfaces.', '论文形成了一套初步的理论驱动框架，用于设计与评价结构化人类反馈界面。') }
    ]
  },
  hcii: {
    meta: 'HCII 2025 / HUMAN FACTORS / CORE TEAM MEMBER',
    title: copy('Leadership Cockpit HMI', '领导驾驶舱人机界面优化'),
    deck: copy('Turning cognitive-load evidence into large-screen information-design decisions.', '把认知负荷证据转化为大屏信息设计决策。'),
    facts: [
      ['ROLE', copy('Interface prototypes / Experiment / Design translation', '界面原型 / 实验 / 设计转化')],
      ['DESIGN', copy('3 layouts × 3 chart counts × 5 border styles', '3 种布局 × 3 种图表数量 × 5 种边框样式')],
      ['OUTPUT', copy('HCII 2025 first-author paper', 'HCII 2025 第一作者论文')]
    ],
    blocks: [
      { type: 'section', index: 'THE QUESTION', title: copy('More information does not automatically produce faster decisions.', '更多信息并不必然带来更快的决策。'), text: copy('This project examined how chart quantity, border style, and page layout influence cognitive load and visual search in leadership-cockpit interfaces. I contributed interface prototypes, experimental design, and the translation of findings into visualization and layout guidance.', '项目考察图表数量、边框样式和页面布局如何影响领导驾驶舱中的认知负荷与视觉搜索。我参与界面原型、实验设计，以及将研究发现转化为可视化和布局指导。') },
      { type: 'figure', src: 'assets/v2/leadership/overview.webp', alt: 'Original leadership cockpit interface overview', caption: copy('A public overview of the implemented leadership-cockpit interface.', '已落地领导驾驶舱界面的可公开总览。') },
      { type: 'stats', items: [
        ['32', copy('participants recruited', '招募参与者')],
        ['90', copy('visual-search trials per participant', '每位参与者完成的视觉搜索试次')],
        ['7.2 m', copy('large-screen display width', '实验大屏宽度')],
        ['3×3×5', copy('within-subject design', '被试内实验设计')]
      ]},
      { type: 'section', index: 'DESIGN TRANSLATION', title: copy('Evidence was translated into hierarchy, grouping, and layout rules.', '研究证据被转化为信息层级、分组与布局规则。'), text: copy('The result was not a single screen treatment but a set of principles for balancing information density, visual boundaries, and search efficiency across large-screen scenarios.', '结果不是单一屏幕的视觉方案，而是一组在不同大屏场景中平衡信息密度、视觉边界和搜索效率的原则。') },
      { type: 'gallery', figures: [
        ['assets/v2/leadership/process.webp', copy('The design system, information hierarchy, and interface modules.', '设计系统、信息层级与界面模块。')],
        ['assets/v2/leadership/results.webp', copy('Delivered screens, visual assets, and project outcomes.', '交付界面、视觉资产与项目成果。')]
      ]},
      { type: 'section', index: 'ORIGINAL SCREEN ARCHIVE', title: copy('Ten original screens document the breadth of the large-screen system.', '十张原始界面记录了大屏系统的完整覆盖范围。'), text: copy('The two boards above carry the main narrative. The complete set below remains available as a secondary visual archive, so the case stays readable without hiding the breadth of the design work.', '上方两张总览图承担主要叙事；下方完整界面作为次级视觉档案，既保持案例可读性，也不隐藏设计工作的覆盖范围。') },
      { type: 'strip', presentation: 'folder', label: copy('Leadership cockpit screen archive', '领导驾驶舱界面档案'), figures: [
        ['assets/v4/leadership-ui/screen-1.png', copy('Original leadership cockpit screen 01.', '领导驾驶舱原始界面 01。')],
        ['assets/v4/leadership-ui/screen-2.png', copy('Original leadership cockpit screen 02.', '领导驾驶舱原始界面 02。')],
        ['assets/v4/leadership-ui/screen-3.png', copy('Original leadership cockpit screen 03.', '领导驾驶舱原始界面 03。')],
        ['assets/v4/leadership-ui/screen-4.png', copy('Original leadership cockpit screen 04.', '领导驾驶舱原始界面 04。')],
        ['assets/v4/leadership-ui/screen-5.png', copy('Original leadership cockpit screen 05.', '领导驾驶舱原始界面 05。')],
        ['assets/v4/leadership-ui/screen-6.png', copy('Original leadership cockpit screen 06.', '领导驾驶舱原始界面 06。')],
        ['assets/v4/leadership-ui/screen-7.png', copy('Original leadership cockpit screen 07.', '领导驾驶舱原始界面 07。')],
        ['assets/v4/leadership-ui/screen-8.png', copy('Original leadership cockpit screen 08.', '领导驾驶舱原始界面 08。')],
        ['assets/v4/leadership-ui/screen-9.png', copy('Original leadership cockpit screen 09.', '领导驾驶舱原始界面 09。')],
        ['assets/v4/leadership-ui/screen-10.png', copy('Original leadership cockpit screen 10.', '领导驾驶舱原始界面 10。')]
      ]},
      { type: 'section', index: 'RESULT', title: copy('Six to ten charts increased mean search time from 10.94 s to 15.06 s.', '图表数量从 6 增加到 10 时，平均搜索时间由 10.94 秒升至 15.06 秒。'), text: copy('Grouped left- or right-side arrangements were more efficient than distributed layouts. Clear dividers with minimal visual decoration produced the fastest search performance, directly informing the interface hierarchy and grouping strategy.', '集中在左侧或右侧的布局比离散布局更高效；采用清晰分隔线且减少装饰的边框样式获得最快搜索表现，并直接影响后续界面的层级与分组策略。') },
      { type: 'contribution', title: copy('This project taught me how experimental findings can be translated into concrete interface decisions.', '这个项目让我学习了如何把实验发现转化为具体的界面设计决策。') }
    ]
  },
  ijie: {
    meta: 'INTERNATIONAL JOURNAL OF INDUSTRIAL ERGONOMICS / 2026 / FIRST AUTHOR',
    title: copy('Shared Mental Models as Cognitive Scaffolds', '作为认知支架的共享心智模型'),
    deck: copy('Optimizing interface design for human-in-the-loop alignment tasks.', '优化人在回路对齐任务中的界面设计。'),
    facts: [
      ['JOURNAL', copy('International Journal of Industrial Ergonomics, 114, 103955', 'International Journal of Industrial Ergonomics, 114, 103955')],
      ['ROLE', copy('First author', '第一作者')],
      ['DOI', copy('10.1016/j.ergon.2026.103955', '10.1016/j.ergon.2026.103955')],
      ['EVIDENCE', copy('Behavior / Eye tracking / NASA-TLX', '行为 / 眼动 / NASA-TLX')]
    ],
    blocks: [
      { type: 'section', index: 'RESEARCH IDEA', title: copy('Interfaces can act as cognitive scaffolds between the user’s task model and system behavior.', '界面可以成为连接用户任务模型与系统行为的认知支架。'), text: copy('The work integrates behavioral, eye-tracking, and workload evidence to examine how interface support changes review behavior in human-in-the-loop alignment tasks.', '研究整合行为、眼动与工作负荷证据，考察界面支持如何改变人在回路对齐任务中的审查行为。') },
      { type: 'figure', src: 'assets/v4/ijie/smm-framework-official.png', alt: 'High-resolution published conceptual framework of SMM-supported interaction', caption: copy('High-resolution figure extracted from the published article, contrasting baseline and SMM-supported interfaces.', '从正式发表论文中提取的高清图，对比基线界面与共享心智模型支持界面。') },
      { type: 'stats', items: [
        ['30', copy('participants', '参与者')],
        ['2×3', copy('within-subject experiment', '被试内实验')],
        ['6', copy('interface × feedback conditions', '界面与反馈组合条件')],
        ['SMM', copy('goal, uncertainty, and decision cues', '目标、不确定性与决策线索')]
      ]},
      { type: 'section', index: 'KEY FINDING', title: copy('Transparency changed when and where people spent effort.', '透明性改变了用户投入认知努力的时机与位置。'), text: copy('SMM support increased early information engagement but reduced hesitation during choice execution. Structured annotation emerged as the interaction sweet spot, balancing user agency with cognitive effort more effectively than choice-only or conversational guidance.', '共享心智模型支持增加了早期信息投入，却降低了选择执行阶段的犹豫；结构化标注成为兼顾用户能动性与认知成本的交互“甜点位”。') },
      { type: 'section', index: 'RESEARCH THROUGH-LINE', title: copy('This study became a starting point for my later feedback-data research.', '这项研究成为我后续反馈数据研究的一个起点。'), text: copy('It helped me connect human factors and interface design with a larger question: how should a system make task goals, uncertainty, and corrective actions legible to a reviewer?', '它帮助我把人因与界面设计连接到一个更大的问题：系统应如何让任务目标、不确定性和修正行动对审查者清晰可见？') },
      { type: 'contribution', title: copy('The study introduced me to shared mental models as a lens for designing and evaluating human-AI feedback interfaces.', '这项研究使我开始使用共享心智模型来理解和评价人机反馈界面。') }
    ]
  },
  platform: {
    meta: 'SYSTEM DESIGN / FEB 2024-JAN 2026 / COMPLETED',
    title: copy('Confidential Application Platform', '保密应用平台项目'),
    deck: copy('A privacy-safe view of a complete software-interface workflow, using only the public examples supplied for this portfolio.', '使用已提供的可公开示例，对完整软件界面工作流进行隐私安全展示。'),
    facts: [
      ['ROLE', copy('Core team member', '核心团队成员')],
      ['SCOPE', copy('Architecture / Interaction logic / Visual design / Delivery', '架构 / 交互逻辑 / 视觉设计 / 交付')],
      ['PRIVACY', copy('Public examples shown / Sensitive content omitted', '展示可公开示例 / 隐去敏感内容')]
    ],
    blocks: [
      { type: 'section', index: 'PUBLIC SCOPE', title: copy('Organizing complex tasks into a coherent system.', '将复杂任务组织为连贯的系统。'), text: copy('I contributed to system architecture, task-flow mapping, interaction logic, visual design, and interface delivery across the complete workflow. The examples below are the public materials supplied for this portfolio. Sensitive operational content remains omitted.', '我参与了完整流程的系统架构、任务流梳理、交互逻辑、视觉设计与界面交付。下方仅使用已为本作品集提供的公开材料，敏感业务内容仍予以隐去。') },
      { type: 'section', index: 'PUBLIC INTERFACE EXAMPLES', title: copy('The public screens show how files, experimental materials, and participant tasks were organized.', '可公开界面展示了文件、实验材料与参与者任务的组织方式。'), text: copy('These examples demonstrate information architecture and interaction states without disclosing restricted project content.', '这些示例用于说明信息架构与交互状态，不披露受限项目内容。') },
      { type: 'gallery', presentation: 'folder', label: copy('Public interface files', '可公开界面文件'), figures: [
        ['assets/v4/platform/interface-1.png', copy('Public example: file and material management.', '可公开示例：文件与材料管理。')],
        ['assets/v4/platform/interface-2.png', copy('Public example: experimental-material configuration.', '可公开示例：实验材料配置。')],
        ['assets/v4/platform/interface-3.png', copy('Public example: participant selection and task setup.', '可公开示例：参与者选择与任务设置。')]
      ]},
      { type: 'section', index: 'COMPONENT SYSTEM', title: copy('Reusable components kept the long workflow consistent.', '可复用组件保证了长流程的一致性。'), text: copy('The component archive records controls, states, tables, progress patterns, and review modules used across the system.', '组件档案记录了系统中的控件、状态、表格、进度模式与审查模块。') },
      { type: 'gallery', presentation: 'folder', label: copy('Component archive', '组件档案'), figures: [
        ['assets/v4/platform/component-1.png', copy('Public component archive 01.', '可公开组件档案 01。')],
        ['assets/v4/platform/component-2.png', copy('Public component archive 02.', '可公开组件档案 02。')],
        ['assets/v4/platform/component-3.png', copy('Public component archive 03.', '可公开组件档案 03。')]
      ]},
      { type: 'contribution', title: copy('The project strengthened my ability to translate a complex workflow into an organized, testable, and deliverable interface system.', '这个项目强化了我把复杂工作流转化为有组织、可测试、可交付界面系统的能力。') }
    ]
  },
  seat: {
    meta: 'INDUSTRIAL DESIGN / CATIA / MAY-OCT 2022 / COMPLETED',
    title: copy('Driver Seat Static Comfort Evaluation', '驾驶座椅静态舒适性评价'),
    deck: copy('From point-cloud data to consistent, reusable digital assets.', '从点云数据到一致、可复用的数字资产。'),
    facts: [
      ['ROLE', copy('Core team member / 3D modeling / Documentation', '核心成员 / 三维建模 / 文档')],
      ['TOOLS', copy('CATIA / Point-cloud processing', 'CATIA / 点云处理')],
      ['OUTPUT', copy('Standardized enterprise model library', '标准化企业模型库')]
    ],
    blocks: [
      { type: 'section', index: 'FROM PHYSICAL TO DIGITAL', title: copy('Standardize geometry before it becomes an enterprise asset.', '在几何形态进入企业资产库之前完成标准化。'), text: copy('The project converted point-cloud data into standardized 3D driver-seat models in CATIA. I contributed modeling, documentation, and consistency checks so assets from different sources could enter a reusable enterprise digital library.', '项目将点云数据转换为 CATIA 中的标准化三维驾驶座椅模型。我参与建模、文档与一致性检查，使来自不同来源的资产能够进入可复用的企业数字模型库。') },
      { type: 'gallery', figures: [
        ['assets/v2/seat/physical.webp', copy('Physical seat and measurement context.', '实体座椅与测量场景。')],
        ['assets/v2/seat/scan.webp', copy('Point-cloud and reconstruction process.', '点云与重建过程。')],
        ['assets/v2/seat/model.webp', copy('Standardized digital seat model.', '标准化数字座椅模型。')]
      ]},
      { type: 'contribution', title: copy('This early project developed my skills in precise modeling, documentation, and reusable digital assets.', '这个早期项目训练了我在精确建模、文档整理与可复用数字资产方面的能力。') }
    ]
  },
  awards: {
    meta: 'RECOGNITION ARCHIVE / 2019-2026 / AWARD RECORDS',
    title: copy('Scholarships, Competitions, and Service', '奖学金、竞赛与公共服务'),
    deck: copy('A categorized record of sustained academic performance, design execution, innovation, leadership, and service.', '对持续学业表现、设计执行、创新实践、领导力与公共服务的分类记录。'),
    facts: [
      ['ARCHIVE', copy('25+ supporting credentials', '25 项以上证明材料')],
      ['LEVELS', copy('International / National / Municipal / University', '国际 / 国家 / 市级 / 校级')],
      ['PRIVACY', copy('Certificate scans kept offline', '证书扫描件不公开')]
    ],
    blocks: [
      { type: 'section', index: 'NATIONAL', title: copy('National-level scholarships and innovation competitions.', '国家级奖学金与创新竞赛。'), text: copy('National Scholarship; National Encouragement Scholarship; Gold Award in the 7th China International “Internet+” Innovation and Entrepreneurship Competition; Bronze Award in the 13th “Challenge Cup” Entrepreneurial Plan Competition; first prize in the Maker China New Energy Innovation Competition; iCAN national third prize; Advanced Mapping national third prize; and excellent completion of a National Entrepreneurship Training Project.', '国家奖学金、国家励志奖学金、第七届中国国际“互联网+”大学生创新创业大赛金奖、第十三届“挑战杯”创业计划竞赛铜奖、“创客中国”新能源创新创业大赛一等奖、iCAN 全国三等奖、先进成图全国三等奖，以及国家级创业训练项目优秀结项。') },
      { type: 'section', index: 'MUNICIPAL', title: copy('Recognition for innovation capability.', '创新能力与实践表现获得市级认可。'), text: copy('Named an Advanced Individual in Innovation Capability Improvement of Chongqing Municipality.', '获评重庆市创新能力提升先进个人。') },
      { type: 'section', index: 'UNIVERSITY', title: copy('Academic excellence and student leadership.', '学业表现与学生领导力。'), text: copy('Outstanding Graduate of Southeast University; Outstanding Postgraduate Cadre; multiple First- and Second-Class Academic Scholarships at Chongqing University; Cien Scholarship; innovation and technology awards; Outstanding League Member; and Excellent Youth League Cadre.', '东南大学优秀毕业研究生、优秀研究生干部；重庆大学多次一等与二等奖学金、慈恩奖学金、创新与科技类荣誉、优秀共青团员及优秀团干部。') },
      { type: 'section', index: 'SERVICE', title: copy('Public service as organized, reliable work.', '把公共服务当作有组织、可交付的工作。'), text: copy('Graduate Union service at Southeast University; volunteer leadership for the Chongqing Changjiahui Half Marathon; public-health volunteer service; and service for the China International “Internet+” Competition.', '东南大学研究生会服务、重庆长嘉汇半程马拉松志愿服务负责人、公共卫生志愿服务，以及中国国际“互联网+”大赛志愿服务。') },
      { type: 'contribution', title: copy('These records summarize my academic performance, competition experience, teamwork, and service during university.', '这些记录概括了我在大学期间的学业表现、竞赛经历、团队协作与公共服务。') }
    ]
  }
};

const nodeNotes = {
  understanding: copy('Shared mental models help reviewers align task goals with system behavior.', '共享心智模型帮助审查者对齐任务目标与系统行为。'),
  feedback: copy('Ratings, labels, suggestions, and editing support different levels of correction.', '评分、标签、建议和编辑支持不同层级的修正。'),
  core: copy('The interface is part of the feedback-production system.', '界面是反馈生产系统的一部分。'),
  evidence: copy('Behavior, gaze, workload, and usability reveal different parts of review work.', '行为、视线、负荷与可用性揭示审查工作的不同侧面。'),
  dataset: copy('Traceable records keep source, diagnosis, and correction connected.', '可追溯记录让原始输出、诊断与修正保持关联。'),
  model: copy('Matched adapters test how reviewed targets relate to downstream outputs.', '匹配适配器用于检验审查后目标与下游输出之间的关系。'),
  hmi: copy('Human-factors evidence also guides information density and visual hierarchy.', '人因证据同样指导信息密度和视觉层级。')
};

function tr(value) {
  return typeof value === 'string' ? value : value[currentLang];
}

function updateBotText() {
  if (!yaoBot) return;
  const state = yaoBot.dataset.state || 'idle';
  if (yaoBotStatus) yaoBotStatus.textContent = tr(botSectionCopy[currentBotSection] || botSectionCopy.top);
  if (yaoBotLabel) yaoBotLabel.textContent = tr(botLabelCopy[state] || botLabelCopy.idle);
}

function setBotState(state, hold = 0) {
  if (!yaoBot) return;
  window.clearTimeout(botPoseTimer);
  yaoBot.dataset.state = state;
  updateBotText();
  if (hold > 0) {
    botPoseTimer = window.setTimeout(() => {
      yaoBot.dataset.state = yaoBot.classList.contains('is-open') ? 'curious' : 'idle';
      updateBotText();
    }, hold);
  }
}

function resetBotSleepTimer() {
  if (!yaoBot) return;
  window.clearTimeout(botSleepTimer);
  if (yaoBot.dataset.state === 'sleeping') setBotState('idle');
  botSleepTimer = window.setTimeout(() => {
    if (!yaoBot.classList.contains('is-open') && !overlay.classList.contains('is-open')) setBotState('sleeping', 1600);
  }, 18000);
}

function scheduleBotMicroExpression() {
  if (!yaoBot) return;
  window.clearTimeout(botMicroExpressionTimer);
  botMicroExpressionTimer = window.setTimeout(() => {
    if (!yaoBot.classList.contains('is-open') && !overlay.classList.contains('is-open') && yaoBot.dataset.state === 'idle') {
      setBotState(Math.random() > .46 ? 'happy' : 'curious', 1050);
    }
    scheduleBotMicroExpression();
  }, 5400 + Math.random() * 3600);
}

function updateLanguage() {
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-en][data-zh]').forEach((element) => {
    element.textContent = element.dataset[currentLang];
  });
  langButton.classList.toggle('is-zh', currentLang === 'zh');
  if (currentCase) renderReport(currentCase);
  updateBotText();
}

langButton.addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'zh' : 'en';
  updateLanguage();
});

function reportBlockHtml(block, blockIndex) {
  if (block.type === 'section') {
    return `<section class="report-section"><p class="report-index">${block.index}</p><div class="report-body"><h3>${tr(block.title)}</h3><p>${tr(block.text)}</p></div></section>`;
  }
  if (block.type === 'figure') {
    return `<figure class="report-figure"><img src="${block.src}" alt="${block.alt}" loading="lazy" decoding="async"><figcaption><span>${tr(block.caption)}</span></figcaption></figure>`;
  }
  if ((block.type === 'gallery' || block.type === 'strip') && block.presentation === 'folder') {
      const folderId = `report-folder-${currentCase}-${blockIndex}`;
      const fileCount = block.figures.length;
      const fileLabel = currentLang === 'en' ? `${fileCount} files` : `${fileCount} 个文件`;
      const openLabel = currentLang === 'en' ? 'View files' : '查看文件';
      const previewIndexes = fileCount > 3 ? [0, Math.floor(fileCount / 2), fileCount - 1] : block.figures.map((_, index) => index);
      return `<section class="report-folder" data-report-folder>
        <button class="report-folder-trigger" type="button" aria-expanded="false" aria-controls="${folderId}" data-folder-trigger>
          <span class="report-folder-papers" aria-hidden="true">${previewIndexes.map(index => `<i style="--preview-index:${index}"><img src="${block.figures[index][0]}" alt="" loading="lazy" decoding="async"></i>`).join('')}</span>
          <span class="report-folder-cover">
            <span><strong>${tr(block.label)}</strong><small>${fileLabel}</small></span>
            <em>${openLabel}<b>+</b></em>
          </span>
        </button>
        <div class="report-folder-files" id="${folderId}" aria-hidden="true">
          ${block.figures.map((figure, index) => `<figure style="--file-index:${index}"><span>${String(index + 1).padStart(2, '0')}</span><img src="${figure[0]}" alt="${tr(figure[1])}" loading="lazy" decoding="async"><figcaption>${tr(figure[1])}</figcaption></figure>`).join('')}
        </div>
      </section>`;
  }
  if (block.type === 'gallery') {
    return `<div class="report-gallery">${block.figures.map((figure, index) => `<figure class="${block.figures.length % 2 === 1 && index === 0 ? 'wide' : ''}"><img src="${figure[0]}" alt="${tr(figure[1])}" loading="lazy" decoding="async"><figcaption>${tr(figure[1])}</figcaption></figure>`).join('')}</div>`;
  }
  if (block.type === 'strip') {
    return `<div class="report-strip" tabindex="0" aria-label="${currentLang === 'en' ? 'Scrollable original screen archive' : '可横向滚动的原始界面档案'}">${block.figures.map((figure, index) => `<figure><span>${String(index + 1).padStart(2, '0')}</span><img src="${figure[0]}" alt="${tr(figure[1])}" loading="lazy" decoding="async"><figcaption>${tr(figure[1])}</figcaption></figure>`).join('')}</div>`;
  }
  if (block.type === 'stats') {
    return `<section class="report-stats">${block.items.map(item => `<div><b>${item[0]}</b><span>${tr(item[1])}</span></div>`).join('')}</section>`;
  }
  if (block.type === 'contribution') {
    return `<section class="report-contribution"><p>${currentLang === 'en' ? 'TAKEAWAY' : '研究所得'}</p><h3>${tr(block.title)}</h3></section>`;
  }
  return '';
}

function renderReport(caseName) {
  const report = reports[caseName];
  if (!report) return;
  modalContent.innerHTML = `
    <header class="report-hero">
      <div><p class="report-meta">${report.meta}</p><h2 id="modal-title">${tr(report.title)}</h2><p class="report-deck">${tr(report.deck)}</p></div>
      <dl>${report.facts.map(fact => `<div><dt>${fact[0]}</dt><dd>${tr(fact[1])}</dd></div>`).join('')}</dl>
    </header>
    ${report.blocks.map(reportBlockHtml).join('')}
  `;
}

function openReport(caseName, trigger) {
  if (!reports[caseName]) return;
  lastFocused = trigger || document.activeElement;
  currentCase = caseName;
  renderReport(caseName);
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
  overlay.querySelector('.case-modal').scrollTop = 0;
  history.replaceState(null, '', `#case-${caseName}`);
  setBotState('thinking');
  window.setTimeout(() => setBotState('happy'), 420);
  requestAnimationFrame(() => modalContent.focus({ preventScroll: true }));
}

function closeReport() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
  caseModal?.classList.remove('is-pointer-active');
  currentCase = null;
  if (location.hash.startsWith('#case-')) history.replaceState(null, '', '#work');
  if (lastFocused) lastFocused.focus();
  setBotState('curious', 900);
}

modalContent.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-folder-trigger]');
  if (!trigger) return;
  const folder = trigger.closest('[data-report-folder]');
  const isOpen = folder.classList.toggle('is-open');
  trigger.setAttribute('aria-expanded', String(isOpen));
  const files = folder.querySelector('.report-folder-files');
  if (files) files.setAttribute('aria-hidden', String(!isOpen));
  const action = trigger.querySelector('em');
  if (action) action.childNodes[0].textContent = currentLang === 'en'
    ? (isOpen ? 'Hide files' : 'View files')
    : (isOpen ? '收起文件' : '查看文件');
});

if (caseModal && modalCursorLight) {
  caseModal.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = caseModal.getBoundingClientRect();
    caseModal.style.setProperty('--modal-pointer-x', `${event.clientX - bounds.left + caseModal.scrollLeft}px`);
    caseModal.style.setProperty('--modal-pointer-y', `${event.clientY - bounds.top + caseModal.scrollTop}px`);
    caseModal.classList.add('is-pointer-active');
  }, { passive: true });
  caseModal.addEventListener('pointerleave', () => caseModal.classList.remove('is-pointer-active'));
}

document.querySelectorAll('[data-case]').forEach((trigger) => {
  trigger.addEventListener('click', () => openReport(trigger.dataset.case, trigger));
});
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeReport));
overlay.addEventListener('click', (event) => { if (event.target === overlay) closeReport(); });
document.addEventListener('keydown', (event) => {
  if (!overlay.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    closeReport();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...overlay.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute('disabled'));
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

if (yaoBot && yaoBotTrigger && yaoBotPanel) {
  const setBotOpen = (open) => {
    yaoBot.classList.toggle('is-open', open);
    yaoBotTrigger.setAttribute('aria-expanded', String(open));
    yaoBotPanel.setAttribute('aria-hidden', String(!open));
    setBotState(open ? 'happy' : 'idle', open ? 680 : 0);
  };

  yaoBotTrigger.addEventListener('click', () => setBotOpen(!yaoBot.classList.contains('is-open')));
  yaoBotPanel.querySelectorAll('a, button').forEach((control) => {
    control.addEventListener('pointerenter', () => setBotState('curious'));
    control.addEventListener('click', () => {
      if (!control.hasAttribute('data-case')) setBotOpen(false);
    });
  });
  document.addEventListener('pointerdown', (event) => {
    if (!yaoBot.contains(event.target)) setBotOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && yaoBot.classList.contains('is-open')) {
      setBotOpen(false);
      yaoBotTrigger.focus();
    }
  });

  let eyeTargetX = 0;
  let eyeTargetY = 0;
  let eyeCurrentX = 0;
  let eyeCurrentY = 0;
  let headTargetX = 0;
  let headTargetY = 0;
  let headTargetRotate = 0;
  let headCurrentX = 0;
  let headCurrentY = 0;
  let headCurrentRotate = 0;
  let headVelocityX = 0;
  let headVelocityY = 0;
  let headVelocityRotate = 0;
  let eyeFrame = null;
  let lastPointerPoseAt = 0;
  const animateFace = () => {
    eyeCurrentX += (eyeTargetX - eyeCurrentX) * .2;
    eyeCurrentY += (eyeTargetY - eyeCurrentY) * .2;
    headVelocityX = (headVelocityX + (headTargetX - headCurrentX) * .11) * .72;
    headVelocityY = (headVelocityY + (headTargetY - headCurrentY) * .11) * .72;
    headVelocityRotate = (headVelocityRotate + (headTargetRotate - headCurrentRotate) * .1) * .7;
    headCurrentX += headVelocityX;
    headCurrentY += headVelocityY;
    headCurrentRotate += headVelocityRotate;
    yaoBotFace.style.setProperty('--look-x', `${eyeCurrentX.toFixed(2)}px`);
    yaoBotFace.style.setProperty('--look-y', `${eyeCurrentY.toFixed(2)}px`);
    yaoBotFace.style.setProperty('--head-x', `${headCurrentX.toFixed(2)}px`);
    yaoBotFace.style.setProperty('--head-y', `${headCurrentY.toFixed(2)}px`);
    yaoBotFace.style.setProperty('--head-rotate', `${headCurrentRotate.toFixed(2)}deg`);
    const eyeMoving = Math.abs(eyeTargetX - eyeCurrentX) > .04 || Math.abs(eyeTargetY - eyeCurrentY) > .04;
    const headMoving = Math.abs(headTargetX - headCurrentX) > .03 || Math.abs(headTargetY - headCurrentY) > .03 || Math.abs(headTargetRotate - headCurrentRotate) > .03 || Math.abs(headVelocityX) > .02 || Math.abs(headVelocityY) > .02 || Math.abs(headVelocityRotate) > .02;
    if (eyeMoving || headMoving) {
      eyeFrame = requestAnimationFrame(animateFace);
    } else {
      eyeFrame = null;
    }
  };

  const requestFaceFrame = () => {
    if (!eyeFrame) eyeFrame = requestAnimationFrame(animateFace);
  };

  const prefersReducedBotMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const trackPointer = (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = yaoBotFace.getBoundingClientRect();
      const dx = event.clientX - (bounds.left + bounds.width / 2);
      const dy = event.clientY - (bounds.top + bounds.height / 2);
      const pointerDistance = Math.max(1, Math.hypot(dx, dy));
      const gazeStrength = Math.min(1, pointerDistance / 72);
      const directionX = dx / pointerDistance;
      const directionY = dy / pointerDistance;
      const faceScale = bounds.width / 100;
      const isQiuqiu = yaoBot.dataset.pet === 'qiuqiu';
      // Each pupil travels within the painted white socket in its own avatar.
      // Oreo's sockets are narrower and lower than Qiuqiu's, so its travel is tighter.
      const horizontalTravel = (isQiuqiu ? 2 : 1.35) * faceScale;
      const verticalTravel = (isQiuqiu ? 3 : 2.1) * faceScale;
      eyeTargetX = directionX * horizontalTravel * gazeStrength;
      eyeTargetY = directionY * verticalTravel * gazeStrength;
      headTargetX = prefersReducedBotMotion ? 0 : directionX * 3.4 * gazeStrength;
      headTargetY = prefersReducedBotMotion ? 0 : directionY * 2.2 * gazeStrength;
      headTargetRotate = prefersReducedBotMotion ? 0 : directionX * 3.5 * gazeStrength;
      requestFaceFrame();
      const now = performance.now();
      if (now - lastPointerPoseAt > 420 && !['thinking', 'happy'].includes(yaoBot.dataset.state)) {
        lastPointerPoseAt = now;
        setBotState('curious', 880);
      }
      resetBotSleepTimer();
  };
  window.addEventListener('pointermove', trackPointer, { passive: true });
  if (!('PointerEvent' in window)) window.addEventListener('mousemove', trackPointer, { passive: true });
  const centerBotGaze = () => {
    eyeTargetX = 0;
    eyeTargetY = 0;
    headTargetX = 0;
    headTargetY = 0;
    headTargetRotate = 0;
    requestFaceFrame();
  };
  document.documentElement.addEventListener('mouseleave', centerBotGaze);
  window.addEventListener('blur', centerBotGaze);

  ['pointerdown', 'keydown', 'scroll'].forEach((eventName) => {
    document.addEventListener(eventName, resetBotSleepTimer, { passive: true });
  });
  resetBotSleepTimer();
  scheduleBotMicroExpression();
}

const observedSections = [...document.querySelectorAll('main > section[id]')];
if ('IntersectionObserver' in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    currentBotSection = visible.target.id;
    updateBotText();
    document.querySelectorAll('.site-header nav a, .pro-index a').forEach((link) => {
      const isActive = link.getAttribute('href') === `#${currentBotSection}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-25% 0px -58%', threshold: [0, .2, .45] });
  observedSections.forEach((section) => sectionObserver.observe(section));
}

// Pro presentation interactions: progressive disclosure, pointer-aware surfaces,
// and a lightweight step-player treatment. These do not change site content.
const proReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const proRevealTargets = [...document.querySelectorAll([
  '.section-heading',
  '.story-layout',
  '.case-card',
  '.research-archive',
  '.profile-block',
  '.contact-section > *'
].join(','))];

if (!proReducedMotion && 'IntersectionObserver' in window) {
  proRevealTargets.forEach((target, index) => {
    target.classList.add('pro-reveal');
    target.style.transitionDelay = `${Math.min(index % 3, 2) * 70}ms`;
  });
  const proRevealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8%', threshold: .08 });
  proRevealTargets.forEach((target) => proRevealObserver.observe(target));
} else {
  proRevealTargets.forEach((target) => target.classList.add('is-visible'));
}

document.querySelectorAll('.case-card, .profile-block, .story-figure').forEach((surface) => {
  surface.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return;
    const bounds = surface.getBoundingClientRect();
    surface.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    surface.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    surface.classList.add('is-pointer-active');
  }, { passive: true });
  surface.addEventListener('pointerleave', () => surface.classList.remove('is-pointer-active'));
});

const researchSteps = [...document.querySelectorAll('.story-steps button')];
if (researchSteps.length) {
  researchSteps[0].classList.add('is-current');
  const setCurrentResearchStep = (step) => {
    researchSteps.forEach((item) => item.classList.toggle('is-current', item === step));
  };
  researchSteps.forEach((step) => {
    step.addEventListener('pointerenter', () => setCurrentResearchStep(step));
    step.addEventListener('focus', () => setCurrentResearchStep(step));
  });
}

function updateScrollProgress() {
  if (!scrollProgress) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress, { passive: true });
updateScrollProgress();

document.querySelectorAll('.atlas-node').forEach((node) => {
  const activate = () => {
    document.querySelectorAll('.atlas-node').forEach(item => item.classList.remove('is-active'));
    node.classList.add('is-active');
    atlasReadout.querySelector('span').textContent = tr(nodeNotes[node.dataset.node]);
  };
  node.addEventListener('pointerenter', activate);
  node.addEventListener('focus', activate);
});

const links = [
  ['understanding', 'core'],
  ['feedback', 'core'],
  ['core', 'evidence'],
  ['core', 'dataset'],
  ['feedback', 'dataset'],
  ['dataset', 'model'],
  ['core', 'hmi']
];

function drawAtlas(time = 0) {
  if (!atlasCanvas || getComputedStyle(atlasCanvas).display === 'none') return;
  const bounds = atlasStage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(bounds.width);
  const height = Math.round(bounds.height);
  if (atlasCanvas.width !== width * dpr || atlasCanvas.height !== height * dpr) {
    atlasCanvas.width = width * dpr;
    atlasCanvas.height = height * dpr;
  }
  const context = atlasCanvas.getContext('2d');
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  links.forEach((link, index) => {
    const startNode = atlasStage.querySelector(`[data-node="${link[0]}"]`);
    const endNode = atlasStage.querySelector(`[data-node="${link[1]}"]`);
    if (!startNode || !endNode) return;
    const startBounds = startNode.getBoundingClientRect();
    const endBounds = endNode.getBoundingClientRect();
    const start = { x: startBounds.left - bounds.left + startBounds.width / 2, y: startBounds.top - bounds.top + startBounds.height / 2 };
    const end = { x: endBounds.left - bounds.left + endBounds.width / 2, y: endBounds.top - bounds.top + endBounds.height / 2 };
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const curve = Math.min(70, Math.abs(dx) * .14);
    const control = { x: start.x + dx * .5, y: start.y + dy * .5 - curve * (index % 2 ? -1 : 1) };

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.quadraticCurveTo(control.x, control.y, end.x, end.y);
    context.strokeStyle = 'rgba(223,245,106,.34)';
    context.lineWidth = 1.2;
    context.stroke();

    const progress = ((time * .00008) + index / links.length) % 1;
    const inv = 1 - progress;
    const x = inv * inv * start.x + 2 * inv * progress * control.x + progress * progress * end.x;
    const y = inv * inv * start.y + 2 * inv * progress * control.y + progress * progress * end.y;
    context.beginPath();
    context.arc(x, y, 3.2, 0, Math.PI * 2);
    context.fillStyle = index % 2 ? '#dff56a' : '#6f91ff';
    context.shadowColor = context.fillStyle;
    context.shadowBlur = 14;
    context.fill();
    context.shadowBlur = 0;
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (atlasCanvas) {
  if (reducedMotion) {
    drawAtlas(0);
  } else {
    const animate = (time) => { drawAtlas(time); requestAnimationFrame(animate); };
    requestAnimationFrame(animate);
  }
  window.addEventListener('resize', () => drawAtlas(performance.now()), { passive: true });
}

const initialCase = location.hash.startsWith('#case-') ? location.hash.slice(6) : null;
chooseGuardian();
if (initialCase && reports[initialCase]) openReport(initialCase);
updateLanguage();
