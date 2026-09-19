/**
 * Lógica Completa do Estúdio Gerador de Desculpas e Histórico
 */

document.addEventListener('DOMContentLoaded', () => {
  initAppTabs();
  initCategorySelectors();
  initRecipientSelectors();
  initToneSelectors();
  initAbsurditySlider();
  initQuickChips();
  initGeneratorActions();
  initExcuseOptionTabs();
  initHistoryPanel();

  // Gera uma desculpa inicial ao entrar no estúdio
  generateMainExcuse();
});

const state = {
  category: 'trabalho',
  recipient: 'chefe',
  tone: 'corporativo',
  absurdityLevel: 1,
  situation: '',
  lastGenerated: null,
  excusesList: [],
  activeExcuseIndex: 0,
  history: [],
  historyFilter: {
    category: 'all',
    favoritesOnly: false,
    search: ''
  }
};

/* ==========================================================================
   TABS PRINCIPAIS (GERADOR vs HISTÓRICO)
   ========================================================================== */
function initAppTabs() {
  const tabStudio = document.getElementById('tab-btn-studio');
  const tabHistory = document.getElementById('tab-btn-history');
  const viewStudio = document.getElementById('view-studio');
  const viewHistory = document.getElementById('view-history');

  tabStudio?.addEventListener('click', () => {
    tabStudio.classList.add('active');
    tabHistory?.classList.remove('active');
    viewStudio?.classList.remove('hidden');
    viewHistory?.classList.add('hidden');
  });

  tabHistory?.addEventListener('click', () => {
    if (!api.isLoggedIn()) {
      showToast('Você precisa fazer login para acessar seu histórico de desculpas!', 'info');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1000);
      return;
    }
    tabHistory.classList.add('active');
    tabStudio?.classList.remove('active');
    viewHistory?.classList.remove('hidden');
    viewStudio?.classList.add('hidden');
    loadUserHistory();
  });
}

/* ==========================================================================
   SELETORES DO GERADOR
   ========================================================================== */
function initCategorySelectors() {
  const cards = document.querySelectorAll('.category-selector .selector-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.category = card.dataset.category || 'trabalho';

      // Atualiza destinatário padrão sugerido por categoria
      updateSuggestedRecipient(state.category);
    });
  });
}

function updateSuggestedRecipient(category) {
  const pills = document.querySelectorAll('.pills-container .pill-item');
  let defaultRecipient = 'chefe';

  if (category === 'role') defaultRecipient = 'amigo';
  if (category === 'relacionamento') defaultRecipient = 'crush';
  if (category === 'familia') defaultRecipient = 'familia';
  if (category === 'estudos') defaultRecipient = 'professor';

  pills.forEach(p => {
    if (p.dataset.recipient === defaultRecipient) {
      pills.forEach(el => el.classList.remove('selected'));
      p.classList.add('selected');
      state.recipient = defaultRecipient;
    }
  });
}

function initRecipientSelectors() {
  const pills = document.querySelectorAll('.pills-container .pill-item');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      state.recipient = pill.dataset.recipient || 'chefe';
    });
  });
}

function initToneSelectors() {
  const toneCards = document.querySelectorAll('.tones-grid .tone-card');
  toneCards.forEach(card => {
    card.addEventListener('click', () => {
      toneCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.tone = card.dataset.tone || 'corporativo';
    });
  });
}

function initAbsurditySlider() {
  const slider = document.getElementById('slider-absurdity');
  const label = document.getElementById('slider-level-text');

  const descriptions = {
    1: { text: 'Nível 1: 100% Crível & Seguro 🛡️', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    2: { text: 'Nível 2: Plausível com Detalhes ☕', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)' },
    3: { text: 'Nível 3: Incomum / Arriscado ⚡', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    4: { text: 'Nível 4: Cara de Pau Extrema 🕶️', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
    5: { text: 'Nível 5: Caos Cósmico / Ficção Científica 🛸', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)' }
  };

  if (slider && label) {
    slider.addEventListener('input', () => {
      const val = Number(slider.value) || 1;
      state.absurdityLevel = val;
      const desc = descriptions[val];
      label.textContent = desc.text;
      label.style.color = desc.color;
      label.style.backgroundColor = desc.bg;
    });
  }
}

function initQuickChips() {
  const chips = document.querySelectorAll('.quick-context-chips .chip-tag');
  const input = document.getElementById('input-situation');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (input) {
        input.value = chip.textContent.replace('+', '').trim();
        state.situation = input.value;
        showToast(`Contexto aplicado: "${input.value}"`, 'info');
      }
    });
  });

  input?.addEventListener('input', (e) => {
    state.situation = e.target.value;
  });
}

