<?php
// Animais do dono logado.
//   GET  -> lista os animais
//   POST -> cadastra um animal:
//     { "numero": "40028922", "nome": "Bartolomeu", "raca_id": 1,
//       "nascimento": "2026-02-01", "sexo": "macho", "altura": 1.76,
//       "peso": 15, "categoria": "corte", "imagem": "boi-nelore.png" }
require __DIR__ . '/base.php';
$usuario = usuarioLogado();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = banco()->prepare(
        'SELECT b.id, b.numero, b.nome, r.nome AS raca, b.data_nascimento AS nascimento,
                b.sexo, b.altura_m AS altura, b.peso_arrobas AS peso, b.categoria, b.imagem
           FROM bovinos b JOIN racas r ON r.id = b.raca_id
          WHERE b.usuario_id = ? ORDER BY b.id'
    );
    $sql->execute([$usuario]);
    responder($sql->fetchAll());
}

exigirMetodo('POST');
$d = corpo();

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

try {
    $sql = banco()->prepare(
        'INSERT INTO bovinos (usuario_id, numero, nome, raca_id, data_nascimento, sexo, altura_m, peso_arrobas, categoria, imagem)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $sql->execute([$usuario, $numero, $nome, $racaId, $nascimento ?: null, $sexo, $altura, $peso, $categoria, $imagem]);
} catch (PDOException $e) {
    if ($e->errorInfo[1] == 1062) erro('Você já tem um animal com esse número.', 409);
    erro('Erro no servidor. Tente de novo.', 500);
}

responder(['id' => (int)banco()->lastInsertId()], 201);
