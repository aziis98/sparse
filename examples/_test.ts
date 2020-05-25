
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseFormattedText, Link, TextFormattingParser } from './text-formatting.ts';
import { Node } from "../parser.ts";

Deno.test(`Simple Markdown`, () => {
    assertEquals(
        parseFormattedText(`This is *an* _example_ with a link to [https://github.com][GitHub]`),
        [
            'This is ',
            new (Node("bold"))("an"),
            ' ',
            new (Node("italic"))("example"),
            ' with a link to ',
            new Link('https://github.com',
            'GitHub')
        ]
    )
})
