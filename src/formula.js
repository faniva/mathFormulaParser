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
    this._formulaFactory = new FormulaFactory();
    this._execHistory = [];
    this._state  = []; // Data structure to hold the different states which the formula goes through

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

Formula.prototype.getElementsRecursive = function(str){

    var indexAt = -1, skip = false;
    // Loop through the entire string
    for(var i=0; i<str.length; i++){

        // We look for an empty space
        if(str[i]=== ' ' && skip === false && str[i+1] !== ' ' ){
            indexAt = i;
            break;
        }

        // If open parenthesis is found, skip until we find the closing parenthesis
        if(str[i] === '(') {
            skip = true;
            continue;
        }

        // We are looking for the closing parenthesis
        if(skip &&  str[i] === ')'){
            indexAt = i+1;
            break;
        }

    }

    if(indexAt >= 0){
        // Push substring to the elements array
        this._elements.push( str.slice(0, indexAt).trim()  );
        // Get the rest of the string after slicing
        var substr = str.slice(indexAt+1).trim();
        // If the substring is not empty, then repeat the same operation for the rest of the string
        if(substr.length)
            this.getElementsRecursive(substr)
    } else {
        // String is one single word with no parenthesis, we add it to the elements array
        this._elements.push( str.slice(0).trim() );
    }
};

Formula.prototype.getOperands = function(){

    for(var i=0; i<this._elements.length; i++){
        if( i%2 !== 0 ) continue; // We only look for operands on even indexes
        this._operands.push(this._elements[i]);
    }

};

Formula.prototype.getOperators = function(){

    for(var i=0; i<this._elements.length; i++){
        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes
        this._operators.push(this._elements[i]);
    }

};

/**
 * Returns the final value
 */
