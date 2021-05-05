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

Ajouter un nouveau compte
En cliquant sur l'avatar du compte dans metamask -> Importer un compte -> copié collé la clefs privée de la seconde ligne ganache

## Prod deploy

Change operator of risiToken contract to MasterChef

risi need to approve operator (masterchef)


## Deployed Contracts

- RisiToken: [0x1f546ad641b56b86fd9dceac473d1c7a357276b7](https://bscscan.com/address/0x1f546ad641b56b86fd9dceac473d1c7a357276b7)
- MasterChef: [0x058451c62b96c594ad984370eda8b6fd7197bbd4](https://bscscan.com/address/0x058451c62b96c594ad984370eda8b6fd7197bbd4)
- RisiReferral: [0xbb688307a13e5abbd99ee4d6229272a17d60fe34](https://bscscan.com/address/0xbb688307a13e5abbd99ee4d6229272a17d60fe34)
- Timelock: [0xe6a8f0269d6af307a908ecd3938f470db7a56daa](https://bscscan.com/address/0xe6a8f0269d6af307a908ecd3938f470db7a56daa)
