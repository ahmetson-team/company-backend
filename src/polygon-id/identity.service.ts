import type { W3CCredential } from '@0xpolygonid/js-sdk';
import { CredentialStatusType, core } from '@0xpolygonid/js-sdk';
import { PolygonIdService } from './polygon-id.service';

export class IdentityServices {
  static instanceIS: {
    did: core.DID
    credential: W3CCredential
  };

  static async createIdentity(seed?: Uint8Array) {
    console.log(seed);

    if (!this.instanceIS) {
      const polygonService = PolygonIdService.getExtensionServiceInstance();

      const identity = await polygonService.wallet?.createIdentity({
        method: core.DidMethod.PolygonId,
        blockchain: core.Blockchain.Polygon,
        networkId: core.NetworkId.Mumbai,
        revocationOpts: {
          type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
          id: process.env.RHS_URL as string,
        },
        seed,
      });
      console.log('!!!!!!!!!!!!!!!!', identity);
      this.instanceIS = identity!;
      return this.instanceIS;
    } else {
      return this.instanceIS;
    }
  }

  static getIdentityInstance() {
    return this.instanceIS;
  }
}
