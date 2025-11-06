// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {MerkleAirdrop} from "src/MerkleAirdrop.sol";

contract MerkleAirdropTest is Test {
    MerkleAirdrop private token;

    uint256 private amount;
    uint256 private index;
    address private account;
    bytes32[] private merkleProof;

    function setUp() public {
        address deployer = makeAddr("deployer");
        vm.prank(deployer);

        bytes32 merkleRoot = 0x61dac2143c983f86fa7548fe90a9f3171103d517db78defd1e73b101b347f2c4;
        token = new MerkleAirdrop(merkleRoot);

        uint256 units = 10 ** 18;
        amount = 20 * units;
        index = 1;
        account = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

        merkleProof.push(
            0xa99a3195d5b6f164757830cbe019aaccd5c847eb2d22ffa48252b949b9ea6262
        );
        merkleProof.push(
            0x9a0018616aac3eac34f04f2b2706e6fe11a9376ffc4a8bad4df950f3e175b97b
        );
        merkleProof.push(
            0xb057d9b71faa5dffd5f3e9bccecbefbed72bbb174ce794f69188c7e02694cba5
        );
    }

    function test_MerkleAirdrop_claims_tokens() public {
        assert(token.balanceOf(account) == 0);

        vm.prank(account);
        token.claim(merkleProof, index, amount);

        assert(token.balanceOf(account) == amount);
    }

    function test_MerkleAirdrop_reverts_if_already_claimed() public {
        vm.prank(account);
        token.claim(merkleProof, index, amount);

        vm.expectRevert(MerkleAirdrop.MerkleAirdrop__AlreadyClaimed.selector);
        token.claim(merkleProof, index, amount);
    }

    function test_MerkleAirdrop_reverts_on_invalid_proof() public {
        vm.prank(account);
        index = 0; // send the wrong index

        vm.expectRevert(MerkleAirdrop.MerkleAirdrop__InvalidProof.selector);
        token.claim(merkleProof, index, amount);
    }
}
