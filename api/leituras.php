<?php
// Leituras de temperatura e som (páginas de histórico).
//   GET ?bovino=5&dia=hoje   -> leituras do animal (da mais recente para a mais antiga)
//   GET ?dia=ontem           -> média de todos os animais do dono, em blocos de 30 min
require __DIR__ . '/base.php';
$usuario = usuarioLogado();

$dia = ($_GET['dia'] ?? '') === 'ontem' ? 'ontem' : 'hoje';
[$inicio, $fim] = intervaloDoDia($dia);

if (isset($_GET['bovino'])) {
    $bovino = animalDoUsuario($usuario, $_GET['bovino']);
    $sql = banco()->prepare(
        "SELECT DATE_FORMAT(criado_em, '%H:%i') AS hora, temp_animal AS temp, sons, ventilador
           FROM leituras WHERE bovino_id = ? AND criado_em >= ? AND criado_em < ?
          ORDER BY criado_em DESC, id DESC LIMIT 200"
    );
    $sql->execute([$bovino, $inicio, $fim]);
} else {
    $sql = banco()->prepare(
        "SELECT CONCAT(DATE_FORMAT(l.criado_em, '%H'), ':', IF(MINUTE(l.criado_em) < 30, '00', '30')) AS hora,
                AVG(l.temp_animal) AS temp, AVG(l.sons) AS sons
           FROM leituras l JOIN bovinos b ON b.id = l.bovino_id
          WHERE b.usuario_id = ? AND l.criado_em >= ? AND l.criado_em < ?
          GROUP BY hora ORDER BY hora DESC"
    );
    $sql->execute([$usuario, $inicio, $fim]);
}

responder(array_map(fn($l) => [
    'hora' => $l['hora'],
    'temp' => round((float)$l['temp'], 1),
    'sons' => round((float)$l['sons'], 1),
], $sql->fetchAll()));
