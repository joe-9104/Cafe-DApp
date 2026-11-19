// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract BookRental {
    address public owner;
    struct Book {
        uint id;
        string title;
        bool isRented;
    }
    Book[] public books;

    constructor() {
        owner = msg.sender;
    }

    event BookAdded(uint bookId, string title);
    event BookRented(uint bookId, address renter);
    event BookReturned(uint bookId, address renter);

    modifier onlyOwner() {
    require(msg.sender == owner, "Acces refuse");
    _;
    }

    function addBook(string memory _title) public onlyOwner {
     books.push(Book(books.length, _title, false));
     emit BookAdded(books.length - 1, _title);
    }

    mapping(uint => address) public rentedBy;
    uint public rentFee = 1 ether;
    function rentBook(uint _bookId) public payable {
        require(msg.value == rentFee, "Montant incorrect");
        require(_bookId < books.length, "Livre inexistant");
        require(!books[_bookId].isRented, "Deja loue");
        books[_bookId].isRented = true;
        rentedBy[_bookId] = msg.sender;
        emit BookRented(_bookId, msg.sender);
        }

    function returnBook(uint _bookId) public {
        require(rentedBy[_bookId] == msg.sender, "Vous n'avez pas loue ce livre");
        books[_bookId].isRented = false;
        rentedBy[_bookId] = address(0);
        emit BookReturned(_bookId, msg.sender);
    }


}