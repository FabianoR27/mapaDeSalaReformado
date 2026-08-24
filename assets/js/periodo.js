// Script para gerenciamento e cadastro de períodos (horários)

async function cadastro(event) {
    // Recebe o 'event' do clique do botão e previne o recarregamento padrão da página
    if (event) event.preventDefault();
    
    try {
        const descricao = document.getElementById('descricao').value;
        const horaIni = document.getElementById('horaIni').value;
        const horaFim = document.getElementById('horaFim').value;

        const response = await fetch('../Horario/inserir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                descricao: descricao,
                horaInicial: horaIni,
                horaFinal: horaFim
            })
        });

        const result = await response.json();

        // Padronizado para verificar sucesso === true
        if (result.sucesso === true) {
            // Fechar o modal
            $('#cadastroPeriodoModal').modal('hide');

            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela
            carregarDados();
        } else {
            // 1. Mapeia e junta as mensagens de erro em um bloco HTML
            const mensagensDeErro = result.erros.map(erro => {
                // Utilizamos a tag <p> para garantir que cada erro fique em uma linha separada no SweetAlert
                return `<p><strong>${erro.campo ?? erro.codigo}</strong> ${erro.msg}</p>`;
            }).join('');

            // 2. Chama o Swal.fire usando a propriedade 'html'
            Swal.fire({
                title: 'Houve(ram) erro(s) de validação:',
                html: mensagensDeErro, 
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }
    } catch (error) {
        console.error('Erro ao cadastrar o Período:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function carregarDados() {
    try {
        const response = await fetch('../Horario/consultar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: '',
                descricao: '',
                horaInicial: '',
                horaFinal: ''
            })
        });

        const data = await response.json();
        const conteudoAcesso = document.getElementById('conteudo-Periodo');

        // Limpar a tabela antes de preencher com novos dados
        conteudoAcesso.innerHTML = '';

        // Preencher a tabela com os dados recebidos
        if(data.dados) {
            data.dados.forEach(item => {
                // Formata o horário para tirar os segundos ("14:30:00" -> "14:30") se o banco retornar assim.
                // Isso evita falhas caso o input type="time" não reconheça a string completa na hora de editar.
                const horaIniFormatada = item.hora_ini ? item.hora_ini.slice(0, 5) : '';
                const horaFimFormatada = item.hora_fim ? item.hora_fim.slice(0, 5) : '';

                conteudoAcesso.innerHTML += `
                    <tr class="alert alert-warning">
                        <td>${item.codigo}</td>
                        <td>${item.descricao}</td>
                        <td>${horaIniFormatada}</td>
                        <td>${horaFimFormatada}</td>
                        <td>
                            <div class="">
                                <button type="button" class="btn btn-warning btn-sm" onclick="openEditModal(${item.codigo}, this)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-danger btn-sm" onclick="deletarPeriodo(${item.codigo})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
            });
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

$(document).ready(function () {
    carregarDados();

    $('#cadastroPeriodoModal').on('show.bs.modal', function () {
        $('#formCadastroPeriodo')[0].reset();
    });
});

function openEditModal(codigo, button) {
    // A linha do botão clicado
    const row = button.closest('tr');

    // Pegar os dados da linha (respeitando os índices corretos gerados na tabela html)
    const descricao = row.cells[1].innerText; // Descrição
    const horaIni = row.cells[2].innerText;   // Horário Inicial
    const horaFim = row.cells[3].innerText;   // Horário Final

    // Preenche o modal com os dados do Período
    document.getElementById('editId').value = codigo;
    document.getElementById('editDescricao').value = descricao;
    document.getElementById('editHoraIni').value = horaIni;
    document.getElementById('editHoraFim').value = horaFim;

    // Abre o modal
    $('#editModal').modal('show');
}

async function editarPeriodo(event) {
    // Evita o recarregamento padrão da página
    if (event) event.preventDefault();
    
    try {
        const codigo = document.getElementById('editId').value;
        const descricao = document.getElementById('editDescricao').value;
        const horaIni = document.getElementById('editHoraIni').value;
        const horaFim = document.getElementById('editHoraFim').value;

        const response = await fetch('../Horario/alterar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                descricao: descricao,
                // Garante que o envio seja HH:MM, cortando os segundos caso existam
                horaInicial: horaIni.slice(0, 5),
                horaFinal: horaFim.slice(0, 5)
            })
        });

        const result = await response.json();

        // Ajustado para o padrão de leitura da nossa Controller (sucesso === true)
        if (result.sucesso === true) {
            // Fechar o modal
            $('#editModal').modal('hide');

            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela
            carregarDados();

        } else {
            // 1. Mapeia e junta as mensagens de erro em um bloco HTML
            const mensagensDeErro = result.erros.map(erro => {
                return `<p><strong>${erro.campo ?? erro.codigo}</strong> ${erro.msg}</p>`;
            }).join('');

            // 2. Chama o Swal.fire usando a propriedade 'html'
            Swal.fire({
                title: 'Houve(ram) erro(s) de validação:',
                html: mensagensDeErro, 
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }

        // Removidas as linhas soltas que fechavam o modal de cadastro do nada em caso de erro

    } catch (error) {
        console.error('Erro ao editar o Período:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function deletarPeriodo(codigo) {
    // Dispara a caixa de confirmação
    Swal.fire({
        title: 'Atenção!',
        text: 'Tem certeza que deseja remover esse Período?',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        customClass: {
            popup: 'my-swal-popup',
            title: 'my-swal-title',
            html: 'my-swal-text',
            confirmButton: 'btn btn-danger btnAcao my-swal-button m-1',
            cancelButton: 'btn btn-secondary btnAcao my-swal-button m-1',
        },
        buttonsStyling: false
    }).then(async function (res) {
        if (res.isConfirmed) {
            const config = {
                method: 'POST', // Padronizado para maiúsculo
                body: JSON.stringify({
                    codigo: codigo // Envia apenas o ID do período
                })
            };
            
            try {
                const request = await fetch('../Horario/desativar', config);
                const response = await request.json();

                // Padronizado para a resposta da Controller
                if (response.sucesso === true) {
                    Swal.fire({
                        title: 'Sucesso!',
                        text: response.msg,
                        icon: 'success',
                        customClass: {
                            popup: 'my-swal-popup',
                            title: 'my-swal-title',
                            html: 'my-swal-text',
                            confirmButton: 'btn btn-primary btnAcao',
                        },
                        buttonsStyling: false
                    });
                    
                    carregarDados();
                } else {
                    // Trata erros de banco na desativação
                    let mensagemErro = response.erros ? response.erros[0].msg : response.msg;
                    Swal.fire('Atenção!', mensagemErro, 'error');
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                Swal.fire('Erro!', 'Ocorreu um problema de comunicação com o servidor.', 'error');
            }
        }
    });
}

function filtrarTabela() {
    // Captura o que foi digitado no campo de pesquisa
    const input = document.getElementById("inputPesquisa");
    const filter = input.value.toLowerCase();
    const tabela = document.getElementById("conteudo-Periodo");
    const linhas = tabela.getElementsByTagName("tr");

    for (let i = 0; i < linhas.length; i++) {
        // CORREÇÃO: Os índices das colunas estavam errados.
        // O td[0] é o Código. A Descrição é o td[1], e as Horas são td[2] e td[3]
        const colDescricao = linhas[i].getElementsByTagName("td")[1];
        const colHoraIni = linhas[i].getElementsByTagName("td")[2];
        const colHoraFim = linhas[i].getElementsByTagName("td")[3];

        if (colDescricao && colHoraIni && colHoraFim) { // Verifica se as colunas existem
            const descTexto = colDescricao.textContent || colDescricao.innerText;
            const hrIniTexto = colHoraIni.textContent || colHoraIni.innerText;
            const hrFimexto = colHoraFim.textContent || colHoraFim.innerText;

            // Verifica se o filtro corresponde a algum dos campos visíveis
            if (descTexto.toLowerCase().indexOf(filter) > -1 || 
                hrIniTexto.toLowerCase().indexOf(filter) > -1 || 
                hrFimexto.toLowerCase().indexOf(filter) > -1) {
                
                linhas[i].style.display = ""; // Exibe a linha
            } else {
                linhas[i].style.display = "none"; // Oculta a linha
            }
        }
    }
}