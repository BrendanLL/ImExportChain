/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const ImportPaper = require('./paper.js');
const PaperList = require('./paperlist.js');

/**
 * A custom context provides easy access to list of all commercial papers
 */
class ImportPaperContext extends Context {

    constructor() {
        super();
        // All papers are held in a list of papers
        this.paperList = new PaperList(this);
    }

}

/**
 * Define commercial paper smart contract by extending Fabric Contract class
 *
 */
class ImportPaperContract extends Contract {

    constructor() {
        // Unique name when multiple contracts per chaincode file
        super('org.papernet.importPaper');
    }

    /**
     * Define a custom context for commercial paper
    */
    createContext() {
        return new ImportPaperContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the contract');
    }

    /**
     * submit import application 
     *
     * @param {Context} ctx the transaction context
     * @param {String} importer importer
     * @param {Integer} paperNumber paper number for this importer
     * @param {String} exaddress exporter address
    */
    async match(ctx, importer, paperNumber,exaddress) {

        //load the paper
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        if (paper.getExporter()!='DigiBank'){
            throw new Error('You have no permission on ' + importer + paperNumber);
        }
        if (!paper.isInvoiced()){
            throw new Error('You can not edit the paper' + importer + paperNumber +'at this time.');
        }
        // Smart contract, rather than paper, moves paper into INVOICE state
        paper.setMatched();
        paper.exaddress=exaddress;

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.paperList.updatePaper(paper);

        // Must return a serialized paper to caller of smart contract
        return paper;
    }

    /**
     * Cancel application
     *
     * @param {Context} ctx the transaction context
     * @param {String} importer commercial paper importer
     * @param {Integer} paperNumber paper number for this importer
     * @param {String} submitDateTime import application submittion date
     * @param {String} maturityDateTime paper maturity date
     * @param {Integer} faceValue face value of paper
    */
    async cancel(ctx, importer, paperNumber) {

        // Retrieve the current paper using key fields provided
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // Validate is editible
        if (paper.isFinished()) {
            throw new Error('Application ' + importer + paperNumber + 'is finished and cannot cancel');
        }
        if (paper.getExporter()!='DigiBank') {
            throw new Error('You are not the importer of Application ' + importer + paperNumber + ', you have no permission to cancel');
        }
        paper.setCanceled();
        await ctx.paperList.updatePaper(paper);
        console.log('Paper:'+ importer + paperNumber + 'is canceled')
        return paper;
    }

    /**
     * Query paper
     * 
     * @param {Context} ctx the transaction context
     * @param {Integer} paperNumber paper number for this importer
     */
    async query(ctx, importer, paperNumber) {
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);
        return paper;
    }
}

module.exports = ImportPaperContract;
