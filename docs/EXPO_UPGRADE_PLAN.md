# План апгрейда Expo SDK (устранение уязвимостей)

> Составлено: SDK 52.0.48 / React Native 0.76.9 / React 18.3.1
> Цель: довести до актуального SDK, закрыв транзитивные уязвимости в тулчейне Expo.

## Статус
| Шаг | Состояние | Итог |
|---|---|---|
| 52 → 53 | ✅ выполнен | RN 0.79.6, React 19.0.0, expo-router 5. Влит в `master` (`7f894db`), проверен на устройстве. |
| 53 → 54 | ✅ выполнен | RN 0.81.5, React 19.1.0, expo-router 6, reanimated 4. Ветка `chore/expo-upgrade-54`. |
| 54 → 55 | ⏳ не начат | Удаление Legacy Architecture. |
| 55 → 56 | ⏳ не начат | |

Уязвимости npm: 41 (SDK 52) → 28 (SDK 53) → **30** (SDK 54, все — build-time).

## TL;DR
- Апгрейдиться **по одному мажору за раз**: 52 → 53 → 54 → 55 → 56. Не прыгать через версии.
- Каждый шаг = отдельная ветка + отдельный PR + сборка dev-client + ручная проверка на устройстве.
- Самый ломающий шаг — **52 → 53** (React 18 → 19, New Architecture включается по умолчанию, expo-router 4 → 5).
- Большинство текущих уязвимостей — build-time (`@expo/cli`, `metro`, `tar`, `cacache`), в собранный APK/IPA не попадают.

---

## 0. Подготовка (до любых изменений)
- [ ] Зафиксировать рабочее состояние: отдельная ветка `chore/expo-upgrade`, чистый `git status`.
- [ ] Зафиксировать baseline: `npx expo-doctor` (запомнить текущие предупреждения), `npm test`, `npx tsc --noEmit` (текущие 6 ошибок в шаблонах — ожидаемы).
- [ ] Node ≥ 20 LTS (SDK 53+ требует Node 20+).
- [ ] Убедиться, что есть рабочий dev-build pipeline (EAS Build или локальный `expo run:android/ios`), т.к. проект на `expo-dev-client` — Expo Go недостаточно.
- [ ] Снять полный список нативных зависимостей и их совместимости с New Architecture (см. таблицу ниже).

---

## Общая процедура одного шага (повторять для каждого мажора)
```bash
# 1. Поднять сам expo до нужного мажора
npx expo install expo@^53        # (затем ^54, ^55, ^56)

# 2. Привести все expo-* и связанные пакеты к версиям, совместимым с SDK
npx expo install --fix

# 3. Проверить здоровье проекта
npx expo-doctor

# 4. Типы и тесты
npx tsc --noEmit
npm test

# 5. Собрать dev-client и прогнать ручной чек-лист на устройстве
npx expo run:android   # и/или run:ios  (или EAS build)
```
После зелёного прогона — коммит/PR, только потом следующий мажор.

---

## Пошагово

### Шаг 1. SDK 52 → 53  ⚠️ крупный
**Что меняется:**
- **React 18.3 → React 19.0**, React Native 0.76 → **0.79**.
- **New Architecture включается по умолчанию.** Нужно проверить все нативные модули.
- **expo-router 4 → 5** — изменения в типизации маршрутов (`Href`), возможны правки в навигации.
- `expo-notifications`: часть функционала push убрана из Expo Go — у нас dev-client, так что ок, но проверить.

**Риски именно для этого проекта:**
- React 19: удалены legacy-API (`propTypes`, строковые refs, legacy context). Наш `ErrorBoundary` — классовый компонент, это поддерживается. Проверить `forwardRef`/`ref` в кастомных компонентах.
- `Href`-типизация expo-router: у нас много `router.push/replace` и проп `backLink?: Href` ([AddForm](../app/components/AddForm.tsx)), плюс уже есть ошибка типов в шаблонном `components/ExternalLink.tsx` — на v5 её, вероятно, придётся переписать.
- New Arch: проверить `react-native-reanimated`, `react-native-svg`, `react-native-webview`, `react-native-modal` (у нас RC-версия `14.0.0-rc.1` — кандидат на замену/обновление), `react-native-gesture-handler`, `@react-native-community/netinfo`, `react-native-paper`.
- `nativewind` 4.x: убедиться, что версия совместима с RN 0.79 (обновить при необходимости).

**Действия:**
- [ ] `npx expo install expo@^53 && npx expo install --fix`
- [ ] Обновить `nativewind` и `react-native-reanimated` до версий под SDK 53.
- [ ] Решить судьбу `react-native-modal@rc` (обновить до стабильной или заменить на `@gorhom/bottom-sheet` / нативный Modal).
- [ ] Пройти миграционные заметки expo-router 5, починить типы `Href`.
- [ ] Полный ручной regression-чек (см. чек-лист ниже).

### Шаг 2. SDK 53 → 54 ✅ выполнен
**Фактически поставлено:** expo 54.0.36, RN 0.81.5, React/React DOM 19.1.0, expo-router 6.0.24,
reanimated **4.1.7** (+ новый обязательный `react-native-worklets` 0.5.1), nativewind снят с пина → 4.2.6,
jest-expo 54, TypeScript 5.9.2.

**Что пришлось поправить руками (не покрывается `expo install --fix`):**
- `@types/react` был жёстко пришпилен к `~19.0.10` и блокировал резолв — поднят до `~19.1.x`.
- `babel-preset-expo` перестал подниматься в корень `node_modules` (лежит внутри `expo/node_modules`),
  из-за чего падали **все** jest-сьюты с `Cannot find module 'babel-preset-expo'`. Добавлен явной devDependency.
