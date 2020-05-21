export abstract class Parser {
    private source: string = "";
    private stack: string[][] = [[]];
    private tokenCurrent: string = "";
    private pos: number = 0;

    abstract parse(source: string): any;

    initialize(source: string) {
        this.source = source;
        this.stack = [[]];
        this.tokenCurrent = "";
        this.pos = 0;
    }

    getLineColumn() {
        const linesBefore = this.source.slice(0, this.pos).split('\n');
        return [linesBefore.length, linesBefore[linesBefore.length - 1].length];
    }

    peek(len = 1) {
        return this.source.slice(this.pos, this.pos + len);
    }

    consume(stepsOrToken: number | string) {
        this.tokenFinalize();

        if (typeof stepsOrToken === 'number') {
            this.tokenStep(stepsOrToken)
        }
        else if (typeof stepsOrToken === 'string') {
            const newChars = this.tokenStep(stepsOrToken.length);
            
            if(stepsOrToken !== newChars) {
                const [line, col] = this.getLineColumn();
                throw `Illegal token '${newChars}' at ${line}:${col}`
            }
        }
    }

    tokenStep(steps = 1): string {
        const newChars = this.source.slice(this.pos, this.pos + steps);
        this.tokenCurrent += newChars;
        this.pos += steps;
        return newChars;
    }

    tokenStepUntil(predicate: (char: string) => boolean) {
        while (predicate(this.source[this.pos])) {
            this.tokenCurrent += this.source[this.pos];
            this.pos++;
        }
    }

    get stackCurrent(): string[] {
        return this.stack[this.stack.length - 1];
    }

    tokenFinalize() {
        if (this.tokenCurrent.length > 0) {
            this.stackCurrent.push(this.tokenCurrent);
            this.tokenCurrent = "";
        }
    }

    tokenPush(token: string) {
        this.tokenFinalize();
        this.stackCurrent.push(token);
    }

    tokenPop(): string {
        this.tokenFinalize();
        return this.stackCurrent.pop()!;
    }

    stackPush() {
        this.tokenFinalize();
        this.stack.push([]);
    }

    stackPop(): string[] {
        this.tokenFinalize();
        return this.stack.pop()!;
    }

}