/* ==========================================================================
   AÇÕES DO GERADOR (GERAR, COPIAR, SALVAR, WHATSAPP)
   ========================================================================== */
function initGeneratorActions() {
  const btnGenerate = document.getElementById('btn-main-generate');
  const btnCopy = document.getElementById('btn-copy-result');
  const btnSave = document.getElementById('btn-save-result');
  const btnWhatsapp = document.getElementById('btn-whatsapp-result');
  const btnRandom = document.getElementById('btn-random-generate');

  btnGenerate?.addEventListener('click', () => generateMainExcuse());

  btnRandom?.addEventListener('click', () => {
    // Escolhe aleatoriamente os parâmetros
    const categories = ['trabalho', 'role', 'relacionamento', 'familia', 'estudos'];
    const tones = ['corporativo', 'dramatico', 'caradepau', 'filosofico', 'direto'];
    const randomLevel = Math.floor(Math.random() * 5) + 1;

    state.category = categories[Math.floor(Math.random() * categories.length)];
    state.tone = tones[Math.floor(Math.random() * tones.length)];
    state.absurdityLevel = randomLevel;

    // Atualiza visualmente
    syncControlsWithState();
    generateMainExcuse();
  });

  btnCopy?.addEventListener('click', () => {
    if (!state.lastGenerated?.generatedExcuse) return;
    navigator.clipboard.writeText(state.lastGenerated.generatedExcuse)
      .then(() => showToast('Desculpa copiada com sucesso! 📋', 'success'))
      .catch(() => showToast('Erro ao copiar desculpa.', 'error'));
  });

  btnSave?.addEventListener('click', async () => {
    if (!state.lastGenerated?.generatedExcuse) return;

    if (!api.isLoggedIn()) {
      showToast('Faça login ou crie uma conta para salvar desculpas no seu histórico!', 'info');
      setTimeout(() => {
        window.location.href = '/login.html?tab=register';
      }, 1200);
      return;
    }

    try {
      btnSave.disabled = true;
      btnSave.textContent = 'Salvando...';

      await api.saveExcuse(state.lastGenerated);
      showToast('Desculpa salva no seu histórico! ⭐', 'success');
      updateHistoryBadge();
    } catch (err) {
      showToast(err.message || 'Erro ao salvar desculpa.', 'error');
    } finally {
      btnSave.disabled = false;
      btnSave.innerHTML = '💾 Salvar no Histórico';
    }
  });

  btnWhatsapp?.addEventListener('click', () => {
    if (!state.lastGenerated?.generatedExcuse) return;
    const msg = encodeURIComponent(`🚨 *Comunicado Urgente:*\n\n"${state.lastGenerated.generatedExcuse}"`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  });
}

function syncControlsWithState() {
  // Atualiza slider
  const slider = document.getElementById('slider-absurdity');
  if (slider) {
    slider.value = state.absurdityLevel;
    slider.dispatchEvent(new Event('input'));
  }

  // Atualiza cards de categoria
  document.querySelectorAll('.category-selector .selector-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.category === state.category);
  });

  // Atualiza tons
  document.querySelectorAll('.tones-grid .tone-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.tone === state.tone);
  });
}

/* ==========================================================================
   SELEÇÃO DAS 3 OPÇÕES DE DESCULPAS
   ========================================================================== */
function initExcuseOptionTabs() {
  const pills = document.querySelectorAll('.excuse-tabs-selector .excuse-tab-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const idx = Number(pill.dataset.index) || 0;
      selectExcuseOption(idx);
    });
  });
}

