var previousTarget, previousTargetText, lastMathItem;
var calcNumber = document.querySelector('.calc-number');
var allButtons = document.getElementsByTagName('button');
var operators = ['+', '-', '*', '/'];
var mathEquation = [];
calcNumber.textContent = '0';

for (var i = 0; i < allButtons.length; i++) {
  allButtons[i].addEventListener('click', calcWork, false);
}

function calcWork(e) {
  var noRepeat = false;
  var target = e.target;
  var targetText = target.textContent;

  function changeScreenContent(procedure) {
    if (procedure === 'replace') {
      calcNumber.textContent = targetText;
    } else if ((procedure === 'add') && (calcNumber.textContent.length < 9)) {
      calcNumber.textContent += targetText;
    }
  }

  if (target.classList.contains('num')) {
    if ((calcNumber.textContent.indexOf('.') !== -1) && (targetText === '.')) {
      noRepeat = true;
    }

    switch (true) {
      case ((calcNumber.textContent === '0') && (mathEquation[0] !== 0)):
        changeScreenContent('replace');
        break;

      case (previousTarget.classList.contains('num')):
        if (noRepeat === false) {
        changeScreenContent('add');
        }
        break;

      case (previousTarget.classList.contains('op')):
        changeScreenContent('replace');
        break;

      case (previousTarget.classList.contains('equal')):
        changeScreenContent('replace');
        mathEquation = [];
        break;

      case (previousTarget.classList.contains('clear-entry')):
        changeScreenContent('replace');
        break;
    }
  }

  if (target.classList.contains('op')) {

    lastMathItem = mathEquation[mathEquation.length - 1];

    switch (true) {
      case ((mathEquation.length === 0) && (calcNumber.textContent === '0')):
        mathEquation.push(0, targetText);
        break;

      case (calcNumber.textContent === 'error'):
        break;

     /*if an operator was clicked after clear entry and an operator (string value) is the last item in mathEquation,
      replace the previous operator with the most recently clicked operator */
      case ((typeof lastMathItem === 'string') && (previousTarget.classList.contains('clear-entry'))):
        for (var i = 0; i < operators.length; i++) {
          if (lastMathItem !== operators[i]) {
          mathEquation.splice(mathEquation.length - 1, 1, targetText);
          }
        }
        break;

      case (previousTargetText === targetText):
        break;

      case ((previousTarget.classList.contains('op')) && (previousTargetText !== targetText)):
        mathEquation.splice(mathEquation.length - 1, 1, targetText);
        break;

      case (previousTarget.classList.contains('num')):
        var screenContent = calcNumber.textContent;
        mathEquation.push(Number(screenContent));
        mathEquation.push(targetText);
        break;

      case (previousTarget.classList.contains('equal')):
        mathEquation.push(targetText);
        break;
    }
  }

  if (target.classList.contains('equal')) {

    /*if previously clear entry was clicked, the screen content is 0, and
    the last item in mathEquation is an operator (which can only be at index 1 or higher),
    then push 0 (the text content after CE click event) to the end of mathEquation before evaluating*/
    if ((previousTarget.classList.contains('clear-entry')) && (calcNumber.textContent === '0')
    && (mathEquation.length >= 2)) {
      mathEquation.push(0);
      calculateAnswer();
    }

    switch (true) {
      case (previousTarget.classList.contains('num')):
        mathEquation.push(Number(calcNumber.textContent));
        calculateAnswer();
        break;

      //if the last item in mathEquation is an operator
      case ((mathEquation.length > 1) && (typeof mathEquation[mathEquation.length - 1] === 'string')):
        calcNumber.textContent = 'error';
        mathEquation = [];
        break;
    }
  }

  if (target.classList.contains('clear-all')) {
    calcNumber.textContent = '0';
    mathEquation = [];
  }

  if (target.classList.contains('clear-entry')) {
    switch (true) {

      case (mathEquation.length === 0):
        calcNumber.textContent = '0';
        break;

      case (mathEquation.length === 1):
        calcNumber.textContent = '0';
        mathEquation = [];
        break;

      case ((mathEquation.length > 1) && (previousTarget.classList.contains('num'))):
       calcNumber.textContent = '0';
       break;
    }
  }
////////////////////////////////////////////
  function calculateAnswer() {
    var generalOpArray, highPrecedenceOp;

    function opLocator() {
      generalOpArray = [];
      highPrecedenceOp = 0;
      for (var i = 0; i < mathEquation.length; i++) {

        switch (mathEquation[i]) {
          case '+':
            generalOpArray.push(i);
            break;
          case '-':
            generalOpArray.push(i);
            break;
          case '*':
            generalOpArray.push(i);
            if (highPrecedenceOp === 0) {
              highPrecedenceOp = i;
            }
            break;
          case '/':
            generalOpArray.push(i);
            if (highPrecedenceOp === 0) {
              highPrecedenceOp = i;
            }
            break;
        }
      }
    }

    function evalOp(opInEquation) {
      var operandOne = opInEquation - 1;
      var operandTwo = opInEquation + 1;

      if (typeof mathEquation[operandOne] === 'object') {
        var operandOneNum = mathEquation[operandOne];
      } else {
        var operandOneNum = new Decimal(mathEquation[operandOne]);
      }

      if (typeof mathEquation[operandTwo] === 'object') {
        var operandTwoNum = mathEquation[operandTwo];
      } else {
        var operandTwoNum = new Decimal(mathEquation[operandTwo]);
      }

      switch (mathEquation[opInEquation]) {
        case '+':
          var result = operandOneNum.plus(operandTwoNum);
          break;

        case '-':
          var result = operandOneNum.minus(operandTwoNum);
          break;

        case '*':
          var result = operandOneNum.times(operandTwoNum);
          break;

        case '/':
          var result = operandOneNum.div(operandTwoNum);
          break;
      }
      mathEquation.splice(operandOne, 3);
      mathEquation.splice(operandOne, 0, result);
    }


    function evalEquation() {
      opLocator();
      while (generalOpArray.length > 0) {

        if (highPrecedenceOp !== 0) {
          evalOp(highPrecedenceOp);
          opLocator();
          continue;
        }
        evalOp(generalOpArray[0]);
        opLocator();
      }
    }
    
    function checkAnswer() {
      var answerString = mathEquation[0].toString();
      switch (true) {

        case ((isNaN(mathEquation[0]) === true) || (mathEquation[0] > 999999999)):
          calcNumber.textContent = 'error';
          mathEquation = [];
          break;

        case ((answerString.length > 9) && (answerString.indexOf('.') !== -1)):
          var decimalIndex = answerString.indexOf('.');
          var decPlaces = 9 - (decimalIndex + 1);
          //if there are 8 digits or more to the left of the decimal point
          if (mathEquation[0] > 10000000) {
            calcNumber.textContent = 'error';
          } else {
            mathEquation[0] = mathEquation[0].toDP(decPlaces, Decimal.ROUND_HALF_UP);
            calcNumber.textContent = mathEquation[0];
          }
          break;

        default:
          calcNumber.textContent = mathEquation[0];
          break;
      }
    }
    evalEquation();
    checkAnswer();
  }
  previousTarget = target;
  previousTargetText = targetText;
}
