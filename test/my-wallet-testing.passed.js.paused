const Wallet = artifacts.require("Wallet");
const Link = artifacts.require("Link");

contract("Wallet", (accounts) => {
  const owners = [accounts[0], accounts[1], accounts[2]];
  const NUM_CONFIRMATIONS_REQUIRED = 2;
  let wallet;
  let link;

  before(async () => {
    wallet = await Wallet.deployed();
    link = await Link.deployed();
  });

  console.log( "link artifact:", link );
  console.log( "1 ether:", (1*10)**18 );

  describe("user adds LINK token to his account", async () => {
    const ticker = "LINK";
    const bytes32Value = web3.utils.fromUtf8(ticker);
    let logTokenAdded;
    before("adds token", async () => {
      logTokenAdded = await wallet.addToken(bytes32Value, link.address);
      // console.log("token added:", logTokenAdded);
    });
    it("should pass if bytes32 value in tokenMapping.tokenAddress and link.address", async () => {
      const tickerTokenAddress = link.address;
      const mappedAddress = await wallet.tokenMapping(bytes32Value).then((res)=>{
        return Object(res.tokenAddress).toString();
      });
      console.log({
       "given ticker": ticker,
       "given ticker's bytes32 val": bytes32Value,
       "added ticker's mapped data": await wallet.tokenMapping(bytes32Value),
       "tokenAddress mapped to the given ticker": await mappedAddress,
       "ticker in tokenList's first (0) element": await wallet.tokenList(0),
      });

      assert.equal(mappedAddress, tickerTokenAddress);
    });
  });
});
