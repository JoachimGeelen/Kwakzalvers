const Color = {
    WHITE: 'white',
    GREEN: 'green',
    BLUE: 'blue',
    RED: 'red',
    YELLOW: 'yellow',
    ORANGE: 'orange',
    BLACK: 'black',
    PURPLE: 'purple',
};
const ColorById = new Map();
ColorById.set(0, Color.WHITE);
ColorById.set(1, Color.GREEN);
ColorById.set(2, Color.BLUE);
ColorById.set(3, Color.RED);
ColorById.set(4, Color.YELLOW);
ColorById.set(5, Color.ORANGE);
ColorById.set(6, Color.BLACK);
ColorById.set(7, Color.PURPLE);

const valuesByColorId = new Map();
ColorById.forEach((color, colorId) => {
    if (color === Color.WHITE) {
        values = [1, 2, 3];
    } else if ([Color.GREEN, Color.BLUE, Color.RED, Color.YELLOW].includes(color)) {
        values = [1, 2, 4];
    } else {
        values = [1];
    }
    valuesByColorId.set(colorId, values);
});



class Ingredient {
    constructor(color, value) {
        this.color = color;
        this.value = value;
    }
}

function getIngredientId(colorId, value) {
    return colorId*10 + value;
}

function createAllIngredients() {
    const ingredients = new Map()
    ColorById.forEach((color, colorId) => {
        const values = valuesByColorId.get(colorId);
        values.forEach(value => {
            const ingredient = new Ingredient(colorId, value);
            let id = getIngredientId(colorId, value);
            ingredients.set(id, ingredient);
        });
    });
    return ingredients;
}



class Player {
    constructor() {
        this.inventory = {};  // Stores the total number of each ingredient owned
        this.bag = {};  // Tracks current ingredients in the bag
        this.board = []; // Stores all picked ingredients
    }

    purchase(id, quantity = 1) {
        if (!this.inventory[id]) {
            this.inventory[id] = 0;
        }
        this.inventory[id] += quantity;
        this.resetBag();
    }

    sell(id) {
        if (this.inventory[id] > 0) {
            this.inventory[id] -= 1;
            if (this.inventory[id] === 0) {
                delete this.inventory[id];  // Remove key if count reaches 0
            }
            this.resetBag();
            return;
        }
        throw new Error("Attempting to sell an ingredient tha tis not owned!")
    }

    resetBoard() {
        this.board = [];
    }

    resetBag() {
        this.bag = { ...this.inventory };  // Reset bag to match owned ingredients
    }

    drawRandomIngredientId(bag) {
        const rawIngredientList = []
        Object.keys(bag).forEach(id => {
            const count = bag[id];
            for (let i=0; i<count; i++) {
                rawIngredientList.push(id);
            }
        })
        const randomIndex = Math.floor(Math.random() * rawIngredientList.length);
        const randomIngredientId = rawIngredientList[randomIndex];
        bag[randomIngredientId]--;
        return randomIngredientId;
    }

    drawMultipleRandomIngredientIds(count) {
        const tempBag = structuredClone(this.bag);
        const selectedIngredientIds = [];
        for (let i=0; i<count; i++) {
            const ingredientId = this.drawRandomIngredientId(tempBag);
            selectedIngredientIds.push(ingredientId);
        }
        return selectedIngredientIds;
    }

    removeIngredientFromBag(bag, ingredientId) {
        bag[ingredientId]--;
    }

    placeIngredientOnBoard(ingredientId) {
        this.board.push(ingredientId);
    }

    playSingleAction() {
        const randomIngredientId = this.drawRandomIngredientId(this.bag);
        this.placeIngredientOnBoard(randomIngredientId);
        return randomIngredientId;
    }
    removeFromBoard(boardId) {
        if (this.board.length === 0) return;
        if (boardId < 0) throw new Error("bad board ID");
        const selectedIngredientId = this.board[boardId];
        this.board.splice(boardId, 1);
        this.bag[selectedIngredientId]++;
    }

