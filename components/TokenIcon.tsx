import React from 'react';
import { Image, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { SvgXml } from 'react-native-svg';

type Props = {
  symbol: string;
  size?: number;
};

const svgTokenMap: Record<string, number> = {
  USDC: require('@/assets/tokens/usdc.svg'),
  USDT: require('@/assets/tokens/usdt.svg'),
  WBTC: require('@/assets/tokens/wbtc.svg'),
  WETH: require('@/assets/tokens/weth.svg'),
};

const imageTokenMap: Record<string, number> = {
  TSLA: require('@/assets/tokens/tsla.jpg'),
  NVIDIA: require('@/assets/tokens/nvidia.jpg'),
  PHAROS: require('@/assets/tokens/pharos.png'),
};

export function TokenIcon({ symbol, size = 28 }: Props) {
  const normalizedSymbol = symbol.toUpperCase();
  const svgModule = svgTokenMap[normalizedSymbol];

  const [svgXml, setSvgXml] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    if (!svgModule) {
      setSvgXml(null);
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const loadedAssets = await Asset.loadAsync(svgModule);
        const asset = loadedAssets[0] ?? Asset.fromModule(svgModule);
        const ensured = asset.localUri ? asset : await asset.downloadAsync();
        const localUri = ensured.localUri;
        const remoteUri = ensured.uri;

        let xml: string | null = null;

        if (localUri) {
          const normalizedLocalUri = localUri.startsWith('file://') ? localUri : `file://${localUri}`;
          xml = await new File(normalizedLocalUri).text();
        } else if (remoteUri?.startsWith('http://') || remoteUri?.startsWith('https://')) {
          xml = await (await fetch(remoteUri)).text();
        }

        if (!cancelled) {
          setSvgXml(xml);
        }
      } catch {
        if (!cancelled) {
          setSvgXml(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [svgModule, normalizedSymbol]);

  if (svgModule) {
    if (!svgXml) {
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '700', fontSize: Math.max(10, Math.floor(size * 0.45)) }}>
            {normalizedSymbol.slice(0, 1)}
          </Text>
        </View>
      );
    }

    return (
      <View style={{ width: size, height: size }}>
        <SvgXml width={size} height={size} xml={svgXml} />
      </View>
    );
  }

  const imageModule = imageTokenMap[normalizedSymbol];
  if (imageModule) {
    return (
      <Image
        source={imageModule}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontWeight: '700', fontSize: Math.max(10, Math.floor(size * 0.45)) }}>
        {normalizedSymbol.slice(0, 1)}
      </Text>
    </View>
  );
}
