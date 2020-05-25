import { Parser, Node, Compound } from "../parser.ts";

export class SExpressionParser extends Parser {

    static STRING = /".+?"/;
    static IDENTIFIER = /[^\s()]+/;
    static NUMBER = /[0-9](\.[0-9]*)?/;

    parseLitteral() {
        if (this.stepByRegex(SExpressionParser.NUMBER)) {
            const token = this.popToken();
            this.pushToken(parseFloat(token));
            this.wrapToken(Node('number'));
        } else if (this.stepByRegex(SExpressionParser.STRING)) {
            const token = this.popToken();
            this.pushToken(token.slice(1, token.length - 1));
            this.wrapToken(Node('string'));
        } else if (this.stepByRegex(SExpressionParser.IDENTIFIER)) {
            this.wrapToken(Node('identifier'));
        } else {
            const [line, col] = this.getLineColumn();
            throw new Error(`Illegal token "${this.peek()}" at ${line}:${col}`)
        }
    }

    parseList() {
        this.skip('(');
        this.stack(() => {
            while (this.hasNext({ except: ')' })) {
                
                this.stepByRegex(/\s+/);
                this.popToken();
                
                let isQuoted = false;

                if (this.peek() === "'") {
                    isQuoted = true;
                    this.skip("'");
                }

                if (this.peek() === '(') {
                    this.parseList();
                } else {
                    this.parseLitteral();
                }

                if (isQuoted) {
                    this.wrapToken(Node('quote'));
                }

                this.stepByRegex(/\s+/);
                this.popToken();
            }
        })
        this.skip(')');
    }

    parseSource() {
        this.parseList();
    }
}

export function parseSExpression(source: string) {
    return new SExpressionParser().parse(source);
}
