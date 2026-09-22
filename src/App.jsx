import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
  AlertTriangle,
  Eye,
  ArrowUpDown,
  Filter,
  ArrowDownToLine,
  ArrowUp,
  History,
} from "lucide-react";
import "./App.css";

const produtosIniciais = [
  {
    id: 1,
    nome: "Camiseta Basic",
    categoria: "Roupas",
    preco: 79.9,
    estoque: 32,
  },
  {
    id: 2,
    nome: "Tênis Runner",
    categoria: "Calçados",
    preco: 249.9,
    estoque: 8,
  },
  {
    id: 3,
    nome: "Boné Classic",
    categoria: "Acessórios",
    preco: 59.9,
    estoque: 15,
  },
  {
    id: 4,
    nome: "Mochila Urban",
    categoria: "Acessórios",
    preco: 149.9,
    estoque: 20,
  },
];

const vendasIniciais = [];
const movimentacoesIniciais = [];

const configuracoesIniciais = {
  nomeLoja: "Vitta Store",
  nomeAdmin: "Gabriel",
  email: "admin@vittastore.com",
  telefone: "(18) 99999-9999",
  limiteEstoqueBaixo: 10,
};

function carregarDados(chave, valorPadrao) {
  try {
    const dados = localStorage.getItem(chave);

    if (!dados) {
      return valorPadrao;
    }

    return JSON.parse(dados);
  } catch {
    return valorPadrao;
  }
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data) {
  if (!data) return "-";

  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
  if (!data) return "-";

  return new Date(data).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function criarMovimentacao({
  produto,
  tipo,
  quantidade,
  estoqueAnterior,
  estoqueApos,
  origem,
  vendaId = null,
}) {
  return {
    id: Date.now() + Math.random(),
    produtoId: produto.id,
    produto: produto.nome,
    tipo,
    quantidade,
    estoqueAnterior,
    estoqueApos,
    data: new Date().toISOString(),
    origem,
    vendaId,
  };
}

function App() {
  const [produtos, setProdutos] = useState(() =>
    carregarDados("vitta_produtos", produtosIniciais),
  );

  const [vendas, setVendas] = useState(() =>
    carregarDados("vitta_vendas", vendasIniciais),
  );

  const [movimentacoes, setMovimentacoes] = useState(() =>
    carregarDados("vitta_movimentacoes", movimentacoesIniciais),
  );

  const [pagina, setPagina] = useState(() =>
    carregarDados("vitta_pagina", "dashboard"),
  );

  const [configuracoes, setConfiguracoes] = useState(() =>
    carregarDados("vitta_configuracoes", configuracoesIniciais),
  );

  const [modalProduto, setModalProduto] = useState(false);
  const [modalVenda, setModalVenda] = useState(false);
  const [modalEstoque, setModalEstoque] = useState(false);
  const [modalDetalhesVenda, setModalDetalhesVenda] = useState(null);
  const [modalDetalhesProduto, setModalDetalhesProduto] = useState(null);

  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoExcluindo, setProdutoExcluindo] = useState(null);

  const [pesquisaProdutos, setPesquisaProdutos] = useState("");
  const [pesquisaVendas, setPesquisaVendas] = useState("");
  const [pesquisaEstoque, setPesquisaEstoque] = useState("");
  const [pesquisaMovimentacoes, setPesquisaMovimentacoes] = useState("");

  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroSituacao, setFiltroSituacao] = useState("todas");
  const [ordenacaoProdutos, setOrdenacaoProdutos] = useState("padrao");
  const [filtroMovimentacao, setFiltroMovimentacao] = useState("todas");

  const [formProduto, setFormProduto] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  const [formVenda, setFormVenda] = useState({
    produtoId: "",
    quantidade: 1,
  });

  const [formEstoque, setFormEstoque] = useState({
    produtoId: "",
    tipo: "entrada",
    quantidade: 1,
  });

  const [diaSelecionadoGrafico, setDiaSelecionadoGrafico] = useState(null);

  useEffect(() => {
    localStorage.setItem("vitta_produtos", JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem("vitta_vendas", JSON.stringify(vendas));
  }, [vendas]);

  useEffect(() => {
    localStorage.setItem("vitta_movimentacoes", JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  useEffect(() => {
    localStorage.setItem("vitta_pagina", JSON.stringify(pagina));
  }, [pagina]);

  useEffect(() => {
    localStorage.setItem("vitta_configuracoes", JSON.stringify(configuracoes));
  }, [configuracoes]);

  const faturamentoVendas = useMemo(() => {
    return vendas
      .filter((venda) => venda.status !== "cancelada")
      .reduce((total, venda) => total + Number(venda.total || 0), 0);
  }, [vendas]);

  const pedidosRealizados = useMemo(() => {
    return vendas.filter((venda) => venda.status !== "cancelada").length;
  }, [vendas]);

  const unidadesVendidas = useMemo(() => {
    return vendas
      .filter((venda) => venda.status !== "cancelada")
      .reduce((total, venda) => total + Number(venda.quantidade || 0), 0);
  }, [vendas]);

  const totalUnidadesEstoque = useMemo(() => {
    return produtos.reduce(
      (total, produto) => total + Number(produto.estoque || 0),
      0,
    );
  }, [produtos]);

  const valorTotalEstoque = useMemo(() => {
    return produtos.reduce(
      (total, produto) =>
        total + Number(produto.preco || 0) * Number(produto.estoque || 0),
      0,
    );
  }, [produtos]);

  const limiteEstoqueBaixo = Number(configuracoes.limiteEstoqueBaixo || 10);

  const estoqueBaixo = useMemo(() => {
    return produtos.filter(
      (produto) =>
        Number(produto.estoque) > 0 &&
        Number(produto.estoque) <= limiteEstoqueBaixo,
    );
  }, [produtos, limiteEstoqueBaixo]);

  const produtosSemEstoque = useMemo(() => {
    return produtos.filter((produto) => Number(produto.estoque) === 0);
  }, [produtos]);

  const categoriasProdutos = useMemo(() => {
    return [...new Set(produtos.map((produto) => produto.categoria))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [produtos]);

  const vendasFiltradas = useMemo(() => {
    const termo = pesquisaVendas.toLowerCase().trim();

    if (!termo) return vendas;

    return vendas.filter((venda) => {
      return (
        String(venda.id).includes(termo) ||
        venda.produto.toLowerCase().includes(termo) ||
        venda.status.toLowerCase().includes(termo)
      );
    });
  }, [vendas, pesquisaVendas]);

  const produtosFiltrados = useMemo(() => {
    const termo = pesquisaProdutos.toLowerCase().trim();

    let resultado = produtos.filter((produto) => {
      const correspondePesquisa =
        !termo ||
        produto.nome.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo);

      const correspondeCategoria =
        filtroCategoria === "todas" || produto.categoria === filtroCategoria;

      const estoque = Number(produto.estoque);

      const correspondeSituacao =
        filtroSituacao === "todas" ||
        (filtroSituacao === "disponivel" && estoque > limiteEstoqueBaixo) ||
        (filtroSituacao === "baixo" &&
          estoque > 0 &&
          estoque <= limiteEstoqueBaixo) ||
        (filtroSituacao === "sem-estoque" && estoque === 0);

      return correspondePesquisa && correspondeCategoria && correspondeSituacao;
    });

    resultado = [...resultado];

    switch (ordenacaoProdutos) {
      case "nome-az":
        resultado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        break;

      case "nome-za":
        resultado.sort((a, b) => b.nome.localeCompare(a.nome, "pt-BR"));
        break;

      case "preco-menor":
        resultado.sort((a, b) => Number(a.preco) - Number(b.preco));
        break;

      case "preco-maior":
        resultado.sort((a, b) => Number(b.preco) - Number(a.preco));
        break;

      case "estoque-menor":
        resultado.sort((a, b) => Number(a.estoque) - Number(b.estoque));
        break;

      case "estoque-maior":
        resultado.sort((a, b) => Number(b.estoque) - Number(a.estoque));
        break;

      default:
        break;
    }

    return resultado;
  }, [
    produtos,
    pesquisaProdutos,
    filtroCategoria,
    filtroSituacao,
    ordenacaoProdutos,
    limiteEstoqueBaixo,
  ]);

  const estoqueFiltrado = useMemo(() => {
    const termo = pesquisaEstoque.toLowerCase().trim();

    if (!termo) return produtos;

    return produtos.filter((produto) => {
      return (
        produto.nome.toLowerCase().includes(termo) ||
        produto.categoria.toLowerCase().includes(termo)
      );
    });
  }, [produtos, pesquisaEstoque]);

  const movimentacoesFiltradas = useMemo(() => {
    const termo = pesquisaMovimentacoes.toLowerCase().trim();

    return movimentacoes.filter((movimentacao) => {
      const correspondeTipo =
        filtroMovimentacao === "todas" ||
        movimentacao.tipo === filtroMovimentacao;

      const correspondePesquisa =
        !termo ||
        String(movimentacao.produto || "")
          .toLowerCase()
          .includes(termo) ||
        String(movimentacao.origem || "")
          .toLowerCase()
          .includes(termo);

      return correspondeTipo && correspondePesquisa;
    });
  }, [movimentacoes, pesquisaMovimentacoes, filtroMovimentacao]);

  const movimentacoesRecentes = useMemo(() => {
    return movimentacoes.slice(0, 8);
  }, [movimentacoes]);

  const entradasEstoque = useMemo(() => {
    return movimentacoes
      .filter((movimentacao) => movimentacao.tipo === "entrada")
      .reduce(
        (total, movimentacao) => total + Number(movimentacao.quantidade || 0),
        0,
      );
  }, [movimentacoes]);

  const saidasEstoque = useMemo(() => {
    return movimentacoes
      .filter((movimentacao) => movimentacao.tipo === "saida")
      .reduce(
        (total, movimentacao) => total + Number(movimentacao.quantidade || 0),
        0,
      );
  }, [movimentacoes]);

  const vendaSelecionadaProduto = produtos.find(
    (produto) => Number(produto.id) === Number(formVenda.produtoId),
  );

  const totalVenda = vendaSelecionadaProduto
    ? Number(vendaSelecionadaProduto.preco) * Number(formVenda.quantidade || 0)
    : 0;

  const produtoSelecionadoEstoque = produtos.find(
    (produto) => Number(produto.id) === Number(formEstoque.produtoId),
  );

  const estoqueAtualSelecionado = Number(
    produtoSelecionadoEstoque?.estoque ?? 0,
  );

  const quantidadeMovimentacao = Math.max(
    0,
    Number(formEstoque.quantidade ?? 0),
  );

  const tipoMovimentacao = formEstoque.tipo === "saida" ? "saida" : "entrada";

  const novoEstoqueMovimentacao =
    tipoMovimentacao === "saida"
      ? Math.max(0, estoqueAtualSelecionado - quantidadeMovimentacao)
      : estoqueAtualSelecionado + quantidadeMovimentacao;

  const faturamentoInicial = 8450;
  const pedidosIniciais = 84;

  function mudarPagina(novaPagina) {
    setPagina(novaPagina);
  }

  function abrirNovoProduto() {
    setProdutoEditando(null);

    setFormProduto({
      nome: "",
      categoria: "",
      preco: "",
      estoque: "",
    });

    setModalProduto(true);
  }

  function abrirEditarProduto(produto) {
    setProdutoEditando(produto);

    setFormProduto({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: produto.preco,
      estoque: produto.estoque,
    });

    setModalProduto(true);
  }

  function abrirDetalhesProduto(produto) {
    setModalDetalhesProduto(produto);
  }

  function salvarProduto(event) {
    event.preventDefault();

    const nome = formProduto.nome.trim();
    const categoria = formProduto.categoria.trim();
    const preco = Number(formProduto.preco);
    const estoque = Number(formProduto.estoque);

    if (!nome || !categoria || preco <= 0 || estoque < 0) {
      alert("Preencha os dados do produto corretamente.");
      return;
    }

    if (produtoEditando) {
      const estoqueAnterior = Number(produtoEditando.estoque);

      setProdutos((produtosAtuais) =>
        produtosAtuais.map((produto) =>
          produto.id === produtoEditando.id
            ? {
                ...produto,
                nome,
                categoria,
                preco,
                estoque,
              }
            : produto,
        ),
      );

      if (estoqueAnterior !== estoque) {
        setMovimentacoes((movimentacoesAtuais) => [
          criarMovimentacao({
            produto: {
              ...produtoEditando,
              nome,
              categoria,
            },
            tipo: estoque > estoqueAnterior ? "entrada" : "saida",
            quantidade: Math.abs(estoque - estoqueAnterior),
            estoqueAnterior,
            estoqueApos: estoque,
            origem: "Ajuste de cadastro",
          }),
          ...movimentacoesAtuais,
        ]);
      }

      if (modalDetalhesProduto?.id === produtoEditando.id) {
        setModalDetalhesProduto(null);
      }
    } else {
      const novoProduto = {
        id: Date.now(),
        nome,
        categoria,
        preco,
        estoque,
      };

      setProdutos((produtosAtuais) => [...produtosAtuais, novoProduto]);

      if (estoque > 0) {
        setMovimentacoes((movimentacoesAtuais) => [
          criarMovimentacao({
            produto: novoProduto,
            tipo: "entrada",
            quantidade: estoque,
            estoqueAnterior: 0,
            estoqueApos: estoque,
            origem: "Cadastro de produto",
          }),
          ...movimentacoesAtuais,
        ]);
      }
    }

    setModalProduto(false);
  }

  function abrirExclusaoProduto(produto) {
    setProdutoExcluindo(produto);
  }

  function confirmarExclusaoProduto() {
    if (!produtoExcluindo) return;

    setProdutos((produtosAtuais) =>
      produtosAtuais.filter((item) => item.id !== produtoExcluindo.id),
    );

    if (modalDetalhesProduto?.id === produtoExcluindo.id) {
      setModalDetalhesProduto(null);
    }

    setProdutoExcluindo(null);
  }

  function abrirNovaVenda() {
    if (produtos.length === 0) {
      alert("Cadastre pelo menos um produto antes de realizar uma venda.");
      return;
    }

    const primeiroProdutoDisponivel =
      produtos.find((produto) => Number(produto.estoque) > 0) || produtos[0];

    setFormVenda({
      produtoId: primeiroProdutoDisponivel.id,
      quantidade: 1,
    });

    setModalVenda(true);
  }

  function salvarVenda(event) {
    event.preventDefault();

    const produto = produtos.find(
      (item) => Number(item.id) === Number(formVenda.produtoId),
    );

    const quantidade = Number(formVenda.quantidade);

    if (!produto) {
      alert("Selecione um produto.");
      return;
    }

    if (quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    if (quantidade > Number(produto.estoque)) {
      alert("Quantidade maior que o estoque disponível.");
      return;
    }

    const total = Number(produto.preco) * quantidade;
    const data = new Date().toISOString();
    const vendaId = Date.now();

    const estoqueAnterior = Number(produto.estoque);
    const estoqueApos = estoqueAnterior - quantidade;

    const novaVenda = {
      id: vendaId,
      produtoId: produto.id,
      produto: produto.nome,
      categoria: produto.categoria,
      quantidade,
      precoUnitario: Number(produto.preco),
      total,
      data,
      status: "concluida",
      estoqueMovimentado: true,
    };

    setVendas((vendasAtuais) => [novaVenda, ...vendasAtuais]);

    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              estoque: estoqueApos,
            }
          : item,
      ),
    );

    setMovimentacoes((movimentacoesAtuais) => [
      criarMovimentacao({
        produto,
        tipo: "saida",
        quantidade,
        estoqueAnterior,
        estoqueApos,
        origem: "Venda",
        vendaId,
      }),
      ...movimentacoesAtuais,
    ]);

    setModalVenda(false);
  }

  function cancelarVenda(venda) {
    if (venda.status === "cancelada") return;

    const produtoAtual = produtos.find(
      (produto) => produto.id === venda.produtoId,
    );

    if (!produtoAtual) {
      alert("O produto desta venda não foi encontrado no estoque.");
      return;
    }

    const confirmar = window.confirm(
      "Deseja realmente cancelar esta venda? O estoque será devolvido.",
    );

    if (!confirmar) return;

    const estoqueAnterior = Number(produtoAtual.estoque);
    const estoqueApos = estoqueAnterior + Number(venda.quantidade);
    const data = new Date().toISOString();

    setVendas((vendasAtuais) =>
      vendasAtuais.map((item) =>
        item.id === venda.id
          ? {
              ...item,
              status: "cancelada",
              canceladaEm: data,
            }
          : item,
      ),
    );

    setProdutos((produtosAtuais) =>
      produtosAtuais.map((produto) =>
        produto.id === venda.produtoId
          ? {
              ...produto,
              estoque: estoqueApos,
            }
          : produto,
      ),
    );

    setMovimentacoes((movimentacoesAtuais) => [
      criarMovimentacao({
        produto: produtoAtual,
        tipo: "entrada",
        quantidade: Number(venda.quantidade),
        estoqueAnterior,
        estoqueApos,
        origem: "Cancelamento de venda",
        vendaId: venda.id,
      }),
      ...movimentacoesAtuais,
    ]);

    setModalDetalhesVenda(null);
  }

  function abrirMovimentacaoEstoque(tipoInicial = "entrada") {
    if (produtos.length === 0) {
      alert("Cadastre pelo menos um produto antes de movimentar o estoque.");
      return;
    }

    const primeiroProdutoDisponivel =
      produtos.find((produto) => Number(produto.estoque) > 0) || produtos[0];

    const tipoSeguro = tipoInicial === "saida" ? "saida" : "entrada";

    setFormEstoque({
      produtoId: primeiroProdutoDisponivel.id,
      tipo: tipoSeguro,
      quantidade: 1,
    });

    setModalEstoque(true);
  }

  function salvarMovimentacao(event) {
    event.preventDefault();

    const produto = produtos.find(
      (item) => Number(item.id) === Number(formEstoque.produtoId),
    );

    const quantidade = Number(formEstoque.quantidade);

    const tipo = formEstoque.tipo === "saida" ? "saida" : "entrada";

    if (!produto) {
      alert("Selecione um produto.");
      return;
    }

    if (quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    const estoqueAnterior = Number(produto.estoque);

    if (tipo === "saida" && quantidade > estoqueAnterior) {
      alert("Não há estoque suficiente para essa saída.");
      return;
    }

    const estoqueApos =
      tipo === "entrada"
        ? estoqueAnterior + quantidade
        : estoqueAnterior - quantidade;

    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              estoque: estoqueApos,
            }
          : item,
      ),
    );

    setMovimentacoes((movimentacoesAtuais) => [
      criarMovimentacao({
        produto,
        tipo,
        quantidade,
        estoqueAnterior,
        estoqueApos,
        origem: "Movimentação manual",
      }),
      ...movimentacoesAtuais,
    ]);

    setModalEstoque(false);

    setFormEstoque({
      produtoId: produto.id,
      tipo: "entrada",
      quantidade: 1,
    });
  }

  function salvarConfiguracoes(event) {
    event.preventDefault();

    setConfiguracoes({
      ...configuracoes,
      limiteEstoqueBaixo: Number(configuracoes.limiteEstoqueBaixo || 10),
    });

    alert("Configurações salvas com sucesso.");
  }

  function restaurarConfiguracoes() {
    const confirmar = window.confirm(
      "Deseja restaurar as configurações padrão?",
    );

    if (!confirmar) return;

    setConfiguracoes(configuracoesIniciais);
  }

  function limparFiltrosProdutos() {
    setPesquisaProdutos("");
    setFiltroCategoria("todas");
    setFiltroSituacao("todas");
    setOrdenacaoProdutos("padrao");
  }

  function obterStatusProduto(produto) {
    const estoque = Number(produto.estoque);

    if (estoque === 0) {
      return {
        texto: "Sem estoque",
        classe: "status-sem-estoque",
      };
    }

    if (estoque <= limiteEstoqueBaixo) {
      return {
        texto: "Estoque baixo",
        classe: "status-estoque-baixo",
      };
    }

    return {
      texto: "Disponível",
      classe: "status-disponivel",
    };
  }

  const faturamentoRelatorio = faturamentoVendas;
  const quantidadeVendasRelatorio = pedidosRealizados;

  const ticketMedio =
    quantidadeVendasRelatorio > 0
      ? faturamentoRelatorio / quantidadeVendasRelatorio
      : 0;

  const vendasUltimosSeteDias = useMemo(() => {
    const dias = [];

    for (let i = 6; i >= 0; i--) {
      const data = new Date();

      data.setHours(0, 0, 0, 0);
      data.setDate(data.getDate() - i);

      const inicio = new Date(data);
      const fim = new Date(data);

      fim.setHours(23, 59, 59, 999);

      const faturamento = vendas
        .filter((venda) => {
          if (venda.status === "cancelada") {
            return false;
          }

          const dataVenda = new Date(venda.data);

          return dataVenda >= inicio && dataVenda <= fim;
        })
        .reduce((total, venda) => total + Number(venda.total || 0), 0);

      dias.push({
        data: data.toLocaleDateString("pt-BR"),
        faturamento,
      });
    }

    return dias;
  }, [vendas]);

  const maiorFaturamentoDia = Math.max(
    ...vendasUltimosSeteDias.map((dia) => dia.faturamento),
    1,
  );

  const produtosMaisVendidos = useMemo(() => {
    const mapa = {};

    vendas
      .filter((venda) => venda.status !== "cancelada")
      .forEach((venda) => {
        if (!mapa[venda.produto]) {
          mapa[venda.produto] = {
            produto: venda.produto,
            quantidade: 0,
            faturamento: 0,
          };
        }

        mapa[venda.produto].quantidade += Number(venda.quantidade);
        mapa[venda.produto].faturamento += Number(venda.total);
      });

    return Object.values(mapa).sort((a, b) => b.quantidade - a.quantidade);
  }, [vendas]);

  const produtosMaiorFaturamento = useMemo(() => {
    return [...produtosMaisVendidos].sort(
      (a, b) => b.faturamento - a.faturamento,
    );
  }, [produtosMaisVendidos]);

  function renderGrafico() {
    return (
      <div className="chart">
        {vendasUltimosSeteDias.map((dia) => {
          const altura =
            dia.faturamento > 0
              ? Math.max((dia.faturamento / maiorFaturamentoDia) * 100, 8)
              : 8;

          const ativo = diaSelecionadoGrafico?.data === dia.data;

          return (
            <div
              className={`chart-column ${ativo ? "chart-column-active" : ""}`}
              key={dia.data}
              onMouseEnter={() => setDiaSelecionadoGrafico(dia)}
              onMouseLeave={() => setDiaSelecionadoGrafico(null)}
            >
              <div
                className={`chart-tooltip ${
                  ativo ? "chart-tooltip-visible" : ""
                }`}
              >
                <span>{dia.data}</span>

                <strong>
                  {dia.faturamento > 0
                    ? formatarMoeda(dia.faturamento)
                    : "R$ 0,00"}
                </strong>
              </div>

              <span className="chart-value">
                {dia.faturamento > 0 ? formatarMoeda(dia.faturamento) : "R$ 0"}
              </span>

              <div
                className="chart-bar"
                style={{
                  height: `${altura}%`,
                }}
              />

              <span className="chart-date">{dia.data.slice(0, 5)}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo">V</div>
          <span>Painel administrativo</span>
        </div>

        <nav className="menu">
          <p className="menu-title">MENU</p>

          <button
            className={pagina === "dashboard" ? "active" : ""}
            onClick={() => mudarPagina("dashboard")}
          >
            <span className="menu-icon">
              <LayoutDashboard size={18} />
            </span>
            Painel
          </button>

          <button
            className={pagina === "produtos" ? "active" : ""}
            onClick={() => mudarPagina("produtos")}
          >
            <span className="menu-icon">
              <Package size={18} />
            </span>
            Produtos
          </button>

          <button
            className={pagina === "vendas" ? "active" : ""}
            onClick={() => mudarPagina("vendas")}
          >
            <span className="menu-icon">
              <ShoppingCart size={18} />
            </span>
            Vendas
          </button>

          <button
            className={pagina === "estoque" ? "active" : ""}
            onClick={() => mudarPagina("estoque")}
          >
            <span className="menu-icon">
              <Boxes size={18} />
            </span>
            Estoque
          </button>

          <button
            className={pagina === "relatorios" ? "active" : ""}
            onClick={() => mudarPagina("relatorios")}
          >
            <span className="menu-icon">
              <BarChart3 size={18} />
            </span>
            Relatórios
          </button>

          <p className="menu-title menu-title-settings">SISTEMA</p>

          <button
            className={pagina === "configuracoes" ? "active" : ""}
            onClick={() => mudarPagina("configuracoes")}
          >
            <span className="menu-icon">
              <Settings size={18} />
            </span>
            Configurações
          </button>
        </nav>

        <div className="user-card">
          <div className="user-avatar">
            {String(configuracoes.nomeAdmin || "G")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{configuracoes.nomeAdmin}</strong>
            <span>Administrador</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {pagina === "dashboard" && (
          <>
            <div className="page-header">
              <div>
                <h1>Visão geral</h1>
                <p>Acompanhe os principais indicadores da sua loja.</p>
              </div>

              <button className="primary-button" onClick={abrirNovaVenda}>
                <Plus size={17} />
                Nova venda
              </button>
            </div>

            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon revenue">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <span>Faturamento</span>
                  <strong>
                    {formatarMoeda(faturamentoVendas || faturamentoInicial)}
                  </strong>
                  <small>Vendas concluídas</small>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon orders">
                  <ShoppingCart size={20} />
                </div>

                <div>
                  <span>Pedidos</span>
                  <strong>{pedidosRealizados || pedidosIniciais}</strong>
                  <small>Pedidos realizados</small>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon products">
                  <Package size={20} />
                </div>

                <div>
                  <span>Produtos</span>
                  <strong>{produtos.length}</strong>
                  <small>Produtos cadastrados</small>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-icon stock">
                  <Boxes size={20} />
                </div>

                <div>
                  <span>Estoque baixo</span>
                  <strong>{estoqueBaixo.length}</strong>
                  <small>Precisam de atenção</small>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              <section className="panel chart-panel">
                <div className="panel-header">
                  <div>
                    <h2>Vendas dos últimos 7 dias</h2>
                    <p>Faturamento por dia</p>
                  </div>
                </div>

                {renderGrafico()}
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2>Resumo do estoque</h2>
                    <p>Situação atual dos produtos</p>
                  </div>
                </div>

                <div className="summary-list">
                  <div>
                    <span>Total de unidades</span>
                    <strong>{totalUnidadesEstoque}</strong>
                  </div>

                  <div>
                    <span>Produtos cadastrados</span>
                    <strong>{produtos.length}</strong>
                  </div>

                  <div>
                    <span>Estoque baixo</span>
                    <strong className="warning-text">
                      {estoqueBaixo.length}
                    </strong>
                  </div>

                  <div>
                    <span>Sem estoque</span>
                    <strong className="danger-text">
                      {produtosSemEstoque.length}
                    </strong>
                  </div>
                </div>
              </section>
            </div>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Produtos recentes</h2>
                  <p>Produtos cadastrados no sistema</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => mudarPagina("produtos")}
                >
                  Ver produtos
                  <ChevronRight size={15} />
                </button>
              </div>

              {produtos.length === 0 ? (
                <div className="empty-state">Nenhum produto cadastrado.</div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {produtos.slice(0, 5).map((produto) => {
                        const status = obterStatusProduto(produto);

                        return (
                          <tr key={produto.id}>
                            <td>
                              <span className="product-name">
                                {produto.nome}
                              </span>
                            </td>

                            <td>{produto.categoria}</td>

                            <td>{formatarMoeda(produto.preco)}</td>

                            <td>{produto.estoque}</td>

                            <td>
                              <span className={`status-badge ${status.classe}`}>
                                {status.texto}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {pagina === "produtos" && (
          <>
            <div className="page-header">
              <div>
                <h1>Produtos</h1>
                <p>Gerencie os produtos cadastrados na sua loja.</p>
              </div>

              <button className="primary-button" onClick={abrirNovoProduto}>
                <Plus size={17} />
                Novo produto
              </button>
            </div>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Catálogo de produtos</h2>
                  <p>Pesquise, filtre e gerencie seus produtos.</p>
                </div>

                <div className="search-wrapper products-search-wrapper">
                  <Search size={17} />
                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={pesquisaProdutos}
                    onChange={(event) =>
                      setPesquisaProdutos(event.target.value)
                    }
                  />
                </div>
              </div>

              <div className="product-filters">
                <div className="filter-control">
                  <Filter size={15} />

                  <select
                    value={filtroCategoria}
                    onChange={(event) => setFiltroCategoria(event.target.value)}
                  >
                    <option value="todas">Todas as categorias</option>

                    {categoriasProdutos.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-control">
                  <Boxes size={15} />

                  <select
                    value={filtroSituacao}
                    onChange={(event) => setFiltroSituacao(event.target.value)}
                  >
                    <option value="todas">Todas as situações</option>
                    <option value="disponivel">Disponível</option>
                    <option value="baixo">Estoque baixo</option>
                    <option value="sem-estoque">Sem estoque</option>
                  </select>
                </div>

                <div className="filter-control">
                  <ArrowUpDown size={15} />

                  <select
                    value={ordenacaoProdutos}
                    onChange={(event) =>
                      setOrdenacaoProdutos(event.target.value)
                    }
                  >
                    <option value="padrao">Ordenação padrão</option>
                    <option value="nome-az">Nome: A-Z</option>
                    <option value="nome-za">Nome: Z-A</option>
                    <option value="preco-menor">Menor preço</option>
                    <option value="preco-maior">Maior preço</option>
                    <option value="estoque-menor">Menor estoque</option>
                    <option value="estoque-maior">Maior estoque</option>
                  </select>
                </div>

                <button
                  className="clear-filters-button"
                  onClick={limparFiltrosProdutos}
                >
                  <X size={14} />
                  Limpar filtros
                </button>
              </div>

              {produtosFiltrados.length === 0 ? (
                <div className="empty-state filtered-empty-state">
                  <div>
                    <Search size={25} />
                    <strong>Nenhum produto encontrado</strong>
                    <span>
                      Tente ajustar os filtros ou realizar outra busca.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Estoque</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {produtosFiltrados.map((produto) => {
                        const status = obterStatusProduto(produto);

                        return (
                          <tr key={produto.id}>
                            <td>
                              <div className="product-cell">
                                <div className="product-mini-icon">
                                  <Package size={17} />
                                </div>

                                <div>
                                  <span className="product-name">
                                    {produto.nome}
                                  </span>
                                  <span>ID #{produto.id}</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="category-text">
                                {produto.categoria}
                              </span>
                            </td>

                            <td>
                              <span className="table-price">
                                {formatarMoeda(produto.preco)}
                              </span>
                            </td>

                            <td>
                              <span className="stock-number">
                                {produto.estoque}
                              </span>
                            </td>

                            <td>
                              <span className={`status-badge ${status.classe}`}>
                                {status.texto}
                              </span>
                            </td>

                            <td>
                              <div className="table-actions">
                                <button
                                  className="icon-button view-icon"
                                  title="Visualizar"
                                  onClick={() => abrirDetalhesProduto(produto)}
                                >
                                  <Eye size={15} />
                                </button>

                                <button
                                  className="icon-button"
                                  title="Editar"
                                  onClick={() => abrirEditarProduto(produto)}
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  className="icon-button danger-icon"
                                  title="Excluir"
                                  onClick={() => abrirExclusaoProduto(produto)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {pagina === "vendas" && (
          <>
            <div className="page-header">
              <div>
                <h1>Vendas</h1>
                <p>Registre e acompanhe as vendas realizadas.</p>
              </div>

              <button className="primary-button" onClick={abrirNovaVenda}>
                <Plus size={17} />
                Nova venda
              </button>
            </div>

            <div className="sales-summary">
              <div className="summary-card">
                <span>Faturamento</span>
                <strong>{formatarMoeda(faturamentoVendas)}</strong>
                <small>Vendas concluídas</small>
              </div>

              <div className="summary-card">
                <span>Pedidos</span>
                <strong>{pedidosRealizados}</strong>
                <small>Pedidos concluídos</small>
              </div>

              <div className="summary-card">
                <span>Itens vendidos</span>
                <strong>{unidadesVendidas}</strong>
                <small>Unidades vendidas</small>
              </div>

              <div className="summary-card">
                <span>Ticket médio</span>
                <strong>{formatarMoeda(ticketMedio)}</strong>
                <small>Média por pedido</small>
              </div>
            </div>

            <section className="panel">
              <div className="panel-header sales-history-header">
                <div>
                  <h2>Histórico de vendas</h2>
                  <p>Acompanhe todas as vendas realizadas.</p>
                </div>

                <div className="search-wrapper sales-search-wrapper">
                  <Search size={17} />

                  <input
                    type="text"
                    placeholder="Buscar venda..."
                    value={pesquisaVendas}
                    onChange={(event) => setPesquisaVendas(event.target.value)}
                  />
                </div>
              </div>

              {vendasFiltradas.length === 0 ? (
                <div className="empty-state">Nenhuma venda encontrada.</div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Venda</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Total</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendasFiltradas.map((venda) => (
                        <tr key={venda.id}>
                          <td>#{String(venda.id).slice(-6)}</td>

                          <td>
                            <span className="product-name">
                              {venda.produto}
                            </span>
                          </td>

                          <td>{venda.quantidade}</td>

                          <td>
                            <span className="sale-total">
                              {formatarMoeda(venda.total)}
                            </span>
                          </td>

                          <td>
                            <span className="table-time">
                              {formatarDataHora(venda.data)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                venda.status === "cancelada"
                                  ? "status-cancelada"
                                  : "status-concluida"
                              }`}
                            >
                              {venda.status === "cancelada"
                                ? "Cancelada"
                                : "Concluída"}
                            </span>
                          </td>

                          <td>
                            <button
                              className="icon-button view-icon"
                              title="Ver detalhes"
                              onClick={() => setModalDetalhesVenda(venda)}
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {pagina === "estoque" && (
          <>
            <div className="page-header">
              <div>
                <h1>Estoque</h1>
                <p>Controle entradas, saídas e movimentações do estoque.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => abrirMovimentacaoEstoque("entrada")}
              >
                <Plus size={17} />
                Movimentar estoque
              </button>
            </div>

            <div className="stock-summary">
              <div className="stock-card">
                <span>Total em estoque</span>
                <strong>{totalUnidadesEstoque}</strong>
                <small>Unidades disponíveis</small>
              </div>

              <div className="stock-card">
                <span>Produtos cadastrados</span>
                <strong>{produtos.length}</strong>
                <small>Itens no catálogo</small>
              </div>

              <div className="stock-card warning">
                <span>Estoque baixo</span>
                <strong>{estoqueBaixo.length}</strong>
                <small>Até {limiteEstoqueBaixo} unidades</small>
              </div>

              <div className="stock-card danger">
                <span>Sem estoque</span>
                <strong>{produtosSemEstoque.length}</strong>
                <small>Produtos zerados</small>
              </div>
            </div>

            <div className="stock-summary stock-summary-secondary">
              <div className="stock-card">
                <span>Valor em estoque</span>
                <strong>{formatarMoeda(valorTotalEstoque)}</strong>
                <small>Valor estimado dos produtos</small>
              </div>

              <div className="stock-card">
                <span>Entradas registradas</span>
                <strong className="stock-entry-value">
                  +{entradasEstoque}
                </strong>
                <small>Unidades movimentadas</small>
              </div>

              <div className="stock-card">
                <span>Saídas registradas</span>
                <strong className="stock-exit-value">-{saidasEstoque}</strong>
                <small>Unidades movimentadas</small>
              </div>

              <div className="stock-card">
                <span>Movimentações</span>
                <strong>{movimentacoes.length}</strong>
                <small>Registros no histórico</small>
              </div>
            </div>

            <section className="panel">
              <div className="panel-header stock-header">
                <div>
                  <h2>Controle de estoque</h2>
                  <p>Visualize a quantidade atual de cada produto.</p>
                </div>

                <div className="search-wrapper stock-search-wrapper">
                  <Search size={17} />

                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={pesquisaEstoque}
                    onChange={(event) => setPesquisaEstoque(event.target.value)}
                  />
                </div>
              </div>

              {estoqueFiltrado.length === 0 ? (
                <div className="empty-state">Nenhum produto encontrado.</div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                        <th>Status</th>
                        <th>Ações</th>
                      </tr>
                    </thead>

                    <tbody>
                      {estoqueFiltrado.map((produto) => {
                        const status = obterStatusProduto(produto);

                        return (
                          <tr key={produto.id}>
                            <td>
                              <span className="product-name">
                                {produto.nome}
                              </span>
                            </td>

                            <td>{produto.categoria}</td>

                            <td>
                              <strong className="stock-number">
                                {produto.estoque}
                              </strong>
                            </td>

                            <td>
                              <span className={`status-badge ${status.classe}`}>
                                {status.texto}
                              </span>
                            </td>

                            <td>
                              <div className="stock-actions">
                                <button
                                  className="small-button entry"
                                  onClick={() => {
                                    setFormEstoque({
                                      produtoId: produto.id,
                                      tipo: "entrada",
                                      quantidade: 1,
                                    });

                                    setModalEstoque(true);
                                  }}
                                >
                                  <ArrowDownToLine size={14} />
                                  Entrada
                                </button>

                                <button
                                  className="small-button exit"
                                  onClick={() => {
                                    setFormEstoque({
                                      produtoId: produto.id,
                                      tipo: "saida",
                                      quantidade: 1,
                                    });

                                    setModalEstoque(true);
                                  }}
                                >
                                  <ArrowUp size={14} />
                                  Saída
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header stock-history-header">
                <div>
                  <h2>Histórico de movimentações</h2>
                  <p>
                    Acompanhe entradas, saídas, vendas e ajustes de estoque.
                  </p>
                </div>
              </div>

              <div className="movement-filters">
                <div className="search-wrapper movement-search-wrapper">
                  <Search size={17} />

                  <input
                    type="text"
                    placeholder="Buscar produto ou origem..."
                    value={pesquisaMovimentacoes}
                    onChange={(event) =>
                      setPesquisaMovimentacoes(event.target.value)
                    }
                  />
                </div>

                <div className="filter-control movement-filter-control">
                  <Filter size={15} />

                  <select
                    value={filtroMovimentacao}
                    onChange={(event) =>
                      setFiltroMovimentacao(event.target.value)
                    }
                  >
                    <option value="todas">Todas as movimentações</option>
                    <option value="entrada">Apenas entradas</option>
                    <option value="saida">Apenas saídas</option>
                  </select>
                </div>
              </div>

              {movimentacoesFiltradas.length === 0 ? (
                <div className="empty-state movement-empty-state">
                  <div>
                    <History size={25} />
                    <strong>Nenhuma movimentação encontrada</strong>
                    <span>As movimentações de estoque aparecerão aqui.</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="movement-history-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Estoque</th>
                        <th>Origem</th>
                        <th>Data e hora</th>
                      </tr>
                    </thead>

                    <tbody>
                      {movimentacoesFiltradas.map((movimentacao) => (
                        <tr key={movimentacao.id}>
                          <td>
                            <div className="movement-product-cell">
                              <div
                                className={`movement-icon ${movimentacao.tipo}`}
                              >
                                {movimentacao.tipo === "entrada" ? (
                                  <TrendingUp size={16} />
                                ) : (
                                  <TrendingDown size={16} />
                                )}
                              </div>

                              <div>
                                <span className="product-name">
                                  {movimentacao.produto}
                                </span>

                                {movimentacao.vendaId && (
                                  <small>
                                    Venda #
                                    {String(movimentacao.vendaId).slice(-6)}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`movement-type-badge ${movimentacao.tipo}`}
                            >
                              {movimentacao.tipo === "entrada"
                                ? "Entrada"
                                : "Saída"}
                            </span>
                          </td>

                          <td>
                            <strong
                              className={`movement-table-quantity ${movimentacao.tipo}`}
                            >
                              {movimentacao.tipo === "entrada" ? "+" : "-"}
                              {movimentacao.quantidade}
                            </strong>
                          </td>

                          <td>
                            <div className="stock-transition">
                              <span>{movimentacao.estoqueAnterior ?? "-"}</span>

                              <ChevronRight size={14} />

                              <strong>{movimentacao.estoqueApos ?? "-"}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="movement-origin">
                              {movimentacao.origem || "Movimentação manual"}
                            </span>
                          </td>

                          <td>
                            <span className="table-time">
                              {formatarDataHora(movimentacao.data)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {pagina === "relatorios" && (
          <>
            <div className="page-header">
              <div>
                <h1>Relatórios</h1>
                <p>Acompanhe o desempenho comercial da sua loja.</p>
              </div>
            </div>

            <div className="sales-summary">
              <div className="summary-card">
                <span>Faturamento</span>
                <strong>{formatarMoeda(faturamentoRelatorio)}</strong>
                <small>Vendas concluídas</small>
              </div>

              <div className="summary-card">
                <span>Pedidos</span>
                <strong>{quantidadeVendasRelatorio}</strong>
                <small>Pedidos concluídos</small>
              </div>

              <div className="summary-card">
                <span>Itens vendidos</span>
                <strong>{unidadesVendidas}</strong>
                <small>Unidades vendidas</small>
              </div>

              <div className="summary-card">
                <span>Ticket médio</span>
                <strong>{formatarMoeda(ticketMedio)}</strong>
                <small>Média por pedido</small>
              </div>
            </div>

            <div className="dashboard-grid">
              <section className="panel chart-panel">
                <div className="panel-header">
                  <div>
                    <h2>Faturamento dos últimos 7 dias</h2>
                    <p>Desempenho das vendas por dia</p>
                  </div>
                </div>

                {renderGrafico()}
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h2>Destaques</h2>
                    <p>Indicadores comerciais</p>
                  </div>
                </div>

                <div className="summary-list">
                  <div>
                    <span>Produto mais vendido</span>
                    <strong>{produtosMaisVendidos[0]?.produto || "-"}</strong>
                  </div>

                  <div>
                    <span>Maior faturamento</span>
                    <strong>
                      {produtosMaiorFaturamento[0]
                        ? formatarMoeda(produtosMaiorFaturamento[0].faturamento)
                        : "-"}
                    </strong>
                  </div>

                  <div>
                    <span>Unidades em estoque</span>
                    <strong>{totalUnidadesEstoque}</strong>
                  </div>

                  <div>
                    <span>Valor em estoque</span>
                    <strong>{formatarMoeda(valorTotalEstoque)}</strong>
                  </div>
                </div>
              </section>
            </div>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Desempenho dos produtos</h2>
                  <p>Produtos com vendas registradas.</p>
                </div>
              </div>

              {produtosMaisVendidos.length === 0 ? (
                <div className="empty-state">
                  Nenhuma venda registrada ainda.
                </div>
              ) : (
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Quantidade vendida</th>
                        <th>Faturamento</th>
                      </tr>
                    </thead>

                    <tbody>
                      {produtosMaisVendidos.map((item) => (
                        <tr key={item.produto}>
                          <td>
                            <span className="product-name">{item.produto}</span>
                          </td>

                          <td>{item.quantidade}</td>

                          <td>
                            <span className="sale-total">
                              {formatarMoeda(item.faturamento)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Situação do estoque</h2>
                  <p>Visão geral da disponibilidade dos produtos.</p>
                </div>
              </div>

              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Estoque</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtos.map((produto) => {
                      const status = obterStatusProduto(produto);

                      return (
                        <tr key={produto.id}>
                          <td>
                            <span className="product-name">{produto.nome}</span>
                          </td>

                          <td>{produto.estoque}</td>

                          <td>
                            <span className={`status-badge ${status.classe}`}>
                              {status.texto}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {pagina === "configuracoes" && (
          <>
            <div className="page-header">
              <div>
                <h1>Configurações</h1>
                <p>Personalize as informações do sistema.</p>
              </div>
            </div>

            <section className="panel settings-panel">
              <div className="panel-header">
                <div>
                  <h2>Configurações gerais</h2>
                  <p>Essas informações serão utilizadas no painel.</p>
                </div>
              </div>

              <form onSubmit={salvarConfiguracoes}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome da loja</label>

                    <input
                      type="text"
                      value={configuracoes.nomeLoja}
                      onChange={(event) =>
                        setConfiguracoes({
                          ...configuracoes,
                          nomeLoja: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Nome do administrador</label>

                    <input
                      type="text"
                      value={configuracoes.nomeAdmin}
                      onChange={(event) =>
                        setConfiguracoes({
                          ...configuracoes,
                          nomeAdmin: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>E-mail</label>

                    <input
                      type="email"
                      value={configuracoes.email}
                      onChange={(event) =>
                        setConfiguracoes({
                          ...configuracoes,
                          email: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Telefone</label>

                    <input
                      type="text"
                      value={configuracoes.telefone}
                      onChange={(event) =>
                        setConfiguracoes({
                          ...configuracoes,
                          telefone: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Limite para estoque baixo</label>

                  <input
                    type="number"
                    min="0"
                    value={configuracoes.limiteEstoqueBaixo}
                    onChange={(event) =>
                      setConfiguracoes({
                        ...configuracoes,
                        limiteEstoqueBaixo: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={restaurarConfiguracoes}
                  >
                    Restaurar padrão
                  </button>

                  <button type="submit" className="primary-button">
                    Salvar configurações
                  </button>
                </div>
              </form>
            </section>
          </>
        )}
      </main>

      {modalProduto && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalProduto(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{produtoEditando ? "Editar produto" : "Novo produto"}</h2>

                <p>
                  {produtoEditando
                    ? "Atualize as informações do produto."
                    : "Cadastre um novo produto no sistema."}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalProduto(false)}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={salvarProduto}>
              <div className="form-group">
                <label>Nome do produto</label>

                <input
                  type="text"
                  value={formProduto.nome}
                  onChange={(event) =>
                    setFormProduto({
                      ...formProduto,
                      nome: event.target.value,
                    })
                  }
                  placeholder="Ex.: Camiseta Basic"
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>

                <input
                  type="text"
                  value={formProduto.categoria}
                  onChange={(event) =>
                    setFormProduto({
                      ...formProduto,
                      categoria: event.target.value,
                    })
                  }
                  placeholder="Ex.: Roupas"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço</label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formProduto.preco}
                    onChange={(event) =>
                      setFormProduto({
                        ...formProduto,
                        preco: event.target.value,
                      })
                    }
                    placeholder="0,00"
                  />
                </div>

                <div className="form-group">
                  <label>Estoque inicial</label>

                  <input
                    type="number"
                    min="0"
                    value={formProduto.estoque}
                    onChange={(event) =>
                      setFormProduto({
                        ...formProduto,
                        estoque: event.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalProduto(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary-button">
                  {produtoEditando ? "Salvar alterações" : "Cadastrar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalhesProduto && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalDetalhesProduto(null);
            }
          }}
        >
          <div className="modal product-detail-modal">
            <div className="modal-header">
              <div>
                <h2>Detalhes do produto</h2>
                <p>Informações completas do produto.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalDetalhesProduto(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="product-detail-content">
              <div className="product-detail-hero">
                <div className="product-detail-icon">
                  <Package size={24} />
                </div>

                <div>
                  <span>Produto</span>

                  <h3>{modalDetalhesProduto.nome}</h3>

                  <small>ID #{modalDetalhesProduto.id}</small>
                </div>
              </div>

              <div className="product-detail-grid">
                <div className="product-detail-card">
                  <span>Categoria</span>
                  <strong>{modalDetalhesProduto.categoria}</strong>
                </div>

                <div className="product-detail-card">
                  <span>Preço</span>
                  <strong>{formatarMoeda(modalDetalhesProduto.preco)}</strong>
                </div>

                <div className="product-detail-card">
                  <span>Estoque atual</span>
                  <strong>{modalDetalhesProduto.estoque} unidades</strong>
                </div>

                <div className="product-detail-card">
                  <span>Situação</span>

                  <span
                    className={`status-badge ${
                      obterStatusProduto(modalDetalhesProduto).classe
                    }`}
                  >
                    {obterStatusProduto(modalDetalhesProduto).texto}
                  </span>
                </div>
              </div>
            </div>

            <div className="product-detail-actions modal-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  abrirEditarProduto(modalDetalhesProduto);
                  setModalDetalhesProduto(null);
                }}
              >
                <Pencil size={15} />
                Editar produto
              </button>

              <button
                className="danger-button"
                onClick={() => {
                  abrirExclusaoProduto(modalDetalhesProduto);
                  setModalDetalhesProduto(null);
                }}
              >
                <Trash2 size={15} />
                Excluir produto
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVenda && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalVenda(false);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>Nova venda</h2>
                <p>Registre uma nova venda.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalVenda(false)}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={salvarVenda}>
              <div className="form-group">
                <label>Produto</label>

                <select
                  value={formVenda.produtoId}
                  onChange={(event) =>
                    setFormVenda({
                      ...formVenda,
                      produtoId: event.target.value,
                    })
                  }
                >
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </select>
              </div>

              {vendaSelecionadaProduto && (
                <div className="sale-product-info">
                  <span>Estoque disponível</span>
                  <strong>{vendaSelecionadaProduto.estoque} unidades</strong>
                </div>
              )}

              <div className="form-group">
                <label>Quantidade</label>

                <input
                  type="number"
                  min="1"
                  max={vendaSelecionadaProduto?.estoque || undefined}
                  value={formVenda.quantidade}
                  onChange={(event) =>
                    setFormVenda({
                      ...formVenda,
                      quantidade: event.target.value,
                    })
                  }
                />
              </div>

              <div className="sale-total-preview">
                <span>Total da venda</span>
                <strong>{formatarMoeda(totalVenda)}</strong>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalVenda(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary-button">
                  <ShoppingCart size={16} />
                  Registrar venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalEstoque && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalEstoque(false);
            }
          }}
        >
          <div className="modal stock-movement-modal">
            <div className="modal-header">
              <div>
                <h2>Movimentar estoque</h2>
                <p>Registre uma entrada ou saída manual.</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalEstoque(false)}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={salvarMovimentacao}>
              <div className="form-group">
                <label>Produto</label>

                <select
                  value={formEstoque.produtoId}
                  onChange={(event) => {
                    setFormEstoque((estadoAtual) => ({
                      ...estadoAtual,
                      produtoId: event.target.value,
                    }));
                  }}
                >
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de movimentação</label>

                <select
                  value={tipoMovimentacao}
                  onChange={(event) => {
                    const novoTipo =
                      event.target.value === "saida" ? "saida" : "entrada";

                    setFormEstoque((estadoAtual) => ({
                      ...estadoAtual,
                      tipo: novoTipo,
                    }));
                  }}
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade</label>

                <input
                  type="number"
                  min="1"
                  max={
                    tipoMovimentacao === "saida"
                      ? estoqueAtualSelecionado
                      : undefined
                  }
                  value={formEstoque.quantidade}
                  onChange={(event) => {
                    setFormEstoque((estadoAtual) => ({
                      ...estadoAtual,
                      quantidade: event.target.value,
                    }));
                  }}
                />
              </div>

              <div className={`stock-movement-preview ${tipoMovimentacao}`}>
                <div>
                  <span>Estoque atual</span>
                  <strong>{estoqueAtualSelecionado}</strong>
                </div>

                <ChevronRight size={17} />

                <div>
                  <span>Após movimentação</span>
                  <strong>{novoEstoqueMovimentacao}</strong>
                </div>
              </div>

              {tipoMovimentacao === "saida" &&
                quantidadeMovimentacao > estoqueAtualSelecionado && (
                  <div className="stock-error-message">
                    <AlertTriangle size={15} />A quantidade da saída é maior que
                    o estoque disponível.
                  </div>
                )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalEstoque(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    tipoMovimentacao === "saida" &&
                    quantidadeMovimentacao > estoqueAtualSelecionado
                  }
                >
                  {tipoMovimentacao === "entrada" ? (
                    <ArrowDownToLine size={16} />
                  ) : (
                    <ArrowUp size={16} />
                  )}
                  Registrar{" "}
                  {tipoMovimentacao === "entrada" ? "entrada" : "saída"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDetalhesVenda && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalDetalhesVenda(null);
            }
          }}
        >
          <div className="modal sale-detail-modal">
            <div className="modal-header">
              <div>
                <h2>Detalhes da venda</h2>

                <p>Venda #{String(modalDetalhesVenda.id).slice(-6)}</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setModalDetalhesVenda(null)}
              >
                <X size={17} />
              </button>
            </div>

            <div className="sale-detail">
              <div className="sale-detail-row">
                <span>Produto</span>
                <strong>{modalDetalhesVenda.produto}</strong>
              </div>

              <div className="sale-detail-row">
                <span>Categoria</span>
                <strong>{modalDetalhesVenda.categoria}</strong>
              </div>

              <div className="sale-detail-row">
                <span>Quantidade</span>
                <strong>{modalDetalhesVenda.quantidade}</strong>
              </div>

              <div className="sale-detail-row">
                <span>Preço unitário</span>

                <strong>
                  {formatarMoeda(modalDetalhesVenda.precoUnitario)}
                </strong>
              </div>

              <div className="sale-detail-row">
                <span>Data</span>
                <strong>{formatarDataHora(modalDetalhesVenda.data)}</strong>
              </div>

              <div className="sale-detail-row">
                <span>Status</span>

                <strong>
                  {modalDetalhesVenda.status === "cancelada"
                    ? "Cancelada"
                    : "Concluída"}
                </strong>
              </div>

              <div className="sale-detail-row total-row">
                <span>Total</span>
                <strong>{formatarMoeda(modalDetalhesVenda.total)}</strong>
              </div>

              {modalDetalhesVenda.status === "cancelada" && (
                <div className="cancelled-info">
                  Esta venda foi cancelada em{" "}
                  {formatarDataHora(modalDetalhesVenda.canceladaEm)}. O estoque
                  foi devolvido automaticamente.
                </div>
              )}
            </div>

            {modalDetalhesVenda.status !== "cancelada" && (
              <div className="modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setModalDetalhesVenda(null)}
                >
                  Fechar
                </button>

                <button
                  className="danger-button"
                  onClick={() => cancelarVenda(modalDetalhesVenda)}
                >
                  <X size={15} />
                  Cancelar venda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {produtoExcluindo && (
        <div
          className="modal-overlay delete-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setProdutoExcluindo(null);
            }
          }}
        >
          <div className="modal delete-modal">
            <div className="delete-modal-icon">
              <AlertTriangle size={24} />
            </div>

            <div className="delete-modal-content">
              <h2>Excluir produto?</h2>

              <p>
                Você realmente deseja excluir o produto{" "}
                <strong>{produtoExcluindo.nome}</strong>?
              </p>

              <span>
                Essa ação removerá o produto do sistema e não poderá ser
                desfeita.
              </span>
            </div>

            <div className="modal-actions delete-modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setProdutoExcluindo(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="danger-button delete-confirm-button"
                onClick={confirmarExclusaoProduto}
              >
                <Trash2 size={16} />
                Excluir produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
