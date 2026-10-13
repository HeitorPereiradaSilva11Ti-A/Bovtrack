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

// Aceita só o método esperado (ex.: POST)
function exigirMetodo(string $metodo): void {
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        erro('Método não permitido.', 405);
    }
}

function emailValido(string $email): bool {
    return strlen($email) <= 255 && filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// ---------- Sessão (login) ----------
// O cookie fica preso à pasta do site, para não misturar com os sites
// dos outros grupos que estão no mesmo servidor.
function iniciarSessao(bool $lembrar = false): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $pastaSite = rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/') . '/';
    session_name('BOVTRACK');
    session_set_cookie_params([
        'lifetime' => $lembrar ? 60 * 60 * 24 * 30 : 0,  // "Salvar senha" = 30 dias
        'path'     => $pastaSite,
        'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    if ($lembrar) ini_set('session.gc_maxlifetime', (string)(60 * 60 * 24 * 30));
    session_start();
}

// Para as rotas que precisam de login: devolve o id do usuário
function usuarioLogado(): int {
    iniciarSessao();
    if (empty($_SESSION['usuario_id'])) {
        erro('Faça login novamente.', 401);
    }
    return (int)$_SESSION['usuario_id'];
}

function entrar(int $id, string $email, bool $lembrar): void {
    iniciarSessao($lembrar);
    session_regenerate_id(true);
    $_SESSION['usuario_id'] = $id;
    $_SESSION['email'] = $email;
}
