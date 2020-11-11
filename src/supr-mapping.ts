import { Address, BigInt, Bytes, JSONValueKind, ipfs, json, log } from '@graphprotocol/graph-ts'

import {
  SupeRare,
  WhitelistCreator as WhitelistCreatorEvent,
  Bid as BidEvent,
  AcceptBid as AcceptBidEvent,
  CancelBid as CancelBidEvent,
  Sold as SoldEvent,
  SalePriceSet as SalePriceSetEvent,
  Transfer as TransferEvent,
  Approval as ApprovalEvent,
} from '../generated/SupeRare/SupeRare'

import { Account, BidLog, Nft, SaleLog } from '../generated/schema'
import { buildCountFromNFT, buildCountFromSale } from './modules/count'
const GENESIS_ADDRESS = '0x0000000000000000000000000000000000000000'

export function handleWhitelistCreator(event: WhitelistCreatorEvent): void {
  let account = getOrCreateAccount(event.params._creator, false)
  account.isCreator = true

  account.save()
}

export function handleBid(event: BidEvent): void {
  let ID = "supr-" + event.params._tokenId.toString()
  let nft = Nft.load(ID)

  if (nft != null) {
    let bidder = getOrCreateAccount(event.params._bidder)

    // Persist bid log
    let bid = new BidLog(ID + '-' + bidder.id + '-' + event.block.timestamp.toString())
    bid.amount = event.params._amount
    bid.bidder = bidder.id
    bid.nft = nft.id
    bid.token = nft.token
    bid.timestamp = event.block.timestamp

    bid.save()

    // Update current bidder
    nft.currentBid = bid.id

    nft.save()
  }
}

export function handleAcceptBid(event: AcceptBidEvent): void {
  // TODO
}

export function handleCancelBid(event: CancelBidEvent): void {
  // TODO
}

export function handleSold(event: SoldEvent): void {
  let ID = "supr-" + event.params._tokenId.toString()
  let nft = Nft.load(ID)

  if (nft != null) {
    let buyer = getOrCreateAccount(event.params._buyer)
    let seller = getOrCreateAccount(event.params._seller)

    // Persist sale log
    let sale = new SaleLog(ID + '-' + buyer.id + '-' + seller.id + '-' + event.block.timestamp.toString())
    sale.amount = event.params._amount
    sale.buyer = buyer.id
    sale.nft = nft.id
    sale.token = nft.token
    sale.seller = seller.id
    sale.timestamp = event.block.timestamp

    sale.save()

    // Transfer nft to buyer
    nft.owner = buyer.id
    nft.salePrice = BigInt.fromI32(0)

    nft.save()
    
    let metric = buildCountFromSale(sale)
    metric.save()
  }
}

export function handleSalePriceSet(event: SalePriceSetEvent): void {
  let ID = "supr-" + event.params._tokenId.toString()
  let nft = Nft.load(ID)

  if (nft != null) {
    nft.salePrice = event.params._price

    nft.save()
  }
}

export function handleTransfer(event: TransferEvent): void {
  let account = getOrCreateAccount(event.params._to)
  let ID = "supr-" + event.params._tokenId.toString()

  if (event.params._from.toHex() == GENESIS_ADDRESS) {
    // Mint token
    let nft = new Nft(ID)
    nft.creator = account.id
    nft.owner = nft.creator
    nft.token = event.address
    nft.symbol = "SUPR"
    nft.tokenId = event.params._tokenId
    nft.tokenURI = SupeRare.bind(event.address).tokenURI(event.params._tokenId)

    nft.created = event.block.timestamp
    nft.save()
    readNftData(nft as Nft).save()
  } else {
    let nft = Nft.load(ID)

    if (nft != null) {
      if (event.params._to.toHex() == GENESIS_ADDRESS) {
        // Burn token
        nft.removed = event.block.timestamp
      } else {
        // Transfer token
        nft.owner = account.id
        nft.modified = event.block.timestamp
      }

      nft.save()
      let metric = buildCountFromNFT(nft as Nft)
      metric.save()
    } else {
      log.warning('Nft #{} not exists', [ID])
    }
  }
}

export function handleApproval(event: ApprovalEvent): void {
  // TODO
}

function getOrCreateAccount(address: Address, persist: boolean = true): Account {
  let accountAddress = address.toHex()
  let account = Account.load(accountAddress)

  if (account == null) {
    account = new Account(accountAddress)
    account.address = address
  }

  if (persist) {
    account.save()
  }

  return account as Account
}

function readNftData(nft: Nft): Nft {
  let hash = getIpfsHash(nft.tokenURI)

  if (hash != null) {
    let raw = ipfs.cat(hash)

    if (raw != null) {
      let value = json.fromBytes(raw as Bytes)

      if (value.kind == JSONValueKind.OBJECT) {
        let data = value.toObject()

        if (data.isSet('name')) {
          nft.name = data.get('name').toString()
        }

        if (data.isSet('description')) {
          nft.description = data.get('description').toString()
        }

        if (data.isSet('yearCreated')) {
          nft.yearCreated = data.get('yearCreated').toString()
        }

        if (data.isSet('createdBy')) {
          nft.createdBy = data.get('createdBy').toString()
        }

        if (data.isSet('image')) {
          nft.imageUri = data.get('image').toString()
          nft.imageHash = getIpfsHash(nft.imageUri)
        }
      }
    }
  }

  return nft
}

function getIpfsHash(uri: string | null): string | null {
  if (uri != null) {
    let hash = uri.split('/').pop()

    if (hash != null && hash.startsWith('Qm')) {
      return hash
    }
  }

  return null
}
