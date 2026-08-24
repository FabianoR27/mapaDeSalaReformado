// Script para gerenciamento e cadastro de Reservas (Mapeamento)

async function cadastro(event) {
    if (event) event.preventDefault();
    
    try {
        const sala = document.getElementById('selectSalas').value;
        const turma = document.getElementById('selectTurma').value;
        const professor = document.getElementById('selectProfessor').value;
        const horario = document.getElementById('selectHorario').value;
        const dataReserva = document.getElementById('dataFim').value;

        // --- TRAVA DE SEGURANÇA ---
        // Se qualquer um dos selects ou a data estiver vazia, bloqueia o envio e avisa o usuário!
        if (!sala || !turma || !professor || !horario || !dataReserva) {
            Swal.fire('Atenção!', 'Por favor, preencha todos os campos obrigatórios antes de cadastrar.', 'warning');
            return; // Interrompe a função aqui e não manda erro pro PHP
        }

        const response = await fetch('../Mapa/inserir', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codSala: sala,
                codHorario: horario,
                codTurma: turma,
                codProfessor: professor,
                dataReserva: dataReserva
            })
        });

        const result = await response.json();

        if (result.sucesso === true) {
            // Fechar o modal
            $('#cadastroMapeamentoModal').modal('hide');

            // Mostrar uma mensagem de sucesso
            Swal.fire('Sucesso!', result.msg, 'success');

            // Atualizar a tabela
            carregarDados();
        } else {
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
        console.error('Erro ao cadastrar o Mapeamento:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição. O servidor falhou.', 'error');
    }
}

const spinner = document.getElementById('spinner');

