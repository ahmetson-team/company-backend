import { PolygonIdService } from './polygon-id/polygon-id.service';
import { CircuitId, ZeroKnowledgeProofResponse } from '@0xpolygonid/js-sdk';

if (!PolygonIdService.instancePS)
  PolygonIdService.init();

export async function verify(data: ZeroKnowledgeProofResponse) {
  const { proofService } = PolygonIdService.getExtensionServiceInstance();

  if (!proofService)
    throw new Error('Proof service not defined');

  const result = await proofService.verifyProof(data, CircuitId.AtomicQuerySigV2);

  return result;
}
