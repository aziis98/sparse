import { parseSExpression } from "./sexpr.ts";

Deno.test(`SExpr.parseSExpr()`, () => {
    console.log(JSON.stringify(
        parseSExpression(`(if 'nil '(list 1 2 "foo") (list 3 4 "bar"))`)
    , null, 4));
});