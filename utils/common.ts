// To be used in JSON.stringify when a field might be bigint

import BigNumber from "bignumber.js";
import { ethers } from "ethers";

// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const isZeroAddress = (address: string) => address === ZERO_ADDRESS;
export const formatBigintToString = (value: bigint | BigNumber | string, decimals = 18) => {
    if (!value) {
      return "0";
    }
    return BigNumber(ethers.formatUnits(value.toString(), decimals)).toFixed(6,1)
  };
  
  export const formatTokenToUSD = (tokenBanlance: number, price: bigint) => {
    return BigNumber(tokenBanlance)
      .times(BigNumber(ethers.formatUnits(price, 8)))
      .toString();
  };
  
  export const formatTokenToPlaceUSD = (tokenBanlance: any, price: bigint) => {
  
    
    if(Number.isNaN(tokenBanlance)){
      return "0.00";
    }
    return BigNumber(tokenBanlance)
      .times(BigNumber(ethers.formatUnits(price, 8)))
      .decimalPlaces(7)
      .toFormat(2);
  };
  
  export const formatUSDDispaly = (value: string) => {
    if (Number(value) < 0.0001) {
      return "0.00";
    }
    if (value==='NaN') {
      return "0.00";
    }
    // if (value.includes("e")) {
    //   return value;
    // }
    if (hasTwoOrMoreDecimalPlaces(value)) {
      return BigNumber(value).decimalPlaces(7).toFormat(2);
    }
    return BigNumber(value).decimalPlaces(7).toFormat(2);
  };
  
  const hasTwoOrMoreDecimalPlaces = (num: any) => {
    return /^\d+(\.\d{1,2})?$/.test(num.toString());
  };
  
  export const formatTokenDispaly = (value: string) => {
    if (!value) {
      return 0;
    }
  
    if(value==='NaN'){
      value = "0"
    }
  
    // if (value.includes("e")) {
    //   return value;
    // }
  
    if (hasTwoOrMoreDecimalPlaces(value)) {
      return BigNumber(value).decimalPlaces(7).toFormat(2);
    }
    return BigNumber(value).decimalPlaces(7).toFormat();
  };
  
  export const formatAPY = (value = "0") => {
    if(value===''){
      value='0'
    }
    const rate = parseFloat(ethers.formatUnits(value?.toString()??'0', 27));
    if (rate < 0.0001) {
      return "<0.01%";
    }
    return `${(rate * 100).toFixed(2)}%`;
  };
  
  export const formatBigNumberToK = (value: string | number) => {
    const num = new BigNumber(value);
    if (num.isGreaterThanOrEqualTo(999)) {
      return `${num.dividedBy(1000).toFixed(2)}k`;
    } else {
      return num.toFormat(2);
    }
  };
  // Health factor计算公式：
  // 当前抵押资产totalCollateralBase * 清算阈值currentLiquidationThreshold / 当前借贷资产totalDebtBase
  
  export const calcHealth = ({
    userAccountData,
    supplyBalance,
    borrowBalance,
  }: {
    userAccountData: bigint[];
    supplyBalance?: string;
    borrowBalance?: string;
  }) => {
    const totalCollateralBase = supplyBalance ?? formatBigintToString(userAccountData[0], 8); // 当前抵押资产
    const currentLiquidationThreshold = formatBigintToString(userAccountData[3], 4); // 清算阈值
    const totalDebtBase = borrowBalance ?? formatBigintToString(userAccountData[1], 8); // 当前借贷资产
    console.log("userAccountData", userAccountData);
    console.log("supplyBalance", supplyBalance);
    console.log("totalCollateralBase", totalCollateralBase);
    console.log("currentLiquidationThreshold", currentLiquidationThreshold);
    console.log("totalDebtBase", totalDebtBase);
    console.log(
      "totalCollateralBase * currentLiquidationThreshold / totalDebtBase",
      BigNumber(totalCollateralBase)
        .multipliedBy(BigNumber(currentLiquidationThreshold))
        .dividedBy(BigNumber(totalDebtBase))
        .toFixed(2),
    );
  
    const data = BigNumber(totalCollateralBase)
      .multipliedBy(BigNumber(currentLiquidationThreshold))
      .dividedBy(BigNumber(totalDebtBase))
      .toFixed(2);
  
    return data === "NaN" ? "∞" : data;
  };
  
  export const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2) + "B"; // 十亿
    } else if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(2) + "M"; // 百万
    } else if (Math.abs(num) >= 1e3) {
      return (num / 1e3).toFixed(2) + "K"; // 千
    } else {
      return Number(num).toFixed(2); // 如果数字小于1000，直接返回该数字
    }
  };

  export const formatFloatToRate = (value = "0") => {
    if (value === "") {
        value = "0";
    }
    const rate = parseFloat(value);
    if (rate < 0.0001) {
        return "<0.01%";
    }
    return `${(rate * 100).toFixed(2)}%`;
};