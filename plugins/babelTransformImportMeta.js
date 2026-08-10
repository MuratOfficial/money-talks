/**
 * Заменяет `import.meta` на пустой объект `({})`.
 *
 * Зачем: Metro собирает веб-бандл как ОБЫЧНЫЙ скрипт (не ES-модуль), а
 * `import.meta` допустим только внутри модуля. Браузер падает ещё на разборе:
 *   Uncaught SyntaxError: Cannot use 'import.meta' outside a module
 *
 * Источник — devtools-middleware библиотеки zustand (`import.meta.env.MODE`).
 * Он попадает в бандл, потому что стор импортирует `persist` из
 * `zustand/middleware`, а Metro не делает tree-shaking и тянет весь модуль.
 *
 * После замены `import.meta.env` вычисляется в `undefined`, и zustand просто
 * не включает devtools — ровно то поведение, которое нам нужно в проде.
 *
 * Замена безопасна: код с `import.meta` в вебе и так не мог выполниться
 * (падал синтаксической ошибкой), поэтому мы превращаем жёсткий крэш в
 * штатное `undefined`.
 */
module.exports = function babelTransformImportMeta() {
  return {
    name: 'transform-import-meta-to-empty-object',
    visitor: {
      MetaProperty(path) {
        const { node } = path;
        // MetaProperty покрывает и `new.target` — трогаем только `import.meta`.
        if (node.meta && node.meta.name === 'import' && node.property.name === 'meta') {
          path.replaceWithSourceString('({})');
        }
      },
    },
  };
};
