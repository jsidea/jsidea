namespace jsidea.model {
    export interface ILoader {
        load(request: Request<any>): void;
    }
}