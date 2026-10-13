<?php
// Diz se tem alguém logado: GET -> { "logado": true, "email": "..." }
require __DIR__ . '/base.php';

iniciarSessao();
responder([
    'logado' => !empty($_SESSION['usuario_id']),
    'email'  => $_SESSION['email'] ?? null,
]);
