var dataController = (function () {

    //constructor for Expense
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //constructor for Income
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    //a place for the All expenses/incomes ; Total expense/income
    var data = {
        allItems: {
            exp: [], //conviniently named the same as what gets back from UI:HTML element data so easy to be put
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };

    //a helper method to loop through exp array or inc array (based on passed in type in string) to calcute the total of exp or inc
    var calculateTotal = function (type) {

        var sum = 0;

        //accumulate sum for each array item 
        data.allItems[type].forEach(function (e) {
            sum += e.value;
        });

        //add sum to the totals property
        data.totals[type] = sum;
    };

    return {

        //a function for other controllers to use to add item
        addItem: function (type, des, val) {

            var id, newItem;

            //set the id to be the last item's id in exp or inc array plus 1
            if (data.allItems[type].length === 0) { //check if the array has nothing in 
                id = 1;
            } else {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }


            //create new item based on corresponding type
            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(id, des, val);
            }

            //add item to list
            data.allItems[type].push(newItem);

            //return the newly added item for furthur use
            return newItem;

        },

        //calculate total exp; calculate total inc; calculate budget & put into property; calculate percentage & put into property
        calculate: function () {

            //1. calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2. calculate budget: total income - total expenses ; and put into budget property
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate the percentage as an interger： total expense/total income
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = 0;
            }
        },

        //dataController's public interface for getting the calculation results in an object
        getCalculationResults: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        }
    };
})();




var UIController = (function () {

    //define html element selectors here in one place in an object
    var selectors = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budget: '.budget__value',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        totalPercentage: '.budget__expenses--percentage',
        container: '.container'
    };

    //functionalities of the UI Controller that are accessbile globally
    return {

        //get all html selector strings 
        getSelectors: function () {
            return selectors;
        },

        //get input from input fields
        getInputField: function () {
            return {
                type: document.querySelector(selectors.inputType).value, //'inc' or 'exp'
                description: document.querySelector(selectors.inputDescription).value,
                value: parseFloat(document.querySelector(selectors.inputValue).value) //parse to number for later calculation
            };

        },

        //get the id & type of the element clicked (on the delete button) to be deleted using traverse, Arg: the click event
        getDeleteId: function (ev) {

            //traverse to the parent element that we want to delete & get it's id property's string
            var idString = ev.target.parentNode.parentNode.parentNode.parentNode.id; // 'inc-#' or 'exp-#'
            return {

                id: idString.split('-')[1],
                type: idString.split('-')[0]
            };
        },

        //add to the list UI. Args: item object; type in string
        addtoList: function (item, type) {

            var html, elementSelector;

            //1. create the html string to be added to dom using string interpolation
            if (type === 'inc') { //check the type, then create corresponding html string & element selector

                html = `<div class="item clearfix" id="inc-${item.id}">
                           <div class="item__description">${item.description}</div>
                           <div class="right clearfix">
                              <div class="item__value">+ ${item.value}</div>
                              <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                              </div>
                           </div>
                        </div>`;

                elementSelector = selectors.incomeContainer;

            } else if (type === 'exp') {

                html = `<div class="item clearfix" id="exp-${item.id}">
                            <div class="item__description">${item.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">- ${item.value}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn">
                                       <i class="ion-ios-close-outline"></i>
                                    </button>
                                </div>
                            </div>
                        </div>`;

                elementSelector = selectors.expenseContainer;
            }

            //2. add the html string to the dom based on the elemetSelector set above & use insertAdjacentHTML method
            document.querySelector(elementSelector).insertAdjacentHTML('beforeend', html);

        },

        //update the calculations UI, Arg: calculationResult
        addtoCalculation: function (calcResult) {

            document.querySelector(selectors.budget).textContent = calcResult.budget;
            document.querySelector(selectors.totalIncome).textContent = calcResult.totalInc;
            document.querySelector(selectors.totalExpense).textContent = calcResult.totalExp;
            document.querySelector(selectors.totalPercentage).textContent = calcResult.percentage + '%';

        },

        //clear input fields: description & value
        clearInputFields: function () {
            //data type of fields is a NodeList, can use foreach in modern browsers. 
            var fields = document.querySelectorAll(selectors.inputDescription + ',' + selectors.inputValue);

            fields.forEach(function (e) {

                e.value = '';

            });
        }
    };

})();




var controller = (function (dataCtrl, UICtrl) {

    //a common place for event listeners 
    //and call this with an init function set up in controller, made globally available, then called outside any controllers as the only code outside(init) 
    var setupEventListeners = function () {

        //import selectors from UICtrl
        var selectors = UICtrl.getSelectors();

        //event listener for mouse click
        document.querySelector(selectors.inputButton).addEventListener('click', enterHandler);

        //event listener for keyboard press
        document.addEventListener('keypress', function (e) {

            if (e.keyCode === 13) {
                enterHandler();
            }
        });

        //event listener for delete buttons on all items of container
        document.querySelector(selectors.container).addEventListener('click', function (e) {

            if (e.target.tagName === 'I') { //check if the target elemnt is the icon element, only then call deleteHandler() and pass the event in

                deleteHandler(e);

            }

        });

    };

    //call back function for enter event listener
    var enterHandler = function () {

        //1. get input data: {type, description, value}
        var input = UICtrl.getInputField();

        //validation: only proceed if input value is not empty
        if (!isNaN(input.value)) {

            //2. add input data using dataCtrl's method & get the item object back: {id, description, value}
            var item = dataCtrl.addItem(input.type, input.description, input.value);
            //3. update ui to display the items in a list
            UICtrl.addtoList(item, input.type);
            //4. clear input fields
            UICtrl.clearInputFields();

            //5. do calculations & get calculation result
            dataCtrl.calculate();
            var calculationResult = dataCtrl.getCalculationResults();

            //6. update ui to display calculation result
            UICtrl.addtoCalculation(calculationResult);

        } else {

            //error
            console.log('value must be there');
        }
    };

    //call back function for delete event listener
    var deleteHandler = function (ev) {

        //1. get element to be deleted's id and type (an object) using UI controller's method
        var deleteObj = UICtrl.getDeleteId(ev); // an object
        console.log(deleteObj);

        //2. delete the element's corresbonding item in data controller

        //3. update ui to display deleted list

        //4. update calculation result ui


    };

    return {
        init: function () {
            console.log('started');
            setupEventListeners();
            //reset the calculation result UI
            UICtrl.addtoCalculation({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    };

})(dataController, UIController);

controller.init();
