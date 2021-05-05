const MasterChef = artifacts.require("../contracts/MasterChef.sol");
const RisiReferral = artifacts.require("../contracts/RisiReferral.sol");
const RisiToken = artifacts.require("../contracts/RisiToken.sol");

module.exports = async function(deployer) {
    //Deploy Risi Token
    await deployer.deploy(RisiToken)
    const risiToken = await RisiToken.deployed()

    //Deploy referall contract
    await deployer.deploy(RisiReferral)

    //Deploy chef
    await deployer.deploy(MasterChef, risiToken.address, 0, 1)
};