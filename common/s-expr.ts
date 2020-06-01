import { Parser, Node } from "../parser.ts";

const STRING = /".+?"/;
const IDENTIFIER = /[^\s()]+/;
const NUMBER = /[0-9]+\.?[0-9]*/;

export class SExpressionParser extends Parser {

    parseLitteral() {
        [
            {
                regex: NUMBER,
                transform: (token: string) => parseFloat(token)
            },
            {
                regex: STRING,
                transform: (token: string) => token //.slice(1, token.length - 1)
            },
            {
                regex: IDENTIFIER,
                transform: (token: string) => token
            }
        ].find(
            ({ regex, transform }) => {
                const m = this.stepByRegex(regex) 
                if (m) this.pushToken(transform(this.popToken()))
                return !!m;
            }
        ) || this.throwUnexpectedSequence(this.peek())
    }

    parseList() {
        this.skip('(');
        this.stack(() => {
            while (this.hasNext({ except: ')' })) {

                this.skipByRegex(/\s*/);

                let isQuoted = false;

                if (this.peek() === "'") {
                    isQuoted = true;
                    this.skip("'");
                    this.pushStack();
                    this.pushToken("quote");
                }

                if (this.peek() === '(')
                    this.parseList();
                else 
                    this.parseLitteral();

                if (isQuoted) this.popStack();

                this.skipByRegex(/\s*/);
            }
        })
        this.skip(')');
    }

    parseSource() {
        this.parseList();
    }
}

export function parseSExpression(source: string) {
    return new SExpressionParser().parse(source)[0];
}

export function parseSExpressionList(source: string) {
    return new SExpressionParser().parse(`(${source})`)[0];
}
