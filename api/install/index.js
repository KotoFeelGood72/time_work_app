export default async function handler(req, res) {
  // Устанавливаем CORS заголовки для всех методов
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH, HEAD')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Authorization, Origin')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // Обработка preflight запросов (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.setHeader('Content-Length', '0')
    return res.status(200).end()
  }

  // Обрабатываем GET и POST запросы
  if (req.method === 'GET' || req.method === 'POST') {
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
    return res.status(200).send(html)
  }

  // Для других методов возвращаем 405
  res.status(405).json({ error: 'Method Not Allowed' })
}
