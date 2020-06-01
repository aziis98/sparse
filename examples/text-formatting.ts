import { Parser, Node, IParseExcept } from "../parser.ts";

export class Link {
    uri: string;
    label: string;
    
    constructor(uri: string, label: string) {
        this.uri = uri;
        this.label = label;
    }
}

export class TextFormattingParser extends Parser {

    parseBold() {
        this.skip('*');
        this.stack(() => this.stepUntilWord('*'), Node("bold"));
        this.skip('*');
    }

    parseItalic() {
        this.skip('_');
        this.stack(() => this.stepUntilWord('_'), Node("italic"));
        this.skip('_');
    }

    parseLink() {
        this.skip('[');
        this.stack(() => {
            this.stepUntilWord(']');
            this.skip(']');
            this.skip('[');
            this.stepUntilWord(']');
        }, Link);
        this.skip(']');
    }

    parseFormattedText({ except }: IParseExcept = {}) {
        while(this.hasNext({ except })) {
            //@ts-ignore
            const fn = ({
                '*': () => this.parseBold(),
                '_': () => this.parseItalic(),
                '[': () => this.parseLink()
            })[this.peek()];

            fn ? fn() : this.step();
        }
    }

    parseSource() {
        this.parseFormattedText()
    }
}

export function parseFormattedText(source: string) {
    return new TextFormattingParser().parse(source);
}
