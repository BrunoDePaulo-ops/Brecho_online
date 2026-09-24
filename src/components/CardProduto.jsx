import { Link } from "react-router-dom";

export default function CardProduto({ produto }) {
  return (
    <Link
      to={`/produto/${produto.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={produto.imagens[0]}
          alt={produto.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <span className="text-xs text-purple-600 font-medium">
          {produto.categoria}
        </span>
        <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">
          {produto.titulo}
        </h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
          {produto.descricao}
        </p>
        <p className="text-lg font-bold text-gray-900 mt-2">
          R$ {produto.preco.toFixed(2).replace(".", ",")}
        </p>
      </div>
    </Link>
  );
}