function selectExcuseOption(index) {
  state.activeExcuseIndex = index;
  const pills = document.querySelectorAll('.excuse-tabs-selector .excuse-tab-pill');
  pills.forEach((p, i) => {
    p.classList.toggle('active', i === index);
  });

  const display = document.getElementById('main-excuse-display');
  if (display && state.excusesList && state.excusesList[index]) {
    display.style.opacity = '0';
    setTimeout(() => {
      display.textContent = `"${state.excusesList[index]}"`;
      display.style.opacity = '1';
    }, 150);

    // Atualiza a desculpa ativa para cópia e salvamento
    if (state.lastGenerated) {
      state.lastGenerated.generatedExcuse = state.excusesList[index];
    }
  }
}

async function generateMainExcuse() {
  const display = document.getElementById('main-excuse-display');
  const credibilityBadge = document.getElementById('badge-credibility');
  const btnGenerate = document.getElementById('btn-main-generate');

  if (!display) return;

  if (btnGenerate) {
    btnGenerate.disabled = true;
    btnGenerate.innerHTML = '⏳ Gerando 3 opções infalíveis...';
  }

  display.style.opacity = '0.5';

  try {
    const res = await api.generateExcuse({
      category: state.category,
      recipient: state.recipient,
      tone: state.tone,
      absurdityLevel: state.absurdityLevel,
      situation: state.situation
    });

    if (res.data) {
      state.lastGenerated = res.data;
      state.excusesList = (Array.isArray(res.data.excuses) && res.data.excuses.length > 0)
        ? res.data.excuses
        : [res.data.generatedExcuse];

      // Seleciona a primeira opção e atualiza o display
      selectExcuseOption(0);

      const engineBadge = document.getElementById('badge-engine');
      if (engineBadge) {
        if (res.data.source === 'openai') {
          engineBadge.textContent = '🤖 OpenAI GPT';
          engineBadge.className = 'badge badge-brand';
        } else {
          engineBadge.textContent = '🛡️ Motor Inteligente';
          engineBadge.className = 'badge';
        }
      }

      if (credibilityBadge) {
        credibilityBadge.textContent = `Crível: ${res.data.credibilityScore}`;
        credibilityBadge.className = `badge ${res.data.absurdityLevel <= 2 ? 'badge-success' : res.data.absurdityLevel === 3 ? 'badge-warning' : 'badge-danger'}`;
      }
    }
  } catch (err) {
    display.textContent = '"Prezado(a), infelizmente ocorreu uma intercorrência que impossibilita o cumprimento do horário acordado. Peço desculpas pelo transtorno."';
    showToast('Falha temporária ao gerar. Usando modelo de emergência.', 'info');
  } finally {
    display.style.opacity = '1';
    if (btnGenerate) {
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = '⚡ Gerar Desculpas Imbatíveis';
    }
  }
}

/* ==========================================================================
   PAINEL DE HISTÓRICO & FAVORITOS
   ========================================================================== */
function initHistoryPanel() {
  const searchInput = document.getElementById('history-search-input');
  const categoryFilter = document.getElementById('history-category-filter');
  const favOnlyBtn = document.getElementById('history-fav-only-btn');

  searchInput?.addEventListener('input', (e) => {
    state.historyFilter.search = e.target.value;
    filterAndRenderHistory();
  });

  categoryFilter?.addEventListener('change', (e) => {
    state.historyFilter.category = e.target.value;
    filterAndRenderHistory();
  });

  favOnlyBtn?.addEventListener('click', () => {
    state.historyFilter.favoritesOnly = !state.historyFilter.favoritesOnly;
    favOnlyBtn.classList.toggle('active', state.historyFilter.favoritesOnly);
    favOnlyBtn.classList.toggle('btn-primary', state.historyFilter.favoritesOnly);
    favOnlyBtn.classList.toggle('btn-outline', !state.historyFilter.favoritesOnly);
    filterAndRenderHistory();
  });

  if (api.isLoggedIn()) {
    updateHistoryBadge();
  }
}

