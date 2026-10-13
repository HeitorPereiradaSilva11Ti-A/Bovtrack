<?php
// Troca a senha só com o e-mail (decisão do grupo para o TCC; numa versão
// real entraria um código de confirmação enviado por e-mail).
// POST { "email": "...", "nova": "..." }
require __DIR__ . '/base.php';
exigirMetodo('POST');

$dados = corpo();
$email = strtolower(trim((string)($dados['email'] ?? '')));
$nova = (string)($dados['nova'] ?? '');

if (!emailValido($email)) erro('Digite um e-mail válido.');
if (strlen($nova) < 6) erro('A nova senha precisa ter pelo menos 6 caracteres.');

$sql = banco()->prepare('UPDATE usuarios SET senha_hash = ? WHERE email = ?');
$sql->execute([password_hash($nova, PASSWORD_DEFAULT), $email]);
if ($sql->rowCount() === 0) erro('Não encontramos uma conta com esse e-mail.', 404);

responder(['ok' => true]);
