<?php
// Leituras de temperatura e som.
//   POST (central)           -> salva uma leitura. Precisa da chave da central.
//     { "bovino_id": 0, "temp_animal": 38.6, "temp_ambiente": 31.2,
//       "sons": 2, "ventilador": false }
//     bovino_id 0 = grava no animal escolhido no site ("Monitorar com a central")
//   GET ?bovino=5&dia=hoje   -> leituras do animal em blocos de 5 min (mais recente primeiro)
//   GET ?dia=ontem           -> média de todos os animais do dono, em blocos de 5 min
// Leituras com mais de DIAS_GUARDADOS dias são apagadas sozinhas.
require __DIR__ . '/base.php';

const DIAS_GUARDADOS = 2;   // o site só mostra hoje e ontem

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = corpo();

    exigirChaveCentral($d);

    $numero = fn($v, $min, $max) => is_numeric($v) && $v >= $min && $v <= $max ? (float)$v : null;
    $bovino = (int)($d['bovino_id'] ?? 0);
    if ($bovino === 0) {
        $bovino = (int)animalDaCentral();
        if (!$bovino) erro('Escolha no site qual animal a central está monitorando.', 409);
    }
    $tempAnimal = $numero($d['temp_animal'] ?? null, -40, 99);
    $tempAmbiente = $numero($d['temp_ambiente'] ?? null, -40, 99);
    $sons = $numero($d['sons'] ?? 0, 0, 65535);
    if ($bovino <= 0 || $tempAnimal === null || $tempAmbiente === null || $sons === null) {
        erro('Leitura inválida.');
    }

    try {
        banco()->prepare(
            'INSERT INTO leituras (bovino_id, temp_animal, temp_ambiente, sons, ventilador) VALUES (?, ?, ?, ?, ?)'
        )->execute([$bovino, round($tempAnimal, 1), round($tempAmbiente, 1), (int)round($sons), !empty($d['ventilador']) ? 1 : 0]);
    } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1452) erro("Não existe animal com id $bovino.", 404);
        erro('Erro no servidor. Tente de novo.', 500);
    }
    banco()->exec('DELETE FROM leituras WHERE criado_em < NOW() - INTERVAL ' . DIAS_GUARDADOS . ' DAY');
    responder(['ok' => true, 'bovino_id' => $bovino], 201);
}

$usuario = usuarioLogado();

$dia = ($_GET['dia'] ?? '') === 'ontem' ? 'ontem' : 'hoje';
[$inicio, $fim] = intervaloDoDia($dia);

// Blocos de 5 min: média do bloco e o maior valor (para marcar o alerta)
$colunas = "CONCAT(DATE_FORMAT(l.criado_em, '%H'), ':', LPAD(FLOOR(MINUTE(l.criado_em) / 5) * 5, 2, '0')) AS hora,
            AVG(l.temp_animal) AS temp, AVG(l.sons) AS sons,
            MAX(l.temp_animal) AS temp_max, MAX(l.sons) AS sons_max";

if (isset($_GET['bovino'])) {
    $bovino = animalDoUsuario($usuario, $_GET['bovino']);
    $sql = banco()->prepare(
        "SELECT $colunas FROM leituras l
          WHERE l.bovino_id = ? AND l.criado_em >= ? AND l.criado_em < ?
          GROUP BY hora ORDER BY hora DESC"
    );
    $sql->execute([$bovino, $inicio, $fim]);
} else {
    $sql = banco()->prepare(
        "SELECT $colunas FROM leituras l JOIN bovinos b ON b.id = l.bovino_id
          WHERE b.usuario_id = ? AND l.criado_em >= ? AND l.criado_em < ?
          GROUP BY hora ORDER BY hora DESC"
    );
    $sql->execute([$usuario, $inicio, $fim]);
}

responder(array_map(fn($l) => [
    'hora' => $l['hora'],
    'temp' => round((float)$l['temp'], 1),
    'sons' => round((float)$l['sons'], 1),
    'tempMax' => round((float)$l['temp_max'], 1),
    'sonsMax' => (int)$l['sons_max'],
], $sql->fetchAll()));
