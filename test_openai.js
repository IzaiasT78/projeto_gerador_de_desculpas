const { generateExcuseWithOpenAI } = require('./backend/services/openAiService');

async function testOpenAIIntegration() {
  console.log('🧪 Testando Serviço de Integração com OpenAI...');

  // 1. Teste sem chave (deve fazer fallback gracioso)
  const resultFallback = await generateExcuseWithOpenAI({
    category: 'trabalho',
    recipient: 'chefe',
    tone: 'corporativo',
    absurdityLevel: 1,
    situation: 'cheguei 20 minutos atrasado'
  });

  console.log('1. Fallback sem chave executado:');
  console.log('   Source:', resultFallback.source);
  console.log('   Desculpa gerada:', resultFallback.generatedExcuse);

  console.log('\n✅ TESTE DO SERVIÇO OPENAI CONCLUÍDO COM SUCESSO!');
}

testOpenAIIntegration().catch(console.error);
