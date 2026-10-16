<?php
// A central pergunta aqui, a cada poucos segundos, se o relé deve ficar ligado.
//   GET (com a chave da central no cabeçalho X-Chave) -> { "ligar": true, "restante": 540 }
require __DIR__ . '/base.php';
exigirMetodo('GET');
exigirChaveCentral();

$a = estadoRele();
responder(['ligar' => $a['ligado'], 'restante' => $a['restante']]);