    undoPlay() {
        if (this.board.length === 0) return;
        const lastIngredientId = this.board.pop();
        this.bag[lastIngredientId]++;
    }
    show() {
        console.log("Bag: ", this.bag);
        console.log("board: ", this.board)
        // console.log("Owned Ingredients: ", this.ownedIngredients);
    }
}


function undoLastSelect() {
    // console.log(player.board)
    player.undoPlay();
    // console.log(player.board)
    updateUI();
}

function removeFromBoardWrapper(boardId) {
    if (confirm(`Remove ${ingredientIdToText(player.board[boardId])}?`)) {
        player.removeFromBoard(boardId);
        updateUI();
    }
}



// Game logic (Player, Ingredient, Color) stays the same as before


// Create player instance

function ingredientIdToText(ingredientId) {
    const ingredient = allIngredients.get(parseInt(ingredientId));
    // return `${ColorById.get(ingredient.color)} [${ingredient.value}]`;
    return `${ColorById.get(ingredient.color)}-${ingredient.value}`;
}


// Function to handle color selection for purchasing and show corresponding values
function generateColorButtons() {
    const colorButtonsDiv = document.getElementById('color-buttons');
    colorButtonsDiv.innerHTML = '';
    ColorById.forEach((color, colorId) => {
        const colorButton = document.createElement('button');
        colorButton.textContent = color;
        colorButton.onclick = () => showValueButtons(colorId);
        colorButton.classList.add(color, "colorButton");

        colorButtonsDiv.appendChild(colorButton);
    });
}
function showValueButtons(colorId) {
    const valueButtonsDiv = document.getElementById('value-buttons');
    valueButtonsDiv.innerHTML = '';
    valuesByColorId.get(colorId).forEach(value => {
        const valueButton = document.createElement('button');
        valueButton.textContent = value;
        valueButton.onclick = () => buyIngredient(getIngredientId(colorId, value));
        valueButton.classList.add(ColorById.get(colorId), "colorButton");
        valueButtonsDiv.appendChild(valueButton);
    });
}


// Function to buy an ingredient
function buyIngredient(ingredientId) {
    player.purchase(ingredientId);
    updateUI();  // Update the UI after purchase
}

// Function to remove an ingredient
function sellIngredient(ingredientId) {
    if (confirm(`Sell ${ingredientIdToText(ingredientId)}?`)) {
        player.resetBag();

        if (navigator.vibrate) {
            navigator.vibrate(50);  // Vibrate for 200ms
        }
        player.sell(ingredientId);  // Calls the remove method in the Player class
        updateUI();  // Update the UI after removal
    }
}

// Function to pick a random ingredient
function pickIngredient() {
    try {
        const ingredientId = player.drawRandomIngredientId(player.bag);
        player.placeIngredientOnBoard(ingredientId)
        // const ingredientId = player.playSingleAction()
        alert(ingredientIdToText(ingredientId));
        // const pickedId = player.pick();
        // alert(ingredientIdToText(pickedId));

    } catch (e) {
        alert(e.message);
    }
    updateUI();
}




function mydrawMultipleIngredients() {
    let size = 0;
    for (const ingredient in player.bag) {
        size += player.bag[ingredient];
    }

    message = "Bag size: " + size
    const answer = prompt(message, "1");
    if (!answer) return;
    const count = parseInt(answer);
    if (isNaN(count) || count < 0 || count > size) {
        alert("Invalid choice");
        return;
    }
    console.log(count)
    if (count === 0) return;

    const randomIngredientIds = player.drawMultipleRandomIngredientIds(count);
    const selectedIngredientId = promptUserToSelectIngredientId(randomIngredientIds);
    if (!selectedIngredientId) return;
    player.removeIngredientFromBag(player.bag, selectedIngredientId);
    player.placeIngredientOnBoard(selectedIngredientId);

    alert(ingredientIdToText(selectedIngredientId));
    updateUI();
}
function promptUserToSelectIngredientId(ingredientIds) {
    console.log(ingredientIds)
    let message = "You drew the following ingredients:\n";
    for (let i=0;i<ingredientIds.length;i++) {
        message += `${i+1}) ${ingredientIdToText(ingredientIds[i])}\n`;
    }
    // ingredientIds.forEach(id => {
    //     message += `${ingredientIdToText(id)}\n`;
    // });
    // message += "\nEnter the number of the ingredient you'd like to keep, or 0 to return all.";

    const answer = prompt(message, "0");
    if (!answer) choice = 0;
    else choice = parseInt(answer);
    
    if (isNaN(choice) || choice < 0 || choice > ingredientIds.length) {
        alert("Invalid choice");
        // Ask again with same selection
        promptUserToSelectIngredientId(ingredientIds);
    }
    if (choice === 0) {
        console.log(choice)
        // alert("Nothing picked");
        return;
    }
    return ingredientIds[choice-1];
}


