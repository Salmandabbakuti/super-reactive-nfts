import {
  Transfer as TransferEvent,
  SuperUnlockable as SuperUnlockableContract
} from "../super-unlockable/generated/SuperUnlockable/SuperUnlockable";
import { Token } from "../super-unlockable/generated/schema";

export function handleTransfer(event: TransferEvent): void {
  // check if it is mint or burn or transfer
  let token = Token.load(event.params.tokenId.toString());
  if (token == null) {
    token = new Token(event.params.tokenId.toString());
    let contract = SuperUnlockableContract.bind(event.address);
    const tokenUri = contract.try_tokenURI(event.params.tokenId);
    token.uri = tokenUri.reverted ? "" : tokenUri.value;
    token.owner = event.params.to;
    token.createdAt = event.block.timestamp;
  }
  token.owner = event.params.to;
  token.save();
}
