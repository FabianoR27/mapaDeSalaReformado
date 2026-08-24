
// script para cadastro de salas
async function cadastro(event) {
    if (event) event.preventDefault();
    const codigo = document.getElementById('codigo').value;
    const descricao = document.getElementById('descricao').value;
    let andar = document.getElementById('andar').value;
    const capacidade = document.getElementById('capacidade').value;

    if (andar === 'Primeiro') andar = 1;
    if (andar === 'Segundo') andar = 2;
    if (andar === 'Terceiro') andar = 3;
    if (andar === 'Quarto') andar = 4;
    if (andar === 'Quinto') andar = 5;
    if (andar === 'Sexto') andar = 6;
    if (andar === 'Térreo') andar = 0;

    try {
        const response = await fetch('../Sala/inserir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                descricao: descricao,
                andar: andar,
                capacidade: capacidade
            })
        });

        const result = await response.json();

        // verificando a variável correta que o PHP envia
        if (result.sucesso === true) {
            // Fechar o modal
            $('#cadastroSalaModal').modal('hide');

            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela
            carregarDados();

        } else {
            // Se sucesso for false, significa que o PHP enviou a array de erros
            const mensagensDeErro = result.erros.map(erro => {
                return `<p><strong>${erro.campo ?? erro.codigo}</strong> ${erro.msg}</p>`;
            }).join('');

            Swal.fire({
                title: 'Houve(ram) erro(s) de validação:',
                html: mensagensDeErro,
                icon: 'error',
                confirmButtonText: 'Fechar'
            });
        }
    } catch (error) {
        console.error('Erro ao cadastrar a sala:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function carregarDados() {
    try {

        const response = await fetch('../Sala/consultar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: '',
                descricao: '',
                andar: '',
                capacidade: ''
            })
        });

        const data = await response.json();

        const conteudoAcesso = document.getElementById('conteudo-sala');

        // Limpar a tabela antes de preencher com novos dados
        conteudoAcesso.innerHTML = '';

        // Preencher a tabela com os dados recebidos
        data.dados.forEach(item => {

            conteudoAcesso.innerHTML += `
                <tr class="alert alert-warning">
                    <td>${item.codigo}</td>
                    <td>${item.descricao}</td>
                    <td>${item.andar}</td>
                    <td>${item.capacidade}</td>
                    <td>
                        <div class="">
                            <button type="button" class="btn btn-sm btn-warning" onclick="openEditModal(this)">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-sm btn-danger" onclick="deletarSala(${item.codigo})">
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

$(document).ready(function() {
    carregarDados();

    $('#cadastroSalaModal').on('show.bs.modal', function() {
        $('#formCadastroSala')[0].reset();
    });
});

function openEditModal(button) {
    // A linha do botão clicado
    const row = button.closest('tr');

    // Pegar os dados da linha
    const codigo = row.cells[0].innerText; // Código da sala
    const descricao = row.cells[1].innerText; // Descrição da sala
    const andar = row.cells[2].innerText.charAt(0); // Pega o andar, ajustado para o valor numérico
    const capacidade = row.cells[3].innerText;
    // Preenche o modal com os dados da sala
    document.getElementById('editId').value = codigo;
    document.getElementById('editDescricao').value = descricao;
    document.getElementById('editAndar').value = andar;
    document.getElementById('editCapacidade').value = capacidade;

    // Abre o modal
    $('#editModal').modal('show');
}

async function editarSala(event) {
    if (event) event.preventDefault();
    try {
        const codigo = document.getElementById('editId').value;
        const descricao = document.getElementById('editDescricao').value;
        const andar = document.getElementById('editAndar').value;
        const capacidade = document.getElementById('editCapacidade').value;

        const response = await fetch('../Sala/alterar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                descricao: descricao,
                andar: andar,
                capacidade: capacidade
            })
        });

        const result = await response.json();

        if (result.codigo == 1) {
            // Fechar o modal
            $('#editModal').modal('hide');

            // Mostrar uma mensagem de sucesso (opcional)
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
        $('#cadastroSalaModal').modal('hide');
        carregarDados(); // Atualiza a tabela com os novos dados

    } catch (error) {
        console.error('Erro ao cadastrar a sala:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }

}

async function deletarSala(codigo) {
    Swal.fire({
        title: 'Atenção!',
        text: 'Tem certeza que deseja remover essa sala?',
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
        if (res.isConfirmed) {
            const config = {
                method: 'POST', // Recomendado manter em maiúsculo
                body: JSON.stringify({
                    codigo: codigo
                })
            };

            try {
                const request = await fetch('../Sala/desativar', config);
                const response = await request.json();

                // Verifica o 'sucesso' que a sua Controller envia
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

                    // Atualiza a tabela na tela
                    carregarDados();

                } else {
                    // Se a Controller mandou falso, pega a primeira mensagem do array de erros
                    let mensagemErro = response.erros ? response.erros[0].msg : 'Erro ao tentar desativar.';

                    Swal.fire({
                        title: 'Atenção!',
                        text: mensagemErro,
                        icon: 'error',
                        customClass: {
                            popup: 'my-swal-popup',
                            title: 'my-swal-title',
                            html: 'my-swal-text',
                            confirmButton: 'btn btn-primary btnAcao',
                        },
                        buttonsStyling: false
                    });
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                Swal.fire('Erro!', 'Ocorreu um problema de comunicação com o servidor.', 'error');
            }
        }
    });
}

function filtrarTabela() {
    const input = document.getElementById("inputPesquisa");
    const filter = input.value.toLowerCase();
    const tabela = document.getElementById("conteudo-sala");
    const linhas = tabela.getElementsByTagName("tr");

    for (let i = 0; i < linhas.length; i++) {
        const colSala = linhas[i].getElementsByTagName("td")[0]; // Coluna de número da sala
        const colDescricao = linhas[i].getElementsByTagName("td")[1]; // Coluna de descrição da sala

        if (colSala || colDescricao) {
            const salaTexto = colSala.textContent || colSala.innerText;
            const descricaoTexto = colDescricao.textContent || colDescricao.innerText;

            // Verifica se o filtro corresponde ao número da sala ou à descrição
            if (salaTexto.toLowerCase().indexOf(filter) > -1 || descricaoTexto.toLowerCase().indexOf(filter) > -1) {
                linhas[i].style.display = "";
            } else {
                linhas[i].style.display = "none";
            }
        }
    }
}