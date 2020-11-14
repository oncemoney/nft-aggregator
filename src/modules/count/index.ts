import { Nft, BidLog, SaleLog, Count } from '../../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export const DEFAULT_ID = 'all'

export function buildCount(): Count {
  let count = Count.load(DEFAULT_ID)

  if (count == null) {
    count = new Count(DEFAULT_ID)
    count.nftTotal = 0
    count.nftRariTotal= 0
    count.nftSuprTotal= 0

    count.bidTotal= 0
    count.bidAmountTotal= BigInt.fromI32(0)

    count.saleTotal= 0
    count.saleRariTotal= 0
    count.saleSuprTotal= 0
    count.saleAmountTotal= BigInt.fromI32(0)
    count.saleRariAmountTotal= BigInt.fromI32(0)
    count.saleSuprAmountTotal= BigInt.fromI32(0)

    count.started= 0
  }

  return count as Count
}

export function buildCountFromNFT(nft: Nft): Count {
  let count = buildCount()

  count.nftTotal += 1
  if (nft.symbol == "RARI") {
    count.nftRariTotal += 1
  } else if (nft.symbol == "SUPR") {
    count.nftSuprTotal += 1
  } 

  return count
}

export function buildCountFromSale(sale: SaleLog): Count {
  let count = buildCount()
  let nft = Nft.load(sale.nft)

  count.saleTotal += 1
  count.saleAmountTotal= count.saleAmountTotal.plus(sale.amount)

  if (nft.symbol == "RARI") {
    count.saleRariTotal += 1
    count.saleRariAmountTotal = count.saleRariAmountTotal.plus(sale.amount)
  } else if (nft.symbol == "SUPR") {
    count.saleSuprTotal += 1
    count.saleSuprAmountTotal = count.saleSuprAmountTotal.plus(sale.amount)
  } 
  return count
}

export function buildCountFromBid(bid: BidLog): Count {
  let count = buildCount()

  count.bidTotal += 1
  count.bidAmountTotal = count.bidAmountTotal.plus(bid.amount)

  return count
}

