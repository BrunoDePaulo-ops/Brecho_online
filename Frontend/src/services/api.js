import axios from "axios";
import { produtosMock, destaquesMock, maisProcuradosMock } from "../mocks/produtos";
import { usuariosMock } from "../mocks/usuario";

// ⚠️ IMPORTANTE: Quando o back estiver pronto, é SÓ descomentar as linhas
// com axios e apagar as que retornam mock. O resto do front NÃO muda.

const API_URL = "http://localhost:8000/api"; // trocar depois pro IP da EC2
const USE_MOCK = false; // 👈 muda pra false quando o back existir

// Simula delay de rede (pra ver os loadings funcionando)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== ADAPTADOR ====================

function adaptarProduto(produto) {
  return {
    id: produto.id,
    titulo: produto.title,
    descricao: produto.description,
    preco: parseFloat(produto.price),
    categoria: produto.category,
    vendedor: produto.seller,
    status: produto.status,
    imagens: [`https://via.placeholder.com/600x400?text=${encodeURIComponent(produto.title)}`],
  };
}

// ==================== PRODUTOS ====================

export async function listarProdutos() {
  if (USE_MOCK) {
    await delay(500);
    return produtosMock;
  }
  const { data } = await axios.get(`${API_URL}/products`);
  return data.map(adaptarProduto);
}

export async function buscarProduto(id) {
  if (USE_MOCK) {
    await delay(300);
    const produto = produtosMock.find((p) => p.id === Number(id));
    return produto || null;
  }
  const { data } = await axios.get(`${API_URL}/products/${id}`);
  return adaptarProduto(data);
}

export async function criarProduto(produto) {
  if (USE_MOCK) {
    await delay(800);
    const novo = { ...produto, id: Date.now() };
    produtosMock.push(novo);
    return novo;
  }
  const { data } = await axios.post(`${API_URL}/products/`, produto);
  return adaptarProduto(data);
}

export async function excluirProduto(id) {
  if (USE_MOCK) {
    await delay(400);
    const index = produtosMock.findIndex((p) => p.id === Number(id));
    if (index !== -1) produtosMock.splice(index, 1);
    return { sucesso: true };
  }
  // const { data } = await axios.delete(`${API_URL}/products/${id}`);
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
  const { data } = await axios.put(`${API_URL}/products/${id}`, dados);
  return adaptarProduto(data);
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
  const produtos = await listarProdutos();
  return produtos.slice(0, 3);
}

export async function listarMaisProcurados() {
  if (USE_MOCK) {
    await delay(300);
    return maisProcuradosMock;
  }
  const produtos = await listarProdutos();
  return produtos.slice(3, 6);
}

// ==================== CATEGORIAS ====================

export async function listarCategorias() {
  if (USE_MOCK) {
    await delay(300);
    return [];
  }
  const { data } = await axios.get(`${API_URL}/categories/`);
  return data;
}

// ==================== AUTENTICAÇÃO ====================

// Retorna { token, usuario } ou lança um Error se as credenciais forem inválidas.
export async function login(email, senha) {
  if (USE_MOCK) {
    await delay(600);
    const encontrado = usuariosMock.find(
      (u) => u.email === email && u.senha === senha
    );
    if (!encontrado) {
      throw new Error("E-mail ou senha inválidos.");
    }
    return {
      token: `mock-token-${encontrado.id}`,
      usuario: { id: encontrado.id, nome: encontrado.nome, email: encontrado.email },
    };
  }
  const { data } = await axios.post(`${API_URL}/token/`, { username , password: senha, });
  return  { token: data.access, refresh: data.refresh, };
}
