/**
 * Gerenciador Central de Comunicação com a API e Estado de Autenticação
 */

const API_BASE = '/api';

const api = {
  getToken() {
    return localStorage.getItem('auth_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user_data');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('user_data', JSON.stringify(user));
    } else {
      localStorage.removeItem('user_data');
    }
  },

  isLoggedIn() {
    return Boolean(this.getToken());
  },

  logout() {
    this.setToken(null);
    this.setCurrentUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    // Atualiza imediatamente a barra de navegação para o estado original
    updateNavbarUI();

    // Se houver badge de histórico, esconde
    const badge = document.getElementById('history-count-badge');
    if (badge) badge.style.display = 'none';

    showToast('Você saiu da sua conta com sucesso.', 'info');

    // Se estiver no estúdio (/app ou /app.html), redireciona suavemente para a Home
    if (window.location.pathname.includes('app')) {
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    }
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a sessão expirou
        if (response.status === 401 && this.isLoggedIn()) {
          this.setToken(null);
          this.setCurrentUser(null);
          showToast('Sessão expirada. Faça login novamente.', 'error');
        }
        throw new Error(data.message || 'Ocorreu um erro na requisição.');
      }

      return data;
    } catch (error) {
      console.error(`Erro na requisição ${endpoint}:`, error);
      throw error;
    }
  },

  // Métodos de Autenticação
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      this.setToken(data.token);
      this.setCurrentUser(data.user);
    }
    return data;
  },

  async register(name, email, password, confirmPassword) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword })
    });
    if (data.token) {
      this.setToken(data.token);
      this.setCurrentUser(data.user);
    }
    return data;
  },

  async getMe() {
    if (!this.isLoggedIn()) return null;
    const data = await this.request('/auth/me');
    if (data.user) {
      this.setCurrentUser(data.user);
    }
    return data.user;
  },

  // Métodos de Desculpas
  async generateExcuse(payload) {
    return this.request('/excuses/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async saveExcuse(payload) {
    return this.request('/excuses/save', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyExcuses(filters = {}) {
    const query = new URLSearchParams();
    if (filters.category) query.append('category', filters.category);
    if (filters.search) query.append('search', filters.search);
    if (filters.favoritesOnly) query.append('favoritesOnly', 'true');

    return this.request(`/excuses/my-excuses?${query.toString()}`);
  },

  async toggleFavorite(id) {
    return this.request(`/excuses/${id}/favorite`, {
      method: 'PATCH'
    });
  },

  async deleteExcuse(id) {
    return this.request(`/excuses/${id}`, {
      method: 'DELETE'
    });
  },

  async getStats() {
    return this.request('/excuses/stats');
  }
};

/**
 * Exibe notificação Toast flutuante
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '❌',
    info: '💡'
  };

  toast.innerHTML = `
    <span style="font-size: 1.15rem;">${iconMap[type] || '✨'}</span>
    <span style="flex-grow: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

/**
 * Atualiza automaticamente links e badges na navbar dependendo do status de login
 */
function updateNavbarUI() {
  const authContainer = document.getElementById('navbar-auth-actions');
  if (!authContainer) return;

  const user = api.getCurrentUser();
  const loggedIn = api.isLoggedIn();

  if (loggedIn && user) {
    const initials = user.name ? user.name.slice(0, 2).toUpperCase() : 'U';
    authContainer.innerHTML = `
      <div class="user-profile-badge">
        <div class="user-avatar">${initials}</div>
        <span style="font-size: 0.9rem; font-weight: 600;">${user.name}</span>
      </div>
      <a href="/app.html" class="btn btn-primary btn-sm">Estúdio</a>
      <button type="button" id="btn-navbar-logout" class="btn btn-outline btn-sm" title="Sair da conta">Sair</button>
    `;

    // Vincula listener direto para não depender de inline onclick
    const logoutBtn = document.getElementById('btn-navbar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        api.logout();
      });
    }
  } else {
    authContainer.innerHTML = `
      <a href="/login.html" class="btn btn-outline btn-sm">Entrar</a>
      <a href="/app.html" class="btn btn-primary btn-sm">Gerar Agora</a>
    `;
  }
}

// Expõe explicitamente no objeto window para acessibilidade global
window.api = api;
window.logout = () => api.logout();
window.updateNavbarUI = updateNavbarUI;

// Inicializa a navbar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarUI();
});

