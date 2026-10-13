<?php
// Lista de raças (para o cadastro de animal): GET
require __DIR__ . '/base.php';
usuarioLogado();

responder(banco()->query('SELECT id, nome FROM racas ORDER BY nome')->fetchAll());
