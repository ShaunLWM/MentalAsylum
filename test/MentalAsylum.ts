import { BigNumber } from "@ethersproject/contracts/node_modules/@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signers";
import { expectRevert } from "@openzeppelin/test-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { MeatToken, MentalAsylum } from "../typechain-types";
import { setupFixtures } from "./setup";

const ERROR_NON_EXISTANT_TOKEN = "Non-existent token";
const ERROR_PRESALE_NOT_STARTED = "Presale not started";
const ERROR_PRESALE_USER_NO_VALUE = "No presale for user";
const ERROR_NOT_STARTED = "Not started";
const ERROR_MAX_MINT_PER_BATCH = "Max mint reached";
const ERROR_MAX_SUPPLY_HIT = "Max supply hit";
const ERROR_WRONG_MINT_PRICE = "Wrong mint price";

const TOTAL_NFT = 9999;
const MAX_MINT_PER_BATCH = 10;
const PER_NFT_PRICE = ethers.utils.parseEther("0.05");

const BASE_URI = "https://example.com/";

const jsonProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

describe("MentalAsylum", () => {
  let MentalAsylumContract: MentalAsylum;
  let MeatTokenContract: MeatToken;
  let deployer: SignerWithAddress; //owner
  let alice: SignerWithAddress; // normal user
  let bob: SignerWithAddress; // presale user

  before(async () => {
    ({
      accounts: { deployer, alice, bob },
      contracts: { MentalAsylumContract, MeatTokenContract },
    } = await setupFixtures());

    const setTokenAddress = await MentalAsylumContract.setMeatToken(MeatTokenContract.address);
    await setTokenAddress.wait();
  });

  it("should properly deploy MentalAsylum contract", async () => {
    expect(await MentalAsylumContract.symbol()).to.equal("ASY");
    expect(await MentalAsylumContract.name()).to.equal("MentalAsylum");
  });

  it("should list \"deployer\" as contract owner", async () => {
    expect(await MentalAsylumContract.owner()).to.equal(deployer.address);
  });

  it("should not allow users to mint if not started", async () => {
    expect(await MentalAsylumContract.started()).to.equal(false);
    await expectRevert(MentalAsylumContract.connect(alice).mint(BigNumber.from(1)), ERROR_NOT_STARTED);
    expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
  });

  it("should not allow users to premint if not started", async () => {
    expect(await MentalAsylumContract.presaleStarted()).to.equal(false);
    await expectRevert(MentalAsylumContract.connect(bob).premint(BigNumber.from(1)), ERROR_PRESALE_NOT_STARTED);
    expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
  });

  it("should not allow nonOwner to call setPresale method", async () => {
    await expectRevert(MentalAsylumContract.connect(alice).setPresale(bob.address, 10), "Ownable: caller is not the owner");
  });

  describe("Changing Settings", () => {
    it("should initially have empty baseURI", async () => {
      expect(await MentalAsylumContract.baseURI()).to.equal("");
    });

    it("should not allow nonOwner to set baseURI", async () => {
      expect(await MentalAsylumContract.baseURI()).to.equal("");
      await expectRevert(MentalAsylumContract.connect(bob).setBaseURI(BASE_URI), "Ownable: caller is not the owner");
      expect(await MentalAsylumContract.baseURI()).to.equal("");
    });

    it("should display error when nothing is minted yet", async() => {
      await expectRevert(MentalAsylumContract.tokenURI(1), ERROR_NON_EXISTANT_TOKEN);
    });

    it("should allow owner to change baseURI", async () => {
      expect(await MentalAsylumContract.baseURI()).to.equal("");
      const changeBaseUri = await MentalAsylumContract.connect(deployer).setBaseURI(BASE_URI);
      await changeBaseUri.wait();
      expect(await MentalAsylumContract.baseURI()).to.equal(BASE_URI);
    });
  });

  describe("Start NFT Presale", () => {
    before(async() => {
      const setBobPresale = await MentalAsylumContract.connect(deployer).setPresale(bob.address, 10);
      await setBobPresale.wait();
      const startPresale = await MentalAsylumContract.connect(deployer).setPresaleStart(true);
      await startPresale.wait();
    });

    it("should not allow Alice to premint", async () => {
        await expectRevert(
          MentalAsylumContract.connect(alice).premint(BigNumber.from(1), { value: PER_NFT_PRICE }),
          ERROR_PRESALE_USER_NO_VALUE
        );
        expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
    });

    it("should not allow Bob to premint more than 10", async () => {
      await expectRevert(MentalAsylumContract.connect(bob).premint(MAX_MINT_PER_BATCH + 1), ERROR_PRESALE_USER_NO_VALUE);
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
    });

    it("should not allow Bob to premint with wrong paid value", async () => {
      await expectRevert(MentalAsylumContract.connect(bob).premint(BigNumber.from(10)), ERROR_WRONG_MINT_PRICE);
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(0);
    });

    it("should allow Bob to premint properly", async () => {
      const currentPatients = await MentalAsylumContract.totalPatients();
      const ownerBalance = await jsonProvider.getBalance(deployer.address);
      await expect(MentalAsylumContract.connect(bob).premint(1, { value: PER_NFT_PRICE }))
        .to.emit(MentalAsylumContract, "MintPatient")
        .withArgs(bob.address, currentPatients.add(1), 1);
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(1);
      expect(await jsonProvider.getBalance(deployer.address)).to.eq(ownerBalance.add(PER_NFT_PRICE));
      expect(await MentalAsylumContract.presales(bob.address)).to.equal(9);
      expect(await MentalAsylumContract.totalPatients()).to.equal(1);
    });
  });

  describe("Start normal NFT sale", () => {
    before(async () => {
      const start = await MentalAsylumContract.connect(deployer).setStart(true);
      await start.wait();
    });

    it(`should not allow Alice to mint more than maxBatch = ${MAX_MINT_PER_BATCH}`, async () => {
      await expectRevert(MentalAsylumContract.connect(alice).mint(MAX_MINT_PER_BATCH + 1), ERROR_MAX_MINT_PER_BATCH);
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
    });

    it(`should prevent Alice from minting < price (${PER_NFT_PRICE.toString()} wei)`, async () => {
      await expectRevert(
        MentalAsylumContract.connect(alice).mint(BigNumber.from(1), { value: PER_NFT_PRICE.sub(1) }),
        ERROR_WRONG_MINT_PRICE
      );
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(0);
    });

    it("should allow Alice to mint 1 NFT", async () => {
      const currentPatients = await MentalAsylumContract.totalPatients();
      const ownerBalance = await jsonProvider.getBalance(deployer.address);
      await expect(MentalAsylumContract.connect(alice).mint(1, { value: PER_NFT_PRICE }))
        .to.emit(MentalAsylumContract, "MintPatient")
        .withArgs(alice.address, currentPatients.add(1), 1);
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(1);
      expect(await jsonProvider.getBalance(deployer.address)).to.eq(ownerBalance.add(PER_NFT_PRICE));
      // Bob has already deployed 1 above
      // TODO: Fix order of test?
      expect(await MentalAsylumContract.totalPatients()).to.equal(2);
    });

    it("should display tokenURI properly after minting", async () => {
      expect(await MentalAsylumContract.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
    });
  });

  describe("Misc", () => {
    it("should pass fallback function", async () => {
      const bobBalance = await jsonProvider.getBalance(bob.address);
      await bob.sendTransaction({ to: MentalAsylumContract.address, value: ethers.utils.parseEther("1") });
      expect(await jsonProvider.getBalance(bob.address)).to.lt(bobBalance); // lazy calculate gas etc
    });

    it("should pass receive function", async () => {
      const bobBalance = await jsonProvider.getBalance(bob.address);
      await bob.sendTransaction({ to: MentalAsylumContract.address, value: ethers.utils.parseEther("1"), data: "0x01"});
      expect(await jsonProvider.getBalance(bob.address)).to.lt(bobBalance); // lazy calculate gas etc
    });

    it("should allow transfer of NFT", async () => {
      // bob preminted first
      const aliceBalance = await MentalAsylumContract.balanceOf(alice.address);
      const bobBalance = await MentalAsylumContract.balanceOf(bob.address);
      expect(aliceBalance).to.gt(0);
      expect(bobBalance).to.gt(0);
      expect(await MentalAsylumContract.ownerOf(1)).to.eq(bob.address);
      await MentalAsylumContract.connect(bob).transferFrom(bob.address, alice.address, 1);
      expect(await MentalAsylumContract.balanceOf(alice.address)).to.equal(aliceBalance.add(1));
      expect(await MentalAsylumContract.balanceOf(bob.address)).to.equal(bobBalance.sub(1));
    })
  });
});
