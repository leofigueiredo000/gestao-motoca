let entregas = [];
let motoqueiros = [];
let filtrosAtivos = {
  status: "todos",
  pagamento: "todos",
  pago: "todos",
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnAdicionarEntrega").onclick = adicionarEntrega;
  document.getElementById("btnAdicionarMotoqueiro").onclick =
    adicionarMotoqueiro;
  document.getElementById("btnLimparTudo").onclick = limparTudo;
  document.getElementById("btnAplicarFiltros").onclick = aplicarFiltros;
  document.getElementById("btnLimparFiltros").onclick = limparFiltros;

  // Setar hora atual como padrão
  const now = new Date();
  const timeString =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");
  document.getElementById("horaEntrega").value = timeString;

  carregarDados();
  renderizar();
});

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
  ev.target.classList.add("dragging");
}

function drop(ev) {
  ev.preventDefault();
  const dataId = ev.dataTransfer.getData("text/plain");
  const entrega = document.getElementById(dataId);
  entrega.classList.remove("dragging");

  if (
    ev.target.classList.contains("motoqueiro") ||
    ev.target.classList.contains("entregas")
  ) {
    ev.target.appendChild(entrega);
    atualizarEntregaNoArray(dataId, ev.target.id);
    atualizarBadgesETotais();
    salvarDados();
  }
}

function dragEnd(ev) {
  ev.target.classList.remove("dragging");
}

function adicionarEntrega() {
  const input = document.getElementById("novaEntrega");
  const valorInput = document.getElementById("valorEntrega");
  const forma = document.getElementById("formaPagamento").value;
  const status = document.getElementById("statusEntrega").value;
  const hora = document.getElementById("horaEntrega").value;
  const pago = document.getElementById("estaPago").checked;
  const texto = input.value.trim();
  const valor = parseFloat(valorInput.value) || 0;

  if (texto !== "") {
    entregas.push({
      id: "entrega_" + Date.now(),
      descricao: texto,
      valor: valor,
      formaPagamento: forma,
      status: status,
      hora: hora,
      estaPago: pago,
      destino: "entregas",
    });

    // Limpar campos
    input.value = "";
    valorInput.value = "";
    document.getElementById("estaPago").checked = false;

    salvarDados();
    renderizar();
  }
}

function adicionarMotoqueiro(nome = "Motoqueiro") {
  motoqueiros.push({ id: "motoqueiro_" + Date.now(), nome });
  salvarDados();
  renderizar();
}

function atualizarEntregaNoArray(idEntrega, novoDestino) {
  entregas.forEach((e) => {
    if (e.id === idEntrega) {
      e.destino = novoDestino;
    }
  });
}

function atualizarBadgesETotais() {
  motoqueiros.forEach((m) => {
    const entregasMoto = entregas.filter((e) => e.destino === m.id);
    const badge = document.querySelector(`#${m.id} .badge`);
    const total = document.querySelector(`#${m.id} .total`);

    if (badge) badge.textContent = entregasMoto.length;
    if (total) {
      const valorTotal = entregasMoto.reduce((sum, e) => sum + e.valor, 0);
      total.textContent = `R$ ${valorTotal.toFixed(2)}`;
    }
  });
}

function salvarDados() {
  localStorage.setItem("entregas", JSON.stringify(entregas));
  localStorage.setItem("motoqueiros", JSON.stringify(motoqueiros));
}

function carregarDados() {
  const entregasSalvas = localStorage.getItem("entregas");
  const motoqueirosSalvos = localStorage.getItem("motoqueiros");
  if (entregasSalvas) entregas = JSON.parse(entregasSalvas);
  if (motoqueirosSalvos) motoqueiros = JSON.parse(motoqueirosSalvos);
}

function limparTudo() {
  if (
    confirm(
      "Tem certeza que deseja limpar TODOS os dados? Isso não pode ser desfeito."
    )
  ) {
    entregas = [];
    motoqueiros = [];
    salvarDados();
    location.reload();
  }
}

function deletarMotoqueiro(id) {
  if (
    confirm(
      "Deseja remover este motoqueiro e retornar suas entregas para disponíveis?"
    )
  ) {
    entregas.forEach((e) => {
      if (e.destino === id) e.destino = "entregas";
    });
    motoqueiros = motoqueiros.filter((m) => m.id !== id);
    salvarDados();
    renderizar();
  }
}

function deletarEntrega(id) {
  if (confirm("Deseja realmente excluir esta entrega?")) {
    entregas = entregas.filter((e) => e.id !== id);
    salvarDados();
    renderizar();
  }
}

function editarEntrega(id) {
  const entrega = entregas.find((e) => e.id === id);
  if (entrega) {
    // Preencher formulário com os dados da entrega
    document.getElementById("novaEntrega").value = entrega.descricao;
    document.getElementById("valorEntrega").value = entrega.valor;
    document.getElementById("formaPagamento").value = entrega.formaPagamento;
    document.getElementById("statusEntrega").value = entrega.status;
    document.getElementById("horaEntrega").value = entrega.hora;
    document.getElementById("estaPago").checked = entrega.estaPago;

    // Remover a entrega antiga
    entregas = entregas.filter((e) => e.id !== id);

    // Focar no campo de descrição
    document.getElementById("novaEntrega").focus();
  }
}

