type TransactionDataType = {
  collectionAddress: string;
  args: any;
  eventType: EventType;
  tokenType: TokenType;
  tx: string;
  blockNumber: number;
  timestamp: number;
};

type AddressDetailType = {
  code: number;
  data: {
    addressType: number;
    tokenName: string;
    symbol: string;
    verified: boolean;
    contractCreateAddressHash: string;
  };
  message: string;
};
