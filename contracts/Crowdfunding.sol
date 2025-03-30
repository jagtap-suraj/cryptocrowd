// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Crowdfunding {
    string public name;
    string public description;
    string public imageHash; // IPFS hash for campaign image
    uint256 public goal;
    uint256 public deadline;
    address public owner;
    bool public paused;

    enum CampaignState { Active, Successful, Failed }
    CampaignState public state;

    struct Tier {
        string name;
        string imageHash; // IPFS hash for tier image
        uint256 amount;
        uint256 backers;
        string benefits;
    }

    struct Backer {
        uint256 totalContribution;
        uint256[] fundedTiers;
    }

    Tier[] public tiers;
    mapping(address => Backer) public backers;

    event Funded(address indexed backer, uint256 amount, uint256 tierIndex);
    event TierAdded(string name, uint256 amount);
    event TierRemoved(uint256 index);
    event Withdrawn(uint256 amount);
    event Refunded(address indexed backer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier campaignActive() {
        require(state == CampaignState.Active, "Campaign not active");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract paused");
        _;
    }
    
    constructor(
        address _owner,
        string memory _name,
        string memory _description,
        string memory _imageHash,
        uint256 _goal,
        uint256 _durationInDays
    ) {
        name = _name;
        description = _description;
        imageHash = _imageHash;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        owner = _owner;
        state = CampaignState.Active;
    }

    function checkCampaignState() public {
        if (state == CampaignState.Active) {
            if (block.timestamp >= deadline) {
                state = address(this).balance >= goal 
                    ? CampaignState.Successful 
                    : CampaignState.Failed;
            } else if (address(this).balance >= goal) {
                state = CampaignState.Successful;
            }
        }
    }

    function fund(uint256 _tierIndex) external payable campaignActive notPaused {
        require(_tierIndex < tiers.length, "Invalid tier");
        require(msg.value == tiers[_tierIndex].amount, "Incorrect amount");

        tiers[_tierIndex].backers++;
        backers[msg.sender].totalContribution += msg.value;
        backers[msg.sender].fundedTiers.push(_tierIndex);

        checkCampaignState();
        emit Funded(msg.sender, msg.value, _tierIndex);
    }

    function addTier(
        string memory _name,
        string memory _imageHash,
        uint256 _amount,
        string memory _benefits
    ) external onlyOwner campaignActive {
        require(_amount > 0, "Amount must be > 0");
        tiers.push(Tier(_name, _imageHash, _amount, 0, _benefits));
        emit TierAdded(_name, _amount);
    }

    function removeTier(uint256 _index) external onlyOwner campaignActive {
        require(_index < tiers.length, "Invalid index");
        tiers[_index] = tiers[tiers.length - 1];
        tiers.pop();
        emit TierRemoved(_index);
    }

    function withdraw() external onlyOwner {
        checkCampaignState();
        require(state == CampaignState.Successful, "Not successful");
        
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");

        payable(owner).transfer(balance);
        emit Withdrawn(balance);
    }

    function refund() external {
        checkCampaignState();
        require(state == CampaignState.Failed, "Not failed");
        
        uint256 amount = backers[msg.sender].totalContribution;
        require(amount > 0, "No contribution");

        backers[msg.sender].totalContribution = 0;
        payable(msg.sender).transfer(amount);
        emit Refunded(msg.sender, amount);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getTiers() external view returns (Tier[] memory) {
        return tiers;
    }

    function getBackerTiers(address _backer) external view returns (uint256[] memory) {
        return backers[_backer].fundedTiers;
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    function extendDeadline(uint256 _additionalDays) external onlyOwner campaignActive {
        deadline += _additionalDays * 1 days;
    }
}