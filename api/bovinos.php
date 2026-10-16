<?php
// Animais do dono logado.
//   GET            -> lista os animais, com "Agora", "Média" e Regular/Irregular
//   GET ?id=5      -> um animal, com as vacinas que ele tomou
//   POST           -> cadastra um animal:
//     { "numero": "40028922", "nome": "Bartolomeu", "raca_id": 1,
//       "nascimento": "2026-02-01", "sexo": "macho", "altura": 1.76,
//       "peso": 15, "categoria": "corte", "imagem": "boi-nelore.png" }
//   POST com "id"  -> salva as alterações desse animal (mesmos campos)
//   POST { "id": 5, "excluir": true } -> exclui o animal e as leituras dele
require __DIR__ . '/base.php';
$usuario = usuarioLogado();

// Transforma uma linha do banco no formato que as páginas usam
function formatarAnimal(array $b): array {
    $temLeitura = $b['temp_agora'] !== null;
    $resumo = $temLeitura ? [
        'tempAgora' => (float)$b['temp_agora'],
        'ambAgora' => (float)$b['amb_agora'],
        'tempMedia' => $b['temp_media'] !== null ? round((float)$b['temp_media'], 1) : (float)$b['temp_agora'],
        'sonsAgora' => (int)$b['sons_agora'],
        'sonsMedia' => $b['sons_media'] !== null ? round((float)$b['sons_media'], 1) : (float)$b['sons_agora'],
        'ventilador' => (bool)$b['ventilador'],
    ] : null;
    return [
        'id' => (int)$b['id'],
        'numero' => $b['numero'],
        'nome' => $b['nome'],
        'raca' => $b['raca'],
        'raca_id' => (int)$b['raca_id'],
        'imagem' => $b['imagem'],
        'nascimento' => $b['data_nascimento'],
        'sexo' => $b['sexo'] === 'femea' ? 'Fêmea' : ($b['sexo'] === 'macho' ? 'Macho' : null),
        'altura' => $b['altura_m'] !== null ? (float)$b['altura_m'] : null,
        'peso' => $b['peso_arrobas'] !== null ? (float)$b['peso_arrobas'] : null,
        'categoria' => $b['categoria'] === 'leite' ? 'Leite' : ($b['categoria'] === 'corte' ? 'Corte' : null),
        'resumo' => $resumo,
        'estado' => [
            'temperatura' => !$temLeitura ? 'Sem dados' : ((float)$b['temp_agora'] >= LIMITE_TEMP ? 'Irregular' : 'Regular'),
            'vocalizacao' => !$temLeitura ? 'Sem dados' : ((int)$b['sons_agora'] >= LIMITE_SONS ? 'Irregular' : 'Regular'),
        ],
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    [$inicio, $fim] = intervaloDoDia('hoje');
    // "Agora" = última leitura do animal; "Média" = média de hoje
    $consulta =
        'SELECT b.*, r.nome AS raca,
                u.temp_animal AS temp_agora, u.temp_ambiente AS amb_agora, u.sons AS sons_agora, u.ventilador,
                (SELECT AVG(l.temp_animal) FROM leituras l WHERE l.bovino_id = b.id AND l.criado_em >= ? AND l.criado_em < ?) AS temp_media,
                (SELECT AVG(l.sons)        FROM leituras l WHERE l.bovino_id = b.id AND l.criado_em >= ? AND l.criado_em < ?) AS sons_media
           FROM bovinos b
           JOIN racas r ON r.id = b.raca_id
           LEFT JOIN leituras u ON u.id = (SELECT l.id FROM leituras l WHERE l.bovino_id = b.id ORDER BY l.criado_em DESC, l.id DESC LIMIT 1)
          WHERE b.usuario_id = ?';
    $params = [$inicio, $fim, $inicio, $fim, $usuario];

    if (isset($_GET['id'])) {
        $sql = banco()->prepare($consulta . ' AND b.id = ?');
        $sql->execute([...$params, (int)$_GET['id']]);
        $animal = $sql->fetch();
        if (!$animal) erro('Animal não encontrado.', 404);
        $vacinas = banco()->prepare('SELECT vacina_id FROM bovino_vacinas WHERE bovino_id = ?');
        $vacinas->execute([$animal['id']]);
        responder(formatarAnimal($animal) + ['vacinas' => array_map('intval', $vacinas->fetchAll(PDO::FETCH_COLUMN))]);
    }

    $sql = banco()->prepare($consulta . ' ORDER BY b.id');
    $sql->execute($params);
    responder(array_map('formatarAnimal', $sql->fetchAll()));
}

exigirMetodo('POST');
$d = corpo();

// Editar ou excluir: o animal precisa ser do dono logado
$id = (int)($d['id'] ?? 0);
if ($id) animalDoUsuario($usuario, $id);

if ($id && !empty($d['excluir'])) {
    banco()->prepare('DELETE FROM bovinos WHERE id = ? AND usuario_id = ?')->execute([$id, $usuario]);
    responder(['ok' => true]);
}

$numero = trim((string)($d['numero'] ?? ''));
$nome = trim((string)($d['nome'] ?? ''));
$racaId = (int)($d['raca_id'] ?? 0);
if ($numero === '' || mb_strlen($numero) > 20) erro('Digite o número do animal (até 20 caracteres).');
if ($nome === '' || mb_strlen($nome) > 100) erro('Digite o nome do animal.');

// Campos opcionais: vazio vira NULL
$nascimento = $d['nascimento'] ?? '';
if ($nascimento !== '' && (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $nascimento) || $nascimento > date('Y-m-d'))) {
    erro('Data de nascimento inválida.');
}
$sexo = in_array($d['sexo'] ?? '', ['macho', 'femea'], true) ? $d['sexo'] : null;
$categoria = in_array($d['categoria'] ?? '', ['corte', 'leite'], true) ? $d['categoria'] : null;
$altura = ($d['altura'] ?? '') === '' ? null : (float)$d['altura'];
$peso = ($d['peso'] ?? '') === '' ? null : (float)$d['peso'];
if ($altura !== null && ($altura <= 0 || $altura > 3)) erro('Altura inválida (em metros, ex.: 1,76).');
if ($peso !== null && ($peso <= 0 || $peso > 200)) erro('Peso inválido (em arrobas).');
$imagens = ['boi-nelore.png', 'boi-angus.png', 'boi-senepol.png', 'boi-guzera.png'];
$imagem = in_array($d['imagem'] ?? '', $imagens, true) ? $d['imagem'] : null;

$raca = banco()->prepare('SELECT id FROM racas WHERE id = ?');
$raca->execute([$racaId]);
if (!$raca->fetch()) erro('Escolha a raça.');

$campos = [$numero, $nome, $racaId, $nascimento ?: null, $sexo, $altura, $peso, $categoria, $imagem];
try {
    if ($id) {
        banco()->prepare(
            'UPDATE bovinos SET numero = ?, nome = ?, raca_id = ?, data_nascimento = ?, sexo = ?,
                    altura_m = ?, peso_arrobas = ?, categoria = ?, imagem = ?
              WHERE id = ? AND usuario_id = ?'
        )->execute([...$campos, $id, $usuario]);
        responder(['id' => $id]);
    }
    banco()->prepare(
        'INSERT INTO bovinos (numero, nome, raca_id, data_nascimento, sexo, altura_m, peso_arrobas, categoria, imagem, usuario_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([...$campos, $usuario]);
} catch (PDOException $e) {
    if ($e->errorInfo[1] == 1062) erro('Você já tem um animal com esse número.', 409);
    erro('Erro no servidor. Tente de novo.', 500);
}

responder(['id' => (int)banco()->lastInsertId()], 201);
