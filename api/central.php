<?php
// Qual animal a central está monitorando.
//   GET                     -> { "dono": true, "bovino_id": 5 }  (null = nenhum)
//   POST { "bovino_id": 5 } -> passa a monitorar o animal 5 (só a dona da central)
//   POST { "bovino_id": null } -> para de monitorar
require __DIR__ . '/base.php';
$usuario = usuarioLogado();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $bovino = animalDaCentral();
    // Só conta como "monitorado" se o animal for de quem está logado
    if ($bovino) {
        $sql = banco()->prepare('SELECT id FROM bovinos WHERE id = ? AND usuario_id = ?');
        $sql->execute([$bovino, $usuario]);
        if (!$sql->fetch()) $bovino = null;
    }
    responder(['dono' => ehDonoCentral(), 'bovino_id' => $bovino]);
}

exigirMetodo('POST');
if (!ehDonoCentral()) erro('Só a conta dona da central pode trocar o animal monitorado.', 403);

$d = corpo();
$bovino = empty($d['bovino_id']) ? null : animalDoUsuario($usuario, $d['bovino_id']);
banco()->prepare('INSERT INTO central (id, bovino_id) VALUES (1, ?) ON DUPLICATE KEY UPDATE bovino_id = VALUES(bovino_id)')
    ->execute([$bovino]);
responder(['dono' => true, 'bovino_id' => $bovino]);
