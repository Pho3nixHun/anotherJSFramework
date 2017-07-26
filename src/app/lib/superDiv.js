'use strict';

class Secret {
    get secret() {
        return 'shhh';
    }

    makeItGreen() {
        this.style.backgroundColor = 'green';
    }
}

class SuperDiv extends aggregation(HTMLElement, Secret) {
    constructor() {
        super();
        this.style.backgroundColor = 'red';
        this.style.display = 'inline-block';
        this.style.width = '300px';
        this.style.height = '300px';
    }

    get isItFunky() {
        return true;
    }

    get accessKey() {
        return super.accessKey; // string
    }

    set accessKey(v) {
        super.accessKey = v;
    }

    get accessKeyLabel() {
        return super.accessKeyLabel; // string
    }

    get contentEditable() {
        return super.contentEditable; // true or false as string
    }

    set contentEditable(v) {
        super.contentEditable = v;
    }

    get isContentEditable() {
        return super.isContentEditable; // Boolean
    }

    get dataset() {
        return super.dataset; // DOMStringMap
    }

    get dir() {
        return super.dir; // ltr or rtl or auto as string
    }

    set dir(v) {
        super.dir = dir;
    }

    get dropzone() {
        return super.dropzone; // DOMSettableTokenList
    }

    get contextMenu() {
        return super.contextMenu; // HTMLMenuElement
    }

    set contextMenu(v) {
        super.contextMenu = v;
    }

    get draggable() {
        return super.draggable; // Boolean
    }

    set draggable(v) {
        super.draggable = v;
    }

    get hidden() {
        return super.hidden;  // Boolean
    }

    set hidden(v) {
        super.hidden = v;
    }

    get lang() {
        return super.lang; // string
    }

    set lang(v) {
        super.lang = v;
    }

    get spellcheck() {
        return super.spellcheck; // Boolean
    }

    set spellcheck(v) {
        super.spellcheck = v;
    }

    get style() {
        return super.style;  // CSSStyleDeclaration
    }

    set style(v) {
        super.style = v;
    }

    get tabIndex() {
        return super.tabIndex; // number
    }

    set tabIndex(v) {
        super.tabIndex = v;
    }

    get title() {
        return super.title; // string
    }

    set title(v) {
        super.title = v;
    }

    blur() {
        super.blur();
    }

    click() {
        super.click();
    }

    focus(...args) {
        super.focus(...args);
    }
}