Formula.prototype.execute = function(){

    console.log('Executing formula...')

    
    debugger;

    // If operands and elements have only 1 item, then the final result is that item
    if(this._elements.length === 1 && this._operands.length === 1 ){
        var result = parseFloat(this._operands[0]); 
        console.log('The final result:')
        console.log(result)
        return result; // This is the final result
    }

    // To execute the math formula these are the steps to follow
    // Every arithmetic formula follows the PEMA order
    // 1. Scan the formula for PARENTHESIS operations
    // 2. Scan the formula for EXPONENTIALS or ROOTS operations
    // 3. Scan the formula for MULTIPLICATION or DIVISION operations
    // 4. Scan for ADDITIONS or SUBSTRACTIONS

    // 1. Scan the formula for PARENTHESIS operations
    var self = this;

    
    var newFormula  = this.execFirstOrderOperations();

    newFormula.execSecondOrderOperations();
    newFormula.execThirdOrderOperations();
    newFormula.execFourthOrderOperations();

    // this._operands.forEach(function(operand, index){

    //     // Find the parenthesis functions
    //     if(operand.charAt(0) === '(' && operand.slice(-1) === ')' ){
    //         // Found a parenthesis
    //         // Remove the parenthesis
    //         operand = operand.slice(1,-1).trim();

    //         // The parenthesis operand becomes a formula of its own
    //         var subFormula = self._formulaFactory.createFormula(operand, self._variables);
            
    //         // Add it to our formula history logger
    //         self._execHistory.push(subFormula);
    //         // Init the subFormula
    //         subFormula.init();
    //         // get the value of it
    //         var parenthesisValue = subFormula.execute();

    //         // Create a new formula and record a new formula state with the value obtained
    //         self.addState(self._formulaFactory.createFormula() )
    //         // Also update the elements array
    //         self._elements[self._elements.indexOf(self._operands[index])] = parenthesisValue;
    //         self._operands[index] = parenthesisValue;
    //     }
    // });

    // At this point all operands of our formula are either variables or values, no parenthesis

    // 2. Scan the formula for MULTIPLICATION or DIVISION operations
    // for(var i=0; i<this._elements.length; i++){

    //     if( i%2 === 0 ) continue; // We only look for operators on non-even indexes

    //     var operator = this.isOperator( this._elements[i] );

    //     // Stop if found multiplication or division operator
    //     if( operator ){
    //         if( operator === '*' || operator === '/'){
    //             // It is an operator and its multiplication
    //             var execFn = this.getOperatorFunction(operator);

    //             // Run the operation and get the result
    //             var result = self.execOperatorFunction(this._elements[i-1], this._elements[i+1], execFn); // Returns the numeric value for this operation

    //             // Update the formula with the new value removing the operands that took part of the function
    //             this._elements.splice(i-1, 3);
    //             this._elements.splice(i-1, 0, result);

    //             // So if we had something like this :  5 * 8 , now we have replaced those 3 array items with 40

    //             // debugger;

    //             // Reconstruct formula from the elements and create a new Formula object
    //             var newFormula = self._formulaFactory.createFormula(this._elements.join(' '), self._variables);
    //             newFormula.init();

    //             // todo maybe instead of creating new formula iunstances just update the elements and execute it again
    //             // We have to exit the execute function
    //             return newFormula.execute();

    //         }


    //     } else {
    //         // It is not an operator. Formula is not valid
    //         console.log('Operator is not defined');
    //         return false;
    //     }
    // }


    // 3. Scan for any other operations (addition and subtraction)
    // for(var k=0; k<this._elements.length; k++) {

    //     if (k % 2 === 0) continue; // We only look for operators on non-even indexes

    //     var operator = this.isOperator(this._elements[k]);

    //     // Stop if found sum or subtraction operator
    //     if (operator) {
    //         if (operator === '+' || operator === '-') {

    //             var execFn = this.getOperatorFunction(operator);

    //             // Run the operation and get the result
    //             var result = self.execOperatorFunction(this._elements[k - 1], this._elements[k + 1], execFn); // Returns the numeric value for this operation

    //             // Update the formula with the new value removing the operands that took part of the function
    //             this._elements.splice(k - 1, 3);
    //             this._elements.splice(k - 1, 0, result);

    //             // So if we had something like this :  5 + 8 , now we have replaced those 3 array items with 13

    //             // debugger;

    //             // Reconstruct formula from the elements and create a new Formula object
    //             var newFormula = self._formulaFactory.createFormula(this._elements.join(' '), self._variables);
    //             newFormula.init();
    //             // todo maybe instead of creating new formula iunstances just update the elements and execute it again
    //             // We have to exit the execute function
    //             return newFormula.execute();

    //         }


    //     } else {
    //         // It is not an operator. Formula is not valid
    //         console.log('Operator is not defined');
    //         return false;
    //     }


    // }


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

Formula.prototype.execFirstOrderOperations = function(){

    // newElements will be the new elements with the parenthesis values replaced
    var newElements = this._elements,
        foundParenthesis = false
    ;

    for(var i=0; i< this._operands.length; i++){
        var operand = this._operands[i];


        // Find the parenthesis functions
        if(operand.charAt(0) === '(' && operand.slice(-1) === ')' ){
            // Found a parenthesis
            foundParenthesis = true;


            // Remove the parenthesis
            operand = operand.slice(1,-1).trim();

            // The parenthesis operand becomes a formula of its own
            var subFormula = this._formulaFactory.createFormula(operand, this._variables);
            
            // Add it to our formula history logger
            // this._execHistory.push(subFormula);
            // Init the subFormula
            subFormula.init();
            // get the value of it
            var parenthesisValue = subFormula.execute();
      
            // Also update the elements array
            newElements[this._elements.indexOf(this._operands[i])] = parenthesisValue;

        }


    }

    // At this point we have the new elements with the values already replaced
    
    if(foundParenthesis){
        // Build the formula expression out of the elements array and ...
        // Create a new formula and record a new formula state with the value obtained
        var newFormulaState = this._formulaFactory.createFormula(newElements.join(' '), this._variables);
        newFormulaState.init();

        this.addState(newFormulaState);

        return newFormulaState;

    } else {
        return this;
    }
 
 
}


Formula.prototype.execSecondOrderOperations = function(){


    for(var i=0; i< this._elements.length; i++){

        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes
        
        var operator = this.isOperator( this._elements[i] );

        // Stop if found multiplication or division operator
        if( operator ){
            if( operator === '^'){
                // It is an operator and its multiplication
                var execFn = this.getOperatorFunction(operator);                
     
                // Run the operation and get the result
                var result = this.execOperatorFunction(this._elements[i-1], this._elements[i+1], execFn); // Returns the numeric value for this operation
                
                // The elements to construct the new formula from
                var newElements = this._elements;
                
                
                // Update the formula with the new value removing the operands that took part of the function
                newElements.splice(i - 1, 3);
                newElements.splice(i - 1, 0, result);

                // So if we had something like this :  5 + 8 , now we have replaced those 3 array items with 13

                // debugger;

                // Reconstruct formula from the elements and create a new Formula object
                var newFormula = this._formulaFactory.createFormula(newElements.join(' '), this._variables);
                newFormula.init();
                // todo maybe instead of creating new formula iunstances just update the elements and execute it again
                // We have to exit the execute function

                this.addState(newFormula);


                return newFormula.execute();
                
            } else {
                break;
            }

        } else {

            // It is not an operator. Formula is not valid
            console.log('Operator is not defined');
            return false;


        }


    }
}



Formula.prototype.execThirdOrderOperations = function(){
    

    for(var i=0; i< this._elements.length; i++){

        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes
        
        var operator = this.isOperator( this._elements[i] );

        // Stop if found multiplication or division operator
        if( operator ){
            if( operator === '*' || operator === '/' ){

                // It is an operator and its multiplication or division
                var execFn = this.getOperatorFunction(operator);
                
                // Run the operation and get the result
                var result = this.execOperatorFunction(this._elements[i-1], this._elements[i+1], execFn); // Returns the numeric value for this operation
                
                // The elements to construct the new formula from
                var newElements = this._elements;
                
                
                // Update the formula with the new value removing the operands that took part of the function
                newElements.splice(i - 1, 3);
                newElements.splice(i - 1, 0, result);

                // So if we had something like this :  5 + 8 , now we have replaced those 3 array items with 13

                // debugger;

                // Reconstruct formula from the elements and create a new Formula object
                var newFormula = this._formulaFactory.createFormula(newElements.join(' '), this._variables);
                newFormula.init();
                // todo maybe instead of creating new formula iunstances just update the elements and execute it again
                // We have to exit the execute function

                this.addState(newFormula);


                return newFormula.execute();

                
            } else {
                break;
            }

        } else {

            // It is not an operator. Formula is not valid
            console.log('Operator is not defined');
            return false;


        }


    }
}


Formula.prototype.execFourthOrderOperations = function(){
    

    for(var i=0; i< this._elements.length; i++){

        if( i%2 === 0 ) continue; // We only look for operators on non-even indexes
        
        var operator = this.isOperator( this._elements[i] );

        // Stop if found addition or subtraction operators
        if( operator ){
            if( operator === '+' || operator === '-' ){

                var execFn = this.getOperatorFunction(operator);
                
                // Run the operation and get the result
                var result = this.execOperatorFunction(this._elements[i-1], this._elements[i+1], execFn); // Returns the numeric value for this operation
                
                // The elements to construct the new formula from
                var newElements = this._elements;


                // Update the formula with the new value removing the operands that took part of the function
                newElements.splice(i - 1, 3);
                newElements.splice(i - 1, 0, result);

                // So if we had something like this :  5 + 8 , now we have replaced those 3 array items with 13

                // debugger;

                // Reconstruct formula from the elements and create a new Formula object
                var newFormula = this._formulaFactory.createFormula(newElements.join(' '), this._variables);
                newFormula.init();
                // todo maybe instead of creating new formula iunstances just update the elements and execute it again
                // We have to exit the execute function

                this.addState(newFormula);


                return newFormula.execute();

                
            } else {
                break;
            }

        } else {

            // It is not an operator. Formula is not valid
            console.log('Operator is not defined');
            return false;


        }


    }


}




/**
 * Returns a random ID
 */
Formula.prototype.getRandomId = function(){

    // Returns a random id
    // return('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    //     var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    //     return v.toString(16);
    // }));
    return new Date().getUTCMilliseconds();
};

/**
 * Add a formula state
 */
Formula.prototype.addState = function(formulaObj){
    
    // Validate correct input
    if( formulaObj instanceof Formula  === false )
        return false;

    // Add to the states array
    this._state.push(formulaObj);
};



function FormulaFactory(){
    this.createFormula  = function(formula, variables){
        console.log('Creating new formula...');
        return new Formula(formula, variables);
    }
}
