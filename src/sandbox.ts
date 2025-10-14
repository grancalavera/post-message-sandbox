import { Subject } from "rxjs";
console.log("ok computer");
const source$ = new Subject<string>();
console.log(source$.observed);
