import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import MerkleAirdropContractABI from '../../contracts/abis/MerkleAirdrop.abi?raw';
import './MerkleAirdropClaim.css';

const { VITE_SERVER_URL, VITE_AIRDROP_CONTRACT_ADDRESS } = import.meta.env;

import type { ClaimData, State } from '@merkle-airdrop/schema';

export default function MerkleAirdropClaim() {
  const [state, setState] = useState<State>({
    status: '',
    loading: false,
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      setState({ status: '❌ No web3 provider detected.', loading: false });
      return null;
    }

    setState({ status: 'Connecting wallet...', loading: true });

    try {
      const [account] = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      return account;
    } catch (error) {
      if (error instanceof Error) {
        setState({ status: `❌ ${error.message}`, loading: false });
      }
      return null;
    }
  };

  const fetchClaimData = async (account: string) => {
    setState({ status: 'Fetching claim data...', loading: true });

    try {
      const res = await fetch(`${VITE_SERVER_URL}/claim?address=${account}`);
      const data: ClaimData = await res.json();

      if (!data.success) {
        setState({ status: '❌ Not eligible for airdrop.', loading: false });
        return null;
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        setState({ status: `❌ ${error.message}`, loading: false });
      }
      return null;
    }
  };

  const sendClaimTransaction = async (claimData: ClaimData) => {
    if (!window.ethereum) return;

    setState({ status: 'Sending transaction...', loading: true });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      VITE_AIRDROP_CONTRACT_ADDRESS,
      JSON.parse(MerkleAirdropContractABI),
      signer
    );

    const { merkleProof, index, amount, units, symbol } = claimData;

    try {
      const transaction = await contract.claim(merkleProof, index, String(amount));
      await transaction.wait();

      setState({
        status: `✅ ${amount / units} ${symbol} tokens successfully claimed.`,
        loading: false,
      });
    } catch (error) {
      let status = '❌ An unknown error occurred.';

      if (typeof error === 'object' && error !== null) {
        if ('reason' in error && error.reason === 'rejected') {
          status = '❌ User denied transaction signature.';
        }

        if ('data' in error && error.data) {
          let customErrorName;
          const customErrorSelector = error.data.toString() ?? '';
          if (customErrorSelector) {
            customErrorName = contract.interface.parseError(customErrorSelector)?.name;
          }

          if (customErrorName === 'MerkleAirdrop__AlreadyClaimed') {
            status = `❌ ${amount / units} ${symbol} tokens already claimed.`;
          } else if (customErrorName === 'MerkleAirdrop__InvalidProof') {
            status = '❌ Invalid Merkle proof.';
          }
        }
      }

      setState({ status, loading: false });
    }
  };

  const claimTokens = useCallback(async () => {
    const account = await connectWallet();
    if (!account) return;

    const claimData = await fetchClaimData(account);
    if (!claimData) return;

    await sendClaimTransaction(claimData);
  }, []);

  return (
    <div className="container">
      <h2>Merkle Airdrop</h2>
      <button className="button" onClick={claimTokens} disabled={state.loading}>
        {state.loading ? 'Processing...' : 'Claim Tokens'}
      </button>
      <p className="status">{state.status}</p>
    </div>
  );
}
