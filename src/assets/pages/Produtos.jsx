function Produtos({ produtos, onNovoProduto }) {
  return (
    <section className="panel products-panel">
      <div className="panel-header">
        <div>
          <h3>Produtos</h3>
          <p>Gerencie os produtos cadastrados na sua loja.</p>
        </div>

        <div className="product-actions">
          <input type="text" placeholder="🔎 Pesquisar produto..." />

          <button onClick={onNovoProduto}>+ Novo produto</button>
        </div>
      </div>

      <div className="table-container">
        <table>
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
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>
                  <strong>{produto.nome}</strong>
                </td>

                <td>{produto.categoria}</td>

                <td>R$ {produto.preco.toFixed(2).replace(".", ",")}</td>

                <td>{produto.estoque} unidades</td>

                <td>
                  {produto.estoque <= 10 ? (
                    <span className="status low">Estoque baixo</span>
                  ) : (
                    <span className="status available">Disponível</span>
                  )}
                </td>

                <td>
                  <button className="action-button">⋮</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Produtos;
