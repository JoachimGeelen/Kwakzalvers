export class Player {
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