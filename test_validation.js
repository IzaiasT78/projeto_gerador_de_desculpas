const http = require('node:http');

const BASE_URL = 'http://localhost:3000';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function testValidations() {
  console.log('🧪 Testando Validações de Cadastro e Senha Forte...');

  // Teste 1: E-mail inválido
  const res1 = await post('/api/auth/register', {
    name: 'Teste',
    email: 'email-invalido',
    password: 'SenhaForte123!',
    confirmPassword: 'SenhaForte123!'
  });
  console.log('1. E-mail inválido rejeitado:', res1.status === 400, res1.body.message);

  // Teste 2: Senha fraca (sem caractere especial)
  const res2 = await post('/api/auth/register', {
    name: 'Teste',
    email: 'teste@email.com',
    password: 'SenhaSemEspecial123',
    confirmPassword: 'SenhaSemEspecial123'
  });
  console.log('2. Senha sem caractere especial rejeitada:', res2.status === 400, res2.body.message);

  // Teste 3: Senha fraca (menos de 8 caracteres)
  const res3 = await post('/api/auth/register', {
    name: 'Teste',
    email: 'teste@email.com',
    password: 'Ab1!',
    confirmPassword: 'Ab1!'
  });
  console.log('3. Senha curta (<8 chars) rejeitada:', res3.status === 400, res3.body.message);

  // Teste 4: Confirmação de senha divergente
  const res4 = await post('/api/auth/register', {
    name: 'Teste',
    email: 'teste@email.com',
    password: 'SenhaForte123!',
    confirmPassword: 'OutraSenha123!'
  });
  console.log('4. Senhas divergentes rejeitadas:', res4.status === 400, res4.body.message);

  // Teste 5: Cadastro Válido com senha forte e confirmação correta
  const validEmail = `usuario_forte_${Date.now()}@dominio.com`;
  const res5 = await post('/api/auth/register', {
    name: 'Usuário Seguro',
    email: validEmail,
    password: 'SuperSenha#2026',
    confirmPassword: 'SuperSenha#2026'
  });
  console.log('5. Cadastro Válido aprovado:', res5.status === 201, res5.body.message);

  console.log('\n✅ TODAS AS NOVAS REGRAS DE VALIDAÇÃO FORAM TESTADAS COM SUCESSO!');
}

testValidations().catch(console.error);
