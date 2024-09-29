const Color = {
    WHITE: 'white',
    GREEN: 'green',
    BLUE: 'blue',
    RED: 'red',
    YELLOW: 'yellow',
    ORANGE: 'orange',
    BLACK: 'black',
    PURPLE: 'purple',
    OLIVE: 'olive',
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
ColorById.set(8, Color.OLIVE);

const valuesByColorId = new Map();
ColorById.forEach((color, colorId) => {
    if (color === Color.WHITE) {
        values = [1, 2, 3];
    } else if ([Color.GREEN, Color.BLUE, Color.RED, Color.YELLOW].includes(color)) {
        values = [1, 2, 4];
    } else if (color === Color.OLIVE) {
        values = [0];
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
        this.peaLimit = 7;
    }

    purchase(id, quantity = 1) {
        if (!this.inventory[id]) {
            this.inventory[id] = 0;
        }
        this.inventory[id] += quantity;
        if (!this.bag[id]) {
            this.bag[id] = 0;
        }
        this.bag[id] += quantity;
        // this.resetBag();
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

    isEmpty(ingredientList) {
        let empty = true;
        Object.values(ingredientList).forEach(ingredientCount => {
            if (ingredientCount > 0) {
                empty = false;
            }
        });
        return empty;
    }

    drawRandomIngredientId(bag) {
        if (this.isEmpty(bag)) return -1;
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

    drawSpecificIngredient(ingredientId) {
        if (this.isEmpty(this.bag)) return -1;
        this.bag[ingredientId]--;
        return ingredientId;
        // this.bag[ingredientId]--;
        // this.placeIngredientOnBoard(ingredientId);
    }

    drawMultipleRandomIngredientIds(count) {
        const tempBag = structuredClone(this.bag);
        const selectedIngredientIds = [];
        for (let i=0; i<count; i++) {
            const ingredientId = this.drawRandomIngredientId(tempBag);
            if (ingredientId === -1) return;
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

    // playSingleAction() {
    //     const randomIngredientId = this.drawRandomIngredientId(this.bag);
    //     this.placeIngredientOnBoard(randomIngredientId);
    //     return randomIngredientId;
    // }
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
    getBagPeaCount() {
        let bagPeaCount = 0;
        Object.keys(this.bag).forEach(id => {
            const ingredient = allIngredients.get(parseInt(id));
            if (ColorById.get(ingredient.color) == Color.WHITE) {
                bagPeaCount += ingredient.value * this.bag[id];
            }
        });
        return bagPeaCount;
    }
    getBoardPeaCount() {
        let boardPeaCount = 0;
        this.board.forEach(id => {
            const ingredient = allIngredients.get(parseInt(id));
            if (ColorById.get(ingredient.color) == Color.WHITE) {
                boardPeaCount += ingredient.value;
            }
        });
        return boardPeaCount;
    }
    getBagIngredientCount() {
        let bagCount = 0;
        Object.keys(this.bag).forEach(id => {
            bagCount += this.bag[id];
        });
        return bagCount;
    }
    getInventoryIngredientCount() {
        let inventoryCount = 0;
        Object.keys(this.inventory).forEach(id => {
            inventoryCount += this.inventory[id];
        });
        return inventoryCount;
    }
    getKnalChance() {
        const bagPeaCount = this.getBagPeaCount();
        const boardPeaCount = this.getBoardPeaCount();
        const getBagIngredientCount = this.getBagIngredientCount();
        const peaBudget = this.peaLimit - boardPeaCount;
        // console.log("limit: ", this.peaLimit, "\tboardPeas: ", boardPeaCount, "\tpeaBudget: ", peaBudget)

        if (peaBudget < 0) return 1.00;

        // number of draws that lead to blowage
        let blowCount = 0;
        Object.keys(this.bag).forEach(id => {
            const ingredient = allIngredients.get(parseInt(id));
            for (let i=0; i<this.bag[id]; i++) {
                if (ColorById.get(ingredient.color) == Color.WHITE) {
                    if (ingredient.value > peaBudget) {
                        blowCount++;
                    }
                }
            }
        });

        const blowChance = blowCount / parseFloat(getBagIngredientCount);
        const blowChance_string = `${(blowChance * 100).toFixed(2)}%`
        return blowChance;
    }
    getAverageDrawValue() {
        const bagIngredientCount = this.getBagIngredientCount();

        // add total of all bag-ingredient-values
        let totalBagIngredientValue = 0;
        Object.keys(this.bag).forEach(id => {
            const ingredient = allIngredients.get(parseInt(id));
            for (let i=0; i<this.bag[id]; i++) {
                totalBagIngredientValue += ingredient.value;
            }
        });
        const getAverageDrawValue = totalBagIngredientValue / parseFloat(bagIngredientCount);
        return getAverageDrawValue;
    }
    getTotalBoardValue() {
        let totalBoardValue = 0;
        this.board.forEach(id => {
            const ingredient = allIngredients.get(parseInt(id));
            totalBoardValue += ingredient.value;
        });
        return totalBoardValue;
    }
    getAverageBoardValueIncreaseFromDraw() {
        const averageBoardValueIncreaseFromDraw = this.getAverageDrawValue() / parseFloat(this.getTotalBoardValue());
        console.log(`${this.getTotalBoardValue()} + ${this.getAverageDrawValue().toFixed(2)} (${(averageBoardValueIncreaseFromDraw * 100).toFixed(2)}%)`);
        return averageBoardValueIncreaseFromDraw;
    }
    logSanityCheck() {
        const blowChance = player.getKnalChance();
        console.log("blow chance: ", blowChance);
        // player.getAverageDrawValue();
        const averageBoardValueIncreaseFromDraw = player.getAverageBoardValueIncreaseFromDraw()
        // console.log(averageBoardValueIncreaseFromDraw);
        const sanityPercentage = averageBoardValueIncreaseFromDraw * (1 - blowChance);
        console.log("sanity percentage: ", sanityPercentage.toFixed(2));
    }
}








function vib(milis) {
    if (!vibrationSetting) return; 
    if (navigator.vibrate) {
        navigator.vibrate(milis);
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
function generateBuyButtonDivs() {
    const colorButtonsDiv = document.getElementById('buy-buttons');
    colorButtonsDiv.innerHTML = '';
    ColorById.forEach((color, colorId) => {
        // const colorButton = document.createElement('button');
        const colorButton = document.createElement('div');
        colorButton.textContent = color;
        colorButton.onclick = () => showValueButtons(colorId);
        colorButton.classList.add(color, "shop__front__buy-buttons__button");

        colorButtonsDiv.appendChild(colorButton);
    });
}
function showValueButtons(colorId) {
    const valueButtonsDiv = document.getElementById('valueOverlayButtons');
    valueButtonsDiv.innerHTML = '';
    valuesByColorId.get(colorId).forEach(value => {
        const valueButton = document.createElement('div');
        valueButton.textContent = value;
        valueButton.onclick = () => buyIngredient(getIngredientId(colorId, value));
        valueButton.classList.add(ColorById.get(colorId), "shop__front__value-overlay__buttons__button");
        valueButtonsDiv.appendChild(valueButton);
    });
    const valueOverlay = document.getElementById('valueOverlay');
    valueOverlay.style.display = 'block';
}


// Function to buy an ingredient
function buyIngredient(ingredientId) {
    player.purchase(ingredientId);
    vib(50);
    updateUI();  // Update the UI after purchase
}

// Function to remove an ingredient
function sellIngredient(ingredientId) {
    if (confirm(`Sell ${ingredientIdToText(ingredientId)}?`)) {
        player.resetBag();

        player.sell(ingredientId);  // Calls the remove method in the Player class
        vib(50);
        updateUI();  // Update the UI after removal
    }
}


// Function to pick a random ingredient
function pickIngredient() {
    const ingredientId = player.drawRandomIngredientId(player.bag);
    if (ingredientId === -1) return;
    player.placeIngredientOnBoard(ingredientId)
    vib(50);
    updateUI();
}

function pickSpecificIngredient(ingredientId) {
    const pickedIngredientId = player.drawSpecificIngredient(ingredientId);
    if (pickedIngredientId === -1) return;
    player.placeIngredientOnBoard(pickedIngredientId);
    vib(50);
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
    if (count === 0) return;

    const randomIngredientIds = player.drawMultipleRandomIngredientIds(count);
    if (!randomIngredientIds) return; // bag was empty
    const selectedIngredientId = promptUserToSelectIngredientId(randomIngredientIds);
    if (!selectedIngredientId) return; // no ingredient selected
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

        vib(150);
    }
}




// Function to update the UI
function updateUI() {
    // player.logSanityCheck();
    insertBagIngredientList(document.getElementById('bag-ingredients'), player.bag);
    setGridDivStyling(document.getElementById('bag-ingredients'), player.getBagIngredientCount());

    insertBoardIngredientList(document.getElementById('board-history'), player.board); //same as below but different due to difference between board and bag/inventory

    insertInventoryIngredientList(document.getElementById('inventory-ingredients'), player.inventory);
    setGridDivStyling(document.getElementById('inventory-ingredients'), player.getInventoryIngredientCount());

    setBoardHistoryScrollAmount(document.getElementById('board-history'));
}


function setGridDivStyling(gridDiv, itemCount, baseColumns = 4) {
    const containerWidth = gridDiv.clientWidth;
    const containerHeight = gridDiv.clientHeight;
    if (!containerWidth || !containerHeight) return;

    let columns = baseColumns;
    let rows = 1;

    let maxSquareWidth = 1;
    let running = true;
    while (running) {
        maxSquareWidth = containerWidth / columns;
        rows = Math.floor(containerHeight / maxSquareWidth);
        if (itemCount > columns * rows) {
            columns++;
        }
        else {
            running = false;
        }
    }
    gridDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    gridDiv.style.gridTemplateRows = `repeat(${rows}, minmax(auto, ${maxSquareWidth}px))`;
}



function insertBagIngredientList(div, ingredientList) {
    div.innerHTML = '';
    Object.keys(ingredientList).forEach(ingredientId => {for (let i=0; i<ingredientList[ingredientId]; i++) {
        const ingredientDiv = buildIngredientDiv(ingredientId);
        ingredientDiv.addEventListener('click', function (event) {
            pickSpecificIngredient(ingredientId);
        });
        div.append(ingredientDiv);
    }});
}
function insertBoardIngredientList(div, board) {
    div.innerHTML = '';
    const historyHeight = div.clientHeight;
    const historyWidth = div.clientWidth;
    const rightPadding = (historyWidth - historyHeight) / 2;
    div.style.paddingRight = `${rightPadding}px`;

    board.forEach((ingredientId, boardId) => {
        const ingredientDiv = buildIngredientDiv(ingredientId);
        
        ingredientDiv.style.height = `${historyHeight}px`;
        ingredientDiv.style.width = `${historyHeight}px`;
        ingredientDiv.style.flex = 'none';
        ingredientDiv.addEventListener('click', function (event) {
            removeFromBoardWrapper(boardId);
        });
        div.append(ingredientDiv);
    });
}
function insertInventoryIngredientList(div, ingredientList) {
    div.innerHTML = '';
    Object.keys(ingredientList).forEach(ingredientId => {for (let i=0; i<ingredientList[ingredientId]; i++) {
        const ingredientDiv = buildIngredientDiv(ingredientId);
        ingredientDiv.addEventListener('click', function (event) {
            sellIngredient(ingredientId);
        });
        div.append(ingredientDiv);
    }});
}

function buildIngredientDiv(ingredientId) {
    const ingredientDiv = document.createElement("div");
    const ingredient = allIngredients.get(parseInt(ingredientId))

    // const img = getImage(ingredientId);
    // ingredientDiv.append(img);

    // ingredientDiv.innerHTML = ingredient.value;
    const color = ColorById.get(ingredient.color);
    // ingredientDiv.classList.add(color, "ingredient");
    ingredientDiv.classList.add("ingredient");
    ingredientDiv.style.backgroundImage = `url(${getImagePath(ingredient)})`;
    return ingredientDiv;
}

function getImage(ingredientId) {
    const img = document.createElement("img");
    const ingredient = allIngredients.get(parseInt(ingredientId));
    img.src = getImagePath(ingredient);
    return img;
}

function getImagePath(ingredient) {
    return `images/tokens/128x128/${ColorById.get(ingredient.color)}-${ingredient.value}.png`;
}



function addNavigationListeners() {
    // UI STUFF
    // Get references to the divs
    const cauldronDiv = document.getElementById('cauldron');
    const shopDiv = document.getElementById('shop');
    const settingsDiv = document.getElementById('settings');
    
    // Get references to the navigation links
    const viewCookingLink = document.getElementById('viewCauldron');
    const viewShopLink = document.getElementById('viewShop');
    const valueOverlay = document.getElementById('valueOverlay');
    const viewSettingsLink = document.getElementById('viewSettings')

    const divs = [cauldronDiv, shopDiv, settingsDiv];
    const menuDivs = [viewCookingLink, viewShopLink, viewSettingsLink]

    function deactivateAll() {
        divs.forEach(div => {
            div.style.display = 'none';
        });
        menuDivs.forEach(div => {
            div.classList.remove('--active');
        });
    }

    // Add event listeners to toggle visibility
    viewCookingLink.addEventListener('click', function(event) {
        // event.preventDefault();
        deactivateAll();
        cauldronDiv.style.display = 'flex';
        this.classList.add('--active');
        updateUI();
    });
    
    viewShopLink.addEventListener('click', function(event) {
        // event.preventDefault();
        deactivateAll();
        shopDiv.style.display = 'flex';
        this.classList.add('--active');
        updateUI();
    });
    viewSettingsLink.addEventListener('click', function(event) {
        // event.preventDefault();
        deactivateAll()
        settingsDiv.style.display = 'flex';
        this.classList.add('--active');
        updateUI();
    });
}

function setBoardHistoryScrollAmount(div) {
    div.scrollLeft = 1000000;
}

function startingPosition() {
    player.purchase(1, 4);
    player.purchase(2, 2);
    player.purchase(3);
    player.purchase(11);
    player.purchase(51);
    // player.purchase(21, 4);
    // player.purchase(32, 2);
    // player.purchase(44, 1);
    // player.purchase(24, 26);
    // player.purchase(81);
    player.resetBag();
}









const player = new Player();
const allIngredients = createAllIngredients();
let vibrationSetting = true;
let drawMultipleSetting = true;
// let milis = 50;



document.addEventListener('DOMContentLoaded', function () {
    addNavigationListeners();
    generateBuyButtonDivs();
    const drawSingleButton = document.getElementById('drawSingle');
    const drawMultipleButton = document.getElementById('drawMultiple');
    const valueOverlay = document.getElementById('valueOverlay');
    const cauldronReset = document.getElementById('cauldronReset');
    const vibrationToggle = document.getElementById('settingsVibrationToggle');
    const drawMultipleToggle = document.getElementById('settingsDrawMultipleToggle');
    const sideBoardToggle = document.getElementById('settingsSideBoardToggle');

    function closeValueOverlayFunc() {
        valueOverlay.style.display = 'none';
    }
    // function openValueOverlayFunc() {}
    const valueOverlayClose = document.getElementById('valueOverlayClose');
    drawSingleButton.addEventListener('click', pickIngredient);
    drawMultipleButton.addEventListener('click', mydrawMultipleIngredients);
    valueOverlayClose.addEventListener('click', closeValueOverlayFunc);
    valueOverlay.addEventListener('click', closeValueOverlayFunc);
    cauldronReset.addEventListener('click', resetBag);
    vibrationToggle.addEventListener('change', function() {
        if (this.checked) vibrationSetting = true;
        else vibrationSetting = false;
    });
    drawMultipleToggle.addEventListener('change', function() {
        const drawMultipleDiv = document.getElementById('drawMultiple');
        if (this.checked) {
            drawMultipleDiv.style.display = 'flex';
            drawMultipleSetting = true;
            console.log(drawMultipleSetting)
        }
        else {
            drawMultipleDiv.style.display = 'none';
            drawMultipleSetting = false;
            console.log(drawMultipleSetting)
        }
    });
    sideBoardToggle.addEventListener('change', function() {
        const sideBoardDiv = document.getElementById('sideBoard');
        if (this.checked) {
            sideBoardDiv.style.display = 'grid';
        }
        else {
            sideBoardDiv.style.display = 'none';
        }
    });


    // const input = document.getElementById('vibrationTest__input');
    // const button = document.getElementById('vibrationTest__button');
    // button.addEventListener('click', function () {
    //     milis = parseInt(input.value);
    //     console.log("TRILLING   ", milis)
    // });
});





startingPosition()
updateUI();  // Initial call to display empty states