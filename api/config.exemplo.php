<?php
// =====================================================================
// MODELO de configuração do servidor do BovTrack.
//
// No servidor (pelo FTP), faça uma cópia deste arquivo com o nome
// "config.php", na mesma pasta (api/), e preencha com os dados reais.
// O config.php NÃO vai para o GitHub: ele tem a senha do banco.
// =====================================================================

return [
    'db_host'    => 'localhost',
    'db_nome'    => 'u377366289_gpsp07',
    'db_usuario' => 'COLOQUE_O_USUARIO_AQUI',
    'db_senha'   => 'COLOQUE_A_SENHA_AQUI',

    // Senha que a central (ESP) manda junto com as leituras.
    // Invente uma e coloque a mesma no código da central.
    'chave_central' => 'TROQUE_ESTA_CHAVE',

    // E-mail da conta do site que escolhe qual animal a central monitora.
    // Só essa conta vê o botão "Monitorar com a central".
    'dono_central' => 'email-da-conta@gmail.com',
];
