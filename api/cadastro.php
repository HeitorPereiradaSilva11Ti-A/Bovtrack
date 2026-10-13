<?php
// Cadastro: POST { "email": "...", "senha": "...", "lembrar": true }
require __DIR__ . '/base.php';
exigirMetodo('POST');

$dados = corpo();
$email = strtolower(trim((string)($dados['email'] ?? '')));
$senha = (string)($dados['senha'] ?? '');

if (!emailValido($email)) erro('Digite um e-mail válido.');
if (strlen($senha) < 6) erro('A senha precisa ter pelo menos 6 caracteres.');

try {
    $sql = banco()->prepare('INSERT INTO usuarios (email, senha_hash) VALUES (?, ?)');
    $sql->execute([$email, password_hash($senha, PASSWORD_DEFAULT)]);
} catch (PDOException $e) {
    if ($e->errorInfo[1] == 1062) erro('Já existe uma conta com esse e-mail.', 409);
    erro('Erro no servidor. Tente de novo.', 500);
}

entrar((int)banco()->lastInsertId(), $email, !empty($dados['lembrar']));
responder(['email' => $email], 201);
