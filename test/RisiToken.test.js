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

        await expectRevert(this.risi.updateMinAmountToLiquify(100, { from: operator }), 'operator: caller is not the operator');
        await expectRevert(this.risi.transferOperator(alice, { from: operator }), 'operator: caller is not the operator');
    });

    it('transfer operator', async () => {
        await expectRevert(this.risi.transferOperator(operator, { from: operator }), 'operator: caller is not the operator');
        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await expectRevert(this.risi.transferOperator(this.zeroAddress, { from: operator }), 'RISI::transferOperator: new operator is the zero address');
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
        assert.equal((await this.risi.balanceOf(bob)).toString(), '12345');

        await this.risi.approve(carol, 22345, { from: alice });
        await this.risi.transferFrom(alice, carol, 22345, { from: carol });
        assert.equal((await this.risi.balanceOf(alice)).toString(), '9965310');
        assert.equal((await this.risi.balanceOf(carol)).toString(), '22345');
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

    it('update min amount to liquify', async () => {
        await expectRevert(this.risi.updateMinAmountToLiquify(100, { from: operator }), 'operator: caller is not the operator');
        assert.equal((await this.risi.minAmountToLiquify()).toString(), '500000000000000000000');

        await this.risi.transferOperator(operator, { from: owner });
        assert.equal((await this.risi.operator()), operator);

        await this.risi.updateMinAmountToLiquify(100, { from: operator });
        assert.equal((await this.risi.minAmountToLiquify()).toString(), '100');
    });
});
