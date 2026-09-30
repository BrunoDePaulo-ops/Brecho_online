export const produtosMock = [
  {
    id: 1,
    titulo: "Vaso artesanal de cerâmica",
    descricao: "Feito à mão por artesão local. Perfeito para decoração de sala.",
    preco: 89.90,
    categoria: "Decoração",
    vendedor: "Maria Silva",
     imagens: ["https://picsum.photos/seed/vaso/600/400"],
  },
  {
    id: 2,
    titulo: "Bicicleta usada aro 29",
    descricao: "Pouco uso, revisada recentemente. Freios novos.",
    preco: 650.00,
    categoria: "Esportes",
    vendedor: "João Souza",
    imagens: ["https://picsum.photos/seed/bike/600/400"],
  },
  {
    id: 3,
    titulo: "Camisa vintage anos 90",
    descricao: "Tamanho M, em excelente estado de conservação.",
    preco: 45.00,
    categoria: "Roupas",
    vendedor: "Ana Costa",
    imagens: ["https://picsum.photos/seed/camisa/600/400"],
  },
  {
    id: 4,
    titulo: "Mesa de jantar de madeira maciça",
    descricao: "Mesa rústica, 6 cadeiras inclusas. Retirada em mãos.",
    preco: 1200.00,
    categoria: "Móveis",
    vendedor: "Carlos Pereira",
    imagens: ["https://picsum.photos/seed/mesa/600/400"],
  },
  {
    id: 5,
    titulo: "Violão acústico Tagima",
    descricao: "Seminovo, com capa e cordas extras.",
    preco: 380.00,
    categoria: "Instrumentos",
    vendedor: "Beatriz Lima",
    imagens: ["https://picsum.photos/seed/violao/600/400"],
  },
  {
    id: 6,
    titulo: "Quadro pintado à mão",
    descricao: "Paisagem em aquarela, moldura de madeira.",
    preco: 150.00,
    categoria: "Arte",
    vendedor: "Pedro Alves",
    imagens: ["https://picsum.photos/seed/quadro/600/400"],
  },
];

export const destaquesMock = produtosMock.slice(0, 3);
export const maisProcuradosMock = produtosMock.slice(3, 6);