/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate commercial paper state values
const importState = {
    INVOICE: 1, //importer make notic as new block
    MATCH: 2, //exporter upload doc 
    CONFIRM: 3, //Gov confirm the invocice
    CLEAR: 4, //Customs house confirm declaration, giving premission
    CANCEL: 5, // the request is being cancel
    FINISH: 6   //The imexport is finish
};

/**
 * ImportPaper class extends State class
 * Class will be used by application and smart contract to define a paper
 */
class ImportPaper extends State {

    constructor(obj) {
        super(ImportPaper.getClass(), [obj.importer, obj.paperNumber]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */
    getImporter() {
        return this.importer;
    }

    setImporter(newImporter) {
        this.importer = newImporter;
    }

    getExporter() {
        return this.exporter;
    }

    setExporter(newExporter) {
        this.exporter = newExporter;
    }

    /**
     * Useful methods to encapsulate commercial paper states
     */
    setInvoiced() {
        this.currentState = importState.INVOICE;
    }

    setMatched() {
        this.currentState = importState.MATCH;
    }

    setConfirmed() {
        this.currentState = importState.CONFIRM;
    }

    setCleared() {
        this.currentState = importState.CLEAR;
    }

    setCanceled() {
        this.currentState = importState.CANCEL;
    }
    setFinished() {
        this.currentState = importState.FINISH;
    }

    isInvoiced() {
        return this.currentState === importState.INVOICE;
    }

    isMatched() {
        return this.currentState === importState.MATCH;
    }
    isConfirmed() {
        return this.currentState === importState.CONFIRM;
    }

    isCleared() {
        return this.currentState === importState.CLEAR;
    }
    isCanceled() {
        return this.currentState === importState.CANCEL;
    }

    isFinished() {
        return this.currentState === importState.FINISH;
    }

    static fromBuffer(buffer) {
        return ImportPaper.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to commercial paper
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, ImportPaper);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(importer,exporter, paperNumber, submitDateTime, imaddress, product_category,product,number,productValue) {
        return new ImportPaper({ importer,exporter, paperNumber, submitDateTime, imaddress, product_category,product,number,productValue });
    }

    static getClass() {
        return 'org.papernet.importPaper';
    }
}

module.exports = ImportPaper;
