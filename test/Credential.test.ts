import { ethers } from "hardhat";
import { expect } from "chai";

describe("AcademicCredential", () => {
  it("issues and revokes", async () => {
    // hardhat auto-creates 20 accounts for tests
    const [issuer, student] = await ethers.getSigners();

    // fresh contract for this test
    const Factory = await ethers.getContractFactory("AcademicCredential");
    const nft = await Factory.deploy(issuer.address);

    // ----- ISSUE -----
    await nft
      .connect(issuer)
      .issue(student.address, "ipfs://CID/meta.json");

    const id = 1n;                    // first minted = #1

    expect(await nft.ownerOf(id)).to.equal(student.address);
    expect(await nft.isValid(id)).to.be.true;

    // ----- REVOKE -----
    await nft.connect(issuer).revoke(id);
    expect(await nft.isValid(id)).to.be.false;
  });
});
