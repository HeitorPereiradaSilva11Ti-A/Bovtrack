<?php
// Teste rápido: abra .../api/saude.php no navegador.
// Se aparecer {"ok":true,...}, o servidor e o banco estão funcionando.
require __DIR__ . '/base.php';

$tabelas = banco()->query('SHOW TABLES')->rowCount();
responder(['ok' => true, 'hora' => date('Y-m-d H:i:s'), 'tabelas' => $tabelas]);
