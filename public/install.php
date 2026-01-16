<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH, HEAD');
header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization, Origin');
header('Access-Control-Allow-Credentials: true');
header('X-Frame-Options: ALLOWALL');
header('X-Frame-Options: SAMEORIGIN');
header('Content-Security-Policy: frame-ancestors *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Content-Length: 0');
    http_response_code(200);
    exit;
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Expires" content="0">
        <meta http-equiv="Cache-control" content="max-age=0,immutable, no-cache, no-store">
        <script src="https://api.bitrix24.com/api/v1/"></script>
    </head>
    <body>
        <script>
            BX24.init(function() {
                BX24.callMethod(
                    'app.info', {},
                    function(result) {
                        if (result.answer && result.answer.result) {
                            if (result.answer.result.INSTALLED == false) {
                                BX24.installFinish();
                                if (result.answer.result.INSTALLED) {
                                    console.log('Приложение установлено. Ок.');
                                }
                            } else {
                                console.log('Приложение уже установлено.');
                            }
                        } else {
                            console.error('Ошибка при получении информации о приложении');
                        }
                    }
                );
            });
        </script>
    </body>
</html>
