export enum TokenType {
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
}

export enum EventType {
  TRANSFER = 'Transfer',
  TRANSFER_SINGLE = 'TransferSingle',
  TRANSFER_BATCH = 'TransferBatch',
  ITEM_LISTED = 'ItemListed',
  ITEM_CANCELED = 'ItemCanceled',
  ITEM_BOUGHT = 'ItemBought',
  // TODO: Offer event
}