- `expo install --fix` дописал плагины `expo-secure-store` и `expo-web-browser` **после**
  `./plugins/withoutPushEntitlement`. Порядок восстановлен — этот плагин обязан быть последним,
  иначе снятие `aps-environment` может быть перезатёрто (проверено: `expo config --type introspect` → `entitlements: {}`).
- Патч `patches/@expo+cli+*.patch` (кириллица в пути ломала заголовок `X-React-Native-Project-Root`) **удалён** —
  в `@expo/cli` 54.0.26 баг починен апстримом (`encodeURI`). `patch-package` в postinstall оставлен на будущее.
- `targetSdkVersion`/`compileSdkVersion` подняты 35 → **36** (требование Google Play с 31.08.2026).

**Проверено:** `tsc --noEmit` 0 ошибок · jest 13/13 · `expo-doctor` 18/18 ·
веб-бандл экспортируется, 0 вхождений `import.meta`, логин-экран рендерится без ошибок в консоли.

**Известное ограничение:** `expo prebuild` локально падает
(`withAndroidDangerousBaseMod: Project file "MainApplication" does not exist`) — среда Windows + кириллица в пути.
На EAS (Linux, ASCII-путь) prebuild отрабатывает штатно. Значит, фактический `targetSdk=36`
подтверждать по логам EAS-сборки / Play Console, а не локально.

- [ ] Ручной regression на устройстве (чек-лист ниже) — reanimated 4 и `react-native-modal@rc` под подозрением.

### Шаг 3. SDK 54 → 55  ⚠️ удаление Legacy Architecture
- В SDK 55 **Legacy Architecture удаляется** — остаётся только New Arch. Если на шаге 1 всё переведено корректно, риск низкий.
- [ ] Убедиться, что НИ один нативный модуль не зависит от старой архитектуры.
- [ ] `npx expo install expo@^55 && npx expo install --fix` → doctor → tsc → tests → сборка.

### Шаг 4. SDK 55 → 56 (последний стабильный)
- [ ] `npx expo install expo@^56 && npx expo install --fix` → doctor → tsc → tests → сборка.
- [ ] Финальный `npm audit` — ожидаем существенное снижение/обнуление уязвимостей тулчейна.

---

## Таблица нативных зависимостей (проверить совместимость с New Arch на шаге 1)
| Пакет | Текущая версия | На что обратить внимание |
|---|---|---|
| react-native-reanimated | ~3.16.1 | Обновить до версии под целевой RN; критичен для New Arch |
| react-native-gesture-handler | ~2.20.2 | Обновить вместе с reanimated |
| react-native-svg | 15.8.0 | Проверить New Arch |
| react-native-screens | ~4.4.0 | `expo install --fix` подтянет |
| react-native-safe-area-context | 4.12.0 | `expo install --fix` подтянет |
| react-native-webview | 13.12.5 | Проверить New Arch |
| react-native-modal | **14.0.0-rc.1** | RC — заменить/обновить, частый источник проблем |
| react-native-paper | ^5.14.5 | Обычно ок, проверить тему/иконки |
| react-native-element-dropdown | ^2.12.4 | Проверить |
| @react-native-community/netinfo | (только что добавлен) | `expo install --fix` выставит совместимую версию |
| @react-native-async-storage/async-storage | 1.23.1 | `expo install --fix` поднимет |
| nativewind | ^4.1.23 | Сверить матрицу совместимости с RN |
| pdf-lib / react-native-markdown-display | JS-only | Низкий риск (но `markdown-it` числится в audit) |

---

## Чек-лист ручной проверки после каждого шага
- [ ] Запуск приложения, сплэш-скрин скрывается, шрифты SF Pro грузятся.
- [ ] Регистрация / вход / выход (Supabase auth).
- [ ] Восстановление пароля (OTP / new-password).
- [ ] Финансы: добавление/редактирование доходов и расходов (категория `expence`!), отображение в категориях.
- [ ] Кошельки: создание/редактирование/удаление, пересчёт баланса.
- [ ] Цели: создание/редактирование, расчёт прогресса и monthlyInvestment.
- [ ] ЛФП: заполнение, генерация PDF (`expo-print`, `expo-sharing`, `pdf-lib`).
- [ ] Синхронизация с сервером (онлайн), offline-баннер (NetInfo), ErrorBoundary.
- [ ] Навигация по всем табам, drawer'ы, модалки.
- [ ] Тёмная/светлая тема, переключение языка/валюты.

---

## Откат
- Каждый мажор — отдельный коммит/PR, откат = revert PR.
- Перед началом сохранить `package.json` + `package-lock.json` (git уже это покрывает).
- Если сборка падает на нативном модуле — зафиксировать проблемный пакет, при необходимости откатить шаг и дождаться его обновления под нужный SDK.

## Заметки по уязвимостям
- Большинство advisories — **build-time** (`@expo/cli`, `@expo/config*`, `@expo/metro-config`, `@expo/prebuild-config`, `tar`, `cacache`, `ajv`, `postcss`, `xcode`, `@xmldom/xmldom`): исполняются на машине разработчика/CI, в артефакт приложения не входят. Реальный риск — низкий, но апгрейд закрывает их штатно.
- **Runtime-пакеты** (`expo`, `expo-router`, `expo-constants`, `expo-linking`, `expo-notifications`, `expo-splash-screen`, `markdown-it`/`react-native-markdown-display`) обновятся вместе с SDK.
- Точные версии RN/React для SDK 54/55/56 и их breaking changes подтверждать по официальному changelog/блогу Expo **на момент** выполнения шага (план составлен с опорой на знание до SDK 53).
