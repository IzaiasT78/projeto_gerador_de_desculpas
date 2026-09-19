/**
 * Motor Inteligente de Geração de Desculpas
 * Combina categorias, destinatários, tons e níveis de absurdo em narrativas verossímeis ou hilárias.
 */

const CATEGORIES = {
  trabalho: 'Trabalho & Reuniões',
  role: 'Amigos & Rolê',
  relacionamento: 'Relacionamento & Crush',
  familia: 'Família & Compromissos',
  estudos: 'Faculdade & Estudos'
};

const TONES = {
  corporativo: 'Corporativo & Polido',
  dramatico: 'Dramático & Azar Cósmico',
  caradepau: 'Cara de Pau & Descontraído',
  filosofico: 'Filosófico & Existencial',
  direto: 'Curto & Sem Margem de Dúvida'
};

const VOCABULARY = {
  aberturas: {
    corporativo: [
      "Espero que este contato o encontre bem.",
      "Gostaria de alinhar proativamente uma intercorrência pontual e imprevisível que impactou meu cronograma.",
      "Peço sinceras escusas pelo imprevisto, pois eventos de força maior exigiram intervenção imediata.",
      "Entro em contato com total transparência para atualizar o status da minha presença/disponibilidade.",
      "Venho por meio desta expor uma variável imprevista que fugiu ao meu controle operacional."
    ],
    dramatico: [
      "Você não vai acreditar no pesadelo kafkiano que acabou de acontecer comigo...",
      "O universo claramente acordou conspirando contra a minha existência hoje.",
      "Eu juro por tudo o que é mais sagrado que tentei com todas as minhas forças, mas o destino me deu uma rasteira.",
      "Estou em choque e ainda tentando processar a sucessão inacreditável de catástrofes de hoje.",
      "Se eu contasse isso num roteiro de cinema, diriam que o roteirista exagerou no drama..."
    ],
    caradepau: [
      "Olha, vou ser 100% sincero porque mentir cansa:",
      "A verdade nua e crua é a seguinte:",
      "Seguinte, meu nobre, deu ruim com força aqui no meu setor:",
      "Sabe quando a vida te olha nos olhos e fala 'hoje não'? Então...",
      "Papo reto, sem enrolação:"
    ],
    filosofico: [
      "O que é o tempo senão uma convenção arbitrária criada pela humanidade para limitar nosso espírito?",
      "Às vezes, a física quântica e as probabilidades cósmicas colapsam exatamente onde não deveriam.",
      "Heráclito dizia que não podemos entrar duas vezes no mesmo rio; hoje senti isso na pele.",
      "Em meio à entropia crescente do cosmos, certos acontecimentos nos lembram da fragilidade dos planos humanos.",
      "Refletindo sobre a efemeridade dos compromissos diante da imprevisibilidade da existência..."
    ],
    direto: [
      "Tive um imprevisto inadiável e não conseguirei comparecer/enviar no horário previsto.",
      "Aconteceu uma emergência doméstica e preciso resolver agora.",
      "Estou impossibilitado no momento por motivos de força maior.",
      "Problema urgente de última hora. Atualizo assim que normalizar.",
      "Imprevisto crítico na logística. Não vai dar para cumprir o combinado agora."
    ]
  },

  incidentesPorNivel: {
    // Nível 1: 100% Crível e seguro
    1: [
      "estou preso num congestionamento atípico causado por uma obra na via principal sem sinalização prévia.",
      "tive um pico de instabilidade severo no sinal de internet fibra da região e os técnicos estão reiniciando o armário.",
      "o sensor da bateria do meu carro descarregou subitamente e estou aguardando o reboque/auxílio mecânico.",
      "acordei com uma indisposição gastrointestinal súbita e o médico recomendou repouso absoluto pelas próximas horas.",
      "houve um vazamento repentino no registro do banheiro e tive que esperar o bombeiro hidráulico conter a água."
    ],
    // Nível 2: Plausível com detalhes cotidianos
    2: [
      "o aplicativo do banco bloqueou temporariamente meu acesso justo quando eu precisava pagar o pedágio/gasolina.",
      "a chave quebrou bem dentro da fechadura da porta principal e o chaveiro emergencial está a caminho.",
      "uma transportadora entregou uma encomenda enorme por engano com assinatura obrigatória e estou preso resolvendo a devolução.",
      "o despertador misteriosamente não disparou devido a uma atualização automática do sistema operacional durante a madrugada.",
      "o elevador do prédio travou entre os andares comigo dentro e a brigada de emergência está finalizando o resgate."
    ],
    // Nível 3: Incomum / Inusitado
    3: [
      "o gato do meu vizinho pulou na minha janela, derrubou café fervendo no teclado e acionou o alarme anti-incêndio.",
      "fui trancado acidentalmente no estacionamento do subsolo porque o porteiro novo fechou o portão mais cedo.",
      "fui prestar socorro a uma senhora idosa que perdeu as compras de supermercado espalhadas pela avenida inteira.",
      "minha calça rasgou inteira de ponta a ponta na costura ao entrar no carro e tive que retornar correndo.",
      "um enxame repentino de abelhas estacionou exatamente na porta da minha garagem e os bombeiros isolaram a rua."
    ],
    // Nível 4: Muito Cara de Pau
    4: [
      "estava pronto na porta de saída quando entrei num transe reflexivo sobre as minhas escolhas de vida e perdi o compasso do dia.",
      "fui atacado psicologicamente por um pombo agressivo que se apossou das minhas chaves na sacada.",
      "fui tentar cozinhar um miojo rápido e quase criei uma nova forma de vida que demandou evacuação preventiva da cozinha.",
      "meu horóscopo alertou expressamente com estrelas vermelhas que sair de casa antes das 15h geraria um colapso financeiro.",
      "meu cachorro olhou nos meus olhos com uma expressão tão profunda de desamparo que foi humanamente impossível levantar do sofá."
    ],
    // Nível 5: Caos Absoluto / Ficção Científica
    5: [
      "houve uma perturbação no tecido espaço-tempo do meu bairro; olhei o relógio eram 08:00 e no piscar de olhos marcava 11:45.",
      "um grupo de cientistas amadores soltou um drone de alta potência que interceptou meu trajeto e derrubou meu café.",
      "acredito piamente que fui vítima de uma simulação da Matrix que reiniciou os semáforos da cidade em looping eterno.",
      "fui convocado como testemunha ocular involuntária numa disputa diplomática entre dois flanelinhas no centro.",
      "meu assistente virtual de inteligência artificial se rebelou, trancou as portas inteligentes e começou a tocar jazz em volume máximo."
    ]
  },

  fechamentos: {
    corporativo: [
      "Reitero meu compromisso de entregar o melhor resultado e disponibilizo-me a compensar essas horas sem qualquer prejuízo às metas.",
      "Assim que restabelecer a conectividade/chegada, assumirei a pauta com máxima prioridade.",
      "Agradeço imensamente a empatia e a costumeira compreensão de sempre.",
      "Estou monitorando as mensagens pelo smartphone e sigo à disposição para qualquer urgência imediata."
    ],
    dramatico: [
      "Por favor, me deseje sorte porque estou vivendo um teste de resistência psicológica hoje.",
      "Espero sobreviver a esse dia caótico para poder te abraçar e pedir perdão pessoalmente.",
      "Estou rezando para que amanhã seja um dia de paz cósmica na minha rotina.",
      "Se tudo der certo, estarei vivo e recomposto até o final do dia."
    ],
    caradepau: [
      "Te devo uma cerveja/café de qualidade duvidosa pelo transtorno!",
      "Não me odeie, prometo que na próxima eu compenso em dobro com juros e correção monetária.",
      "Vida que segue, tamo junto e até daqui a pouco!",
      "Me perdoa por ser esse ser humano falho, mas prometo redenção em breve!"
    ],
    filosofico: [
      "Espero que a sabedoria e a serenidade estoica nos guiem através desse desvio do percurso.",
      "No grande esquema cósmico, este atraso será apenas um grão de poeira na vastidão da nossa história.",
      "Que possamos abraçar o imponderável com leveza e generosidade de espírito.",
      "Afinal de contas, o importante não é o horário de chegada, mas a consciência desperta na jornada."
    ],
    direto: [
      "Retorno com updates assim que possível.",
      "Obrigado pela compreensão.",
      "Resolvo isso em breve.",
      "Conto com seu apoio."
    ]
  }
};

