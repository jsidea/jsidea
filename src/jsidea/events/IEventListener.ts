module jsidea.events {
    export interface IEventListener extends Function {
        (e?: Event): any;
    }
}