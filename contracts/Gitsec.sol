// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Gitsec is ERC721A, Ownable {

    constructor(string memory name, string memory symbol)
    ERC721A(name, symbol)
    {}

}
