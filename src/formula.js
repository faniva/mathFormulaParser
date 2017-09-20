/**
 *  Takes a math expression as a string and converts it into an executable math operation
 * @param formula
 * @param variables
 * @constructor
 */

function Formula(formula, variables){

    this._id = this.getRandomId();
    this._formula = formula;
    this._elements = [];
    this._operands = [];
    this._operators = [];
    this._variables = variables || [];
    // Instantiate a formula factory
    this.formulaFactory = new FormulaFactory();

}

Formula.prototype.init = function(){
    // Parse the formula
    this.parseMathFormula(this._formula);
    console.log('New formula created');
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

    debugger;

    var indexAt = -1, skip = false;
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
        this._elements.push( substr.slice(0).trim() );
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

    console.log('Executing formula...')

    // If operands and elements have only 1 item, then the final result is that item
    if(this._elements.length === 1 && this._operands.length === 1 ){
        var result = parseFloat(this._operands[0]); 
        console.log('The final result:')
        console.log(result)
        return result; // This is the final result
    }

    // To execute the math formula these are the steps to follow
    // 1. Scan the formula for PARENTHESIS operations
    // 2. Scan the formula for MULTIPLICATION or DIVISION operations
    // 3. Scan for any other operations (addition and subtraction)

    // 1. Scan the formula for PARENTHESIS operations
    var self = this;
    this._operands.forEach(function(operand, index){

        // Find the parenthesis functions
        if(operand.charAt(0) === '(' && operand.slice(-1) === ')' ){
            // Found a parenthesis
            // Remove the parenthesis
            operand = operand.slice(1,-1).trim();

            var subFormula = self.formulaFactory.createFormula(operand, self._variables);
            subFormula.init();

            // debugger;

            // get the value of it
            var parenthesisValue = subFormula.execute();
            // Also update the elements array
            self._elements[self._elements.indexOf(self._operands[index])] = parenthesisValue;
            self._operands[index] = parenthesisValue;
        }
    });

    // At this point all operands of our formula are either variables or values, no parenthesis

    // 2. Scan the formula for MULTIPLICATION or DIVISION operations
    for(var i=0; i<this._elements.length; i++){

        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes

        var operator = this.isOperator( this._elements[i] );

        // Stop if found multiplication or division operator
        if( operator ){
            if( operator === '*' || operator === '/'){
                // It is an operator and its multiplication
                var execFn = this.getOperatorFunction(operator);

                // Run the operation and get the result
                var result = self.execOperatorFunction(this._elements[i-1], this._elements[i+1], execFn); // Returns the numeric value for this operation

                // Update the formula with the new value removing the operands that took part of the function
                this._elements.splice(i-1, 3);
                this._elements.splice(i-1, 0, result);

                // So if we had something like this :  5 * 8 , now we have replaced those 3 array items with 40

                // debugger;

                // Reconstruct formula from the elements and create a new Formula object
                var newFormula = self.formulaFactory.createFormula(this._elements.join(' '), self._variables);
                newFormula.init();

                // todo maybe instead of creating new formula iunstances just update the elements and execute it again
                // We have to exit the execute function
                return newFormula.execute();

            }


        } else {
            // It is not an operator. Formula is not valid
            console.log('Operator is not defined');
            return false;
        }
    }


    // 3. Scan for any other operations (addition and subtraction)
    for(var k=0; k<this._elements.length; k++) {

        if (k % 2 === 0) continue; // We only look for operators on non-even indexes

        var operator = this.isOperator(this._elements[k]);

        // Stop if found sum or subtraction operator
        if (operator) {
            if (operator === '+' || operator === '-') {

                var execFn = this.getOperatorFunction(operator);

                // Run the operation and get the result
                var result = self.execOperatorFunction(this._elements[k - 1], this._elements[k + 1], execFn); // Returns the numeric value for this operation

                // Update the formula with the new value removing the operands that took part of the function
                this._elements.splice(k - 1, 3);
                this._elements.splice(k - 1, 0, result);

                // So if we had something like this :  5 + 8 , now we have replaced those 3 array items with 13

                // debugger;

                // Reconstruct formula from the elements and create a new Formula object
                var newFormula = self.formulaFactory.createFormula(this._elements.join(' '), self._variables);
                newFormula.init();
                // todo maybe instead of creating new formula iunstances just update the elements and execute it again
                // We have to exit the execute function
                return newFormula.execute();

            }


        } else {
            // It is not an operator. Formula is not valid
            console.log('Operator is not defined');
            return false;
        }


    }


};

Formula.prototype.execOperatorFunction = function(a,b, operatorFn){

    // Validate the 2 operands
    // ===============================================================
    if( isNaN(a) ){
        // Is not a number, therefore make sure its a declared variable
        // This is a string
        a = this.isVariable(a); // If its a variable returns its value
        if(!a){
            console.log('error, variable not defined');
            return false;
        }
    }

    if( isNaN(b) ){
        // Is not a number, therefore make sure its a declared variable
        // This is a string
        b = this.isVariable(b); // If its a variable returns its value
        if(!b){
            console.log('error, variable not defined');
            return false;
        }
    }

    // At this point, both operands are numeric values
    // Continue...

    // Execute the function
    return operatorFn(a, b);

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

        case '^' : {
            return (
                function(a,b){
                    return Math.pow(a,b);
                }
            )
        }

        default : break;

    }
};

Formula.prototype.isOperator = function(op){
    // Check if argument is a declared and valid math operator
    var validOperators = ['+', '-', '*', '/', '%', '^'];

    return validOperators.indexOf(op) !== -1 ? validOperators[validOperators.indexOf(op)] : false

};

Formula.prototype.isVariable = function(input){
    // Check if variable is a declared variable
    for(var i=0; i<this._variables.length; i++){
        if(this._variables[i].name === input){
            return this._variables[i].value;
        }
    }

    return false;

};

Formula.prototype.addVariable = function(v){
    // Validate correct input
    if(!v || !v.name || !v.type || !v.value)
        return false;


    // Add to the vs array
    this._variables.push(v);

};

/**
 * Returns a random ID
 */
Formula.prototype.getRandomId = function(){

    // Returns a random id
    return('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    }));
};



function FormulaFactory(){
    this.createFormula  = function(expression, variables){
        console.log('Creating new formula...');
        return new Formula(expression, variables);
    }
}
