<?php
// Login: POST { "email": "...", "senha": "...", "lembrar": true }
require __DIR__ . '/base.php';
exigirMetodo('POST');

$dados = corpo();
$email = strtolower(trim((string)($dados['email'] ?? '')));
$senha = (string)($dados['senha'] ?? '');

$sql = banco()->prepare('SELECT id, senha_hash FROM usuarios WHERE email = ?');
$sql->execute([$email]);
$usuario = $sql->fetch();

if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
    erro('E-mail ou senha incorretos.', 401);
}

entrar((int)$usuario['id'], $email, !empty($dados['lembrar']));
responder(['email' => $email]);
