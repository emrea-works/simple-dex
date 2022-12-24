const Wallet = artifacts.require("Wallet");
const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Ether = artifacts.require("Ether");
const assert = require("chai").assert;
const truffleAssert = require("truffle-assertions");

contract("Dex", (accounts) => {
  let wallet, dex, eth, link, msgSender;
  let orders = [];
  let buyOrders = [];
  let sellOrders = [];
  // utils
  let twei = (v) => {
    return web3.utils.toWei(v);
  };
  let tickerETH = web3.utils.fromUtf8("ETH");
  let tickerLINK = web3.utils.fromUtf8("LINK");

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
      amount: orderAmount,
      price: pairPrice,
    };
    // orders.push(newOrder);
    // add limit order
    if (newOrder.buyOrder === "buy") {
      buyOrders.push(newOrder);
    } else {
      sellOrders.push(newOrder);
    }
    orders.push(newOrder);
    /**
     * maybe instead of sorting JS way, better to find a way to insert
     * the order in the right place in the array
     */
    buyOrders.sort((a, b) => {
      return a.amount - b.amount;
    });
    sellOrders.sort((a, b) => {
      return b.amount - a.amount;
    });

    return newOrder;
  }

  function getLimit(ordersType) {
    let limit = 0;
    ordersType.forEach((order) => {
      // if (web3.utils.toWei(order.amount) > limit) {
      if (order.amount > limit) {
        limit = order.amount;
      }
    });
    return limit;
  }

  before(async () => {
    wallet = await Wallet.deployed();
    link = await Link.deployed();
    dex = await Dex.deployed();
    eth = await Ether.deployed();
  });

  it("should pass while the user must have ETH deposited such that deposited eth >= buy order value", async () => {
    // Define
    msgSender = accounts[0];
    buyOrders = [];
    // Apply
    createLimitOrder(accounts[9], orderSide.BUY, tickerETH, 64, "2000");
    createLimitOrder(accounts[5], orderSide.BUY, tickerETH, 18, "2000");
    createLimitOrder(accounts[3], orderSide.BUY, tickerETH, 42, "2000");
    createLimitOrder(accounts[6], orderSide.BUY, tickerETH, 12, "2000");
    createLimitOrder(accounts[8], orderSide.BUY, tickerETH, 88, "2000");

    await eth.approve(dex.address, 100);
    await dex.addToken(tickerETH, eth.address, { from: msgSender });
    await dex.deposit(90, tickerETH);
    let balance = await dex.balances(msgSender, tickerETH);
    // Report
    console.table(buyOrders);
    console.log(" ");
    console.log(`Dex Balance  : ${web3.utils.BN(balance).toNumber()}`);
    console.log(
      `Highest limit: ${web3.utils.BN(getLimit(buyOrders)).toNumber()}`
    );
    // Assert
    await truffleAssert.passes(
      assert.isAtLeast(
        web3.utils.BN(balance).toNumber(),
        web3.utils.BN(getLimit(buyOrders)).toNumber(),
        "⛔ Dex WASN'T topped enough by the user for the limit amount"
      )
    );
  });

  it("should pass while the user must have enough tokens deposited such that token balance >= sell order amount", async () => {
    // Define
    msgSender = accounts[0];
    buyOrders = [];
    console.log(`buyOrders: ${buyOrders}`);
    // Apply
    createLimitOrder(accounts[5], orderSide.BUY, tickerLINK, 22, "150");
    createLimitOrder(accounts[3], orderSide.BUY, tickerLINK, 36, "150");
    createLimitOrder(accounts[6], orderSide.BUY, tickerLINK, 10, "150");

    await link.approve(dex.address, 100);
    await dex.addToken(tickerLINK, link.address, { from: msgSender });
    await dex.deposit(50, tickerLINK);
    let balance = await dex.balances(msgSender, tickerLINK);
    // Report
    console.table(buyOrders);
    console.log(" ");
    console.log(`Dex Balance  : ${web3.utils.BN(balance).toNumber()}`);
    console.log(
      `Highest limit: ${web3.utils.BN(getLimit(buyOrders)).toNumber()}`
    );
    // Assert
    await truffleAssert.passes(
      assert.isAtLeast(
        web3.utils.BN(balance).toNumber(),
        web3.utils.BN(getLimit(buyOrders)).toNumber(),
        "⛔ Dex WASN'T topped enough LINK by the user for the limit amount"
      )
    );
  });

  it("should pass while the buy order book should be ordered on price from highest to lowest starting at index 0", async () => {

  });
});
