import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MerkleAirdropClaim from './MerkleAirdropClaim.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MerkleAirdropClaim />
  </StrictMode>
);
