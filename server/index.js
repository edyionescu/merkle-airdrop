import { config } from '@dotenvx/dotenvx';
config();

import express from 'express';
import cors from 'cors';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

const AIRDROP_ACCOUNTS = await import('./airdrop-accounts.json', {
  with: { type: 'json' },
}).then((module) => module.default);

const UNITS = 10 ** 18;
const values = AIRDROP_ACCOUNTS.map(({ address, index, amount }) => [address, index, amount * UNITS]);
const merkleTree = StandardMerkleTree.of(values, ['address', 'uint256', 'uint256']);

const app = express();
app.use(cors());

app.get('/claim', (req, res) => {
  const claimer = (req.query?.address ?? '').toLowerCase();
  const entry = AIRDROP_ACCOUNTS.find(({ address }) => address.toLowerCase() === claimer);

  if (!entry) {
    return res.json({ success: false });
  }

  for (const [i, v] of merkleTree.entries()) {
    const [account, index, amount] = v;

    if (account.toLowerCase() === claimer) {
      return res.json({
        success: true,
        index,
        amount,
        units: UNITS,
        symbol: 'MAD',
        merkleProof: merkleTree.getProof(i),
      });
    }
  }

  return res.json({ success: false });
});

const { PORT } = process.env;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
