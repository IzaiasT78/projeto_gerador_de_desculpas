/**
 * Lógica Interativa da Página Inicial (Home)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHomeDemo();
  loadStats();
});

let currentDemoCategory = 'trabalho';

function initHomeDemo() {
  const demoChips = document.querySelectorAll('.demo-chip');
  const demoText = document.getElementById('demo-excuse-display');
  const demoBtn = document.getElementById('btn-demo-generate');
  const copyBtn = document.getElementById('btn-demo-copy');
  const whatsappBtn = document.getElementById('btn-demo-whatsapp');

  // Seleção de categoria rápida na home
  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      demoChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentDemoCategory = chip.dataset.category || 'trabalho';
      generateQuickExcuse();
    });
  });

  if (demoBtn) {
    demoBtn.addEventListener('click', generateQuickExcuse);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!demoText || !demoText.textContent) return;
      navigator.clipboard.writeText(demoText.textContent.trim())
        .then(() => showToast('Desculpa copiada para a área de transferência! 🎉', 'success'))
        .catch(() => showToast('Não foi possível copiar o texto.', 'error'));
    });
  }

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      if (!demoText || !demoText.textContent) return;
      const text = encodeURIComponent(`🚨 *Aviso de Emergência:*\n\n"${demoText.textContent.trim()}"`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    });
  }

  // Gera uma inicial de exemplo
  generateQuickExcuse();
}

async function generateQuickExcuse() {
  const demoText = document.getElementById('demo-excuse-display');
  if (!demoText) return;

  demoText.style.opacity = '0.5';
  demoText.textContent = 'Consultando os arquivos de desculpas infalíveis...';

  try {
    const res = await api.generateExcuse({
      category: currentDemoCategory,
      recipient: currentDemoCategory === 'trabalho' ? 'chefe' : 'amigo',
      tone: currentDemoCategory === 'trabalho' ? 'corporativo' : 'caradepau',
      absurdityLevel: 2
    });

    if (res.data && res.data.generatedExcuse) {
      demoText.textContent = res.data.generatedExcuse;
    }
  } catch (error) {
    demoText.textContent = 'Prezado(a), devido a uma instabilidade temporária na minha conexão de dados, peço escusas e reagendo nosso compromisso em breve.';
  } finally {
    demoText.style.opacity = '1';
  }
}

async function loadStats() {
  try {
    const res = await api.getStats();
    if (res.data) {
      const elExcuses = document.getElementById('stat-total-excuses');
      const elUsers = document.getElementById('stat-total-users');
      const elFavorites = document.getElementById('stat-total-favorites');

      if (elExcuses) animateCounter(elExcuses, res.data.totalExcuses || 1540);
      if (elUsers) animateCounter(elUsers, res.data.totalUsers || 420);
      if (elFavorites) animateCounter(elFavorites, res.data.totalFavorites || 890);
    }
  } catch (err) {
    console.warn('Não foi possível carregar estatísticas:', err);
  }
}

function animateCounter(element, target) {
  let start = 0;
  const duration = 1200;
  const step = target / (duration / 16);

  const counter = setInterval(() => {
    start += step;
    if (start >= target) {
      element.textContent = Math.round(target).toLocaleString('pt-BR');
      clearInterval(counter);
    } else {
      element.textContent = Math.round(start).toLocaleString('pt-BR');
    }
  }, 16);
}
