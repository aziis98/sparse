
export class Record<T> {
    
    constructor(descriptor: Partial<T>) {
        Object.assign(this, descriptor);
    }

    equals(other: T) {
        for (let [key, value] of Object.entries(this)) {
            return (other as any)[key] === value;
        }
    }

    copy(descriptor: Partial<T>) {
        return new T()
    }

}

