
import { parseSExpression, parseSExpressionList } from "./s-expr.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test(`SExpr.parseSExpression()`, () => {
    assertEquals(
        parseSExpression(`(if 'nil '(list 1 2 "foo") (list 3 4 "bar"))`),
        [`if`, [`quote`, `nil`], [`quote`, [`list`, 1, 2, `"foo"`]], [`list`, 3, 4, `"bar"`]]
    )
});

Deno.test(`SExpr.parseSExpressionList()`, () => {
    assertEquals(
        parseSExpressionList(`
            (a 1)
            (a 2)
            (b 3)
            (c 3)
            (d "Testing")
        `),
        [
            [`a`, 1],
            [`a`, 2],
            [`b`, 3],
            [`c`, 3],
            [`d`, `"Testing"`],
        ]
    )
});