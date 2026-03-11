
import poolABI from './poolABI.json';
import faucetABI from './faucetABI.json';
import ProtocolOracleABI from './ProtocolOracleABI.json';
import PoolDataProviderABI from './PoolDataProviderABI.json';
import WrappedTokenGatewayV3ABI from './WrappedTokenGatewayV3ABI.json';
import LeverageABI from './LeverageABI.json';
export const supplyDisabledAssets:string[] = [];
export const borrowDisabledAssets:string[] = [];


const deployedContracts = {
    688689: {
        PoolProxy: {
            address: '0xEC86f142E7334d99EEEF2c43298413299D919B30',
            abi: poolABI,
        },
        Faucet: {
            address: '0x14c02bCf054aa16851dC0cDc50aD93c2CB5a5916',
            abi: faucetABI,
        },
        PoolDataProvider: {
            address: '0xC31b2963E500C25f0217e5d8C59B9085f7C87E78',
            abi: PoolDataProviderABI,
        },
        WrappedTokenGatewayV3: {
            address: '0x8D9cB56000b97E3CEA4A58A8A31B2e2553CB517B',
            abi: WrappedTokenGatewayV3ABI,
        },
        ProtocolOracle: {
            address: '0x0f324eCddb547D14C94A4410344108E9f9f6608e',
            abi: ProtocolOracleABI,
        },
        Leverage: {
            address: '0xdC5E3C98a6520C202313A56bca94adCf6C7665bc',
            abi: LeverageABI,
        }
    },
    56: {
        PoolProxy: {
            address: '0xc6EC0E8FCbCC566628ef5812aca7C6Db04b4d132',
            abi: poolABI,
        },
        PoolDataProvider: {
            address: '0xeFD74781D9C468FFE6a4d8CA7720E8EF0223744E',
            abi: PoolDataProviderABI,
        },
        WrappedTokenGatewayV3: {
            address: '0xf0D0e72F686Af4182286FE243beC500d1536B15A',
            abi: WrappedTokenGatewayV3ABI,
        },
        ProtocolOracle: {
            address: '0x2DafBd6A7386DBc39735C2EAE8cDA030D288f4Bc',
            abi: ProtocolOracleABI,
        }
    },
    97: {
        PoolProxy: {
            address: '0x41bF429765052861B6385a1319b9480E4f74c7EB', // Pool Proxy
            abi: poolABI,
        },
        PoolDataProvider: {
            address: '0x596DfCBCc0F5d77fc3D9d9e0dDd628BDD8b09a28', //PoolDataProvider
            abi: PoolDataProviderABI,
        },
        WrappedTokenGatewayV3: {
            address: '0xe3E8148bDeEf9Ca547Af815A195062FA4DFE6FCE', //WrappedTokenGatewayV3
            abi: WrappedTokenGatewayV3ABI,
        },
        ProtocolOracle: {
            address: '0x66b515Ad5688BD3d7Cb0EA6B4F98F1f8d8737B70',
            abi: ProtocolOracleABI,
        },
        Faucet: {
            address: '0x425dB539Ab7f5ED9968E62ac72ADdd0ebBDb76e4',
            abi: faucetABI,
        },
    },
    5003: {
        PoolProxy: {
            address: '0x2112d1E06284665f88e0Ef3a338D52AcA7EfCf26', // Pool Proxy
            abi: poolABI,
        },
        PoolDataProvider: {
            address: '0xe87e12CeEE3A931B754ca9e16EEE1f14d5E332C9', //PoolDataProvider
            abi: PoolDataProviderABI,
        },
        WrappedTokenGatewayV3: {
            address: '0x1302dd6EFd29b34c3a1DeF380872391944Ef838b', //WrappedTokenGatewayV3
            abi: WrappedTokenGatewayV3ABI,
        },
        ProtocolOracle: {
            address: '0x48Bff9Aa97b3D615cFd26cbA6733637CB82ba774',
            abi: ProtocolOracleABI,
        },
        Faucet: {
            address: '0x94aF9E1397F53A03c36E28c2375FeCf3eAF65eBA',
            abi: faucetABI,
        },
    },
} as const;

export default deployedContracts;
