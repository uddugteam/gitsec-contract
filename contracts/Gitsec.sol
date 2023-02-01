// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Gitsec is ERC721A, Ownable {

    /*
     * Repository data struct
     * - `id`           repo and NFT ID
     * - `name`         repo name
     * - `description`  repo description, can be null
     * - `owner`        repo and NFT owner
     * - `IPFS`         repo IPFS hash
     */
    struct Repository {
        uint256 id;
        string name;
        string description;
        address owner;
        string IPFS;
    }

    // Mapping token and repo ID to repository data struct
    mapping(uint256 => Repository) private _repositories;

    // Mapping user address to repository ids
    mapping(address => uint256[]) private _userRepositories;

    // Triggered when repository created
    event RepositoryCreated(uint256 repId, string repName, address owner);

    // Triggered when IPFS hash is updated
    event IPFSHashUpdated(uint256 indexed repId, address indexed owner, string IPFS);

    constructor(string memory name, string memory symbol)
    ERC721A(name, symbol)
    {}

    /*
     * Allows to create repository. Mints NFT to caller and adds Repository data struct to `_repositories` mapping
     *
     * @param name - repository name
     * @param description - repository description
     * @return repository ID
     *
     * emits `RepositoryCreated` event
     * emits `Transfer` event {See IERC721A}
     */
    function createRepository(string memory name, string memory description) external returns(uint256) {
        uint256 tokenId = _nextTokenId();

        _safeMint(msg.sender, 1);
        _repositories[tokenId] = Repository(tokenId, name, description, msg.sender, "");
        _userRepositories[msg.sender].push(tokenId);

        emit RepositoryCreated(tokenId, name, msg.sender);

        return tokenId;
    }

    // Returns Repository data struct for given repo ID
    function getRepository(uint256 id) external view returns(Repository memory) {
        return _repositories[id];
    }

    // Returns user repositories array
    function getUserRepositories(address user) external view returns(Repository[] memory) {
        Repository[] memory userRepositories = new Repository[](_userRepositories[user].length);

        uint256 index = 0;

        for(uint256 i = 0; i < _nextTokenId(); i++) {
            if (_repositories[i].owner == user) {
                userRepositories[index] = _repositories[i];
                index++;
            }
        }

        return userRepositories;
    }

    // Returns all repositories array
    function getAllRepositories() external view returns(Repository[] memory) {
        Repository[] memory userRepositories = new Repository[](totalSupply());

        uint256 index = 0;

        for(uint256 i = 0; i < _nextTokenId(); i++) {
            if (_repositories[i].owner != address(0)) {
                userRepositories[index] = _repositories[i];
                index++;
            }
        }

        return userRepositories;
    }

    /*
     * Allows to set or update IPFS hash for given repo ID
     *
     * @param id - repository id
     * @param newIPFS - IPFS hash
     *
     * Requirements:
     * - repository should exist
     * - caller should be repo owner
     *
     * emits `IPFSHashUpdated` event
     */
    function updateIPFS(uint256 id, string memory newIPFS) external {
        require(_exists(id), "Gitsec: no repository found by given ID");
        require(ownerOf(id) == msg.sender, "Gitsec: caller is not the repository owner");

        _repositories[id].IPFS = newIPFS;

        emit IPFSHashUpdated(id, msg.sender, newIPFS);
    }

    /*
     * Allows to set or update description for given repo ID
     *
     * @param id - repository id
     * @param newDescription - new repository description
     *
     * Requirements:
     * - repository should exist
     * - caller should be repo owner
     */
    function updateDescription(uint256 id, string memory newDescription) external {
        require(_exists(id), "Gitsec: no repository found by given ID");
        require(ownerOf(id) == msg.sender, "Gitsec: caller is not the repository owner");

        _repositories[id].description = newDescription;
    }

    /*
     * Allows to delete repository. Deletes repository from `_repositories` mapping and burns NFT
     *
     * @param id - repository id
     *
     * Requirements:
     * - repository should exist
     * - caller should be repo owner
     *
     * emits `Transfer` event {See IERC721A}
     */
    function deleteRepository(uint256 id) external {
        require(_exists(id), "Gitsec: no repository found by given ID");
        require(ownerOf(id) == msg.sender, "Gitsec: caller is not the repository owner");

        _burn(id);
        delete _repositories[id];

        for (uint256 i = 0; i < _userRepositories[msg.sender].length; i++) {
            if (_userRepositories[msg.sender][i] == id) {
                _userRepositories[msg.sender][i] = _userRepositories[msg.sender][_userRepositories[msg.sender].length -1];
                _userRepositories[msg.sender].pop();
                break;
            }
        }
    }

}