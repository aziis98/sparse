
import { Parser, ParseNode } from "../parser.ts";

type Cases<T> = Record<string, T | undefined>;

export class Bold extends ParseNode {
    text: string;

    constructor(boldText: string) {
        super([ boldText ]);
        this.text = boldText;
    }
}

export class Italic extends ParseNode {
    text: string;
    
    constructor(italicText: string) {
        super([ italicText ]);
        this.text = italicText;
    }
}

export class Link extends ParseNode {
    uri: string;
    label: string;
    
    constructor(uri: string, label: string) {
        super([ uri, label ]);

        this.uri = uri;
        this.label = label;
    }
}

export class TextFormattingParser extends Parser {

    parseBold() {
        this.skip('*');
        this.stack(() => {
            this.stepTokenUntil(c => c !== '*');
        }, Bold);
        this.skip('*');
    }

    parseItalic() {
        this.skip('_');
        this.stack(() => {
            this.stepTokenUntil(c => c !== '_');
        }, Italic);
        this.skip('_');
    }

    parseLink() {
        this.skip('[');
        this.stack(() => {
            this.stepTokenUntil(c => c !== ']');
            this.skip(']');
            this.skip('[');
            this.stepTokenUntil(c => c !== ']');
        }, Link);
        this.skip(']');
    }

    parseSource() {
        while(this.hasNext()) {

            const char = this.peek();

            const fn = (<Cases<() => void>> {
                '*': () => this.parseBold(),
                '_': () => this.parseItalic(),
                '[': () => this.parseLink()
            })[char];

            fn ? fn() : this.stepToken();

        }
    }

}

export function parseFormattedText(source: string) {
    return new TextFormattingParser().parse(source);
}