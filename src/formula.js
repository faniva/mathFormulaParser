/**
 *  Takes a math expression as a string and converts it into an executable math operation
 * @param formula
 * @param variables
 * @constructor
 */

function Formula(formula, variables){

    this._formula = formula;
    this._elements = [];
    this._operands = [];
    this._operators = [];
    this._variables = variables || [];

}

Formula.prototype.init = function(){
    this.parseMathFormula(this._formula);
    console.log(this)
};

/**
 * Takes a formula string
 * @param formula | String
 */
Formula.prototype.parseMathFormula = function(formula){
    // Get the elements of the formula
    this.getElementsRecursive(formula);
    // Get the operands of the formula
    this.getOperands();
    // Get the operators of the formula
    this.getOperators();
};

Formula.prototype.getElementsRecursive = function(substr){

    var indexAt, skip = false;
    for(var i=0; i<substr.length; i++){
        if(substr[i]=== ' ' && skip === false && substr[i+1] !== ' ' ){
            indexAt = i;
            break;
        }

        // If open parenthesis is found, skip until we find the closing parenthesis
        if(substr[i] === '(') {
            skip = true;
            continue;
        }


        if(skip &&  substr[i] === ')'){
            // We are looking for the closing parenthesis
            indexAt = i+1;
            break;

        }

    }

    if(indexAt >= 0){
        this._elements.push( substr.slice(0, indexAt).trim()  );
        this.getElementsRecursive( substr.slice(indexAt+1).trim()  )
    } else {
        this._elements.push( substr.slice(0) );
    }
};

Formula.prototype.getOperands = function(){

    for(var i=0; i<this._elements.length; i++){
        // 1. Scan for multiplication operations
        if( i%2 !== 0 ) continue; // We only look for operands on even indexes
        this._operands.push(this._elements[i]);
    }

};

Formula.prototype.getOperators = function(){

    for(var i=0; i<this._elements.length; i++){
        // 1. Scan for multiplication operations
        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes
        this._operators.push(this._elements[i]);
    }

};

/**
 * Returns the final value
 */
Formula.prototype.execute = function(){

    // If operands and elements have only 1 item, then the final result is that item
    if(this._elements.length === 1 && this._operands.length === 1 ){
        return this._operands[0]; // This is the final result
    }

    // To execute the math formula these are the steps to follow
    // 1. Scan the formula for PARENTHESIS operations
    // 2. Scan the formula for MULTIPLICATION or DIVISION operations
    // 3. Scan for any other operations (addition and subtraction)

    // 1.
    var self = this;
    this._operands.forEach(function(operand, index){

        // Find the parenthesis functions
        if(operand.charAt(0) === '(' && operand.slice(-1) === ')' ){
            // Found a parenthesis
            // Remove the parenthesis
            operand = operand.slice(1,-1);

            var subFormula = new Formula(operand);
            subFormula.init();

            // get the value of it
            self._operands[index] = subFormula.execute();
        }
    });

    // 2.
    for(var i=0; i<this._elements.length; i++){

        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes

        var operator = this.isOperator( this._elements[i] );

        // Stop if found multiplication or division operator
        if( operator && (operator === '*' || operator === '/') ){
            // It is an operator and its multiplication
            var execFn = this.getOperatorFunction(operator);

            // Validate the 2 operands
            var input1 = this._elements[i-1],
                input2 = this._elements[i+1];

            if( isNaN(input1) ){
                // Is not a number, therefore make sure its a declared variable
                // This is a string
                input1 = self.isVariable(input1); // If its a variable returns its value
                if(!input1){
                    console.log('error, variable not defined');
                    break;
                }
            }

            if( isNaN(input2) ){
                // Is not a number, therefore make sure its a declared variable
                // This is a string
                input2 = self.isVariable(input2); // If its a variable returns its value
                if(!input2){
                    console.log('error, variable not defined');
                    break;
                }
            }


            // Execute the function
            var value = execFn(input1, input2);
            // Update the formula with the new value removing the operands that took part of the function
            self._elements.splice(i-1, 3);
            self._elements.splice(i-1, 0, value);

            // debugger;

            // Reconstruct formula from the elements
            var frm = self._elements.join(' ');
            var newFormula = new Formula(frm);
            newFormula.init();
            newFormula.execute();
            // todo maybe instead of creating new formula iunstances just update the elements and execute it again
            break;

        } else {
            // It is not an operator. Formula is not valid
            console.log('Operator is not defined or is not addition or subtraction');
        }
    }


    // 3.
    for(var k=0; k<this._elements.length; k++){

        if( k%2 === 0 ) continue; // We only look for operators on non-even indexes

        var operator = this.isOperator( this._elements[k] );

        // Stop if found addition or subtraction operator
        if( operator && (operator === '+' || operator === '-')  ){
            // It is an operator and its addition or subtraction
            var execFn = this.getOperatorFunction(operator);

            // Validate the 2 operands
            var input1 = this._elements[k-1],
                input2 = this._elements[k+1];

            if( isNaN(input1) ){
                // Is not a number, therefore make sure its a declared variable
                // This is a string
                input1 = self.isVariable(input1); // If its a variable returns its value
                if(!input1){
                    console.log('error, variable not defined');
                    return false;
                }
            }

            if( isNaN(input2) ){
                // Is not a number, therefore make sure its a declared variable
                // This is a string
                input2 = self.isVariable(input2); // If its a variable returns its value
                if(!input2){
                    console.log('error, variable not defined');
                    return false;
                }
            }


            // Execute the function
            var value = execFn(input1, input2);
            // Update the formula with the new value removing the operands that took part of the function
            self._elements.splice(k-1, 3);
            self._elements.splice(k-1, 0, value);

            // debugger;

            // Reconstruct formula from the elements
            var frm = self._elements.join(' ');
            var newFormula = new Formula(frm);
            newFormula.init();
            newFormula.execute();
            // todo maybe instead of creating new formula iunstances just update the elements and execute it again
            break;

        } else {
            // It is not an operator. Formula is not valid
            console.log('Operator is not defined or is not addition or subtraction');
        }
    }


};

Formula.prototype.getOperatorFunction = function(operator){
    switch (operator){
        case '*' : {
            return (
                function(a,b){
                    return a * b;
                }
            )
        }

        case '+' : {
            return (
                function(a,b){
                    return a + b;
                }
            )
        }

        case '/' : {
            return (
                function(a,b){
                    return a / b;
                }
            )
        }

        case '-' : {
            return (
                function(a,b){
                    return a - b;
                }
            )
        }

        case '%' : {
            return (
                function(a,b){
                    return a % b;
                }
            )
        }

        default : break;

    }
};

Formula.prototype.isOperator = function(op){
    // Check if argument is a declared and valid math operator
    var validOperators = ['+', '-', '*', '/', '%'];

    return validOperators.indexOf(op) !== -1 ? validOperators[validOperators.indexOf(op)] : false

};

Formula.prototype.isVariable = function(input){
    // Check if argument is a declared and valid math operator

    for(var i=0; i<this._variables.length; i++){

        if(this._variables[i].name === input){
            return this._variables[i].value;
        }
    }

    return false;

};
