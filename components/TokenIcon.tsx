import React from 'react';
import { Image, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
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

    const asset = Asset.fromModule(svgModule);

    (async () => {
      try {
        await asset.downloadAsync();
      } catch {
      }

      try {
        const uri = asset.localUri ?? asset.uri;
        const xml = asset.localUri
          ? await FileSystem.readAsStringAsync(uri)
          : await (await fetch(uri)).text();

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
  }, [svgModule]);

  if (svgModule) {
    if (!svgXml) {
      return <View style={{ width: size, height: size }} />;
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
