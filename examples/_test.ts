
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { parseFormattedText, Bold, Italic, Link } from './text-formatting.ts';

Deno.test(`Simple Markdown`, () => {
    assertEquals(
        parseFormattedText(`This is *an* _example_ with a link to [https://github.com][GitHub]`),
        ['This is ', new Bold('an'), ' ', new Italic('example'), ' with a link to ', new Link('https://github.com', 'GitHub')]
    )
})
