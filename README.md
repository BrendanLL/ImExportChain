# ImExportChain
TO reproduce the demo
## 1. Set up the Envirment
    Go to https://hyperledger-fabric.readthedocs.io/en/release-1.4/tutorial/commercial_paper.html#download-samples and set up the Prerequisites envirnment

## 2. Download the code
    ```bash
    $git clone$
    ```

## 3. Start the network
    ```bash
    cd ImExportChain/basic-network
    ./start.sh
    ```
    It will create a channel and peer 

    And start the client
    ```
    cd ImExportChain/organization/magnetocorp/configuration/cli/
    docker-compose -f docker-compose.yml up -d cliMagnetoCorp
    ```

## 4. Start the chaincode
    First, start the docker monitor first 
    ```bash
    cd ImExportChain/organization/magnetocorp/configuration/cli/
    ./monitordocker.sh net_basic
    ```
    Then, install and instantiate the chiancode
    ```bash
    cd ImExportChain/organization/magnetocorp/contract
    docker exec cliMagnetoCorp peer chaincode install -n papercontract -v 0 -p /opt/gopath/src/github.com/contract -l node
    docker exec cliMagnetoCorp peer chaincode instantiate -n papercontract -v 0 -l node -c '{"Args":["org.papernet.importpaper:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"
    ```
## 5. Start play with the chaincode and blockchain
    There is some script locate at 
    ```bash
    cd ImExportChain/organization/magnetocorp/application
    ```

    ```bash
    npm install
    ``` 
    before use

