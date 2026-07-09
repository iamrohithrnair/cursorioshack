/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'keyboard',
  name: 'KeysorKeyboard',
  displayName: 'Keysor',
  deploymentTarget: '15.1',
  bundleIdentifier: '.keyboard',
  frameworks: ['UIKit'],
  entitlements: {
    'com.apple.security.application-groups': [
      `group.${config.ios?.bundleIdentifier ?? 'com.keysor.keyboard'}`,
    ],
  },
});
