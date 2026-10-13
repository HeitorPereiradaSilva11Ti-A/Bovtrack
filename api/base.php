<?php
// Base do servidor: conexão com o banco e funções usadas por todas as rotas.

date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: application/json; charset=utf-8');

// Responde em JSON e encerra
function responder($dados, int $status = 200): void {
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

function erro(string $mensagem, int $status = 400): void {
    responder(['erro' => $mensagem], $status);
}

// Lê o corpo da requisição enviado em JSON
function corpo(): array {
    $dados = json_decode(file_get_contents('php://input'), true);
    return is_array($dados) ? $dados : [];
}

$arquivoConfig = __DIR__ . '/config.php';
if (!file_exists($arquivoConfig)) {
    erro('Falta o arquivo api/config.php no servidor.', 500);
}
$config = require $arquivoConfig;

// Conexão com o banco (PDO)
function banco(): PDO {
    static $pdo = null;
    global $config;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                "mysql:host={$config['db_host']};dbname={$config['db_nome']};charset=utf8mb4",
                $config['db_usuario'],
                $config['db_senha'],
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
            $pdo->exec("SET time_zone = '-03:00'");
        } catch (PDOException $e) {
            erro('Não foi possível conectar ao banco.', 500);
        }
    }
    return $pdo;
}
