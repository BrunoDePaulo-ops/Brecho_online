import axios from "axios";
import { produtosMock, destaquesMock, maisProcuradosMock } from "../mocks/produtos";
import { usuariosMock } from "../mocks/usuario";

// ⚠️ IMPORTANTE: Quando o back estiver pronto, é SÓ descomentar as linhas
// com axios e apagar as que retornam mock. O resto do front NÃO muda.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";


// Instância Axios para requisições autenticadas
const apiProtegida = axios.create();

// Adiciona o token às requisições
apiProtegida.interceptors.request.use((config) => {
  const auth = JSON.parse(
    localStorage.getItem("brecho_auth") || "{}"
  );

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }

  return config;
});

// Renova o token quando ele expirar
apiProtegida.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;

    const tokenExpirado =
      error.response?.status === 401 &&
      error.response?.data?.code === "token_not_valid";

    if (!tokenExpirado || !original || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    const auth = JSON.parse(
      localStorage.getItem("brecho_auth") || "{}"
    );

    if (!auth.refresh) {
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/token/refresh/`,
        { refresh: auth.refresh }
      );

      const novaAuth = {
        ...auth,
        token: data.access,
        refresh: data.refresh || auth.refresh,
      };

      localStorage.setItem(
        "brecho_auth",
        JSON.stringify(novaAuth)
      );

      original.headers.Authorization =
        `Bearer ${novaAuth.token}`;

      // Repete a requisição original
      return apiProtegida(original);

    } catch (refreshError) {
      localStorage.removeItem("brecho_auth");
      return Promise.reject(refreshError);
    }
  }
);
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
    categoriaNome: produto.category_name,
    vendedor: produto.seller,
    status: produto.status,
    compradorNome: produto.buyer_name ?? null,
    imagens: produto.image_urls || [],
  };
}

// ==================== PRODUTOS ====================

export async function listarProdutos() {
  if (USE_MOCK) {
    await delay(500);
    return produtosMock;
  }
  const { data } = await axios.get(`${API_URL}/products/`);
  return data.map(adaptarProduto);
}

export async function buscarHome() {
  if (USE_MOCK) {
    await delay(300);
    return {
      destaques: produtosMock.slice(0, 3),
      maisProcurados: produtosMock.slice(0, 5),
      todos: produtosMock,
    };
  }
  const { data } = await axios.get(`${API_URL}/products/home/`);
  return {
    destaques: data.destaques.map(adaptarProduto),
    maisProcurados: data.mais_procurados.map(adaptarProduto),
    todos: data.todos.map(adaptarProduto),
  };
}

export async function buscarProduto(id) {
  if (USE_MOCK) {
    await delay(300);
    const produto = produtosMock.find((p) => p.id === Number(id));
    return produto || null;
  }
  const { data } = await axios.get(`${API_URL}/products/${id}/`);
  return adaptarProduto(data);
}

export async function criarProduto(produto, imagens = []) {
  if (USE_MOCK) {
    await delay(800);
    const novo = { ...produto, id: Date.now() };
    produtosMock.push(novo);
    return novo;
  }

  const formData = new FormData();
  
  formData.append("title", produto.title);
  formData.append("description", produto.description);
  formData.append("price", produto.price);
  formData.append("category", produto.category);
  formData.append("status", produto.status || "ACTIVE");

  imagens.forEach((img) => {
    formData.append("images", img.arquivo);
  });

  const { data } = await apiProtegida.post(
    `${API_URL}/products/`,
    formData
  );
  return adaptarProduto(data);
}

export async function excluirProduto(id) {
  if (USE_MOCK) {
    await delay(400);
    const index = produtosMock.findIndex((p) => p.id === Number(id));
    if (index !== -1) produtosMock.splice(index, 1);
    return { sucesso: true };
  }
  await apiProtegida.delete(
  `${API_URL}/products/${id}/`
  );

  return {sucesso: true};
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

  const formData = new FormData();
  formData.append("title", dados.title);
  formData.append("description", dados.description);
  formData.append("price", dados.price);
  formData.append("category", dados.category);
  formData.append("status", dados.status);

  // Se vieram imagens novas, adiciona cada uma
  if (dados.images && dados.images.length > 0) {
    dados.images.forEach((img) => formData.append("images", img));
  }
  
  const { data } = await apiProtegida.patch(
    `${API_URL}/products/${id}/`,
    formData
  );
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
  //return await listarProdutos();
  // const produtos = await listarProdutos();
  // const auth = JSON.parse(localStorage.getItem("brecho_auth") || "{}");
  // const usuarioId = auth.usuario?.id;
  // if (!usuarioId) return [];
  // return produtos.filter((p) => p.vendedor === usuarioId);
  const { data } = await apiProtegida.get(
    `${API_URL}/products/`,
    { params: { mine: "true" } }
  );

  const lista = Array.isArray(data)
    ? data
    : data.results ?? [];

  return lista.map(adaptarProduto);
}

export async function comprarProduto(id) {
  const { data } = await apiProtegida.post(
    `${API_URL}/products/${id}/comprar/`
  );

  return data;
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

  const { data } = await axios.get(`${API_URL}/categories/`);


  const categorias = Array.isArray(data)
    ? data
    : data.results ?? [];

  return categorias.map((categoria) => ({
    id: categoria.id,
    nome: categoria.name ?? categoria.nome ?? categoria.title,
  }));
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

  const { data } = await axios.post(`${API_URL}/token/`, {
    email: email.trim(),
    password: senha,
  });
  
  return {
    token: data.access,
    refresh: data.refresh,
    usuario: data.usuario,
  };
}

export async function cadastrarUsuario(dados) {
  const { data } = await axios.post(`${API_URL}/users/`, dados);
  return data;
}
