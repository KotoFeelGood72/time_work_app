<? header('Access-Control-Allow-Origin: *'); ?>
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
            BX24.init( function() {
                BX24.callMethod(
                    'app.info', {},
                    function( result ) {
                        if ( result.answer.result.INSTALLED == false ) {
                            BX24.installFinish();
                            if( result.answer.result.INSTALLED ){
                                console.dir( 'Приложение установлено. Ок.' )
                            }
                        }
                    }
                )
            })
        </script>
    </body>
</html>