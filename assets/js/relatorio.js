// Script para geração, visualização e impressão de relatórios de reservas

async function gerarRelatorio(event) {
    // Evita o recarregamento padrão da página ao clicar no botão
    if (event) event.preventDefault();

    try {
        const dataMapa = document.getElementById('dataRelatorio').value;
        
        // Validação no frontend: impede a busca sem data
        if (!dataMapa) {
            Swal.fire('Atenção!', 'Por favor, informe uma data para gerar o relatório.', 'warning');
            return;
        }

        const response = await fetch('../Relatorio/gerarMapa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dataMapa: dataMapa
            })
        });
        
        const result = await response.json();

        // Padronizado para verificar sucesso === true (Padrão Ouro da Controller)
        if (result.sucesso === true) {
            Swal.fire('Sucesso!', result.msg, 'success');
            preencherTabela(result.dados);
        } else {
            // Caso existam múltiplos erros de validação da Controller
            if (result.erros && result.erros.length > 0) {
                const mensagensDeErro = result.erros.map(erro => {
                    return `<p><strong>${erro.campo ?? erro.codigo}</strong> ${erro.msg}</p>`;
                }).join('');
                Swal.fire({ title: 'Erro:', html: mensagensDeErro, icon: 'error' });
            } else {
                Swal.fire('Erro', result.msg || 'Nenhum dado encontrado.', 'error');
            }
            limparTabela();
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

function preencherTabela(dados) {
    const tabela = document.getElementById('tabelaRelatorio').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ""; // Limpa a tabela antes de preencher

    // Se não vierem dados, exibe uma mensagem amigável na própria tabela
    if (!dados || dados.length === 0) {
        tabela.innerHTML = '<tr><td colspan="8" class="text-center">Nenhuma reserva encontrada para esta data.</td></tr>';
        return;
    }

    // DocumentFragment otimiza a renderização na tela (Padrão Ouro)
    const fragmento = document.createDocumentFragment();

    dados.forEach(reserva => {
        // --- MÁGICA DA DATA ---
        // Formata "YYYY-MM-DD" para "DD/MM/YYYY" direto no front-end
        let dataFormatada = reserva.datareserva;
        if (dataFormatada && dataFormatada.includes('-')) {
            const partes = dataFormatada.split('-');
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        // Evita exibir "undefined - undefined" caso os campos venham vazios
        const descSalaCompleta = reserva.desc_codigo ? `${reserva.desc_codigo} - ${reserva.desc_sala}` : reserva.desc_sala;

        const linha = document.createElement('tr');
        
        // Preenche as 8 colunas exatas da nossa tabela HTML
        linha.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${descSalaCompleta}</td>
            <td>${reserva.desc_turma}</td>
            <td>${reserva.nome_professor}</td>
            <td>${reserva.desc_periodo}</td>
            <td></td> <td></td> <td></td> `;
        
        fragmento.appendChild(linha);
    });

    tabela.appendChild(fragmento);
}

function limparTabela() {
    document.getElementById('tabelaRelatorio').getElementsByTagName('tbody')[0].innerHTML = "";
}

function imprimirRelatorio(tabelaId, event) {
    if (event) event.preventDefault();

    let tabelaVerifica = document.getElementById(tabelaId);

    // Verificar se há pelo menos uma linha de dados (excluindo cabeçalho)
    let linhas = tabelaVerifica.getElementsByTagName('tr');

    if (linhas.length <= 1) {
        Swal.fire('Atenção', 'Por favor, gere o relatório primeiro, informando uma data.', 'warning');
        return;
    } else {
        let tabela = document.getElementById(tabelaId).outerHTML;
        let janela = window.open('', '', 'width=900,height=600');
        janela.document.write('<html><head><title>Relatório de Chaves</title>');
        janela.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; text-align: left; }</style> ');
        janela.document.write('</head><body>');
        janela.document.write('<h2>Relatório de Chaves</h2>');
        janela.document.write(tabela);
        janela.document.write('</body></html>');
        janela.document.close();
        janela.print();
    }
}

function imprimirRelatorioVisualizacao(event) {
    if (event) event.preventDefault();

    let tabelaVerifica = document.getElementById('tabelaRelatorio');

    // Verificar se há pelo menos uma linha de dados (excluindo cabeçalho)
    let linhas = tabelaVerifica.getElementsByTagName('tr');

    if (linhas.length <= 1) {
        Swal.fire('Atenção', 'Por favor, gere o relatório primeiro, informando uma data.', 'warning');
        return;
    } else {
        // Clona a tabela para não afetar a visualização da tela principal
        let tabela = document.getElementById('tabelaRelatorio').cloneNode(true);
        
        // Remove as 3 últimas colunas (Retirada, Entrega e Visto) de todas as linhas
        for (let i = 0; i < 3; i++) {
            for (let row of tabela.rows) {
                row.deleteCell(-1);
            }
        }
        
        let janela = window.open('', '', 'width=900,height=600');
        janela.document.write('<html><head><title>Relatório de Visualização</title>');
        janela.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; text-align: left; }</style>');
        janela.document.write('</head><body>');
        janela.document.write('<h2>Relatório de Visualização</h2>');
        janela.document.write(tabela.outerHTML);
        janela.document.write('</body></html>');
        janela.document.close();
        janela.print();
    }
}

function imprimirRelatorioTV(event) {
    if (event) event.preventDefault();

    // Captura as linhas do corpo da tabela gerada
    const dadosTabela = document.getElementById('tabelaRelatorio').getElementsByTagName('tbody')[0].rows;
    
    // Trava de segurança caso a tabela esteja vazia ou contendo a mensagem de erro
    if (dadosTabela.length === 0 || (dadosTabela.length === 1 && dadosTabela[0].cells.length === 1)) {
        Swal.fire('Atenção', 'Nenhum dado disponível para exibição. Gere o relatório primeiro.', 'warning');
        return;
    }

    let conteudoHeader = document.querySelector('header');
    let containerRelatorio = document.getElementById('relatorioTV');
    let containerPrincipal = document.getElementById('conteudoPrincipal'); 

    // Esconde o conteúdo principal e exibe o relatório em tela cheia (Modo Kiosk)
    if (conteudoHeader) conteudoHeader.style.display = "none";
    if (containerPrincipal) containerPrincipal.style.display = "none";
    containerRelatorio.style.display = "flex";

    let estilos = `
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body, html { width: 100%; height: 100%; overflow: hidden; background-color: #1C1C1C; font-family: Arial, sans-serif; }
            #relatorioTV { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #1C1C1C; color: white; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 20px; z-index: 9999; }
            .card-container { display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; width: 100%; max-width: 95vw; overflow-y: auto; margin-top: 100px; padding-bottom: 20px; }
            .card { width: 220px; height: 200px; padding: 15px; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 12px; color: white; font-size: 15px; font-weight: bold; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.3); transition: transform 0.2s; }
            .card:hover { transform: scale(1.05); }
            
            /* Cores dos andares */
            .floor-0 { background-color: rgb(128, 128, 128); } /* Térreo */
            .floor-1 { background-color: rgb(52, 122, 69); }
            .floor-2 { background-color: rgb(66, 149, 226); }
            .floor-3 { background-color: rgb(178, 41, 196); }
            .floor-4 { background-color: #483D8B; }
            .floor-5 { background-color: #f7941d; }
            .floor-6 { background-color: rgb(200, 50, 50); }
            
            /* Controles do topo */
            .btn-voltar, .btn-periodo { font-size: 16px; padding: 10px 20px; cursor: pointer; border-radius: 5px; color: white; border: none; font-weight: bold; }
            .btn-voltar { position: absolute; top: 20px; left: 20px; background-color: #dc3545; }
            .btn-voltar:hover { background-color: #bb2d3b; }
            
            .btn-container { display: flex; justify-content: center; gap: 15px; position: absolute; top: 20px; width: 100%; pointer-events: none; }
            .btn-container > button { pointer-events: auto; } /* Permite clicar nos botões que estão dentro da div invisível */
            .btn-periodo { background-color: #343a40; border: 1px solid #495057; }
            .btn-periodo:hover, .btn-periodo.active { background-color: #0d6efd; border-color: #0d6efd; }
        </style>
    `;

    let conteudo = `
        <button class="btn-voltar" onclick="voltarParaPrincipal()">Voltar</button>
        <div class="btn-container">
            <button id="btn-manha" class="btn-periodo" onclick="filtrarPeriodo('manha')">Manhã</button>
            <button id="btn-tarde" class="btn-periodo" onclick="filtrarPeriodo('tarde')">Tarde</button>
            <button id="btn-noite" class="btn-periodo" onclick="filtrarPeriodo('noite')">Noite</button>
        </div>
        <div class="card-container" id="cardsContainer">
    `;

    let dadosOrdenados = [];

    // Organizar e extrair os dados da tabela
    for (let i = 0; i < dadosTabela.length; i++) {
        let data = dadosTabela[i].cells[0].innerText;
        let sala = dadosTabela[i].cells[1].innerText;
        let turma = dadosTabela[i].cells[2].innerText;
        let professor = dadosTabela[i].cells[3].innerText;
        let horario = dadosTabela[i].cells[4].innerText;

        // Extrai o número do andar da string da sala (Ex: "Sala 204" -> Andar 2)
        let andar = parseInt((sala.match(/\d+/) || [0])[0].charAt(0)) || 0;
        andar = andar > 6 ? 6 : andar;

        // Definir o período com base no texto do horário
        let periodo = 'manha'; 
        if (horario.toLowerCase().includes('tarde') || horario.includes('13:') || horario.includes('14:') || horario.includes('15:') || horario.includes('16:') || horario.includes('17:')) {
            periodo = 'tarde';
        } else if (horario.toLowerCase().includes('noite') || horario.includes('18:') || horario.includes('19:') || horario.includes('20:') || horario.includes('21:') || horario.includes('22:')) {
            periodo = 'noite';
        }

        dadosOrdenados.push({ sala, turma, professor, horario, andar, periodo });
    }

    // Ordena os cards por andar (do menor para o maior)
    dadosOrdenados.sort((a, b) => a.andar - b.andar);

    // Criar os cards visuais
    dadosOrdenados.forEach(dado => {
        conteudo += `
            <div class="card floor-${dado.andar}" data-periodo="${dado.periodo}">
                <div style="font-size: 1.2rem; margin-bottom: 8px;">${dado.sala}</div>
                <div>${dado.turma}</div>
                <div style="margin: 8px 0; color: #ffeb3b;">${dado.professor}</div>
                <div style="font-size: 0.9rem;">${dado.horario}</div>
            </div>
        `;
    });

    conteudo += `</div>`;

    // Insere os estilos e os cards na div de TV
    containerRelatorio.innerHTML = estilos + conteudo;

    // Filtra os cards para exibir apenas os da manhã por padrão ao abrir
    filtrarPeriodo('manha');
}

// Função para voltar à tela principal saindo do modo TV
function voltarParaPrincipal() {
    let conteudoHeader = document.querySelector('header');
    let containerPrincipal = document.getElementById('conteudoPrincipal');
    
    document.getElementById('relatorioTV').style.display = "none";
    if (containerPrincipal) containerPrincipal.style.display = "block";
    if (conteudoHeader) conteudoHeader.style.display = "flex";
}

// Função para filtrar os cards na visualização de TV por período
function filtrarPeriodo(periodo) {
    let cards = document.querySelectorAll('.card');
    let encontrouAlgum = false;

    cards.forEach(card => {
        // Exibe ou esconde o card baseado no atributo data-periodo
        if (card.getAttribute('data-periodo') === periodo) {
            card.style.display = 'flex';
            encontrouAlgum = true;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Atualiza a cor dos botões de filtro para mostrar qual está ativo
    document.querySelectorAll('.btn-periodo').forEach(btn => btn.classList.remove('active'));
    let btnAtivo = document.getElementById(`btn-${periodo}`);
    if (btnAtivo) btnAtivo.classList.add('active');
}