async function carregarDados() {
    try {
        spinner.style.display = 'block'; // Mostrar spinner de carregamento

        const response = await fetch('../Mapa/consultar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: '',
                dataReserva: '',
                codSala: '',
                codHorario: '',
                codTurma: '',
                codProfessor: ''
            })
        });

        const data = await response.json();

        const conteudoAcesso = document.getElementById('conteudo-Mapeamento');
        conteudoAcesso.innerHTML = ''; // Limpa o conteúdo existente

        if (data && Array.isArray(data.dados) && data.dados.length > 0) {
            // DocumentFragment otimiza a renderização na tela
            const fragmento = document.createDocumentFragment();

            data.dados.forEach(item => {
                
                // --- MÁGICA DA DATA AQUI ---
                // Formata "YYYY-MM-DD" para "DD/MM/YYYY" direto no front-end
                let dataFormatada = "";
                if (item.datareserva && item.datareserva.includes('-')) {
                    const partesData = item.datareserva.split('-'); 
                    dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`; 
                } else {
                    dataFormatada = item.datareserva; // fallback caso não venha com traços
                }

                const linha = document.createElement('tr');
                linha.classList.add('alert', 'alert-warning');
                
                // NOTA: Os índices do 'td' ocultos (1, 4, 6, 8, 10) guardam as chaves 
                // estrangeiras para uso na função openEditModal.
                linha.innerHTML = `
                    <td style="display:none"><input type="checkbox" class="selecionar-item" value="${item.codigo}"></td>
                    <td style="display:none">${item.sala}</td> <td>${item.descsala}</td>
                    <td>${item.desturma}</td>
                    <td style="display:none">${item.codigo_turma}</td> <td>${item.nome_professor}</td>
                    <td style="display:none">${item.codigo_professor}</td> <td>${dataFormatada}</td>
                    <td style="display:none">${item.datareserva}</td> <td>${item.deshorario}</td>
                    <td style="display:none">${item.codigo_horario}</td>
                    <td>
                    <div class="d-flex gap-2">
                        <button type="button" class="btn btn-warning btn-sm btnAcao" onclick="openEditModal(this, ${item.codigo})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-danger btn-sm btnAcao btnAcaoExcluir" onclick="deletarMapeamento(${item.codigo})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
                `;
                fragmento.appendChild(linha);
            });

            conteudoAcesso.appendChild(fragmento);
        } else {
            conteudoAcesso.innerHTML = '<tr><td colspan="10" class="text-center">Nenhum dado encontrado.</td></tr>';
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    } finally {
        spinner.style.display = 'none'; // Ocultar spinner sempre, dando erro ou não
    }
}

// Otimiza a pesquisa para não travar a tela
function debounce(func, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
}

const carregarDadosDebounced = debounce(carregarDados, 300);

$(document).ready(function () {
    carregarDados();

    // Limpa o formulário quando o modal de cadastro fecha/abre
    $('#cadastroMapeamentoModal').on('show.bs.modal', function () {
        $('#formCadastroMapeamento')[0].reset();
    });

    // =================================================================
    // CARREGAMENTO DOS SELECTS VIA AJAX NA INICIALIZAÇÃO (SALAS, TURMAS, ETC)
    // =================================================================

    // 1. Salas
    $.ajax({
        url: '../Sala/consultar',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ codigo: '', descricao: '', andar: '', capacidade: '' }),
        success: function (retorno) {
            if (retorno.codigo == 1) {
                $.each(retorno.dados, function (index, item) {
                    // Preenche tanto o Cadastro quanto a Edição
                    const option = `<option value="${item.codigo}">${item.codigo} - ${item.descricao}</option>`;
                    $('#selectSalas').append(option);
                    $('#editSelectSalas').append(option);
                });
            } else {
                $('#selectSalas, #editSelectSalas').append('<option value="">Nenhuma sala cadastrada</option>');
            }
        },
        error: function () { console.error('Erro ao carregar as salas.'); }
    });

    // 2. Professores
    $.ajax({
        url: '../Professor/consultar',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ codigo: '', nome: '', cpf: '', tipo: '' }),
        success: function (retorno) {
            if (retorno.codigo == 1) {
                $.each(retorno.dados, function (index, item) {
                    const option = `<option value="${item.codigo}">${item.nome}</option>`;
                    $('#selectProfessor').append(option);
                    $('#editSelectProfessor').append(option);
                });
            } else {
                $('#selectProfessor, #editSelectProfessor').append('<option value="">Nenhum docente cadastrado</option>');
            }
        },
        error: function () { console.error('Erro ao carregar os professores.'); }
    });

    // 3. Turmas
    $.ajax({
        url: '../Turma/consultar',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ codigo: '', descricao: '', capacidade: '', dataInicio: '' }),
        success: function (retorno) {
            if (retorno.codigo == 1) {
                $.each(retorno.dados, function (index, item) {
                    const option = `<option value="${item.codigo}">${item.descricao}</option>`;
                    $('#selectTurma').append(option);
                    $('#editSelectTurma').append(option);
                });
            } else {
                $('#selectTurma, #editSelectTurma').append('<option value="">Nenhuma turma cadastrada</option>');
            }
        },
        error: function () { console.error('Erro ao carregar as turmas.'); }
    });

    // 4. Horários (Períodos)
    $.ajax({
        url: '../Horario/consultar',
        method: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ codigo: '', descricao: '', horaInicial: '', horaFinal: '' }),
        success: function (retorno) {
            if (retorno.codigo == 1) {
                $.each(retorno.dados, function (index, item) {
                    const option = `<option value="${item.codigo}">${item.descricao}</option>`;
                    $('#selectHorario').append(option);
                    $('#editSelectHorario').append(option);
                });
            } else {
                $('#selectHorario, #editSelectHorario').append('<option value="">Nenhum horário cadastrado</option>');
            }
        },
        error: function () { console.error('Erro ao carregar os horários.'); }
    });
});

function openEditModal(button, codigo) {
    // A linha do botão clicado
    const row = button.closest('tr');

    // Pegar os dados das células ocultas da linha gerada no 'carregarDados'
    const sala = row.cells[1].innerText;        // Sala (ID Oculto)
    const turma = row.cells[4].innerText;       // Turma (ID Oculto)
    const professor = row.cells[6].innerText;   // Professor (ID Oculto)
    const dataMapeamento = row.cells[8].innerText; // Data formato BD (Oculta)
    const horario = row.cells[10].innerText;    // Horário (ID Oculto)
    
    document.getElementById('editId').value = codigo;

    // Preenche o modal selecionando as <option> corretas via ID
    document.getElementById('editSelectSalas').value = sala;
    document.getElementById('editSelectTurma').value = turma;
    document.getElementById('editSelectProfessor').value = professor;
    document.getElementById('dataEditar').value = dataMapeamento;
    document.getElementById('editSelectHorario').value = horario;

    // Abre o modal
    $('#editModal').modal('show');
}

async function editarMapeamento(event) {
    // Obrigatório para não atualizar a página acidentalmente
    if (event) event.preventDefault();
    
    try {
        const codigo = document.getElementById('editId').value;
        const sala = document.getElementById('editSelectSalas').value;
        const turma = document.getElementById('editSelectTurma').value;
        const professor = document.getElementById('editSelectProfessor').value;
        const dataMapeamento = document.getElementById('dataEditar').value;
        const horario = document.getElementById('editSelectHorario').value;
        
        const response = await fetch('../Mapa/alterar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                dataReserva: dataMapeamento,
                codSala: sala,
                codHorario: horario,
                codTurma: turma,
                codProfessor: professor
            })
        });

        const result = await response.json();
        
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
    } catch (error) {
        console.error('Erro ao editar Mapeamento:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao processar a requisição.', 'error');
    }
}

async function deletarMapeamentoMultiplos(codigos) {
    Swal.fire({
        title: 'Atenção!',
        text: 'Tem certeza que deseja remover as Reservas selecionadas?',
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
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigos: codigos
                })
            };

            const request = await fetch('../Mapa/desativarMultiplos', config);
            const response = await request.json();

            Swal.fire({
                title: 'Atenção!',
                text: response.msg,
                icon: response.sucesso === true ? 'success' : 'error',
                customClass: {
                    popup: 'my-swal-popup',
                    title: 'my-swal-title',
                    html: 'my-swal-text',
                    confirmButton: 'btn btn-primary btnAcao',
                },
                buttonsStyling: false
            });
            carregarDados(); 
        }
    });
}

async function deletarMapeamento(codigo) {
    Swal.fire({
        title: 'Atenção!',
        text: 'Tem certeza que deseja remover esta Reserva?',
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
                method: 'POST',
                headers: { // Importante adicionar os headers no delete também
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    codigo: codigo
                })
            };
            const request = await fetch('../Mapa/desativar', config);
            const response = await request.json();

            Swal.fire({
                title: 'Atenção!',
                text: response.msg,
                icon: response.sucesso === true ? 'success' : 'error',
                customClass: {
                    popup: 'my-swal-popup',
                    title: 'my-swal-title',
                    html: 'my-swal-text',
                    confirmButton: 'btn btn-primary btnAcao',
                },
                buttonsStyling: false
            });
            carregarDados();
        }
    });
}

function filtrarTabela() {
    const input = document.getElementById("inputPesquisa");
    const filter = input.value.trim().toLowerCase();
    const tabela = document.getElementById("conteudo-Mapeamento");
    const linhas = tabela.getElementsByTagName("tr");

    for (let linha of linhas) {
        const celulas = linha.getElementsByTagName("td");

        if (celulas.length > 0) {
            // Junta todo o texto visível da linha para pesquisar em qualquer coluna
            const conteudolinha = Array.from(celulas)
                .map(celula => celula.textContent.trim().toLowerCase())
                .join(" ");

            linha.style.display = conteudolinha.includes(filter) ? "" : "none";
        }
    }
}