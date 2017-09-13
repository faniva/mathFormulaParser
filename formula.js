/**
 *  Takes a math expression as a string and converts it into an executable math operation
 * @param formula
 * @constructor
 */
function Formula(formula){
    
    this._formula = formula;
    this._operands = [];
    this._operators = [];
    this._variables = [];

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
    this.getOperandsRecursive(formula)
};

Formula.prototype.getOperandsRecursive = function(substr){

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
        this._operands.push( substr.slice(0, indexAt).trim()  );
        this.getOperandsRecursive( substr.slice(indexAt+1).trim()  )
    } else {
        this._operands.push( substr.slice(0) );
    }
};
    