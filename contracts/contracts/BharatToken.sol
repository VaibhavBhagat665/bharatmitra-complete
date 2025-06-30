// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BharatToken
 * @dev ERC20 token with minting functionality restricted to owner
 */
contract BharatToken is ERC20, Ownable {
    uint8 private constant _decimals = 18;
    
    constructor(address initialOwner) ERC20("Bharat Token", "BRT") Ownable(initialOwner) {
        // Initial supply can be minted to the owner if needed
        // _mint(initialOwner, 1000000 * 10**decimals());
    }
    
    /**
     * @dev Mint tokens to a specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in wei units)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of addresses to mint tokens to
     * @param amounts Array of amounts to mint to each address
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) public onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
        }
    }
    
    /**
     * @dev Burns tokens from the caller's account
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Returns the number of decimals used to get its user representation
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
}