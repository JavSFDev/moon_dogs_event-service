import { ethers } from 'ethers';
import { EventType } from '../enums/base.enum';

import * as ERC721ABI from './erc721.json';
import * as ERC1155ABI from './erc1155.json';
import * as MarketContractABI from './marketcontract.json';

export { ERC721ABI, ERC1155ABI, MarketContractABI };

export const ABI = {
  [EventType.TRANSFER]:
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  [EventType.TRANSFER_SINGLE]:
    'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  [EventType.TRANSFER_BATCH]:
    'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
  [EventType.ITEM_LISTED]:
    'event ItemListed(address indexed seller, address indexed nftAddress, uint256 indexed tokenId, uint256 price)',
  [EventType.ITEM_CANCELED]:
    'event ItemCanceled(address indexed seller, address indexed nftAddress, uint256 indexed tokenId)',
  [EventType.ITEM_BOUGHT]:
    'event ItemBought(address indexed buyer, address indexed seller, address indexed nftAddress, uint256 tokenId, uint256 price)',
};

export const TOPIC = {
  [EventType.TRANSFER]: ethers.utils.id('Transfer(address,address,uint256)'),
  [EventType.TRANSFER_SINGLE]: ethers.utils.id(
    'TransferSingle(address,address,address,uint256,uint256)',
  ),
  [EventType.TRANSFER_BATCH]: ethers.utils.id(
    'TransferBatch(address,address,address,uint256[],uint256[])',
  ),
  [EventType.ITEM_LISTED]: ethers.utils.id(
    'ItemListed(address,address,uint256,uint256)',
  ),
  [EventType.ITEM_CANCELED]: ethers.utils.id(
    'ItemCanceled(address,address,uint256)',
  ),
  [EventType.ITEM_BOUGHT]: ethers.utils.id(
    'ItemBought(address,address,address,uint256,uint256)',
  ),
};
