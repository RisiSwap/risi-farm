const { expectRevert } = require("@openzeppelin/test-helpers");
const { assert } = require("chai");

const RisiToken = artifacts.require('RisiToken');

contract('RisiToken', ([alice, bob, carol, operator, owner]) => {
    beforeEach(async () => {
        this.risi = await RisiToken.new({ from: owner });
        this.burnAddress = '0x000000000000000000000000000000000000dEaD';
        this.zeroAddress = '0x0000000000000000000000000000000000000000';
    });

    it('only operator', async () => {
        assert.equal((await this.risi.owner()), owner);
        assert.equal((await this.risi.operator()), owner);

        await expectRevert(this.risi.updateTransferTaxRate(500, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.updateBurnRate(20, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.updateMaxTransferAmountRate(100, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.updateSwapAndLiquifyEnabled(true, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.setExcludedFromAntiWhale(operator, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.updateRisiSwapRouter(operator, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.updateMinAmountToLiquify(100, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.transferOperator(alice, { from: operator }), 'operator: caller is not the operator');
    });

    it('transfer operator', async () => {
        await expectRevert(this.risi.transferOperator(operator, { from: operator }), 'operator: caller is not the operator');
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await expectRevert(this.risi.transferOperator(this.zeroAddress, { from: operator }), 'RISI::transferOperator: new operator is the zero address');
    });

    it('update transfer tax rate', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        assert.equal((await this.risi.transferTaxRate()).toString(), '500');
        assert.equal((await this.risi.burnRate()).toString(), '20');

        await this.risi.updateTransferTaxRate(0, { from: operator });
        assert.equal((await this.risi.transferTaxRate()).toString(), '0');
        await this.risi.updateTransferTaxRate(1000, { from: operator });
        assert.equal((await this.risi.transferTaxRate()).toString(), '1000');
        await expectRevert(this.risi.updateTransferTaxRate(1001, { from: operator }), 'RISI::updateTransferTaxRate: Transfer tax rate must not exceed the maximum rate.');

        await this.risi.updateBurnRate(0, { from: operator });
        assert.equal((await this.risi.burnRate()).toString(), '0');
        await this.risi.updateBurnRate(100, { from: operator });
        assert.equal((await this.risi.burnRate()).toString(), '100');
        await expectRevert(this.risi.updateBurnRate(101, { from: operator }), 'RISI::updateBurnRate: Burn rate must not exceed the maximum rate.');
    });

    it('transfer', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await this.risi.mint(alice, 10000000, { from: owner }); // max transfer amount 25,000
        assert.equal((await this.risi.balanceOf(alice)).toString(), '10000000');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');

        await this.risi.transfer(bob, 12345, { from: alice });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9987655');
        assert.equal((await this.risi.balanceOf(bob)).toString(), '11728');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '123');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '494');

        await this.risi.approve(carol, 22345, { from: alice });
        await this.risi.transferFrom(alice, carol, 22345, { from: carol });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9965310');
        assert.equal((await this.risi.balanceOf(carol)).toString(), '21228');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '346');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '1388');
    });

    it('transfer small amount', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await this.risi.mint(alice, 10000000, { from: owner });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '10000000');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');

        await this.risi.transfer(bob, 19, { from: alice });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9999981');
        assert.equal((await this.risi.balanceOf(bob)).toString(), '19');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');
    });

    it('transfer without transfer tax', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        assert.equal((await this.risi.transferTaxRate()).toString(), '500');
        assert.equal((await this.risi.burnRate()).toString(), '20');

        await this.risi.updateTransferTaxRate(0, { from: operator });
        assert.equal((await this.risi.transferTaxRate()).toString(), '0');

        await this.risi.mint(alice, 10000000, { from: owner });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '10000000');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');

        await this.risi.transfer(bob, 10000, { from: alice });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9990000');
        assert.equal((await this.risi.balanceOf(bob)).toString(), '10000');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');
    });

    it('transfer without burn', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        assert.equal((await this.risi.transferTaxRate()).toString(), '500');
        assert.equal((await this.risi.burnRate()).toString(), '20');

        await this.risi.updateBurnRate(0, { from: operator });
        assert.equal((await this.risi.burnRate()).toString(), '0');

        await this.risi.mint(alice, 10000000, { from: owner });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '10000000');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');

        await this.risi.transfer(bob, 1234, { from: alice });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9998766');
        assert.equal((await this.risi.balanceOf(bob)).toString(), '1173');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '61');
    });

    it('transfer all burn', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        assert.equal((await this.risi.transferTaxRate()).toString(), '500');
        assert.equal((await this.risi.burnRate()).toString(), '20');

        await this.risi.updateBurnRate(100, { from: operator });
        assert.equal((await this.risi.burnRate()).toString(), '100');

        await this.risi.mint(alice, 10000000, { from: owner });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '10000000');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '0');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');

        await this.risi.transfer(bob, 1234, { from: alice });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9998766');
        assert.equal((await this.risi.balanceOf(bob)).toString(), '1173');
        assert.equal((await this.risi.balanceOf(this.burnAddress)).toString(), '61');
        assert.equal((await this.risi.balanceOf(this.risi.address)).toString(), '0');
    });

    it('max transfer amount', async () => {
        assert.equal((await this.risi.maxTransferAmountRate()).toString(), '50');
        assert.equal((await this.risi.maxTransferAmount()).toString(), '0');

        await this.risi.mint(alice, 1000000, { from: owner });
        assert.equal((await this.risi.maxTransferAmount()).toString(), '5000');

        await this.risi.mint(alice, 1000, { from: owner });
        assert.equal((await this.risi.maxTransferAmount()).toString(), '5005');

        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await this.risi.updateMaxTransferAmountRate(100, { from: operator }); // 1%
        assert.equal((await this.risi.maxTransferAmount()).toString(), '10010');
    });

    it('anti whale', async () => {
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        assert.equal((await this.risi.isExcludedFromAntiWhale(operator)), false);
        await this.risi.setExcludedFromAntiWhale(operator, true, { from: operator });
        assert.equal((await this.risi.isExcludedFromAntiWhale(operator)), true);

        await this.risi.mint(alice, 10000, { from: owner });
        await this.risi.mint(bob, 10000, { from: owner });
        await this.risi.mint(carol, 10000, { from: owner });
        await this.risi.mint(operator, 10000, { from: owner });
        await this.risi.mint(owner, 10000, { from: owner });

        // total supply: 50,000, max transfer amount: 250
        assert.equal((await this.risi.maxTransferAmount()).toString(), '250');
        await expectRevert(this.risi.transfer(bob, 251, { from: alice }), 'RISI::antiWhale: Transfer amount exceeds the maxTransferAmount');
        await this.risi.approve(carol, 251, { from: alice });
        await expectRevert(this.risi.transferFrom(alice, carol, 251, { from: carol }), 'RISI::antiWhale: Transfer amount exceeds the maxTransferAmount');

        //
        await this.risi.transfer(bob, 250, { from: alice });
        await this.risi.transferFrom(alice, carol, 250, { from: carol });

        await this.risi.transfer(this.burnAddress, 251, { from: alice });
        await this.risi.transfer(operator, 251, { from: alice });
        await this.risi.transfer(owner, 251, { from: alice });
        await this.risi.transfer(this.risi.address, 251, { from: alice });

        await this.risi.transfer(alice, 251, { from: operator });
        await this.risi.transfer(alice, 251, { from: owner });
        await this.risi.transfer(owner, 251, { from: operator });
    });

    it('update SwapAndLiquifyEnabled', async () => {
        await expectRevert(this.risi.updateSwapAndLiquifyEnabled(true, { from: operator }), 'operator: caller is not the operator');
        assert.equal((await this.risi.swapAndLiquifyEnabled()), false);

        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await this.risi.updateSwapAndLiquifyEnabled(true, { from: operator });
        assert.equal((await this.risi.swapAndLiquifyEnabled()), true);
    });

    it('update min amount to liquify', async () => {
        await expectRevert(this.risi.updateMinAmountToLiquify(100, { from: operator }), 'operator: caller is not the operator');
        assert.equal((await this.risi.minAmountToLiquify()).toString(), '500000000000000000000');

        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await this.risi.updateMinAmountToLiquify(100, { from: operator });
        assert.equal((await this.risi.minAmountToLiquify()).toString(), '100');
    });
});
