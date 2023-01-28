// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Gitsec is ERC721A, Ownable {

    // Repository data struct with repo ID (equal to token ID), repo name, repo owner (equal to token owner) and repo IPFS
    // IPFS can be null
    struct Repository {
        uint256 id;
        string name;
        address owner;
        string IPFS;
    }

    // Mapping token and repo ID to repository data struct
    mapping(uint256 => Repository) private _repositories;

    // Triggered when repository created
    event RepositoryCreated(uint256 repId, string repName, address owner);

    constructor(string memory name, string memory symbol)
    ERC721A(name, symbol)
    {}

    /*
     * Allows to create repository. Mints NFT to caller and adds Repository data struct to `_repositories` mapping
     *
     * @param name - repository name
     * @return repository ID
     *
     * emits `RepositoryCreated` event
     * emits `Transfer` event {See IERC721A}
     */
    function createRepository(string memory name) external returns(uint256) {
        uint256 tokenId = _nextTokenId();

        _safeMint(msg.sender, 1);
        _repositories[tokenId] = Repository(tokenId, name, msg.sender, "");

        emit RepositoryCreated(tokenId, name, msg.sender);

        return tokenId;
    }

    // Returns Repository data struct for given repo ID
    function getRepository(uint256 id) external view returns(Repository memory) {
        return _repositories[id];
    }

}