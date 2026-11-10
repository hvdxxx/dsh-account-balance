# dsh-account-balance

Две строки в подвале сайдбара DeepSeek Harness: подпись «Баланс» и крупная сумма остатка аккаунта — прямо над строкой аккаунта.

```
Баланс
¥1 250.00
[ аватар · имя · Настройки ]
```

## Что делает

- Читает баланс аккаунта через account remote (`getBalance`) — тот же источник, что и карточка в Settings → Account.
- Обновляется каждые **30 секунд**, при возврате фокуса в окно и по клику (клик = принудительное обновление).
- Показывает бонусный (подарочный) баланс в подсказке при наведении.
- Поддерживает несколько валют: `$1.00 + ¥25.00`.
- Скрывается в свёрнутом рельсе сайдбара и когда аккаунт не авторизован.
- Локализация: zh, en, ja, es, fr, de, ru, pt. Только токены темы `--dsw-alias-*`, поэтому подходит светлая и тёмная темы.

## Требования

- DeepSeek Harness `>= 0.2.1-rc.5`
- Аккаунт DeepSeek, привязанный в приложении

## Установка

Пакет — bundle-плагин (`dsh.bundle.patch` + `dsh.client`). Установка в профиль:

1. Settings → Plugins → установить бандл из папки `packages/dsh-account-balance`.
2. В профиле появится запись `dsh-account-balance` и строка `account-balance`.
3. Перезапуск не нужен: Client-половина подхватывается HMR.

Ручная установка через пакетный менеджер профиля эквивалентна:

```jsonc
// package.json профиля
"dependencies": { "dsh-account-balance": "link:./packages/dsh-account-balance" },
"dsh": { "profile": { "bundles": ["...", "dsh-account-balance"] } }
```

## Как это устроено

| Файл | Роль |
|---|---|
| `cordis.patch.yml` | Слой бандла: вставляет строку `account-balance` в дерево Loader |
| `lib/index.js` | Host-половина: только монтирование, всей логикой владеет браузер |
| `lib/client.js` | Client-половина: регистрация в слоте `sidebar.footer.action` и отрисовка |
| `locale/*.json` | `meta.title` / `meta.description` для Plugin Manager |
| `icon.svg` | Иконка плагина |

Точка расширения — слот `sidebar.footer.action`. В ширину он рендерится колонкой над `sidebar.settings` (строкой аккаунта), поэтому строка баланса оказывается ровно над аккаунтом.

Чтение — `ctx.remote.account.getBalance({ version, locale, timezoneOffsetSeconds })`; доступ гейтится `ctx.remoteAccess.whenAccess('account/watch', ...)`, как и остальной аккаунтный UI.

### Настройка внешнего вида

Размер цифр задаётся в `.dsh-bal-value` внутри `lib/client.js` (`font-size:21px`). Цвета — только токены темы: `--dsw-alias-label-primary`, `--dsw-alias-label-secondary`, `--dsw-alias-bg-layer-2`, `--dsw-alias-brand-primary`.

## Ограничения

- Ширина сайдбара: очень длинная сумма обрезается с многоточием.
- Сумма берётся из аккаунта DeepSeek; ключ API других провайдеров баланс не показывает.

## Лицензия

MIT — см. [LICENSE](LICENSE).
