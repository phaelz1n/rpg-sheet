
// update-supabase.js - Versão sem dependências externas (usando fetch nativo do Node)

const API_BASE = 'http://localhost:3001'; 

const updates = [
  { name: 'Coroa de Ossos', description: 'Artefato macabro que expande o limite de #corrupção em +1.' },
  { name: 'Pele de Urso', description: 'Manto pesado que oferece 3 de Redução de Dano (RD). Protege o #vigor.' },
  { name: 'Amuleto Tosco', description: 'Concede +1 nos testes de #corrupção e #fé.' },
  { name: 'Chama do Arrependimento', description: 'Espada herética. Sinergia: +1d10 Fogo se o alvo estiver [marcado]. Sacrifício: +1 #corrupção para dano máximo.' },
  { name: 'Adaga de Ferro Frio', description: 'Lâmina herética. Aplica o status [marcado] ao atingir.' },
  { name: 'Foco de Fé', description: 'Canalizador espiritual para ritos sagrados. +1 nos testes de #fé.' }
];

async function updateDatabase() {
  console.log('🚀 Iniciando atualização do banco de dados (Fetch Nativo)...');
  
  try {
    // 1. Pegar todos os itens atuais
    const response = await fetch(`${API_BASE}/admin/items`);
    if (!response.ok) throw new Error('Servidor não respondeu corretamente.');
    
    const { items } = await response.json();
    
    if (!items) {
      console.error('❌ Não foi possível carregar os itens. O servidor está rodando?');
      return;
    }

    for (const update of updates) {
      const item = items.find(i => i.name === update.name);
      if (item) {
        console.log(`Atualizando ${item.name}...`);
        const updateRes = await fetch(`${API_BASE}/admin/items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: update.description })
        });
        
        if (updateRes.ok) {
          console.log(`✅ ${item.name} atualizado!`);
        } else {
          console.log(`❌ Erro ao atualizar ${item.name}`);
        }
      } else {
        console.log(`⚠️ Item "${update.name}" não encontrado no banco.`);
      }
    }
    
    console.log('\n✨ Atualização concluída com sucesso!');
  } catch (error) {
    console.error('🔴 Erro ao atualizar:', error.message);
    console.log('Dica: Verifique se o seu servidor (local-server.js) está rodando em http://localhost:3001');
  }
}

updateDatabase();
