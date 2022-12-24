const truffleAssert = require("truffle-assertions");
const Wallet = artifacts.require("Wallet");
const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const Ether = artifacts.require("Ether");

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
      return (a.amount) - (b.amount);
    });
    sellOrders.sort((a, b) => {
      return (b.amount) - (a.amount);
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

    createLimitOrder(accounts[9], orderSide.BUY, tickerETH, "0.064", "2000");
    createLimitOrder(accounts[5], orderSide.BUY, tickerETH, "0.018", "2000");
    createLimitOrder(accounts[3], orderSide.BUY, tickerETH, "0.042", "2000");
    createLimitOrder(accounts[6], orderSide.BUY, tickerETH, "0.012", "2000");
    createLimitOrder(accounts[8], orderSide.BUY, tickerETH, "0.088", "2000");
  });

  it("should pass while the user must have ETH deposited such that deposited eth >= buy order value", async () => {
    msgSender = accounts[0];

    await eth.approve(dex.address, twei("1"));
    await dex.addToken(tickerETH, eth.address, { from: msgSender });
    await dex.deposit(twei("0.088"), tickerETH);
    let balance = await dex.balances(msgSender, tickerETH);

    console.table(buyOrders);
    console.log( getLimit(buyOrders) + " " + typeof getLimit(buyOrders) );
    console.log( typeof Number(getLimit(buyOrders)) + ", " + Number(getLimit(buyOrders)) );
    console.log( web3.utils.BN(getLimit(buyOrders)) );
    console.log( web3.utils.BN(balance).toNumber() );

    await truffleAssert.passes(
      assert.isAtLeast(
        web3.utils.BN(balance).toNumber(),
        // web3.utils.toWei(balance).toNumber(),
        // balance.toNumber(),
        // web3.utils.BN(buyOrders[0].amount).toNumber()
        // web3.utils.toWei(buyOrders[0].amount).toNumber()
        // parseFloat(getLimit(buyOrders))
        // Number(web3.utils.toWei(getLimit(buyOrders)))
        // getLimit(buyOrders)
        getLimit(buyOrders).toNumber()
      )
    );
  });

  // it("should pass while the user must have enough tokens deposited such that token balance >= sell order amount", async () => {
  //   //
  // });
  // it("should pass while the buy order book should be ordered on price from highest to lowest starting at index 0", async () => {
  //   //
  // });
});
