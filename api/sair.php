<?php
// Logout: POST
require __DIR__ . '/base.php';
exigirMetodo('POST');

iniciarSessao();
$_SESSION = [];
$cookie = session_get_cookie_params();
setcookie(session_name(), '', time() - 3600, $cookie['path'], '', $cookie['secure'], $cookie['httponly']);
session_destroy();
responder(['ok' => true]);
