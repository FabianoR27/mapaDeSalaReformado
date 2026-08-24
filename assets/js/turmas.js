// Script para gerenciamento e cadastro de turmas

// Função de cadastro
async function cadastro(event) {
    // Recebe o 'event' do clique do botão e previne o recarregamento padrão da página
    if (event) event.preventDefault(); 
    
    try {
        // Captura os valores digitados no formulário do modal
        const descricao = document.getElementById('descricao').value;
        const capacidade = document.getElementById('capacidade').value;
        const dataInicio = document.getElementById('dataInicio').value;

        // Dispara a requisição para a Controller do PHP
        const response = await fetch('../Turma/inserir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                descricao: descricao,
                capacidade: capacidade,
                dataInicio: dataInicio
            })
        });

        // Converte a resposta do PHP para um objeto JavaScript (JSON)
        const result = await response.json();

        // Verificando a variável correta de sucesso que o PHP envia padronizado
        if (result.sucesso === true) {
            // Fechar o modal
            $('#cadastroTurmaModal').modal('hide');

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
                html: mensagensDeErro, // Usamos 'html' para exibir as tags <p> e <strong>
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }
    } catch (error) {
        console.error('Erro ao cadastrar a Turma:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function carregarDados() {
    try {
        // Dispara a requisição para buscar todas as turmas ativas
        const response = await fetch('../Turma/consultar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: '',
                descricao: '',
                capacidade: '',
                dataInicio: ''
            })
        });

        const data = await response.json();
        const conteudoAcesso = document.getElementById('conteudo-Turma');

        // Limpar a tabela antes de preencher com novos dados
        conteudoAcesso.innerHTML = '';

        // Preencher a tabela com os dados recebidos
        if(data.dados) {
            data.dados.forEach(item => {
                
                // --- MÁGICA DA DATA AQUI ---
                // O banco devolve item.dataInicio como "YYYY-MM-DD" (Ex: "2026-06-14")
                let dataFormatada = "";
                
                // Verifica se a data existe e possui os traços
                if (item.dataInicio && item.dataInicio.includes('-')) {
                    // Divide a string onde tem o traço. O resultado é um array: [YYYY, MM, DD]
                    const partesData = item.dataInicio.split('-'); 
                    
                    // Remonta a data invertendo a ordem para o padrão brasileiro
                    dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`; 
                }

                conteudoAcesso.innerHTML += `
                    <tr class="alert alert-warning">
                        <td>${item.codigo}</td>
                        <td>${item.descricao}</td>
                        <td>${item.capacidade}</td>
                        
                        <td>${dataFormatada}</td> 
                        
                        <td style="display:none">${item.dataInicio}</td> 
                        
                        <td>
                            <div class="">
                                <button type="button" class="btn btn-warning btn-sm btnAcao" onclick="openEditModal(${item.codigo}, this)">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button type="button" class="btn btn-danger btn-sm btnAcao btnAcaoExcluir" onclick="deletarTurma(${item.codigo})">
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

// Eventos disparados assim que o documento HTML é totalmente carregado
$(document).ready(function () {
    carregarDados();

    // Limpa os campos do formulário toda vez que o modal de cadastro for aberto
    $('#cadastroTurmaModal').on('show.bs.modal', function () {
        $('#formCadastroTurma')[0].reset();
    });
});

function openEditModal(codigo, button) {
    // A linha do botão clicado
    const row = button.closest('tr');

    // Pegar os dados da linha (respeitando os índices corretos das colunas geradas)
    const descricao = row.cells[1].innerText; // Descrição da Turma
    const capacidade = row.cells[2].innerText; // Capacidade
    const dataInicio = row.cells[4].innerText; // A coluna oculta com a data pura (ex: YYYY-MM-DD)

    // Preenche o modal com os dados da Turma (incluindo o ID invisível)
    document.getElementById('editId').value = codigo;
    document.getElementById('editDescricao').value = descricao;
    document.getElementById('editCapacidade').value = capacidade;
    document.getElementById('editDataInicio').value = dataInicio;

    // Abre o modal
    $('#editModal').modal('show');
}

async function editarTurma(event) {
    // Evita o envio de formulário padrão
    if (event) event.preventDefault(); 
    
    try {
        // Resgata os novos valores editados
        const codigo = document.getElementById('editId').value;
        const descricao = document.getElementById('editDescricao').value;
        const capacidade = document.getElementById('editCapacidade').value;
        const dataInicio = document.getElementById('editDataInicio').value;

        // Envia as alterações para o backend
        const response = await fetch('../Turma/alterar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                descricao: descricao,
                capacidade: capacidade,
                dataInicio: dataInicio
            })
        });

        const result = await response.json();

        // Ajustado para o padrão sucesso === true
        if (result.sucesso === true) {
            // Fechar o modal
            $('#editModal').modal('hide');

            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela com os novos dados
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
                html: mensagensDeErro, // Usamos 'html' para exibir as tags <p> e <strong>
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }
    } catch (error) {
        console.error('Erro ao editar a Turma:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function deletarTurma(codigo) {
    // Dispara a caixa de confirmação do SweetAlert
    Swal.fire({
        title: 'Atenção!',
        text: 'Tem certeza que deseja remover essa Turma?',
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
        // Se o usuário confirmar a exclusão
        if (res.isConfirmed) {
            const config = {
                method: 'POST', // Padronizado para maiúsculo
                body: JSON.stringify({
                    codigo: codigo // Envia o ID da turma a ser desativada
                })
            };
            
            try {
                const request = await fetch('../Turma/desativar', config);
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
                    
                    // Recarrega a tabela sem a turma removida
                    carregarDados();
                } else {
                    // Pega o primeiro erro do array ou exibe a mensagem de erro direto
                    let mensagemErro = response.erros ? response.erros[0].msg : 'Erro ao tentar desativar.';
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
    
    // Mapeia todas as linhas (tr) da tabela de turmas
    const tabela = document.getElementById("conteudo-Turma");
    const linhas = tabela.getElementsByTagName("tr");

    // Percorre cada linha da tabela
    for (let i = 0; i < linhas.length; i++) {
        const colDescricao = linhas[i].getElementsByTagName("td")[1];  // Coluna da Descrição
        const colCapacidade = linhas[i].getElementsByTagName("td")[2]; // Coluna da Capacidade
        const colDataIni = linhas[i].getElementsByTagName("td")[3];    // Coluna da Data de Início formatada

        if (colDescricao) { // Verifica se as colunas existem na linha atual
            // Extrai o texto puro das colunas
            const descricaoTexto = colDescricao.textContent || colDescricao.innerText;
            const capacidadeTexto = colCapacidade.textContent || colCapacidade.innerText;
            const dataIniTexto = colDataIni.textContent || colDataIni.innerText;

            // Filtra as linhas conferindo a pesquisa nos três campos simultaneamente
            if ((descricaoTexto.toLowerCase().indexOf(filter) > -1) ||
                (capacidadeTexto.toLowerCase().indexOf(filter) > -1) ||
                (dataIniTexto.toLowerCase().indexOf(filter) > -1)) {
                linhas[i].style.display = ""; // Exibe a linha
            } else {
                linhas[i].style.display = "none"; // Oculta a linha
            }
        }
    }
}