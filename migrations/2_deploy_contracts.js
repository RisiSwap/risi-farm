const MasterChef = artifacts.require("../contracts/MasterChef.sol");
const RisiToken = artifacts.require("../contracts/RisiToken.sol");

module.exports = async function(deployer) {
    //Deploy Risi Token
    await deployer.deploy(RisiToken)
    const risiToken = await RisiToken.deployed()

    //Deploy chef
    await deployer.deploy(MasterChef, risiToken.address, 0, 1)
};