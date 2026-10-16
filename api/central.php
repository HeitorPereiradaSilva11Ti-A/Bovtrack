<?php
// Central: qual animal ela monitora e o botão do relé (ventilador ou lâmpada).
//   GET                          -> { "dono": true, "bovino_id": 5, "rele": { "ligado": true, "restante": 540 } }
//   POST { "bovino_id": 5 }      -> passa a monitorar o animal 5 (null = para de monitorar)
//   POST { "rele": true }         -> liga o relé por MINUTOS_RELE minutos (false = desliga)
// Os POSTs são só para a conta dona da central.
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
    responder(['dono' => ehDonoCentral(), 'bovino_id' => $bovino, 'rele' => estadoRele()]);
}

exigirMetodo('POST');
if (!ehDonoCentral()) erro('Só a conta dona da central pode fazer isso.', 403);

$d = corpo();
if (array_key_exists('rele', $d)) {
    banco()->prepare('UPDATE central SET rele_ate = IF(?, NOW() + INTERVAL ' . MINUTOS_RELE . ' MINUTE, NULL) WHERE id = 1')
        ->execute([$d['rele'] ? 1 : 0]);
}
if (array_key_exists('bovino_id', $d)) {
    $bovino = empty($d['bovino_id']) ? null : animalDoUsuario($usuario, $d['bovino_id']);
    banco()->prepare('UPDATE central SET bovino_id = ? WHERE id = 1')->execute([$bovino]);
}
responder(['dono' => true, 'bovino_id' => animalDaCentral(), 'rele' => estadoRele()]);
