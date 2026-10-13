<?php
// Vacinas.
//   GET                                  -> vacinas padrão + as criadas pelo dono
//   POST { "nome": "..." }               -> cria uma vacina nova ("Adicionar vacina")
//   POST { "bovino_id": 5, "ids": [1,3] } -> salva quais vacinas o animal tomou
require __DIR__ . '/base.php';
$usuario = usuarioLogado();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = banco()->prepare(
        'SELECT id, nome FROM vacinas WHERE usuario_id IS NULL OR usuario_id = ?
          ORDER BY usuario_id IS NOT NULL, id'
    );
    $sql->execute([$usuario]);
    responder(array_map(fn($v) => ['id' => (int)$v['id'], 'nome' => $v['nome']], $sql->fetchAll()));
}

exigirMetodo('POST');
$d = corpo();

// Salvar as caixinhas marcadas de um animal
if (isset($d['bovino_id'])) {
    $bovino = animalDoUsuario($usuario, $d['bovino_id']);
    $ids = array_values(array_filter(array_map('intval', (array)($d['ids'] ?? []))));

    $pdo = banco();
    $pdo->beginTransaction();
    $pdo->prepare('DELETE FROM bovino_vacinas WHERE bovino_id = ?')->execute([$bovino]);
    if ($ids) {
        // Só aceita vacinas padrão ou do próprio dono
        $marcas = implode(',', array_fill(0, count($ids), '?'));
        $pdo->prepare(
            "INSERT INTO bovino_vacinas (bovino_id, vacina_id)
             SELECT ?, id FROM vacinas WHERE id IN ($marcas) AND (usuario_id IS NULL OR usuario_id = ?)"
        )->execute([$bovino, ...$ids, $usuario]);
    }
    $pdo->commit();
    responder(['ok' => true]);
}

// Criar vacina nova
$nome = trim((string)($d['nome'] ?? ''));
if ($nome === '' || mb_strlen($nome) > 100) erro('Digite o nome da vacina.');
banco()->prepare('INSERT INTO vacinas (usuario_id, nome) VALUES (?, ?)')->execute([$usuario, $nome]);
responder(['id' => (int)banco()->lastInsertId(), 'nome' => $nome], 201);
