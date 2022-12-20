const Ether = artifacts.require("Ether");
const Wallet = artifacts.require("Wallet");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Ether);
  let wallet = await Wallet.deployed();
  let eth = await Ether.deployed();

  console.log("eth.address: ");
  console.log(eth.address);

  await eth.approve(wallet.address, 1000);
  await wallet.addToken(web3.utils.fromUtf8("ETH"), eth.address);
  await wallet.deposit(100, web3.utils.fromUtf8("ETH"));
  // balances is the name of the mapping in wallet contract
  let balanceOfEth = await wallet.balances(
    accounts[0],
    web3.utils.fromUtf8("ETH")
  );
  console.log("Balance of Ether:" + web3.utils.BN(balanceOfEth).toString());
};
