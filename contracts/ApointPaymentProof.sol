// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ApointPaymentProof {
    event PaymentRecorded(
        string invoiceId,
        address indexed customerWallet,
        address indexed storeWallet,
        uint256 amount,
        uint256 points,
        uint256 timestamp
    );

    function recordPayment(
        string calldata invoiceId,
        address customerWallet,
        address storeWallet,
        uint256 amount,
        uint256 points
    ) external {
        emit PaymentRecorded(
            invoiceId,
            customerWallet,
            storeWallet,
            amount,
            points,
            block.timestamp
        );
    }
}
