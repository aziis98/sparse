
type OptionalWrapperClass = (new (...token: any[]) => any) | false

export class ParseNode {
    children: any[] = []

    constructor(children: any[]) {
        this.children = children;
    }
}

export abstract class Parser {
    private source: string = "";
    private internalStack: any[][] = [[]];
    private tokenCurrent: string = "";
    private pos: number = 0;

    abstract parseSource(): any;

    parse(source: string) {
        this.source = source;
        this.internalStack = [[]];
        this.tokenCurrent = "";
        this.pos = 0;

        this.parseSource();
        
        this.finalizeToken();
        return this.stackHead;
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

    skip(stepsOrToken: number | string) {
        this.finalizeToken();

        if (typeof stepsOrToken === 'number') {
            this.pos += stepsOrToken
        }
        else if (typeof stepsOrToken === 'string') {
            const newChars = this.stepToken(stepsOrToken.length);
            this.popToken();

            if (stepsOrToken !== newChars) {
                const [line, col] = this.getLineColumn();
                throw `Illegal token '${newChars}' at ${line}:${col}`
            }
        }
    }

    stepToken(steps = 1): string {
        const newChars = this.source.slice(this.pos, this.pos + steps);
        this.tokenCurrent += newChars;
        this.pos += steps;
        return newChars;
    }

    stepTokenUntil(predicate: (char: string) => boolean) {
        const startPos = this.pos;

        while (predicate(this.source[this.pos])) {
            this.tokenCurrent += this.source[this.pos];
            this.pos++;
        }

        // return this.source.slice(startPos, this.pos);
    }

    get stackHead(): string[] {
        return this.internalStack[this.internalStack.length - 1];
    }

    finalizeToken() {
        if (this.tokenCurrent.length > 0) {
            this.stackHead.push(this.tokenCurrent);
            this.tokenCurrent = "";
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
