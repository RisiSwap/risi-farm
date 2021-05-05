const { expectRevert } = require('@openzeppelin/test-helpers');
const { assert } = require("chai");

const RisiReferral = artifacts.require('RisiReferral');

contract('RisiReferral', ([alice, bob, carol, referrer, operator, owner]) => {
    beforeEach(async () => {
        this.risiReferral = await RisiReferral.new({ from: owner });
        this.zeroAddress = '0x0000000000000000000000000000000000000000';
    });

    it('should allow operator and only owner to update operator', async () => {
        assert.equal((await this.risiReferral.operators(operator)).valueOf(), false);
        await expectRevert(this.risiReferral.recordReferral(alice, referrer, { from: operator }), 'Operator: caller is not the operator');

        await expectRevert(this.risiReferral.updateOperator(operator, true, { from: carol }), 'Ownable: caller is not the owner');
        await this.risiReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.risiReferral.operators(operator)).valueOf(), true);

        await this.risiReferral.updateOperator(operator, false, { from: owner });
        assert.equal((await this.risiReferral.operators(operator)).valueOf(), false);
        await expectRevert(this.risiReferral.recordReferral(alice, referrer, { from: operator }), 'Operator: caller is not the operator');
    });

    it('record referral', async () => {
        assert.equal((await this.risiReferral.operators(operator)).valueOf(), false);
        await this.risiReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.risiReferral.operators(operator)).valueOf(), true);

        await this.risiReferral.recordReferral(this.zeroAddress, referrer, { from: operator });
        await this.risiReferral.recordReferral(alice, this.zeroAddress, { from: operator });
        await this.risiReferral.recordReferral(this.zeroAddress, this.zeroAddress, { from: operator });
        await this.risiReferral.recordReferral(alice, alice, { from: operator });
        assert.equal((await this.risiReferral.getReferrer(alice)).valueOf(), this.zeroAddress);
        assert.equal((await this.risiReferral.referralsCount(referrer)).valueOf(), '0');

        await this.risiReferral.recordReferral(alice, referrer, { from: operator });
        assert.equal((await this.risiReferral.getReferrer(alice)).valueOf(), referrer);
        assert.equal((await this.risiReferral.referralsCount(referrer)).valueOf(), '1');

        assert.equal((await this.risiReferral.referralsCount(bob)).valueOf(), '0');
        await this.risiReferral.recordReferral(alice, bob, { from: operator });
        assert.equal((await this.risiReferral.referralsCount(bob)).valueOf(), '0');
        assert.equal((await this.risiReferral.getReferrer(alice)).valueOf(), referrer);

        await this.risiReferral.recordReferral(carol, referrer, { from: operator });
        assert.equal((await this.risiReferral.getReferrer(carol)).valueOf(), referrer);
        assert.equal((await this.risiReferral.referralsCount(referrer)).valueOf(), '2');
    });

    it('record referral commission', async () => {
        assert.equal((await this.risiReferral.totalReferralCommissions(referrer)).valueOf(), '0');

        await expectRevert(this.risiReferral.recordReferralCommission(referrer, 1, { from: operator }), 'Operator: caller is not the operator');
        await this.risiReferral.updateOperator(operator, true, { from: owner });
        assert.equal((await this.risiReferral.operators(operator)).valueOf(), true);

        await this.risiReferral.recordReferralCommission(referrer, 1, { from: operator });
        assert.equal((await this.risiReferral.totalReferralCommissions(referrer)).valueOf(), '1');

        await this.risiReferral.recordReferralCommission(referrer, 0, { from: operator });
        assert.equal((await this.risiReferral.totalReferralCommissions(referrer)).valueOf(), '1');

        await this.risiReferral.recordReferralCommission(referrer, 111, { from: operator });
        assert.equal((await this.risiReferral.totalReferralCommissions(referrer)).valueOf(), '112');

        await this.risiReferral.recordReferralCommission(this.zeroAddress, 100, { from: operator });
        assert.equal((await this.risiReferral.totalReferralCommissions(this.zeroAddress)).valueOf(), '0');
    });
});
