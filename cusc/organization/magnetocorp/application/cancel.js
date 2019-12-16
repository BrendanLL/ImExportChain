/*
SPDX-License-Identifier: Apache-2.0
*/

/*
 * This application has 6 basic steps:
 * 1. Select an identity from a wallet
 * 2. Connect to network gateway
 * 3. Access PaperNet network
 * 4. Construct request to issue commercial paper
 * 5. Submit transaction
 * 6. Process response
 */

'use strict';

// Bring key classes into scope, most importantly Fabric SDK network class
const fs = require('fs');
const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const importPaper = require('../contract/lib/paper.js');

// A wallet stores a collection of identities for use
//const wallet = new FileSystemWallet('../user/isabella/wallet');
const wallet = new FileSystemWallet('../identity/user/isabella/wallet');

// Main program function
async function main() {

    // A gateway defines the peers used to access Fabric networks
    const gateway = new Gateway();

    // Main try/catch block
    try {

        // Specify userName for network access
        // const userName = 'isabella.importer@magnetocorp.com';
        const userName = 'User1@org1.example.com';

        // Load connection profile; will be used to locate a gateway
        let connectionProfile = yaml.safeLoad(fs.readFileSync('../gateway/networkConnection.yaml', 'utf8'));

        // Set connection options; identity and wallet
        let connectionOptions = {
            identity: userName,
            wallet: wallet,
            discovery: { enabled:false, asLocalhost: true }
        };

        // Connect to gateway using application specified parameters
        console.log('Connect to Fabric gateway.');

        await gateway.connect(connectionProfile, connectionOptions);

        // Access PaperNet network
        console.log('Use network channel: mychannel.');

        const network = await gateway.getNetwork('mychannel');

        // Get addressability to commercial paper contract
        console.log('Use org.papernet.importpaper smart contract.');

        const contract = await network.getContract('papercontract');

        // import commercial paper
        console.log('Submit paper import transaction.');

        const importResponse = await contract.submitTransaction('cancel', 'MagnetoCorp', '00003');

        // process response
        console.log('Process import transaction response.'+importResponse);

        let paper = importPaper.fromBuffer(importResponse);

        console.log(`Importer: ${paper.importer} paper : ${paper.paperNumber} state: ${paper.currentState}`);
        console.log('Transaction complete.');

    } catch (error) {

        console.log(`Error processing transaction. ${error}`);
        console.log(error.stack);

    } finally {

        // Disconnect from the gateway
        console.log('Disconnect from Fabric gateway.');
        gateway.disconnect();

    }
}
main().then(() => {

    console.log('submit program complete.');

}).catch((e) => {

    console.log('submit program exception.');
    console.log(e);
    console.log(e.stack);
    process.exit(-1);

});