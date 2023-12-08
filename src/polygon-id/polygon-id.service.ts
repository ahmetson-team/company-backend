import { proving } from '@iden3/js-jwz';
import {
  AuthHandler,
  CircuitId,
  DataPrepareHandlerFunc,
  EthStateStorage,
  EthConnectionConfig,
  PackageManager,
  PlainPacker,
  ProofService,
  VerificationHandlerFunc,
  ZKPPacker,
} from '@0xpolygonid/js-sdk';
import type {
  CircuitData,
  CredentialWallet,
  FSCircuitStorage,
  IDataStorage,
  IdentityWallet,
  VerificationParams,
  core,
} from '@0xpolygonid/js-sdk';
import { CircuitStorageInstance } from './circuit-storage.service';
import { WalletService } from './wallet.service';

export class PolygonIdService {
  static instancePS: PolygonIdService;

  packageMgr: PackageManager | undefined = undefined;

  wallet: IdentityWallet | undefined = undefined;

  credWallet: CredentialWallet | undefined = undefined;

  proofService: ProofService | undefined = undefined;

  dataStorage: IDataStorage | undefined = undefined;

  authHandler: AuthHandler | undefined = undefined;

  circuitStorage: FSCircuitStorage | undefined = undefined;

  static async init() {

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

    await CircuitStorageInstance.init();
    const accountInfo = await WalletService.createWallet();
    const { wallet, credWallet, dataStorage } = accountInfo;

    const circuitStorage = CircuitStorageInstance.getCircuitStorageInstance();

    const proofService = new ProofService(wallet, credWallet, circuitStorage, new EthStateStorage(defaultEthConnectionConfig[0] as EthConnectionConfig), { ipfsGatewayURL: 'https://ipfs.io' });

    const packageMgr = await PolygonIdService.getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService),
    );

    const authHandler = new AuthHandler(packageMgr, proofService);

    if (!this.instancePS) {
      this.instancePS = {
        packageMgr,
        proofService,
        credWallet,
        wallet,
        dataStorage,
        authHandler,
        circuitStorage,
      };
    }
    return this.instancePS;
  }

  static async getPackageMgr(circuitData: CircuitData, prepareFn: (hash: Uint8Array, did: core.DID, circuitId: CircuitId) => Promise<Uint8Array>, stateVerificationFn: (circuitId: string, pubSignals: string[]) => Promise<boolean>) {
    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);
    const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
    const mapKey = proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();
    const verificationParamMap = new Map([
      [
        mapKey,
        {
          key: circuitData.verificationKey,
          verificationFn,
        } as VerificationParams,
      ],
    ]);

    const provingParamMap = new Map();
    provingParamMap.set(mapKey, {
      dataPreparer: authInputsHandler,
      provingKey: circuitData.provingKey,
      wasm: circuitData.wasm,
    });

    const mgr = new PackageManager();
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    const plainPacker = new PlainPacker();
    mgr.registerPackers([packer, plainPacker]);

    return mgr;
  }

  static getExtensionServiceInstance() {
    return this.instancePS;
  }
}
