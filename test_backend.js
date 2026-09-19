const { UserRepository, ExcuseRepository } = require('./backend/db/database');
const { generateExcuse } = require('./backend/services/generatorEngine');
const bcrypt = require('bcryptjs');

async function testBackend() {
  console.log('--- Iniciando Testes do Backend ---');

  // 1. Teste do motor de desculpas
  const excuse1 = generateExcuse({
    category: 'trabalho',
    recipient: 'chefe',
    tone: 'corporativo',
    absurdityLevel: 1,
    situation: 'cheguei 30 minutos atrasado na reunião diária'
  });
  console.log('1. Desculpa Corporativa Nível 1:\n', excuse1.generatedExcuse);

  const excuse5 = generateExcuse({
    category: 'role',
    recipient: 'amigo',
    tone: 'caradepau',
    absurdityLevel: 5,
    situation: 'não vou no churrasco'
  });
  console.log('\n2. Desculpa Cara de Pau Nível 5:\n', excuse5.generatedExcuse);

  // 2. Teste de Usuário no SQLite
  const email = `test_${Date.now()}@example.com`;
  const hash = await bcrypt.hash('senha123', 8);
  const user = UserRepository.create({
    name: 'Carlos Teste',
    email,
    passwordHash: hash
  });
  console.log('\n3. Usuário criado no SQLite:', user);

  // 3. Teste de Busca de Usuário
  const found = UserRepository.findByEmail(email);
  console.log('4. Usuário encontrado por e-mail:', found.name, found.email);

  // 4. Teste de Salvar Desculpa
  const savedExcuse = ExcuseRepository.create({
    userId: user.id,
    category: excuse1.category,
    recipient: excuse1.recipient,
    tone: excuse1.tone,
    absurdityLevel: excuse1.absurdityLevel,
    situation: excuse1.situation,
    generatedExcuse: excuse1.generatedExcuse
  });
  console.log('\n5. Desculpa salva no histórico:', savedExcuse.id, savedExcuse.category);

  // 5. Teste de Favoritar
  const favorited = ExcuseRepository.toggleFavorite(savedExcuse.id, user.id);
  console.log('6. Status de favorito alterado:', favorited.isFavorite);

  // 6. Teste de Listagem
  const userExcuses = ExcuseRepository.findByUserId(user.id);
  console.log('7. Total de desculpas no histórico do usuário:', userExcuses.length);

  // 7. Teste de Deletar
  const deleted = ExcuseRepository.delete(savedExcuse.id, user.id);
  console.log('8. Desculpa removida:', deleted);

  const afterDelete = ExcuseRepository.findByUserId(user.id);
  console.log('9. Total de desculpas pós-remoção:', afterDelete.length);

  console.log('\n✅ TODOS OS TESTES DO BACKEND PASSARAM COM SUCESSO!');
}

testBackend().catch(err => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
