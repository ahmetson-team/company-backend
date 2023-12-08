import { AgentResolver, BjjProvider, CredentialStatusResolverRegistry, EthConnectionConfig, CredentialStatusType, CredentialStorage, CredentialWallet, EthStateStorage, type IDataStorage, IdentityStorage, IdentityWallet, IndexedDBDataSource, IssuerResolver, KMS, KmsKeyType, MerkleTreeIndexedDBStorage, OnChainResolver, RHSResolver, InMemoryPrivateKeyStore, InMemoryDataSource, W3CCredential, Identity, Profile, InMemoryMerkleTreeStorage } from '@0xpolygonid/js-sdk';

export class WalletService {
  static async createWallet() {

    const defaultEthConnectionConfig = [{
      url: process.env.POLYGON_RPC_URL,
      defaultGasLimit: 600000,
      minGasPrice: '0',
      maxGasPrice: '100000000000',
      confirmationBlockCount: 5,
      confirmationTimeout: 600000,
      contractAddress: '0x134b1be34911e39a8397ec6289782989729807a4',
      receiptTimeout: 600000,
      rpcResponseTimeout: 5000,
      waitReceiptCycleTime: 30000,
      waitBlockCycleTime: 3000,
      chainId: 80001,
    }];

    const keyStore = new InMemoryPrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    const dataStorage: IDataStorage = {
      credential: new CredentialStorage(
        new InMemoryDataSource<W3CCredential>(),
      ),
      identity: new IdentityStorage(
        new InMemoryDataSource<Identity>(),
        new InMemoryDataSource<Profile>(),
      ),
      mt: new InMemoryMerkleTreeStorage(40),
      states: new EthStateStorage(defaultEthConnectionConfig[0] as EthConnectionConfig),
    };

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.SparseMerkleTreeProof,
      new IssuerResolver(),
    );
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states),
    );
    resolvers.register(
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      new OnChainResolver(defaultEthConnectionConfig as EthConnectionConfig[]),
    );
    resolvers.register(
      CredentialStatusType.Iden3commRevocationStatusV1,
      new AgentResolver(),
    );

    const credWallet = new CredentialWallet(dataStorage, resolvers);
    const wallet = new IdentityWallet(kms, dataStorage, credWallet);

    return {
      wallet,
      credWallet,
      kms,
      dataStorage,
    };
  }
}
