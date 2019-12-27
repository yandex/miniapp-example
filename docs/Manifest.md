# Манифест

| **Название** | **Тип** | **Описание** | **Пример** |
|---|---|---|---|
| `name`  | `String` | Название приложения  | `Тестовое приложение` |
| `short_name` | `String` | Короткое название приложения. Используется в интерфейсах, когда мало места  | `Тест` |
| `description` | `String` | Описание приложения | `Тестовое приложение для проверки работоспособности сайта на платформе миниаппов` |
| `lang` | `String` | Основной язык приложения  | `ru` |
| `icons` | `Array<Object>` | Список иконок приложения в разных размерах. Поддерживается формат `svg` (предпочтителен), `webp`, `png` и `ico` | ```[{"src": "icon/lowres.webp", "sizes": "64x64","type": "image/webp"}, {"src": "icon/hires.svg","sizes": "192x192", "type": "image/svg"}]``` |
| `start_url` | `String` | Ссылка на главную страницу приложения | `https://yoursite.ru/miniapp/index.html` |
| `yandex.manifest_version` | `Integer` | Версия формата манифеста | 1 |
| `yandex.app_version` | `String` | Версия приложения | `20191211.1545` |
| `yandex.app_id` | `String` | Идентификатор приложения, полученный при регистрации | `3ffs-234fsdf-sdf3r2` |
| `yandex.base_url` | `String` | Опциональный параметр задающий путь приложения, если манифест и приложение лежат на разных урлах. Он же применяется для резолва путей ресурсов. Путь должен заканчиваться на /. Если по base_url лежит главная страница приложения, то ее явно нужно добавить в список ресурсов через . (точка) или пустая строка | |
| `yandex.splash_screen_color` | `String` | Цвет экрана загрузки приложения | `#FFCC00` |
| `yandex.cache.resources` | `Array<String>` | Список ссылок на статику, которая необходима для работы приложения в офлайн-режиме | |
| `yandex.prefetch` | `Array<String>` | Список урлов, ответы которых нужно обновлять в фоне | |
| `yandex.cache.data.threshold` | `Integer` | Время предельной актуальности закэшированных данных. Влияет на период запроса данных в фоне и на показ сплэш-скрина при открытии приложения | 360 |

## сache.resources

Принимаются следующие виды ссылок:
- Cо схемой `https://yoursite.ru/path/to/resource`;
- Без схемы `//yoursite.ru/path/to/resource` — будет использована схема, по которой был загружен манифест;
- Начинающиеся с `/` — абсолютные ссылки от корня сайта со схемой, по которой был загружен манифест;
- Все остальные - относительные ссылки.

Ссылки могут вести как на ресурсы с этого сайта, так и на внешние ресурсы.

## Пример

```json
{
  "name": "Тестовое приложение",
  "short_name": "Тест",
  "description": "Тестовое приложение для проверки работоспособности сайта на платформе миниаппов",
  "lang": "ru",
  "icons": [
    {
      "src": "icons/favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },{
      "src": "icons/lowres.png",
      "sizes": "192x192",
      "type": "image/png"
    }, {
      "src": "icons/hires.svg",
      "sizes": "512x512",
      "type": "image/svg"
    }
  ],
  "start_url": "https://yoursite.ru/miniapp/index.html",
  "yandex": {
    "manifest_version": 1,
    "app_id": "3ffs-234fsdf-sdf3r2",
    "app_version": "20191211.1545",
    "base_url": "https://yoursite.ru/miniapp/",
    "splash_screen_color": "#FFCC00",
    "cache": {
      "resources": [
        "/static/css/file1.css",
        "/static/css/file2.css",
        "/static/js/file1.js",
        "/static/js/file2.js",
        "/static/media/icon1.svg",
        "/static/media/icon2.svg",
        ...
      ]
    },
    "prefetch": [
      "https://api.yoursite.ru/v2/launch"
    ]
  }
}
```
