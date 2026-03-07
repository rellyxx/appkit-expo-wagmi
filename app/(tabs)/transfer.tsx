import React, { useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { reownGray, reownOrange } from '@/constants/Colors';
import { Address, erc20Abi, isAddress, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

export default function TransferScreen() {
  const { address } = useAccount();
  const [token, setToken] = useState('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const tokenAddress = useMemo(() => {
    const t = token.trim();
    return isAddress(t) ? (t as Address) : undefined;
  }, [token]);
  const toAddress = useMemo(() => {
    const v = to.trim();
    return isAddress(v) ? (v as Address) : undefined;
  }, [to]);
  const amountNormalized = useMemo(() => amount.replace(',', '.').trim(), [amount]);
  const amountValid = useMemo(() => {
    if (!amountNormalized) return false;
    if (!/^\d+(\.\d+)?$/.test(amountNormalized)) return false;
    return parseFloat(amountNormalized) > 0;
  }, [amountNormalized]);

  const { data: decimals } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: !!tokenAddress },
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    query: { enabled: !!tokenAddress },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const canSubmit = Boolean(address && tokenAddress && toAddress && amountValid && !isPending && !isConfirming);

  const onSubmit = async () => {
    setSubmitError(undefined);
    try {
      const dec = typeof decimals === 'number' ? decimals : 18;
      const value = parseUnits(amountNormalized as `${number}`, dec);
      const hash = await writeContractAsync({
        address: tokenAddress as Address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [toAddress as Address, value],
      });
      setTxHash(hash);
    } catch (e: any) {
      setSubmitError(e?.shortMessage || e?.message || '提交失败');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: reownGray, dark: reownGray }}
      headerImage={<View style={styles.header} />}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">ERC20 转账</ThemedText>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="代币合约地址"
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />
          <TextInput
            style={styles.input}
            placeholder="接收地址"
            autoCapitalize="none"
            value={to}
            onChangeText={setTo}
          />
          <TextInput
            style={styles.input}
            placeholder="数量"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <View style={styles.tokenInfo}>
            {!!symbol && <Text style={styles.tokenText}>{String(symbol)}</Text>}
            {typeof decimals === 'number' && <Text style={styles.tokenText}>decimals: {decimals}</Text>}
          </View>
          {!address && <Text style={styles.hint}>请先连接 EVM 钱包</Text>}
          {!!amount && !amountValid && <Text style={styles.hint}>请输入有效的正数（支持小数）</Text>}
          {!!submitError && <Text style={styles.error}>{submitError}</Text>}
          {isSuccess && <Text style={styles.success}>交易已确认</Text>}
          {isError && <Text style={styles.error}>交易失败</Text>}
          <Pressable disabled={!canSubmit} onPress={onSubmit} style={[styles.button, !canSubmit && styles.buttonDisabled]}>
            {isPending || isConfirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>发送</Text>
            )}
          </Pressable>
          {!!txHash && (
            <View style={styles.hashBox}>
              <Text style={styles.hashLabel}>交易哈希</Text>
              <Text selectable style={styles.hashValue}>{txHash}</Text>
            </View>
          )}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: '100%',
    width: '100%',
  },
  container: {
    gap: 16,
  },
  form: {
    marginTop: 12,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  tokenInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  tokenText: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: reownOrange,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#ff3b30',
  },
  success: {
    color: '#28a745',
  },
  hint: {
    color: '#666',
  },
  hashBox: {
    marginTop: 8,
    gap: 6,
  },
  hashLabel: {
    fontWeight: '600',
  },
  hashValue: {
    fontFamily: 'KHTekaMono',
  },
});
