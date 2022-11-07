import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";
const { devChain } = "../../helper-hardhat-config";


devChain.includes(network.name) 
? describe.skip
: describe("FundMe", async () => {
    let fundMe: any;
    let deployer: any;
    let mockV3Aggregator: any;
    const sendValue = ethers.utils.parseEther("1");
    beforeEach(async () => {

        // const accounts = await ethers.getSigners();
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    })

    describe("constructor", async () => {
        it("sets the aggregator addresses correctly", async () => {
            const res = await fundMe.getPriceFeed();
            assert.equal(res, mockV3Aggregator.address);
        })
    });

    describe("fund", async () => {
        it("Fails if not enough ETH is being sent", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
        })
        
        it("updated the amount funded data structure", async () => {
            await fundMe.fund({value: sendValue});
            const res = await fundMe.getAddressToAmountFunded(deployer);
            assert.equal(res.toString(), sendValue.toString());
        })

        it("Adds funder to array of funders", async () => {
            await fundMe.fund({value: sendValue});
            const funder = await fundMe.getFunder(0);
            assert.equal(funder,deployer);
        })

        it("withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({value: sendValue});
            })
            it("withdraw ETH from a single funder", async () => {
                //Arrange
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const StartingDeployerBalance = await fundMe.provider.getBalance(deployer);
                //Act
                const transactionRes = await fundMe.withdraw();
                const transactionReceipt = await transactionRes.wait(1);

                const {gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

                //gasCost


                //Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(StartingDeployerBalance).toString(), 
                    endingDeployerBalance.add(gasCost).toString()
                );
            })

            it("allows us to withdraw with multiple funders", async () => {
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({value: sendValue});
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const StartingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Act
                const transactionRes = await fundMe.withdraw();
                const transactionReceipt = await transactionRes.wait(1);

                const {gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);


                // Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(StartingDeployerBalance).toString(), 
                    endingDeployerBalance.add(gasCost).toString()
                );

                // Make sure that funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted;

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
                }
            });

            it("Only allows the owner to withdraw", async () => {
                const accounts = ethers.getSigners();
                const attacker = accounts[1];
                const attackerConnectedContract = await fundMe.connect(attacker);
                await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FunMe__NotOwner");
            })

            it("allows us to withdraw with multiple funders - using cheaperWithdraw instead", async () => {
                const accounts = await ethers.getSigners();
                for (let i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    await fundMeConnectedContract.fund({value: sendValue});
                }
                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const StartingDeployerBalance = await fundMe.provider.getBalance(deployer);

                // Act
                const transactionRes = await fundMe.cheaperWithdraw();
                const transactionReceipt = await transactionRes.wait(1);

                const {gasUsed, effectiveGasPrice } = transactionReceipt;
                const gasCost = gasUsed.mul(effectiveGasPrice);
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer);


                // Assert
                assert.equal(endingFundMeBalance, 0);
                assert.equal(
                    startingFundMeBalance.add(StartingDeployerBalance).toString(), 
                    endingDeployerBalance.add(gasCost).toString()
                );

                // Make sure that funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted;

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
                }
            });
        })

    });


});