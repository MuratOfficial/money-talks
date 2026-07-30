const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Убирает entitlement `aps-environment` из iOS-сборки.
 *
 * Зачем: пакет expo-notifications автоматически добавляет этот entitlement
 * (см. expo-notifications/plugin/build/withNotificationsIOS.js), потому что он
 * рассчитан в том числе на УДАЛЁННЫЕ push через APNs. Приложение использует
 * только ЛОКАЛЬНЫЕ уведомления (напоминания планируются на самом устройстве),
 * серверной рассылки push нет.
 *
 * Из-за лишнего entitlement Xcode требовал provisioning profile с capability
 * "Push Notifications" и сборка падала с ошибкой:
 *   Provisioning Profile ... does not support the Push Notifications capability
 *
 * Плагин должен идти ПОСЛЕДНИМ в списке `plugins` в app.json, чтобы его mod
 * выполнился после expo-notifications и удалил уже проставленный ключ.
 */
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
