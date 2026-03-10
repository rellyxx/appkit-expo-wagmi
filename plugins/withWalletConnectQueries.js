const { withAndroidManifest } = require('@expo/config-plugins');

const walletPackages = [
  'io.metamask',
  'com.wallet.crypto.trustapp',
  'me.rainbow',
  'org.toshi',
  'com.okinc.okex.gp',
  'com.tokenpocket.opensource',
  'im.token.app',
  'com.bifrostwallet',
  'com.zerion.android',
  'com.frontierwallet',
  'io.zerion.android',
  'com.bybit.app',
  'com.bitget.web3',
  'com.binance.dev',
  'com.solana.mobilewalletadapter.walletlib',
  'com.phantom',
  'com.solflare.mobile'
];

const intentSchemes = [
  'https',
  'wc',
  'wcm',
  'metamask',
  'trust',
  'rainbow',
  'coinbase',
  'phantom',
  'solflare',
  'okx'
];

const hasPackageQuery = (queries, packageName) =>
  queries.some(query =>
    (query.package || []).some(pkg => pkg.$['android:name'] === packageName)
  );

const hasSchemeIntentQuery = (queries, scheme) =>
  queries.some(query =>
    (query.intent || []).some(intent =>
      (intent.data || []).some(data => data.$['android:scheme'] === scheme)
    )
  );

module.exports = function withWalletConnectQueries(config) {
  return withAndroidManifest(config, configWithManifest => {
    const manifest = configWithManifest.modResults.manifest;
    manifest.queries = manifest.queries || [];

    walletPackages.forEach(packageName => {
      if (!hasPackageQuery(manifest.queries, packageName)) {
        manifest.queries.push({
          package: [{ $: { 'android:name': packageName } }]
        });
      }
    });

    intentSchemes.forEach(scheme => {
      if (!hasSchemeIntentQuery(manifest.queries, scheme)) {
        manifest.queries.push({
          intent: [
            {
              action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
              category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }],
              data: [{ $: { 'android:scheme': scheme } }]
            }
          ]
        });
      }
    });

    return configWithManifest;
  });
};
