// 세 페이지가 같이 쓰는 기능입니다.

// 5칸의 이름과 설명 (사이트의 '틀'). 이름을 바꾸면 모든 페이지에 반영됩니다.
const STEPS = [
  { key: "situation", label: "상황", q: "누가, 어떤 처지에서 묻는가", hint: "AI가 맡을 역할과 내 상황" },
  { key: "goal",      label: "목표", q: "무엇을 얻고 싶은가",       hint: "결과물이 무엇인지 한 문장으로" },
  { key: "material",  label: "재료", q: "무엇을 주고 시작하는가",   hint: "AI가 알아야 할 사실·자료" },
  { key: "format",    label: "형식", q: "어떤 모양으로 받을 것인가", hint: "길이, 표, 개수, 말투" },
  { key: "check",     label: "점검", q: "무엇을 지켜야 하는가",     hint: "지어내지 않기, 확인 표시 등" },
];

// 프롬프트 하나를 복사해서 붙여 넣을 수 있는 글로 합칩니다.
function buildPrompt(p) {
  return STEPS
    .filter(s => (p[s.key] || "").trim())
    .map(s => `## ${s.label}\n${p[s.key].trim()}`)
    .join("\n\n");
}

// [빈칸] 을 눈에 띄게 칠해서 보여 줍니다.
function highlightBlanks(text) {
  const esc = text.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  return esc.replace(/\[[^\]\n]+\]/g, m => `<span class="blank">${m}</span>`);
}

function categoryClass(cat) { return cat.startsWith("마케팅") ? "mk" : "pl"; }

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// 프롬프트 카드 HTML
function cardHtml(p) {
  return `<button class="card pcard" data-id="${p.id}">
    <span><span class="badge ${categoryClass(p.category)}">${p.category}</span></span>
    <h3>${escapeHtml(p.title)}</h3>
    <p>${escapeHtml(p.summary)}</p>
    <span class="tags">${p.tags.map(t => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}</span>
  </button>`;
}

// 복사 + 알림
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); ta.remove();
  }
  toast("복사했어요. ChatGPT나 Claude에 붙여 넣으세요.");
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2200);
}

// 카드를 누르면 열리는 상세 팝업 (index, prompts 페이지 공용)
function setupDetailDialog(container) {
  let dlg = document.getElementById("detail");
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.id = "detail";
    document.body.appendChild(dlg);
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  }
  container.addEventListener("click", e => {
    const btn = e.target.closest(".pcard");
    if (!btn) return;
    const p = PROMPTS.find(x => x.id === btn.dataset.id);
    const text = buildPrompt(p);
    dlg.innerHTML = `
      <div class="dlg-head">
        <div><span class="badge ${categoryClass(p.category)}">${p.category}</span><h3>${escapeHtml(p.title)}</h3></div>
        <button class="x" aria-label="닫기">×</button>
      </div>
      <div class="dlg-body">
        <p style="margin:0 0 12px;color:var(--muted)">${escapeHtml(p.summary)} <b style="color:var(--accent)">색칠된 [빈칸]</b>을 내 상황으로 바꿔 쓰세요.</p>
        <pre class="prompt-box">${highlightBlanks(text)}</pre>
      </div>
      <div class="dlg-foot">
        <a class="btn" href="generator.html?from=${p.id}">생성기에서 빈칸 채우기</a>
        <button class="btn primary" data-copy>그대로 복사</button>
      </div>`;
    dlg.querySelector(".x").onclick = () => dlg.close();
    dlg.querySelector("[data-copy]").onclick = () => copyText(text);
    dlg.showModal();
  });
}
