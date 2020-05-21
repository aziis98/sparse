
type OptionalWrapperClass = (new (...token: any[]) => any) | false

export class ParseNode {
    children: any[] = []

    constructor(children: any[]) {
        this.children = children;
    }
}

/**
 * Word: Slice of this.source
 * Token: String inside a layer of the stack or in currentToken
 */
export abstract class Parser {
    private source: string = "";
    private internalStack: any[][] = [[]];
    private currentToken: string = "";
    private pos: number = 0;

    abstract parseSource(): any;

    get stackHead(): string[] {
        return this.internalStack[this.internalStack.length - 1];
    }

    getLineColumn() {
        const linesBefore = this.source.slice(0, this.pos).split('\n');
        return [linesBefore.length, linesBefore[linesBefore.length - 1].length];
    }

    peek(len = 1): string {
        return this.source.slice(this.pos, this.pos + len);
    }

    hasNext(): boolean {
        return this.pos < this.source.length
    }

    parse(source: string) {
        this.source = source;
        this.internalStack = [[]];
        this.currentToken = "";
        this.pos = 0;

        this.parseSource();
        
        this.finalizeToken();
        return this.stackHead;
    }

    
    skip(stepsOrWord: number | string) {
        this.finalizeToken();

        if (typeof stepsOrWord === 'number') {
            this.pos += stepsOrWord
        }
        else if (typeof stepsOrWord === 'string') {
            const newChars = this.step(stepsOrWord.length);
            this.popToken();

            if (stepsOrWord !== newChars) {
                const [line, col] = this.getLineColumn();
                throw `Illegal token '${newChars}' at ${line}:${col}`
            }
        }
    }

    step(steps = 1): string {
        const newChars = this.source.slice(this.pos, this.pos + steps);
        this.currentToken += newChars;
        this.pos += steps;
        return newChars;
    }

    stepUntil(predicate: (char: string, pos: number, source: string) => boolean) {
        this.stepWhile((c, pos, source) => !predicate(c, pos, source))
    }

    stepWhile(predicate: (char: string, pos: number, source: string) => boolean) {
        while (predicate(this.source[this.pos], this.pos, this.source)) {
            this.currentToken += this.source[this.pos];
            this.pos++;
        }
    }

    stepUntilWord(target: string) {
        this.stepUntil(() => this.peek(target.length) === target);
    }

    finalizeToken() {
        if (this.currentToken.length > 0) {
            this.stackHead.push(this.currentToken);
            this.currentToken = "";
        }
    }

    pushToken(token: any) {
        this.finalizeToken();
        this.stackHead.push(token);
    }

    popToken(): any {
        this.finalizeToken();
        return this.stackHead.pop()!;
    }

    pushStack() {
        this.finalizeToken();
        this.internalStack.push([]);
    }

    popStack() {
        this.finalizeToken();
        this.pushToken(this.internalStack.pop()!);
    }

    stack(scope: () => void, WrapperClass: OptionalWrapperClass = false) {
        this.pushStack();
        scope();
        this.popStack();
        
        if (WrapperClass) this.wrapToken(WrapperClass)
    }

    wrapToken(WrapperClass: new (...token: any[]) => any) {
        this.finalizeToken();
        this.stackHead.push(
            new WrapperClass(...this.stackHead.pop()!)
        );
    }

}
