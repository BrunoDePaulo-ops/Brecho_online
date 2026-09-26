import { produtosMock, destaquesMock, maisProcuradosMock } from "../mocks/produtos";

// ⚠️ IMPORTANTE: Quando o back estiver pronto, é SÓ descomentar as linhas
// com axios e apagar as que retornam mock. O resto do front NÃO muda.

const API_URL = "http://localhost:3000/api"; // trocar depois pro IP da EC2
const USE_MOCK = true; // 👈 muda pra false quando o back existir

// Simula delay de rede (pra ver os loadings funcionando)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== PRODUTOS ====================

export async function listarProdutos() {
  if (USE_MOCK) {
    await delay(500);
    return produtosMock;
  }
  // const { data } = await axios.get(`${API_URL}/produtos`);
  // return data;
}

export async function buscarProduto(id) {
  if (USE_MOCK) {
    await delay(300);
    const produto = produtosMock.find((p) => p.id === Number(id));
    return produto || null;
  }
  // const { data } = await axios.get(`${API_URL}/produtos/${id}`);
  // return data;
}

export async function criarProduto(produto) {
  if (USE_MOCK) {
    await delay(800);
    const novo = { ...produto, id: Date.now() };
    produtosMock.push(novo);
    return novo;
  }
  // const { data } = await axios.post(`${API_URL}/produtos`, produto);
  // return data;
}

export async function excluirProduto(id) {
  if (USE_MOCK) {
    await delay(400);
    const index = produtosMock.findIndex((p) => p.id === Number(id));
    if (index !== -1) produtosMock.splice(index, 1);
    return { sucesso: true };
  }
  // const { data } = await axios.delete(`${API_URL}/produtos/${id}`);
  // return data;
}

export async function atualizarProduto(id, dados) {
  if (USE_MOCK) {
    await delay(500);
    const index = produtosMock.findIndex((p) => p.id === Number(id));
    if (index !== -1) {
      produtosMock[index] = { ...produtosMock[index], ...dados };
      return produtosMock[index];
    }
    return null;
  }
  // const { data } = await axios.put(`${API_URL}/produtos/${id}`, dados);
  // return data;
}

// Lista produtos "do usuário logado" (mock: retorna todos)
export async function listarMeusProdutos() {
  if (USE_MOCK) {
    await delay(400);
    return produtosMock;
  }
  // const { data } = await axios.get(`${API_URL}/meus-produtos`);
  // return data;
}

// ==================== VITRINE (com cache Redis no back) ====================

export async function listarDestaques() {
  if (USE_MOCK) {
    await delay(300);
    return destaquesMock;
  }
  // const { data } = await axios.get(`${API_URL}/vitrine/destaques`);
  // return data;
}

export async function listarMaisProcurados() {
  if (USE_MOCK) {
    await delay(300);
    return maisProcuradosMock;
  }
  // const { data } = await axios.get(`${API_URL}/vitrine/mais-procurados`);
  // return data;
}