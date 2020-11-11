import React from 'react'
import {
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Grid,
  Typography,
  createStyles,
  withStyles,
} from '@material-ui/core'

const nftStyles = theme =>
  createStyles({
    actionArea: {
      maxWidth: 300,
    },
    image: {
      height: 200,
    },
    displayName: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    tokenId: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
    owner: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  })

const Nft = ({ classes, item }) => {
  
  const nft = item.amount ? item.nft : item;
  
  return (
  <Grid item>
    <Card>
      <CardActionArea className={classes.actionArea}>
        {nft.imageUri && (
          <CardMedia className={classes.image} image={nft.imageUri} title={nft.name} />
        )}
        <CardContent>
          <Typography variant="h6" component="h3" className={classes.displayName}>
            {nft.name ||  nft.tokenURI}
          </Typography>
          <Typography component="p" className={classes.tokenId}>
            <b >Token ID: </b> 
            {nft.tokenId}
          </Typography>
          <Typography component="p" className={classes.owner}>
            <b >Creator: </b> 
            {nft.createdBy || nft.creator.id}
          </Typography>
          {nft.salePrice > 0 && (
            <Typography component="p" className={classes.owner}>
              <b >For Sale: </b> 
              {nft.salePrice/1000000000000000000} ETH
            </Typography>
          )}
          {item.amount && (
            <Typography component="p" className={classes.owner}>
              <b >Price: </b> 
              {item.amount/1000000000000000000} ETH
            </Typography>
          )}
          {item.seller && (
            <Typography component="p" className={classes.owner}>
            <b >Seller: </b> 
            {item.seller.id} 
          </Typography>
          )}
          {item.buyer && (
            <Typography component="p" className={classes.owner}>
            <b >Buyer: </b> 
            {item.buyer.id} 
          </Typography>
          )}
          {item.bidder && (
            <Typography component="p" className={classes.owner}>
            <b >Bidder: </b> 
            {item.bidder.id} 
          </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  </Grid>
)}

const StyledNft = withStyles(nftStyles)(Nft)

const Nfts = ({ nfts }) => (
      <Grid container direction="row" spacing={16}>
        {nfts.map(nft => (
          <StyledNft key={nft.id} item={nft} />
        ))}
      </Grid>
)

export default Nfts
