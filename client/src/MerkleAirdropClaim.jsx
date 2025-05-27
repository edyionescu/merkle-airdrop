import { useState } from 'react';
import { ethers } from 'ethers';
import './MerkleAirdropClaim.css';
import MerkleAirdropContractABI from '../../contracts/abis/MerkleAirdrop.abi?raw';

const { VITE_SERVER_URL, VITE_AIRDROP_CONTRACT_ADDRESS } = import.meta.env;

export default function AirdropClaim() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const claimTokens = async () => {
    if (!window.ethereum) {
      setStatus('❌ No web3 provider detected.');
      return;
    }

    setStatus('Connecting wallet...');
    setLoading(true);

    let account;
    try {
      [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      setStatus(`❌ ${error.message}`);
      setLoading(false);
      return;
    }

    setStatus('Fetching claim data...');
    const res = await fetch(`${VITE_SERVER_URL}/claim?address=${account}`);
    const data = await res.json();

    if (!data.success) {
      setStatus('❌ Not eligible for airdrop.');
      setLoading(false);
      return;
    }

    const { merkleProof, index, amount, units, symbol } = data;

    setStatus('Sending transaction...');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      VITE_AIRDROP_CONTRACT_ADDRESS,
      JSON.parse(MerkleAirdropContractABI),
      signer
    );

    try {
      const transaction = await contract.claim(merkleProof, index, String(amount));
      await transaction.wait();

      setStatus(`✅ ${amount / units} ${symbol} tokens successfully claimed.`);
    } catch (error) {
      if (error?.reason === 'rejected') {
        setStatus('❌ User denied transaction signature.');
        return;
      }

      let customErrorName;
      const customErrorSelector = error.data ?? '';
      if (customErrorSelector) {
        customErrorName = contract.interface.parseError(customErrorSelector)?.name;
      }

      if (customErrorName === 'MerkleAirdrop__AlreadyClaimed') {
        setStatus(`❌ ${amount / units} ${symbol} tokens already claimed.`);
      } else if (customErrorName === 'MerkleAirdrop__InvalidProof') {
        setStatus('❌ Invalid Merkle proof.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Merkle Airdrop</h2>
      <button className="button" onClick={claimTokens} disabled={loading}>
        {loading ? 'Processing...' : 'Claim Tokens'}
      </button>
      <p className="status">{status}</p>
    </div>
  );
}
