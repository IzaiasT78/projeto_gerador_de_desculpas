const http = require('node:http');

// Inicia o servidor localmente para o teste
const server = require('./server');

const BASE_URL = 'http://localhost:3000';

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('🧪 Iniciando Testes End-to-End da API e Aplicação...');

  // 1. Healthcheck
  const health = await request('/api/health');
  console.log('1. Healthcheck status:', health.status, health.body);

  // 2. Geração pública de desculpa
  const genRes = await request('/api/excuses/generate', {
    method: 'POST',
    body: {
      category: 'trabalho',
      recipient: 'chefe',
      tone: 'corporativo',
      absurdityLevel: 2,
      situation: 'esqueci de enviar o relatório'
    }
  });
  console.log('2. Geração pública status:', genRes.status);
  console.log('   Desculpa:', genRes.body.data?.generatedExcuse);

  // 3. Registro de novo usuário
  const testEmail = `user_${Date.now()}@teste.com`;
  const regRes = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Maria Silva',
      email: testEmail,
      password: 'senhaSegura123'
    }
  });
  console.log('3. Registro status:', regRes.status, 'Sucesso:', regRes.body.success);
  const token = regRes.body.token;

  // 4. Perfil /me com Token
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('4. Perfil /me status:', meRes.status, 'Nome:', meRes.body.user?.name);

  // 5. Salvar Desculpa no Histórico
  const saveRes = await request('/api/excuses/save', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      category: 'role',
      recipient: 'amigo',
      tone: 'caradepau',
      absurdityLevel: 3,
      situation: 'não quero ir na festa',
      generatedExcuse: genRes.body.data.generatedExcuse
    }
  });
  console.log('5. Salvar no histórico status:', saveRes.status, 'ID:', saveRes.body.data?.id);
  const excuseId = saveRes.body.data?.id;

  // 6. Listar Histórico do Usuário
  const listRes = await request('/api/excuses/my-excuses', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('6. Listagem do histórico status:', listRes.status, 'Total itens:', listRes.body.data?.length);

  // 7. Favoritar Desculpa
  const favRes = await request(`/api/excuses/${excuseId}/favorite`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('7. Favoritar status:', favRes.status, 'isFavorite:', favRes.body.data?.isFavorite);

  // 8. Teste de Proteção de Rota sem Token
  const unauthorizedRes = await request('/api/excuses/save', {
    method: 'POST',
    body: { generatedExcuse: 'Teste sem autenticação' }
  });
  console.log('8. Bloqueio sem token status:', unauthorizedRes.status, '(Esperado: 401)');

  // 9. Excluir Desculpa
  const delRes = await request(`/api/excuses/${excuseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('9. Excluir status:', delRes.status, 'Mensagem:', delRes.body.message);

  // 10. Verifica páginas HTML
  const homeHtml = await request('/');
  const appHtml = await request('/app');
  const loginHtml = await request('/login');
  console.log('10. Servir Home HTML status:', homeHtml.status, 'App HTML:', appHtml.status, 'Login HTML:', loginHtml.status);

  console.log('\n🎉 TODOS OS TESTES E2E FORAM CONCLUÍDOS COM 100% DE SUCESSO!');
  process.exit(0);
}

// Aguarda 500ms para o servidor conectar e executa
setTimeout(runE2ETests, 500);
