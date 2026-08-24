// Script para gerenciamento e cadastro de docentes (professores)

async function cadastro(event) {
    // Recebe o 'event' do clique do botão e previne o recarregamento padrão da página
    if (event) event.preventDefault(); 
    
    try {
        // Captura os valores digitados no formulário do modal
        const nome = document.getElementById('nome').value;
        const cpf = document.getElementById('cpf').value;
        const tipo = document.getElementById('tipo').value;

        // Dispara a requisição para a Controller do PHP
        const response = await fetch('../Professor/inserir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: nome,
                cpf: cpf,
                tipo: tipo
            })
        });

        // Converte a resposta do PHP para um objeto JavaScript (JSON)
        const result = await response.json();

        // Verificando a variável correta de sucesso que o PHP envia
        if (result.sucesso === true) {
            // Fechar o modal de cadastro
            $('#cadastroProfessorModal').modal('hide');
            
            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela para exibir o novo docente imediatamente
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
        console.error('Erro ao cadastrar o professor:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function carregarDados() {
    try {
        // Dispara a requisição para buscar todos os professores ativos
        const response = await fetch('../Professor/consultar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: '',
                nome: '',
                cpf: '',
                tipo: ''
            })
        });

        const data = await response.json();
        const conteudoAcesso = document.getElementById('conteudo-Professor');

        // Limpar a tabela antes de preencher com novos dados para não duplicar linhas
        conteudoAcesso.innerHTML = '';

        // Preencher a tabela com os dados recebidos do banco
        data.dados.forEach(item => {
            // Tratamento amigável para exibir o tipo por extenso na tabela
            let tipo = item.tipo;
            if (tipo == 'F') {
                tipo = 'Funcionário';
            } else {
                tipo = 'Carta Convite';
            }
            
            // Monta o HTML da linha injetando as variáveis do item
            conteudoAcesso.innerHTML += `
                <tr class="alert alert-warning">
                    <td>${item.nome}</td>
                    <td>${item.cpf}</td>
                    <td>${tipo}</td>
                    <td>
                        <div class="">
                            <button type="button" class="btn btn-warning btn-sm" onclick="openEditModal(${item.codigo}, this)">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-danger btn-sm" onclick="deletarProfessor(${item.codigo})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        });

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}

// Eventos disparados assim que o documento HTML é totalmente carregado
$(document).ready(function() {
    // Carrega a tabela logo de início
    carregarDados();

    // Limpa os campos do formulário toda vez que o modal de cadastro for aberto
    $('#cadastroProfessorModal').on('show.bs.modal', function() {
        $('#formCadastroProfessor')[0].reset();
    });
});

function openEditModal(codigo, button) {
    // Pega a linha (tr) exata onde o botão clicado está dentro
    const row = button.closest('tr');
    
    // Pegar os dados das células da linha
    const nome = row.cells[0].innerText;
    const cpf = row.cells[1].innerText;
    
    // Como a tabela mostra "Funcionário" ou "Carta Convite", pegamos só a 1ª letra (F ou C) 
    // para o Select do modal conseguir marcar a <option> correta automaticamente
    const tipo = row.cells[2].innerText.charAt(0); 

    // Preenche os inputs do modal invisível (editId) e visíveis com os dados do Professor
    document.getElementById('editId').value = codigo;
    document.getElementById('editNome').value = nome;
    document.getElementById('editCpf').value = cpf;
    document.getElementById('editTipo').value = tipo;

    // Abre o modal de edição
    $('#editModal').modal('show');
}

async function editarProfessor(event) {
    // Evita o envio de formulário padrão
    if (event) event.preventDefault(); 
    
    try {
        // Resgata os novos valores editados (incluindo o ID invisível)
        const codigo = document.getElementById('editId').value;
        const nome = document.getElementById('editNome').value;
        const cpf = document.getElementById('editCpf').value;
        const tipo = document.getElementById('editTipo').value;

        // Envia as alterações para o backend
        const response = await fetch('../Professor/alterar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                nome: nome,
                cpf: cpf,
                tipo: tipo
            })
        });

        const result = await response.json();

        if (result.sucesso === true) {
            // Fechar o modal de edição
            $('#editModal').modal('hide');

            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela com os novos dados
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
    } catch (error) {
        console.error('Erro ao editar o professor:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function deletarProfessor(codigo) {
    // Dispara a caixa de confirmação
    Swal.fire({
        title: 'Atenção!',
        text: 'Tem certeza que deseja remover esse Professor?',
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        customClass: {
            popup: 'my-swal-popup',
            title: 'my-swal-title',
            html: 'my-swal-text',
            confirmButton: 'btn btn-danger my-swal-button m-1',
            cancelButton: 'btn btn-secondary my-swal-button m-1',
        },
        buttonsStyling: false
    }).then(async function(res) {
        // Se o usuário clicar em "Sim/Confirmar"
        if (res.isConfirmed) {
            const config = {
                method: 'POST', 
                body: JSON.stringify({
                    codigo: codigo // Envia apenas o ID do professor a ser desativado
                })
            };

            try {
                const request = await fetch('../Professor/desativar', config);
                const response = await request.json();

                // Verifica se a exclusão lógica foi um sucesso
                if (response.sucesso === true) {
                    Swal.fire({
                        title: 'Atenção!',
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
                    
                    // Recarrega a tela sem o professor desativado
                    carregarDados();
                } else {
                    // Pega o primeiro erro ou exibe a mensagem genérica
                    let mensagemErro = response.erros ? response.erros[0].msg : response.msg;
                    Swal.fire('Erro!', mensagemErro, 'error');
                }
            } catch (error) {
                Swal.fire('Erro!', 'Falha ao conectar com o servidor.', 'error');
            }
        }
    });
}

function filtrarTabela() {
    // Captura o que foi digitado no campo de pesquisa
    const input = document.getElementById("inputPesquisa");
    const filter = input.value.toLowerCase();
    
    // Mapeia todas as linhas (tr) dentro da tabela de docentes
    const tabela = document.getElementById("conteudo-Professor");
    const linhas = tabela.getElementsByTagName("tr");
    
    // Percorre cada linha da tabela
    for (let i = 0; i < linhas.length; i++) {
        const colProfessor = linhas[i].getElementsByTagName("td")[0]; // Coluna do nome do professor
        const colCpf = linhas[i].getElementsByTagName("td")[1];       // Coluna do CPF
        
        if (colProfessor && colCpf) { // Verifica se as colunas existem na linha atual
            // Extrai o texto puro das colunas
            const professorTexto = colProfessor.textContent || colProfessor.innerText;
            const cpfTexto = colCpf.textContent || colCpf.innerText;
            
            // Verifica se o texto pesquisado existe no nome OU no CPF do professor
            if ((professorTexto.toLowerCase().indexOf(filter) > -1) || (cpfTexto.toLowerCase().indexOf(filter) > -1)) {
                linhas[i].style.display = ""; // Exibe a linha
            } else {
                linhas[i].style.display = "none"; // Oculta a linha
            }
        }
    }
}