export default function handler(req: any, res: any) {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Возвращаем HTML страницу установки
  const html = `<!DOCTYPE html>
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
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}