/**
 * Utilitário de sorteio de array
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gera uma desculpa estruturada
 */
function generateExcuse({
  category = 'trabalho',
  recipient = 'chefe',
  tone = 'corporativo',
  absurdityLevel = 1,
  situation = ''
}) {
  const level = Math.min(Math.max(Number(absurdityLevel) || 1, 1), 5);
  const selectedTone = VOCABULARY.aberturas[tone] ? tone : 'corporativo';
  const sitTrim = (situation || '').trim();

  const abertura = pickRandom(VOCABULARY.aberturas[selectedTone]);
  const incidente = pickRandom(VOCABULARY.incidentesPorNivel[level]);
  const fechamento = pickRandom(VOCABULARY.fechamentos[selectedTone]);

  // Monta o corpo central da desculpa com o imprevisto, sem vazar o motivo íntimo/cru digitado
  let corpoCentral = '';
  if (selectedTone === 'corporativo') {
    corpoCentral = `Infelizmente, ${incidente}`;
  } else if (selectedTone === 'dramatico') {
    corpoCentral = `Bem na hora H, ${incidente}`;
  } else if (selectedTone === 'caradepau') {
    corpoCentral = `Pois é, bem agora, ${incidente}`;
  } else if (selectedTone === 'filosofico') {
    corpoCentral = `Em meio aos imponderáveis do dia, ${incidente}`;
  } else {
    corpoCentral = `Aconteceu que ${incidente}`;
  }

  // Monta saudação natural de acordo com o destinatário e tom
  let saudacao = '';
  switch (recipient) {
    case 'chefe':
      saudacao = selectedTone === 'corporativo' ? 'Prezado(a) gestor(a),' : (selectedTone === 'caradepau' ? 'Chefe querido,' : 'Olá,');
      break;
    case 'amigo':
      saudacao = selectedTone === 'corporativo' ? 'Caríssimo amigo,' : (selectedTone === 'dramatico' ? 'Amigo do peito, socorro!' : 'Fala meu consagrado,');
      break;
    case 'crush':
      saudacao = selectedTone === 'corporativo' ? 'Olá, querido(a),' : (selectedTone === 'dramatico' ? 'Amor, você não vai acreditar...' : 'Oie, tudo bem?');
      break;
    case 'familia':
      saudacao = selectedTone === 'corporativo' ? 'Prezada família,' : (selectedTone === 'dramatico' ? 'Mãe/Pai, não se desesperem mas...' : 'Bênção! Olha só:');
      break;
    case 'professor':
      saudacao = selectedTone === 'corporativo' ? 'Prezado(a) Professor(a),' : 'Professor, boa tarde/dia,';
      break;
    case 'colega':
      saudacao = 'Olá colega,';
      break;
    default:
      saudacao = 'Olá,';
  }

  let generatedExcuse = `${saudacao} ${abertura} ${corpoCentral} ${fechamento}`;
  generatedExcuse = generatedExcuse.replace(/\s+/g, ' ').trim();

  return {
    category,
    categoryName: CATEGORIES[category] || category,
    recipient,
    tone,
    toneName: TONES[selectedTone] || selectedTone,
    absurdityLevel: level,
    situation: sitTrim,
    generatedExcuse,
    credibilityScore: `${Math.max(10, 100 - (level - 1) * 22)}%`
  };
}

/**
 * Gera 3 opções de desculpas distintas
 */
function generateThreeExcuses(params) {
  const excuse1 = generateExcuse(params);
  let excuse2 = generateExcuse(params);
  let excuse3 = generateExcuse(params);

  let attempts = 0;
  while (excuse2.generatedExcuse === excuse1.generatedExcuse && attempts < 8) {
    excuse2 = generateExcuse(params);
    attempts++;
  }

  attempts = 0;
  while ((excuse3.generatedExcuse === excuse1.generatedExcuse || excuse3.generatedExcuse === excuse2.generatedExcuse) && attempts < 8) {
    excuse3 = generateExcuse(params);
    attempts++;
  }

  const list = [
    excuse1.generatedExcuse,
    excuse2.generatedExcuse,
    excuse3.generatedExcuse
  ];

  return {
    ...excuse1,
    excuses: list,
    generatedExcuse: list[0]
  };
}

module.exports = {
  CATEGORIES,
  TONES,
  generateExcuse,
  generateThreeExcuses
};
