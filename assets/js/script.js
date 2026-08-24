// Funções para o login e manipulação de senha
// Função para validar o login
async function validarLogin() {
    event.preventDefault(); // Evita o envio do formulário

    const usuario = document.getElementById('txtUsuario').value;
    const senha = document.getElementById('txtSenha').value;

    try {
        // Função para obter a URL base do CodeIgniter
        const base_url = function(url = '') {
            return url;
        }

        // Envia os dados de login para o servidor usando Fetch API
        const response = await fetch('Usuario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: usuario,
                senha: senha
            })
        });

        const result = await response.json();

        if (result.codigo == 1) {
            // Login bem-sucedido
            Swal.fire({
                icon: 'success',
                title: 'Login bem-sucedido!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                window.location.href = base_url('Funcoes/indexPagina'); // Redireciona para o dashboard
            });
        } else {
            // Login falhou
            // 1. MApeia e junta as mensagens de erro em uma tag
            const mensagensErro = result.erros.map(erro => `<li> ${erro.msg}</li>`).join('');
            const mensagemCompleta = `<ul class="list-group"> ${mensagensErro} </ul>`;
            Swal.fire({
                icon: 'error',
                title: 'Erro de login',
                html: mensagemCompleta,
                showConfirmButton: true // Exibe o botão de confirmação para o usuário ler os erros
            });
        }
    } catch (error) {
        console.error('Erro ao validar login:', error);
    }
}

// Função para mostrar/ocultar a senha
document.getElementById('togglePassword').addEventListener('click', function() {
    // Obtém o campo de senha e alterna seu tipo entre 'password' e 'text'
    const senhaInput = document.getElementById('txtSenha');
    const tipo = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
    senhaInput.setAttribute('type', tipo);

    // Alterna o ícone entre olho aberto e olho fechado
    this.querySelector('i').classList.toggle('bi-eye');
    this.querySelector('i').classList.toggle('bi-eye-slash');
});
// Fim das funções para o login e manipulação de senha
