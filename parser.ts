
type OptionalWrapperClass = (new (...token: any[]) => any) | false

export function Node<T = string>(name: string) {
    return class ParseNode {
        text: T;
        name: string;

        constructor(text: T) {
            this.text = text;
            this.name = name;
        }
    };
}

export function Compound(name: string) {
    return class CompoundNode {    
        children: any[]
        name: string
        
        constructor(...children: any[]) {
            this.children = [...children];
            this.name = name;
        }
    };
}

export type IParseExcept = { except?: string } 

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

    parse(source: string) {
        this.source = source;
        this.internalStack = [[]];
        this.currentToken = "";
        this.pos = 0;

        this.parseSource();
        
        this.finalizeToken();
        return this.stackHead;
    }

    // Getters //

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

    hasNext({ except }: { except?: string } = {}): boolean {
        return this.pos < this.source.length && (!except || this.peek(except.length) !== except);
    }

    // Skipping Function //
    
    /**
     * Step the cursor by the given number of characters without adding 
     * them to the current token.
     * 
     * @param stepsOrWord Number of characters to skip or expected word
     */
    skip(stepsOrWord: number | string) {
        this.finalizeToken();

        if (typeof stepsOrWord === 'number') {
            this.pos += stepsOrWord
        }
        else if (typeof stepsOrWord === 'string') {
            const newChars = this.step(stepsOrWord.length);
            this.popToken();

            if (stepsOrWord !== newChars) {
                this.throwUnexpectedSequence(stepsOrWord, newChars)
            }
        }
    }

    skipUntil(predicate: (char: string, pos: number, source: string) => boolean) {
        this.skipWhile((c, pos, source) => !predicate(c, pos, source))
    }

    skipWhile(predicate: (char: string, pos: number, source: string) => boolean) {
        this.finalizeToken();
        while (predicate(this.source[this.pos], this.pos, this.source)) {
            this.pos++;
        }
    }

    skipByRegex(regex: RegExp) {
        const stickyRegex = new RegExp(regex, 'y');
        stickyRegex.lastIndex = this.pos;

        const m = stickyRegex.exec(this.source);

        if (m) 
            this.skip(m[0].length);
        else 
            this.throwUnexpectedSequence(regex.toString(), this.peek());

        return m;
    }

    // Stepping Functions //

    /**
     * Step the cursor by the given number of characters and adds
     * them to the current token.
     * 
     * @param steps Number of charactes to add to the current token.
     */
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

    stepByRegex(regex: RegExp) {
        const stickyRegex = new RegExp(regex, 'y');
        stickyRegex.lastIndex = this.pos;

        const m = stickyRegex.exec(this.source);

        if (m) this.step(m[0].length);

        return m;
    }

    // Stack Manipulation //

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
        if (this.currentToken.length > 0) {
            this.finalizeToken();
        }
        
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

    unwrapToken() {
        this.finalizeToken();
        this.popToken().forEach((t: any) => this.pushToken(t));
    }

    stack(scope: () => void, WrapperClass: OptionalWrapperClass = false) {
        this.pushStack();
        scope();
        this.popStack();
        
        if (WrapperClass) {
            this.finalizeToken();
            this.stackHead.push(
                new WrapperClass(...this.stackHead.pop()!)
            );
        }
    }

    wrapToken(WrapperClass: new (token: any) => any) {
        this.finalizeToken();
        this.stackHead.push(
            new WrapperClass(this.stackHead.pop()!)
        );
    }

    // Errors

    throwUnexpectedSequence(expected: string, got: string = this.peek()) {
        const [line, col] = this.getLineColumn();
        throw new Error(`Illegal token "${got}", expected "${expected}" at ${line}:${col}`);
    }

    debugStack() {
        console.log(`Currenttoken: "${this.currentToken}"(${this.currentToken.length})`)
        console.log('Stack:')
        this.internalStack.forEach(layer => {
            console.log(JSON.stringify(layer, null, 2));
        });
    }
}
