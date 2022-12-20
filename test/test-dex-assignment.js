const truffleAssert = require("truffle-assertions");
const Wallet = artifacts.require("Wallet");
const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Ether = artifacts.require("Ether");

contract("Dex", (accounts) => {
  let wallet, dex, eth, link;
  let buyOrders = [];
  let sellOrders = [];
  let orders = [];

  const orderSide = {
    BUY: "buy",
    SELL: "sell",
  };

  function createLimitOrder(
    msgSender,
    orderType,
    symbol,
    orderAmount,
    pairPrice
  ) {
    const newOrder = {
      id: orders.length,
      trader: msgSender,
      buyOrder: orderType, //orderSide.BUY/SELL
      ticker: symbol, // :bytes32
      amount: orderAmount, //
      price: pairPrice,
    };
    // orders.push(newOrder);
    // add limit order
    if (newOrder.buyOrder === "buy") {
      buyOrders.push(newOrder);
    } else {
      sellOrders.push(newOrder);
    }
    /**
     * maybe instead of sorting JS way, better to find a way to insert
     * the order in the right place in the array
     */
    buyOrders.sort((a, b) => {
      return parseFloat(a.amount) - parseFloat(b.amount);
    });
    sellOrders.sort((a, b) => {
      return parseFloat(b.amount) - parseFloat(a.amount);
    });
  }

  before(async () => {
    wallet = await Wallet.deployed();
    link = await Link.deployed();
    dex = await Dex.deployed();
    eth = await Ether.deployed();
  });

  // buyOrders.sort();
  // sellOrders.sort().reverse();

  it("should pass while the user must have ETH deposited such that deposited eth >= buy order value", async () => {
    let msgSender = accounts[0];
    let tickerETH = web3.utils.fromUtf8("ETH");

    await eth.approve(dex.address, 100);
    await dex.addToken(tickerETH, eth.address, { from: msgSender });
    await dex.deposit(10, tickerETH);

    createLimitOrder(msgSender, orderSide.BUY, tickerETH, 10, "2000");
    let balance = await dex.balances(msgSender, tickerETH);

    // await truffleAssert.passes(assert.isAtLeast(5, 3));
    await truffleAssert.passes(
      assert.isAtLeast(
        // web3.utils.BN(balance).toNumber(),
        balance.toNumber(),
        // web3.utils.BN(buyOrders[0].amount).toNumber()
        buyOrders[0].amount
      )
    );
  });

  // it("should pass while the user must have enough tokens deposited such that token balance >= sell order amount", async()=>{
  //
  // });
  // it("should pass while the buy order book should be ordered on price from highest to lowest starting at index 0", async()=>{
  //
  // });
});
