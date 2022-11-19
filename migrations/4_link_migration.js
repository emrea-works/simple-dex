const Link = artifacts.require("Link");
const Wallet = artifacts.require("Wallet");
/**
 * This migration code needed to be updated according to
 * the test mechanism in the lecture,
 * which required that the tokens must be deployed in advance.
 */

/**
 * params: 1: deployer, 2: network, 3: accounts
 * accounts needs to be invoked in order to be able to use inside the scope
 * of the exported function
 */
module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Link);
  let wallet = await Wallet.deployed();
  let link = await Link.deployed();
  await link.approve(wallet.address, 500);
  await wallet.addToken(web3.utils.fromUtf8("LINK"), link.address);
  await wallet.deposit(100, web3.utils.fromUtf8("LINK"));
  // balances is the name of the mapping in wallet contract
  let balanceOfLink = await wallet.balances(accounts[0], web3.utils.fromUtf8("LINK"));
  console.log("Balance of Link:" + web3.utils.BN(balanceOfLink).toString());
};
