var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },

    totals: {
      exp: 0,
      inc: 0,
    },

    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var ID, newItem;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else {
        newItem = new Expense(ID, des, val);
      }

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      calculateTotal("inc");
      calculateTotal("exp");

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    calculatePercentage: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    moveUp: function (type, id) {
      var ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      elementUp = data.allItems[type][index];

      if (index > 0) {
        data.allItems[type].splice(index, 1);

        data.allItems[type].splice(index - 1, 0, elementUp);

        if (index > 0) {
          index = index - 1;
        }
      }
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });

      return allPerc;
    },

    testing: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var DOMstrings = {
    deleteBtn: ".item__delete--btn",
    headingBtn: ".heading__btn",
    header: ".header",
    inputHead: ".add__heading",
    container: ".container",
    expPercentageLabel: ".item__percentage",
    incomeContainer: ".income__list",
    expenseContainer: ".expense__list",
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    budgetLabel: ".budget__value",
    incomelabel: ".budget__income--value",
    expenseLabel: ".budget__expense--value",
    percentageLabel: ".budget__expense--percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var num, numSplit, int, dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];

    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        heading: document.querySelector(DOMstrings.inputHead).value,
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="btns"><div class="navigation__btns"><button class="move__up"><ion-icon name="arrow-up-outline"></ion-icon></button><div class="move__down"><button class="move__down"><ion-icon name="arrow-down-outline"></ion-icon></button></div></div><button class="item__delete--btn"><ion-icon name="trash-outline"></ion-icon></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix" ><div class="item__value">%value%</div><div class="item__percentage"> 21%</div><div class="btns"><div class="navigation__btns"><button class="move__up"><ion-icon name="arrow-up-outline"></ion-icon></button><div class="move__down"><button class="move__down"><ion-icon name="arrow-down-outline"></ion-icon></button></div></div></div><div class="item__delete--btn"><button class="item__delete--btn"><ion-icon name="trash-outline"></ion-icon></button></div></div></div>';
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);

      return newHtml;
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputHead +
          "," +
          DOMstrings.inputValue +
          "," +
          DOMstrings.inputDescription
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayMonth: function () {
      var now, month, months, year;

      now = new Date();

      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    displayBudget: function (obj) {
      var type;

      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomelabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expenseLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    deleteListItem: function (selectorId) {
      var el;

      el = document.getElementById(selectorId);

      el.parentNode.removeChild(el);
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      console.log(fields);

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
    },

    displayHeading: function (head) {
      var html, newHtml;

      html =
        '<div class="heading"><div class="heading__title">%Heading%</div></div>';

      newHtml = html.replace("%Heading%", head);

      document
        .querySelector(DOMstrings.header)
        .insertAdjacentHTML("beforeend", newHtml);
    },

    clearHeading: function () {
      var headField;

      headField = document.querySelector(DOMstrings.inputHead);

      headField.value = "";

      document.querySelector(DOMstrings.inputHead).style.display = "none";
      document.querySelector(DOMstrings.headingBtn).style.display = "none";
    },

    moveUpElement: function (selectorId, type, id) {
      var el1, el0, element, ele;

      if (type === "inc") {
        ele = DOMstrings.incomeContainer;
      } else {
        ele = DOMstrings.expenseContainer;
      }

      element = document.querySelector(ele);

      splitId = selectorId.split("-");

      type = splitId[0];
      ID = splitId[1];

      el1 = document.getElementById(type + "-" + ID);
      el0 = document.getElementById(type + "-" + (ID - 1));

      el1.parentNode.removeChild(el1);

      element.insertBefore(el1, el0);
    },

    moveDownElement: function (selectorId, type, id) {
      var el1, el0, element, ele;

      if (type === "inc") {
        ele = DOMstrings.incomeContainer;
      } else {
        ele = DOMstrings.expenseContainer;
      }

      element = document.querySelector(ele);

      splitId = selectorId.split("-");

      type = splitId[0];
      ID = splitId[1];

      el1 = document.getElementById(type + "-" + ID);
      el0 = document.getElementById(type + "-" + (ID + 1));

      el1.parentNode.removeChild(el1);

      element.insertBefore(el1, el0);
    },

    getDOMStrings: function () {
      return DOMstrings;
    },
  };
})();

var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListners = function () {
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();

        budgetCtrl.testing();
      }
    });

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);

    document.querySelector(DOM.headingBtn).addEventListener("click", header);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        header();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", specificClick);
  };

  var updateBudget = function () {
    budgetCtrl.calculateBudget();

    var budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    budgetCtrl.calculatePercentage();

    var percentage = budgetCtrl.getPercentages();

    UICtrl.displayPercentages(percentage);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();

      updateBudget();

      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (itemId, type, id) {
    budgetCtrl.deleteItem(type, id);

    UICtrl.deleteListItem(itemId);

    updateBudget();

    updatePercentages();
  };

  var header = function () {
    var input;

    input = UICtrl.getInput();

    if (input.heading !== "") {
      UICtrl.displayHeading(input.heading);

      UICtrl.clearHeading();
    }
  };

  var specificClick = function (event) {
    var DOM = UICtrl.getDOMStrings();

    var itemId1,
      itemId2,
      itemId3,
      splitId1,
      type1,
      ID1,
      splitId2,
      splitId3,
      type2,
      ID2,
      type3,
      ID3;

    itemId1 = event.target.parentNode.parentNode.parentNode.parentNode.id;

    itemId2 =
      event.target.parentNode.parentNode.parentNode.parentNode.parentNode.id;

    itemId3 =
      event.target.parentNode.parentNode.parentNode.parentNode.parentNode
        .parentNode.id;

    if (itemId1) {
      splitId1 = itemId1.split("-");
      type1 = splitId1[0];
      ID1 = parseInt(splitId1[1]);

      ctrlDeleteItem(itemId1, type1, ID1);
    } else if (itemId2) {
      splitId2 = itemId2.split("-");

      type2 = splitId2[0];

      ID2 = parseInt(splitId2[1]);

      moveUp(itemId2, type2, ID2);
    } else if (itemId3) {
      splitId3 = itemId3.split("-");

      type3 = splitId3[0];

      ID3 = parseInt(splitId3[1]);

      moveDown(itemId3, type3, ID3);
    }
  };

  var moveUp = function (itemId, type, id) {
    var splitId, type, ID, lastId, ids;

    splitId = itemId.split("-");
    type = splitId[0];
    ID = parseInt(splitId[1]);
    ids = "ID";

    lastId = type + "-" + (ID - 1);

    if (ID > 0) {
      budgetCtrl.moveUp(type, id);

      UICtrl.moveUpElement(itemId, type, id);

      if (ID > 0) {
        document.getElementById(lastId).id = type + "-" + ID;
        document.getElementById(itemId).id = type + "-" + (ID - 1);
      }
    }
  };

  var moveDown = function (itemId) {
    var splitId, type, ID, lastId, ids;
    var DOM = UICtrl.getDOMStrings();

    splitId = itemId.split("-");
    type = splitId[0];
    ID = parseInt(splitId[1]);
    ids = "ID";

    nextId = type + "-" + (ID + 1);

    if (ID >= DOM.incomeContainer.childElementCount) return;

    nextId = type + "-" + (ID + 1);
    console.log(nextId);
    budgetCtrl.moveUp(type, ID);

    UICtrl.moveDownElement(itemId, type, ID);

    document.getElementById(itemId).id = type + "-" + (ID + 1);
    document.getElementById(nextId).id = type + "-" + ID;
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListners();

      document.querySelector(".add__type").selectedIndex = "0";
    },
  };
})(budgetController, UIController);

controller.init();
