import React from 'react';
import { Image, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { SvgUri } from 'react-native-svg';

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

  const [svgUri, setSvgUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    if (!svgModule) {
      setSvgUri(null);
      return () => {
        cancelled = true;
      };
    }

    const asset = Asset.fromModule(svgModule);

    (async () => {
      try {
        await asset.downloadAsync();
        if (!cancelled) {
          setSvgUri(asset.localUri ?? asset.uri);
        }
      } catch {
        if (!cancelled) {
          setSvgUri(asset.uri);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [svgModule]);

  if (svgModule) {
    if (!svgUri) {
      return <View style={{ width: size, height: size }} />;
    }

    return (
      <View style={{ width: size, height: size }}>
        <SvgUri width={size} height={size} uri={svgUri} />
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
