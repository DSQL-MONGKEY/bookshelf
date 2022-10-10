const bookshelf = [];

// ? KEY WEB STORAGE
const BOOKSHELF_KEY = 'BOOKSHELF_STORAGE';

// ? Check for storage
function checkForStorage() {
    if(typeof(Storage) === undefined) {
        alert('Browser lau ga support WS cuy! gece update laa...');
        return false;
    } 
    return true;
}   

// ? CUSTOM EVENT
const BOOKSHELF_RENDER = new Event('bookshelf_render');

// ? CUSTOM EVENT FOR WEB STORAGE
const BOOKSHELF_SAVED_EVENT = new Event('saved_books');

document.addEventListener('DOMContentLoaded', () => {
    const formSubmit = document.getElementById('form-input-books')
    loadBookData()
    document.dispatchEvent(BOOKSHELF_RENDER)
    formSubmit.addEventListener('submit', (ev) => {
        ev.preventDefault();
        addBooks();
    });
})

// ? Function for making booksID
const generateBooksId = () => {
    return +new Date();
}

// ? Function callback -> object value
const generateBooksCollection = (booksID, booksTitle, booksWriter, booksDate, booksNote, isCompleted) => {
    return{
        booksID,
        booksTitle, 
        booksWriter,
        booksDate, 
        booksNote,
        isCompleted
    }
}

// ? save bookshelf into the localStorage
const saveBookshelf = () => {
    if(checkForStorage()) {
        // (localStorage.key(BOOKSHELF_KEY))
        const parsedBookshelf = JSON.stringify(bookshelf);
        localStorage.setItem(BOOKSHELF_KEY, parsedBookshelf);
    }
    document.dispatchEvent(BOOKSHELF_SAVED_EVENT);
}

// ? Function for adding new books
function addBooks() {
    const booksTitle = document.getElementById('judul-buku').value;
    const booksWriter = document.getElementById('penulis-buku').value;
    const booksDate = document.getElementById('tahun-buku').value;
    const booksNote = document.getElementById('note-buku').value;

    const booksID = generateBooksId();
    const booksCollection = generateBooksCollection(booksID, booksTitle, booksWriter, booksDate, booksNote, false);

    // saveBookshelf();
    bookshelf.push(booksCollection);
    saveBookshelf();
    document.dispatchEvent(BOOKSHELF_RENDER);
    
}

// ? Function for showing the books to the column
function createTheBookshelf(booksCollection) {
    const titleBooks = document.createElement('h2');
    titleBooks.innerText = `${booksCollection.booksTitle}`;
    titleBooks.classList.add(['titleBooks'],['font-bold'], ['text-2xl'], ['text-white'], ['my-2'], ['ml-2'], ['capitalize']);

    const writerBooks = document.createElement('p');
    writerBooks.innerText = `${booksCollection.booksWriter}`;
    writerBooks.classList.add(['writerBooks'], ['italic'], ['text-white'], ['mt-2'], ['capitalize'], ['font-semibold'])

    const noteBooks = document.createElement('p');
    noteBooks.innerText = `* ${booksCollection.booksNote} *`;
    noteBooks.classList.add(['noteBooks'], ['text-white'])

    const dateBooks = document.createElement('p');
    dateBooks.innerText = `${booksCollection.booksDate}`;
    dateBooks.classList.add(['dateBooks'], ['text-white'], ['ml-2'], ['mt-4'], ['font-mono'])


    // ? Container item books
    const booksContainer = document.createElement('div')
    booksContainer.classList.add(['flex'],['flex-col'],['mt-2'], ['p-2'], ['rounded-lg'], ['bg-zinc-400/[0.10]']);
    booksContainer.append(titleBooks, writerBooks, noteBooks, dateBooks)

    // ? Container inner
    const container = document.createElement('div');
    container.classList.add(['p-3']);
    container.append(booksContainer);
    container.setAttribute('id', booksCollection.booksID);

    // ? Check, undo, delete
    if(booksCollection.isCompleted) {
        // ? UNDO BUTTON
        const undoButton = document.createElement('button');
        undoButton.innerText = 'Undo';
        undoButton.classList.add('undo-button','bg-green-700'       , 'rounded-lg', 'p-2', 'mt-2', 'mr-1', 'text-white','text-lg');

        undoButton.addEventListener('click', () => {
            undoBook(booksCollection.booksID);
        });
        //? DELETE BUTTON
        const brokeButton = document.createElement('button');
        brokeButton.innerText = 'Delete';
        brokeButton.classList.add('broke-button', 'bg-rose-500', 'rounded-lg', 'text-white', 'p-2', 'mt-2', 'ml-1', 'text-lg');

        brokeButton.addEventListener('click', () => {
            brokeBook(booksCollection.booksID);
        });
        container.append(undoButton, brokeButton);
    } else {
        // ? CHECK BUTTON
        const checkButton = document.createElement('button');
        checkButton.innerText = 'Done!'
        checkButton.classList.add('check-button', 'bg-blue-600', 'rounded-lg', 'p-2', 'mt-2', 'font-semibold', 'text-white', 'text-lg', 'mr-1');

        checkButton.addEventListener('click', () => {
            addBookToReaded(booksCollection.booksID)
        });
        // ? BROKE BUTTON IN UNREADED
        const brokenButtonInUnread = document.createElement('button');
        brokenButtonInUnread.innerText = 'Delete';
        brokenButtonInUnread.classList.add('broken-in-unread', 'bg-rose-500', 'rounded-lg', 'text-lg', 'text-white', 'p-2', 'mt-2', 'ml-1');

        brokenButtonInUnread.addEventListener('click', () => {
            brokeBook(booksCollection.booksID);
        });
        container.append(checkButton, brokenButtonInUnread)
    }
    return container;
}

// ? Showing books in the bookshelf container
document.addEventListener('bookshelf_render', () => {
    const unCompletedBook = document.getElementById('unread-books');
    unCompletedBook.innerHTML = '';
    
    const completedBook = document.getElementById('read-books');
    completedBook.innerHTML = '';

    for(const bookItem of bookshelf) {
        const bookshelfElement = createTheBookshelf(bookItem);
        
        if(!bookItem.isCompleted) {
            unCompletedBook.append(bookshelfElement);
        } else {
            completedBook.append(bookshelfElement);
        }
    }

})

// ? Function to find book by id
const findBook = (bookId) => {
    for(const bookItem of bookshelf) {
        if(bookItem.booksID == bookId) {
            return bookItem;
        }
    }
    return null;
}

// ? Function for finding book index
const findBookIndex = (bookId) => {
    for(const index in bookshelf) {
        if(bookshelf[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

//? Function to completing books
const addBookToReaded = (bookId) => {
    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(BOOKSHELF_RENDER);

    saveBookshelf();
}

// ? Function to undo the books
const undoBook = (bookId) => {
    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(BOOKSHELF_RENDER)

    saveBookshelf();
}

// ? Function to remove the book
const brokeBook = (bookId) => {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === 1) return;
    
    bookshelf.splice(bookTarget, 1);
    document.dispatchEvent(BOOKSHELF_RENDER)
    
    saveBookshelf();
}

// ? Funtion for web storage
const loadBookData = () => {

    const bookparsed = localStorage.getItem(BOOKSHELF_KEY);
    let bookData = JSON.parse(bookparsed);
    console.log(bookData)
    if(bookData != null && bookData.length) {
        bookData.forEach((val)=>{
            bookshelf.push(val)
        })
    }
}