function aplicarFiltros() {
  filtrosAtivos = {
    status: document.getElementById("filtroStatus").value,
    pagamento: document.getElementById("filtroPagamento").value,
    pago: document.getElementById("filtroPago").value,
  };
  renderizar();
}

function limparFiltros() {
  document.getElementById("filtroStatus").value = "todos";
  document.getElementById("filtroPagamento").value = "todos";
  document.getElementById("filtroPago").value = "todos";
  filtrosAtivos = {
    status: "todos",
    pagamento: "todos",
    pago: "todos",
  };
  renderizar();
}

function filtrarEntregas(entregas) {
  return entregas.filter((e) => {
    const statusMatch =
      filtrosAtivos.status === "todos" || e.status === filtrosAtivos.status;
    const pagamentoMatch =
      filtrosAtivos.pagamento === "todos" ||
      e.formaPagamento === filtrosAtivos.pagamento;
    const pagoMatch =
      filtrosAtivos.pago === "todos" ||
      (filtrosAtivos.pago === "pago" && e.estaPago) ||
      (filtrosAtivos.pago === "nao-pago" && !e.estaPago);

    return statusMatch && pagamentoMatch && pagoMatch;
  });
}

function renderizar() {
  const entregasDiv = document.getElementById("entregas");
  const motoqueirosDiv = document.getElementById("motoqueiros");

  entregasDiv.innerHTML = "<h3>Entregas Disponíveis</h3>";
  motoqueirosDiv.innerHTML = "";

  // Entregas disponíveis
  const entregasDisponiveis = entregas.filter((e) => e.destino === "entregas");
  const entregasFiltradas = filtrarEntregas(entregasDisponiveis);

  entregasFiltradas.forEach((e) => {
    entregasDiv.appendChild(criarElementoEntrega(e));
  });

  // Motoqueiros
  motoqueiros.forEach((m) => {
    const motoqueiro = document.createElement("div");
    motoqueiro.className = "motoqueiro";
    motoqueiro.id = m.id;
    motoqueiro.ondrop = drop;
    motoqueiro.ondragover = allowDrop;

    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.className = "nome-motoqueiro";
    inputNome.value = m.nome;
    inputNome.oninput = (event) => {
      m.nome = event.target.value;
      salvarDados();
    };

    const badge = document.createElement("span");
    badge.className = "badge";

    const total = document.createElement("span");
    total.className = "total";

    const botaoDeletar = document.createElement("button");
    botaoDeletar.textContent = "Excluir";
    botaoDeletar.className = "botao-deletar";
    botaoDeletar.onclick = () => deletarMotoqueiro(m.id);

    motoqueiro.appendChild(inputNome);
    motoqueiro.appendChild(badge);
    motoqueiro.appendChild(total);
    motoqueiro.appendChild(botaoDeletar);

    // Entregas do motoqueiro (aplicando filtros)
    const entregasMotoqueiro = entregas.filter((e) => e.destino === m.id);
    const entregasMotoFiltradas = filtrarEntregas(entregasMotoqueiro);

    entregasMotoFiltradas.forEach((e) => {
      motoqueiro.appendChild(criarElementoEntrega(e));
    });

    // Atualizar badge e total
    const badgeElement = motoqueiro.querySelector(".badge");
    const totalElement = motoqueiro.querySelector(".total");

    if (badgeElement) badgeElement.textContent = entregasMotoqueiro.length;
    if (totalElement) {
      const valorTotal = entregasMotoqueiro.reduce(
        (sum, e) => sum + e.valor,
        0
      );
      totalElement.textContent = `R$ ${valorTotal.toFixed(2)}`;
    }

    motoqueirosDiv.appendChild(motoqueiro);
  });
}

function criarElementoEntrega(e) {
  const entrega = document.createElement("div");
  entrega.className =
    "entrega " + (e.formaPagamento === "Dinheiro" ? "dinheiro" : "cartao");
  entrega.id = e.id;
  entrega.draggable = true;
  entrega.ondragstart = drag;
  entrega.ondragend = dragEnd;

  const info = document.createElement("div");
  info.className = "entrega-info";
  info.innerHTML = `
    <strong>${e.descricao}</strong>
    <div class="valor">R$ ${e.valor.toFixed(2)}</div>
    <small>${e.formaPagamento === "Dinheiro" ? "💵 Dinheiro" : "💳 Cartão"} • ${
    e.hora
  }</small>
    <span class="status-badge ${e.status}">${getStatusText(e.status)}</span>
  `;

  const actions = document.createElement("div");
  actions.className = "entrega-actions";

  const status = document.createElement("div");
  status.className = e.estaPago ? "pago" : "nao-pago";
  status.innerHTML = e.estaPago ? "✔️" : "❌";

  const btnEditar = document.createElement("button");
  btnEditar.className = "btn-editar";
  btnEditar.innerHTML = "✏️";
  btnEditar.onclick = () => editarEntrega(e.id);

  const btnExcluir = document.createElement("button");
  btnExcluir.className = "btn-editar";
  btnExcluir.innerHTML = "🗑️";
  btnExcluir.onclick = () => deletarEntrega(e.id);

  actions.appendChild(status);
  actions.appendChild(btnEditar);
  actions.appendChild(btnExcluir);

  entrega.appendChild(info);
  entrega.appendChild(actions);

  return entrega;
}

function getStatusText(status) {
  const statusMap = {
    pendente: "Pendente",
    andamento: "Em andamento",
    concluida: "Concluída",
  };
  return statusMap[status] || status;
}
