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
        super('org.papernet.importpaper');
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
     * @param {String} exporter exporter
     * @param {Integer} paperNumber paper number for this importer
     * @param {String} submitDateTime import application submittion date
     * @param {String} imaddress importer address
     * @param {String} product product name
     * @param {String} product_category product category
     * @param {Integer} number amount of product
     * @param {Integer} productValue face value of product
    */
    async submit(ctx, importer,exporter, paperNumber, submitDateTime, imaddress, product_category,product,number,productValue) {

        // create an instance of the paper
        let paper = ImportPaper.createInstance(importer,exporter, paperNumber, submitDateTime, imaddress, product_category,product,number,productValue) ;

        // Smart contract, rather than paper, moves paper into INVOICE state
        paper.setInvoiced();

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.paperList.addPaper(paper);

        // Must return a serialized paper to caller of smart contract    
        console.log('Paper:'+ importer + paperNumber + 'is submitted')
        return paper;
    }

    /**
     * match import application 
     *
     * @param {Context} ctx the transaction context
     * @param {String} importer importer
     * @param {Integer} paperNumber paper number for this importer
     * @param {String} exporter exporter name
     * @param {String} exaddress exporter address
    */
   async match(ctx, importer, paperNumber,exporter,exaddress) {

        //load the paper
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        if (paper.getExporter()!=exporter){
            throw new Error('You have no permission on ' + importer + paperNumber);
        }
        if (!paper.isInvoiced()){
            throw new Error('You can not edit the paper' + importer + paperNumber +'at this time.');
        }
        // Smart contract, rather than paper, moves paper into INVOICE state
        paper.setMatched();
        paper.exaddress=exaddress;

        // Add the paper to the list of all similar  papers in the ledger world state
        await ctx.paperList.updatePaper(paper);

        // Must return a serialized paper to caller of smart contract
        console.log('Paper:'+ importer + paperNumber + 'is match by '+exporter)

        return paper;
    }
    async confirm(ctx, importer, paperNumber) {

        //load the paper
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        if (!paper.isMatched()){
            throw new Error('You can not edit the paper' + importer + paperNumber +'at this time.');
        }
        // Smart contract, rather than paper, moves paper into INVOICE state
        paper.setConfirmed();

        // Add the paper to the list of all similar commercial papers in the ledger world state
        await ctx.paperList.updatePaper(paper);

        // Must return a serialized paper to caller of smart contract
        console.log('Paper:'+ importer + paperNumber + 'is confirm by gov and customs')
        return paper;
    }

    /**
     * Cancel application
     *
     * @param {Context} ctx the transaction context
     * @param {String} importer commercial paper importer
     * @param {Integer} paperNumber paper number for this importer
    */
    async cancel(ctx, importer, paperNumber) {

        // Retrieve the current paper using key fields provided
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // Validate is editible
        if (paper.isFinished()) {
            throw new Error('Application ' + importer + paperNumber + 'is finished and cannot cancel');
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
     * @param {String} importer commercial paper importer
     * @param {Integer} paperNumber paper number for this importer
     */
    async query(ctx, importer, paperNumber) {
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);
        return paper;
    }

    /**
     * finish paper
     * 
     * @param {Context} ctx the transaction context
     * @param {Integer} paperNumber paper number for this importer
     */
    async finish(ctx, importer, paperNumber) {

        // Retrieve the current paper using key fields provided
        let paperKey = ImportPaper.makeKey([importer, paperNumber]);
        let paper = await ctx.paperList.getPaper(paperKey);

        // Validate is editible
        if (!paper.isConfirmed()) {
            throw new Error('Application ' + importer + paperNumber + 'cannot finished now');
        }
        paper.setFinished();
        await ctx.paperList.updatePaper(paper);
        console.log('Paper:'+ importer + paperNumber + 'is Finished')
        return paper;
    }
}

module.exports = ImportPaperContract;
