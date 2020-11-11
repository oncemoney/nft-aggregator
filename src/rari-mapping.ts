import { Address, BigInt, Bytes, JSONValueKind, ipfs, json, log } from '@graphprotocol/graph-ts'

import { Account, Nft, SaleLog } from '../generated/schema'
import { buildCountFromNFT, buildCountFromSale } from './modules/count'

import {
  Rarible,
  Transfer as RariTransfer
} from "../generated/Rarible/Rarible"

import {
  Buy,
} from "../generated/RariSale/RariSale"


const GENESIS_ADDRESS = '0x0000000000000000000000000000000000000000'



export function handleRariTransfer(event: RariTransfer): void {
  let account = getOrCreateAccount(event.params.to)
  let ID = "rari-" + event.params.tokenId.toString() 

  if (event.params.from.toHex() == GENESIS_ADDRESS) {
    // Mint token
    let nft = new Nft(ID)
    nft.creator = account.id
    nft.owner = nft.creator
    nft.token = event.address
    nft.symbol = "RARI"
    nft.tokenId = event.params.tokenId
    nft.tokenURI = getTokenURI(event)

    nft.created = event.block.timestamp
    nft.save()
    readNftData(nft as Nft).save()
  } else {
    let nft = Nft.load(ID)

    if (nft != null) {
      if (event.params.to.toHex() == GENESIS_ADDRESS) {
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


export function handleRariSold(event: Buy): void {
  let ID = "rari-" + event.params.tokenId.toString() 
  let nft = Nft.load(ID)

  if (nft != null) {
    let buyer = getOrCreateAccount(event.params.buyer)
    let seller = getOrCreateAccount(event.params.seller)

    // Persist sale log
    let sale = new SaleLog(ID + '-' + buyer.id + '-' + seller.id + '-' + event.block.timestamp.toString())
    sale.amount = event.params.price
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
  } else {
    log.warning('nft #{} not exists', [ID])
  }
}



// HELPERS

export function getTokenURI(event: RariTransfer): string {
  let erc721 = Rarible.bind(event.address)
  let tokenURICallResult = erc721.try_tokenURI(event.params.tokenId)

  let tokenURI = ''

  if (tokenURICallResult.reverted) {
    log.warning('tokenURI reverted for tokenID: {} contract: {}', [
      event.params.tokenId.toString(),
      event.address.toHexString()
    ])
  } else {
    tokenURI = tokenURICallResult.value
  }

  return tokenURI
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