// Function to reset the bag (put all owned ingredients back into the bag)
function resetBag() {
    if (confirm("Are you sure you want to reset the bag? All picked ingredients will be returned.")) {
        player.resetBoard();  // Reset the bag by putting all owned ingredients back
        player.resetBag();
        updateUI();  // Update the UI after resetting

        if (navigator.vibrate) {
            navigator.vibrate(100);  // Vibrate for 200ms
        }
    }
}

// Function to update the UI
function updateUI() {
    insertBoardIngredientList(); //same as below but different due to difference between board and bag/inventory
    insertIngredientList(document.getElementById('bag-ingredients'), player.bag);
    insertIngredientList(document.getElementById('owned-ingredients'), player.inventory);
    
}
function insertBoardIngredientList() {
    const boardDiv = document.getElementById('board-ingredients');
    boardDiv.innerHTML = '';
    player.board.forEach((ingredientId, boardId) => {
        const ingredientDiv = buildIngredientDiv(ingredientId);
        ingredientDiv.addEventListener('click', function (event) {
            removeFromBoardWrapper(boardId);
        });
        boardDiv.append(ingredientDiv);
    });
}

function insertIngredientList(div, ingredientList) {
    div.innerHTML = '';
    Object.keys(ingredientList).forEach(ingredientId => {for (let i=0; i<ingredientList[ingredientId]; i++) {
        const ingredientDiv = buildIngredientDiv(ingredientId);
        div.append(ingredientDiv);
    }});
}

function buildIngredientDiv(ingredientId) {
    const ingredientDiv = document.createElement("div");
    const ingredient = allIngredients.get(parseInt(ingredientId))

    const img = getImage(ingredientId);
    ingredientDiv.append(img);

    // ingredientDiv.innerHTML = ingredient.value;
    const color = ColorById.get(ingredient.color);
    // ingredientDiv.classList.add(color, "ingredient");
    ingredientDiv.classList.add("ingredient");
    return ingredientDiv;
}

function getImage(ingredientId) {
    const img = document.createElement("img");
    const ingredient = allIngredients.get(parseInt(ingredientId));
    const imagePath = `images/tokens/128x128/${ColorById.get(ingredient.color)}-${ingredient.value}.png`;
    img.src = imagePath;
    return img;
}


function startingPosition() {
    player.purchase(1, 4)
    player.purchase(2, 2)
    player.purchase(3, 1)
    player.purchase(11)
    player.purchase(51)
}




const player = new Player();
const allIngredients = createAllIngredients();

// UI STUFF
// Get references to the divs
const cauldronDiv = document.getElementById('Cauldron');
const storeDiv = document.getElementById('Store');

// Get references to the navigation links
const viewCookingLink = document.getElementById('view-cauldron');
const viewStoreLink = document.getElementById('view-store');

// Add event listeners to toggle visibility
viewCookingLink.addEventListener('click', function(event) {
    event.preventDefault();
    cauldronDiv.style.display = 'block';
    storeDiv.style.display = 'none';
});

viewStoreLink.addEventListener('click', function(event) {
    event.preventDefault();
    cauldronDiv.style.display = 'none';
    storeDiv.style.display = 'block';
});
generateColorButtons();





startingPosition()
updateUI();  // Initial call to display empty states