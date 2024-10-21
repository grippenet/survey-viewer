import { Expression } from "survey-engine/data_types";

export const expressiontoFunctional = (e: Expression):string => {
    var p : string[];

    if(e.data) {
       p = e.data.map(arg => {
        if(arg.dtype) {
           if(arg.dtype === "exp" && arg.exp) {
                return expressiontoFunctional(arg.exp);
           }
           if(arg.dtype === "num") {
                return '' + arg.num;
           }
        }
        return '"' + arg.str + '"';
       });
    } else {
        p = [];
    }
    return e.name + '(' + p.join(',') + ')';
}