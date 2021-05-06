# RisiSwap Farming

dependencies :
https://nodejs.org/en/
https://www.trufflesuite.com/ganache

npm install --g truffle => installer en global truffle

une fois dans le repo : 
npm install

truffle compile => compile les smart contracts
truffle migrate => deploie les smart contracts

truffle migrate --network development -> deploie sur le test local ganache
truffle migrate --network testnet -> deploie sur le test net bsc

truffle console -> console js pour jouer avec les contracts directement dans la blockchain

truffle migrate --reset => deploie en ecrasant les anciens contracts 
truffle test => lancer les tests

truffle exec scripts/script.js => launch scripts

@truffle/hdwallet-provider": "^1.2.2 => plus recent bug


Config metamask : 
rajouter le reseau Ganache (defaut : HTTP://127.0.0.1:7545  id: 1337)

Creer un flat pour le verify -> truffle-flattener RisiToken.sol --output RisiTokenFlat.sol 
ensuite go remix et regler les bugs (virer les SPDX et le Context.sol abstract)
Ajouter un nouveau compte
En cliquant sur l'avatar du compte dans metamask -> Importer un compte -> copié collé la clefs privée de la seconde ligne ganache
## local deploy
truffle migrate --reset

## Testnet deploy
truffle migrate --network testnet --reset
- RisiToken: [0xB4e50995f531913a1593241eF6D730Ca5A071aba](https://testnet.bscscan.com/address/0xB4e50995f531913a1593241eF6D730Ca5A071aba)
- MasterChef: [0x849EB9248920672501d2F389e4cA2b6b2711BC11](https://testnet.bscscan.com/address/0x849EB9248920672501d2F389e4cA2b6b2711BC11)

## Prod deploy

Change operator of risiToken contract to MasterChef

risi need to approve operator (masterchef)


## Notes :

TimeLock _admin : ??
MasterChef owner : Timelock -> appeler les function owner via execute Transaction ? or queueTransaction ?  deposit with 0 amount is "claim"



## Deployed Contracts

- RisiToken: [0x1f546ad641b56b86fd9dceac473d1c7a357276b7](https://bscscan.com/address/0x1f546ad641b56b86fd9dceac473d1c7a357276b7)
- MasterChef: [0x058451c62b96c594ad984370eda8b6fd7197bbd4](https://bscscan.com/address/0x058451c62b96c594ad984370eda8b6fd7197bbd4)
