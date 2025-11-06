// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleAirdrop is ERC20 {
    // Errors
    error MerkleAirdrop__AlreadyClaimed();
    error MerkleAirdrop__InvalidProof();

    // State variables
    bytes32 public immutable i_merkleRoot;
    BitMaps.BitMap internal s_claimed;

    constructor(bytes32 merkleRoot) ERC20("Merkle Airdrop", "MAD") {
        i_merkleRoot = merkleRoot;
    }

    fallback() external {}

    function claim(
        bytes32[] calldata merkleProof,
        uint256 index,
        uint256 amount
    ) external {
        // Revert if tokens have already been claimed
        if (BitMaps.get(s_claimed, index)) {
            revert MerkleAirdrop__AlreadyClaimed();
        }

        // Verify Merkle proof
        _verifyMerkleProof(merkleProof, index, amount, msg.sender);

        // Set tokens as claimed
        BitMaps.setTo(s_claimed, index, true);

        // Mint tokens to the claimer
        _mint(msg.sender, amount);
    }

    function _verifyMerkleProof(
        bytes32[] memory merkleProof,
        uint256 index,
        uint256 amount,
        address account
    ) private view {
        // Since the `StandardMerkleTree` uses an opinionated double leaf hashing algorithm,
        // the contract must match that logic when reconstructing leaves to verify proofs.
        // see https://github.com/OpenZeppelin/merkle-tree?tab=readme-ov-file#leaf-hash
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(account, index, amount)))
        );

        if (!MerkleProof.verify(merkleProof, i_merkleRoot, leaf)) {
            revert MerkleAirdrop__InvalidProof();
        }
    }
}
