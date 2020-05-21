
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseFormattedText, Bold, Italic } from './text-formatting.js';

Deno.test(`Simple Markdown`, () => {

    assertEquals(
        parseFormattedText(`This is *an* _example_`),
        ['This is ', new Bold(['an']), ' ', new Italic('example')]
    )

})