async function loadUserHistory() {
  const container = document.getElementById('history-cards-container');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
      ⏳ Carregando seu arsenal de desculpas salvas...
    </div>
  `;

  try {
    const res = await api.getMyExcuses();
    state.history = res.data || [];
    filterAndRenderHistory();
    updateHistoryBadge();
  } catch (err) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--accent-rose);">
        ❌ Erro ao carregar histórico: ${err.message}
      </div>
    `;
  }
}

function filterAndRenderHistory() {
  const container = document.getElementById('history-cards-container');
  if (!container) return;

  let filtered = [...state.history];

  if (state.historyFilter.category !== 'all') {
    filtered = filtered.filter(item => item.category === state.historyFilter.category);
  }

  if (state.historyFilter.favoritesOnly) {
    filtered = filtered.filter(item => item.isFavorite);
  }

  if (state.historyFilter.search.trim()) {
    const term = state.historyFilter.search.trim().toLowerCase();
    filtered = filtered.filter(item =>
      item.generatedExcuse.toLowerCase().includes(term) ||
      (item.situation && item.situation.toLowerCase().includes(term))
    );
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-history">
        <span class="empty-icon">📂</span>
        <h3>Nenhuma desculpa encontrada</h3>
        <p style="color: var(--text-muted); margin-top: 0.5rem;">
          ${state.history.length === 0
            ? 'Você ainda não salvou nenhuma desculpa. Gere uma no estúdio e clique em "Salvar no Histórico"!'
            : 'Nenhum resultado corresponde aos filtros selecionados.'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="history-card" data-id="${item.id}">
      <div class="history-card-header">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="badge badge-brand">${item.category}</span>
          <span class="badge">Nível ${item.absurdityLevel}</span>
        </div>
        <button onclick="toggleFavoriteExcuse(${item.id})" class="btn-star ${item.isFavorite ? 'favorited' : ''}" style="background: none; border: none; font-size: 1.25rem; cursor: pointer;" title="Favoritar">
          ${item.isFavorite ? '★' : '☆'}
        </button>
      </div>

      <p class="history-text">"${item.generatedExcuse}"</p>

      <div class="history-card-footer">
        <span>${formatDate(item.createdAt)}</span>
        <div class="history-card-actions">
          <button onclick="copyHistoryText('${escapeJsString(item.generatedExcuse)}')" class="btn btn-outline btn-sm" title="Copiar">📋</button>
          <button onclick="shareWhatsappHistory('${escapeJsString(item.generatedExcuse)}')" class="btn btn-whatsapp btn-sm" title="WhatsApp">📲</button>
          <button onclick="deleteHistoryExcuse(${item.id})" class="btn btn-outline btn-sm" style="color: var(--accent-rose);" title="Excluir">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function updateHistoryBadge() {
  const badge = document.getElementById('history-count-badge');
  if (!badge) return;

  try {
    const user = await api.getMe();
    if (user && typeof user.totalSavedExcuses !== 'undefined') {
      badge.textContent = user.totalSavedExcuses;
      badge.style.display = 'inline-block';
    }
  } catch {
    // Silently ignore if not logged in
  }
}

// Funções globais chamadas pelo HTML inline nos cards do histórico
window.toggleFavoriteExcuse = async function(id) {
  try {
    const res = await api.toggleFavorite(id);
    const item = state.history.find(i => i.id === id);
    if (item) {
      item.isFavorite = res.data.isFavorite;
    }
    filterAndRenderHistory();
    showToast(res.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.deleteHistoryExcuse = async function(id) {
  if (!confirm('Tem certeza que deseja remover esta desculpa do seu histórico?')) return;

  try {
    await api.deleteExcuse(id);
    state.history = state.history.filter(i => i.id !== id);
    filterAndRenderHistory();
    updateHistoryBadge();
    showToast('Desculpa excluída do histórico!', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.copyHistoryText = function(text) {
  navigator.clipboard.writeText(text)
    .then(() => showToast('Desculpa copiada! 📋', 'success'))
    .catch(() => showToast('Erro ao copiar texto.', 'error'));
};

window.shareWhatsappHistory = function(text) {
  const msg = encodeURIComponent(`🚨 *Comunicado Urgente:*\n\n"${text}"`);
  window.open(`https://wa.me/?text=${msg}`, '_blank');
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function escapeJsString(str) {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, ' ');
}
