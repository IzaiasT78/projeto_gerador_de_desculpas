/**
 * Lógica de Autenticação (Login & Cadastro)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Se o usuário já estiver logado, redireciona para o app
  if (api.isLoggedIn()) {
    window.location.href = '/app.html';
    return;
  }

  initAuthTabs();
  initPasswordToggles();
  initForms();
});

function initAuthTabs() {
  const tabLogin = document.getElementById('tab-btn-login');
  const tabRegister = document.getElementById('tab-btn-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');

  // Verifica se há parâmetro ?tab=register na URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'register' || window.location.pathname.includes('register')) {
    showRegisterTab();
  }

  if (tabLogin) {
    tabLogin.addEventListener('click', showLoginTab);
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', showRegisterTab);
  }

  function showLoginTab() {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    formLogin?.classList.remove('hidden');
    formRegister?.classList.add('hidden');
    if (authTitle) authTitle.textContent = 'Bem-vindo(a) de volta';
    if (authSubtitle) authSubtitle.textContent = 'Acesse sua conta para ver suas desculpas salvas';
  }

  function showRegisterTab() {
    tabRegister?.classList.add('active');
    tabLogin?.classList.remove('active');
    formRegister?.classList.remove('hidden');
    formLogin?.classList.add('hidden');
    if (authTitle) authTitle.textContent = 'Crie sua conta';
    if (authSubtitle) authSubtitle.textContent = 'Salve suas melhores desculpas e nunca mais seja pego de surpresa';
  }
}

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '👁️‍🗨️';
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
        }
      }
    });
  });

  // Inicializa validações em tempo real de cadastro
  initRegisterValidations();
}

function initRegisterValidations() {
  const emailInput = document.getElementById('register-email');
  const emailMsg = document.getElementById('email-feedback-msg');
  const passInput = document.getElementById('register-password');
  const confirmInput = document.getElementById('register-password-confirm');
  const matchMsg = document.getElementById('password-match-msg');
  const rulesCard = document.getElementById('password-rules-card');
  const strengthBar = document.getElementById('password-strength-fill');
  const strengthLabel = document.getElementById('password-strength-label');

  // Elementos de requisitos
  const ruleLength = document.getElementById('rule-length');
  const ruleUpper = document.getElementById('rule-upper');
  const ruleLower = document.getElementById('rule-lower');
  const ruleNumber = document.getElementById('rule-number');
  const ruleSpecial = document.getElementById('rule-special');

  // Validação de E-mail em tempo real
  if (emailInput && emailMsg) {
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim();
      if (!val) {
        emailMsg.style.display = 'none';
        emailInput.classList.remove('input-error', 'input-success');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(val);

      emailMsg.style.display = 'flex';
      if (isValid) {
        emailMsg.className = 'input-feedback-msg success';
        emailMsg.innerHTML = '✓ Formato de e-mail válido';
        emailInput.classList.add('input-success');
        emailInput.classList.remove('input-error');
      } else {
        emailMsg.className = 'input-feedback-msg error';
        emailMsg.innerHTML = '✗ E-mail incompleto ou inválido (ex: nome@dominio.com)';
        emailInput.classList.add('input-error');
        emailInput.classList.remove('input-success');
      }
    });
  }

  // Validação e Checklist de Senha Forte em tempo real
  if (passInput && rulesCard) {
    passInput.addEventListener('focus', () => {
      rulesCard.style.display = 'block';
    });

    passInput.addEventListener('input', () => {
      const val = passInput.value;
      if (!val) {
        strengthBar.style.width = '0%';
        resetRules();
        checkPasswordMatch();
        return;
      }

      rulesCard.style.display = 'block';

      // Checa cada requisito
      const hasLength = val.length >= 8;
      const hasUpper = /[A-Z]/.test(val);
      const hasLower = /[a-z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val);

      updateRule(ruleLength, hasLength);
      updateRule(ruleUpper, hasUpper);
      updateRule(ruleLower, hasLower);
      updateRule(ruleNumber, hasNumber);
      updateRule(ruleSpecial, hasSpecial);

      // Calcula pontuação de força (0 a 100)
      let score = 0;
      if (hasLength) score += 20;
      if (hasUpper) score += 20;
      if (hasLower) score += 20;
      if (hasNumber) score += 20;
      if (hasSpecial) score += 20;

      // Se tiver mais de 12 caracteres, ganha bônus visual
      if (val.length >= 12 && score === 100) {
        score = 100;
      }

      strengthBar.style.width = `${score}%`;

      if (score <= 40) {
        strengthBar.style.backgroundColor = '#f43f5e'; // Vermelho
        strengthLabel.textContent = 'Fraca';
        strengthLabel.className = 'badge badge-danger';
      } else if (score <= 60) {
        strengthBar.style.backgroundColor = '#f59e0b'; // Amarelo
        strengthLabel.textContent = 'Média';
        strengthLabel.className = 'badge badge-warning';
      } else if (score <= 80) {
        strengthBar.style.backgroundColor = '#06b6d4'; // Ciano
        strengthLabel.textContent = 'Boa';
        strengthLabel.className = 'badge badge-brand';
      } else {
        strengthBar.style.backgroundColor = '#10b981'; // Verde
        strengthLabel.textContent = 'Excelente 🛡️';
        strengthLabel.className = 'badge badge-success';
      }

      checkPasswordMatch();
    });
  }

  // Validação e Comparação de Senhas (Confirmação)
  if (confirmInput) {
    confirmInput.addEventListener('input', checkPasswordMatch);
  }

  function checkPasswordMatch() {
    if (!confirmInput || !matchMsg || !passInput) return;
    const pass = passInput.value;
    const confirm = confirmInput.value;

    if (!confirm) {
      matchMsg.style.display = 'none';
      confirmInput.classList.remove('input-error', 'input-success');
      return;
    }

    matchMsg.style.display = 'flex';
    if (pass === confirm) {
      matchMsg.className = 'input-feedback-msg success';
      matchMsg.innerHTML = '✅ As senhas coincidem perfeitamente!';
      confirmInput.classList.add('input-success');
      confirmInput.classList.remove('input-error');
    } else {
      matchMsg.className = 'input-feedback-msg error';
      matchMsg.innerHTML = '❌ As senhas não coincidem';
      confirmInput.classList.add('input-error');
      confirmInput.classList.remove('input-success');
    }
  }

  function updateRule(elem, isValid) {
    if (!elem) return;
    const icon = elem.querySelector('.rule-icon');
    if (isValid) {
      elem.className = 'rule-item valid';
      if (icon) icon.textContent = '✓';
    } else {
      elem.className = 'rule-item invalid';
      if (icon) icon.textContent = '○';
    }
  }

  function resetRules() {
    [ruleLength, ruleUpper, ruleLower, ruleNumber, ruleSpecial].forEach(r => {
      updateRule(r, false);
    });
    strengthLabel.textContent = 'Fraca';
    strengthLabel.className = 'badge badge-danger';
  }
}

function initForms() {
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // Submit Login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = formLogin.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Preencha seu e-mail e senha.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Entrando...';

      try {
        const res = await api.login(email, password);
        showToast(res.message || 'Login efetuado com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = '/app.html';
        }, 600);
      } catch (err) {
        showToast(err.message || 'Falha ao realizar login.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Entrar na Conta';
      }
    });
  }

  // Submit Cadastro com validações completas
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value.trim();
      const email = document.getElementById('register-email').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-password-confirm').value;
      const submitBtn = document.getElementById('btn-submit-register') || formRegister.querySelector('button[type="submit"]');

      // 1. Validação de Nome
      if (!name) {
        showToast('Por favor, informe seu nome.', 'error');
        document.getElementById('register-name')?.focus();
        return;
      }

      // 2. Validação estrita de E-mail
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
      if (!email || !emailRegex.test(email)) {
        showToast('Informe um endereço de e-mail válido.', 'error');
        document.getElementById('register-email')?.focus();
        return;
      }

      // 3. Validação dos Requisitos de Senha Forte
      const hasLength = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

      if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        showToast('Sua senha precisa atender a todos os 5 requisitos de segurança.', 'error');
        document.getElementById('register-password')?.focus();
        return;
      }

      // 4. Validação de Confirmação de Senha
      if (password !== confirmPassword) {
        showToast('As senhas não coincidem. Digite a mesma senha nos dois campos.', 'error');
        document.getElementById('register-password-confirm')?.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Criando conta com segurança...';

      try {
        const res = await api.register(name, email, password, confirmPassword);
        showToast(res.message || 'Conta criada com sucesso!', 'success');
        setTimeout(() => {
          window.location.href = '/app.html';
        }, 600);
      } catch (err) {
        showToast(err.message || 'Falha ao criar conta.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Criar Conta Grátis';
      }
    });
  }
}
